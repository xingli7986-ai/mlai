import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    prompt?: unknown;
    selectedImage?: unknown;
    images?: unknown;
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

  try {
    const design = await prisma.design.create({
      data: {
        userId,
        prompt,
        images,
        selectedImage,
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
