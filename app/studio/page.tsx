"use client";

import Link from "next/link";

interface Tool {
  no: string;
  name: string;
  desc: string;
  href: string;
  enabled: boolean;
  gradient: [string, string];
}

const PATTERN_TOOLS: Tool[] = [
  { no: "01", name: "Pattern Generate", desc: "文字描述生成印花图案", href: "/studio/pattern/generate", enabled: false, gradient: ["#C8A875", "#7D5B6E"] },
  { no: "02", name: "Style Replicate", desc: "参考图片风格生成新图案", href: "/studio/pattern/replicate", enabled: false, gradient: ["#A3AC98", "#1E1E1E"] },
  { no: "03", name: "Seamless Tile", desc: "生成可无缝平铺的图案", href: "/studio/pattern/seamless", enabled: false, gradient: ["#F7D4CF", "#C68A44"] },
  { no: "04", name: "Pattern Fusion", desc: "两个图案融合为新设计", href: "/studio/pattern/fusion", enabled: false, gradient: ["#7D5B6E", "#0C0C0F"] },
  { no: "05", name: "Craft Fusion", desc: "刺绣 · 蜡染 · 烫金效果", href: "/studio/pattern/craft", enabled: false, gradient: ["#B8B176", "#C68A44"] },
  { no: "06", name: "Pattern Edit", desc: "局部标记修改图案", href: "/studio/pattern/edit", enabled: false, gradient: ["#C8A875", "#A3AC98"] },
  { no: "07", name: "Enhance", desc: "低分辨率图案超分放大", href: "/studio/pattern/enhance", enabled: false, gradient: ["#F7D4CF", "#7D5B6E"] },
];

const FASHION_TOOLS: Tool[] = [
  { no: "08", name: "Sketch", desc: "AI 生成服装技术平面图", href: "/studio/fashion/sketch", enabled: false, gradient: ["#1E1E1E", "#C8A875"] },
  { no: "09", name: "Render", desc: "线稿变真实效果图", href: "/studio/fashion/render", enabled: false, gradient: ["#C68A44", "#F7D4CF"] },
  { no: "10", name: "Modify", desc: "标记区域修改服装细节", href: "/studio/fashion/modify", enabled: false, gradient: ["#A3AC98", "#7D5B6E"] },
  { no: "11", name: "Innovate", desc: "AI 发散创意全新款式", href: "/studio/fashion/innovate", enabled: false, gradient: ["#C8A875", "#F7D4CF"] },
  { no: "12", name: "Style Mix", desc: "两款式融合为新设计", href: "/studio/fashion/style-mix", enabled: false, gradient: ["#7D5B6E", "#C68A44"] },
  { no: "13", name: "Color Series", desc: "同款多配色方案", href: "/studio/fashion/colors", enabled: false, gradient: ["#F7D4CF", "#A3AC98"] },
  { no: "14", name: "Recolor", desc: "指定区域精准换色", href: "/studio/fashion/recolor", enabled: false, gradient: ["#C68A44", "#0C0C0F"] },
  { no: "15", name: "Fabric Apply", desc: "面料贴到服装上", href: "/studio/fashion/fabric", enabled: false, gradient: ["#B8B176", "#7D5B6E"] },
  { no: "16", name: "Pattern Apply", desc: "印花穿在衣服上", href: "/studio/fashion/pattern", enabled: false, gradient: ["#A3AC98", "#C8A875"] },
];

function ToolCard({ tool }: { tool: Tool }) {
  const card = (
    <div className="group relative overflow-hidden rounded-xl transition hover:-translate-y-0.5">
      <div
        className="relative aspect-square"
        style={{
          background: `linear-gradient(135deg, ${tool.gradient[0]} 0%, ${tool.gradient[1]} 100%)`,
        }}
      >
        <div
          className="absolute left-3 top-3 text-[11px] tracking-[0.25em]"
          style={{
            color: "rgba(249,249,255,0.75)",
            fontFamily: "var(--font-display)",
          }}
        >
          {tool.no}
        </div>
        {!tool.enabled && (
          <div
            className="absolute inset-0 flex items-center justify-center transition"
            style={{ backgroundColor: "rgba(12,12,15,0.45)" }}
          >
            <span
              className="rounded-full px-3 py-1 text-[11px] tracking-[0.2em]"
              style={{
                backgroundColor: "rgba(12,12,15,0.7)",
                color: "#F9F9FF",
                fontFamily: "var(--font-display)",
              }}
            >
              Coming Soon
            </span>
          </div>
        )}
      </div>

      <div
        className="flex flex-col gap-1 px-4 py-4"
        style={{ backgroundColor: "#1E1E1E" }}
      >
        <div className="flex items-baseline gap-2">
          <span
            className="text-[11px] font-semibold tracking-[0.2em]"
            style={{ color: "#C8A875" }}
          >
            {tool.no}
          </span>
          <h3
            className="text-base font-semibold tracking-tight"
            style={{
              color: "#F9F9FF",
              fontFamily: "var(--font-body)",
            }}
          >
            {tool.name}
          </h3>
        </div>
        <p className="text-[13px] leading-relaxed" style={{ color: "#D8D7D3" }}>
          {tool.desc}
        </p>
      </div>
    </div>
  );

  if (!tool.enabled) {
    return <div className="cursor-not-allowed">{card}</div>;
  }
  return <Link href={tool.href}>{card}</Link>;
}

function Section({ title, subtitle, tools }: { title: string; subtitle: string; tools: Tool[] }) {
  return (
    <section>
      <div className="mb-5 flex items-baseline justify-between gap-4">
        <div>
          <h2
            className="text-xl font-semibold tracking-wide sm:text-2xl"
            style={{ color: "#F9F9FF", fontFamily: "var(--font-display)" }}
          >
            {title}
          </h2>
          <p className="mt-1 text-sm" style={{ color: "#D8D7D3" }}>
            {subtitle}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
        {tools.map((t) => (
          <ToolCard key={t.no} tool={t} />
        ))}
      </div>
    </section>
  );
}

export default function StudioHomePage() {
  return (
    <div className="mx-auto max-w-[1280px] space-y-12 pb-20">
      <header className="space-y-2">
        <h1
          className="text-[30px] font-semibold leading-tight tracking-tight sm:text-[34px]"
          style={{ color: "#F9F9FF", fontFamily: "var(--font-display)" }}
        >
          Welcome to AI Design Studio
        </h1>
        <p
          className="text-base tracking-wide"
          style={{ color: "#D8D7D3", fontFamily: "var(--font-body)" }}
        >
          Create, Explore, Elevate
        </p>
      </header>

      <Section
        title="Pattern Studio"
        subtitle="图案工作室 · 7 tools"
        tools={PATTERN_TOOLS}
      />
      <Section
        title="Fashion Lab"
        subtitle="服装实验室 · 9 tools"
        tools={FASHION_TOOLS}
      />
    </div>
  );
}
