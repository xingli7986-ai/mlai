import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/getAuthUser";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

/** GET /api/my/favorites — paginated list of favourited PublishedDesigns. */
export async function GET(req: Request) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  const url = new URL(req.url);
  const page = Math.max(1, Number(url.searchParams.get("page") ?? "1") || 1);
  const limit = Math.min(60, Math.max(1, Number(url.searchParams.get("limit") ?? "20") || 20));

  try {
    const [total, rows] = await Promise.all([
      prisma.favorite.count({ where: { userId: user.id } }),
      prisma.favorite.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          publishedDesign: {
            select: {
              id: true,
              title: true,
              coverImages: true,
              skirtType: true,
              fabric: true,
              groupPrice: true,
              customPrice: true,
              likeCount: true,
              status: true,
              designer: { select: { displayName: true, avatarUrl: true } },
            },
          },
        },
      }),
    ]);

    const designs = rows
      .filter((r) => r.publishedDesign && r.publishedDesign.status === "approved")
      .map((r) => ({
        favoritedAt: r.createdAt,
        id: r.publishedDesign.id,
        title: r.publishedDesign.title,
        images: r.publishedDesign.coverImages,
        skirtType: r.publishedDesign.skirtType,
        fabric: r.publishedDesign.fabric,
        groupPrice: r.publishedDesign.groupPrice,
        customPrice: r.publishedDesign.customPrice,
        likeCount: r.publishedDesign.likeCount,
        designer: {
          name: r.publishedDesign.designer.displayName,
          avatar: r.publishedDesign.designer.avatarUrl,
        },
      }));

    return NextResponse.json({
      designs,
      total,
      page,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "查询失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
