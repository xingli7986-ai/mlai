import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/getAuthUser";
import { prisma } from "@/lib/prisma";
import { validateRecipient, validateSize } from "@/lib/group-buy";

export const runtime = "nodejs";

/**
 * POST /api/designs/[id]/custom-order
 * Buy a one-of-a-kind custom piece against a PublishedDesign at customPrice.
 * Creates a personal Design row (snapshot) + an Order row tied to it, returning
 * the Order id so the client can call /api/payment/create.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  const { id } = await params;

  let body: {
    size?: unknown;
    customMeasurements?: unknown;
    recipientName?: unknown;
    recipientPhone?: unknown;
    recipientRegion?: unknown;
    recipientAddress?: unknown;
    note?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const size = validateSize(body.size);
  if (!size) {
    return NextResponse.json({ error: "尺码格式错误" }, { status: 400 });
  }
  const recipient = validateRecipient(body);
  if (typeof recipient === "string") {
    return NextResponse.json({ error: recipient }, { status: 400 });
  }
  const customMeasurements =
    typeof body.customMeasurements === "string" ? body.customMeasurements : null;
  const note = typeof body.note === "string" ? body.note.trim().slice(0, 500) : "";

  const published = await prisma.publishedDesign.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      coverImages: true,
      patternImage: true,
      skirtType: true,
      neckline: true,
      sleeveType: true,
      skirtLength: true,
      fabric: true,
      customPrice: true,
      status: true,
      designer: { select: { id: true } },
    },
  });
  if (!published || published.status !== "approved") {
    return NextResponse.json({ error: "设计不存在或未上架" }, { status: 404 });
  }
  if (!published.customPrice || published.customPrice <= 0) {
    return NextResponse.json({ error: "该设计未开放个人定制" }, { status: 400 });
  }

  const promptSummary = `Custom from PublishedDesign:${published.id} ${
    published.title
  }${note ? ` | note: ${note}` : ""}`;
  const selectedImage = published.patternImage || published.coverImages[0] || "";

  try {
    const design = await prisma.design.create({
      data: {
        userId: user.id,
        prompt: promptSummary,
        images: published.coverImages.length > 0 ? published.coverImages : [selectedImage].filter(Boolean),
        selectedImage: selectedImage || null,
        skirtType: published.skirtType,
        fabric: published.fabric,
        neckline: published.neckline,
        sleeveType: published.sleeveType,
        skirtLength: published.skirtLength,
        status: "completed",
        order: {
          create: {
            userId: user.id,
            skirtType: published.skirtType,
            fabric: published.fabric,
            size,
            neckline: published.neckline,
            sleeveType: published.sleeveType,
            skirtLength: published.skirtLength,
            recipientName: recipient.recipientName,
            recipientPhone: recipient.recipientPhone,
            recipientRegion: recipient.recipientRegion,
            recipientAddress: recipient.recipientAddress,
            customMeasurements,
            status: "pending",
            totalAmount: published.customPrice,
          },
        },
      },
      include: { order: true },
    });

    if (!design.order) {
      return NextResponse.json({ error: "下单失败" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      order: {
        id: design.order.id,
        totalAmount: design.order.totalAmount,
        status: design.order.status,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "下单失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
