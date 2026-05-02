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
    const existing = await prisma.inspirationLike.findUnique({
      where: { userId_inspirationWorkId: { userId: user.id, inspirationWorkId: id } },
    });

    if (existing) {
      await prisma.$transaction([
        prisma.inspirationLike.delete({ where: { id: existing.id } }),
        prisma.inspirationWork.update({
          where: { id },
          data: { likeCount: { decrement: 1 } },
        }),
      ]);
      const updated = await prisma.inspirationWork.findUnique({
        where: { id },
        select: { likeCount: true },
      });
      return NextResponse.json({
        liked: false,
        likeCount: Math.max(0, updated?.likeCount ?? 0),
      });
    }

    const work = await prisma.inspirationWork.findUnique({
      where: { id },
      select: { id: true, status: true },
    });
    if (!work || work.status !== "approved") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.inspirationLike.create({
        data: { userId: user.id, inspirationWorkId: id },
      }),
      prisma.inspirationWork.update({
        where: { id },
        data: { likeCount: { increment: 1 } },
      }),
    ]);
    const updated = await prisma.inspirationWork.findUnique({
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
