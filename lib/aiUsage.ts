/**
 * In-process daily AI usage counter.
 *
 * Per PRD §6.4 we cap AI generation per role. Without a dedicated DB table
 * we keep counts in memory keyed by `userId|YYYY-MM-DD`. Counts reset on
 * server restart. This is acceptable for MVP / single-instance deploys; for
 * multi-instance production replace with Redis (`INCR` + EXPIRE) or a Prisma
 * `UsageLog` model.
 */

const counts = new Map<string, number>();

function todayKey(): string {
  const d = new Date();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function key(userId: string): string {
  return `${userId}|${todayKey()}`;
}

export function getDailyUsage(userId: string): number {
  return counts.get(key(userId)) ?? 0;
}

/**
 * Increments and returns the new count. Call this AFTER the limit check
 * passes and before (or right after) the actual generation work.
 */
export function recordUsage(userId: string): number {
  const k = key(userId);
  const next = (counts.get(k) ?? 0) + 1;
  counts.set(k, next);
  return next;
}

/**
 * Returns null if the user is allowed to generate, or a human-readable
 * Chinese error message describing why they can't.
 *
 * `dailyLimit === -1` means unlimited; `0` means blocked entirely.
 */
export function checkUsageLimit(
  userId: string,
  dailyLimit: number,
): { ok: true } | { ok: false; error: string; status: number } {
  if (dailyLimit < 0) return { ok: true };
  if (dailyLimit === 0) {
    return {
      ok: false,
      status: 403,
      error: "未登录用户暂不能使用 AI 生成，请先登录。",
    };
  }
  const used = getDailyUsage(userId);
  if (used >= dailyLimit) {
    return {
      ok: false,
      status: 429,
      error: `已达今日额度上限（${dailyLimit} 次），请明天再试或申请设计师入驻获得更高额度。`,
    };
  }
  return { ok: true };
}
