"use client";

import Link from "next/link";

interface Tool {
  no: string;
  name: string;
  desc: string;
  href: string;
  enabled: boolean;
}

const PATTERN_TOOLS: Tool[] = [
  { no: "01", name: "图案生成", desc: "用文字描述生成印花图案", href: "/studio/pattern/generate", enabled: false },
  { no: "02", name: "画风复刻", desc: "参考图片风格生成新图案", href: "/studio/pattern/replicate", enabled: false },
  { no: "03", name: "四方连续", desc: "生成可无缝平铺的图案", href: "/studio/pattern/seamless", enabled: false },
  { no: "04", name: "图案融合", desc: "两个图案融合为新设计", href: "/studio/pattern/fusion", enabled: false },
  { no: "05", name: "工艺融合", desc: "看图案的刺绣/蜡染/烫金效果", href: "/studio/pattern/craft", enabled: false },
  { no: "06", name: "图案涂改", desc: "局部标记修改图案", href: "/studio/pattern/edit", enabled: false },
  { no: "07", name: "图案变清晰", desc: "低分辨率图案超分放大", href: "/studio/pattern/enhance", enabled: false },
];

const FASHION_TOOLS: Tool[] = [
  { no: "08", name: "线稿生成", desc: "AI 生成服装技术平面图", href: "/studio/fashion/sketch", enabled: false },
  { no: "09", name: "线稿成款", desc: "把线稿变成真实效果图", href: "/studio/fashion/render", enabled: false },
  { no: "10", name: "局部改款", desc: "标记区域修改服装细节", href: "/studio/fashion/modify", enabled: false },
  { no: "11", name: "款式创新", desc: "AI 发散创意全新款式", href: "/studio/fashion/innovate", enabled: false },
  { no: "12", name: "风格融合", desc: "两个款式融合为新设计", href: "/studio/fashion/style-mix", enabled: false },
  { no: "13", name: "系列配色", desc: "同款生成多种配色方案", href: "/studio/fashion/colors", enabled: false },
  { no: "14", name: "定向换色", desc: "指定区域精准换色", href: "/studio/fashion/recolor", enabled: false },
  { no: "15", name: "面料上身", desc: "面料贴到服装上看效果", href: "/studio/fashion/fabric", enabled: false },
  { no: "16", name: "图案上身", desc: "印花穿在衣服上的效果", href: "/studio/fashion/pattern", enabled: false },
];

function ToolCard({ tool }: { tool: Tool }) {
  const content = (
    <div
      className="group relative flex h-full flex-col rounded-2xl border p-4 transition sm:p-5"
      style={{
        backgroundColor: "#44283A",
        borderColor: "#44283A",
      }}
    >
      <div
        className="text-xs font-semibold tracking-widest"
        style={{ color: "#C8A875" }}
      >
        {tool.no}
      </div>
      <div className="mt-2 text-base font-semibold sm:text-lg" style={{ color: "#F4EFE6" }}>
        {tool.name}
      </div>
      <div className="mt-1 text-xs leading-relaxed sm:text-sm" style={{ color: "#987283" }}>
        {tool.desc}
      </div>

      {!tool.enabled && (
        <div
          className="pointer-events-none absolute inset-0 flex items-end justify-end rounded-2xl p-3"
          style={{ backgroundColor: "rgba(45,27,38,0.55)" }}
        >
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-medium"
            style={{ backgroundColor: "#2D1B26", color: "#987283" }}
          >
            即将推出
          </span>
        </div>
      )}
    </div>
  );

  if (!tool.enabled) {
    return (
      <div
        className="cursor-not-allowed"
        style={{ outline: "none" }}
        aria-disabled
      >
        {content}
      </div>
    );
  }

  return (
    <Link
      href={tool.href}
      className="block outline-none transition hover:-translate-y-0.5"
    >
      <style jsx>{`
        a:hover > div {
          border-color: #c8a875 !important;
        }
      `}</style>
      {content}
    </Link>
  );
}

function Section({ title, tools }: { title: string; tools: Tool[] }) {
  return (
    <section>
      <h2
        className="mb-4 flex items-center gap-3 text-lg font-semibold sm:text-xl"
        style={{ color: "#F4EFE6" }}
      >
        <span
          className="inline-block h-4 w-[3px] rounded-full"
          style={{ backgroundColor: "#C8A875" }}
          aria-hidden
        />
        {title}
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {tools.map((t) => (
          <ToolCard key={t.no} tool={t} />
        ))}
      </div>
    </section>
  );
}

export default function StudioHomePage() {
  return (
    <div className="mx-auto max-w-7xl space-y-10 pb-16">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl" style={{ color: "#F4EFE6" }}>
          AI 设计工作室
        </h1>
        <p className="text-sm sm:text-base" style={{ color: "#987283" }}>
          和 AI 一起定义新时尚
        </p>
      </header>

      <Section title="图案工作室" tools={PATTERN_TOOLS} />
      <Section title="服装实验室" tools={FASHION_TOOLS} />
    </div>
  );
}
