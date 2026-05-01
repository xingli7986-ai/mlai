import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureActiveGroupBuy } from "@/lib/group-buy";

export const runtime = "nodejs";

/**
 * POST /api/group-buys/find-or-create
 * Body: { designId: string }
 * Returns: { groupBuyId, isNew, expiresAt }
 *
 * Per User Flow §1: detail page "参团购买" CTA must POST here (not GET) to
 * resolve or create the active group buy for a published design before
 * navigating to /group-buy/[id].
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "请求体不是合法 JSON" }, { status: 400 });
  }

  const designId =
    body && typeof body === "object" && "designId" in body && typeof (body as { designId: unknown }).designId === "string"
      ? (body as { designId: string }).designId.trim()
      : "";

  if (!designId) {
    return NextResponse.json({ error: "designId 必填" }, { status: 400 });
  }

  try {
    const design = await prisma.publishedDesign.findUnique({
      where: { id: designId },
      select: { id: true, status: true },
    });
    if (!design) {
      return NextResponse.json({ error: "设计不存在" }, { status: 404 });
    }
    if (design.status !== "approved") {
      return NextResponse.json({ error: "该设计未上架" }, { status: 409 });
    }

    const before = await prisma.groupBuy.findFirst({
      where: {
        publishedDesignId: designId,
        status: "open",
        expiresAt: { gt: new Date() },
      },
      select: { id: true },
    });

    const gb = await ensureActiveGroupBuy(designId);
    return NextResponse.json({
      groupBuyId: gb.id,
      isNew: !before,
      expiresAt: gb.expiresAt,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "服务器错误";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
