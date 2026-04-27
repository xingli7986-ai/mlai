import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/getAuthUser";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

/**
 * GET /api/my/orders
 * Returns the current user's combined orders (custom + group buy) sorted by
 * createdAt desc.  ?status=pending|paid|shipped|completed|cancelled|refunded
 * filters both tables; ?kind=custom|group-buy filters by table.
 */
export async function GET(req: Request) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  const url = new URL(req.url);
  const status = url.searchParams.get("status") || "";
  const kind = url.searchParams.get("kind") || "";

  try {
    const customWhere: { userId: string; status?: string } = { userId: user.id };
    if (status) customWhere.status = status;
    const gbWhere: { userId: string; status?: string } = { userId: user.id };
    if (status) gbWhere.status = status;

    const [customRows, gbRows] = await Promise.all([
      kind === "group-buy"
        ? Promise.resolve([])
        : prisma.order.findMany({
            where: customWhere,
            orderBy: { createdAt: "desc" },
            take: 60,
            include: {
              design: { select: { selectedImage: true, images: true, prompt: true } },
            },
          }),
      kind === "custom"
        ? Promise.resolve([])
        : prisma.groupBuyOrder.findMany({
            where: gbWhere,
            orderBy: { createdAt: "desc" },
            take: 60,
            include: {
              groupBuy: {
                select: {
                  id: true,
                  status: true,
                  currentCount: true,
                  targetCount: true,
                  expiresAt: true,
                  fulfilledAt: true,
                  publishedDesign: {
                    select: { id: true, title: true, coverImages: true },
                  },
                },
              },
            },
          }),
    ]);

    const merged = [
      ...customRows.map((o) => ({
        kind: "custom" as const,
        id: o.id,
        title: o.design?.prompt?.slice(0, 40) ?? `${o.skirtType} 定制`,
        image: o.design?.selectedImage ?? o.design?.images?.[0] ?? null,
        size: o.size,
        skirtType: o.skirtType,
        fabric: o.fabric,
        totalAmount: o.totalAmount,
        paidAmount: o.status === "paid" ? o.totalAmount : 0,
        status: o.status,
        createdAt: o.createdAt,
        recipientName: o.recipientName,
        recipientPhone: o.recipientPhone,
        groupBuy: null,
      })),
      ...gbRows.map((o) => ({
        kind: "group-buy" as const,
        id: o.id,
        title: o.groupBuy.publishedDesign.title,
        image: o.groupBuy.publishedDesign.coverImages[0] ?? null,
        size: o.size,
        skirtType: null,
        fabric: null,
        totalAmount: o.totalAmount,
        paidAmount: o.paidAmount,
        status: o.status,
        createdAt: o.createdAt,
        recipientName: o.recipientName,
        recipientPhone: o.recipientPhone,
        groupBuy: {
          id: o.groupBuy.id,
          publishedDesignId: o.groupBuy.publishedDesign.id,
          status: o.groupBuy.status,
          currentCount: o.groupBuy.currentCount,
          targetCount: o.groupBuy.targetCount,
          expiresAt: o.groupBuy.expiresAt,
          fulfilledAt: o.groupBuy.fulfilledAt,
        },
      })),
    ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return NextResponse.json({
      orders: merged,
      counts: {
        total: merged.length,
        custom: customRows.length,
        groupBuy: gbRows.length,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "查询失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
