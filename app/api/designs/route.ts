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

  const orderBy: Prisma.PublishedDesignOrderByWithRelationInput =
    SORT_MAP[sortKey] || SORT_MAP.hot;

  try {
    const [total, rows] = await Promise.all([
      prisma.publishedDesign.count({ where }),
      prisma.publishedDesign.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
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
            },
          },
        },
      }),
    ]);

    const designs = rows.map((d) => ({
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
      },
    }));

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
