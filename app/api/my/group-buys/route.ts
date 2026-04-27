import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/getAuthUser";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

/**
 * GET /api/my/group-buys
 * Lists all group-buys the current user has participated in (one entry per
 * GroupBuy, with the user's order summarised).
 */
export async function GET(req: Request) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  try {
    const orders = await prisma.groupBuyOrder.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        groupBuy: {
          include: {
            publishedDesign: {
              select: {
                id: true,
                title: true,
                coverImages: true,
                groupPrice: true,
              },
            },
          },
        },
      },
    });

    const items = orders.map((o) => {
      const gb = o.groupBuy;
      const progressPct = Math.min(
        100,
        Math.round((gb.currentCount / Math.max(1, gb.targetCount)) * 100)
      );
      const secondsRemaining = Math.max(
        0,
        Math.floor((gb.expiresAt.getTime() - Date.now()) / 1000)
      );
      return {
        orderId: o.id,
        orderStatus: o.status,
        size: o.size,
        totalAmount: o.totalAmount,
        paidAmount: o.paidAmount,
        groupBuy: {
          id: gb.id,
          publishedDesignId: gb.publishedDesign.id,
          title: gb.publishedDesign.title,
          coverImage: gb.publishedDesign.coverImages[0] ?? null,
          status: gb.status,
          currentCount: gb.currentCount,
          targetCount: gb.targetCount,
          progressPct,
          secondsRemaining,
          expiresAt: gb.expiresAt,
          fulfilledAt: gb.fulfilledAt,
        },
      };
    });

    return NextResponse.json({
      items,
      counts: {
        total: items.length,
        active: items.filter((i) => i.groupBuy.status === "open").length,
        fulfilled: items.filter((i) => i.groupBuy.status === "fulfilled").length,
        expired: items.filter((i) => i.groupBuy.status === "expired").length,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "查询失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
