import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/getAuthUser";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

/** Designer royalty: 30% of each paid GroupBuyOrder for their PublishedDesigns. */
const DESIGNER_ROYALTY_BPS = 3000;

/**
 * GET /api/designer/dashboard
 * Returns the current user's designer profile + works + earnings stats.
 * 403 if the user has no Designer record.
 */
export async function GET(req: Request) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  try {
    const designer = await prisma.designer.findUnique({
      where: { userId: user.id },
    });
    if (!designer) {
      return NextResponse.json(
        { error: "尚未入驻设计师" },
        { status: 403 }
      );
    }

    const [designs, allPaidOrders, withdrawals] = await Promise.all([
      prisma.publishedDesign.findMany({
        where: { designerId: designer.id },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          coverImages: true,
          status: true,
          publishedAt: true,
          groupPrice: true,
          customPrice: true,
          likeCount: true,
          favoriteCount: true,
          orderCount: true,
          viewCount: true,
        },
      }),
      prisma.groupBuyOrder.findMany({
        where: {
          status: "paid",
          groupBuy: { publishedDesign: { designerId: designer.id } },
        },
        select: {
          paidAmount: true,
          createdAt: true,
          groupBuy: { select: { publishedDesignId: true } },
        },
      }),
      prisma.withdrawal.findMany({
        where: { designerId: designer.id },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
    ]);

    const totalPaid = allPaidOrders.reduce((sum, o) => sum + o.paidAmount, 0);
    const grossEarnings = Math.floor((totalPaid * DESIGNER_ROYALTY_BPS) / 10000);

    const totalWithdrawn = withdrawals
      .filter((w) => w.status === "completed")
      .reduce((sum, w) => sum + w.amount, 0);
    const pendingWithdrawals = withdrawals
      .filter((w) => w.status === "pending" || w.status === "processing")
      .reduce((sum, w) => sum + w.amount, 0);
    const withdrawable = Math.max(
      0,
      grossEarnings - totalWithdrawn - pendingWithdrawals
    );

    // Per-design stats.
    const designStats = new Map<string, { paidOrders: number; revenue: number }>();
    for (const o of allPaidOrders) {
      const k = o.groupBuy.publishedDesignId;
      const cur = designStats.get(k) || { paidOrders: 0, revenue: 0 };
      cur.paidOrders += 1;
      cur.revenue += o.paidAmount;
      designStats.set(k, cur);
    }

    // Last 30 days paid orders
    const cutoff = new Date(Date.now() - 30 * 86400 * 1000);
    const last30dRevenue = allPaidOrders
      .filter((o) => o.createdAt >= cutoff)
      .reduce((sum, o) => sum + o.paidAmount, 0);
    const last30dEarnings = Math.floor((last30dRevenue * DESIGNER_ROYALTY_BPS) / 10000);

    return NextResponse.json({
      designer: {
        id: designer.id,
        displayName: designer.displayName,
        bio: designer.bio,
        avatarUrl: designer.avatarUrl,
      },
      designs: designs.map((d) => ({
        ...d,
        paidOrders: designStats.get(d.id)?.paidOrders ?? 0,
        revenue: designStats.get(d.id)?.revenue ?? 0,
      })),
      stats: {
        totalDesigns: designs.length,
        approvedDesigns: designs.filter((d) => d.status === "approved").length,
        pendingDesigns: designs.filter((d) => d.status === "pending").length,
        rejectedDesigns: designs.filter((d) => d.status === "rejected").length,
        totalLikes: designs.reduce((sum, d) => sum + d.likeCount, 0),
        totalOrders: allPaidOrders.length,
        totalRevenue: totalPaid,
        grossEarnings,
        last30dEarnings,
        totalWithdrawn,
        pendingWithdrawals,
        withdrawable,
      },
      withdrawals: withdrawals.map((w) => ({
        id: w.id,
        amount: w.amount,
        alipayAccount: w.alipayAccount,
        status: w.status,
        createdAt: w.createdAt,
        completedAt: w.completedAt,
      })),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "查询失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
