import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/getAuthUser";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin";

export const runtime = "nodejs";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isAdmin(user.phone)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (existing.status !== "paid") {
      return NextResponse.json(
        {
          error: `只能把「待发货」订单标记为已发货，当前状态：${existing.status}`,
        },
        { status: 400 }
      );
    }
    const order = await prisma.order.update({
      where: { id },
      data: { status: "shipped" },
    });
    return NextResponse.json({ success: true, order });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to ship order";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
