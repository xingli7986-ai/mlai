import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/getAuthUser";
import { prisma } from "@/lib/prisma";
import {
  NECKLINES,
  SKIRT_LENGTHS,
  SLEEVE_TYPES,
} from "@/lib/constants";

export const runtime = "nodejs";

const VALID_NECKLINES = new Set(NECKLINES.map((n) => n.id));
const VALID_SLEEVES = new Set(SLEEVE_TYPES.map((s) => s.id));
const VALID_LENGTHS = new Set(SKIRT_LENGTHS.map((l) => l.id));

export async function POST(req: Request) {
  const user = await getAuthUser(req);
  const userId = user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    prompt?: unknown;
    selectedImage?: unknown;
    images?: unknown;
    neckline?: unknown;
    sleeveType?: unknown;
    skirtLength?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
  const selectedImage =
    typeof body.selectedImage === "string" ? body.selectedImage.trim() : "";
  const images = Array.isArray(body.images)
    ? body.images.filter((u): u is string => typeof u === "string")
    : [];
  const neckline =
    typeof body.neckline === "string" ? body.neckline : null;
  const sleeveType =
    typeof body.sleeveType === "string" ? body.sleeveType : null;
  const skirtLength =
    typeof body.skirtLength === "string" ? body.skirtLength : null;

  if (!prompt) {
    return NextResponse.json({ error: "prompt is required" }, { status: 400 });
  }
  if (!selectedImage) {
    return NextResponse.json(
      { error: "selectedImage is required" },
      { status: 400 }
    );
  }
  if (images.length === 0) {
    return NextResponse.json(
      { error: "images is required" },
      { status: 400 }
    );
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

  try {
    const design = await prisma.design.create({
      data: {
        userId,
        prompt,
        images,
        selectedImage,
        neckline,
        sleeveType,
        skirtLength,
        status: "saved",
      },
    });
    return NextResponse.json({ success: true, designId: design.id });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to save design";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
