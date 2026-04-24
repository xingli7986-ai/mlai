"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import "./homepage.css";

const R2 = "https://pub-39ccb989bffa4f729bb1ae58876f3b36.r2.dev/brand";

const HERO_IMAGE = `${R2}/home/01-hero/01-01-hero.png`;

const FEATURED = [
  {
    src: `${R2}/home/02-featured-designs/01-02-featured-designs.png`,
    name: "Ink Blossom 裹身裙",
    subtitle: "黑白水墨花卉 · 深 V 针织",
    designer: "Mia · 上海",
    tags: ["针织印花", "深V裹身"],
    price: "¥1,280 起",
    joined: 18,
    required: 30,
  },
  {
    src: `${R2}/home/02-featured-designs/02-02-featured-designs.png`,
    name: "Moon Garden 连衣裙",
    subtitle: "灰蓝花园 · 轻奢通勤",
    designer: "Luna · 杭州",
    tags: ["花卉印花", "裹身系"],
    price: "¥1,380 起",
    joined: 24,
    required: 30,
  },
  {
    src: `${R2}/home/02-featured-designs/03-02-featured-designs.png`,
    name: "Rose de Paris",
    subtitle: "玫瑰花园 · 法式浪漫",
    designer: "Clair · 巴黎",
    tags: ["浪漫印花", "针织面料"],
    price: "¥1,480 起",
    joined: 12,
    required: 30,
  },
  {
    src: `${R2}/home/02-featured-designs/04-02-featured-designs.png`,
    name: "Shanghai Noir",
    subtitle: "黑色优雅 · 晚宴系列",
    designer: "Yu · 上海",
    tags: ["晚宴", "黑色系"],
    price: "¥1,580 起",
    joined: 27,
    required: 30,
  },
];

const GROUP_BUY = [
  {
    src: `${R2}/home/03-group-buy/01-03-group-buy.png`,
    name: "Blue Garden 裹身中长裙",
    subtitle: "春季系列 · 蓝花园印花",
    joined: 22,
    required: 30,
    deadline: "剩余 4 天",
    price: "¥1,280 起",
  },
  {
    src: `${R2}/home/03-group-buy/02-03-group-buy.png`,
    name: "Ink Floral 深 V 连衣裙",
    subtitle: "水墨花卉 · 通勤到晚宴",
    joined: 17,
    required: 30,
    deadline: "剩余 6 天",
    price: "¥1,380 起",
  },
  {
    src: `${R2}/home/03-group-buy/03-03-group-buy.png`,
    name: "Soft Rose 花卉裹身裙",
    subtitle: "柔粉玫瑰 · 针织面料",
    joined: 28,
    required: 30,
    deadline: "剩余 2 天",
    price: "¥1,480 起",
  },
];

const AI_TOOLS = [
  {
    thumb: `${R2}/home/04-ai-tools/01-04-ai-tools.png`,
    eyebrow: "Print Studio",
    title: "印花设计",
    desc: "文字描述生成印花、四方连续、画风复刻、局部涂改。",
  },
  {
    thumb: `${R2}/home/04-ai-tools/02-04-ai-tools.png`,
    eyebrow: "Garment Preview",
    title: "上身预览",
    desc: "将印花贴到针织裹身裙版型上，快速预览真实穿着。",
  },
  {
    thumb: `${R2}/home/04-ai-tools/03-04-ai-tools.png`,
    eyebrow: "Production Pack",
    title: "生产输出",
    desc: "自动生成 Tech Pack、BOM、尺码规格与工艺说明。",
  },
  {
    thumb: `${R2}/home/04-ai-tools/04-04-ai-tools.png`,
    eyebrow: "Social Commerce",
    title: "众定成团",
    desc: "消费者参团或定制，成团达标即进入工厂批量生产。",
  },
];

const BRAND_STORY = [
  {
    src: `${R2}/home/07-brand-story/01-07-brand-story.png`,
    title: "巴黎灵感 × 上海原创",
    sub: "Parisian Inspiration",
    cls: "feature",
  },
  {
    src: `${R2}/home/07-brand-story/02-07-brand-story.png`,
    title: "针织印花连衣裙",
    sub: "Signature Silhouette",
    cls: "tall",
  },
  {
    src: `${R2}/home/07-brand-story/03-07-brand-story.png`,
    title: "设计师 OPC 共创",
    sub: "Open Creator Program",
    cls: "wide",
  },
  {
    src: `${R2}/home/07-brand-story/04-07-brand-story.png`,
    title: "线下定制升级",
    sub: "Boutique to Platform",
    cls: "small",
  },
];

const NAV_LINKS = [
  { label: "首页", href: "/", match: "home" },
  { label: "灵感画廊", href: "/studio", match: "gallery" },
  { label: "AI Design Studio", href: "/studio", match: "studio" },
  { label: "设计师中心", href: "/my", match: "designer" },
  { label: "工厂对接", href: "/my", match: "factory" },
  { label: "个人中心", href: "/my", match: "my" },
];

const PROCESS_STEPS = [
  { title: "设计师 · 创作者", sub: "发布原创设计", icon: "♙" },
  { title: "AI Design Studio", sub: "AI 设计与款式开发", icon: "✦" },
  { title: "众定 · 定制", sub: "积累订单达成众定", icon: "◎" },
  { title: "工厂生产", sub: "工艺单对接批量生产", icon: "▣" },
  { title: "设计师分润", sub: "8%–12% 收益分成", icon: "¥" },
];

function progressPct(joined: number, required: number) {
  return Math.min(100, Math.round((joined / required) * 100));
}

export default function HomePage() {
  const { data: session, status } = useSession();
  const isAuthed = status === "authenticated" && !!session;
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const els = root.querySelectorAll<HTMLElement>(".reveal");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div ref={rootRef} className="home-root">
      <div className="top-strip">
        <span>✦ 15 年中高端女装品牌</span>
        <span>AI 设计 × 工厂生产</span>
        <span>上海原创 · 全球优雅</span>
        <span>设计师共创 · 收益分润</span>
      </div>

      <header className="site-header">
        <Link href="/" className="brand-block" aria-label="MaxLuLu AI 首页">
          <span className="brand-name">MaxLuLu AI</span>
          <span className="brand-sub">Fashion For You</span>
        </Link>
        <nav className="nav" aria-label="主导航">
          {NAV_LINKS.map((l) => (
            <Link key={l.label} href={l.href} className={l.match === "home" ? "is-active" : ""}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <button className="icon-btn" type="button" aria-label="搜索">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3-3" />
            </svg>
          </button>
          <Link
            className="btn btn-dark small"
            href={isAuthed ? "/studio" : "/login"}
          >
            {isAuthed ? "进入 AI Studio" : "注册 / 开始设计"}
          </Link>
        </div>
      </header>

      <main>
        {/* ===== Hero ===== */}
        <section className="hero">
          <div className="container hero-inner">
            <div className="hero-copy reveal">
              <div className="eyebrow">MaxLuLu AI · OPC Co-Creation Platform</div>
              <h1>
                <span>让设计师的灵感，</span>
                <span>被看见、被生产、被穿上身</span>
              </h1>
              <p className="lead">
                MaxLuLu AI 基于 15 年印花女装与私人定制经验，提供从印花生成、图案上身、工艺单输出到工厂生产的 AI 共创闭环。
              </p>
              <div className="hero-actions">
                <Link href="/studio" className="btn btn-dark">
                  开始设计
                </Link>
                <Link href="/design" className="btn">
                  浏览灵感画廊
                </Link>
                <Link href="/my" className="btn ghost">
                  申请设计师计划 →
                </Link>
              </div>
              <div className="hero-kpis">
                <div className="kpi">
                  <strong>15年</strong>
                  <span>原创品牌沉淀</span>
                </div>
                <div className="kpi">
                  <strong>1000+</strong>
                  <span>合作设计师目标</span>
                </div>
                <div className="kpi">
                  <strong>30件</strong>
                  <span>众定生产门槛</span>
                </div>
                <div className="kpi">
                  <strong>8–12%</strong>
                  <span>设计师收益分润</span>
                </div>
              </div>
            </div>
            <div className="hero-image">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={HERO_IMAGE} alt="模特穿着针织印花裹身裙" />
              <div className="hero-badge">
                <div className="script">MaxLuLu</div>
                <small>
                  Since 2009
                  <br />
                  Printed Knit Dress
                  <br />
                  Shanghai Original
                </small>
              </div>
            </div>
          </div>
        </section>

        {/* ===== Process ===== */}
        <section className="process-bar">
          <div className="container process-grid">
            {PROCESS_STEPS.map((step, i) => (
              <div key={step.title} className="process-step">
                <div className="step-icon">{step.icon}</div>
                <div>
                  <b>
                    0{i + 1} {step.title}
                  </b>
                  <small>{step.sub}</small>
                </div>
                <span className="muted">→</span>
              </div>
            ))}
          </div>
        </section>

        {/* ===== Featured Designs ===== */}
        <section className="container section">
          <div className="section-title reveal">
            <div>
              <div className="eyebrow">Featured Designs</div>
              <h2>热门设计 / 新款印花连衣裙</h2>
            </div>
            <Link href="/studio" className="btn small">
              查看全部设计 →
            </Link>
          </div>
          <div className="design-grid">
            {FEATURED.map((item) => (
              <article key={item.src} className="design-card reveal">
                <div className="media">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.src} alt={item.name} loading="lazy" />
                  <div className="badge-stack">
                    {item.tags.slice(0, 2).map((t, i) => (
                      <span
                        key={t}
                        className={`tag${i === 0 ? " rose" : ""}`}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="design-info">
                  <h3>{item.name}</h3>
                  <p className="muted" style={{ fontSize: 13 }}>
                    {item.subtitle}
                  </p>
                  <div className="design-meta">
                    <span>{item.designer}</span>
                    <span className="price">{item.price}</span>
                  </div>
                  <div
                    className="progress"
                    aria-label={`众定进度 ${progressPct(item.joined, item.required)}%`}
                  >
                    <span style={{ width: `${progressPct(item.joined, item.required)}%` }} />
                  </div>
                  <div className="design-meta">
                    <span>
                      {item.joined}/{item.required} 人众定
                    </span>
                    <span>♡ {24 + Math.floor(Math.random() * 60)}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ===== 正在热拼 ===== */}
        <section className="container section compact">
          <div className="section-title reveal">
            <div>
              <div className="eyebrow">Now Trending</div>
              <h2>正在热拼 · 即将成团</h2>
              <p className="lead">
                距离工厂下单仅差几人，邀请好友参团，双方各享 5% 优惠。
              </p>
            </div>
            <Link href="/studio" className="btn small">
              全部众定 →
            </Link>
          </div>
          <div className="group-rail">
            {GROUP_BUY.map((g) => {
              const pct = progressPct(g.joined, g.required);
              return (
                <article key={g.src} className="group-card reveal">
                  <div className="media">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={g.src} alt={g.name} loading="lazy" />
                    <span className="flame">HOT · {g.deadline}</span>
                  </div>
                  <div className="body">
                    <h3>{g.name}</h3>
                    <p className="muted" style={{ fontSize: 13 }}>
                      {g.subtitle}
                    </p>
                    <div className="status-row">
                      <span className="big-number">{g.joined}</span>
                      <span className="muted">/ {g.required} 人已参团</span>
                    </div>
                    <div
                      className="progress"
                      aria-label={`成团进度 ${pct}%`}
                    >
                      <span style={{ width: `${pct}%` }} />
                    </div>
                    <footer>
                      <span className="price">{g.price}</span>
                      <Link className="btn btn-rose small" href="/design">
                        参团购买
                      </Link>
                    </footer>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* ===== AI Tools ===== */}
        <section className="container section">
          <div className="section-title reveal">
            <div>
              <div className="eyebrow">AI Design Studio</div>
              <h2>不是出效果图，而是生成可生产的工艺单</h2>
              <p className="lead">
                从印花生成到 Tech Pack 输出，核心链路覆盖图案设计、上身预览、工艺说明与工厂对接。
              </p>
            </div>
            <Link href="/studio" className="btn btn-dark small">
              进入 AI 工具链
            </Link>
          </div>
          <div className="tool-chain">
            {AI_TOOLS.map((t) => (
              <article key={t.title} className="tool-card reveal">
                <div className="thumb">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={t.thumb} alt={t.title} loading="lazy" />
                </div>
                <div className="eyebrow">{t.eyebrow}</div>
                <h3>{t.title}</h3>
                <p>{t.desc}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ===== 品牌故事 ===== */}
        <section className="container section compact">
          <div className="section-title reveal">
            <div>
              <div className="eyebrow">Brand Heritage</div>
              <h2>品牌故事 · 印花连衣裙与私人定制</h2>
              <p className="lead">
                延续 MaxLuLu 15 年的经典高雅风格与自由主义气息，把线下门店的定制经验升级为 AI × 工厂对接能力。
              </p>
            </div>
          </div>
          <div className="story-grid">
            {BRAND_STORY.map((s) => (
              <div key={s.src} className={`story-cell reveal ${s.cls}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.src} alt={s.title} loading="lazy" />
                <div className="caption">
                  <small>{s.sub}</small>
                  <b>{s.title}</b>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer-grid">
          <div>
            <div className="brand-block">
              <span className="brand-name" style={{ color: "var(--charcoal)" }}>
                MaxLuLu AI
              </span>
              <span className="brand-sub">Fashion For You</span>
            </div>
            <p style={{ marginTop: 14 }}>
              15 年中高端女装品牌的 AI 化转型：让设计师的灵感被看见、被生产、被穿上身。
            </p>
            <p>巴黎灵感 · 上海原创 · 工艺单输出 · 工厂生产</p>
          </div>
          <div>
            <h4>平台</h4>
            <Link href="/studio">灵感画廊</Link>
            <Link href="/studio">AI Design Studio</Link>
            <Link href="/my">设计师中心</Link>
            <Link href="/my">工厂对接</Link>
          </div>
          <div>
            <h4>帮助</h4>
            <a href="#">新手指南</a>
            <a href="#">收益规则</a>
            <a href="#">众定规则</a>
            <a href="#">版权说明</a>
          </div>
          <div>
            <h4>关于我们</h4>
            <a href="#">品牌故事</a>
            <a href="#">设计师计划</a>
            <a href="#">院校合作</a>
            <a href="#">联系我们</a>
          </div>
          <div>
            <h4>订阅灵感更新</h4>
            <p>获取设计师招募、众定新品与 AI 工具更新。</p>
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <input
                className="field"
                placeholder="邮箱地址"
                style={{
                  flex: 1,
                  border: "1px solid var(--line)",
                  background: "#fffdf9",
                  padding: "10px 12px",
                  borderRadius: 12,
                  outline: "none",
                }}
              />
              <button type="button" className="btn btn-dark small">
                订阅
              </button>
            </div>
          </div>
        </div>
        <div className="container copyright">
          © 2009–2026 MaxLuLu AI · 沪ICP备示例号 · 隐私政策 · 用户协议
        </div>
      </footer>
    </div>
  );
}
