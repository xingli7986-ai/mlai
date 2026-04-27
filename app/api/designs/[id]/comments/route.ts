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
      prisma.comment.count({ where: { publishedDesignId: id } }),
      prisma.comment.findMany({
        where: { publishedDesignId: id },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: { id: true, name: true, avatar: true },
          },
        },
      }),
    ]);

    const comments = rows.map((c) => ({
      id: c.id,
      content: c.content,
      rating: c.rating,
      images: c.images,
      isPurchased: c.isPurchased,
      createdAt: c.createdAt,
      user: {
        id: c.user.id,
        name: c.user.name ?? "匿名用户",
        avatar: c.user.avatar ?? null,
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

  let body: { content?: string; rating?: number; images?: string[] };
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
    const design = await prisma.publishedDesign.findUnique({
      where: { id },
      select: { id: true, status: true },
    });
    if (!design || design.status !== "approved") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const created = await prisma.comment.create({
      data: {
        userId: user.id,
        publishedDesignId: id,
        content,
        rating: typeof body.rating === "number" ? body.rating : null,
        images: Array.isArray(body.images) ? body.images.slice(0, 9) : [],
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
    });

    return NextResponse.json({
      comment: {
        id: created.id,
        content: created.content,
        rating: created.rating,
        images: created.images,
        isPurchased: created.isPurchased,
        createdAt: created.createdAt,
        user: {
          id: created.user.id,
          name: created.user.name ?? "匿名用户",
          avatar: created.user.avatar ?? null,
        },
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "评论失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
