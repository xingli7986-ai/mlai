import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureActiveGroupBuy } from "@/lib/group-buy";

export const runtime = "nodejs";

/**
 * GET /api/group-buys/[id]
 * `id` may be either a PublishedDesign id or a GroupBuy id.
 * - If PublishedDesign id: returns the active group buy (auto-creating if none).
 * - If GroupBuy id: returns that group buy directly.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    let gb = await prisma.groupBuy.findUnique({
      where: { id },
      include: {
        publishedDesign: {
          select: {
            id: true,
            title: true,
            coverImages: true,
            groupPrice: true,
            customPrice: true,
            status: true,
          },
        },
      },
    });

    if (!gb) {
      const design = await prisma.publishedDesign.findUnique({
        where: { id },
        select: { id: true, status: true },
      });
      if (!design || design.status !== "approved") {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      const created = await ensureActiveGroupBuy(id);
      gb = await prisma.groupBuy.findUnique({
        where: { id: created.id },
        include: {
          publishedDesign: {
            select: {
              id: true,
              title: true,
              coverImages: true,
              groupPrice: true,
              customPrice: true,
              status: true,
            },
          },
        },
      });
    }

    if (!gb) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({
      groupBuy: {
        id: gb.id,
        publishedDesignId: gb.publishedDesignId,
        publishedDesign: gb.publishedDesign,
        targetCount: gb.targetCount,
        currentCount: gb.currentCount,
        status: gb.status,
        expiresAt: gb.expiresAt,
        fulfilledAt: gb.fulfilledAt,
        progressPct: Math.min(100, Math.round((gb.currentCount / Math.max(1, gb.targetCount)) * 100)),
        secondsRemaining: Math.max(0, Math.floor((gb.expiresAt.getTime() - Date.now()) / 1000)),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "查询失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
