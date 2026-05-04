import Link from "next/link";
import type { Metadata } from "next";
import ConsumerNav from "@/components/ConsumerNav";
import "./my-studio.css";

type ToolVariant = "rose" | "blue" | "neutral";

export const metadata: Metadata = {
  title: "我的设计工作室 — MaxLuLu AI",
};

/* ---------- 路径前缀(spec §11)---------- */
const A_HERO  = "/assets/my-studio/01_hero";
const A_EMPTY = "/assets/my-studio/02_empty_state";
const A_TOOL  = "/assets/my-studio/03_tool_illustrations";
const A_WORK  = "/assets/my-studio/04_work_thumbnails";

const TOOLS: {
  id: string;
  href: string;
  title: string;
  desc: string;
  variant: ToolVariant;
  icon: string;
}[] = [
  {
    id: "pattern",
    href: "/studio/pattern/generate",
    title: "图案生成",
    desc: "用一句话生成专属印花,适合从零开始创作。",
    variant: "rose",
    icon: `${A_TOOL}/maxlulu-my-studio-tool-pattern-generation-512x512.png`,
  },
  {
    id: "seamless",
    href: "/studio/pattern/seamless",
    title: "四方连续",
    desc: "把单元图案扩展为可无缝循环的面料底图。",
    variant: "blue",
    icon: `${A_TOOL}/maxlulu-my-studio-tool-seamless-repeat-512x512.png`,
  },
  {
    id: "fabric",
    href: "/studio/fashion/fabric",
    title: "上身试穿",
    desc: "把印花贴到模特版型,一秒预览成衣效果。",
    variant: "neutral",
    icon: `${A_TOOL}/maxlulu-my-studio-tool-try-on-512x512.png`,
  },
  {
    id: "sketch",
    href: "/studio/fashion/sketch",
    title: "线稿生成",
    desc: "AI 帮你出连衣裙款式线稿,直接进入打版。",
    variant: "rose",
    icon: `${A_TOOL}/maxlulu-my-studio-tool-line-sketch-512x512.png`,
  },
];

const STATS = [
  {
    label: "我的作品",
    value: 28,
    icon: (
      <svg viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="6" width="20" height="16" rx="2" />
        <path d="M4 11h20" />
        <path d="M9 6V3.5h6V6" />
      </svg>
    ),
  },
  {
    label: "已定制",
    value: 6,
    icon: (
      <svg viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 8h18l-2 13H7z" />
        <path d="M10 8V5a4 4 0 0 1 8 0v3" />
      </svg>
    ),
  },
  {
    label: "已发布",
    value: 8,
    icon: (
      <svg viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 4l16 16-7 1-1 7-8-8" />
        <path d="M14 4L4 14l8 8 7-7" />
      </svg>
    ),
  },
];

/* spec §9 mockWorks 6 条,id / 标题 / 日期严格按文档 */
const MOCK_WORKS: { id: string; title: string; createdAt: string; image: string }[] = [
  {
    id: "rose-vine",
    title: "玫瑰藤蔓印花",
    createdAt: "今天 14:32",
    image: `${A_WORK}/maxlulu-my-studio-work-rose-vine-print-1080x1440.png`,
  },
  {
    id: "summer-garden",
    title: "夏日花园连衣裙",
    createdAt: "昨天 20:18",
    image: `${A_WORK}/maxlulu-my-studio-work-summer-garden-dress-1080x1440.png`,
  },
  {
    id: "blue-floral",
    title: "蓝韵繁花",
    createdAt: "4 月 28 日",
    image: `${A_WORK}/maxlulu-my-studio-work-blue-floral-print-1080x1440.png`,
  },
  {
    id: "sea-breeze",
    title: "海风微澜",
    createdAt: "4 月 24 日",
    image: `${A_WORK}/maxlulu-my-studio-work-summer-garden-dress-1080x1440.png`,
  },
  {
    id: "pink-sakura",
    title: "粉樱漫舞",
    createdAt: "4 月 20 日",
    image: `${A_WORK}/maxlulu-my-studio-work-rose-vine-print-1080x1440.png`,
  },
  {
    id: "spring-overture",
    title: "春日序曲",
    createdAt: "4 月 18 日",
    image: `${A_WORK}/maxlulu-my-studio-work-blue-floral-print-1080x1440.png`,
  },
];

const HERO_FIGURE = `${A_HERO}/maxlulu-my-studio-hero-fashion-illustration-1200x900.png`;
const HERO_FLORAL = `${A_HERO}/maxlulu-my-studio-hero-floral-bg-desktop-1920x600.png`;
// 空状态(目前 desktop 用 mock 渲染,移动 2 列也用 mock,保留备用)
// const EMPTY_ILLUSTRATION = `${A_EMPTY}/maxlulu-my-studio-empty-state-fashion-illustration-900x1200.png`;

function ActionIcon({ kind }: { kind: "save" | "buy" | "publish" }) {
  if (kind === "save") {
    return (
      <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 2v8M3.5 6.5L7 10l3.5-3.5" />
        <path d="M2 12h10" />
      </svg>
    );
  }
  if (kind === "buy") {
    return (
      <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 4h10l-1 8H3z" />
        <path d="M5 4V2.5a2 2 0 0 1 4 0V4" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 2v8M4 5l3-3 3 3" />
      <path d="M2 11h10" />
    </svg>
  );
}

export default function MyStudioPage() {
  return (
    <div className="page-wrap my-studio-page">
      <ConsumerNav variant="solid" />

      <div className="container">
        <section className="msHero">
          <div className="msHero__inner">
            <div className="msHero__copy">
              <p className="msHero__crumb">
                我的设计工作室
                <span className="slash"> / </span>
                my-studio
              </p>
              <h1>我的设计工作室</h1>
              <p className="msHero__display">My Design Studio</p>
              <p className="msHero__lead">
                从一句话开始,让 AI 把你的灵感变成印花、版型与成衣预览。所有作品保留在这里,可继续编辑、定制下单或发布到灵感广场。
              </p>
              <div className="msHero__stats" role="list" aria-label="工作室统计">
                {STATS.map((s) => (
                  <div className="msStat" key={s.label} role="listitem">
                    <span className="msStat__icon" aria-hidden>{s.icon}</span>
                    <div className="msStat__body">
                      <b>{s.value}</b>
                      <small>{s.label}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* spec §5.3:Hero 右侧两层图(floral bg 淡铺 + 人物 contain) */}
            <div className="msHero__visual" aria-hidden>
              <img className="msHero__floralImg" src={HERO_FLORAL} alt="" />
              <img className="msHero__figureImg" src={HERO_FIGURE} alt="" />
            </div>
          </div>
        </section>
      </div>

      <p className="msHint container">
        <span className="msHint__icon" aria-hidden>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 1.5l1.6 4.4 4.4 1.6-4.4 1.6L8 13.5l-1.6-4.4L2 7.5l4.4-1.6z" />
          </svg>
        </span>
        精选 4 个入门工具 · <b>认证设计师可解锁 16 个专业工具</b>
      </p>

      <section className="msTools container" aria-label="AI 创作工具入口">
        {TOOLS.map((t) => (
          <Link
            key={t.id}
            href={t.href}
            className={`msTool msTool--${t.variant}`}
          >
            <span className="msTool__icon" aria-hidden>
              <img src={t.icon} alt="" />
            </span>
            <h3>{t.title}</h3>
            <p>{t.desc}</p>
            <span className="msTool__cta">开始创作</span>
          </Link>
        ))}
      </section>

      <section className="msWorks container" aria-label="我的作品">
        <header className="msWorks__head">
          <h2>我的作品</h2>
          <Link href="/my-studio/works" className="msWorks__more">
            查看全部作品 →
          </Link>
        </header>

        <div className="msWorksGrid" role="list">
          {MOCK_WORKS.map((w) => (
            <article key={w.id} className="msWork" role="listitem">
              <div className="msWork__media">
                <img src={w.image} alt={w.title} />
              </div>
              <div className="msWork__body">
                <h3 className="msWork__title">{w.title}</h3>
                <p className="msWork__time">{w.createdAt}</p>
                <div className="msWork__actions">
                  <button type="button" className="msWork__action">
                    <ActionIcon kind="save" />
                    保存到相册
                  </button>
                  <button type="button" className="msWork__action msWork__action--accent">
                    <ActionIcon kind="buy" />
                    定制下单
                  </button>
                  <button type="button" className="msWork__action">
                    <ActionIcon kind="publish" />
                    发布到灵感广场
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
