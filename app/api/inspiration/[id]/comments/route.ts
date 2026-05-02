import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/getAuthUser";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const url = new URL(req.url);
  const page = Math.max(1, Number(url.searchParams.get("page") ?? "1") || 1);
  const limit = Math.min(50, Math.max(1, Number(url.searchParams.get("limit") ?? "20") || 20));

  try {
    const [total, rows] = await Promise.all([
      prisma.inspirationComment.count({ where: { inspirationWorkId: id } }),
      prisma.inspirationComment.findMany({
        where: { inspirationWorkId: id },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
              designer: { select: { isCertified: true, displayName: true, avatarUrl: true } },
            },
          },
        },
      }),
    ]);

    const comments = rows.map((c) => ({
      id: c.id,
      content: c.content,
      createdAt: c.createdAt,
      user: {
        id: c.user.id,
        name: c.user.designer?.displayName ?? c.user.name ?? "匿名用户",
        avatar: c.user.designer?.avatarUrl ?? c.user.avatar ?? null,
        isCertified: c.user.designer?.isCertified ?? false,
      },
    }));

    return NextResponse.json({
      comments,
      total,
      page,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "查询失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  const { id } = await params;

  let body: { content?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const content = (body.content ?? "").trim();
  if (!content) {
    return NextResponse.json({ error: "评论内容不能为空" }, { status: 400 });
  }
  if (content.length > 1000) {
    return NextResponse.json({ error: "评论内容过长（最多 1000 字）" }, { status: 400 });
  }

  try {
    const work = await prisma.inspirationWork.findUnique({
      where: { id },
      select: { id: true, status: true },
    });
    if (!work || work.status !== "approved") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const created = await prisma.$transaction(async (tx) => {
      const c = await tx.inspirationComment.create({
        data: {
          userId: user.id,
          inspirationWorkId: id,
          content,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
              designer: { select: { isCertified: true, displayName: true, avatarUrl: true } },
            },
          },
        },
      });
      await tx.inspirationWork.update({
        where: { id },
        data: { commentCount: { increment: 1 } },
      });
      return c;
    });

    return NextResponse.json({
      comment: {
        id: created.id,
        content: created.content,
        createdAt: created.createdAt,
        user: {
          id: created.user.id,
          name: created.user.designer?.displayName ?? created.user.name ?? "匿名用户",
          avatar: created.user.designer?.avatarUrl ?? created.user.avatar ?? null,
          isCertified: created.user.designer?.isCertified ?? false,
        },
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "评论失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
