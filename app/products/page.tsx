"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import "../product-pages.css";

interface DesignerLite {
  name: string | null;
  avatar: string | null;
}
interface DesignListItem {
  id: string;
  title: string;
  images: string[];
  skirtType: string;
  fabric: string;
  styleTags: string[];
  groupPrice: number;
  customPrice: number;
  likeCount: number;
  favoriteCount: number;
  orderCount: number;
  status: string;
  publishedAt: string | null;
  designer: DesignerLite;
}
interface DesignListResponse {
  designs: DesignListItem[];
  total: number;
  page: number;
  totalPages: number;
  error?: string;
}

const CATEGORY_CHIPS: { id: string; label: string }[] = [
  { id: "", label: "全部" },
  { id: "wrap", label: "裹身" },
  { id: "shift", label: "直筒" },
  { id: "aline", label: "A 字" },
  { id: "fishtail", label: "鱼尾" },
  { id: "pencil", label: "铅笔" },
];

const FABRIC_CHIPS: { id: string; label: string }[] = [
  { id: "", label: "全部面料" },
  { id: "silk", label: "真丝" },
  { id: "knit", label: "针织" },
  { id: "blend", label: "高级混纺" },
  { id: "linen", label: "亚麻" },
];

const SORT_OPTIONS: { id: "hot" | "new" | "price" | "hot-group"; label: string }[] = [
  { id: "hot", label: "热门" },
  { id: "new", label: "最新" },
  { id: "price", label: "价格" },
  { id: "hot-group", label: "热拼" },
];

function fmtPrice(cents: number): string {
  if (!cents || cents <= 0) return "¥—";
  return `¥${cents.toLocaleString()}`;
}

const SAMPLE_TONES = ["ink", "blue", "rose", "wine", "coffee", "green", "gold", "camellia"];

function CollectionBody() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const category = searchParams.get("category") || "";
  const fabric = searchParams.get("fabric") || "";
  const sort =
    (searchParams.get("sort") as "hot" | "new" | "price" | "hot-group") || "hot";
  const search = searchParams.get("search") || "";

  const [data, setData] = useState<DesignListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  useEffect(() => {
    let alive = true;
    async function run() {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      params.set("limit", "24");
      if (category) params.set("category", category);
      if (fabric) params.set("fabric", fabric);
      if (sort) params.set("sort", sort);
      if (search) params.set("search", search);
      try {
        const res = await fetch(`/api/designs?${params.toString()}`, { cache: "no-store" });
        const json = (await res.json()) as DesignListResponse;
        if (!alive) return;
        if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
        setData(json);
      } catch (err) {
        if (!alive) return;
        setError(err instanceof Error ? err.message : "加载失败");
        setData({ designs: [], total: 0, page: 1, totalPages: 1 });
      } finally {
        if (alive) setLoading(false);
      }
    }
    run();
    return () => {
      alive = false;
    };
  }, [category, fabric, sort, search]);

  const updateQuery = useCallback(
    (patch: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [k, v] of Object.entries(patch)) {
        if (v) params.set(k, v);
        else params.delete(k);
      }
      const qs = params.toString();
      router.replace(`/products${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [router, searchParams]
  );

  const items = data?.designs ?? [];
  const hotItems = useMemo(() => items.slice(0, 5), [items]);

  function onSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateQuery({ search: searchInput.trim() });
  }

  return (
    <div className="page-wrap galleryPage">
      <nav className="nav">
        <div className="container inner">
          <Link href="/" className="nav-logo">
            MaxLuLu <span className="ai">AI</span>
          </Link>
          <div className="nav-center">
            <Link href="/products" className={sort === "hot-group" ? "" : "is-active"}>印花衣橱</Link>
            <Link href="/products" className={sort === "hot-group" ? "" : ""}>个性定制</Link>
            <Link href="/products?sort=hot-group" className={sort === "hot-group" ? "is-active" : ""}>热拼专区</Link>
          </div>
          <div className="nav-right">
            <form className="gallerySearch" onSubmit={onSearchSubmit}>
              <span aria-hidden>⌕</span>
              <input
                type="search"
                placeholder="搜索设计、风格"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </form>
            <Link href="/my">会员</Link>
            <Link href="/my">我的衣橱</Link>
          </div>
        </div>
      </nav>

      <section className="galleryHero">
        <div className="container galleryHero__inner">
          <div>
            <p className="eyebrow">PRINT WARDROBE · 印花衣橱</p>
            <h1>从 1000+ 设计师原创印花裙中，挑出你的下一件</h1>
            <p className="lead">水墨、几何、花卉、扎染……每一件都来自真人设计师，参与众定即可锁定排产。</p>
          </div>
          <div className="galleryHero__stats">
            <div><b>{data?.total ?? 0}</b><small>原创印花</small></div>
            <div><b>128</b><small>签约设计师</small></div>
            <div><b>56</b><small>正在众定</small></div>
          </div>
        </div>
      </section>

      <section className="galleryFilters">
        <div className="container">
          <div className="chipRow">
            {CATEGORY_CHIPS.map((c) => (
              <button
                key={c.id || "all"}
                type="button"
                className={`chip ${category === c.id ? "is-active" : ""}`}
                onClick={() => updateQuery({ category: c.id })}
              >
                {c.label}
              </button>
            ))}
            <span className="chipDivider" />
            {FABRIC_CHIPS.slice(1).map((f) => (
              <button
                key={f.id}
                type="button"
                className={`chip ${fabric === f.id ? "is-active" : ""}`}
                onClick={() => updateQuery({ fabric: fabric === f.id ? "" : f.id })}
              >
                {f.label}
              </button>
            ))}
            <span className="chipSpacer" />
            {SORT_OPTIONS.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`chip chip--sort ${sort === s.id ? "is-active" : ""}`}
                onClick={() => updateQuery({ sort: s.id })}
              >
                排序：{s.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {hotItems.length > 0 && (
        <section className="hotGroupStrip">
          <div className="container">
            <div className="hotGroupHead">
              <h2>
                <span className="en">Hot Group Buys</span>
                <span className="cn">热销榜单</span>
              </h2>
              <Link href="/products?sort=hot-group" className="more">查看全部 →</Link>
            </div>
            <div className="hotGroupRow">
              {hotItems.map((it, i) => (
                <Link key={it.id} href={`/products/${it.id}`} className="hotMiniCard">
                  <div className={`hotMiniMedia tone-${SAMPLE_TONES[i % SAMPLE_TONES.length]}`}>
                    {it.images[0] ? (
                      <img src={it.images[0]} alt={it.title} className="hotMiniImg" />
                    ) : (
                      <div className="hotMiniImg" style={{ display: "grid", placeItems: "center", color: "rgba(255,255,255,0.6)" }}>
                        {it.title.slice(0, 2)}
                      </div>
                    )}
                  </div>
                  <div className="hotMiniBody">
                    <div className="hotMiniName">{it.title}</div>
                    <div className="hotMiniMeta">
                      <span className="hotMiniPrice">{fmtPrice(it.groupPrice)}</span>
                      <span className="hotMiniProgress">♡ {it.likeCount}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="galleryGridSection">
        <div className="container galleryWithSide">
          <div className="galleryGrid">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="galleryCard" aria-hidden>
                  <div className="galleryCard__media ml-skeleton" style={{ aspectRatio: "3 / 4" }} />
                  <div className="galleryCard__body">
                    <div className="ml-skeleton" style={{ height: 14, marginBottom: 6 }} />
                    <div className="ml-skeleton" style={{ height: 12, width: "60%" }} />
                  </div>
                </div>
              ))
            ) : error ? (
              <div className="ml-toast ml-toast--error" style={{ gridColumn: "1 / -1" }}>
                {error}
              </div>
            ) : items.length === 0 ? (
              <div className="ml-toast" style={{ gridColumn: "1 / -1" }}>
                暂无符合条件的设计。试试其他筛选条件。
              </div>
            ) : (
              items.map((p, i) => {
                const tone = SAMPLE_TONES[i % SAMPLE_TONES.length];
                return (
                  <Link className="galleryCard" href={`/products/${p.id}`} key={p.id}>
                    <div className={`galleryCard__media tone-${tone}`}>
                      {p.images[0] ? (
                        <img src={p.images[0]} alt={p.title} className="galleryCard__image" />
                      ) : (
                        <div className="galleryCard__image" style={{ display: "grid", placeItems: "center", color: "rgba(255,255,255,0.6)" }}>
                          {p.title.slice(0, 2)}
                        </div>
                      )}
                      <div className="galleryCard__icons" onClick={(e) => e.preventDefault()}>
                        <button type="button" className="iconBtn" aria-label="收藏">♡</button>
                        <button type="button" className="iconBtn" aria-label="加入衣橱">❑</button>
                      </div>
                    </div>
                    <div className="galleryCard__body">
                      <div className="galleryCard__name">{p.title}</div>
                      <div className="galleryCard__price">{fmtPrice(p.groupPrice)}</div>
                      <div className="galleryCard__designer">{p.designer.name ?? "MaxLuLu Studio"}</div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>

          <aside className="gallerySide">
            <div className="gallerySideCard">
              <div className="gallerySideCard__head"><b>印花风格</b></div>
              <div className="gallerySideTags">
                {["水墨晕染", "几何拼接", "热带花卉", "扎染", "工笔花鸟", "复古条纹"].map((t) => (
                  <span key={t} onClick={() => updateQuery({ search: t })} style={{ cursor: "pointer" }}>{t}</span>
                ))}
              </div>
            </div>

            <div className="gallerySideCard">
              <div className="gallerySideCard__head"><b>价格区间</b></div>
              <div className="gallerySideRanges">
                {[
                  { label: "¥299 以下", count: 24 },
                  { label: "¥300 — ¥599", count: 86 },
                  { label: "¥600 — ¥899", count: 62 },
                  { label: "¥900 以上", count: 38 },
                ].map((r) => (
                  <button key={r.label} type="button" className="gallerySideRange">
                    <span>{r.label}</span>
                    <em>{r.count}</em>
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<main className="productPage" />}>
      <CollectionBody />
    </Suspense>
  );
}
