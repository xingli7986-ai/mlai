import Link from "next/link";
import type { Metadata } from "next";
import ConsumerNav from "@/components/ConsumerNav";
import { Button, EmptyState } from "@/components/ui";
import "./my-studio.css";

export const metadata: Metadata = {
  title: "我的设计工作室 — MaxLuLu AI",
};

const TOOLS: {
  id: string;
  href: string;
  title: string;
  desc: string;
  variant: "primary" | "accent";
  icon: React.ReactNode;
}[] = [
  {
    id: "pattern",
    href: "/studio/pattern/generate",
    title: "图案生成",
    desc: "用一句话生成专属印花,适合从零开始创作。",
    variant: "primary",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="24" cy="24" r="6" />
        <circle cx="14" cy="14" r="4" />
        <circle cx="34" cy="14" r="4" />
        <circle cx="14" cy="34" r="4" />
        <circle cx="34" cy="34" r="4" />
        <path d="M14 18v8" />
        <path d="M34 18v8" />
        <path d="M18 14h8" />
        <path d="M18 34h8" />
      </svg>
    ),
  },
  {
    id: "seamless",
    href: "/studio/pattern/seamless",
    title: "四方连续",
    desc: "把单元图案扩展为可无缝循环的面料底图。",
    variant: "accent",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="6" y="6" width="14" height="14" rx="2" />
        <rect x="28" y="6" width="14" height="14" rx="2" />
        <rect x="6" y="28" width="14" height="14" rx="2" />
        <rect x="28" y="28" width="14" height="14" rx="2" />
        <path d="M20 13h8M20 35h8M13 20v8M35 20v8" />
      </svg>
    ),
  },
  {
    id: "fabric",
    href: "/studio/fashion/fabric",
    title: "上身试穿",
    desc: "把印花贴到模特版型,一秒预览成衣效果。",
    variant: "primary",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="24" cy="11" r="5" />
        <path d="M14 22l6-4h8l6 4-3 5-3-2v17H20V25l-3 2z" />
      </svg>
    ),
  },
  {
    id: "sketch",
    href: "/studio/fashion/sketch",
    title: "线稿生成",
    desc: "AI 帮你出连衣裙款式线稿,直接进入打版。",
    variant: "accent",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 35l24-24 4 4-24 24-6 2z" />
        <path d="M29 15l4 4" />
        <path d="M9 41h30" />
      </svg>
    ),
  },
];

const STATS = [
  {
    label: "我的作品",
    value: 0,
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
    value: 0,
    icon: (
      <svg viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 8h18l-2 13H7z" />
        <path d="M10 8V5a4 4 0 0 1 8 0v3" />
      </svg>
    ),
  },
  {
    label: "已发布",
    value: 0,
    icon: (
      <svg viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 4l16 16-7 1-1 7-8-8" />
        <path d="M14 4L4 14l8 8 7-7" />
      </svg>
    ),
  },
];

const HERO_BG = "/seed-images/inspiration/ChatGPT Image May 2, 2026, 06_17_43 PM (9).png";

export default function MyStudioPage() {
  return (
    <div className="page-wrap my-studio-page">
      <ConsumerNav variant="solid" />

      <div className="container">
        <section className="msHero">
          <div className="msHero__bg" aria-hidden>
            <img src={HERO_BG} alt="" />
          </div>
          <div className="msHero__overlay" aria-hidden />
          <div className="msHero__inner">
            <div className="msHero__copy">
              <p className="msHero__eyebrow">
                我的设计工作室
                <span className="slash"> / </span>
                my-studio
              </p>
              <p className="msHero__display">My Design Studio</p>
              <h1>我的设计工作室</h1>
              <p className="msHero__lead">
                从一句话开始,让 AI 把你的灵感变成印花、版型与成衣预览。所有作品保留在这里,可继续编辑、定制下单或发布到灵感广场。
              </p>
              <div className="msHero__cta">
                <Button as="a" href="/studio/pattern/generate" variant="primary" size="md">
                  开始创作
                </Button>
                <Button as="a" href="/inspiration" variant="secondary" size="md">
                  逛灵感广场
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="msStats container">
        {STATS.map((s) => (
          <div className="msStat" key={s.label}>
            <span className="msStat__icon" aria-hidden>{s.icon}</span>
            <div className="msStat__body">
              <b>{s.value}</b>
              <small>{s.label}</small>
            </div>
          </div>
        ))}
      </section>

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
            <span className="msTool__icon" aria-hidden>{t.icon}</span>
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

        <EmptyState
          className="msEmpty"
          icon={
            <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 14h28v22a2 2 0 0 1-2 2H12a2 2 0 0 1-2-2V14z" />
              <path d="M16 14V9a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v5" />
              <path d="M24 22v10" />
              <path d="M19 27h10" />
            </svg>
          }
          title="还没有作品"
          description="从第一朵花开始创作吧,完成一次生成后,你的作品会出现在这里。"
          action={
            <Button as="a" href="/studio/pattern/generate" variant="primary" size="md">
              开始第一次创作
            </Button>
          }
        />
      </section>
    </div>
  );
}
