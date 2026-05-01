import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/getAuthUser";
import { getUserRole } from "@/lib/userRole";
import { getDailyUsage } from "@/lib/aiUsage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/me/role
 * Returns the current user's role + daily AI usage stats so client guards
 * (RouteGuard, tool pages) can branch without round-tripping per call.
 *
 * Per PRD §6.1: roles are guest / consumer / designer_pending / designer / admin.
 */
export async function GET(req: Request) {
  const user = await getAuthUser(req);
  const info = await getUserRole(user);
  return NextResponse.json({
    role: info.role,
    aiDailyLimit: info.aiDailyLimit,
    aiUsedToday: user ? getDailyUsage(user.id) : 0,
    userId: user?.id ?? null,
  });
}
