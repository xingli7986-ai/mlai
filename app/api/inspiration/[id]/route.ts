import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/getAuthUser";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getAuthUser(req);
  const userId = user?.id ?? null;

  try {
    const w = await prisma.inspirationWork.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            designer: {
              select: {
                id: true,
                displayName: true,
                bio: true,
                avatarUrl: true,
                isCertified: true,
              },
            },
          },
        },
      },
    });

    if (!w || w.status !== "approved") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // 解锁状态判断
    let unlocked = false;
    if (w.promptVisibility === "free") unlocked = true;
    else if (w.promptVisibility === "private") unlocked = false;
    else if (w.promptVisibility === "paid" && userId) {
      const u = await prisma.promptUnlock.findUnique({
        where: { userId_inspirationWorkId: { userId, inspirationWorkId: id } },
      });
      if (u && u.status === "paid") unlocked = true;
    }

    const [isLiked, isFavorited, similarRows] = await Promise.all([
      userId
        ? prisma.inspirationLike
            .findUnique({
              where: { userId_inspirationWorkId: { userId, inspirationWorkId: id } },
            })
            .then(Boolean)
        : Promise.resolve(false),
      userId
        ? prisma.inspirationFavorite
            .findUnique({
              where: { userId_inspirationWorkId: { userId, inspirationWorkId: id } },
            })
            .then(Boolean)
        : Promise.resolve(false),
      // 相似作品:同 toolType 且非自身,top 6 by likeCount
      prisma.inspirationWork.findMany({
        where: {
          status: "approved",
          toolType: w.toolType,
          id: { not: id },
        },
        orderBy: { likeCount: "desc" },
        take: 6,
        include: {
          user: {
            select: {
              name: true,
              designer: { select: { displayName: true, isCertified: true } },
            },
          },
        },
      }),
    ]);

    // 自增 viewCount(火忘)
    prisma.inspirationWork
      .update({ where: { id }, data: { viewCount: { increment: 1 } } })
      .catch(() => undefined);

    const designer = w.user.designer;

    const work = {
      id: w.id,
      title: w.title,
      description: w.description,
      coverImage: w.coverImage,
      images: w.images,
      toolType: w.toolType,
      promptVisibility: w.promptVisibility,
      unlockPrice: w.unlockPrice,
      styleTags: w.styleTags,
      likeCount: w.likeCount,
      favoriteCount: w.favoriteCount,
      viewCount: w.viewCount,
      commentCount: w.commentCount,
      unlockCount: w.unlockCount,
      isListed: w.isListed,
      listedProductId: w.listedProductId,
      createdAt: w.createdAt,
      creator: {
        id: w.user.id,
        name: designer?.displayName ?? w.user.name ?? "匿名创作者",
        avatar: designer?.avatarUrl ?? w.user.avatar ?? null,
        bio: designer?.bio ?? null,
        isCertified: designer?.isCertified ?? false,
        type: w.creatorType,
      },
      isLiked,
      isFavorited,
      // 解锁后才返回 prompt + params
      promptUnlocked: unlocked,
      ...(unlocked
        ? {
            prompt: w.prompt,
            params: w.params,
          }
        : {}),
    };

    const similar = similarRows.map((s) => ({
      id: s.id,
      title: s.title,
      coverImage: s.coverImage,
      likeCount: s.likeCount,
      creator: {
        name: s.user.designer?.displayName ?? s.user.name ?? "匿名创作者",
        isCertified: s.user.designer?.isCertified ?? false,
      },
    }));

    return NextResponse.json({ work, similar });
  } catch (err) {
    const message = err instanceof Error ? err.message : "查询失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
