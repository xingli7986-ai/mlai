import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/getAuthUser";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  const { id } = await params;

  try {
    const existing = await prisma.like.findUnique({
      where: { userId_publishedDesignId: { userId: user.id, publishedDesignId: id } },
    });

    if (existing) {
      await prisma.$transaction([
        prisma.like.delete({ where: { id: existing.id } }),
        prisma.publishedDesign.update({
          where: { id },
          data: { likeCount: { decrement: 1 } },
        }),
      ]);
      const updated = await prisma.publishedDesign.findUnique({
        where: { id },
        select: { likeCount: true },
      });
      return NextResponse.json({
        liked: false,
        likeCount: Math.max(0, updated?.likeCount ?? 0),
      });
    }

    const design = await prisma.publishedDesign.findUnique({
      where: { id },
      select: { id: true, status: true },
    });
    if (!design || design.status !== "approved") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.like.create({
        data: { userId: user.id, publishedDesignId: id },
      }),
      prisma.publishedDesign.update({
        where: { id },
        data: { likeCount: { increment: 1 } },
      }),
    ]);
    const updated = await prisma.publishedDesign.findUnique({
      where: { id },
      select: { likeCount: true },
    });
    return NextResponse.json({
      liked: true,
      likeCount: updated?.likeCount ?? 1,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "操作失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
