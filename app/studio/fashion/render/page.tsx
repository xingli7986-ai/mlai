"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import AssetImage from "@/components/AssetImage";
import { products } from "@/lib/home-consumer-data";
import {
  generateImages,
  fileToBase64,
  downloadImage,
  type StudioImage,
  type StudioModel,
} from "@/lib/studioClient";
import "../../studio-home.css";
import "../fashion-tool.css";

const FABRICS = [
  { id: "knit", label: "弹力针织印花" },
  { id: "silk", label: "醋酸真丝缎" },
  { id: "linen", label: "亚麻棉混纺" },
  { id: "blend", label: "高定混纺" },
];

const COLORS = [
  { id: "ink", label: "墨黑" },
  { id: "rose", label: "玫瑰" },
  { id: "gold", label: "暖金" },
  { id: "ivory", label: "象牙" },
  { id: "wine", label: "酒红" },
];

const SCENES = [
  { id: "plain", label: "纯白底" },
  { id: "studio", label: "棚拍" },
  { id: "outdoor", label: "户外" },
];

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
  const sketchRef = useRef<HTMLInputElement>(null);
  const printRef = useRef<HTMLInputElement>(null);
  const [sketchPreview, setSketchPreview] = useState<string | null>(null);
  const [sketchBase64, setSketchBase64] = useState<string | null>(null);
  const [printPreview, setPrintPreview] = useState<string | null>(null);
  const [printBase64, setPrintBase64] = useState<string | null>(null);
  const [fabric, setFabric] = useState(FABRICS[0]);
  const [color, setColor] = useState(COLORS[0]);
  const [scene, setScene] = useState(SCENES[1]);
  const [model, setModel] = useState<StudioModel>("gpt-image-2");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<StudioImage[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function onSketchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const dataUrl = await fileToBase64(f);
    setSketchPreview(dataUrl);
    setSketchBase64(dataUrl);
  }
  async function onPrintChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const dataUrl = await fileToBase64(f);
    setPrintPreview(dataUrl);
    setPrintBase64(dataUrl);
  }

  async function onGenerate() {
    if (!sketchBase64) {
      setError("请先上传线稿图");
      return;
    }
    setLoading(true);
    setError(null);
    setResults([]);
    const images = [sketchBase64];
    if (printBase64) images.push(printBase64);
    const res = await generateImages({
      tool: "sketch-to-design",
      model,
      params: {
        fabricName: fabric.label,
        color: color.label,
        scene: scene.id,
      },
      images,
      count: 2,
      size: "2:3",
    });
    setLoading(false);
    if (res.success && res.images) {
      setResults(res.images);
    } else {
      setError(res.error || "生成失败");
    }
  }

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

      <input ref={sketchRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onSketchChange} />
      <input ref={printRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onPrintChange} />

      <div className="ft-grid">
        <aside className="ft-aside">
          <div className="ft-card">
            <div className="ft-card__head"><h2>① 输入线稿</h2></div>
            <div
              className="ft-thumbnail is-uploaded"
              onClick={() => sketchRef.current?.click()}
              style={{ background: "#fdfaf4", padding: 10, cursor: "pointer" }}
            >
              {sketchPreview ? (
                <img
                  src={sketchPreview}
                  alt="线稿"
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
              ) : (
                <TechFlat />
              )}
            </div>
            <small style={{ display: "block", marginTop: 8, fontSize: 11, color: "var(--ft-text2)" }}>
              {sketchPreview ? "已上传 · 点击替换" : "点击上传线稿（必须）"}
            </small>
          </div>

          <div className="ft-card">
            <div className="ft-card__head"><h2>② 套印花（可选）</h2></div>
            <div
              className="ft-thumbnail is-uploaded"
              onClick={() => printRef.current?.click()}
              style={{ cursor: "pointer" }}
            >
              {printPreview ? (
                <img
                  src={printPreview}
                  alt="印花"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <AssetImage
                  src={products[0].image}
                  alt="印花占位"
                  tone={products[0].tone}
                  label="点击上传"
                  className="ft-thumbnail__img"
                />
              )}
            </div>
            <small style={{ display: "block", marginTop: 8, fontSize: 11, color: "var(--ft-text3)" }}>
              {printPreview ? "已上传印花" : "可选；不上传则使用纯色"}
            </small>
          </div>

          <div className="ft-card">
            <div className="ft-card__head"><h2>③ 面料</h2></div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {FABRICS.map((f) => (
                <span
                  key={f.id}
                  className={`ft-stage__chip ${fabric.id === f.id ? "is-active" : ""}`}
                  onClick={() => setFabric(f)}
                  style={{ cursor: "pointer" }}
                >
                  {f.label}
                </span>
              ))}
            </div>
          </div>

          <div className="ft-card">
            <div className="ft-card__head"><h2>④ 颜色 / 场景 / 模型</h2></div>
            <div className="ft-field">
              <label>主色</label>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {COLORS.map((c) => (
                  <span
                    key={c.id}
                    className={`ft-stage__chip ${color.id === c.id ? "is-active" : ""}`}
                    onClick={() => setColor(c)}
                    style={{ cursor: "pointer" }}
                  >
                    {c.label}
                  </span>
                ))}
              </div>
            </div>
            <div className="ft-field">
              <label>场景</label>
              <select value={scene.id} onChange={(e) => setScene(SCENES.find((s) => s.id === e.target.value)!)}>
                {SCENES.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>
            <div className="ft-field" style={{ marginBottom: 0 }}>
              <label>模型</label>
              <select value={model} onChange={(e) => setModel(e.target.value as StudioModel)}>
                <option value="gpt-image-2">GPT-Image-2 · 标准</option>
                <option value="gemini">Gemini · 精细</option>
              </select>
            </div>
            <button
              type="button"
              className="ft-btn is-primary"
              style={{ width: "100%", marginTop: 12 }}
              disabled={loading}
              onClick={onGenerate}
            >
              {loading ? "渲染中…" : "渲染 2 张成品"}
            </button>
          </div>
        </aside>

        <section>
          <div className="ft-stage">
            <div className="ft-stage__head">
              <h2>成品渲染（{results.length} / 2）</h2>
              <div className="ft-stage__bar">
                <span className="ft-stage__chip is-active">写实模特</span>
                <span className="ft-stage__chip">无背景</span>
                <span className="ft-stage__chip">三视图</span>
                <span className="ft-stage__chip">细节特写</span>
              </div>
            </div>

            {error && (
              <div style={{
                padding: 12,
                marginBottom: 12,
                borderRadius: 8,
                background: "rgba(176,57,57,0.08)",
                border: "1px solid rgba(176,57,57,0.2)",
                color: "#a23030",
                fontSize: 13,
              }}>
                {error}
              </div>
            )}

            <div className="ft-results" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
              {loading
                ? Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="ft-result" style={{ background: "var(--ft-bg)", aspectRatio: "3 / 4" }}>
                      <div style={{
                        position: "absolute",
                        inset: 0,
                        background: "linear-gradient(110deg, var(--ft-bg) 30%, rgba(176,134,92,0.08) 50%, var(--ft-bg) 70%)",
                        backgroundSize: "200% 100%",
                        animation: "ft-shimmer 1.6s linear infinite",
                      }} />
                    </div>
                  ))
                : results.length > 0
                ? results.map((img, i) => (
                    <div key={i} className="ft-result" style={{ aspectRatio: "3 / 4" }}>
                      <img
                        src={img.url}
                        alt={`成品 ${i + 1}`}
                        style={{ width: "100%", height: "100%", objectFit: "cover", cursor: "zoom-in" }}
                        onClick={() => window.open(img.url, "_blank", "noopener,noreferrer")}
                      />
                      <div className="ft-result__overlay">
                        <span className="ft-result__chip">{["正面", "3/4 侧"][i]}</span>
                        <div className="ft-result__icons">
                          <button type="button" aria-label="下载" onClick={() => downloadImage(img.url)}>⤓</button>
                          <button type="button" aria-label="收藏">♡</button>
                        </div>
                      </div>
                    </div>
                  ))
                : products.slice(0, 2).map((p, i) => (
                    <div key={p.id} className={`ft-result tone-${p.tone}`} style={{ aspectRatio: "3 / 4" }}>
                      <AssetImage
                        src={p.image}
                        alt={p.name}
                        tone={p.tone}
                        label={`成品 ${i + 1}`}
                        className="ft-result__img"
                      />
                      <div className="ft-result__overlay">
                        <span className="ft-result__chip">{["正面", "3/4 侧"][i]}</span>
                      </div>
                    </div>
                  ))}
            </div>

            <div className="ft-actions">
              <button type="button" className="ft-actionBtn" onClick={onGenerate} disabled={loading}>
                <span className="ic">↻</span><span>重新渲染</span>
              </button>
              <button type="button" className="ft-actionBtn" disabled={results.length === 0}
                onClick={() => results.forEach((r) => downloadImage(r.url))}>
                <span className="ic">⤓</span><span>下载组图</span>
              </button>
              <Link href="/studio/fashion/fabric" className="ft-actionBtn"><span className="ic">↗</span><span>面料上身</span></Link>
              <Link href="/studio/publish/tech-pack" className="ft-actionBtn"><span className="ic">▦</span><span>Tech Pack</span></Link>
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
                      label={p.name}
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

      <style jsx global>{`
        @keyframes ft-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
