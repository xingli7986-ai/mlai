import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/getAuthUser";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin";

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
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isAdmin(user.phone)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const statusParam = req.nextUrl.searchParams.get("status");
  const where: { status?: string } = {};
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
      include: {
        user: { select: { phone: true, name: true } },
        design: { select: { prompt: true, selectedImage: true } },
      },
    });
    return NextResponse.json({ orders });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to load admin orders";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
