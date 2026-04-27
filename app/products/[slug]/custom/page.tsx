import Link from "next/link";
import AssetImage from "@/components/AssetImage";
import { getProductDetail } from "@/lib/product-detail-data";
import "./custom.css";

type Props = {
  params: Promise<{ slug: string }>;
};

const PATTERNS: Array<{ id: string; name: string; tone: string }> = [
  { id: "ink", name: "墨韵山茶", tone: "ink" },
  { id: "camellia", name: "山茶绯红", tone: "camellia" },
  { id: "blue", name: "海风蓝调", tone: "blue" },
  { id: "wine", name: "酒红玫瑰", tone: "wine" },
  { id: "coffee", name: "咖色复古", tone: "coffee" },
  { id: "rose", name: "玫粉印象", tone: "rose" },
  { id: "green", name: "墨绿植物", tone: "green" },
  { id: "gold", name: "鎏金花园", tone: "gold" },
  { id: "cream", name: "奶咖几何", tone: "cream" },
  { id: "mauve", name: "雾紫扎染", tone: "mauve" },
  { id: "olive", name: "橄榄印花", tone: "olive" },
  { id: "charcoal", name: "炭黑水墨", tone: "charcoal" },
];

const FABRICS = [
  { id: "knit", name: "弹力针织印花", desc: "抗皱 · 修身", price: 0, sample: "knit" },
  { id: "silk", name: "醋酸真丝缎", desc: "垂感 · 凉爽", price: 280, sample: "silk" },
  { id: "linen", name: "亚麻棉混纺", desc: "透气 · 自然", price: 120, sample: "linen" },
  { id: "blend", name: "高定混纺", desc: "挺括 · 高级", price: 380, sample: "blend" },
];

const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "定制尺寸"];

const CRAFTS = [
  { id: "std", name: "标准工艺", desc: "高定剪裁 · 14 天", delta: 0 },
  { id: "embro", name: "刺绣点缀", desc: "局部刺绣 · +5 天", delta: 280 },
  { id: "hand", name: "手工蕾丝", desc: "手工拼接 · +7 天", delta: 480 },
];

export default async function CustomOrderPage({ params }: Props) {
  const { slug } = await params;
  const detail = getProductDetail(slug);

  if (!detail) {
    return (
      <main className="page-wrap cstPage">
        <nav className="nav">
          <div className="container inner">
            <Link href="/" className="nav-logo">MaxLuLu <span className="ai">AI</span></Link>
            <div className="nav-center"><Link href="/products">灵感画廊</Link></div>
          </div>
        </nav>
        <div className="container" style={{ marginTop: 40 }}>
          <h1>未找到该款式</h1>
          <p><Link href="/products">返回灵感画廊</Link></p>
        </div>
      </main>
    );
  }

  const { product } = detail;
  const basePrice = parseInt(product.price.split("–")[0].replace(/[^0-9]/g, ""), 10) || 599;
  const totalEstimate = basePrice + 280 + 0; // base + silk + std craft (defaults)

  return (
    <main className="page-wrap cstPage">
      <nav className="nav">
        <div className="container inner">
          <Link href="/" className="nav-logo">MaxLuLu <span className="ai">AI</span></Link>
          <div className="nav-center">
            <Link href="/products">灵感画廊</Link>
            <Link href="/products">个性定制</Link>
            <Link href="/my">我的衣橱</Link>
          </div>
          <div className="nav-right">
            <Link href="/my">购物车</Link>
            <Link href="/studio/join" className="designer-btn">设计师入驻</Link>
          </div>
        </div>
      </nav>

      <div className="container">
        <div className="cstCrumbs">
          <Link href="/products">灵感画廊</Link>
          <span className="sep">›</span>
          <Link href={`/products/${product.id}`}>{product.name}</Link>
          <span className="sep">›</span>
          <span className="current">个人定制</span>
        </div>

        <div className="cstHeader">
          <div className="cstHeader__title">
            <p className="eyebrow">PERSONAL CUSTOMIZATION · 个人定制</p>
            <h1>定制属于你的{product.name}</h1>
          </div>
          <div className="cstHeader__steps">
            <div className="cstStep is-current"><b>1</b><span>选择印花</span></div>
            <div className="cstStep"><b>2</b><span>选择面料</span></div>
            <div className="cstStep"><b>3</b><span>尺码与工艺</span></div>
            <div className="cstStep"><b>4</b><span>提交定制</span></div>
          </div>
        </div>

        <div className="cstGrid">
          <aside className="cstAside">
            <b>定制步骤</b>
            <a href="#step-print" className="is-active"><span>① 选择印花</span><small>12</small></a>
            <a href="#step-fabric"><span>② 选择面料</span><small>4</small></a>
            <a href="#step-color"><span>③ 配色</span><small>8</small></a>
            <a href="#step-size"><span>④ 尺码</span><small>7</small></a>
            <a href="#step-craft"><span>⑤ 工艺细节</span><small>3</small></a>
            <a href="#step-note"><span>⑥ 备注</span><small></small></a>
          </aside>

          <section className="cstMain">
            <article className="cstCard" id="step-preview">
              <div className="cstPreview">
                <div className={`cstPreview__media tone-${product.tone}`}>
                  <AssetImage
                    src={product.image}
                    alt={product.name}
                    tone={product.tone}
                    label={product.name.slice(0, 4)}
                    className="cstPreview__img"
                  />
                </div>
                <div className="cstPreview__body">
                  <div>
                    <b>{product.name}</b>
                    <small>编号 MU-CR{product.id.slice(0, 4).toUpperCase()}</small>
                  </div>
                  <div className="cstPreview__attrs">
                    <span>原价：<b>¥999</b></span>
                    <span>设计师：<b>Lulu</b></span>
                    <span>众定价：<b>¥{basePrice}</b></span>
                    <span>定制周期：<b>14 天</b></span>
                  </div>
                  <p style={{ margin: 0, fontSize: 12, color: "var(--text2)", lineHeight: 1.7 }}>
                    {detail.heroNote}
                  </p>
                </div>
              </div>
            </article>

            <article className="cstCard" id="step-print">
              <div className="cstCard__head">
                <h2>① 选择印花图案</h2>
                <span className="more">12 款可选 · 不同图案不影响价格</span>
              </div>
              <div className="cstSwatchGrid">
                {PATTERNS.map((p, i) => (
                  <button
                    key={p.id}
                    type="button"
                    className={`cstSwatch cstSwatch--${p.tone} ${i === 0 ? "is-active" : ""}`}
                  >
                    <span className="cstSwatch__label">{p.name}</span>
                  </button>
                ))}
              </div>
            </article>

            <article className="cstCard" id="step-fabric">
              <div className="cstCard__head">
                <h2>② 选择面料</h2>
                <span className="more">含寄样服务（订单确认后发样）</span>
              </div>
              <div className="cstFabricGrid">
                {FABRICS.map((f, i) => (
                  <button
                    key={f.id}
                    type="button"
                    className={`cstFabric ${i === 1 ? "is-active" : ""}`}
                  >
                    <div className={`cstFabric__sample cstFabric--${f.sample}`} />
                    <b>{f.name}</b>
                    <small>{f.desc}</small>
                    <em>{f.price === 0 ? "包含" : `+ ¥${f.price}`}</em>
                  </button>
                ))}
              </div>
            </article>

            <article className="cstCard" id="step-size">
              <div className="cstCard__head">
                <h2>③ 尺码 · 配色 · 数量</h2>
                <Link href="/size-guide">尺码助手 →</Link>
              </div>

              <div style={{ marginBottom: 14 }}>
                <small style={{ display: "block", fontSize: 12, color: "var(--text2)", marginBottom: 8 }}>尺码</small>
                <div className="cstSizes">
                  {SIZES.map((s, i) => (
                    <button key={s} type="button" className={`cstSize ${i === 1 ? "is-active" : ""}`}>{s}</button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <small style={{ display: "block", fontSize: 12, color: "var(--text2)", marginBottom: 8 }}>底色</small>
                <div className="cstSwatchGrid" style={{ gridTemplateColumns: "repeat(8, minmax(0, 40px))" }}>
                  {(["ink", "blue", "wine", "rose", "green", "gold", "cream", "mauve"] as const).map((t, i) => (
                    <button
                      key={t}
                      type="button"
                      className={`cstSwatch cstSwatch--${t} ${i === 0 ? "is-active" : ""}`}
                      style={{ aspectRatio: 1, height: 40 }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <small style={{ display: "block", fontSize: 12, color: "var(--text2)", marginBottom: 8 }}>数量</small>
                <div style={{ display: "inline-flex", alignItems: "center", border: "1px solid var(--border)", borderRadius: 999, background: "var(--bg-soft)" }}>
                  <button type="button" style={{ width: 32, height: 32, border: "none", background: "transparent", cursor: "pointer" }}>−</button>
                  <span style={{ minWidth: 32, textAlign: "center", fontSize: 13, color: "var(--text)" }}>1</span>
                  <button type="button" style={{ width: 32, height: 32, border: "none", background: "transparent", cursor: "pointer" }}>+</button>
                </div>
              </div>
            </article>

            <article className="cstCard" id="step-craft">
              <div className="cstCard__head">
                <h2>④ 工艺与细节</h2>
                <span className="more">不同工艺影响交付时间</span>
              </div>
              <div className="cstCraftRow">
                {CRAFTS.map((c, i) => (
                  <button key={c.id} type="button" className={`cstCraft ${i === 0 ? "is-active" : ""}`}>
                    <b>{c.name}</b>
                    <small>{c.desc}</small>
                    <em style={{ fontStyle: "normal", fontSize: 11, color: "var(--gold)" }}>{c.delta === 0 ? "包含" : `+ ¥${c.delta}`}</em>
                  </button>
                ))}
              </div>
            </article>

            <article className="cstCard" id="step-note">
              <div className="cstCard__head">
                <h2>⑤ 定制备注</h2>
                <span className="more">设计师将根据备注微调工艺单</span>
              </div>
              <textarea
                placeholder="例如：腰身收紧 1 cm；下摆改 7 分；袖口加扣襻；偏好深色 lining 等。"
                style={{
                  width: "100%",
                  minHeight: 100,
                  padding: 12,
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  background: "var(--bg-soft)",
                  fontFamily: "inherit",
                  fontSize: 13,
                  color: "var(--text)",
                  resize: "vertical",
                }}
              />
            </article>
          </section>

          <aside className="cstSummary">
            <h2>定制配置</h2>
            <div className="cstSummary__pickedRow">
              <div className="row"><span>印花</span><b>墨韵山茶</b></div>
              <div className="row"><span>面料</span><b>醋酸真丝缎</b></div>
              <div className="row"><span>尺码</span><b>S · 标准</b></div>
              <div className="row"><span>底色</span><b>墨黑</b></div>
              <div className="row"><span>工艺</span><b>标准剪裁</b></div>
              <div className="row"><span>预计交付</span><b>14 天</b></div>
            </div>

            <div className="cstSummary__priceRow">
              <div className="row"><span>裙身基础价</span><b>¥{basePrice}</b></div>
              <div className="row"><span>面料升级</span><b>+ ¥280</b></div>
              <div className="row"><span>工艺定制</span><b>包含</b></div>
              <div className="row"><span>设计师签名工艺单</span><span className="gold">免费</span></div>
            </div>
            <div className="cstSummary__divider" />
            <div className="cstTotal">
              <span>预计总价</span>
              <strong>¥{totalEstimate.toLocaleString()}</strong>
            </div>
            <button type="button" className="cstCta">提交定制订单</button>
            <Link href={`/group-buy/${product.id}`} className="cstCtaGhost" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              改为参团 ¥{basePrice}
            </Link>
            <div className="cstReassure">
              <span>付款后 24 小时内排产开工</span>
              <span>未排产前可改尺码 / 备注</span>
              <span>30 天无忧退换</span>
              <span>顺丰包邮 · 含设计师工艺单</span>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
