import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

/**
 * GET /api/home
 * Returns:
 *   - hotGroupBuys: top 4 active group buys (by progress %)
 *   - popularDesigns: top 8 approved PublishedDesigns by likeCount
 *   - stats: { designs, designers, activeGroupBuys }
 */
export async function GET() {
  try {
    const now = new Date();
    const [openGroupBuys, popular, designerCount, totalDesigns, activeGbCount] =
      await Promise.all([
        prisma.groupBuy.findMany({
          where: { status: "open", expiresAt: { gt: now } },
          orderBy: { createdAt: "desc" },
          take: 30,
          include: {
            publishedDesign: {
              select: {
                id: true,
                title: true,
                coverImages: true,
                groupPrice: true,
                customPrice: true,
                designer: { select: { displayName: true, avatarUrl: true } },
              },
            },
          },
        }),
        prisma.publishedDesign.findMany({
          where: { status: "approved" },
          orderBy: [{ likeCount: "desc" }, { publishedAt: "desc" }],
          take: 8,
          select: {
            id: true,
            title: true,
            coverImages: true,
            skirtType: true,
            fabric: true,
            groupPrice: true,
            customPrice: true,
            likeCount: true,
            favoriteCount: true,
            orderCount: true,
            designer: { select: { displayName: true, avatarUrl: true } },
          },
        }),
        prisma.designer.count(),
        prisma.publishedDesign.count({ where: { status: "approved" } }),
        prisma.groupBuy.count({ where: { status: "open", expiresAt: { gt: now } } }),
      ]);

    const hotGroupBuys = openGroupBuys
      .map((g) => ({
        id: g.id,
        publishedDesignId: g.publishedDesign.id,
        title: g.publishedDesign.title,
        coverImage: g.publishedDesign.coverImages[0] ?? null,
        groupPrice: g.publishedDesign.groupPrice,
        customPrice: g.publishedDesign.customPrice,
        targetCount: g.targetCount,
        currentCount: g.currentCount,
        progressPct: Math.min(100, Math.round((g.currentCount / Math.max(1, g.targetCount)) * 100)),
        secondsRemaining: Math.max(0, Math.floor((g.expiresAt.getTime() - now.getTime()) / 1000)),
        designer: {
          name: g.publishedDesign.designer.displayName,
          avatar: g.publishedDesign.designer.avatarUrl,
        },
      }))
      .sort((a, b) => b.progressPct - a.progressPct)
      .slice(0, 4);

    const popularDesigns = popular.map((p) => ({
      id: p.id,
      title: p.title,
      images: p.coverImages,
      skirtType: p.skirtType,
      fabric: p.fabric,
      groupPrice: p.groupPrice,
      customPrice: p.customPrice,
      likeCount: p.likeCount,
      favoriteCount: p.favoriteCount,
      orderCount: p.orderCount,
      designer: {
        name: p.designer.displayName,
        avatar: p.designer.avatarUrl,
      },
    }));

    return NextResponse.json({
      hotGroupBuys,
      popularDesigns,
      stats: {
        totalDesigns,
        designerCount,
        activeGroupBuys: activeGbCount,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "查询失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
