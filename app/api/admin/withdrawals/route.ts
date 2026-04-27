import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/getAuthUser";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin";

export const runtime = "nodejs";

/** GET /api/admin/withdrawals?status=pending|processing|completed|rejected|all */
export async function GET(req: Request) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });
  if (!isAdmin(user.phone)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const url = new URL(req.url);
  const status = url.searchParams.get("status") || "pending";
  const where: { status?: string } = {};
  if (status !== "all") where.status = status;

  try {
    const withdrawals = await prisma.withdrawal.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        designer: {
          select: {
            id: true,
            displayName: true,
            user: { select: { phone: true } },
          },
        },
      },
    });
    return NextResponse.json({ withdrawals });
  } catch (err) {
    const message = err instanceof Error ? err.message : "查询失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/admin/withdrawals
 * Body: { id, action: 'approve'|'reject'|'complete' }
 */
export async function POST(req: Request) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });
  if (!isAdmin(user.phone)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body: { id?: unknown; action?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const id = typeof body.id === "string" ? body.id : "";
  const action = typeof body.action === "string" ? body.action : "";
  if (!id || !["approve", "reject", "complete"].includes(action)) {
    return NextResponse.json({ error: "参数错误" }, { status: 400 });
  }

  try {
    const cur = await prisma.withdrawal.findUnique({ where: { id } });
    if (!cur) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (action === "approve") {
      // Mark as processing — funds locked, money about to be sent.
      if (cur.status !== "pending") {
        return NextResponse.json({ error: "当前状态不可批准" }, { status: 400 });
      }
      const updated = await prisma.withdrawal.update({
        where: { id },
        data: { status: "processing" },
      });
      return NextResponse.json({ success: true, withdrawal: updated });
    }

    if (action === "reject") {
      if (cur.status === "completed") {
        return NextResponse.json({ error: "已完成不可拒绝" }, { status: 400 });
      }
      // Restore the cached withdrawable on the Designer.
      const updated = await prisma.$transaction(async (tx) => {
        const w = await tx.withdrawal.update({
          where: { id },
          data: { status: "rejected" },
        });
        await tx.designer.update({
          where: { id: cur.designerId },
          data: { withdrawable: { increment: cur.amount } },
        });
        return w;
      });
      return NextResponse.json({ success: true, withdrawal: updated });
    }

    if (action === "complete") {
      if (cur.status !== "processing") {
        return NextResponse.json({ error: "请先批准后再完成" }, { status: 400 });
      }
      const updated = await prisma.$transaction(async (tx) => {
        const w = await tx.withdrawal.update({
          where: { id },
          data: { status: "completed", completedAt: new Date() },
        });
        await tx.designer.update({
          where: { id: cur.designerId },
          data: { totalEarnings: { increment: cur.amount } },
        });
        return w;
      });
      return NextResponse.json({ success: true, withdrawal: updated });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "操作失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
