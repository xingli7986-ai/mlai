import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  INVITER_REWARD_CENTS,
  INVITEE_REWARD_CENTS,
} from "@/lib/group-buy";

export const runtime = "nodejs";

/**
 * GET /api/invitations/[code]
 * Resolves an invite code (currently just the inviter user id) into display
 * info. Returns 404 if the inviter doesn't exist.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  if (!code) {
    return NextResponse.json({ error: "Invalid code" }, { status: 400 });
  }

  try {
    const inviter = await prisma.user.findUnique({
      where: { id: code },
      select: { id: true, name: true, avatar: true },
    });
    if (!inviter) {
      return NextResponse.json({ error: "邀请码无效" }, { status: 404 });
    }

    return NextResponse.json({
      inviter: {
        id: inviter.id,
        name: inviter.name ?? "MaxLuLu 用户",
        avatar: inviter.avatar,
      },
      inviterReward: INVITER_REWARD_CENTS,
      inviteeReward: INVITEE_REWARD_CENTS,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "查询失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
