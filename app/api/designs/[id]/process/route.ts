import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/getAuthUser";
import { prisma } from "@/lib/prisma";
import { processForProduction } from "@/lib/print-processing";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const design = await prisma.design.findUnique({ where: { id } });
  if (!design || design.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (
    design.processingStatus === "completed" &&
    design.productionImageUrl
  ) {
    return NextResponse.json({
      status: "completed",
      productionImageUrl: design.productionImageUrl,
    });
  }

  if (design.processingStatus === "processing") {
    return NextResponse.json({
      status: "processing",
      message: "正在处理中",
    });
  }

  try {
    const productionImageUrl = await processForProduction(id);
    return NextResponse.json({
      status: "completed",
      productionImageUrl,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Processing failed";
    return NextResponse.json(
      { status: "failed", error: message },
      { status: 500 }
    );
  }
}
