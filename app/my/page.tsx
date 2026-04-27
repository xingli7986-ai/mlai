import Link from "next/link";
import AssetImage from "@/components/AssetImage";
import { products } from "@/lib/home-consumer-data";
import "./my-center.css";

const FAVORITES = products.slice(0, 6);

const ORDERS = products.slice(2, 6).map((p, i) => ({
  product: p,
  id: `MU-${(2604000 + i * 17).toString().padStart(7, "0")}`,
  date: ["2026-04-26", "2026-04-21", "2026-04-12", "2026-03-30"][i],
  status: ["待发货", "众定中", "已完成", "已完成"][i],
  statusClass: ["", "", "is-done", "is-done"][i],
  price: ["¥720", "¥599", "¥820", "¥699"][i],
  size: ["M", "L", "S", "M"][i],
  channel: ["众定成团", "众定 92%", "个人定制", "众定成团"][i],
}));

const COUPONS = [
  { v: 80, label: "夏日会员券", desc: "满 ¥599 可用 · 5月31日到期" },
  { v: 30, label: "众定专享", desc: "无门槛 · 仅限众定订单" },
  { v: 50, label: "首单立减", desc: "新人首单可用 · 不可叠加" },
];

const DESIGNERS = [
  { name: "Luna", studio: "MaxLuLu Studio" },
  { name: "Yuki", studio: "Yuki Atelier" },
  { name: "Reine", studio: "Atelier Reine" },
  { name: "Mei", studio: "Mei Botanical" },
];

const QUICK_ACTIONS = [
  { ic: "♡", title: "我的衣橱", desc: "12 款已收藏", href: "#wardrobe" },
  { ic: "✦", title: "我的订单", desc: "2 个进行中", href: "/my/orders" },
  { ic: "✚", title: "去定制", desc: "12 款印花在售", href: "/products" },
  { ic: "★", title: "邀请有礼", desc: "拉新得 ¥30", href: "#invite" },
];

export default function MyCenterPage() {
  return (
    <main className="page-wrap mcPage">
      <nav className="nav">
        <div className="container inner">
          <Link href="/" className="nav-logo">MaxLuLu <span className="ai">AI</span></Link>
          <div className="nav-center">
            <Link href="/products">灵感画廊</Link>
            <Link href="/products">个性定制</Link>
            <Link href="/#hot">热拼专区</Link>
          </div>
          <div className="nav-right">
            <Link href="/my">会员</Link>
            <Link href="/my">我的衣橱</Link>
            <span className="nav-divider" />
            <Link href="/studio/join" className="designer-btn">设计师入驻</Link>
          </div>
        </div>
      </nav>

      <div className="container">
        <div className="mcCrumbs">
          <Link href="/">首页</Link>
          <span className="sep">›</span>
          <span className="current">个人中心</span>
        </div>

        <div className="mcHero">
          <aside className="mcAside">
            <b>个人中心</b>
            <Link href="/my" className="is-active">概览</Link>
            <Link href="#wardrobe">我的衣橱</Link>
            <Link href="/my/orders">我的订单</Link>
            <Link href="#favorites">我的收藏</Link>
            <Link href="#coupons">优惠券</Link>
            <Link href="#designers">关注的设计师</Link>
            <span className="mcAsideDivider" />
            <Link href="#address">收货地址</Link>
            <Link href="#account">账户设置</Link>
            <Link href="#help">帮助与客服</Link>
            <Link href="/login?logout=1">退出登录</Link>
          </aside>

          <section className="mcMain">
            <article className="mcCard">
              <div className="mcProfile">
                <div className="mcProfile__avatar">L</div>
                <div className="mcProfile__body">
                  <b>Lulu</b>
                  <small>VIP 会员 · 加入 312 天 · ID 2026088</small>
                  <div className="mcProfile__badges">
                    <span>✦ Style Lover</span>
                    <span>♡ 12 收藏</span>
                    <span>✚ 已众定 8 件</span>
                    <span>★ 4.9 评分</span>
                  </div>
                </div>
                <div className="mcProfile__stats">
                  <div className="mcProfile__stat"><b>3,820</b><small>积分</small></div>
                  <div className="mcProfile__stat"><b>¥160</b><small>优惠券</small></div>
                  <div className="mcProfile__stat"><b>L4</b><small>会员等级</small></div>
                </div>
              </div>
            </article>

            <article className="mcCard">
              <div className="mcCard__head">
                <h2>快捷动作</h2>
              </div>
              <div className="mcQuickActions">
                {QUICK_ACTIONS.map((q) => (
                  <Link href={q.href} key={q.title} className="mcQuickAction">
                    <span className="ic">{q.ic}</span>
                    <div>
                      <b>{q.title}</b>
                      <small>{q.desc}</small>
                    </div>
                  </Link>
                ))}
              </div>
            </article>

            <article className="mcCard" id="wardrobe">
              <div className="mcCard__head">
                <h2>我的衣橱 · 已收藏</h2>
                <Link href="#favorites">查看全部 →</Link>
              </div>
              <div className="mcWardrobe">
                {FAVORITES.map((p) => (
                  <Link href={`/products/${p.id}`} key={p.id} className="mcWardrobeCard">
                    <div className={`mcWardrobeCard__media tone-${p.tone}`}>
                      <AssetImage
                        src={p.image}
                        alt={p.name}
                        tone={p.tone}
                        label={p.name.slice(0, 4)}
                        className="mcWardrobeCard__img"
                      />
                    </div>
                    <div className="mcWardrobeCard__body">
                      <div className="mcWardrobeCard__name">{p.name}</div>
                      <div className="mcWardrobeCard__price">{p.price.split("–")[0]}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </article>

            <article className="mcCard">
              <div className="mcCard__head">
                <h2>我的订单</h2>
                <Link href="/my/orders">全部订单 →</Link>
              </div>
              <div className="mcOrders">
                {ORDERS.map((o) => (
                  <Link key={o.id} href={`/group-buy/${o.product.id}/progress`} className="mcOrder">
                    <div className={`mcOrder__media tone-${o.product.tone}`}>
                      <AssetImage
                        src={o.product.image}
                        alt={o.product.name}
                        tone={o.product.tone}
                        label={o.product.name.slice(0, 4)}
                        className="mcOrder__img"
                      />
                    </div>
                    <div className="mcOrder__body">
                      <b>{o.product.name}</b>
                      <small>编号 {o.id}</small>
                      <div className="mcOrder__meta">
                        <span>尺码 {o.size}</span>
                        <span>{o.channel}</span>
                        <span>{o.date}</span>
                      </div>
                    </div>
                    <div className="mcOrder__price">
                      <b>{o.price}</b>
                      <em className={o.statusClass}>{o.status}</em>
                    </div>
                  </Link>
                ))}
              </div>
            </article>

            <article className="mcCard" id="coupons">
              <div className="mcCard__head">
                <h2>优惠券 · 3 张可用</h2>
                <Link href="#all-coupons">领取更多 →</Link>
              </div>
              <div className="mcCoupons">
                {COUPONS.map((c) => (
                  <div key={c.label} className="mcCoupon">
                    <b><small>¥</small>{c.v}</b>
                    <div className="mcCoupon__body">
                      <strong>{c.label}</strong>
                      <span>{c.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className="mcCard" id="designers">
              <div className="mcCard__head">
                <h2>关注的设计师</h2>
                <Link href="/products">浏览全部 →</Link>
              </div>
              <div className="mcDesigners">
                {DESIGNERS.map((d) => (
                  <Link key={d.name} href="/products" className="mcDesigner">
                    <span className="mcDesigner__avatar">{d.name.slice(0, 1)}</span>
                    <b>{d.name}</b>
                    <small>{d.studio}</small>
                  </Link>
                ))}
              </div>
            </article>
          </section>
        </div>
      </div>
    </main>
  );
}
