import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/getAuthUser";
import { prisma } from "@/lib/prisma";
import { createAlipayOrder } from "@/lib/alipay";

export const runtime = "nodejs";

/**
 * 创建 prompt 解锁的支付意图。
 * - 若已解锁,直接返回 unlocked: true
 * - 否则创建 PromptUnlock(status="pending"),返回 alipay formHtml
 *   付款回调由 /api/payment/alipay/notify 处理(已扩展 prompt-unlock 分支)
 *
 * 平台 30% 抽成,创作者 70% 收益,落到 PromptUnlock.platformFee / creatorEarning
 * 不实现积分支付(留 P2)
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  const { id } = await params;

  try {
    const work = await prisma.inspirationWork.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        title: true,
        promptVisibility: true,
        unlockPrice: true,
        status: true,
      },
    });
    if (!work || work.status !== "approved") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (work.promptVisibility === "free") {
      return NextResponse.json({ unlocked: true, freeAccess: true });
    }
    if (work.promptVisibility === "private") {
      return NextResponse.json({ error: "作者未公开此作品创作详情" }, { status: 403 });
    }
    if (work.userId === user.id) {
      return NextResponse.json({ unlocked: true, ownerAccess: true });
    }
    if (!work.unlockPrice || work.unlockPrice <= 0) {
      return NextResponse.json({ error: "解锁价格异常" }, { status: 400 });
    }

    // 已解锁 → 直接返回
    const existing = await prisma.promptUnlock.findUnique({
      where: { userId_inspirationWorkId: { userId: user.id, inspirationWorkId: id } },
    });
    if (existing && existing.status === "paid") {
      return NextResponse.json({ unlocked: true });
    }

    // 创建 / 复用 pending 记录
    const platformFee = Math.round(work.unlockPrice * 0.3);
    const creatorEarning = work.unlockPrice - platformFee;

    const unlock =
      existing && existing.status === "pending"
        ? existing
        : await prisma.promptUnlock.upsert({
            where: { userId_inspirationWorkId: { userId: user.id, inspirationWorkId: id } },
            update: {
              paymentMethod: "cash",
              amount: work.unlockPrice,
              platformFee,
              creatorEarning,
              status: "pending",
            },
            create: {
              userId: user.id,
              inspirationWorkId: id,
              paymentMethod: "cash",
              amount: work.unlockPrice,
              platformFee,
              creatorEarning,
              status: "pending",
            },
          });

    const ua = req.headers.get("user-agent") || "";
    const isMobile = /Mobile|Android|iPhone|iPad/i.test(ua);

    const formHtml = await createAlipayOrder(
      `pu_${unlock.id}`, // outTradeNo 前缀 pu_ 便于回调路由
      work.unlockPrice,
      `MaxLuLu 灵感解锁 - ${work.title}`,
      isMobile
    );

    return NextResponse.json({
      unlocked: false,
      promptUnlockId: unlock.id,
      formHtml,
      isMobile,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "创建支付失败";
    console.error("unlock-prompt error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
