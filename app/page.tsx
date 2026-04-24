"use client";

import Link from "next/link";
import { Fragment, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import "./homepage.css";

const R2 = "https://pub-39ccb989bffa4f729bb1ae58876f3b36.r2.dev/brand";

const HERO_IMAGE = `${R2}/home/01-hero/01-01-hero.png`;

const FEATURED = [
  {
    src: `${R2}/home/02-featured-designs/01-02-featured-designs.png`,
    name: "Ink Blossom 裹身裙",
    subtitle: "印花针织裹身连衣裙",
    designer: "Mia · 上海",
    price: "¥1,280 起",
    joined: 18,
    required: 30,
    likes: 68,
    status: { label: "众定中", cls: "sage" },
  },
  {
    src: `${R2}/home/02-featured-designs/02-02-featured-designs.png`,
    name: "Moon Garden 连衣裙",
    subtitle: "印花针织裹身连衣裙",
    designer: "Luna · 杭州",
    price: "¥1,380 起",
    joined: 24,
    required: 30,
    likes: 92,
    status: { label: "即将成团", cls: "rose" },
  },
  {
    src: `${R2}/home/02-featured-designs/03-02-featured-designs.png`,
    name: "Rose de Paris",
    subtitle: "印花针织裹身连衣裙",
    designer: "Clair · 巴黎",
    price: "¥1,480 起",
    joined: 12,
    required: 30,
    likes: 41,
    status: { label: "众定中", cls: "sage" },
  },
  {
    src: `${R2}/home/02-featured-designs/04-02-featured-designs.png`,
    name: "Shanghai Noir",
    subtitle: "印花针织裹身连衣裙",
    designer: "Yu · 上海",
    price: "¥1,580 起",
    joined: 27,
    required: 30,
    likes: 120,
    status: { label: "即将成团", cls: "rose" },
  },
];

const FEATURED_DETAIL = {
  name: "墨影花园",
  subtitle: "印花针织裹身连衣裙",
  joined: 18,
  required: 30,
  countdown: { d: "02", h: "14", m: "32", s: "18" },
  priceRange: "¥699-899",
  milestones: [
    { label: "起定", reached: true },
    { label: "10人", reached: true },
    { label: "30人", reached: false },
    { label: "成团", reached: false },
  ],
};

const AI_TOOL_GROUPS = [
  {
    eyebrow: "Print Studio",
    title: "印花设计",
    sub: "图案生成 · 四方连续 · 配色方案",
    thumb: `${R2}/home/04-ai-tools/01-04-ai-tools.png`,
    items: [
      { name: "图案生成", desc: "文字描述生成原创印花" },
      { name: "四方连续", desc: "无缝平铺，生产级输出" },
      { name: "配色方案", desc: "一键切换 4 套配色" },
      { name: "局部改款", desc: "框选区域精准修改" },
    ],
  },
  {
    eyebrow: "Garment Design",
    title: "款式开发",
    sub: "款式线稿 · 结构 · 裁片 · 细节",
    thumb: `${R2}/home/04-ai-tools/02-04-ai-tools.png`,
    items: [
      { name: "款式线稿", desc: "专业 Tech Flat 线稿" },
      { name: "结构图", desc: "衣身分割与省道" },
      { name: "裁片图", desc: "制版师直接下料" },
      { name: "细节图", desc: "领口/袖口/下摆" },
    ],
  },
  {
    eyebrow: "On-body Preview",
    title: "上身预览",
    sub: "模特 · 面料 · 多角度 · 场景",
    thumb: `${R2}/home/04-ai-tools/03-04-ai-tools.png`,
    items: [
      { name: "模特上身", desc: "自定义身高/体型/肤色" },
      { name: "面料上身", desc: "实拍级面料质感" },
      { name: "多角度展示", desc: "前/后/侧一键切换" },
      { name: "场景置景", desc: "街景/门店/棚拍" },
    ],
  },
  {
    eyebrow: "Production Pack",
    title: "生产输出",
    sub: "Tech Pack · BOM · 尺码表",
    thumb: `${R2}/home/04-ai-tools/04-04-ai-tools.png`,
    items: [
      { name: "Tech Pack", desc: "技术线稿 + 工艺说明" },
      { name: "BOM 清单", desc: "面辅料与用量明细" },
      { name: "尺码表", desc: "XS–XL 关键部位放码" },
    ],
  },
];

const DESIGNER_FEATURES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 4h16v12H4zM8 20h8M12 16v4" />
      </svg>
    ),
    title: "发布原创设计",
    desc: "上传你的设计稿或用 AI Studio 共创，三重审核后上架灵感画廊。",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v10M9.5 9.5c0-1 1-2 2.5-2s2.5 1 2.5 2c0 2.5-5 1.5-5 4 0 1 1 2 2.5 2s2.5-1 2.5-2" />
      </svg>
    ),
    title: "赚取分润 8%–12%",
    desc: "众定成团后按销售额分润，阶梯计费，爆款月入过万不封顶。",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 4h14v5a7 7 0 0 1-14 0V4Z" />
        <path d="M9 20h6M12 16v4" />
        <path d="M5 7H3a2 2 0 0 0 2 5M19 7h2a2 2 0 0 1-2 5" />
      </svg>
    ),
    title: "官方挑战赛",
    desc: "每季主题赛、校园赛，最高 10 万元奖金与签约机会。",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3 4 6v6c0 5 3 8 8 9 5-1 8-4 8-9V6l-8-3Z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
    title: "版权保护",
    desc: "区块链存证与 DMCA 维权渠道，你的作品你做主。",
  },
];

const PRODUCE_FLOW = [
  { title: "工厂报价", sub: "3 工作日内" },
  { title: "打样确认", sub: "7 工作日" },
  { title: "批量生产", sub: "15 工作日" },
  { title: "质检发货", sub: "24h 内发出" },
];

const BOM_ROWS = [
  { item: "面料 · 高弹印花针织", spec: "92% 聚酯纤维 / 8% 氨纶", qty: "1.8 m" },
  { item: "里布", spec: "轻量里布", qty: "0.6 m" },
  { item: "主标 / 洗标", spec: "MaxLuLu 标", qty: "1 套" },
  { item: "拉链", spec: "YKK 隐形", qty: "1 根" },
];

const BRAND_POINTS = [
  {
    title: "2009 年创立",
    desc: "15 年中高端印花女装沉淀，1000+ 私人定制案例。",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3v2M12 19v2M3 12h2M19 12h2" />
        <circle cx="12" cy="12" r="6" />
      </svg>
    ),
  },
  {
    title: "巴黎灵感 × 上海原创",
    desc: "延续法式优雅与东方美学，品牌设计总监常驻巴黎与上海。",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 20V6l9-3 9 3v14" />
        <path d="M9 20V10m6 10V10" />
        <path d="M3 20h18" />
      </svg>
    ),
  },
  {
    title: "私人定制经验",
    desc: "线下旗舰店 15 年量体裁衣经验，沉淀为 AI × 工厂能力。",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M8 6a4 4 0 0 1 8 0v3H8V6Z" />
        <path d="M6 9h12l-1 11a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L6 9Z" />
      </svg>
    ),
  },
  {
    title: "全球代理",
    desc: "北京、上海、东京、巴黎、纽约 5 城代理门店供货。",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
      </svg>
    ),
  },
];

const BRAND_MOSAIC = [
  {
    src: `${R2}/home/07-brand-story/01-07-brand-story.png`,
    title: "巴黎灵感 × 上海原创",
    sub: "Parisian Inspiration",
  },
  {
    src: `${R2}/home/07-brand-story/02-07-brand-story.png`,
    title: "针织印花连衣裙",
    sub: "Signature Silhouette",
  },
  {
    src: `${R2}/home/07-brand-story/03-07-brand-story.png`,
    title: "设计师共创",
    sub: "Open Creator Program",
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

// 5 process step icons — line SVGs, 24×24 viewBox.
function ProcIcon({ idx }: { idx: number }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (idx) {
    case 0: // 设计师 — palette
      return (
        <svg {...common}>
          <path d="M12 3a9 9 0 1 0 2 17.8c.9-.2 1-1.3.4-2l-.4-.4c-.5-.6-.4-1.6.4-1.9l2.2-.5A3 3 0 0 0 19 13c0-5-3-10-7-10Z" />
          <circle cx="7.5" cy="10.5" r="1" fill="currentColor" />
          <circle cx="11.5" cy="7" r="1" fill="currentColor" />
          <circle cx="15.5" cy="8.5" r="1" fill="currentColor" />
        </svg>
      );
    case 1: // AI Studio — sparkles
      return (
        <svg {...common}>
          <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" />
          <circle cx="12" cy="12" r="1.2" fill="currentColor" />
        </svg>
      );
    case 2: // 众定 — users
      return (
        <svg {...common}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
          <circle cx="9.5" cy="7" r="3.5" />
          <path d="M21 21v-2a4 4 0 0 0-3-3.9M17 3.1a4 4 0 0 1 0 7.8" />
        </svg>
      );
    case 3: // 工厂 — factory
      return (
        <svg {...common}>
          <path d="M3 21V10l5 3V10l5 3V8l8 5v8H3Z" />
          <path d="M6 18h2M11 18h2M16 18h2" />
        </svg>
      );
    case 4: // 分润 — yen / trending up
      return (
        <svg {...common}>
          <path d="M4 18h16" />
          <path d="M9 7 6 14M15 7l-3 7M9 11h6M8.5 14h7" />
        </svg>
      );
    default:
      return null;
  }
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

  const detailPct = Math.round(
    (FEATURED_DETAIL.joined / FEATURED_DETAIL.required) * 100
  );

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
            <Link
              key={l.label}
              href={l.href}
              className={l.match === "home" ? "is-active" : ""}
            >
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
        {/* ===== 区域 1 Hero ===== */}
        <section className="hero">
          <div className="container hero-inner">
            <div className="hero-copy reveal">
              <div className="eyebrow">
                MaxLuLu AI · 15 Years of Printed Knit Dress
              </div>
              <h1>
                <span>让设计师的灵感，</span>
                <span>被看见、被生产、</span>
                <span>被穿上身</span>
              </h1>
              <p className="hero-sub">
                MaxLuLu AI × 15 年印花针织连衣裙品牌
                <br />
                从印花生成到工艺单，再到工厂生产，AI 驱动一体化共创平台。
              </p>
              <div className="hero-actions">
                <Link href="/studio" className="btn btn-dark">
                  开始设计
                </Link>
                <Link href="/design" className="btn">
                  浏览灵感画廊
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
                  <strong>100万+</strong>
                  <span>累计众定件数</span>
                </div>
                <div className="kpi">
                  <strong>100+</strong>
                  <span>合作工厂</span>
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

        {/* ===== 区域 2 5 步流程条 ===== */}
        <section className="process-bar" aria-label="平台运作流程">
          <div className="container process-grid">
            {[
              { title: "设计师 · 创作者", sub: "发布原创设计" },
              { title: "AI Design Studio", sub: "AI 设计与款式开发" },
              { title: "众定 · 定制", sub: "积累订单达成众定" },
              { title: "工厂生产", sub: "工艺单对接批量生产" },
              { title: "设计师分润", sub: "8%–12% 收益分成" },
            ].map((step, i, arr) => (
              <div key={step.title} className="process-step">
                <div className="step-icon">
                  <ProcIcon idx={i} />
                </div>
                <div>
                  <b>
                    <span className="step-no">0{i + 1}</span>
                    {step.title}
                  </b>
                  <small>{step.sub}</small>
                </div>
                <span className="arrow" aria-hidden="true">
                  {i < arr.length - 1 ? "→" : ""}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ===== 区域 3 热门设计 / 正在众定 ===== */}
        <section className="container section">
          <div className="section-title reveal">
            <div>
              <div className="eyebrow">Featured Co-Orders</div>
              <h2>热门设计 / 正在众定</h2>
            </div>
            <Link href="/studio" className="btn small">
              查看全部设计 →
            </Link>
          </div>

          <div className="featured-layout">
            <div className="featured-grid">
              {FEATURED.map((item) => (
                <article key={item.src} className="design-card reveal">
                  <div className="media">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.src} alt={item.name} loading="lazy" />
                    <span className={`tag ${item.status.cls} status-tag`}>
                      {item.status.label}
                    </span>
                    <button
                      type="button"
                      className="like-btn"
                      aria-label={`收藏 ${item.name}`}
                    >
                      ♡
                    </button>
                  </div>
                  <div className="design-info">
                    <div className="title-row">
                      <h3>{item.name}</h3>
                      <span className="price">{item.price}</span>
                    </div>
                    <div className="sub">{item.subtitle}</div>
                    <div className="meta">
                      <span>
                        {item.joined}/{item.required} 人众定
                      </span>
                      <span>♡ {item.likes}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <aside className="detail-panel reveal">
              <div className="kicker">正在众定</div>
              <div>
                <h3>{FEATURED_DETAIL.name}</h3>
                <div className="sub-name">{FEATURED_DETAIL.subtitle}</div>
              </div>

              <div className="big-progress">
                <span className="num">{FEATURED_DETAIL.joined}</span>
                <span className="of">/ {FEATURED_DETAIL.required} 件</span>
                <span className="pct">已达成 {detailPct}%</span>
              </div>
              <div
                className="progress"
                aria-label={`众定进度 ${detailPct}%`}
              >
                <span style={{ width: `${detailPct}%` }} />
              </div>

              <div>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--muted)",
                    letterSpacing: "0.08em",
                    marginBottom: 6,
                  }}
                >
                  距离成团剩余
                </div>
                <div className="countdown">
                  {[
                    { b: FEATURED_DETAIL.countdown.d, s: "天" },
                    { b: FEATURED_DETAIL.countdown.h, s: "时" },
                    { b: FEATURED_DETAIL.countdown.m, s: "分" },
                    { b: FEATURED_DETAIL.countdown.s, s: "秒" },
                  ].map((c) => (
                    <div key={c.s} className="cd-cell">
                      <b>{c.b}</b>
                      <small>{c.s}</small>
                    </div>
                  ))}
                </div>
              </div>

              <div className="milestones" aria-label="里程碑进度">
                {FEATURED_DETAIL.milestones.map((m) => (
                  <div
                    key={m.label}
                    className={`milestone ${m.reached ? "reached" : ""}`}
                  >
                    <div className="dot" />
                    <small>{m.label}</small>
                  </div>
                ))}
              </div>

              <div className="price-row">
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--muted)",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                    }}
                  >
                    众定价
                  </div>
                  <div className="pr">{FEATURED_DETAIL.priceRange}</div>
                </div>
                <Link className="btn btn-sage small" href="/design">
                  邀请好友 立减 ¥50
                </Link>
              </div>

              <Link
                href="/design"
                className="btn small"
                style={{ justifyContent: "space-between" }}
              >
                <span>查看更多</span>
                <span aria-hidden="true">→</span>
              </Link>
            </aside>
          </div>
        </section>

        {/* ===== 区域 4 AI 工具链 ===== */}
        <section className="container section">
          <div className="chain-head reveal">
            <div>
              <div className="eyebrow">AI Tool Chain</div>
              <h2>AI 工具链</h2>
              <p className="lead">从灵感到生产，一站式 AI 设计工具链。</p>
            </div>
            <Link href="/studio" className="btn btn-dark small">
              进入 AI Studio →
            </Link>
          </div>

          <div className="tool-chain">
            {AI_TOOL_GROUPS.map((group, gi) => (
              <Fragment key={group.title}>
                <article className="tool-group reveal">
                  <div className="group-head">
                    <div className="eyebrow">{group.eyebrow}</div>
                    <h3>{group.title}</h3>
                    <div className="group-sub">{group.sub}</div>
                  </div>
                  <div className="sub-list">
                    {group.items.map((it) => (
                      <div key={it.name} className="sub-item">
                        <div className="thumb">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={group.thumb} alt={it.name} loading="lazy" />
                        </div>
                        <div>
                          <b>{it.name}</b>
                          <small>{it.desc}</small>
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
                {gi < AI_TOOL_GROUPS.length - 1 && (
                  <div className="chain-arrow" aria-hidden="true">
                    →
                  </div>
                )}
              </Fragment>
            ))}
          </div>
        </section>

        {/* ===== 区域 5 设计师赚钱 + 工艺单工厂 ===== */}
        <section className="container section">
          <div className="split-duo">
            <div className="panel reveal">
              <div>
                <div className="eyebrow">Designer Earnings</div>
                <h2>如何帮助设计师赚钱</h2>
                <p className="muted" style={{ marginTop: 8 }}>
                  发布设计，获得订单，赚取分润。
                </p>
              </div>
              <div className="feature-list">
                {DESIGNER_FEATURES.map((f) => (
                  <div key={f.title} className="feature-row">
                    <div className="icon-badge">{f.icon}</div>
                    <div>
                      <b>{f.title}</b>
                      <small>{f.desc}</small>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/my" className="btn btn-dark" style={{ justifySelf: "start" }}>
                申请设计师计划 →
              </Link>
            </div>

            <div className="panel reveal">
              <div>
                <div className="eyebrow">Tech Pack & Factory</div>
                <h2>工艺单与工厂生产</h2>
                <p className="muted" style={{ marginTop: 8 }}>
                  AI 自动生成 Tech Pack + BOM，对接 100+ 合作工厂。
                </p>
              </div>

              <div className="techpack-preview">
                <div className="stack">
                  <div className="tile">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`${R2}/home/06-techpack-factory/01-06-techpack-factory.png`}
                      alt="Tech Pack 示例"
                      loading="lazy"
                    />
                  </div>
                  <div className="tile">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`${R2}/home/06-techpack-factory/02-06-techpack-factory.png`}
                      alt="工厂生产示例"
                      loading="lazy"
                    />
                  </div>
                </div>

                <div className="bom-preview">
                  <h4>BOM 物料清单（节选）</h4>
                  <table>
                    <thead>
                      <tr>
                        <th>项目</th>
                        <th>规格</th>
                        <th>用量</th>
                      </tr>
                    </thead>
                    <tbody>
                      {BOM_ROWS.map((row) => (
                        <tr key={row.item}>
                          <td>{row.item}</td>
                          <td>{row.spec}</td>
                          <td>{row.qty}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="produce-flow">
                {PRODUCE_FLOW.map((s, i) => (
                  <div key={s.title} className="flow-step">
                    <b>
                      {i + 1}. {s.title}
                    </b>
                    <small>{s.sub}</small>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ===== 区域 6 品牌背书 ===== */}
        <section className="container section">
          <div className="section-title reveal">
            <div>
              <div className="eyebrow">Brand Heritage</div>
              <h2>品牌背书 · 15 年印花针织连衣裙专家</h2>
              <p className="lead">
                巴黎灵感、上海原创、私人定制经验、全球代理。
              </p>
            </div>
          </div>
          <div className="endorse-grid">
            <div className="endorse-points reveal">
              {BRAND_POINTS.map((p) => (
                <div key={p.title} className="endorse-point">
                  <div className="icon-badge">{p.icon}</div>
                  <div>
                    <b>{p.title}</b>
                    <small>{p.desc}</small>
                  </div>
                </div>
              ))}
            </div>
            <div className="endorse-mosaic reveal">
              {BRAND_MOSAIC.map((m) => (
                <div key={m.src} className="cell">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.src} alt={m.title} loading="lazy" />
                  <div className="cap">
                    <small>{m.sub}</small>
                    <b>{m.title}</b>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* ===== 区域 7 Footer ===== */}
      <footer className="footer">
        <div className="container footer-grid">
          <div>
            <div className="brand-block">
              <span className="brand-name">MaxLuLu AI</span>
              <span className="brand-sub">Fashion For You</span>
            </div>
            <p style={{ marginTop: 14 }}>
              15 年中高端女装品牌的 AI 化转型：让设计师的灵感被看见、被生产、被穿上身。
            </p>
            <p>巴黎灵感 · 上海原创 · 工艺单输出 · 工厂生产</p>
            <div className="socials" aria-label="社交媒体">
              <a href="#" aria-label="微信">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M9 4C4.6 4 1 6.9 1 10.4c0 1.9 1.1 3.6 2.8 4.8L3 18l3.1-1.5c.6.1 1.2.2 1.9.2h.6c-.2-.6-.3-1.2-.3-1.9 0-3.4 3.4-6.2 7.6-6.2h.7C15.8 6 12.7 4 9 4Zm-3 3.5c.6 0 1 .4 1 1s-.4 1-1 1-1-.4-1-1 .4-1 1-1Zm6 0c.6 0 1 .4 1 1s-.4 1-1 1-1-.4-1-1 .4-1 1-1Zm3.9 3.3c-3.7 0-6.7 2.5-6.7 5.6 0 1.7.9 3.2 2.4 4.2l-.6 1.9 2.5-1.3c.7.2 1.5.3 2.3.3 3.7 0 6.7-2.5 6.7-5.6s-3-5.1-6.6-5.1Zm-2.2 3c.5 0 .9.4.9.8s-.4.9-.9.9-.9-.4-.9-.8.4-.9.9-.9Zm4.4 0c.5 0 .9.4.9.8s-.4.9-.9.9-.9-.4-.9-.8.4-.9.9-.9Z" />
                </svg>
              </a>
              <a href="#" aria-label="微博">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M10.3 12.2c-3 .3-5.3 2-5.3 3.9 0 2 2.5 3.5 5.6 3.4 3.3-.1 6-2 6-4.1 0-2-2.7-3.4-6.3-3.2Zm.3 5.4c-1.2.2-2.3-.3-2.4-1.1-.1-.8.8-1.6 2-1.8 1.3-.2 2.4.3 2.5 1.1.1.8-.9 1.6-2.1 1.8Zm.6-3.1c-.4 0-.8.2-.8.5s.4.6.8.5c.4-.1.7-.3.6-.6 0-.3-.3-.5-.6-.4Zm1.3 1.1c-.1.1 0 .3.2.3.1 0 .3-.1.4-.2.1-.1 0-.3-.2-.3-.1-.1-.3 0-.4.2Zm5-9.6c-1.6-1.8-4-2.5-6.2-2-.5.1-.8.6-.7 1.1.1.5.6.8 1.1.7 1.6-.3 3.2.2 4.3 1.4s1.4 2.8 1 4.3c-.2.5.2 1 .6 1.1.5.2 1-.2 1.1-.6.6-2.1.3-4.2-1.2-6Zm-2.3 2.1c-.8-.9-2-1.2-3.1-.9-.4.1-.7.5-.6.9s.5.7.9.6c.5-.1 1.1 0 1.5.5.4.4.5 1 .4 1.5-.1.4.2.8.6.9.4.1.8-.2.9-.6.3-1-.1-2.1-.6-2.9Z" />
                  <path d="M6.3 5.1C4.5 4.4 2.5 5 1 6.8v2c1.5-1.6 3.4-2 4.9-1.3 1.2.5 1.8 1.5 1.6 2.7-.1.5.2 1 .7 1s1-.2 1-.7c.4-1.9-.6-3.7-2.9-4.4Z" />
                </svg>
              </a>
              <a href="#" aria-label="小红书">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4 3h16v18H4z" />
                  <path d="M8 8h8v8H8z" fill="#fff" />
                </svg>
              </a>
              <a href="#" aria-label="Instagram">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2.2c2.7 0 3 0 4 .1 1 0 1.6.2 2 .4.5.2.9.5 1.3.9s.7.8.9 1.3c.2.4.3 1 .4 2 .1 1 .1 1.4.1 4s0 3-.1 4c0 1-.2 1.6-.4 2-.2.5-.5.9-.9 1.3s-.8.7-1.3.9c-.4.2-1 .3-2 .4-1 .1-1.4.1-4 .1s-3 0-4-.1c-1 0-1.6-.2-2-.4-.5-.2-.9-.5-1.3-.9S3.5 17.7 3.3 17c-.2-.4-.3-1-.4-2-.1-1-.1-1.4-.1-4s0-3 .1-4c0-1 .2-1.6.4-2 .2-.5.5-.9.9-1.3s.8-.7 1.3-.9c.4-.2 1-.3 2-.4 1-.1 1.4-.1 4-.1Zm0 3.3c-3.5 0-6.3 2.9-6.3 6.5S8.5 18.5 12 18.5s6.3-2.9 6.3-6.5S15.5 5.5 12 5.5Zm0 10.8a4.3 4.3 0 1 1 0-8.6 4.3 4.3 0 0 1 0 8.6Zm6.6-11a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z" />
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h4>平台</h4>
            <Link href="/studio">灵感画廊</Link>
            <Link href="/studio">AI Design Studio</Link>
            <Link href="/my">设计师计划</Link>
            <Link href="/design">众定 / 定制</Link>
            <Link href="/my">工厂对接</Link>
          </div>

          <div>
            <h4>帮助</h4>
            <a href="#">新手指南</a>
            <a href="#">设计师入驻</a>
            <a href="#">众定规则</a>
            <a href="#">常见问题</a>
          </div>

          <div>
            <h4>关于</h4>
            <a href="#">品牌故事</a>
            <a href="#">商务合作</a>
            <a href="#">加入我们</a>
          </div>

          <div>
            <h4>订阅灵感更新</h4>
            <p>获取设计师招募、众定新品与 AI 工具更新。</p>
            <div className="newsletter">
              <input type="email" placeholder="邮箱地址" aria-label="邮箱地址" />
              <button type="button" className="btn btn-dark small">
                订阅
              </button>
            </div>
          </div>
        </div>

        <div className="container copyright">
          <span>© 2009–2026 MaxLuLu AI. All Rights Reserved.</span>
          <span>沪ICP备示例号</span>
          <span>沪公网安备示例号</span>
          <a href="#">隐私政策</a>
          <a href="#">用户协议</a>
        </div>
      </footer>
    </div>
  );
}
