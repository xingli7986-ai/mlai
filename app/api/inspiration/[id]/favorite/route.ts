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
    const existing = await prisma.inspirationFavorite.findUnique({
      where: { userId_inspirationWorkId: { userId: user.id, inspirationWorkId: id } },
    });

    if (existing) {
      await prisma.$transaction([
        prisma.inspirationFavorite.delete({ where: { id: existing.id } }),
        prisma.inspirationWork.update({
          where: { id },
          data: { favoriteCount: { decrement: 1 } },
        }),
      ]);
      const updated = await prisma.inspirationWork.findUnique({
        where: { id },
        select: { favoriteCount: true },
      });
      return NextResponse.json({
        favorited: false,
        favoriteCount: Math.max(0, updated?.favoriteCount ?? 0),
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
      prisma.inspirationFavorite.create({
        data: { userId: user.id, inspirationWorkId: id },
      }),
      prisma.inspirationWork.update({
        where: { id },
        data: { favoriteCount: { increment: 1 } },
      }),
    ]);
    const updated = await prisma.inspirationWork.findUnique({
      where: { id },
      select: { favoriteCount: true },
    });
    return NextResponse.json({
      favorited: true,
      favoriteCount: updated?.favoriteCount ?? 1,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "操作失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
