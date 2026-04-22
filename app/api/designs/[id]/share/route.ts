import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const design = await prisma.design.findUnique({
      where: { id },
      select: {
        id: true,
        prompt: true,
        images: true,
        selectedImage: true,
        createdAt: true,
      },
    });
    if (!design) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({
      design: {
        id: design.id,
        prompt: design.prompt,
        images: design.images,
        selectedImage: design.selectedImage,
        createdAt: design.createdAt,
      },
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to load design";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
