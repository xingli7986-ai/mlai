import { prisma } from "./prisma";

export const GROUP_BUY_DURATION_HOURS = 72;
export const GROUP_BUY_TARGET = 30;

/** Inviter & invitee discount in cents — applied when an order is placed via invite link. */
export const INVITER_REWARD_CENTS = 3000; // ¥30
export const INVITEE_REWARD_CENTS = 3000; // ¥30

/**
 * Find or create the active GroupBuy for a published design.
 * "Active" means status='open' and expiresAt > now.
 * If none exists, create a fresh one expiring in GROUP_BUY_DURATION_HOURS.
 */
export async function ensureActiveGroupBuy(publishedDesignId: string) {
  const now = new Date();
  const existing = await prisma.groupBuy.findFirst({
    where: {
      publishedDesignId,
      status: "open",
      expiresAt: { gt: now },
    },
    orderBy: { createdAt: "desc" },
  });
  if (existing) return existing;

  const expiresAt = new Date(now.getTime() + GROUP_BUY_DURATION_HOURS * 3600 * 1000);
  return prisma.groupBuy.create({
    data: {
      publishedDesignId,
      targetCount: GROUP_BUY_TARGET,
      currentCount: 0,
      status: "open",
      expiresAt,
    },
  });
}

export interface RecipientInput {
  recipientName?: unknown;
  recipientPhone?: unknown;
  recipientRegion?: unknown;
  recipientAddress?: unknown;
}
export interface RecipientValid {
  recipientName: string;
  recipientPhone: string;
  recipientRegion: string;
  recipientAddress: string;
}

export function validateRecipient(input: RecipientInput): RecipientValid | string {
  const recipientName = typeof input.recipientName === "string" ? input.recipientName.trim() : "";
  const recipientPhone = typeof input.recipientPhone === "string" ? input.recipientPhone.trim() : "";
  const recipientRegion = typeof input.recipientRegion === "string" ? input.recipientRegion.trim() : "";
  const recipientAddress = typeof input.recipientAddress === "string" ? input.recipientAddress.trim() : "";

  if (!recipientName) return "收货人姓名必填";
  if (!recipientPhone) return "收货人手机必填";
  if (!/^1\d{10}$/.test(recipientPhone)) return "手机号格式错误";
  if (!recipientRegion) return "省/市/区必填";
  if (!recipientAddress) return "详细地址必填";
  if (recipientAddress.length < 5) return "详细地址过短";

  return { recipientName, recipientPhone, recipientRegion, recipientAddress };
}

const VALID_SIZES = new Set(["XS", "S", "M", "L", "XL", "XXL", "custom"]);

export function validateSize(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  return VALID_SIZES.has(raw) ? raw : null;
}
