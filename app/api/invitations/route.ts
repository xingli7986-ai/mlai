import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/getAuthUser";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

/**
 * GET /api/invitations
 * Returns the current user's invitations:
 *   - sent: invitations where I am the inviter (rewarding when fulfilled)
 *   - received: invitations where I was invited (used the code)
 */
export async function GET(req: Request) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  try {
    const [sent, received] = await Promise.all([
      prisma.invitation.findMany({
        where: { inviterUserId: user.id },
        orderBy: { createdAt: "desc" },
        take: 100,
        include: {
          invitee: { select: { id: true, name: true, avatar: true } },
        },
      }),
      prisma.invitation.findMany({
        where: { inviteeUserId: user.id },
        orderBy: { createdAt: "desc" },
        take: 100,
        include: {
          inviter: { select: { id: true, name: true, avatar: true } },
        },
      }),
    ]);

    const sentRewardCents = sent
      .filter((i) => i.status === "fulfilled")
      .reduce((sum, i) => sum + i.inviterDiscount, 0);

    return NextResponse.json({
      sent: sent.map((i) => ({
        id: i.id,
        invitee: i.invitee
          ? { name: i.invitee.name ?? "用户", avatar: i.invitee.avatar }
          : null,
        groupBuyId: i.groupBuyId,
        inviterDiscount: i.inviterDiscount,
        status: i.status,
        createdAt: i.createdAt,
      })),
      received: received.map((i) => ({
        id: i.id,
        inviter: i.inviter
          ? { name: i.inviter.name ?? "用户", avatar: i.inviter.avatar }
          : null,
        groupBuyId: i.groupBuyId,
        inviteeDiscount: i.inviteeDiscount,
        status: i.status,
        createdAt: i.createdAt,
      })),
      stats: {
        sentCount: sent.length,
        sentRewardCents,
        receivedCount: received.length,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "查询失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
