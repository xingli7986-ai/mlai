import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/getAuthUser";
import { prisma } from "@/lib/prisma";
import {
  validateRecipient,
  validateSize,
  ensureActiveGroupBuy,
  INVITER_REWARD_CENTS,
  INVITEE_REWARD_CENTS,
} from "@/lib/group-buy";

export const runtime = "nodejs";

/**
 * POST /api/group-buys/[id]/orders
 * Create a GroupBuyOrder. `id` may be a PublishedDesign id (auto-resolves the
 * active group buy) or a GroupBuy id directly.
 *
 * Body: {
 *   size, customMeasurements?, recipientName, recipientPhone,
 *   recipientRegion, recipientAddress, inviteCode?
 * }
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  const { id } = await params;

  let body: {
    size?: unknown;
    customMeasurements?: unknown;
    recipientName?: unknown;
    recipientPhone?: unknown;
    recipientRegion?: unknown;
    recipientAddress?: unknown;
    inviteCode?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const size = validateSize(body.size);
  if (!size) {
    return NextResponse.json({ error: "尺码格式错误" }, { status: 400 });
  }

  const recipient = validateRecipient(body);
  if (typeof recipient === "string") {
    return NextResponse.json({ error: recipient }, { status: 400 });
  }

  const customMeasurements =
    typeof body.customMeasurements === "string" ? body.customMeasurements : null;
  const inviteCode = typeof body.inviteCode === "string" ? body.inviteCode.trim() : "";

  // Resolve group buy: by GroupBuy id first, fall back to PublishedDesign id.
  let gb = await prisma.groupBuy.findUnique({ where: { id } });
  let publishedDesignId: string;

  if (gb) {
    publishedDesignId = gb.publishedDesignId;
  } else {
    const design = await prisma.publishedDesign.findUnique({
      where: { id },
      select: { id: true, status: true },
    });
    if (!design || design.status !== "approved") {
      return NextResponse.json({ error: "设计不存在或未上架" }, { status: 404 });
    }
    gb = await ensureActiveGroupBuy(design.id);
    publishedDesignId = design.id;
  }

  if (gb.status !== "open") {
    return NextResponse.json({ error: "当前拼团已关闭" }, { status: 400 });
  }
  if (gb.expiresAt.getTime() <= Date.now()) {
    return NextResponse.json({ error: "拼团已过期" }, { status: 400 });
  }

  const design = await prisma.publishedDesign.findUnique({
    where: { id: publishedDesignId },
    select: { groupPrice: true, status: true },
  });
  if (!design || design.status !== "approved") {
    return NextResponse.json({ error: "设计已下架" }, { status: 404 });
  }

  // Resolve invite code → inviter user. Self-invite is rejected.
  let inviterUserId: string | null = null;
  let discountAmount = 0;
  if (inviteCode) {
    const inviter = await prisma.user.findUnique({
      where: { id: inviteCode },
      select: { id: true },
    });
    if (inviter && inviter.id !== user.id) {
      inviterUserId = inviter.id;
      discountAmount = INVITEE_REWARD_CENTS;
    }
  }

  const totalAmount = Math.max(0, design.groupPrice - discountAmount);

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Create the order in pending state.
      const order = await tx.groupBuyOrder.create({
        data: {
          groupBuyId: gb!.id,
          userId: user.id,
          size,
          customMeasurements,
          recipientName: recipient.recipientName,
          recipientPhone: recipient.recipientPhone,
          recipientRegion: recipient.recipientRegion,
          recipientAddress: recipient.recipientAddress,
          invitedByUserId: inviterUserId,
          discountAmount,
          totalAmount,
          paidAmount: 0,
          status: "pending",
        },
      });

      // Increment currentCount (counts a pending order toward progress; will be
      // decremented if the order is cancelled before payment).
      const updatedGb = await tx.groupBuy.update({
        where: { id: gb!.id },
        data: { currentCount: { increment: 1 } },
      });

      // Mark fulfilled if threshold reached.
      let fulfilled = false;
      if (
        updatedGb.status === "open" &&
        updatedGb.currentCount >= updatedGb.targetCount
      ) {
        await tx.groupBuy.update({
          where: { id: updatedGb.id },
          data: { status: "fulfilled", fulfilledAt: new Date() },
        });
        fulfilled = true;
      }

      // Record invitation row (status pending until payment).
      if (inviterUserId) {
        await tx.invitation.create({
          data: {
            inviterUserId,
            inviteeUserId: user.id,
            groupBuyId: gb!.id,
            inviterDiscount: INVITER_REWARD_CENTS,
            inviteeDiscount: INVITEE_REWARD_CENTS,
            status: "pending",
          },
        });
      }

      return { order, fulfilled, currentCount: updatedGb.currentCount };
    });

    return NextResponse.json({
      success: true,
      order: {
        id: result.order.id,
        groupBuyId: result.order.groupBuyId,
        totalAmount: result.order.totalAmount,
        discountAmount: result.order.discountAmount,
        status: result.order.status,
      },
      groupBuy: {
        id: gb.id,
        currentCount: result.currentCount,
        targetCount: gb.targetCount,
        fulfilled: result.fulfilled,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "下单失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
