import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const VALID_SKIRTS = new Set(["a-line", "straight", "half"]);
const VALID_FABRICS = new Set(["cotton", "silk"]);
const VALID_SIZES = new Set(["S", "M", "L", "XL"]);

function calcPrice(fabric: string): number {
  return fabric === "silk" ? 399 : 299;
}

export async function POST(req: Request) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    prompt?: unknown;
    selectedImage?: unknown;
    skirtType?: unknown;
    fabric?: unknown;
    size?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
  const selectedImage =
    typeof body.selectedImage === "string" ? body.selectedImage.trim() : "";
  const skirtType = typeof body.skirtType === "string" ? body.skirtType : "";
  const fabric = typeof body.fabric === "string" ? body.fabric : "";
  const size = typeof body.size === "string" ? body.size : "";

  if (!prompt) {
    return NextResponse.json(
      { error: "prompt is required" },
      { status: 400 }
    );
  }
  if (!selectedImage) {
    return NextResponse.json(
      { error: "selectedImage is required" },
      { status: 400 }
    );
  }
  if (!VALID_SKIRTS.has(skirtType)) {
    return NextResponse.json({ error: "invalid skirtType" }, { status: 400 });
  }
  if (!VALID_FABRICS.has(fabric)) {
    return NextResponse.json({ error: "invalid fabric" }, { status: 400 });
  }
  if (!VALID_SIZES.has(size)) {
    return NextResponse.json({ error: "invalid size" }, { status: 400 });
  }

  const price = calcPrice(fabric);

  const design = await prisma.design.create({
    data: {
      userId,
      prompt,
      images: [selectedImage],
      selectedImage,
      skirtType,
      fabric,
      status: "completed",
      order: {
        create: {
          userId,
          skirtType,
          fabric,
          size,
          price,
          status: "paid",
        },
      },
    },
    include: { order: true },
  });

  const order = design.order;
  if (!order) {
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }

  return NextResponse.json({ success: true, orderId: order.id, price });
}
