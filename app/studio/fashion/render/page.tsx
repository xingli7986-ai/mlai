"use client";

import Link from "next/link";
import AssetImage from "@/components/AssetImage";
import { products } from "@/lib/home-consumer-data";
import "../../studio-home.css";
import "../fashion-tool.css";

const FABRICS = [
  { id: "knit", label: "弹力针织印花" },
  { id: "silk", label: "醋酸真丝缎" },
  { id: "linen", label: "亚麻棉混纺" },
  { id: "blend", label: "高定混纺" },
];

const MODELS = ["亚洲 · 21 岁", "亚洲 · 28 岁", "欧美 · 24 岁", "亚裔 · 32 岁", "拉丁 · 26 岁"];
const LIGHTING = ["自然光", "棚拍", "黄金时刻", "夜景", "T 台"];
const BACKDROPS = ["米色棚布", "巴黎街景", "庭院", "海边", "酒店大堂", "博物馆"];

function TechFlat({ accent = "#1b1b1b" }: { accent?: string }) {
  return (
    <svg viewBox="0 0 240 320" aria-hidden style={{ width: "100%", height: "100%" }}>
      <rect x="0" y="0" width="240" height="320" fill="#fdfaf4" rx="8" />
      <g stroke={accent} strokeWidth="2.5" fill="none" strokeLinejoin="round" strokeLinecap="round">
        <path d="M86 38 L62 60 L52 110 L66 116 L74 90 L80 270 L160 270 L166 90 L174 116 L188 110 L178 60 L154 38 L140 60 L120 86 L100 60 Z" />
        <path d="M88 40 C108 80 118 108 140 138" />
        <path d="M152 40 C132 78 116 106 96 138" />
        <path d="M70 130 C95 142 122 142 144 130" />
        <path d="M82 168 L158 168" strokeDasharray="3 3" opacity="0.5" />
        <path d="M80 270 C100 286 140 286 160 270" />
      </g>
    </svg>
  );
}

export default function RenderPage() {
  return (
    <div className="ft-root">
      <div className="st-tabs">
        <Link href="/studio">工具页</Link>
        <Link href="/products">我的设计</Link>
        <Link href="/products">灵感</Link>
        <Link href="/studio/publish">发布设计</Link>
        <Link href="/studio/dashboard">设计师中心</Link>
      </div>

      <div className="ft-header">
        <div>
          <p className="eyebrow">GARMENT LAB · 09</p>
          <h1>线稿成款 · Sketch → Render</h1>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/studio/fashion/sketch" className="ft-btn">← 重选线稿</Link>
          <button type="button" className="ft-btn">保存草稿</button>
          <Link href="/studio/publish" className="ft-btn is-primary">发布到画廊</Link>
        </div>
      </div>

      <div className="ft-grid">
        <aside className="ft-aside">
          <div className="ft-card">
            <div className="ft-card__head"><h2>① 输入线稿</h2></div>
            <div className="ft-thumbnail is-uploaded" style={{ background: "#fdfaf4", padding: 10 }}>
              <TechFlat />
            </div>
            <small style={{ display: "block", marginTop: 8, fontSize: 11, color: "var(--ft-text2)" }}>
              TS-2604 · 裹身长袖 · V 领
            </small>
          </div>

          <div className="ft-card">
            <div className="ft-card__head"><h2>② 套印花</h2></div>
            <div className="ft-pickRow">
              {products.slice(0, 3).map((p, i) => (
                <div key={p.id} className={`ft-pick ${i === 0 ? "is-active" : ""}`}>
                  <AssetImage
                    src={p.image}
                    alt={p.name}
                    tone={p.tone}
                    label={p.name.slice(0, 2)}
                    className="ft-thumbnail__img"
                  />
                </div>
              ))}
            </div>
            <small style={{ display: "block", marginTop: 8, fontSize: 11, color: "var(--ft-text3)" }}>
              点击切换印花，或上传新图案
            </small>
          </div>

          <div className="ft-card">
            <div className="ft-card__head"><h2>③ 面料</h2></div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {FABRICS.map((f, i) => (
                <span key={f.id} className={`ft-stage__chip ${i === 0 ? "is-active" : ""}`}>{f.label}</span>
              ))}
            </div>
          </div>

          <div className="ft-card">
            <div className="ft-card__head"><h2>④ 模特 / 灯光 / 场景</h2></div>
            <div className="ft-field">
              <label>模特</label>
              <select defaultValue="0">
                {MODELS.map((m, i) => <option key={m} value={i}>{m}</option>)}
              </select>
            </div>
            <div className="ft-field">
              <label>灯光</label>
              <select defaultValue="0">
                {LIGHTING.map((m, i) => <option key={m} value={i}>{m}</option>)}
              </select>
            </div>
            <div className="ft-field">
              <label>场景</label>
              <select defaultValue="0">
                {BACKDROPS.map((m, i) => <option key={m} value={i}>{m}</option>)}
              </select>
            </div>
            <div className="ft-slider">
              <label><span>真实度</span><span>92%</span></label>
              <input type="range" min={50} max={100} defaultValue={92} />
            </div>
            <div className="ft-slider" style={{ marginBottom: 0 }}>
              <label><span>动作幅度</span><span>中</span></label>
              <input type="range" min={1} max={5} defaultValue={3} />
            </div>
            <button type="button" className="ft-btn is-primary" style={{ width: "100%", marginTop: 12 }}>
              渲染 4 张成品
            </button>
          </div>
        </aside>

        <section>
          <div className="ft-stage">
            <div className="ft-stage__head">
              <h2>成品渲染（4 / 4）</h2>
              <div className="ft-stage__bar">
                <span className="ft-stage__chip is-active">写实模特</span>
                <span className="ft-stage__chip">无背景</span>
                <span className="ft-stage__chip">三视图</span>
                <span className="ft-stage__chip">细节特写</span>
              </div>
            </div>

            <div className="ft-results" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
              {products.slice(0, 4).map((p, i) => (
                <div key={p.id} className={`ft-result tone-${p.tone}`} style={{ aspectRatio: "3 / 4" }}>
                  <AssetImage
                    src={p.image}
                    alt={p.name}
                    tone={p.tone}
                    label={`成品 ${i + 1}`}
                    className="ft-result__img"
                  />
                  <div className="ft-result__overlay">
                    <span className="ft-result__chip">{["正面", "3/4 侧", "侧面", "背面"][i]}</span>
                    <div className="ft-result__icons">
                      <button type="button">⤓</button>
                      <button type="button">♡</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="ft-actions">
              <button type="button" className="ft-actionBtn"><span className="ic">↻</span><span>重新渲染</span></button>
              <button type="button" className="ft-actionBtn"><span className="ic">⤓</span><span>下载组图</span></button>
              <Link href="/studio/fashion/fabric" className="ft-actionBtn"><span className="ic">↗</span><span>面料上身</span></Link>
              <Link href="/my/orders" className="ft-actionBtn"><span className="ic">▦</span><span>Tech Pack</span></Link>
              <button type="button" className="ft-actionBtn"><span className="ic">♡</span><span>收藏</span></button>
              <Link href="/studio/publish" className="ft-actionBtn"><span className="ic">✓</span><span>发布</span></Link>
            </div>
          </div>

          <section className="ft-helpRow">
            <article className="ft-helpCard">
              <b>渲染逻辑</b>
              <p>线稿 → 套印花 → 面料贴图 → 模特上身 → 环境渲染。每步均可独立锁定，避免重新生成时丢参数。</p>
            </article>
            <article className="ft-helpCard">
              <b>面料效果</b>
              <p>针织 / 真丝 / 亚麻在 AI 渲染中有不同的褶皱与高光特征，建议先选面料再调真实度。</p>
            </article>
            <article className="ft-helpCard">
              <b>路由</b>
              <p style={{ marginTop: 8, fontFamily: "monospace", fontSize: 11, color: "var(--ft-text2)" }}>
                ← /studio/fashion/sketch<br />
                /studio/fashion/render<br />
                ↗ /studio/fashion/fabric<br />
                ↗ /studio/publish
              </p>
            </article>
          </section>
        </section>

        <aside className="ft-aside">
          <div className="ft-card">
            <div className="ft-card__head">
              <h2>历史成款</h2>
              <Link href="/studio/dashboard" className="more">全部 →</Link>
            </div>
            <div className="ft-history">
              {products.slice(0, 5).map((p, i) => (
                <div key={p.id} className="ft-history__item">
                  <div className={`ft-history__media tone-${p.tone}`}>
                    <AssetImage
                      src={p.image}
                      alt={p.name}
                      tone={p.tone}
                      label={p.name.slice(0, 2)}
                      className="ft-history__img"
                    />
                  </div>
                  <div>
                    <b>R-{String(2604 - i * 4).padStart(4, "0")}</b>
                    <small>{["亚洲 21 岁", "欧美 24 岁", "亚洲 28 岁", "拉丁 26 岁", "亚裔 32 岁"][i]} · {["刚刚", "12 分钟前", "1 小时前", "今晨", "昨天"][i]}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="ft-card" style={{ background: "linear-gradient(135deg, var(--ft-gold-bg), rgba(176,134,92,0.02))" }}>
            <b style={{ display: "block", fontSize: 13, color: "var(--ft-text)", marginBottom: 6 }}>下一步：面料上身</b>
            <p style={{ margin: 0, fontSize: 12, color: "var(--ft-text2)", lineHeight: 1.7, marginBottom: 10 }}>
              想看不同面料效果？把当前款式带入"面料上身"做面料对比。
            </p>
            <Link href="/studio/fashion/fabric" className="ft-btn is-primary" style={{ width: "100%", justifyContent: "center" }}>
              面料对比 →
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
