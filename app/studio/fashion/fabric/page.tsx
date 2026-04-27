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

const FABRIC_TYPES = [
  { id: "knit", label: "弹力针织", desc: "高弹、贴身、回弹好" },
  { id: "silk", label: "醋酸真丝", desc: "顺滑、垂坠、光泽柔和" },
  { id: "linen", label: "亚麻棉", desc: "透气、亚光、自然褶皱" },
  { id: "blend", label: "高定混纺", desc: "挺括、有支撑、立体" },
  { id: "lace", label: "蕾丝", desc: "镂空、精致、半透明" },
  { id: "satin", label: "缎面", desc: "高光、丝滑、反射强" },
];

const AREAS = [
  { id: "full", label: "整件" },
  { id: "top", label: "上身" },
  { id: "skirt", label: "裙摆" },
  { id: "sleeve", label: "袖" },
  { id: "panel", label: "拼接" },
];

export default function FabricApplyPage() {
  const fabricRef = useRef<HTMLInputElement>(null);
  const garmentRef = useRef<HTMLInputElement>(null);
  const [fabricPreview, setFabricPreview] = useState<string | null>(null);
  const [fabricBase64, setFabricBase64] = useState<string | null>(null);
  const [garmentPreview, setGarmentPreview] = useState<string | null>(null);
  const [garmentBase64, setGarmentBase64] = useState<string | null>(null);
  const [fabricType, setFabricType] = useState(FABRIC_TYPES[0]);
  const [area, setArea] = useState(AREAS[0]);
  const [model, setModel] = useState<StudioModel>("gpt-image-2");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<StudioImage[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function onFabricChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const dataUrl = await fileToBase64(f);
    setFabricPreview(dataUrl);
    setFabricBase64(dataUrl);
  }
  async function onGarmentChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const dataUrl = await fileToBase64(f);
    setGarmentPreview(dataUrl);
    setGarmentBase64(dataUrl);
  }

  async function onGenerate() {
    if (!fabricBase64) {
      setError("请先上传面料图");
      return;
    }
    if (!garmentBase64) {
      setError("请先上传服装图");
      return;
    }
    setLoading(true);
    setError(null);
    setResults([]);
    const res = await generateImages({
      tool: "fabric-apply",
      model,
      params: {
        fabricName: fabricType.label,
        fabricDescription: fabricType.desc,
        area: area.id,
      },
      images: [fabricBase64, garmentBase64],
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
          <p className="eyebrow">GARMENT LAB · 15</p>
          <h1>面料上身 · Fabric On Body</h1>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/studio/fashion/render" className="ft-btn">← 来自成款</Link>
          <button type="button" className="ft-btn">保存草稿</button>
          <Link href="/studio/publish" className="ft-btn is-primary">发布到画廊</Link>
        </div>
      </div>

      <input ref={fabricRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onFabricChange} />
      <input ref={garmentRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onGarmentChange} />

      <div className="ft-grid">
        <aside className="ft-aside">
          <div className="ft-card">
            <div className="ft-card__head"><h2>① 面料图</h2></div>
            <div
              className="ft-thumbnail is-uploaded"
              onClick={() => fabricRef.current?.click()}
              style={{ cursor: "pointer" }}
            >
              {fabricPreview ? (
                <img src={fabricPreview} alt="面料" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <AssetImage
                  src={products[1].image}
                  alt="面料"
                  tone={products[1].tone}
                  label="点击上传面料"
                  className="ft-thumbnail__img"
                />
              )}
            </div>
            <small style={{ display: "block", marginTop: 8, fontSize: 11, color: "var(--ft-text2)" }}>
              {fabricPreview ? "已上传 · 点击替换" : "点击上传面料图（必须）"}
            </small>
          </div>

          <div className="ft-card">
            <div className="ft-card__head"><h2>② 服装图</h2></div>
            <div
              className="ft-thumbnail is-uploaded"
              onClick={() => garmentRef.current?.click()}
              style={{ cursor: "pointer" }}
            >
              {garmentPreview ? (
                <img src={garmentPreview} alt="服装" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <AssetImage
                  src={products[0].image}
                  alt="服装"
                  tone={products[0].tone}
                  label="点击上传服装"
                  className="ft-thumbnail__img"
                />
              )}
            </div>
            <small style={{ display: "block", marginTop: 8, fontSize: 11, color: "var(--ft-text2)" }}>
              {garmentPreview ? "已上传 · 点击替换" : "点击上传服装图（必须）"}
            </small>
          </div>

          <div className="ft-card">
            <div className="ft-card__head"><h2>③ 面料类型</h2></div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {FABRIC_TYPES.map((f) => (
                <span
                  key={f.id}
                  className={`ft-stage__chip ${fabricType.id === f.id ? "is-active" : ""}`}
                  onClick={() => setFabricType(f)}
                  style={{ cursor: "pointer" }}
                >
                  {f.label}
                </span>
              ))}
            </div>
            <small style={{ display: "block", marginTop: 8, fontSize: 11, color: "var(--ft-text3)" }}>
              {fabricType.desc}
            </small>
          </div>

          <div className="ft-card">
            <div className="ft-card__head"><h2>④ 应用区域 / 模型</h2></div>
            <div className="ft-field">
              <label>区域</label>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {AREAS.map((a) => (
                  <span
                    key={a.id}
                    className={`ft-stage__chip ${area.id === a.id ? "is-active" : ""}`}
                    onClick={() => setArea(a)}
                    style={{ cursor: "pointer" }}
                  >
                    {a.label}
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
              {loading ? "生成中…" : "生成 2 张面料上身图"}
            </button>
          </div>
        </aside>

        <section>
          <div className="ft-stage">
            <div className="ft-stage__head">
              <h2>面料上身效果（{results.length} / 2）</h2>
              <div className="ft-stage__bar">
                <span className="ft-stage__chip is-active">写实模特</span>
                <span className="ft-stage__chip">面料特写</span>
                <span className="ft-stage__chip">褶皱细节</span>
                <span className="ft-stage__chip">不同光照</span>
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
                        alt={`面料上身 ${i + 1}`}
                        style={{ width: "100%", height: "100%", objectFit: "cover", cursor: "zoom-in" }}
                        onClick={() => window.open(img.url, "_blank", "noopener,noreferrer")}
                      />
                      <div className="ft-result__overlay">
                        <span className="ft-result__chip">{fabricType.label} · 方案 {String.fromCharCode(65 + i)}</span>
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
                        label={`示例 ${i + 1}`}
                        className="ft-result__img"
                      />
                      <div className="ft-result__overlay">
                        <span className="ft-result__chip">{["弹力针织", "醋酸真丝"][i]}</span>
                      </div>
                    </div>
                  ))}
            </div>

            <div className="ft-actions">
              <button type="button" className="ft-actionBtn" onClick={onGenerate} disabled={loading}>
                <span className="ic">↻</span><span>重新生成</span>
              </button>
              <button type="button" className="ft-actionBtn" disabled={results.length === 0}
                onClick={() => results.forEach((r) => downloadImage(r.url))}>
                <span className="ic">⤓</span><span>下载组图</span>
              </button>
              <Link href="/studio/publish/tech-pack" className="ft-actionBtn"><span className="ic">▦</span><span>Tech Pack</span></Link>
              <button type="button" className="ft-actionBtn"><span className="ic">↗</span><span>对比模式</span></button>
              <button type="button" className="ft-actionBtn"><span className="ic">♡</span><span>收藏</span></button>
              <Link href="/studio/publish" className="ft-actionBtn"><span className="ic">✓</span><span>发布</span></Link>
            </div>
          </div>

          <section className="ft-helpRow">
            <article className="ft-helpCard">
              <b>生成流程说明</b>
              <p>面料图 → 类型识别 → 物理属性建模 → 贴图到款式 → 模特上身渲染。每步可独立锁定，避免重新生成时丢参数。</p>
            </article>
            <article className="ft-helpCard">
              <b>效果对比说明</b>
              <p>2 张图同时展示同面料不同视角；点击切换到"对比模式"可以两两并排查看褶皱与光泽差异。</p>
            </article>
            <article className="ft-helpCard">
              <b>实物对照</b>
              <p>渲染图与工厂打样的颜色 ΔE 通常 &lt; 2.5；建议在客户决定前再寄一组实物色样。</p>
            </article>
          </section>
        </section>

        <aside className="ft-aside">
          <div className="ft-card">
            <div className="ft-card__head">
              <h2>历史结果</h2>
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
                    <b>F-{String(2604 - i * 4).padStart(4, "0")}</b>
                    <small>{["真丝缎", "针织", "亚麻", "蕾丝", "缎面"][i]} · {["刚刚", "12 分钟前", "1 小时前", "今晨", "昨天"][i]}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="ft-card" style={{ background: "linear-gradient(135deg, var(--ft-gold-bg), rgba(176,134,92,0.02))" }}>
            <b style={{ display: "block", fontSize: 13, color: "var(--ft-text)", marginBottom: 6 }}>下一步：导出 Tech Pack</b>
            <p style={{ margin: 0, fontSize: 12, color: "var(--ft-text2)", lineHeight: 1.7, marginBottom: 10 }}>
              满意上身效果后，可一键导出包含面料属性 + 工艺单 + 用料表的 Tech Pack。
            </p>
            <Link href="/studio/publish/tech-pack" className="ft-btn is-primary" style={{ width: "100%", justifyContent: "center" }}>
              导出 Tech Pack →
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
