import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import DetailActions from "./DetailActions";
import "../../product-pages.css";

type Props = {
  params: Promise<{ slug: string }>;
};

interface DesignerInfo {
  id: string;
  name: string | null;
  avatar: string | null;
  bio: string | null;
}

interface DesignDetail {
  id: string;
  title: string;
  description: string | null;
  images: string[];
  patternImage: string | null;
  skirtType: string;
  neckline: string | null;
  sleeveType: string | null;
  skirtLength: string | null;
  fabric: string;
  styleTags: string[];
  groupPrice: number;
  customPrice: number;
  costBreakdown: string | null;
  status: string;
  viewCount: number;
  likeCount: number;
  favoriteCount: number;
  orderCount: number;
  commentCount: number;
  publishedAt: string | null;
  designer: DesignerInfo;
  isLiked: boolean;
  isFavorited: boolean;
}

async function fetchDetail(slug: string): Promise<DesignDetail | null> {
  const h = await headers();
  const host = h.get("host") || "localhost:3000";
  const proto = h.get("x-forwarded-proto") || "http";
  const cookie = h.get("cookie") || "";
  try {
    const res = await fetch(`${proto}://${host}/api/designs/${slug}`, {
      headers: cookie ? { cookie } : undefined,
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.design as DesignDetail;
  } catch {
    return null;
  }
}

const SIZES = ["S", "M", "L", "XL", "XXL"];
const COLORS: Array<{ name: string; hex: string }> = [
  { name: "墨黑", hex: "#1f1c1a" },
  { name: "雾灰", hex: "#9a9690" },
  { name: "茶棕", hex: "#8a6a4a" },
  { name: "霜白", hex: "#ece6dc" },
  { name: "酒红", hex: "#7a2030" },
];

function fmtPrice(cents: number): string {
  if (!cents || cents <= 0) return "¥—";
  return `¥${cents.toLocaleString()}`;
}

function GalleryNav({ slug }: { slug: string }) {
  return (
    <nav className="nav">
      <div className="container inner">
        <Link href="/" className="nav-logo">
          MaxLuLu <span className="ai">AI</span>
        </Link>
        <div className="nav-center">
          <Link href="/products">灵感画廊</Link>
          <Link href="/products">个性定制</Link>
          <Link href="/my">我的衣橱</Link>
          <Link href={`/group-buy/${slug}`}>加入团购</Link>
        </div>
        <div className="nav-right">
          <a href="#share">分享</a>
          <Link href="/studio/join" className="designer-btn">设计师入驻</Link>
        </div>
      </div>
    </nav>
  );
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const detail = await fetchDetail(slug);

  if (!detail) {
    notFound();
  }

  const heroImage = detail.images[0] || "";
  const initials = detail.title.slice(0, 4);

  return (
    <main className="page-wrap pdpPage">
      <GalleryNav slug={detail.id} />

      <div className="pdpCrumbs container">
        <Link href="/products">灵感画廊</Link>
        <span className="sep">›</span>
        <Link href={`/products?category=${detail.skirtType}`}>{detail.skirtType}</Link>
        <span className="sep">›</span>
        <span className="current">{detail.title}</span>
      </div>

      <section className="pdpHero container">
        <aside className="pdpThumbCol">
          {detail.images.slice(0, 4).map((src, i) => (
            <button
              key={src + i}
              type="button"
              className={`pdpThumb ${i === 0 ? "is-active" : ""}`}
              aria-label={`图 ${i + 1}`}
            >
              {src ? (
                <img src={src} alt={`${detail.title} 图${i + 1}`} className="pdpThumb__img" />
              ) : (
                <div className="pdpThumb__img" style={{ display: "grid", placeItems: "center", color: "rgba(255,255,255,0.6)", fontSize: 12 }}>
                  {["主图", "版型", "印花", "细节"][i] ?? "细节"}
                </div>
              )}
            </button>
          ))}
        </aside>

        <div className="pdpMainMedia">
          <div className="pdpMainMedia__frame tone-ink">
            {heroImage ? (
              <img src={heroImage} alt={detail.title} className="pdpMainMedia__img" />
            ) : (
              <div className="pdpMainMedia__img" style={{ display: "grid", placeItems: "center", color: "rgba(255,255,255,0.55)", fontFamily: "var(--font-display)", fontSize: 28 }}>
                {initials}
              </div>
            )}
            <span className="pdpBadge">众定中</span>
            <button type="button" className="pdpZoom" aria-label="放大">⤢</button>
          </div>
        </div>

        <div className="pdpInfo">
          <div className="pdpInfo__topRow">
            <div className="pdpTags">
              <span className="pdpTag pdpTag--gold">{detail.skirtType}</span>
              {detail.styleTags.slice(0, 1).map((t) => (
                <span key={t} className="pdpTag">{t}</span>
              ))}
            </div>
            <DetailActions
              designId={detail.id}
              initialLiked={detail.isLiked}
              initialFavorited={detail.isFavorited}
              initialLikeCount={detail.likeCount}
              initialCommentCount={detail.commentCount}
            />
          </div>

          <h1 className="pdpTitle">{detail.title}</h1>
          <p className="pdpCode">编号 MU-{detail.id.slice(0, 8).toUpperCase()}</p>
          {detail.description && <p className="pdpLead">{detail.description}</p>}

          <div className="pdpPriceTabs">
            <div className="pdpPriceCard is-active">
              <small>起拼价 · 众定 30 人成团</small>
              <strong>{fmtPrice(detail.groupPrice)}</strong>
              <span>原价 {fmtPrice(detail.customPrice)} · 立省 {fmtPrice(Math.max(0, detail.customPrice - detail.groupPrice))}</span>
            </div>
            <div className="pdpPriceCard">
              <small>个人定制价 · 7 天交付</small>
              <strong>{fmtPrice(detail.customPrice)}</strong>
              <span>面料/工艺可调</span>
            </div>
          </div>

          <div className="pdpProgress">
            <div className="pdpProgress__head">
              <span>已下单</span>
              <b>{detail.orderCount} 件</b>
            </div>
            <div className="pdpProgress__bar">
              <em style={{ width: `${Math.min(100, Math.round((detail.orderCount / 30) * 100))}%` }} />
            </div>
            <div className="pdpProgress__meta">
              <span>♡ {detail.likeCount} 点赞 · ★ {detail.favoriteCount} 收藏</span>
              <span>👁 {detail.viewCount} 浏览</span>
            </div>
          </div>

          <div className="pdpDesigner">
            <div className="pdpDesigner__avatar" aria-hidden>
              {detail.designer.avatar ? (
                <img src={detail.designer.avatar} alt={detail.designer.name ?? ""} className="pdpDesigner__img" />
              ) : (
                <div className="pdpDesigner__img" style={{ display: "grid", placeItems: "center", color: "rgba(255,255,255,0.7)", fontFamily: "var(--font-display)" }}>
                  {(detail.designer.name ?? "L").slice(0, 1)}
                </div>
              )}
            </div>
            <div className="pdpDesigner__body">
              <small>设计师</small>
              <b>{detail.designer.name ?? "MaxLuLu Studio"}</b>
              {detail.designer.bio && <span>{detail.designer.bio}</span>}
            </div>
            <button type="button" className="pdpDesigner__follow">+ 关注</button>
          </div>

          <div className="pdpPicker">
            <div className="pdpPicker__head">
              <b>尺码</b>
              <Link href="/size-guide">尺码助手 →</Link>
            </div>
            <div className="pdpPicker__chips">
              {SIZES.map((s, i) => (
                <button
                  key={s}
                  type="button"
                  className={`pdpChip ${i === 1 ? "is-active" : ""}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="pdpPicker">
            <div className="pdpPicker__head">
              <b>配色</b>
              <span>5 种可选</span>
            </div>
            <div className="pdpPicker__swatches">
              {COLORS.map((c, i) => (
                <button
                  key={c.name}
                  type="button"
                  className={`pdpSwatch ${i === 0 ? "is-active" : ""}`}
                  style={{ background: c.hex }}
                  title={c.name}
                  aria-label={c.name}
                />
              ))}
            </div>
          </div>

          <div className="pdpCtaRow pdpCtaRow--3">
            <Link className="pdpCtaPrimary" href={`/group-buy/${detail.id}`}>
              立即参团
            </Link>
            <Link className="pdpCtaSecondary" href={`/products/${detail.id}/custom`}>
              个人定制
            </Link>
            <button type="button" className="pdpCtaIcon" aria-label="加入衣橱">♡</button>
          </div>

          <ul className="pdpTrust">
            <li>✓ 30 天无忧退换</li>
            <li>✓ 顺丰包邮</li>
            <li>✓ 不成团全额退款</li>
          </ul>
        </div>
      </section>

      <section className="pdpTabs container">
        <div className="pdpTabs__bar">
          <button type="button" className="pdpTabBtn is-active">商品详情</button>
          <button type="button" className="pdpTabBtn">设计说明</button>
          <button type="button" className="pdpTabBtn">评价 ({detail.commentCount})</button>
          <button type="button" className="pdpTabBtn">尺码与生产</button>
        </div>

        <div className="pdpTabPanel">
          <div className="pdpTwoCol">
            <article className="pdpStory">
              <p className="eyebrow">PRINT STORY · 印花故事</p>
              <h3>{detail.title}</h3>
              <p>{detail.description ?? "本款由签约设计师独立创作，灵感与配色均来自原创。"}</p>
              {detail.styleTags.length > 0 && (
                <ul>
                  {detail.styleTags.slice(0, 4).map((t) => (
                    <li key={t}>· {t}</li>
                  ))}
                </ul>
              )}
            </article>
            <article className="pdpStory">
              <p className="eyebrow">FABRIC · 面料</p>
              <h3>{detail.fabric}</h3>
              <p>{detail.costBreakdown ?? "面料按设计师指定规格采购，工艺细节按工艺单严格执行。"}</p>
              <ul>
                {detail.neckline && <li>· 领型：{detail.neckline}</li>}
                {detail.sleeveType && <li>· 袖型：{detail.sleeveType}</li>}
                {detail.skirtLength && <li>· 长度：{detail.skirtLength}</li>}
              </ul>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}
