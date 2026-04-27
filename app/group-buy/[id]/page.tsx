import Link from "next/link";
import AssetImage from "@/components/AssetImage";
import { getProductDetail } from "@/lib/product-detail-data";
import "../group-buy.css";

type Props = {
  params: Promise<{ id: string }>;
};

const ADDRESSES = [
  {
    id: "a1",
    name: "Edison Lu",
    phone: "186 **** 8898",
    addr: "上海市 静安区 南京西路 1788 号 恒隆广场 28 楼 2801",
    tag: "默认",
  },
  {
    id: "a2",
    name: "Lu Mum",
    phone: "138 **** 1234",
    addr: "杭州市 西湖区 文三路 391 号 西湖国际科技大厦 12F",
    tag: "",
  },
];

const COUPONS = [
  { id: "c1", value: 80, min: 599, label: "新人立减券", expiry: "2026-05-01 到期" },
  { id: "c2", value: 30, min: 0, label: "众定专享", expiry: "众定订单可用" },
];

export default async function GroupBuyCheckoutPage({ params }: Props) {
  const { id } = await params;
  const detail = getProductDetail(id);

  if (!detail) {
    return (
      <main className="page-wrap gbPage">
        <nav className="nav">
          <div className="container inner">
            <Link href="/" className="nav-logo">MaxLuLu <span className="ai">AI</span></Link>
            <div className="nav-center">
              <Link href="/products">灵感画廊</Link>
              <Link href="/products">个性定制</Link>
            </div>
          </div>
        </nav>
        <div className="container" style={{ marginTop: 40 }}>
          <h1>未找到该商品</h1>
          <p><Link href="/products">返回灵感画廊</Link></p>
        </div>
      </main>
    );
  }

  const { product } = detail;
  const progress = Math.min(100, Math.round((product.joined / product.target) * 100));
  const basePrice = parseInt(product.price.split("–")[0].replace(/[^0-9]/g, ""), 10) || 599;
  const discount = 80;
  const shipping = 0;
  const total = basePrice - discount + shipping;

  return (
    <main className="page-wrap gbPage">
      <nav className="nav">
        <div className="container inner">
          <Link href="/" className="nav-logo">MaxLuLu <span className="ai">AI</span></Link>
          <div className="nav-center">
            <Link href="/products">灵感画廊</Link>
            <Link href="/products">个性定制</Link>
            <Link href="/my">我的衣橱</Link>
            <Link href="/studio/join">加入设计</Link>
          </div>
          <div className="nav-right">
            <Link href="/my">购物车</Link>
            <Link href="/studio/join" className="designer-btn">设计师入驻</Link>
          </div>
        </div>
      </nav>

      <div className="container">
        <div className="gbCrumbs">
          <Link href="/products">灵感画廊</Link>
          <span className="sep">›</span>
          <Link href={`/products/${product.id}`}>{product.name}</Link>
          <span className="sep">›</span>
          <span className="current">参与众定</span>
        </div>

        <div className="gbHeader">
          <div className="gbHeader__title">
            <p className="eyebrow">GROUP BUY · 众定确认</p>
            <h1>参与众定 · 锁定生产名额</h1>
          </div>
          <div className="gbHeader__steps">
            <div className="gbStep is-done"><b>1</b><span>选款</span></div>
            <span className="gbStep__sep" />
            <div className="gbStep is-current"><b>2</b><span>确认订单</span></div>
            <span className="gbStep__sep" />
            <div className="gbStep"><b>3</b><span>支付</span></div>
            <span className="gbStep__sep" />
            <div className="gbStep"><b>4</b><span>等待成团</span></div>
          </div>
        </div>

        <div className="gbGrid">
          <aside className="gbAside">
            <b>MaxLuLu AI</b>
            <Link href="/products">灵感画廊</Link>
            <Link href="/my">我的衣橱</Link>
            <Link href="/my/orders" className="is-active">我的订单</Link>
            <a href="#address">收货地址</a>
            <a href="#coupons">我的优惠券</a>
            <a href="#help">客服与帮助</a>
          </aside>

          <section className="gbMain">
            <article className="gbCard">
              <div className="gbCard__head">
                <h2>商品信息</h2>
                <Link href={`/products/${product.id}`}>查看详情 →</Link>
              </div>
              <div className="gbProduct">
                <div className={`gbProduct__media tone-${product.tone}`}>
                  <AssetImage
                    src={product.image}
                    alt={product.name}
                    tone={product.tone}
                    label={product.name.slice(0, 4)}
                    className="gbProduct__img"
                  />
                </div>
                <div className="gbProduct__body">
                  <b>{product.name}</b>
                  <small>{detail.seriesLabel} · {product.tags.slice(0, 2).join(" · ")}</small>
                  <div className="gbProduct__attrs">
                    <span>尺码 M</span>
                    <span>配色 墨黑</span>
                    <span>面料 印花针织</span>
                  </div>
                  <div className="gbQty">
                    <button type="button">−</button>
                    <span>1</span>
                    <button type="button">+</button>
                  </div>
                </div>
                <div className="gbProduct__price">
                  <b>¥{basePrice}</b>
                  <small>原价 ¥999</small>
                </div>
              </div>
            </article>

            <article className="gbCard">
              <div className="gbCard__head">
                <h2>众定进度</h2>
                <span className="more">剩余时间 · 限时</span>
              </div>
              <div className="gbProgressCard">
                <div>
                  <div className="gbProgressCard__bar">
                    <em style={{ width: `${progress}%` }} />
                  </div>
                  <div className="gbProgressCard__meta">
                    <span>已拼 {product.joined} / {product.target} 人</span>
                    <span>{progress}% · 即将成团</span>
                  </div>
                  <div className="gbCountdown">
                    <span>距成团还剩</span>
                    <b>18</b>
                    <span>:</span>
                    <b>26</b>
                    <span>:</span>
                    <b>09</b>
                  </div>
                  <div className="gbAvatars">
                    <span>L</span><span>Y</span><span>C</span><span>K</span><span>M</span>
                    <b>L、Yuki、Chloe 等 {product.joined} 人已加入</b>
                  </div>
                </div>
                <div className="gbProgressCard__pill">
                  <b>{progress}%</b>
                  <small>众定进度</small>
                </div>
              </div>
            </article>

            <article className="gbCard">
              <div className="gbCard__head">
                <h2>收货地址</h2>
                <a href="#new-address">+ 新增地址</a>
              </div>
              <div className="gbAddrList">
                {ADDRESSES.map((a, i) => (
                  <div key={a.id} className={`gbAddr ${i === 0 ? "is-selected" : ""}`}>
                    <span className="gbAddr__radio" aria-hidden />
                    <div className="gbAddr__body">
                      <b>{a.name}</b>
                      <span style={{ color: "var(--text2)", fontSize: 12 }}>{a.phone}</span>
                      <small>{a.addr}</small>
                    </div>
                    {a.tag && <span className="gbAddr__tag">{a.tag}</span>}
                  </div>
                ))}
              </div>
            </article>

            <article className="gbCard">
              <div className="gbCard__head">
                <h2>支付方式</h2>
                <span className="more">支持 7 天无理由退款</span>
              </div>
              <div className="gbPay">
                <div className="gbPayOption is-selected">
                  <b>支付宝</b>
                  <small>支持花呗分期 · 立减 ¥10</small>
                </div>
                <div className="gbPayOption">
                  <b>微信支付</b>
                  <small>满 ¥500 减 ¥5</small>
                </div>
                <div className="gbPayOption">
                  <b>银行卡</b>
                  <small>支持双币种 / 国际卡</small>
                </div>
              </div>
            </article>

            <article className="gbCard">
              <div className="gbCard__head">
                <h2>优惠券</h2>
                <a href="#all-coupons">查看全部 →</a>
              </div>
              <div className="gbCouponRow">
                <input type="text" placeholder="输入优惠码（如 NEW80）" />
                <button type="button">应用</button>
              </div>
              <div className="gbCouponList">
                {COUPONS.map((c, i) => (
                  <div key={c.id} className={`gbCoupon ${i === 0 ? "is-selected" : ""}`}>
                    <b><small>¥</small>{c.value}</b>
                    <div className="gbCoupon__meta">
                      <strong>{c.label}</strong>
                      <span>{c.min ? `满 ¥${c.min} 可用` : "无门槛"} · {c.expiry}</span>
                    </div>
                    <span className="gbCoupon__pick" aria-hidden />
                  </div>
                ))}
              </div>
            </article>

            <article className="gbCard">
              <div className="gbCard__head">
                <h2>订单备注</h2>
                <span className="more">选填，最多 80 字</span>
              </div>
              <textarea
                className="gbNote"
                placeholder="设计师定制工艺单，可备注尺码微调、配色偏好或物流时间。"
                defaultValue=""
              />
            </article>
          </section>

          <aside className="gbSummary">
            <h2>价格明细</h2>
            <div className="gbSummary__rows">
              <div className="row"><span>商品小计</span><b>¥{basePrice}</b></div>
              <div className="row"><span>众定立减</span><span className="gold">- ¥{discount}</span></div>
              <div className="row"><span>运费</span><b>{shipping === 0 ? "免运费" : `¥${shipping}`}</b></div>
              <div className="row"><span>税费 & 服务费</span><b>包含</b></div>
            </div>
            <div className="gbSummary__divider" />
            <div className="gbTotal">
              <span>应付总额</span>
              <strong>¥{total.toLocaleString()}</strong>
            </div>
            <button type="button" className="gbCta">提交并支付</button>
            <Link href={`/group-buy/${id}/progress`} className="gbCtaGhost" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              查看众定进度
            </Link>
            <div className="gbReassure">
              <span>不成团 100% 全额退款</span>
              <span>30 天无忧退换</span>
              <span>顺丰包邮 · 工厂直发</span>
              <span>设计师签名工艺单</span>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
