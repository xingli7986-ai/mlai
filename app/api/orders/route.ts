import { NextResponse, after } from "next/server";
import { getAuthUser } from "@/lib/getAuthUser";
import { prisma } from "@/lib/prisma";
import { processForProduction } from "@/lib/print-processing";
import {
  FABRICS,
  NECKLINES,
  SIZE_OPTIONS,
  SKIRT_LENGTHS,
  SKIRT_TYPES,
  SLEEVE_TYPES,
  calculatePrice,
} from "@/lib/constants";

export const runtime = "nodejs";
// `after()` fires the production print pipeline post-response; give it room
// to finish (seamless → R2 → Replicate upscale → R2 ≈ 30–120s).
export const maxDuration = 300;

const VALID_SKIRTS = new Set(SKIRT_TYPES.map((s) => s.id));
const VALID_FABRICS = new Set(FABRICS.map((f) => f.id));
const VALID_SIZES = new Set<string>(SIZE_OPTIONS);
const VALID_NECKLINES = new Set(NECKLINES.map((n) => n.id));
const VALID_SLEEVES = new Set(SLEEVE_TYPES.map((s) => s.id));
const VALID_LENGTHS = new Set(SKIRT_LENGTHS.map((l) => l.id));

const MEASUREMENT_BOUNDS = {
  bust: { min: 70, max: 130 },
  waist: { min: 55, max: 110 },
  hip: { min: 75, max: 130 },
  height: { min: 145, max: 190 },
} as const;

function validateMeasurements(raw: unknown): {
  bust: number;
  waist: number;
  hip: number;
  height: number;
} | null {
  if (!raw || typeof raw !== "object") return null;
  const m = raw as Record<string, unknown>;
  const out: Record<string, number> = {};
  for (const key of ["bust", "waist", "hip", "height"] as const) {
    const v = m[key];
    const n = typeof v === "number" ? v : Number(v);
    if (!Number.isFinite(n)) return null;
    const bounds = MEASUREMENT_BOUNDS[key];
    if (n < bounds.min || n > bounds.max) return null;
    out[key] = n;
  }
  return out as { bust: number; waist: number; hip: number; height: number };
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
    neckline?: unknown;
    sleeveType?: unknown;
    skirtLength?: unknown;
    recipientName?: unknown;
    recipientPhone?: unknown;
    recipientRegion?: unknown;
    recipientAddress?: unknown;
    customMeasurements?: unknown;
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
  const neckline =
    typeof body.neckline === "string" ? body.neckline : null;
  const sleeveType =
    typeof body.sleeveType === "string" ? body.sleeveType : null;
  const skirtLength =
    typeof body.skirtLength === "string" ? body.skirtLength : null;
  const recipientName =
    typeof body.recipientName === "string" ? body.recipientName.trim() : "";
  const recipientPhone =
    typeof body.recipientPhone === "string" ? body.recipientPhone.trim() : "";
  const recipientRegion =
    typeof body.recipientRegion === "string"
      ? body.recipientRegion.trim()
      : "";
  const recipientAddress =
    typeof body.recipientAddress === "string"
      ? body.recipientAddress.trim()
      : "";

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
  if (size !== "custom" && !VALID_SIZES.has(size)) {
    return NextResponse.json({ error: "invalid size" }, { status: 400 });
  }

  let customMeasurementsJson: string | null = null;
  if (size === "custom") {
    const measurements = validateMeasurements(body.customMeasurements);
    if (!measurements) {
      return NextResponse.json(
        { error: "invalid customMeasurements" },
        { status: 400 }
      );
    }
    customMeasurementsJson = JSON.stringify(measurements);
  }
  if (neckline !== null && !VALID_NECKLINES.has(neckline)) {
    return NextResponse.json({ error: "invalid neckline" }, { status: 400 });
  }
  if (sleeveType !== null && !VALID_SLEEVES.has(sleeveType)) {
    return NextResponse.json({ error: "invalid sleeveType" }, { status: 400 });
  }
  if (skirtLength !== null && !VALID_LENGTHS.has(skirtLength)) {
    return NextResponse.json({ error: "invalid skirtLength" }, { status: 400 });
  }
  if (!recipientName) {
    return NextResponse.json(
      { error: "recipientName is required" },
      { status: 400 }
    );
  }
  if (!recipientPhone) {
    return NextResponse.json(
      { error: "recipientPhone is required" },
      { status: 400 }
    );
  }
  if (!recipientRegion) {
    return NextResponse.json(
      { error: "recipientRegion is required" },
      { status: 400 }
    );
  }
  if (!recipientAddress) {
    return NextResponse.json(
      { error: "recipientAddress is required" },
      { status: 400 }
    );
  }

  const price = calculatePrice(fabric, skirtType);

  try {
    const design = await prisma.design.create({
      data: {
        userId,
        prompt,
        images: [selectedImage],
        selectedImage,
        skirtType,
        fabric,
        neckline,
        sleeveType,
        skirtLength,
        status: "completed",
        order: {
          create: {
            userId,
            skirtType,
            fabric,
            size,
            neckline,
            sleeveType,
            skirtLength,
            recipientName,
            recipientPhone,
            recipientRegion,
            recipientAddress,
            customMeasurements: customMeasurementsJson,
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

    // Fire-and-forget the production-grade print processing pipeline after the
    // response is sent. `after` lets Vercel keep the function alive long enough
    // to finish even though the user already has their order confirmation.
    after(async () => {
      try {
        await processForProduction(design.id);
      } catch (err) {
        console.error(
          `Print processing failed for design ${design.id}:`,
          err
        );
      }
    });

    return NextResponse.json({ success: true, orderId: order.id, price });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create order";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
