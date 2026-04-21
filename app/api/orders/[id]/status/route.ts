import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  pending: ["paid", "cancelled"],
  paid: ["shipped"],
  shipped: ["completed"],
};

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  let body: { status?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const nextStatus =
    typeof body.status === "string" ? body.status.trim() : "";
  if (!nextStatus) {
    return NextResponse.json(
      { error: "status is required" },
      { status: 400 }
    );
  }

  try {
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order || order.userId !== userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const allowed = ALLOWED_TRANSITIONS[order.status] ?? [];
    if (!allowed.includes(nextStatus)) {
      return NextResponse.json(
        { error: `不能从 ${order.status} 变更到 ${nextStatus}` },
        { status: 400 }
      );
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status: nextStatus },
    });

    return NextResponse.json({ success: true, order: updated });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to update order";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
