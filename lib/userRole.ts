import { prisma } from "./prisma";
import { isAdmin } from "./admin";

export type UserRole =
  | "guest"
  | "consumer"
  | "designer_pending"
  | "designer"
  | "admin";

export interface UserRoleInfo {
  role: UserRole;
  /**
   * Daily AI generation limit per PRD §6.4. -1 means unlimited.
   */
  aiDailyLimit: number;
}

/**
 * Resolves the role + AI usage limit for an authenticated user.
 * Pass `null` for unauthenticated requests — returns `guest` (limit 0).
 *
 * Per PRD §6.1 / §6.4:
 *   guest             → 0/day
 *   consumer          → 5/day
 *   designer_pending  → 20/day
 *   designer          → unlimited
 *   admin             → unlimited
 */
export async function getUserRole(
  user: { id: string; phone: string } | null,
): Promise<UserRoleInfo> {
  if (!user) {
    return { role: "guest", aiDailyLimit: 0 };
  }
  if (isAdmin(user.phone)) {
    return { role: "admin", aiDailyLimit: -1 };
  }
  const account = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      isDesigner: true,
      designer: { select: { id: true } },
    },
  });
  if (account?.isDesigner) {
    return { role: "designer", aiDailyLimit: -1 };
  }
  if (account?.designer) {
    return { role: "designer_pending", aiDailyLimit: 20 };
  }
  return { role: "consumer", aiDailyLimit: 5 };
}
