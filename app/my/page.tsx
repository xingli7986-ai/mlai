"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AssetImage from "@/components/AssetImage";
import { products } from "@/lib/home-consumer-data";
import "./my-center.css";

interface ApiFavorite {
  id: string;
  title: string;
  images: string[];
  groupPrice: number;
  designer: { name: string | null };
}
interface ApiOrder {
  kind: "custom" | "group-buy";
  id: string;
  title: string;
  image: string | null;
  size: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

const FAVORITES = products.slice(0, 8);

const ORDERS = products.slice(2, 6).map((p, i) => ({
  product: p,
  id: `MU-${(2604000 + i * 17).toString().padStart(7, "0")}`,
  date: ["2026-04-26", "2026-04-21", "2026-04-12", "2026-03-30"][i],
  status: ["待发货", "众定中", "已完成", "已完成"][i],
  statusClass: ["is-pending", "is-warn", "is-done", "is-done"][i],
  price: ["¥720", "¥599", "¥820", "¥699"][i],
  size: ["M", "L", "S", "M"][i],
  channel: ["众定成团", "众定 92%", "个人定制", "众定成团"][i],
}));

const COUPONS = [
  { v: 80, label: "夏日会员券", desc: "满 ¥599 可用", expire: "5月31日到期" },
  { v: 30, label: "众定专享", desc: "无门槛", expire: "仅限众定订单" },
  { v: 50, label: "首单立减", desc: "新人首单可用", expire: "不可叠加" },
];

const DESIGNERS = [
  { name: "Luna", studio: "MaxLuLu Studio" },
  { name: "Yuki", studio: "Yuki Atelier" },
  { name: "Reine", studio: "Atelier Reine" },
  { name: "Mei", studio: "Mei Botanical" },
];

const STAT_CARDS = [
  { ic: "♡", title: "我的收藏", count: "12 款已收藏", href: "#wardrobe" },
  { ic: "▦", title: "我的订单", count: "2 个进行中", href: "/my/orders" },
  { ic: "✦", title: "优惠券", count: "3 张可用", href: "#coupons" },
  { ic: "★", title: "邀请有礼", count: "拉新得 ¥30", href: "#invite" },
];

const ORDER_TABS = ["全部", "待付款", "待发货", "配送中", "已完成", "已取消"];

const SIDEBAR_GROUPS = [
  {
    title: "我的交易",
    items: [
      { label: "我的订单", icon: "▦", href: "/my/orders" },
      { label: "售后与退款", icon: "↺", href: "#refund" },
      { label: "优惠券", icon: "✦", href: "#coupons" },
      { label: "发票管理", icon: "▤", href: "#invoice" },
    ],
  },
  {
    title: "我的衣橱",
    items: [
      { label: "我的衣橱", icon: "♡", href: "#wardrobe" },
      { label: "我的收藏", icon: "♡", href: "#favorites" },
      { label: "浏览记录", icon: "◷", href: "#history" },
      { label: "尺码与偏好", icon: "▦", href: "#size" },
    ],
  },
  {
    title: "我的服务",
    items: [
      { label: "收货地址", icon: "◉", href: "#address" },
      { label: "账户设置", icon: "⚙", href: "#account" },
      { label: "消息中心", icon: "✉", href: "#messages" },
      { label: "帮助与客服", icon: "?", href: "#help" },
    ],
  },
];

export default function MyCenterPage() {
  const [apiFavorites, setApiFavorites] = useState<ApiFavorite[] | null>(null);
  const [apiOrders, setApiOrders] = useState<ApiOrder[] | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [favRes, ordRes] = await Promise.all([
          fetch("/api/my/favorites?limit=8", { cache: "no-store" }),
          fetch("/api/my/orders", { cache: "no-store" }),
        ]);
        if (favRes.ok) {
          const j = await favRes.json();
          if (alive) setApiFavorites(j.designs as ApiFavorite[]);
        }
        if (ordRes.ok) {
          const j = await ordRes.json();
          if (alive) setApiOrders(j.orders as ApiOrder[]);
        }
      } catch {
        /* keep mock fallback */
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <main className="page-wrap mcPage">
      <nav className="nav">
        <div className="container inner">
          <Link href="/" className="nav-logo">MaxLuLu <span className="ai">AI</span></Link>
          <div className="nav-center">
            <Link href="/products">印花衣橱</Link>
            <Link href="/products">个性定制</Link>
            <Link href="/products?sort=hot-group">热拼专区</Link>
            <Link href="/my">我的衣橱</Link>
          </div>
          <div className="nav-right">
            <button type="button" className="mcNavSearch" aria-label="搜索">⌕</button>
            <button type="button" className="mcNavBell" aria-label="通知">⛉<span>3</span></button>
            <Link href="/my" className="mcNavAvatar">L</Link>
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
            <Link href="/my" className="mcAsideItem is-active">
              <span className="ic">⌂</span>
              <span>概览</span>
            </Link>
            {SIDEBAR_GROUPS.map((g) => (
              <div className="mcAsideGroup" key={g.title}>
                <small>{g.title}</small>
                {g.items.map((it) => (
                  <Link key={it.label} href={it.href} className="mcAsideItem">
                    <span className="ic">{it.icon}</span>
                    <span>{it.label}</span>
                  </Link>
                ))}
              </div>
            ))}
          </aside>

          <section className="mcMain">
            <article className="mcCard mcCard--hero">
              <div className="mcProfile">
                <div className="mcProfile__avatar">L</div>
                <div className="mcProfile__body">
                  <div className="mcProfile__title">
                    <b>Lulu</b>
                    <span className="ml-badge ml-badge--vip">VIP</span>
                  </div>
                  <small>加入 312 天 · ID 2026088</small>
                  <div className="mcProfile__badges">
                    <span>✦ Style Lover</span>
                    <span>♡ 12 次收藏</span>
                    <span>★ 已关注 8 位设计师</span>
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

            <div className="mcStatRow">
              {STAT_CARDS.map((s) => (
                <Link key={s.title} href={s.href} className="mcStatCard">
                  <span className="ic">{s.ic}</span>
                  <div>
                    <b>{s.title}</b>
                    <small>{s.count}</small>
                  </div>
                </Link>
              ))}
            </div>

            <article className="mcCard" id="wardrobe">
              <div className="mcCard__head">
                <h2>我的衣橱 · 已收藏 ({apiFavorites?.length ?? 12})</h2>
                <Link href="#favorites">查看全部 →</Link>
              </div>
              <div className="mcWardrobe">
                {apiFavorites && apiFavorites.length > 0
                  ? apiFavorites.map((p) => (
                      <Link href={`/products/${p.id}`} key={p.id} className="mcWardrobeCard">
                        <div className="mcWardrobeCard__media">
                          {p.images[0] ? (
                            <img src={p.images[0]} alt={p.title} className="mcWardrobeCard__img" />
                          ) : (
                            <div className="mcWardrobeCard__img" />
                          )}
                          <button type="button" className="mcWardrobeCard__heart" aria-label="取消收藏">♥</button>
                        </div>
                        <div className="mcWardrobeCard__body">
                          <div className="mcWardrobeCard__name">{p.title}</div>
                          <div className="mcWardrobeCard__price">¥{(p.groupPrice / 100).toLocaleString()}</div>
                        </div>
                      </Link>
                    ))
                  : FAVORITES.map((p) => (
                      <Link href={`/products/${p.id}`} key={p.id} className="mcWardrobeCard">
                        <div className={`mcWardrobeCard__media tone-${p.tone}`}>
                          <AssetImage src={p.image} alt={p.name} tone={p.tone} label={p.name.slice(0, 4)} className="mcWardrobeCard__img" />
                          <button type="button" className="mcWardrobeCard__heart" aria-label="取消收藏">♥</button>
                        </div>
                        <div className="mcWardrobeCard__body">
                          <div className="mcWardrobeCard__name">{p.name}</div>
                          <div className="mcWardrobeCard__price">{p.price.split("–")[0]}</div>
                        </div>
                      </Link>
                    ))}
              </div>
            </article>

            <div className="mcSplit">
              <article className="mcCard" id="orders">
                <div className="mcCard__head">
                  <h2>我的订单</h2>
                  <Link href="/my/orders">全部订单 →</Link>
                </div>
                <div className="mcOrderTabs ml-tabs">
                  {ORDER_TABS.map((t, i) => (
                    <button key={t} type="button" className={`ml-tabs__item${i === 0 ? " is-active" : ""}`}>
                      {t}
                    </button>
                  ))}
                </div>
                <div className="mcOrders">
                  {(apiOrders && apiOrders.length > 0
                    ? apiOrders.slice(0, 3).map((o) => (
                        <Link key={o.id} href={`/my/orders`} className="mcOrder">
                          <div className="mcOrder__media">
                            {o.image ? (
                              <img src={o.image} alt={o.title} className="mcOrder__img" />
                            ) : (
                              <div className="mcOrder__img" />
                            )}
                          </div>
                          <div className="mcOrder__body">
                            <b>{o.title}</b>
                            <small>编号 {o.id.slice(0, 12).toUpperCase()}</small>
                            <div className="mcOrder__meta">
                              <span>尺码 {o.size}</span>
                              <span>{o.kind === "group-buy" ? "众定" : "个人定制"}</span>
                              <span>{new Date(o.createdAt).toLocaleDateString("zh-CN")}</span>
                            </div>
                          </div>
                          <div className="mcOrder__price">
                            <b>¥{(o.totalAmount / 100).toFixed(0)}</b>
                            <em className={o.status === "paid" || o.status === "completed" ? "is-done" : "is-pending"}>{o.status}</em>
                          </div>
                        </Link>
                      ))
                    : ORDERS.slice(0, 3).map((o) => (
                        <Link key={o.id} href={`/group-buy/${o.product.id}/progress`} className="mcOrder">
                          <div className={`mcOrder__media tone-${o.product.tone}`}>
                            <AssetImage src={o.product.image} alt={o.product.name} tone={o.product.tone} label={o.product.name.slice(0, 4)} className="mcOrder__img" />
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
                      )))}
                </div>
              </article>

              <article className="mcCard" id="coupons">
                <div className="mcCard__head">
                  <h2>我的优惠券 (3)</h2>
                  <Link href="#all-coupons">领取更多 →</Link>
                </div>
                <div className="mcCoupons">
                  {COUPONS.map((c) => (
                    <div key={c.label} className="mcCoupon">
                      <div className="mcCoupon__amount">
                        <b><small>¥</small>{c.v}</b>
                      </div>
                      <div className="mcCoupon__body">
                        <strong>{c.label}</strong>
                        <span>{c.desc}</span>
                        <em>{c.expire}</em>
                      </div>
                      <button type="button" className="ml-btn ml-btn--sm ml-btn--primary">使用</button>
                    </div>
                  ))}
                </div>
              </article>
            </div>

            <article className="mcCard" id="designers">
              <div className="mcCard__head">
                <h2>我关注的设计师 (4)</h2>
                <Link href="/products">浏览全部 →</Link>
              </div>
              <div className="mcDesigners">
                {DESIGNERS.map((d) => (
                  <Link key={d.name} href="/products" className="mcDesigner">
                    <span className="mcDesigner__avatar">{d.name.slice(0, 1)}</span>
                    <div>
                      <b>{d.name}</b>
                      <small>{d.studio}</small>
                    </div>
                    <button type="button" className="ml-btn ml-btn--sm ml-btn--ghost">已关注</button>
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
