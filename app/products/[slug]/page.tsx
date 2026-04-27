import Link from "next/link";
import AssetImage from "@/components/AssetImage";
import {
  getProductDetail,
  getProductsBySeries,
} from "@/lib/product-detail-data";
import "../../product-pages.css";

type Props = {
  params: Promise<{ slug: string }>;
};

const SIZES = ["S", "M", "L", "XL", "XXL"];
const COLORS: Array<{ name: string; hex: string }> = [
  { name: "墨黑", hex: "#1f1c1a" },
  { name: "雾灰", hex: "#9a9690" },
  { name: "茶棕", hex: "#8a6a4a" },
  { name: "霜白", hex: "#ece6dc" },
  { name: "酒红", hex: "#7a2030" },
];

function DetailProgress({ joined, target }: { joined: number; target: number }) {
  const progress = Math.min(100, Math.round((joined / target) * 100));
  return (
    <div className="pdpProgress">
      <div className="pdpProgress__head">
        <span>众定进度</span>
        <b>{progress}%</b>
      </div>
      <div className="pdpProgress__bar">
        <em style={{ width: `${progress}%` }} />
      </div>
      <div className="pdpProgress__meta">
        <span>已拼 {joined} / {target} 人</span>
        <span>剩余 18 小时 26 分</span>
      </div>
    </div>
  );
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
  const detail = getProductDetail(slug);

  if (!detail) {
    return (
      <main className="productPage productNotFound">
        <GalleryNav slug={slug} />
        <Link className="productBack" href="/products">
          ← 返回灵感画廊
        </Link>
        <h1>没有找到这条连衣裙</h1>
        <p>可以先回到灵感画廊，查看正在众定的针织印花裙。</p>
      </main>
    );
  }

  const { product } = detail;

  // Designer's other works (up to 4 from same series, excluding current)
  const otherWorks = getProductsBySeries(detail.series)
    .filter((p) => p.product.id !== product.id)
    .slice(0, 4);

  // "You may also like" — 5 from other series
  const recommend = getProductsBySeries("all")
    .filter((p) => p.product.id !== product.id && p.series !== detail.series)
    .slice(0, 5);

  const basePrice = product.price.split("–")[0]?.trim() ?? product.price;
  const premiumPrice = product.price.split("–")[1]?.trim()
    ? `¥${product.price.split("–")[1].trim().replace(/^¥/, "")}`
    : "¥1,999";

  return (
    <main className="page-wrap pdpPage">
      <GalleryNav slug={product.id} />

      <div className="pdpCrumbs container">
        <Link href="/products">灵感画廊</Link>
        <span className="sep">›</span>
        <Link href={`/products?filter=${detail.series}`}>{detail.seriesLabel}</Link>
        <span className="sep">›</span>
        <span className="current">{product.name}</span>
      </div>

      <section className="pdpHero container">
        <aside className="pdpThumbCol">
          {detail.gallery.map((src, i) => (
            <button
              key={src}
              type="button"
              className={`pdpThumb ${i === 0 ? "is-active" : ""}`}
              aria-label={`图 ${i + 1}`}
            >
              <AssetImage
                src={src}
                alt={`${product.name} 图${i + 1}`}
                tone={product.tone}
                label={["主图", "版型", "印花", "细节"][i] ?? "细节"}
                className="pdpThumb__img"
              />
            </button>
          ))}
        </aside>

        <div className="pdpMainMedia">
          <div className={`pdpMainMedia__frame tone-${product.tone}`}>
            <AssetImage
              src={detail.gallery[0]}
              alt={product.name}
              tone={product.tone}
              label={product.name.slice(0, 4)}
              className="pdpMainMedia__img"
            />
            <span className="pdpBadge">众定中</span>
            <button type="button" className="pdpZoom" aria-label="放大">⤢</button>
          </div>
        </div>

        <div className="pdpInfo">
          <div className="pdpInfo__topRow">
            <div className="pdpTags">
              <span className="pdpTag pdpTag--gold">{detail.seriesLabel}</span>
              <span className="pdpTag">新款上线</span>
            </div>
            <div className="pdpIcons">
              <button type="button" aria-label="收藏">♡</button>
              <button type="button" aria-label="分享">↗</button>
            </div>
          </div>

          <h1 className="pdpTitle">{product.name}</h1>
          <p className="pdpCode">编号 MU-{product.id.slice(0, 4).toUpperCase()}-{String(product.joined).padStart(4, "0")}</p>
          <p className="pdpLead">{detail.heroNote}</p>

          <div className="pdpPriceTabs">
            <div className="pdpPriceCard is-active">
              <small>起拼价 · 众定 30 人成团</small>
              <strong>{basePrice}</strong>
              <span>原价 ¥999 · 立省 ¥{Math.max(0, 999 - parseInt(basePrice.replace(/[^0-9]/g, ""), 10))}</span>
            </div>
            <div className="pdpPriceCard">
              <small>个人定制价 · 7 天交付</small>
              <strong>{premiumPrice}</strong>
              <span>面料/工艺可调，限量 50 件</span>
            </div>
          </div>

          <DetailProgress joined={product.joined} target={product.target} />

          <div className="pdpDesigner">
            <div className="pdpDesigner__avatar" aria-hidden>
              <AssetImage
                src={detail.gallery[1] ?? detail.gallery[0]}
                alt="设计师"
                tone={product.tone}
                label="LU"
                className="pdpDesigner__img"
              />
            </div>
            <div className="pdpDesigner__body">
              <small>设计师</small>
              <b>Luna · MaxLuLu Studio</b>
              <span>巴黎 · 23 件作品 · 4.9 分</span>
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
            <Link className="pdpCtaPrimary" href={`/group-buy/${product.id}`}>
              立即参团
            </Link>
            <Link className="pdpCtaSecondary" href={`/products/${product.id}/custom`}>
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
          <button type="button" className="pdpTabBtn">评价 (128)</button>
          <button type="button" className="pdpTabBtn">尺码与生产</button>
        </div>

        <div className="pdpTabPanel">
          <div className="pdpTwoCol">
            <article className="pdpStory">
              <p className="eyebrow">PRINT STORY · 印花故事</p>
              <h3>{detail.seriesLabel}</h3>
              <p>{detail.printStory}</p>
              <ul>
                {detail.bodyBenefits.slice(0, 3).map((b) => (
                  <li key={b}>· {b}</li>
                ))}
              </ul>
            </article>
            <article className="pdpStory">
              <p className="eyebrow">FABRIC · 面料说明</p>
              <h3>针织印花面料</h3>
              <p>{detail.fabricStory}</p>
              <ul>
                {detail.fitNotes.slice(0, 3).map((b) => (
                  <li key={b}>· {b}</li>
                ))}
              </ul>
            </article>
          </div>

          <div className="pdpSpecGrid">
            {detail.specs.slice(0, 6).map((s) => (
              <div key={s.label} className="pdpSpecBox">
                <span>{s.label}</span>
                <strong>{s.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pdpRelated container">
        <div className="pdpRelated__head">
          <div>
            <p className="eyebrow">DESIGNER WORKS</p>
            <h2>设计师 Luna 的其他作品</h2>
          </div>
          <Link href="/products">查看全部 →</Link>
        </div>
        <div className="pdpRelatedGrid">
          {otherWorks.map(({ product: p }) => (
            <Link key={p.id} href={`/products/${p.id}`} className="pdpRelatedCard">
              <div className={`pdpRelatedCard__media tone-${p.tone}`}>
                <AssetImage
                  src={p.image}
                  alt={p.name}
                  tone={p.tone}
                  label={p.name.slice(0, 4)}
                  className="pdpRelatedCard__img"
                />
              </div>
              <div className="pdpRelatedCard__body">
                <span>{p.name}</span>
                <b>{p.price.split("–")[0]}</b>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="pdpReviews container">
        <div className="pdpReviews__head">
          <div>
            <p className="eyebrow">REVIEWS · 用户评价</p>
            <h2>评价 4.9 / 5.0 · 128 条</h2>
          </div>
          <div className="pdpRatings">
            {[5, 4, 3, 2, 1].map((stars) => {
              const pct = stars === 5 ? 78 : stars === 4 ? 16 : stars === 3 ? 4 : stars === 2 ? 1 : 1;
              return (
                <div key={stars} className="pdpRating">
                  <span>{stars}★</span>
                  <i><em style={{ width: `${pct}%` }} /></i>
                  <b>{pct}%</b>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pdpReviewList">
          {[
            { name: "L. 小满", body: "面料垂感很好，腰线收得自然，通勤晚宴都能 hold。", rating: 5 },
            { name: "Yuki", body: "印花配色低调有质感，比预期更合身，建议常码。", rating: 5 },
            { name: "Chloe", body: "众定流程透明，提前两周收到，包装也很用心。", rating: 4 },
          ].map((r) => (
            <article key={r.name} className="pdpReview">
              <div className="pdpReview__head">
                <span className="pdpReview__avatar">{r.name.slice(0, 1)}</span>
                <div>
                  <b>{r.name}</b>
                  <small>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</small>
                </div>
              </div>
              <p>{r.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="pdpRelated container">
        <div className="pdpRelated__head">
          <div>
            <p className="eyebrow">YOU MAY ALSO LIKE</p>
            <h2>你可能也喜欢</h2>
          </div>
          <Link href="/products">看更多 →</Link>
        </div>
        <div className="pdpRelatedGrid pdpRelatedGrid--5">
          {recommend.map(({ product: p }) => (
            <Link key={p.id} href={`/products/${p.id}`} className="pdpRelatedCard">
              <div className={`pdpRelatedCard__media tone-${p.tone}`}>
                <AssetImage
                  src={p.image}
                  alt={p.name}
                  tone={p.tone}
                  label={p.name.slice(0, 4)}
                  className="pdpRelatedCard__img"
                />
              </div>
              <div className="pdpRelatedCard__body">
                <span>{p.name}</span>
                <b>{p.price.split("–")[0]}</b>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
