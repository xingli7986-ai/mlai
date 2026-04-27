import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
// Longer max duration so a batch of refunds can finish.
export const maxDuration = 300;

/**
 * POST /api/cron/expire-group-buys
 * Triggered by Vercel Cron (or any scheduler).
 * Auth: Bearer ${CRON_SECRET} OR ?key=${CRON_SECRET}.
 *
 * Behavior:
 *   - For every GroupBuy with status='open' and expiresAt <= now:
 *     - if currentCount >= targetCount → mark fulfilled (idempotent)
 *     - otherwise → mark expired, mark all paid orders 'refunded',
 *       mark pending orders 'cancelled', mark invitations 'expired'.
 */
export async function POST(req: Request) {
  const url = new URL(req.url);
  const auth = req.headers.get("authorization") || "";
  const tokenFromHeader = auth.toLowerCase().startsWith("bearer ")
    ? auth.slice(7).trim()
    : "";
  const tokenFromQuery = url.searchParams.get("key") || "";
  const provided = tokenFromHeader || tokenFromQuery;
  const expected = process.env.CRON_SECRET || "";

  if (!expected) {
    return NextResponse.json(
      { error: "CRON_SECRET not configured" },
      { status: 500 }
    );
  }
  if (provided !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  try {
    const expiring = await prisma.groupBuy.findMany({
      where: {
        status: "open",
        expiresAt: { lte: now },
      },
      take: 200,
    });

    let fulfilled = 0;
    let expired = 0;
    const refundedOrderIds: string[] = [];

    for (const gb of expiring) {
      if (gb.currentCount >= gb.targetCount) {
        await prisma.groupBuy.update({
          where: { id: gb.id },
          data: { status: "fulfilled", fulfilledAt: now },
        });
        fulfilled++;
        continue;
      }

      await prisma.$transaction(async (tx) => {
        await tx.groupBuy.update({
          where: { id: gb.id },
          data: { status: "expired" },
        });

        const orders = await tx.groupBuyOrder.findMany({
          where: { groupBuyId: gb.id, status: { in: ["paid", "pending"] } },
          select: { id: true, status: true },
        });
        for (const o of orders) {
          await tx.groupBuyOrder.update({
            where: { id: o.id },
            data: { status: o.status === "paid" ? "refunded" : "cancelled" },
          });
          if (o.status === "paid") refundedOrderIds.push(o.id);
        }

        await tx.invitation.updateMany({
          where: { groupBuyId: gb.id, status: "pending" },
          data: { status: "expired" },
        });
      });

      expired++;
    }

    return NextResponse.json({
      ok: true,
      now: now.toISOString(),
      processed: expiring.length,
      fulfilled,
      expired,
      refundedOrderIds,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "cron failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** Allow manual trigger via GET for ops. */
export async function GET(req: Request) {
  return POST(req);
}
