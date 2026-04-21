import { auth } from "@/lib/auth";
import { verifyMiniAppToken } from "@/lib/jwt";

export type AuthUser = { id: string; phone: string };

/**
 * Resolves the current user from either:
 *   1. next-auth session cookie (web), or
 *   2. Authorization: Bearer <jwt> header (mini program).
 * Returns null if neither is present or valid.
 */
export async function getAuthUser(req: Request): Promise<AuthUser | null> {
  const session = await auth();
  const u = session?.user as { id?: string; phone?: string } | undefined;
  if (u?.id) {
    return { id: u.id, phone: u.phone ?? "" };
  }

  const authHeader = req.headers.get("authorization") || "";
  if (authHeader.toLowerCase().startsWith("bearer ")) {
    const token = authHeader.slice(7).trim();
    const payload = verifyMiniAppToken(token);
    if (payload) return { id: payload.id, phone: payload.phone };
  }

  return null;
}
