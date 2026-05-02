import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const runtime = "nodejs";

// 推荐排序公式:点赞×3 + 收藏×5 + 浏览×1 + 时效衰减
// 时效衰减:2 天内 +50,2-7 天 +20,7 天以上 0
function recommendedScore(w: {
  likeCount: number;
  favoriteCount: number;
  viewCount: number;
  createdAt: Date;
}): number {
  const ageMs = Date.now() - w.createdAt.getTime();
  const ageDays = ageMs / (1000 * 3600 * 24);
  let freshness = 0;
  if (ageDays < 2) freshness = 50;
  else if (ageDays < 7) freshness = 20;
  return w.likeCount * 3 + w.favoriteCount * 5 + w.viewCount + freshness;
}

const TOOL_VALID = new Set(["print", "repeat", "tryon", "fitting"]);
const PROMPT_VALID = new Set(["free", "paid", "private", "all"]);
const SORT_VALID = new Set(["recommended", "latest", "hottest", "price-asc", "price-desc"]);

export async function GET(req: Request) {
  const url = new URL(req.url);
  const page = Math.max(1, Number(url.searchParams.get("page") ?? "1") || 1);
  const pageSize = Math.min(60, Math.max(1, Number(url.searchParams.get("pageSize") ?? "24") || 24));
  const tool = url.searchParams.get("tool") || "";
  const sort = url.searchParams.get("sort") || "recommended";
  const promptStatus = url.searchParams.get("promptStatus") || "all";

  const where: Prisma.InspirationWorkWhereInput = { status: "approved" };
  if (tool && TOOL_VALID.has(tool)) where.toolType = tool;
  if (promptStatus && promptStatus !== "all" && PROMPT_VALID.has(promptStatus)) {
    where.promptVisibility = promptStatus;
  }

  const validSort = SORT_VALID.has(sort) ? sort : "recommended";

  let orderBy: Prisma.InspirationWorkOrderByWithRelationInput | undefined;
  if (validSort === "latest") orderBy = { createdAt: "desc" };
  else if (validSort === "hottest") orderBy = { likeCount: "desc" };
  else if (validSort === "price-asc") orderBy = { unlockPrice: "asc" };
  else if (validSort === "price-desc") orderBy = { unlockPrice: "desc" };

  try {
    // 推荐排序:取较大窗口,JS 内打分
    const isRecommended = validSort === "recommended";
    const [total, rows] = await Promise.all([
      prisma.inspirationWork.count({ where }),
      prisma.inspirationWork.findMany({
        where,
        orderBy: orderBy ?? { createdAt: "desc" },
        skip: isRecommended ? 0 : (page - 1) * pageSize,
        take: isRecommended ? Math.min(120, pageSize * 4) : pageSize,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
              designer: { select: { displayName: true, isCertified: true, avatarUrl: true } },
            },
          },
        },
      }),
    ]);

    let works = rows.map((w) => {
      const designer = w.user.designer;
      return {
        id: w.id,
        title: w.title,
        description: w.description,
        coverImage: w.coverImage,
        toolType: w.toolType,
        promptVisibility: w.promptVisibility,
        unlockPrice: w.unlockPrice,
        styleTags: w.styleTags,
        likeCount: w.likeCount,
        favoriteCount: w.favoriteCount,
        viewCount: w.viewCount,
        unlockCount: w.unlockCount,
        commentCount: w.commentCount,
        createdAt: w.createdAt,
        creator: {
          id: w.user.id,
          name: designer?.displayName ?? w.user.name ?? "匿名创作者",
          avatar: designer?.avatarUrl ?? w.user.avatar ?? null,
          isCertified: designer?.isCertified ?? false,
          type: w.creatorType,
        },
        // 列表层不返回 prompt 内容(详情页才返回);只标 prompt 是否可解锁
        promptAvailable: w.promptVisibility !== "private",
      };
    });

    if (isRecommended) {
      const scored = works.map((w, i) => ({ w, score: recommendedScore(rows[i]) }));
      scored.sort((a, b) => b.score - a.score);
      works = scored.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize).map((s) => s.w);
    }

    // Hero 数据统计:总作品数 + 活跃创作者数 + 本周新增
    const [activeCreators, weeklyNew] = await Promise.all([
      prisma.inspirationWork
        .groupBy({ by: ["userId"], where: { status: "approved" } })
        .then((g) => g.length),
      prisma.inspirationWork.count({
        where: {
          status: "approved",
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 3600 * 1000) },
        },
      }),
    ]);

    return NextResponse.json({
      works,
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
      stats: {
        totalWorks: total,
        activeCreators,
        weeklyNew,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "查询失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
