"use client";

import Link from "next/link";
import AssetImage from "@/components/AssetImage";
import { products } from "@/lib/home-consumer-data";
import { Badge, Button } from "@/components/ui";
import "./studio-home.css";

interface Tool {
  no: string;
  name: string;
  desc: string;
  href: string;
  enabled: boolean;
  cover: [string, string];
}

const PATTERN_TOOLS: Tool[] = [
  { no: "01", name: "图案生成", desc: "文字描述生成原创印花", href: "/studio/pattern/generate", enabled: true, cover: ["#c7a677", "#7d5b6e"] },
  { no: "02", name: "风格复刻", desc: "参考图片复刻新设计", href: "/studio/pattern/style-clone", enabled: false, cover: ["#9aa08d", "#1e1e1e"] },
  { no: "03", name: "四方连续", desc: "生成无缝平铺图案", href: "/studio/pattern/seamless", enabled: false, cover: ["#f7d4cf", "#c68a44"] },
  { no: "04", name: "图案融合", desc: "两个图案融合为新设计", href: "/studio/pattern/fusion", enabled: false, cover: ["#7d5b6e", "#0f0f10"] },
  { no: "05", name: "工艺融合", desc: "刺绣 · 蜡染 · 烫金", href: "/studio/pattern/craft", enabled: false, cover: ["#b8b176", "#c68a44"] },
  { no: "06", name: "图案修改", desc: "局部标记重绘", href: "/studio/pattern/edit", enabled: false, cover: ["#c7a677", "#9aa08d"] },
  { no: "07", name: "高清增强", desc: "低分辨率超分放大", href: "/studio/pattern/enhance", enabled: false, cover: ["#f7d4cf", "#7d5b6e"] },
];

const FASHION_TOOLS: Tool[] = [
  { no: "08", name: "技术线稿", desc: "AI 生成技术平面图", href: "/studio/fashion/sketch", enabled: false, cover: ["#1e1e1e", "#c7a677"] },
  { no: "09", name: "效果渲染", desc: "线稿变写实渲染", href: "/studio/fashion/render", enabled: false, cover: ["#c68a44", "#f7d4cf"] },
  { no: "10", name: "局部改款", desc: "标记区域改款", href: "/studio/fashion/modify", enabled: true, cover: ["#9aa08d", "#7d5b6e"] },
  { no: "11", name: "灵感发散", desc: "AI 创意全新款式", href: "/studio/fashion/innovate", enabled: false, cover: ["#c7a677", "#f7d4cf"] },
  { no: "12", name: "款式融合", desc: "两款式融合为新设计", href: "/studio/fashion/style-fusion", enabled: false, cover: ["#7d5b6e", "#c68a44"] },
  { no: "13", name: "配色系列", desc: "同款多配色方案", href: "/studio/fashion/color", enabled: false, cover: ["#f7d4cf", "#9aa08d"] },
  { no: "14", name: "精准换色", desc: "指定区域精准换色", href: "/studio/fashion/recolor", enabled: false, cover: ["#c68a44", "#0f0f10"] },
  { no: "15", name: "面料贴图", desc: "面料贴到服装上", href: "/studio/fashion/fabric", enabled: false, cover: ["#b8b176", "#7d5b6e"] },
  { no: "16", name: "图案上身", desc: "印花穿在衣服上", href: "/studio/fashion/pattern", enabled: true, cover: ["#9aa08d", "#c7a677"] },
];

function ToolTile({ tool }: { tool: Tool }) {
  const style = {
    "--st-cover-a": tool.cover[0],
    "--st-cover-b": tool.cover[1],
  } as React.CSSProperties;

  const inner = (
    <>
      <div className="st-tool__cover" style={style}>
        <span className="st-tool__no">{tool.no}</span>
        {!tool.enabled && <Badge tone="dark" className="st-tool__soon">SOON</Badge>}
      </div>
      <div>
        <div className="st-tool__name">{tool.name}</div>
        <div className="st-tool__desc">{tool.desc}</div>
      </div>
    </>
  );

  if (!tool.enabled) {
    return (
      <div className="st-tool" style={{ opacity: 0.78, cursor: "not-allowed" }}>
        {inner}
      </div>
    );
  }
  return (
    <Link href={tool.href} className="st-tool">
      {inner}
    </Link>
  );
}

const DRAFTS = products.slice(0, 5);

const INSPIRES = products.slice(5, 10);

export default function StudioHomePage() {
  return (
    <div className="st-root">
      <div className="st-tabs">
        <Link href="/studio" className="is-active">工具页</Link>
        <Link href="/products">我的设计</Link>
        <Link href="/products">灵感</Link>
        <Link href="/studio/publish">发布设计</Link>
        <Link href="/studio/dashboard">设计师中心</Link>
      </div>

      <section className="st-hero">
        <div className="st-hero__media">
          <AssetImage
            src={products[0].image}
            alt="Studio Hero"
            tone={products[0].tone}
            label="Studio"
            className="st-hero__img"
          />
        </div>
        <div className="st-hero__body">
          <p className="eyebrow">AI 设计工作室 · 工具首页</p>
          <h1>下午好，Lulu <span style={{ fontSize: 22 }}>👋</span></h1>
          <p>欢迎来到 MaxLuLu AI Studio，从 16 个 AI 工具开始你的下一个设计：印花生成 → 上身预览 → 一键发布到印花衣橱。</p>
          <div className="st-hero__cta">
            <Button as="a" href="/studio/pattern/generate" variant="primary">+ 新建项目</Button>
            <Button as="a" href="/studio/dashboard" variant="secondary">从草稿开始</Button>
            <Button as="a" href="/studio/publish" variant="secondary">直接上传设计</Button>
          </div>
        </div>
      </section>

      <section className="st-section">
        <div className="st-section__head">
          <div>
            <p className="eyebrow">图案工作室</p>
            <h2>7 个图案工具</h2>
          </div>
          <Link href="/studio/pattern/generate">查看入门指引 →</Link>
        </div>
        <div className="st-grid7">
          {PATTERN_TOOLS.map((t) => <ToolTile key={t.no} tool={t} />)}
        </div>
      </section>

      <section className="st-section">
        <div className="st-section__head">
          <div>
            <p className="eyebrow">服装实验室</p>
            <h2>9 个服装工具</h2>
          </div>
          <Link href="/studio/fashion/sketch">查看入门指引 →</Link>
        </div>
        <div className="st-grid9">
          {FASHION_TOOLS.map((t) => <ToolTile key={t.no} tool={t} />)}
        </div>
      </section>

      <section className="st-row">
        <article className="st-card">
          <div className="st-card__head">
            <h2>最近草稿</h2>
            <Link href="/studio/dashboard" className="more">查看全部 →</Link>
          </div>
          <div className="st-drafts">
            {DRAFTS.map((p) => (
              <Link href={`/products/${p.id}`} key={p.id} className="st-draft">
                <div className={`st-draft__media tone-${p.tone}`}>
                  <AssetImage
                    src={p.image}
                    alt={p.name}
                    tone={p.tone}
                    label={p.name}
                    className="st-draft__img"
                  />
                </div>
                <div className="st-draft__body">
                  <b>{p.name}</b>
                  <small>更新于 2 天前 · 草稿</small>
                </div>
              </Link>
            ))}
          </div>
        </article>

        <article className="st-card">
          <div className="st-card__head">
            <h2>灵感库 / 模板推荐</h2>
            <Link href="/products" className="more">浏览印花衣橱 →</Link>
          </div>
          <div className="st-inspire-grid">
            {INSPIRES.map((p, i) => (
              <Link href={`/products/${p.id}`} key={p.id} className="st-inspire">
                <div className={`st-inspire__media tone-${p.tone}`}>
                  <AssetImage
                    src={p.image}
                    alt={p.name}
                    tone={p.tone}
                    label={p.name}
                    className="st-inspire__img"
                  />
                </div>
                <div>
                  <b>{p.name}</b>
                  <small>{p.tags.slice(0, 2).join(" · ")}</small>
                </div>
                <em>{["热门", "新作", "推荐", "Pro", "众定"][i]}</em>
              </Link>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
