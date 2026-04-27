import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/getAuthUser";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin";

export const runtime = "nodejs";

/** GET /api/admin/group-buys?status=open|fulfilled|expired|all */
export async function GET(req: Request) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });
  if (!isAdmin(user.phone)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const url = new URL(req.url);
  const status = url.searchParams.get("status") || "all";
  const where: { status?: string } = {};
  if (status !== "all") where.status = status;

  try {
    const groupBuys = await prisma.groupBuy.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        publishedDesign: {
          select: {
            id: true,
            title: true,
            coverImages: true,
            groupPrice: true,
            designer: { select: { displayName: true } },
          },
        },
        _count: { select: { orders: true } },
      },
    });
    return NextResponse.json({
      groupBuys: groupBuys.map((g) => ({
        id: g.id,
        publishedDesignId: g.publishedDesignId,
        title: g.publishedDesign.title,
        coverImage: g.publishedDesign.coverImages[0] ?? null,
        groupPrice: g.publishedDesign.groupPrice,
        designerName: g.publishedDesign.designer.displayName,
        targetCount: g.targetCount,
        currentCount: g.currentCount,
        orderCount: g._count.orders,
        status: g.status,
        expiresAt: g.expiresAt,
        fulfilledAt: g.fulfilledAt,
        createdAt: g.createdAt,
      })),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "查询失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/admin/group-buys
 * Body: { id, action: 'fulfill'|'expire'|'extend', extendHours? }
 */
export async function POST(req: Request) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });
  if (!isAdmin(user.phone)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body: { id?: unknown; action?: unknown; extendHours?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const id = typeof body.id === "string" ? body.id : "";
  const action = typeof body.action === "string" ? body.action : "";
  if (!id || !["fulfill", "expire", "extend"].includes(action)) {
    return NextResponse.json({ error: "参数错误" }, { status: 400 });
  }

  try {
    if (action === "fulfill") {
      const updated = await prisma.groupBuy.update({
        where: { id },
        data: { status: "fulfilled", fulfilledAt: new Date() },
      });
      return NextResponse.json({ success: true, groupBuy: updated });
    }
    if (action === "expire") {
      // Mark expired + cascade-cancel/refund pending and paid orders.
      const result = await prisma.$transaction(async (tx) => {
        const gb = await tx.groupBuy.update({
          where: { id },
          data: { status: "expired" },
        });
        const orders = await tx.groupBuyOrder.findMany({
          where: { groupBuyId: id, status: { in: ["paid", "pending"] } },
          select: { id: true, status: true },
        });
        for (const o of orders) {
          await tx.groupBuyOrder.update({
            where: { id: o.id },
            data: { status: o.status === "paid" ? "refunded" : "cancelled" },
          });
        }
        await tx.invitation.updateMany({
          where: { groupBuyId: id, status: "pending" },
          data: { status: "expired" },
        });
        return { groupBuy: gb, refunded: orders.length };
      });
      return NextResponse.json({ success: true, ...result });
    }
    if (action === "extend") {
      const hours = typeof body.extendHours === "number" ? body.extendHours : 24;
      if (hours <= 0 || hours > 168) {
        return NextResponse.json({ error: "extendHours 必须在 1-168 之间" }, { status: 400 });
      }
      const cur = await prisma.groupBuy.findUnique({ where: { id } });
      if (!cur) return NextResponse.json({ error: "Not found" }, { status: 404 });
      const newExpires = new Date(
        Math.max(cur.expiresAt.getTime(), Date.now()) + hours * 3600 * 1000
      );
      const updated = await prisma.groupBuy.update({
        where: { id },
        data: { expiresAt: newExpires, status: cur.status === "expired" ? "open" : cur.status },
      });
      return NextResponse.json({ success: true, groupBuy: updated });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "操作失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
