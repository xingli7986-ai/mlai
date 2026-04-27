import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/getAuthUser";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin";

export const runtime = "nodejs";

const VALID_STATUS = new Set(["pending", "approved", "rejected", "draft"]);

/** GET /api/admin/designs?status=pending|approved|rejected|all */
export async function GET(req: Request) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });
  if (!isAdmin(user.phone)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const url = new URL(req.url);
  const status = url.searchParams.get("status") || "pending";
  const where: { status?: string } = {};
  if (status !== "all") {
    if (!VALID_STATUS.has(status)) {
      return NextResponse.json({ error: "invalid status" }, { status: 400 });
    }
    where.status = status;
  }

  try {
    const designs = await prisma.publishedDesign.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        designer: {
          select: {
            id: true,
            displayName: true,
            user: { select: { phone: true } },
          },
        },
      },
    });
    return NextResponse.json({ designs });
  } catch (err) {
    const message = err instanceof Error ? err.message : "查询失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** POST /api/admin/designs   body: { id, action: 'approve'|'reject', reason? } */
export async function POST(req: Request) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });
  if (!isAdmin(user.phone)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body: { id?: unknown; action?: unknown; reason?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const id = typeof body.id === "string" ? body.id : "";
  const action = typeof body.action === "string" ? body.action : "";
  if (!id || !["approve", "reject"].includes(action)) {
    return NextResponse.json({ error: "参数错误" }, { status: 400 });
  }

  try {
    const updated = await prisma.publishedDesign.update({
      where: { id },
      data: {
        status: action === "approve" ? "approved" : "rejected",
        publishedAt: action === "approve" ? new Date() : undefined,
      },
    });
    return NextResponse.json({ success: true, design: updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : "操作失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
