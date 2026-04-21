import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/getAuthUser";
import { prisma } from "@/lib/prisma";
import { FABRICS, SIZE_OPTIONS, SKIRT_TYPES } from "@/lib/constants";

export const runtime = "nodejs";

const VALID_SKIRTS = new Set(SKIRT_TYPES.map((s) => s.id));
const VALID_FABRICS = new Set(FABRICS.map((f) => f.id));
const VALID_SIZES = new Set<string>(SIZE_OPTIONS);
const DEFAULT_PRICE = Math.min(...FABRICS.map((f) => f.price));

function calcPrice(fabric: string): number {
  return FABRICS.find((f) => f.id === fabric)?.price ?? DEFAULT_PRICE;
}

export async function POST(req: Request) {
  const user = await getAuthUser(req);
  const userId = user?.id;
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

  try {
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
      return NextResponse.json(
        { error: "Failed to create order" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, orderId: order.id, price });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create order";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
