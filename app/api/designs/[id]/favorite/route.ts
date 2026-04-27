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
    const existing = await prisma.favorite.findUnique({
      where: { userId_publishedDesignId: { userId: user.id, publishedDesignId: id } },
    });

    if (existing) {
      await prisma.$transaction([
        prisma.favorite.delete({ where: { id: existing.id } }),
        prisma.publishedDesign.update({
          where: { id },
          data: { favoriteCount: { decrement: 1 } },
        }),
      ]);
      return NextResponse.json({ favorited: false });
    }

    const design = await prisma.publishedDesign.findUnique({
      where: { id },
      select: { id: true, status: true },
    });
    if (!design || design.status !== "approved") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.favorite.create({
        data: { userId: user.id, publishedDesignId: id },
      }),
      prisma.publishedDesign.update({
        where: { id },
        data: { favoriteCount: { increment: 1 } },
      }),
    ]);
    return NextResponse.json({ favorited: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "操作失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
