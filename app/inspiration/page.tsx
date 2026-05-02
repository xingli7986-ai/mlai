"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import ConsumerNav from "@/components/ConsumerNav";
import {
  Button,
  CertifiedCardFrame,
  AuthorSignature,
  MasonryGrid,
  EmptyState,
  Skeleton,
} from "@/components/ui";
import "./inspiration.css";

interface CreatorLite {
  id: string;
  name: string;
  avatar: string | null;
  isCertified: boolean;
  type: string;
}
interface WorkItem {
  id: string;
  title: string;
  description: string | null;
  coverImage: string;
  toolType: string;
  promptVisibility: "free" | "paid" | "private";
  unlockPrice: number;
  styleTags: string[];
  likeCount: number;
  favoriteCount: number;
  viewCount: number;
  unlockCount: number;
  commentCount: number;
  createdAt: string;
  creator: CreatorLite;
  promptAvailable: boolean;
}
interface ListResponse {
  works: WorkItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  stats: { totalWorks: number; activeCreators: number; weeklyNew: number };
  error?: string;
}

const TOOL_TABS: { id: string; label: string }[] = [
  { id: "", label: "全部工具" },
  { id: "print", label: "印花生成" },
  { id: "repeat", label: "四方连续" },
  { id: "tryon", label: "图案上身" },
  { id: "fitting", label: "AI 试衣" },
];

const SORT_TABS: { id: string; label: string }[] = [
  { id: "recommended", label: "推荐" },
  { id: "latest", label: "最新" },
  { id: "hottest", label: "最热" },
  { id: "price-asc", label: "价格升" },
  { id: "price-desc", label: "价格降" },
];

const PROMPT_TABS: { id: string; label: string }[] = [
  { id: "all", label: "全部 prompt" },
  { id: "free", label: "免费公开" },
  { id: "paid", label: "付费解锁" },
  { id: "private", label: "不公开" },
];

function fmtPrice(cents: number): string {
  return `¥${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`;
}

function lockBadgeForCard(w: WorkItem) {
  if (w.promptVisibility === "free") {
    return <span className="inspCard__lockBadge inspCard__lockBadge--free">免费</span>;
  }
  if (w.promptVisibility === "paid") {
    return (
      <span className="inspCard__lockBadge inspCard__lockBadge--paid">
        {fmtPrice(w.unlockPrice)} 解锁
      </span>
    );
  }
  return <span className="inspCard__lockBadge inspCard__lockBadge--private">不公开</span>;
}

function InspirationBody() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tool = searchParams.get("tool") || "";
  const sort = searchParams.get("sort") || "recommended";
  const promptStatus = searchParams.get("promptStatus") || "all";

  const [data, setData] = useState<ListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    async function run() {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      params.set("pageSize", "24");
      if (tool) params.set("tool", tool);
      if (sort) params.set("sort", sort);
      if (promptStatus && promptStatus !== "all") params.set("promptStatus", promptStatus);
      try {
        const res = await fetch(`/api/inspiration?${params.toString()}`, { cache: "no-store" });
        const json = (await res.json()) as ListResponse;
        if (!alive) return;
        if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
        setData(json);
      } catch (err) {
        if (!alive) return;
        setError(err instanceof Error ? err.message : "加载失败");
      } finally {
        if (alive) setLoading(false);
      }
    }
    run();
    return () => {
      alive = false;
    };
  }, [tool, sort, promptStatus]);

  const updateQuery = useCallback(
    (patch: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [k, v] of Object.entries(patch)) {
        if (v) params.set(k, v);
        else params.delete(k);
      }
      const qs = params.toString();
      router.replace(`/inspiration${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [router, searchParams]
  );

  const works = data?.works ?? [];
  const stats = useMemo(
    () => data?.stats ?? { totalWorks: 0, activeCreators: 0, weeklyNew: 0 },
    [data]
  );

  return (
    <div className="page-wrap inspirationPage">
      <ConsumerNav variant="solid" />

      <div className="container">
        <section className="inspHero">
          {/* 等待 GPT 提供 hero banner 图 — 当前用 CSS 渐变占位,布局保留 480px(移动 380px) */}
          <div className="inspHero__bg inspHero__bg--placeholder" aria-hidden />
          <div className="inspHero__overlay" aria-hidden />
          <div className="inspHero__inner">
            <div className="inspHero__copy">
              <p className="inspHero__eyebrow">
                灵感广场<span className="slash"> / </span>inspiration
              </p>
              <p className="inspHero__display">Fashion For You</p>
              <h1>每一朵印花,都由你绽放</h1>
              <p className="inspHero__lead">
                展示创作过程 · 解锁 prompt · 基于喜欢的款式继续创作。
                所有作品来自真实创作者。
              </p>
              <div className="inspHero__cta">
                <Button as="a" href="/my-studio" variant="primary" size="md">
                  成为创作者 → 进入工作室
                </Button>
              </div>
            </div>
            <div className="inspHero__stats">
              <div className="inspHero__stat">
                <b>{stats.totalWorks}</b>
                <small>总作品</small>
              </div>
              <div className="inspHero__stat">
                <b>{stats.activeCreators}</b>
                <small>活跃创作者</small>
              </div>
              <div className="inspHero__stat">
                <b>{stats.weeklyNew}</b>
                <small>本周新增</small>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="inspTabs container">
        <div className="inspTabRow">
          {TOOL_TABS.map((t) => (
            <button
              key={t.id || "all-tool"}
              type="button"
              className={`inspTab ${tool === t.id ? "is-active" : ""}`}
              onClick={() => updateQuery({ tool: t.id })}
            >
              {t.label}
            </button>
          ))}
          <span className="inspTabRow__sep" />
          {PROMPT_TABS.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`inspTab ${promptStatus === p.id ? "is-active" : ""}`}
              onClick={() => updateQuery({ promptStatus: p.id })}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="inspTabRow">
          {SORT_TABS.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`inspTab ${sort === s.id ? "is-active" : ""}`}
              onClick={() => updateQuery({ sort: s.id })}
            >
              排序:{s.label}
            </button>
          ))}
        </div>
      </section>

      <section className="inspGridSection">
        <div className="container inspWithSide">
          <MasonryGrid columns={{ desktop: 4, tablet: 3, mobile: 2 }}>
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <div key={i}>
                    <Skeleton style={{ aspectRatio: "4 / 5", borderRadius: "var(--radius-l)" }} />
                    <Skeleton height={14} style={{ marginTop: 12, width: "70%" }} />
                  </div>
                ))
              : error
              ? (
                  <div style={{ gridColumn: "1 / -1" }}>
                    <EmptyState
                      title="加载失败"
                      description={error}
                      action={
                        <Button variant="secondary" onClick={() => updateQuery({})}>
                          重试
                        </Button>
                      }
                    />
                  </div>
                )
              : works.length === 0
              ? (
                  <div style={{ gridColumn: "1 / -1" }}>
                    <EmptyState
                      title="还没有作品"
                      description="试试其他筛选,或来工作室创作第一件。"
                    />
                  </div>
                )
              : works.map((w) => (
                  <CertifiedCardFrame
                    key={w.id}
                    certified={w.creator.isCertified}
                    ribbonLabel="认证"
                    className="inspCard"
                  >
                    <Link
                      href={`/inspiration/${w.id}`}
                      className="inspCard"
                      style={{ display: "contents" }}
                    >
                      <div className="inspCard__media">
                        {w.coverImage ? (
                          <img src={w.coverImage} alt={w.title} className="inspCard__img" />
                        ) : (
                          <div className="inspCard__placeholder">{w.title.slice(0, 4)}</div>
                        )}
                        <button
                          type="button"
                          className="inspCard__like"
                          aria-label="收藏"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            // 收藏交互留批次 2 接 InspirationFavorite API;此处仅 UI 占位
                          }}
                        >
                          ♡
                        </button>
                        {lockBadgeForCard(w)}
                      </div>
                      <div className="inspCard__body">
                        <p className="inspCard__title">{w.title}</p>
                        <AuthorSignature
                          name={w.creator.name}
                          avatar={w.creator.avatar}
                          isCertified={w.creator.isCertified}
                          size="sm"
                          prefix
                          certifiedLabel="短"
                        />
                        <div className="inspCard__metaRow">
                          <span><i className="ic">♡</i> {w.likeCount}</span>
                          <span><i className="ic">★</i> {w.favoriteCount}</span>
                          <span><i className="ic">👁</i> {w.viewCount}</span>
                        </div>
                      </div>
                    </Link>
                  </CertifiedCardFrame>
                ))}
          </MasonryGrid>

          <aside className="inspSide">
            <div className="inspSideCard">
              <div className="inspSideCard__head">印花风格</div>
              <div className="inspSideTags">
                {["水墨晕染", "几何拼接", "热带花卉", "扎染", "工笔花鸟", "复古条纹"].map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
            </div>
            <div className="inspSideCard">
              <div className="inspSideCard__head">解锁价格</div>
              <div className="inspSideRanges">
                {[
                  { label: "免费", count: works.filter((w) => w.promptVisibility === "free").length },
                  { label: "¥9 - ¥19", count: works.filter((w) => w.promptVisibility === "paid" && w.unlockPrice <= 1999).length },
                  { label: "¥20 - ¥39", count: works.filter((w) => w.promptVisibility === "paid" && w.unlockPrice >= 2000).length },
                ].map((r) => (
                  <button key={r.label} type="button" className="inspSideRange">
                    <span>{r.label}</span>
                    <em>{r.count}</em>
                  </button>
                ))}
              </div>
            </div>
            <div className="inspSideCard inspSideJoin">
              <b>想成为创作者?</b>
              <p>用 AI 设计你的第一件印花,分享到广场。</p>
              <Link href="/products?intent=custom">了解工作室 →</Link>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

export default function InspirationPage() {
  return (
    <Suspense fallback={<main className="inspirationPage" />}>
      <InspirationBody />
    </Suspense>
  );
}
