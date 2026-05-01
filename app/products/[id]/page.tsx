import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import ConsumerNav from "@/components/ConsumerNav";
import DetailActions from "./DetailActions";
import {
  zhSkirtType,
  zhFabric,
  zhNeckline,
  zhSleeve,
  zhLength,
  toneFromId,
  type Tone,
} from "@/lib/design-i18n";
import "../../product-pages.css";

type Props = {
  params: Promise<{ id: string }>;
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

async function fetchDetail(id: string): Promise<DesignDetail | null> {
  const h = await headers();
  const host = h.get("host") || "localhost:3000";
  const proto = h.get("x-forwarded-proto") || "http";
  const cookie = h.get("cookie") || "";
  try {
    const res = await fetch(`${proto}://${host}/api/designs/${id}`, {
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

const THUMB_LABELS = ["主图", "版型", "印花", "细节"];

function fmtPrice(cents: number): string {
  if (!cents || cents <= 0) return "¥—";
  return `¥${cents.toLocaleString()}`;
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  const detail = await fetchDetail(id);

  if (!detail) {
    notFound();
  }

  const tone: Tone = toneFromId(detail.id);
  const heroImage = detail.images[0] || "";
  const initials = detail.title.slice(0, 4);
  const code = `MU-${detail.id.slice(0, 8).toUpperCase()}`;
  const skirtZh = zhSkirtType(detail.skirtType) ?? detail.skirtType;
  const fabricZh = zhFabric(detail.fabric) ?? detail.fabric;
  const necklineZh = zhNeckline(detail.neckline);
  const sleeveZh = zhSleeve(detail.sleeveType);
  const lengthZh = zhLength(detail.skirtLength);
  const savings = Math.max(0, detail.customPrice - detail.groupPrice);
  const groupProgress = Math.min(100, Math.round((detail.orderCount / 30) * 100));

  return (
    <main className="page-wrap pdpPage">
      <ConsumerNav variant="solid" />

      <div className="container pdpCrumbs">
        <Link href="/products">印花衣橱</Link>
        <span className="sep">›</span>
        <Link href={`/products?category=${detail.skirtType}`}>{skirtZh}</Link>
        <span className="sep">›</span>
        <span className="current">{detail.title}</span>
      </div>

      <section className="container pdpHero">
        <aside className="pdpThumbCol">
          {Array.from({ length: 4 }).map((_, i) => {
            const src = detail.images[i];
            const active = i === 0;
            return (
              <button
                key={i}
                type="button"
                className={`pdpThumb tone-${tone} ${active ? "is-active" : ""}`}
                aria-label={`图 ${i + 1}`}
              >
                {src ? (
                  <img src={src} alt={`${detail.title} 图${i + 1}`} className="pdpThumb__img" />
                ) : (
                  <span className="pdpThumb__ph">{THUMB_LABELS[i] ?? "细节"}</span>
                )}
              </button>
            );
          })}
        </aside>

        <div className="pdpMainMedia">
          <div className={`pdpMainMedia__frame tone-${tone}`}>
            {heroImage ? (
              <img src={heroImage} alt={detail.title} className="pdpMainMedia__img" />
            ) : (
              <span className="pdpMainMedia__ph">{initials}</span>
            )}
            <span className="pdpBadge">众定中</span>
            <button type="button" className="pdpZoom" aria-label="放大">⤢</button>
          </div>
        </div>

        <div className="pdpInfo">
          <div className="pdpInfo__topRow">
            <div className="pdpTags">
              <span className="pdpTag pdpTag--gold">{skirtZh}</span>
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
              groupPrice={detail.groupPrice}
              customPrice={detail.customPrice}
              slot="top"
            />
          </div>

          <div>
            <h1 className="pdpTitle">{detail.title}</h1>
            <p className="pdpCode">编号 {code}</p>
          </div>
          {detail.description && <p className="pdpLead">{detail.description}</p>}

          <div className="pdpPriceTabs">
            <div className="pdpPriceCard is-active">
              <small>起拼价 · 30 人成团</small>
              <strong>{fmtPrice(detail.groupPrice)}</strong>
              <span>原价 {fmtPrice(detail.customPrice)} · 立省 {fmtPrice(savings)}</span>
            </div>
            <div className="pdpPriceCard">
              <small>个人定制价 · 7 天交付</small>
              <strong>{fmtPrice(detail.customPrice)}</strong>
              <span>面料 / 工艺可调</span>
            </div>
          </div>

          <div className="pdpProgress">
            <div className="pdpProgress__head">
              <span>已下单</span>
              <b>{detail.orderCount} 件</b>
            </div>
            <div className="pdpProgress__bar">
              <em style={{ width: `${groupProgress}%` }} />
            </div>
            <div className="pdpProgress__meta">
              <span>♡ {detail.likeCount} · ★ {detail.favoriteCount}</span>
              <span>👁 {detail.viewCount}</span>
            </div>
          </div>

          <div className="pdpDesigner">
            <div className={`pdpDesigner__avatar tone-${tone}`} aria-hidden>
              {detail.designer.avatar ? (
                <img src={detail.designer.avatar} alt={detail.designer.name ?? ""} className="pdpDesigner__img" />
              ) : (
                <span className="pdpDesigner__ph">{(detail.designer.name ?? "L").slice(0, 1)}</span>
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
              <span>{COLORS.length} 种可选</span>
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
          </div>

          <ul className="pdpTrust">
            <li>✓ 30 天无忧退换</li>
            <li>✓ 顺丰包邮</li>
            <li>✓ 不成团全额退款</li>
          </ul>
        </div>
      </section>

      <section className="container pdpStorySection">
        <div className="pdpStorySection__head">
          <p className="eyebrow">PRINT STORY · 印花故事</p>
          <h2>{detail.title}</h2>
        </div>
        <div className="pdpStoryGrid">
          <article className="pdpStoryCard">
            <p>
              {detail.description ??
                "本款由签约设计师独立创作，灵感与配色均来自原创印花。每一件成衣均按工艺单严格执行，从面料到裁剪，都为你保留可追溯的故事。"}
            </p>
            {detail.styleTags.length > 0 && (
              <ul>
                {detail.styleTags.slice(0, 4).map((t) => (
                  <li key={t}>· {t}</li>
                ))}
              </ul>
            )}
          </article>
          <div className="pdpStoryShots">
            {Array.from({ length: 4 }).map((_, i) => {
              const src = detail.images[i + 1] ?? detail.patternImage ?? null;
              return (
                <div key={i} className={`pdpStoryShot tone-${tone}`}>
                  {src ? (
                    <img src={src} alt={`${detail.title} 细节 ${i + 1}`} className="pdpStoryShot__img" />
                  ) : (
                    <span className="pdpStoryShot__ph">{THUMB_LABELS[i] ?? "细节"}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="container pdpSpecSection">
        <div className="pdpSpecSection__head">
          <p className="eyebrow">FABRIC & CRAFT · 面料与工艺</p>
          <h2>{fabricZh} · {skirtZh}</h2>
        </div>
        <div className="pdpSpecGrid">
          <div className="pdpSpecBox">
            <span>面料</span>
            <strong>{fabricZh}</strong>
          </div>
          <div className="pdpSpecBox">
            <span>裙型</span>
            <strong>{skirtZh}</strong>
          </div>
          {necklineZh && (
            <div className="pdpSpecBox">
              <span>领型</span>
              <strong>{necklineZh}</strong>
            </div>
          )}
          {sleeveZh && (
            <div className="pdpSpecBox">
              <span>袖型</span>
              <strong>{sleeveZh}</strong>
            </div>
          )}
          {lengthZh && (
            <div className="pdpSpecBox">
              <span>长度</span>
              <strong>{lengthZh}</strong>
            </div>
          )}
          <div className="pdpSpecBox">
            <span>工艺</span>
            <strong>原创印花 · 工艺单签名</strong>
          </div>
        </div>
        {detail.costBreakdown && (
          <p className="pdpSpecNote">{detail.costBreakdown}</p>
        )}
      </section>

      <DetailActions
        designId={detail.id}
        initialLiked={detail.isLiked}
        initialFavorited={detail.isFavorited}
        initialLikeCount={detail.likeCount}
        initialCommentCount={detail.commentCount}
        groupPrice={detail.groupPrice}
        customPrice={detail.customPrice}
        slot="body"
      />
    </main>
  );
}
