import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/getAuthUser";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const VALID_STATUSES = new Set([
  "pending",
  "paid",
  "shipped",
  "completed",
  "cancelled",
]);

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  const userId = user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const statusParam = req.nextUrl.searchParams.get("status");
  const where: { userId: string; status?: string } = { userId };
  if (statusParam && statusParam !== "all") {
    if (!VALID_STATUSES.has(statusParam)) {
      return NextResponse.json(
        { error: "invalid status" },
        { status: 400 }
      );
    }
    where.status = statusParam;
  }

  try {
    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { design: true },
    });
    return NextResponse.json({ orders });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load orders";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
