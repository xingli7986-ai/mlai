"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useMemo } from "react";
import AssetImage from "@/components/AssetImage";
import {
  getProductsBySeries,
  productFilters,
  type ProductFilter,
} from "@/lib/product-detail-data";
import "../product-pages.css";

function resolveFilter(raw: string | null): ProductFilter["id"] {
  return productFilters.some((f) => f.id === raw)
    ? (raw as ProductFilter["id"])
    : "all";
}

const CHIP_LABELS: Record<ProductFilter["id"], string> = {
  all: "全部",
  classic: "经典裹身",
  commute: "通勤知性",
  vacation: "夏日度假",
  evening: "晚宴聚会",
};

const DESIGNER_BY_TONE: Record<string, string> = {
  ink: "MaxLuLu Studio",
  camellia: "Design by Luna",
  blue: "Design by Yuki",
  wine: "Atelier Reine",
  coffee: "MaxLuLu Studio",
  green: "Design by Mei",
  rose: "Design by Luna",
  gold: "Atelier Reine",
};

function CollectionBody() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const active = resolveFilter(searchParams.get("filter"));
  const items = useMemo(() => getProductsBySeries(active), [active]);

  // Hot Group Buys = top 5 by joined progress across all series
  const hotItems = useMemo(() => {
    const all = getProductsBySeries("all");
    return [...all]
      .sort((a, b) => b.product.joined / b.product.target - a.product.joined / a.product.target)
      .slice(0, 5);
  }, []);

  function setFilter(id: ProductFilter["id"]) {
    const query = id === "all" ? "" : `?filter=${id}`;
    router.replace(`/products${query}`, { scroll: false });
  }

  return (
    <div className="page-wrap galleryPage">
      <nav className="nav">
        <div className="container inner">
          <Link href="/" className="nav-logo">
            MaxLuLu <span className="ai">AI</span>
          </Link>
          <div className="nav-center">
            <Link href="/products" className="is-active">灵感画廊</Link>
            <Link href="/products">个性定制</Link>
            <a href="/#hot">热拼专区</a>
          </div>
          <div className="nav-right">
            <div className="gallerySearch">
              <span aria-hidden>⌕</span>
              <input type="search" placeholder="搜索设计、风格、设计师" />
            </div>
            <Link href="/my">我的衣橱</Link>
            <Link href="/studio/join" className="designer-btn">设计师入驻</Link>
          </div>
        </div>
      </nav>

      <section className="galleryHero">
        <div className="container galleryHero__inner">
          <div>
            <p className="eyebrow">INSPIRATION GALLERY · 灵感画廊</p>
            <h1>从 1000+ 设计师原创印花裙中，挑出你的下一件</h1>
            <p className="lead">水墨、几何、花卉、扎染……每一件都来自真人设计师，参与众定即可锁定排产。</p>
          </div>
          <div className="galleryHero__stats">
            <div><b>1,238</b><small>原创印花</small></div>
            <div><b>128</b><small>签约设计师</small></div>
            <div><b>56</b><small>正在众定</small></div>
          </div>
        </div>
      </section>

      <section className="galleryFilters">
        <div className="container">
          <div className="chipRow">
            {productFilters.map((filter) => (
              <button
                key={filter.id}
                type="button"
                className={`chip ${active === filter.id ? "is-active" : ""}`}
                onClick={() => setFilter(filter.id)}
              >
                {CHIP_LABELS[filter.id]}
              </button>
            ))}
            <span className="chipDivider" />
            <button type="button" className="chip">真丝</button>
            <button type="button" className="chip">针织</button>
            <button type="button" className="chip">高级混纺</button>
            <button type="button" className="chip chip--dropdown">价格区间 ▾</button>
            <span className="chipSpacer" />
            <button type="button" className="chip chip--sort">排序：热门 ▾</button>
          </div>
        </div>
      </section>

      <section className="hotGroupStrip">
        <div className="container">
          <div className="hotGroupHead">
            <h2>
              <span className="en">Hot Group Buys</span>
              <span className="cn">热销榜单</span>
            </h2>
            <a href="/#hot" className="more">查看全部 →</a>
          </div>
          <div className="hotGroupRow">
            {hotItems.map((it) => {
              const progress = Math.min(
                100,
                Math.round((it.product.joined / it.product.target) * 100)
              );
              return (
                <Link
                  key={it.product.id}
                  href={`/products/${it.product.id}`}
                  className="hotMiniCard"
                >
                  <div className={`hotMiniMedia tone-${it.product.tone}`}>
                    <AssetImage
                      src={it.product.image}
                      alt={it.product.name}
                      tone={it.product.tone}
                      label={it.product.name.slice(0, 4)}
                      className="hotMiniImg"
                    />
                  </div>
                  <div className="hotMiniBody">
                    <div className="hotMiniName">{it.product.name}</div>
                    <div className="hotMiniMeta">
                      <span className="hotMiniPrice">{it.product.price.split("–")[0]}</span>
                      <span className="hotMiniProgress">已拼 {progress}%</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="galleryGridSection">
        <div className="container galleryWithSide">
          <div className="galleryGrid">
            {items.map(({ product }) => {
              const designer = DESIGNER_BY_TONE[product.tone] ?? "MaxLuLu Studio";
              return (
                <Link
                  className="galleryCard"
                  href={`/products/${product.id}`}
                  key={product.id}
                >
                  <div className={`galleryCard__media tone-${product.tone}`}>
                    <AssetImage
                      src={product.image}
                      alt={product.name}
                      tone={product.tone}
                      label={product.name.slice(0, 4)}
                      className="galleryCard__image"
                    />
                    <div className="galleryCard__icons" onClick={(e) => e.preventDefault()}>
                      <button type="button" className="iconBtn" aria-label="收藏">
                        ♡
                      </button>
                      <button type="button" className="iconBtn" aria-label="加入衣橱">
                        ❑
                      </button>
                    </div>
                  </div>
                  <div className="galleryCard__body">
                    <div className="galleryCard__name">{product.name}</div>
                    <div className="galleryCard__price">
                      {product.price.split("–")[0]}
                    </div>
                    <div className="galleryCard__designer">{designer}</div>
                  </div>
                </Link>
              );
            })}
          </div>

          <aside className="gallerySide">
            <div className="gallerySideCard">
              <div className="gallerySideCard__head">
                <b>推荐设计师</b>
                <Link href="/studio/join">入驻 →</Link>
              </div>
              <div className="gallerySideDesigners">
                {[
                  { name: "Luna", studio: "MaxLuLu Studio", works: 23, fans: "4.2K", tone: "ink" },
                  { name: "Yuki", studio: "Yuki Atelier", works: 18, fans: "2.8K", tone: "blue" },
                  { name: "Reine", studio: "Atelier Reine", works: 31, fans: "5.6K", tone: "wine" },
                  { name: "Mei", studio: "Mei Botanical", works: 14, fans: "1.9K", tone: "green" },
                ].map((d) => (
                  <div key={d.name} className="gallerySideDesigner">
                    <span className={`gallerySideAvatar tone-${d.tone}`}>{d.name.slice(0, 1)}</span>
                    <div>
                      <b>{d.name}</b>
                      <small>{d.studio} · {d.works} 件作品</small>
                    </div>
                    <em>+ 关注</em>
                  </div>
                ))}
              </div>
            </div>

            <div className="gallerySideCard">
              <div className="gallerySideCard__head"><b>印花风格</b></div>
              <div className="gallerySideTags">
                {["水墨晕染", "几何拼接", "热带花卉", "扎染", "工笔花鸟", "复古条纹"].map((t) => (
                  <span key={t}>{t}</span>
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

            <div className="gallerySideCard galleryJoinCta">
              <b>成为设计师</b>
              <p>分享你的印花，获得每单 30% 分润。</p>
              <Link href="/studio/join">了解入驻 →</Link>
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
