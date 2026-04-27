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
    const d = await prisma.publishedDesign.findUnique({
      where: { id },
      include: {
        designer: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
            bio: true,
            user: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!d || d.status !== "approved") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const [commentCount, isLiked, isFavorited] = await Promise.all([
      prisma.comment.count({ where: { publishedDesignId: id } }),
      userId
        ? prisma.like.findUnique({
            where: { userId_publishedDesignId: { userId, publishedDesignId: id } },
          }).then(Boolean)
        : Promise.resolve(false),
      userId
        ? prisma.favorite.findUnique({
            where: { userId_publishedDesignId: { userId, publishedDesignId: id } },
          }).then(Boolean)
        : Promise.resolve(false),
    ]);

    // Fire and forget: increment view count.
    prisma.publishedDesign
      .update({ where: { id }, data: { viewCount: { increment: 1 } } })
      .catch(() => undefined);

    return NextResponse.json({
      design: {
        id: d.id,
        title: d.title,
        description: d.description,
        images: d.coverImages,
        patternImage: d.patternImage,
        skirtType: d.skirtType,
        neckline: d.neckline,
        sleeveType: d.sleeveType,
        skirtLength: d.skirtLength,
        fabric: d.fabric,
        styleTags: d.styleTags,
        groupPrice: d.groupPrice,
        customPrice: d.customPrice,
        costBreakdown: d.costBreakdown,
        status: d.status,
        viewCount: d.viewCount,
        likeCount: d.likeCount,
        favoriteCount: d.favoriteCount,
        orderCount: d.orderCount,
        commentCount,
        publishedAt: d.publishedAt,
        designer: {
          id: d.designer.id,
          name: d.designer.displayName,
          avatar: d.designer.avatarUrl,
          bio: d.designer.bio,
        },
        isLiked,
        isFavorited,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "查询失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
