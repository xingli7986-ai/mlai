"use client";

import { useState } from "react";
import Link from "next/link";
import AssetImage from "@/components/AssetImage";
import { products } from "@/lib/home-consumer-data";
import {
  generateImages,
  downloadImage,
  type StudioImage,
  type StudioModel,
} from "@/lib/studioClient";
import "../../studio-home.css";
import "../fashion-tool.css";

const SILHOUETTES = [
  { id: "wrap", label: "裹身" },
  { id: "shift", label: "直筒" },
  { id: "aline", label: "A 字" },
  { id: "fishtail", label: "鱼尾" },
  { id: "fitflare", label: "修身喇叭" },
  { id: "pencil", label: "铅笔" },
];

const NECKLINES = ["V 领", "翻领", "立领", "圆领", "方领", "一字肩"];
const SLEEVES = ["长袖", "九分", "灯笼袖", "泡泡袖", "无袖", "公主袖"];
const HEMS = ["及膝", "中长", "长款", "拖地", "前短后长"];
const VIEWS = [
  { id: "both", label: "前 + 后" },
  { id: "front", label: "仅正面" },
  { id: "back", label: "仅背面" },
];

function TechFlat({ accent = "#1b1b1b", side = "front" }: { accent?: string; side?: "front" | "back" }) {
  return (
    <svg viewBox="0 0 240 320" aria-hidden style={{ width: "100%", height: "100%" }}>
      <rect x="0" y="0" width="240" height="320" fill="#fdfaf4" rx="8" />
      <g stroke={accent} strokeWidth="2.5" fill="none" strokeLinejoin="round" strokeLinecap="round">
        <path d="M86 38 L62 60 L52 110 L66 116 L74 90 L80 270 L160 270 L166 90 L174 116 L188 110 L178 60 L154 38 L140 60 L120 86 L100 60 Z" />
        {side === "front" ? (
          <>
            <path d="M88 40 C108 80 118 108 140 138" />
            <path d="M152 40 C132 78 116 106 96 138" />
            <path d="M70 130 C95 142 122 142 144 130" />
          </>
        ) : (
          <>
            <path d="M86 42 L154 42" />
            <path d="M86 78 L154 78" strokeDasharray="3 3" />
          </>
        )}
        <path d="M82 168 L158 168" strokeDasharray="3 3" opacity="0.5" />
        <path d="M80 270 C100 286 140 286 160 270" />
        <path d="M52 110 L46 178 L66 184" strokeWidth="2" />
        <path d="M188 110 L194 178 L174 184" strokeWidth="2" />
        <path d="M74 90 L74 268" strokeWidth="1.4" opacity="0.3" />
        <path d="M166 90 L166 268" strokeWidth="1.4" opacity="0.3" />
      </g>
      <text x="120" y="306" textAnchor="middle" fontSize="10" fill="#7a7a6f" fontFamily="monospace">
        {side === "front" ? "FRONT" : "BACK"} · 比例 1:5
      </text>
    </svg>
  );
}

export default function SketchPage() {
  const [silhouette, setSilhouette] = useState(SILHOUETTES[0].label);
  const [neckline, setNeckline] = useState(NECKLINES[0]);
  const [sleeve, setSleeve] = useState(SLEEVES[0]);
  const [hem, setHem] = useState(HEMS[0]);
  const [view, setView] = useState<"both" | "front" | "back">("both");
  const [userPrompt, setUserPrompt] = useState("");
  const [model, setModel] = useState<StudioModel>("gpt-image-2");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<StudioImage[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function onGenerate() {
    setLoading(true);
    setError(null);
    setResults([]);
    const res = await generateImages({
      tool: "sketch-generate",
      model,
      prompt: userPrompt,
      params: {
        garmentType: "dress",
        skirtType: silhouette,
        neckline,
        sleeveType: sleeve,
        skirtLength: hem,
        view,
        userPrompt,
      },
      images: [],
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
          <p className="eyebrow">GARMENT LAB · 08</p>
          <h1>线稿生成 · Tech Sketch</h1>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button type="button" className="ft-btn">导入参考</button>
          <button type="button" className="ft-btn">保存草稿</button>
          <Link href="/studio/fashion/render" className="ft-btn is-primary">下一步：成款渲染</Link>
        </div>
      </div>

      <div className="ft-grid">
        <aside className="ft-aside">
          <div className="ft-card">
            <div className="ft-card__head"><h2>① 参考图</h2></div>
            <div className="ft-thumbnail is-uploaded">
              <AssetImage
                src={products[0].image}
                alt="参考"
                tone={products[0].tone}
                label="参考"
                className="ft-thumbnail__img"
              />
            </div>
            <div className="ft-field" style={{ marginTop: 10, marginBottom: 0 }}>
              <label>设计补充</label>
              <textarea
                placeholder="例：领口加捏褶、腰部 X 形拼接"
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
              />
            </div>
          </div>

          <div className="ft-card">
            <div className="ft-card__head"><h2>② 廓形</h2></div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {SILHOUETTES.map((s) => (
                <span
                  key={s.id}
                  className={`ft-stage__chip ${silhouette === s.label ? "is-active" : ""}`}
                  onClick={() => setSilhouette(s.label)}
                  style={{ cursor: "pointer" }}
                >
                  {s.label}
                </span>
              ))}
            </div>
          </div>

          <div className="ft-card">
            <div className="ft-card__head"><h2>③ 工艺细节</h2></div>
            <div className="ft-field">
              <label>领型</label>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {NECKLINES.map((n) => (
                  <span
                    key={n}
                    className={`ft-stage__chip ${neckline === n ? "is-active" : ""}`}
                    onClick={() => setNeckline(n)}
                    style={{ cursor: "pointer" }}
                  >
                    {n}
                  </span>
                ))}
              </div>
            </div>
            <div className="ft-field">
              <label>袖型</label>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {SLEEVES.map((s) => (
                  <span
                    key={s}
                    className={`ft-stage__chip ${sleeve === s ? "is-active" : ""}`}
                    onClick={() => setSleeve(s)}
                    style={{ cursor: "pointer" }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div className="ft-field" style={{ marginBottom: 0 }}>
              <label>下摆</label>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {HEMS.map((h) => (
                  <span
                    key={h}
                    className={`ft-stage__chip ${hem === h ? "is-active" : ""}`}
                    onClick={() => setHem(h)}
                    style={{ cursor: "pointer" }}
                  >
                    {h}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="ft-card">
            <div className="ft-card__head"><h2>④ 视图 / 模型</h2></div>
            <div className="ft-field">
              <label>视图</label>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {VIEWS.map((v) => (
                  <span
                    key={v.id}
                    className={`ft-stage__chip ${view === v.id ? "is-active" : ""}`}
                    onClick={() => setView(v.id as "both" | "front" | "back")}
                    style={{ cursor: "pointer" }}
                  >
                    {v.label}
                  </span>
                ))}
              </div>
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
              {loading ? "生成中…" : "生成 2 张线稿"}
            </button>
          </div>
        </aside>

        <section>
          <div className="ft-stage">
            <div className="ft-stage__head">
              <h2>线稿结果（{results.length} / 2）</h2>
              <div className="ft-stage__bar">
                <span className="ft-stage__chip is-active">FRONT + BACK</span>
                <span className="ft-stage__chip">侧视</span>
                <span className="ft-stage__chip">分解图</span>
                <span className="ft-stage__chip">三视图</span>
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
                    <div key={i} style={{
                      position: "relative",
                      aspectRatio: "3 / 4",
                      borderRadius: 12,
                      overflow: "hidden",
                      border: "1px solid var(--ft-border)",
                      background: "#fdfaf4",
                      padding: 8,
                    }}>
                      <div style={{
                        position: "absolute",
                        inset: 0,
                        background: "linear-gradient(110deg, #fdfaf4 30%, rgba(176,134,92,0.08) 50%, #fdfaf4 70%)",
                        backgroundSize: "200% 100%",
                        animation: "ft-shimmer 1.6s linear infinite",
                      }} />
                    </div>
                  ))
                : results.length > 0
                ? results.map((img, i) => (
                    <div key={i} style={{
                      position: "relative",
                      aspectRatio: "3 / 4",
                      borderRadius: 12,
                      overflow: "hidden",
                      border: "1px solid var(--ft-border)",
                      background: "#fdfaf4",
                    }}>
                      <img
                        src={img.url}
                        alt={`线稿方案 ${String.fromCharCode(65 + i)}`}
                        style={{ width: "100%", height: "100%", objectFit: "contain", cursor: "zoom-in" }}
                        onClick={() => window.open(img.url, "_blank", "noopener,noreferrer")}
                      />
                      <span style={{
                        position: "absolute",
                        top: 8,
                        left: 8,
                        height: 22,
                        padding: "0 9px",
                        borderRadius: 999,
                        background: "var(--ft-gold-bg)",
                        color: "var(--ft-gold)",
                        fontSize: 11,
                        display: "inline-flex",
                        alignItems: "center",
                      }}>
                        方案 {String.fromCharCode(65 + i)}
                      </span>
                      <div className="ft-result__icons" style={{ position: "absolute", bottom: 8, right: 8 }}>
                        <button type="button" aria-label="下载" onClick={() => downloadImage(img.url)}>⤓</button>
                      </div>
                    </div>
                  ))
                : [0, 1, 2, 3].map((i) => (
                    <div key={i} style={{
                      position: "relative",
                      aspectRatio: "3 / 4",
                      borderRadius: 12,
                      overflow: "hidden",
                      border: "1px solid var(--ft-border)",
                      background: "#fdfaf4",
                      padding: 8,
                    }}>
                      <TechFlat side={i % 2 === 0 ? "front" : "back"} />
                      <span style={{
                        position: "absolute",
                        top: 8,
                        left: 8,
                        height: 22,
                        padding: "0 9px",
                        borderRadius: 999,
                        background: "var(--ft-gold-bg)",
                        color: "var(--ft-gold)",
                        fontSize: 11,
                        display: "inline-flex",
                        alignItems: "center",
                      }}>
                        示例 {String.fromCharCode(65 + Math.floor(i / 2))} · {i % 2 === 0 ? "前" : "后"}
                      </span>
                    </div>
                  ))}
            </div>

            <div className="ft-actions">
              <button type="button" className="ft-actionBtn" disabled={results.length === 0}>
                <span className="ic">⤓</span><span>导出 SVG</span>
              </button>
              <button type="button" className="ft-actionBtn" disabled={results.length === 0}
                onClick={() => results.forEach((r) => downloadImage(r.url))}>
                <span className="ic">⤓</span><span>下载 PNG</span>
              </button>
              <button type="button" className="ft-actionBtn"><span className="ic">▦</span><span>工艺单</span></button>
              <Link href="/studio/fashion/render" className="ft-actionBtn"><span className="ic">↗</span><span>线稿成款</span></Link>
              <button type="button" className="ft-actionBtn" onClick={onGenerate} disabled={loading}>
                <span className="ic">↻</span><span>重新生成</span>
              </button>
              <Link href="/studio/publish" className="ft-actionBtn"><span className="ic">✓</span><span>发布</span></Link>
            </div>
          </div>

          <section className="ft-helpRow">
            <article className="ft-helpCard">
              <b>线稿规范</b>
              <p>所有尺寸按 1:5 比例输出，单位为 cm；缝份默认 1 cm，可在工艺单中调整。</p>
            </article>
            <article className="ft-helpCard">
              <b>下一步建议</b>
              <p>选定满意线稿后，点击"线稿成款"自动生成真实渲染图与上身预览。</p>
            </article>
            <article className="ft-helpCard">
              <b>工艺要点</b>
              <p>系统会同步标注关键测量点（衣长 / 胸围 / 腰围 / 肩宽 / 袖长），导出工艺单可直发工厂。</p>
            </article>
          </section>
        </section>

        <aside className="ft-aside">
          <div className="ft-card">
            <div className="ft-card__head">
              <h2>历史线稿</h2>
              <Link href="/studio/dashboard" className="more">全部 →</Link>
            </div>
            <div className="ft-history">
              {products.slice(0, 5).map((p, i) => (
                <div key={p.id} className="ft-history__item">
                  <div className="ft-history__media" style={{ background: "#fdfaf4", padding: 4 }}>
                    <TechFlat side={i % 2 === 0 ? "front" : "back"} />
                  </div>
                  <div>
                    <b>TS-{String(2604 - i * 4).padStart(4, "0")}</b>
                    <small>{["裹身", "直筒", "A字", "鱼尾", "铅笔"][i]} · {["刚刚", "12 分钟前", "1 小时前", "今晨", "昨天"][i]}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="ft-card" style={{ background: "linear-gradient(135deg, var(--ft-gold-bg), rgba(176,134,92,0.02))" }}>
            <b style={{ display: "block", fontSize: 13, color: "var(--ft-text)", marginBottom: 6 }}>下一步：线稿成款</b>
            <p style={{ margin: 0, fontSize: 12, color: "var(--ft-text2)", lineHeight: 1.7, marginBottom: 10 }}>
              线稿满意后，自动套印花并生成真实模特上身效果。
            </p>
            <Link href="/studio/fashion/render" className="ft-btn is-primary" style={{ width: "100%", justifyContent: "center" }}>
              进入 线稿成款 →
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
