import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const runtime = "nodejs";

const SORT_MAP: Record<string, Prisma.PublishedDesignOrderByWithRelationInput> = {
  hot: { likeCount: "desc" },
  new: { publishedAt: "desc" },
  price: { groupPrice: "asc" },
};

export async function GET(req: Request) {
  const url = new URL(req.url);
  const page = Math.max(1, Number(url.searchParams.get("page") ?? "1") || 1);
  const limit = Math.min(60, Math.max(1, Number(url.searchParams.get("limit") ?? "20") || 20));
  const category = url.searchParams.get("category") || undefined;
  const fabric = url.searchParams.get("fabric") || undefined;
  const sortKey = url.searchParams.get("sort") || "hot";
  const search = (url.searchParams.get("search") || "").trim();

  const where: Prisma.PublishedDesignWhereInput = {
    status: "approved",
  };
  if (category) where.skirtType = category;
  if (fabric) where.fabric = fabric;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { styleTags: { has: search } },
    ];
  }

  const now = new Date();
  const isHotGroup = sortKey === "hot-group";
  if (isHotGroup) {
    // Restrict to designs with at least one currently-open group buy.
    where.groupBuys = {
      some: { status: "open", expiresAt: { gt: now } },
    };
  }

  const orderBy: Prisma.PublishedDesignOrderByWithRelationInput =
    isHotGroup
      ? { publishedAt: "desc" } // initial order; final sort by progress is JS-side
      : SORT_MAP[sortKey] || SORT_MAP.hot;

  try {
    const [total, rows] = await Promise.all([
      prisma.publishedDesign.count({ where }),
      prisma.publishedDesign.findMany({
        where,
        orderBy,
        // For hot-group, fetch a wider window (we'll re-sort by progress in JS).
        skip: isHotGroup ? 0 : (page - 1) * limit,
        take: isHotGroup ? Math.min(80, limit * 4) : limit,
        select: {
          id: true,
          title: true,
          coverImages: true,
          skirtType: true,
          fabric: true,
          styleTags: true,
          groupPrice: true,
          customPrice: true,
          likeCount: true,
          favoriteCount: true,
          orderCount: true,
          status: true,
          publishedAt: true,
          designer: {
            select: {
              id: true,
              displayName: true,
              avatarUrl: true,
              isCertified: true,
            },
          },
          groupBuys: isHotGroup
            ? {
                where: { status: "open", expiresAt: { gt: now } },
                orderBy: { createdAt: "desc" },
                take: 1,
                select: {
                  id: true,
                  currentCount: true,
                  targetCount: true,
                  expiresAt: true,
                },
              }
            : false,
        },
      }),
    ]);

    let designs = rows.map((d) => {
      const gb = (d as { groupBuys?: Array<{ id: string; currentCount: number; targetCount: number; expiresAt: Date }> }).groupBuys?.[0];
      const progressPct = gb
        ? Math.min(100, Math.round((gb.currentCount / Math.max(1, gb.targetCount)) * 100))
        : null;
      return {
        id: d.id,
        title: d.title,
        images: d.coverImages,
        skirtType: d.skirtType,
        fabric: d.fabric,
        styleTags: d.styleTags,
        groupPrice: d.groupPrice,
        customPrice: d.customPrice,
        likeCount: d.likeCount,
        favoriteCount: d.favoriteCount,
        orderCount: d.orderCount,
        status: d.status,
        publishedAt: d.publishedAt,
        designer: {
          name: d.designer.displayName,
          avatar: d.designer.avatarUrl,
          isCertified: d.designer.isCertified,
        },
        groupBuy: gb
          ? {
              id: gb.id,
              currentCount: gb.currentCount,
              targetCount: gb.targetCount,
              progressPct,
              secondsRemaining: Math.max(0, Math.floor((gb.expiresAt.getTime() - now.getTime()) / 1000)),
            }
          : null,
      };
    });

    if (isHotGroup) {
      designs.sort((a, b) => (b.groupBuy?.progressPct ?? 0) - (a.groupBuy?.progressPct ?? 0));
      // Apply page/limit after sorting.
      designs = designs.slice((page - 1) * limit, (page - 1) * limit + limit);
    }

    return NextResponse.json({
      designs,
      total,
      page,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "查询失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
