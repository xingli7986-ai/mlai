"use client";

import Link from "next/link";
import AssetImage from "@/components/AssetImage";
import { products } from "@/lib/home-consumer-data";
import "../designer-center.css";
import "../studio-home.css";

const STATS = [
  { label: "总收益", value: "28,765.30", unit: "元", delta: "+18.3% 同比", trend: "up" as const, badge: "累计" },
  { label: "本月收益", value: "6,582.40", unit: "元", delta: "+12.1% 环比", trend: "up" as const, badge: "Apr" },
  { label: "总订单", value: "8,652", unit: "件", delta: "+9.4% 同比", trend: "up" as const, badge: "累计" },
  { label: "关注我的", value: "326", unit: "位设计师", delta: "+18 本月", trend: "up" as const, badge: "实时" },
];

const QUICK = [
  { ic: "✦", label: "新建印花设计", desc: "Pattern Generate · 2 步出图", price: "免费", href: "/studio/pattern/generate" },
  { ic: "✚", label: "上传新款式", desc: "Sketch → Render → 工艺单", price: "Pro", href: "/studio/fashion/sketch" },
  { ic: "↻", label: "续约众定排产", desc: "续期 7 天，触达更多用户", price: "¥69", href: "#" },
  { ic: "✉", label: "提现与结算", desc: "本月可提现 ¥6,290", price: "T+1", href: "#" },
];

const WORKS = products.slice(0, 5).map((p, i) => ({
  ...p,
  badge: ["热销", "众定", "新作", "已断货", "众定"][i],
  sales: [864, 612, 423, 298, 256][i],
}));

const REVENUE_ROWS = [
  { id: "#GB-2604-0918", title: "山茶花漫舞 系列", date: "2026-04-26", channel: "众定成团", amount: "¥1,860", status: "is-done", text: "已结算" },
  { id: "#GB-2604-0911", title: "印象涟花园 长袖", date: "2026-04-26", channel: "众定成团", amount: "¥1,290", status: "is-done", text: "已结算" },
  { id: "#GB-2604-0902", title: "都市艺境 几何拼", date: "2026-04-25", channel: "众定 92%", amount: "¥980", status: "is-progress", text: "排产中" },
  { id: "#GB-2604-0884", title: "深 V 抽象印花", date: "2026-04-24", channel: "众定 78%", amount: "¥820", status: "is-progress", text: "众定中" },
  { id: "#GB-2604-0870", title: "晚宴鎏金花园", date: "2026-04-23", channel: "众定 48%", amount: "¥620", status: "is-pending", text: "等待成团" },
];

const EVENTS = [
  { ic: "♡", title: "Yuki 收藏了你的「山茶花漫舞」", time: "5 分钟前", side: "+1 收藏" },
  { ic: "✦", title: "「印象涟花园」众定达成 30 人", time: "1 小时前", side: "可排产" },
  { ic: "★", title: "Chloe 给你 5 星好评", time: "今晨 09:21", side: "评分 4.9" },
  { ic: "✉", title: "工厂打样确认完成", time: "昨天 18:40", side: "可发货" },
];

function RevenueChart() {
  const points = [62, 70, 65, 78, 82, 88, 86, 95, 100, 92, 110, 118, 122, 128, 142];
  const max = Math.max(...points);
  const w = 720;
  const h = 200;
  const stepX = w / (points.length - 1);
  const path = points
    .map((p, i) => {
      const x = i * stepX;
      const y = h - (p / max) * (h - 30) - 10;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const area = `${path} L${w},${h} L0,${h} Z`;

  const points2 = [40, 48, 50, 55, 58, 64, 60, 68, 72, 70, 76, 80, 82, 88, 96];
  const path2 = points2
    .map((p, i) => {
      const x = i * stepX;
      const y = h - (p / max) * (h - 30) - 10;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg className="dc-chart" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id="dcArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#B0865C" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#B0865C" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((r) => (
        <line key={r} x1="0" x2={w} y1={h * r} y2={h * r} stroke="rgba(122,122,111,0.14)" strokeDasharray="4 4" />
      ))}
      <path d={area} fill="url(#dcArea)" />
      <path d={path} stroke="#B0865C" strokeWidth="2.4" fill="none" strokeLinejoin="round" strokeLinecap="round" />
      <path d={path2} stroke="#C98586" strokeWidth="1.8" fill="none" strokeDasharray="5 5" strokeLinejoin="round" />
      {points.map((p, i) => {
        const x = i * stepX;
        const y = h - (p / max) * (h - 30) - 10;
        return <circle key={i} cx={x} cy={y} r="3" fill="#B0865C" />;
      })}
    </svg>
  );
}

export default function DesignerCenterPage() {
  return (
    <div className="dc-root">
      <div className="st-tabs" style={{ marginBottom: 20 }}>
        <Link href="/studio">工具页</Link>
        <Link href="/products">我的设计</Link>
        <Link href="/products">灵感</Link>
        <Link href="/studio/publish">发布设计</Link>
        <Link href="/studio/dashboard" className="is-active">设计师中心</Link>
      </div>
      <header className="dc-greet">
        <div>
          <p className="eyebrow">DESIGNER CENTER · 设计师中心</p>
          <h1>欢迎回来，Luna <small>· 你今天有 3 件作品成团 · 4 条新评价</small></h1>
        </div>
        <div className="dc-greet__actions">
          <button type="button" className="dc-btn">本月 ▾</button>
          <button type="button" className="dc-btn">导出报表</button>
          <Link href="/studio/pattern/generate" className="dc-btn is-primary">+ 新建作品</Link>
        </div>
      </header>

      <section className="dc-stats">
        {STATS.map((s) => (
          <article key={s.label} className="dc-stat">
            <div className="dc-stat__head">
              <span>{s.label}</span>
              <em>{s.badge}</em>
            </div>
            <div className="dc-stat__num">
              <b>¥ {s.value}</b>
              <small>{s.unit}</small>
            </div>
            <span className={`dc-stat__delta ${s.trend}`}>{s.trend === "up" ? "▲" : "▼"} {s.delta}</span>
          </article>
        ))}
      </section>

      <section className="dc-grid">
        <article className="dc-card">
          <div className="dc-card__head">
            <h2>收益与销量趋势</h2>
            <div className="dc-tabs">
              <button type="button" className="is-active">7 天</button>
              <button type="button">30 天</button>
              <button type="button">90 天</button>
              <button type="button">本年</button>
            </div>
          </div>
          <RevenueChart />
          <div className="dc-chart__legend">
            <span><i /> 收益（元）</span>
            <span><i className="alt" /> 作品销量（件）</span>
            <span style={{ marginLeft: "auto", color: "var(--dc-text3)" }}>更新于 5 分钟前</span>
          </div>
        </article>

        <aside className="dc-side">
          <div className="dc-card" style={{ background: "linear-gradient(135deg, var(--dc-gold-bg), rgba(176,134,92,0.02))" }}>
            <div style={{ display: "grid", gap: 4, marginBottom: 14 }}>
              <small style={{ fontSize: 12, color: "var(--dc-text2)" }}>本月可提现</small>
              <b style={{ fontFamily: 'var(--font-display, "Cormorant Garamond"), serif', fontSize: 32, color: "var(--dc-gold)", lineHeight: 1, fontWeight: 700 }}>¥6,582.40</b>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" className="dc-btn is-primary" style={{ flex: 1 }}>立即提现</button>
              <button type="button" className="dc-btn" style={{ flex: 1 }}>结算明细</button>
            </div>
            <small style={{ display: "block", marginTop: 10, fontSize: 11, color: "var(--dc-text3)" }}>结算周期 T+1 · 已绑定建设银行 ****8896</small>
          </div>

          <div className="dc-card">
            <div className="dc-profile">
              <div className="dc-profile__avatar">L</div>
              <div>
                <b>Luna · MaxLuLu Studio</b>
                <small>巴黎 · 资深设计师 · 入驻 14 个月</small>
                <span>★ 4.9 · 23 件作品</span>
              </div>
            </div>
            <div className="dc-mini-stats">
              <div className="dc-mini-stat"><small>粉丝</small><b>4,289</b></div>
              <div className="dc-mini-stat"><small>本月新增</small><b>+312</b></div>
            </div>
            <div className="dc-skills">
              <span>水墨印花</span>
              <span>针织</span>
              <span>裹身裙</span>
              <span>晚宴款</span>
              <span>通勤</span>
            </div>
          </div>

          <div className="dc-card">
            <div className="dc-card__head">
              <h2>快捷动作</h2>
              <Link href="#" className="more">全部 →</Link>
            </div>
            <div className="dc-quick">
              {QUICK.map((q) => (
                <Link key={q.label} href={q.href} className="dc-quick-item">
                  <span className="ic">{q.ic}</span>
                  <div>
                    <b>{q.label}</b>
                    <small>{q.desc}</small>
                  </div>
                  <em>{q.price}</em>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </section>

      <section className="dc-card" style={{ marginBottom: 18 }}>
        <div className="dc-card__head">
          <h2>我的作品</h2>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div className="dc-tabs">
              <button type="button" className="is-active">全部</button>
              <button type="button">众定中</button>
              <button type="button">已成团</button>
              <button type="button">草稿</button>
            </div>
            <Link href="/products" className="more">查看全部 →</Link>
          </div>
        </div>
        <div className="dc-works">
          {WORKS.map((w) => (
            <Link href={`/products/${w.id}`} key={w.id} className="dc-work">
              <div className={`dc-work__media tone-${w.tone}`}>
                <AssetImage
                  src={w.image}
                  alt={w.name}
                  tone={w.tone}
                  label={w.name.slice(0, 4)}
                  className="dc-work__img"
                />
                <span className="dc-work__tag">{w.badge}</span>
              </div>
              <div className="dc-work__body">
                <div className="dc-work__name">{w.name}</div>
                <div className="dc-work__meta">
                  <span className="dc-work__price">{w.price.split("–")[0]}</span>
                  <span className="dc-work__sales">售 {w.sales}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="dc-bottom">
        <article className="dc-card">
          <div className="dc-card__head">
            <h2>收益明细</h2>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span className="more">本月已结算 ¥18,420</span>
              <button type="button" className="dc-btn" style={{ height: 30, padding: "0 12px", fontSize: 11 }}>导出</button>
            </div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="dc-table">
              <thead>
                <tr>
                  <th>订单</th>
                  <th>作品</th>
                  <th>日期</th>
                  <th>渠道</th>
                  <th className="col-amount" style={{ textAlign: "right" }}>金额</th>
                  <th>状态</th>
                </tr>
              </thead>
              <tbody>
                {REVENUE_ROWS.map((r) => (
                  <tr key={r.id}>
                    <td className="col-id">{r.id}</td>
                    <td>{r.title}</td>
                    <td>{r.date}</td>
                    <td>{r.channel}</td>
                    <td className="col-amount">{r.amount}</td>
                    <td className="col-status"><span className={r.status}>{r.text}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="dc-card">
          <div className="dc-card__head">
            <h2>最近动态</h2>
            <Link href="#" className="more">查看全部 →</Link>
          </div>
          <ul className="dc-events" style={{ padding: 0, margin: 0 }}>
            {EVENTS.map((e) => (
              <li key={e.title}>
                <span className="ic">{e.ic}</span>
                <div>
                  <b>{e.title}</b>
                  <small>{e.time}</small>
                </div>
                <em style={{ fontStyle: "normal", color: "var(--dc-gold)", fontSize: 12 }}>{e.side}</em>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </div>
  );
}
