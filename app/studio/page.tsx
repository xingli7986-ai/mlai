"use client";

import Link from "next/link";

const R2 = "https://pub-39ccb989bffa4f729bb1ae58876f3b36.r2.dev/brand";

const PROJECT_ITEMS = [
  {
    name: "Ink Blossom 裹身裙",
    code: "TP-25SS-001",
    cover: `${R2}/home/02-featured-designs/01-02-featured-designs.png`,
  },
  {
    name: "Moon Garden",
    code: "TP-25SS-002",
    cover: `${R2}/home/02-featured-designs/02-02-featured-designs.png`,
  },
  {
    name: "Rose de Paris",
    code: "TP-25SS-003",
    cover: `${R2}/home/02-featured-designs/03-02-featured-designs.png`,
  },
];

interface Tool {
  no: string;
  name: string;
  desc: string;
  eyebrow: string;
  href: string;
  enabled: boolean;
  cover: [string, string];
}

const PATTERN_TOOLS: Tool[] = [
  { no: "01", name: "Pattern Generate", desc: "文字描述生成原创印花图案", eyebrow: "Print Studio", href: "/studio/pattern/generate", enabled: false, cover: ["#c7a677", "#7d5b6e"] },
  { no: "02", name: "Style Replicate", desc: "参考图片风格生成新图案", eyebrow: "Print Studio", href: "/studio/pattern/replicate", enabled: false, cover: ["#9aa08d", "#1e1e1e"] },
  { no: "03", name: "Seamless Tile", desc: "生成可无缝平铺的图案", eyebrow: "Print Studio", href: "/studio/pattern/seamless", enabled: false, cover: ["#f7d4cf", "#c68a44"] },
  { no: "04", name: "Pattern Fusion", desc: "两个图案融合为新设计", eyebrow: "Print Studio", href: "/studio/pattern/fusion", enabled: false, cover: ["#7d5b6e", "#0f0f10"] },
  { no: "05", name: "Craft Fusion", desc: "刺绣 · 蜡染 · 烫金效果", eyebrow: "Print Studio", href: "/studio/pattern/craft", enabled: false, cover: ["#b8b176", "#c68a44"] },
  { no: "06", name: "Pattern Edit", desc: "局部标记修改图案", eyebrow: "Print Studio", href: "/studio/pattern/edit", enabled: false, cover: ["#c7a677", "#9aa08d"] },
  { no: "07", name: "Enhance", desc: "低分辨率图案超分放大", eyebrow: "Print Studio", href: "/studio/pattern/enhance", enabled: false, cover: ["#f7d4cf", "#7d5b6e"] },
];

const FASHION_TOOLS: Tool[] = [
  { no: "08", name: "Sketch", desc: "AI 生成技术平面图", eyebrow: "Garment Lab", href: "/studio/fashion/sketch", enabled: false, cover: ["#1e1e1e", "#c7a677"] },
  { no: "09", name: "Render", desc: "线稿变真实效果图", eyebrow: "Garment Lab", href: "/studio/fashion/render", enabled: false, cover: ["#c68a44", "#f7d4cf"] },
  { no: "10", name: "Modify", desc: "标记区域修改服装细节", eyebrow: "Garment Lab", href: "/studio/fashion/modify", enabled: false, cover: ["#9aa08d", "#7d5b6e"] },
  { no: "11", name: "Innovate", desc: "AI 发散创意全新款式", eyebrow: "Garment Lab", href: "/studio/fashion/innovate", enabled: false, cover: ["#c7a677", "#f7d4cf"] },
  { no: "12", name: "Style Mix", desc: "两款式融合为新设计", eyebrow: "Garment Lab", href: "/studio/fashion/style-mix", enabled: false, cover: ["#7d5b6e", "#c68a44"] },
  { no: "13", name: "Color Series", desc: "同款多配色方案", eyebrow: "Garment Lab", href: "/studio/fashion/colors", enabled: false, cover: ["#f7d4cf", "#9aa08d"] },
  { no: "14", name: "Recolor", desc: "指定区域精准换色", eyebrow: "Garment Lab", href: "/studio/fashion/recolor", enabled: false, cover: ["#c68a44", "#0f0f10"] },
  { no: "15", name: "Fabric Apply", desc: "面料贴到服装上", eyebrow: "Garment Lab", href: "/studio/fashion/fabric", enabled: false, cover: ["#b8b176", "#7d5b6e"] },
  { no: "16", name: "Pattern Apply", desc: "印花穿在衣服上", eyebrow: "Garment Lab", href: "/studio/fashion/pattern", enabled: false, cover: ["#9aa08d", "#c7a677"] },
];

function ToolTile({ tool }: { tool: Tool }) {
  const style = {
    "--cover-a": tool.cover[0],
    "--cover-b": tool.cover[1],
  } as React.CSSProperties;

  const tile = (
    <div className="tool-tile">
      <div className="cover" style={style}>
        <span className="no">{tool.no}</span>
        {!tool.enabled && (
          <div className="soon">
            <span>COMING SOON</span>
          </div>
        )}
      </div>
      <div className="body">
        <small>{tool.eyebrow}</small>
        <b>{tool.name}</b>
        <p>{tool.desc}</p>
      </div>
    </div>
  );

  if (!tool.enabled) {
    return <div style={{ cursor: "not-allowed" }}>{tile}</div>;
  }
  return <Link href={tool.href}>{tile}</Link>;
}

function TechFlat() {
  return (
    <svg viewBox="0 0 240 260" aria-hidden="true" style={{ width: "100%", height: 220 }}>
      <rect x="0" y="0" width="240" height="260" fill="#f7f3ee" rx="12" />
      <g stroke="#1b1b1b" strokeWidth="3" fill="none" strokeLinejoin="round">
        <path d="M80 34 L54 58 L45 110 L62 112 L69 78 L80 220 L135 220 L145 78 L160 112 L176 110 L166 58 L138 34 L120 58 L100 34 Z" />
        <path d="M82 36 C100 78 112 106 139 136" strokeWidth="2" />
        <path d="M138 36 C118 75 98 105 68 135" strokeWidth="2" />
        <path d="M70 120 C95 132 122 132 144 120" strokeWidth="2" />
        <path d="M145 76 L166 68" strokeWidth="2" />
        <path d="M70 76 L52 66" strokeWidth="2" />
      </g>
    </svg>
  );
}

export default function StudioHomePage() {
  return (
    <div>
      <section className="section-title">
        <div style={{ display: "grid", gap: 6 }}>
          <div className="eyebrow">AI Design Studio</div>
          <h1>Welcome to AI Design Studio</h1>
          <p className="lead">
            核心链路：图案生成 → 四方连续 → 图案上身 → 线稿校验 → Tech Pack / BOM / 工艺说明。Create, Explore, Elevate。
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/studio/pattern/generate" className="btn small">
            + 新建项目
          </Link>
          <Link href="/design" className="btn gold small">
            快速生成印花
          </Link>
        </div>
      </section>

      <div className="studio-shell">
        <div className="studio-ui">
          <aside className="studio-side">
            <b>MaxLuLu AI Studio</b>
            <button type="button" className="btn small">
              + 新建项目
            </button>
            {PROJECT_ITEMS.map((p) => (
              <div key={p.name} className="project-item">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.cover} alt={p.name} />
                <div>
                  <b style={{ fontSize: 13 }}>{p.name}</b>
                  <small>{p.code}</small>
                </div>
              </div>
            ))}
          </aside>

          <section className="studio-main">
            <div className="workspace-bar">
              <b style={{ color: "var(--studio-text)" }}>
                项目：春季针织印花连衣裙系列
              </b>
              <span>生产可行性：通过</span>
            </div>
            <div className="studio-workspace">
              <div className="workspace-card">
                <b>印花设计</b>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${R2}/home/04-ai-tools/01-04-ai-tools.png`}
                  alt="印花设计预览"
                />
                <div className="swatches">
                  <span className="swatch" style={{ background: "#0f0f10" }} />
                  <span className="swatch" style={{ background: "#eee3d8" }} />
                  <span className="swatch" style={{ background: "#c98586" }} />
                  <span className="swatch" style={{ background: "#2d3748" }} />
                </div>
              </div>
              <div className="workspace-card">
                <b>Tech Flat</b>
                <TechFlat />
                <small style={{ color: "var(--studio-muted)" }}>
                  FRONT / BACK · Wrap Dress
                </small>
              </div>
              <div className="workspace-card">
                <b>上身预览</b>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${R2}/home/01-hero/01-01-hero.png`}
                  alt="针织印花裹身裙上身预览"
                />
                <small style={{ color: "var(--studio-muted)" }}>
                  100% 针织印花上身
                </small>
              </div>
            </div>
            <div className="studio-result">
              等待生成：输入创意描述后，系统将返回图案、上身预览与工艺单摘要。
            </div>
          </section>

          <aside className="studio-settings">
            <h3>设计设置</h3>
            <div className="settings-list">
              <label>
                款式分类
                <select defaultValue="wrap">
                  <option value="wrap">针织裹身裙 / Wrap Dress</option>
                  <option value="shift">针织直筒连衣裙</option>
                  <option value="deep-v">深 V 针织连衣裙</option>
                </select>
              </label>
              <label>
                面料类型
                <select defaultValue="knit">
                  <option value="knit">印花弹力针织</option>
                  <option value="jersey">重磅针织 Jersey</option>
                </select>
              </label>
              <label>
                尺码范围
                <select defaultValue="xs-xl">
                  <option value="xs-xl">XS / S / M / L / XL</option>
                </select>
              </label>
              <label>
                创意描述
                <textarea
                  rows={4}
                  defaultValue="黑白水墨花卉，适合深V针织裹身裙，成熟知性，通勤到晚宴"
                />
              </label>
              <button type="button" className="btn rose small">
                生成图案与上身预览
              </button>
              <button type="button" className="btn small">
                导出 Tech Pack
              </button>
            </div>
          </aside>
        </div>
      </div>

      <section className="section-block">
        <div className="section-title">
          <div style={{ display: "grid", gap: 6 }}>
            <div className="eyebrow">Pattern Studio · 图案工作室</div>
            <h2>7 个图案工具</h2>
          </div>
        </div>
        <div className="tool-grid">
          {PATTERN_TOOLS.map((t) => (
            <ToolTile key={t.no} tool={t} />
          ))}
        </div>
      </section>

      <section className="section-block">
        <div className="section-title">
          <div style={{ display: "grid", gap: 6 }}>
            <div className="eyebrow">Garment Lab · 服装实验室</div>
            <h2>9 个服装工具</h2>
          </div>
        </div>
        <div className="tool-grid">
          {FASHION_TOOLS.map((t) => (
            <ToolTile key={t.no} tool={t} />
          ))}
        </div>
      </section>
    </div>
  );
}
