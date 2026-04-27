import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/getAuthUser";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const DESIGNER_ROYALTY_BPS = 3000;
const MIN_WITHDRAWAL_CENTS = 10000; // ¥100 min

/**
 * Calculate withdrawable balance (gross earnings - withdrawn - pending).
 * Returns cents.
 */
async function computeWithdrawable(designerId: string): Promise<number> {
  const [paidAggregate, withdrawals] = await Promise.all([
    prisma.groupBuyOrder.aggregate({
      _sum: { paidAmount: true },
      where: {
        status: "paid",
        groupBuy: { publishedDesign: { designerId } },
      },
    }),
    prisma.withdrawal.findMany({
      where: { designerId },
      select: { amount: true, status: true },
    }),
  ]);
  const totalPaid = paidAggregate._sum.paidAmount ?? 0;
  const grossEarnings = Math.floor((totalPaid * DESIGNER_ROYALTY_BPS) / 10000);
  const totalWithdrawn = withdrawals
    .filter((w) => w.status === "completed")
    .reduce((sum, w) => sum + w.amount, 0);
  const pending = withdrawals
    .filter((w) => w.status === "pending" || w.status === "processing")
    .reduce((sum, w) => sum + w.amount, 0);
  return Math.max(0, grossEarnings - totalWithdrawn - pending);
}

/** GET /api/designer/withdrawal — list current designer's withdrawal records. */
export async function GET(req: Request) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  const designer = await prisma.designer.findUnique({
    where: { userId: user.id },
  });
  if (!designer) {
    return NextResponse.json({ error: "尚未入驻设计师" }, { status: 403 });
  }

  try {
    const [withdrawals, withdrawable] = await Promise.all([
      prisma.withdrawal.findMany({
        where: { designerId: designer.id },
        orderBy: { createdAt: "desc" },
      }),
      computeWithdrawable(designer.id),
    ]);
    return NextResponse.json({
      withdrawals,
      withdrawable,
      minWithdrawal: MIN_WITHDRAWAL_CENTS,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "查询失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/designer/withdrawal
 * Body: { amount (cents): number, alipayAccount: string }
 * Creates a Withdrawal in 'pending' state if amount <= withdrawable.
 */
export async function POST(req: Request) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  const designer = await prisma.designer.findUnique({
    where: { userId: user.id },
  });
  if (!designer) {
    return NextResponse.json({ error: "尚未入驻设计师" }, { status: 403 });
  }

  let body: { amount?: unknown; alipayAccount?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const amount = typeof body.amount === "number" ? body.amount : 0;
  const alipayAccount = typeof body.alipayAccount === "string" ? body.alipayAccount.trim() : "";

  if (!Number.isFinite(amount) || amount <= 0 || amount % 1 !== 0) {
    return NextResponse.json({ error: "金额格式错误（单位：分）" }, { status: 400 });
  }
  if (amount < MIN_WITHDRAWAL_CENTS) {
    return NextResponse.json(
      { error: `单次最低提现 ¥${MIN_WITHDRAWAL_CENTS / 100}` },
      { status: 400 }
    );
  }
  if (!alipayAccount) {
    return NextResponse.json({ error: "请填写支付宝账号" }, { status: 400 });
  }

  try {
    const withdrawable = await computeWithdrawable(designer.id);
    if (amount > withdrawable) {
      return NextResponse.json(
        { error: `可提现余额不足（当前 ¥${(withdrawable / 100).toFixed(2)}）` },
        { status: 400 }
      );
    }

    const created = await prisma.withdrawal.create({
      data: {
        designerId: designer.id,
        amount,
        alipayAccount,
        status: "pending",
      },
    });

    // Sync the cached withdrawable on the Designer record (informational only —
    // the source of truth is computeWithdrawable).
    await prisma.designer.update({
      where: { id: designer.id },
      data: { withdrawable: Math.max(0, withdrawable - amount) },
    });

    return NextResponse.json({ success: true, withdrawal: created });
  } catch (err) {
    const message = err instanceof Error ? err.message : "申请失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
