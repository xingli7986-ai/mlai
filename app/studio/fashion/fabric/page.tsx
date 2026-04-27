"use client";

import Link from "next/link";
import AssetImage from "@/components/AssetImage";
import { products } from "@/lib/home-consumer-data";
import "../../studio-home.css";
import "../fashion-tool.css";

const FABRIC_TYPES = [
  { id: "knit", label: "弹力针织" },
  { id: "silk", label: "醋酸真丝" },
  { id: "linen", label: "亚麻棉" },
  { id: "blend", label: "高定混纺" },
  { id: "lace", label: "蕾丝" },
  { id: "satin", label: "缎面" },
];

const STYLES = ["裹身", "直筒", "A 字", "鱼尾"];

export default function FabricApplyPage() {
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

      <div className="ft-grid">
        <aside className="ft-aside">
          <div className="ft-card">
            <div className="ft-card__head"><h2>① 输入面料图</h2></div>
            <div className="ft-thumbnail is-uploaded">
              <AssetImage
                src={products[1].image}
                alt="面料"
                tone={products[1].tone}
                label="面料"
                className="ft-thumbnail__img"
              />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6, marginTop: 10 }}>
              {[
                "repeating-linear-gradient(45deg, #efe5d5, #efe5d5 4px, #e3d5be 4px, #e3d5be 8px)",
                "repeating-linear-gradient(0deg, #d8c9b0, #d8c9b0 3px, #c4b39a 3px, #c4b39a 6px)",
                "linear-gradient(135deg, #d4c5ad 0%, #b8a586 100%)",
                "repeating-linear-gradient(90deg, #e8e0d2, #e8e0d2 5px, #d6cab4 5px, #d6cab4 10px)",
              ].map((g, i) => (
                <button key={i} type="button" style={{
                  aspectRatio: 1,
                  borderRadius: 8,
                  background: g,
                  border: i === 0 ? "2px solid var(--ft-gold)" : "1px solid var(--ft-border)",
                  cursor: "pointer",
                  padding: 0,
                }} />
              ))}
            </div>
          </div>

          <div className="ft-card">
            <div className="ft-card__head"><h2>② 面料类型</h2></div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {FABRIC_TYPES.map((f, i) => (
                <span key={f.id} className={`ft-stage__chip ${i === 0 ? "is-active" : ""}`}>{f.label}</span>
              ))}
            </div>
          </div>

          <div className="ft-card">
            <div className="ft-card__head"><h2>③ 面料属性</h2></div>
            <div className="ft-slider">
              <label><span>厚度 / 克重</span><span>180 g</span></label>
              <input type="range" min={80} max={420} defaultValue={180} />
            </div>
            <div className="ft-slider">
              <label><span>垂坠感</span><span>72%</span></label>
              <input type="range" min={0} max={100} defaultValue={72} />
            </div>
            <div className="ft-slider">
              <label><span>透光度</span><span>20%</span></label>
              <input type="range" min={0} max={100} defaultValue={20} />
            </div>
            <div className="ft-slider">
              <label><span>反光强度</span><span>34%</span></label>
              <input type="range" min={0} max={100} defaultValue={34} />
            </div>
            <div className="ft-slider" style={{ marginBottom: 0 }}>
              <label><span>褶皱深度</span><span>中</span></label>
              <input type="range" min={1} max={5} defaultValue={3} />
            </div>
          </div>

          <div className="ft-card">
            <div className="ft-card__head"><h2>④ 套用款式</h2></div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {STYLES.map((s, i) => (
                <span key={s} className={`ft-stage__chip ${i === 0 ? "is-active" : ""}`}>{s}</span>
              ))}
            </div>
            <button type="button" className="ft-btn is-primary" style={{ width: "100%", marginTop: 12 }}>
              生成 4 张面料上身图
            </button>
          </div>
        </aside>

        <section>
          <div className="ft-stage">
            <div className="ft-stage__head">
              <h2>面料上身效果（4 / 4）</h2>
              <div className="ft-stage__bar">
                <span className="ft-stage__chip is-active">写实模特</span>
                <span className="ft-stage__chip">面料特写</span>
                <span className="ft-stage__chip">褶皱细节</span>
                <span className="ft-stage__chip">不同光照</span>
              </div>
            </div>

            <div className="ft-results" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
              {products.slice(0, 4).map((p, i) => (
                <div key={p.id} className={`ft-result tone-${p.tone}`} style={{ aspectRatio: "3 / 4" }}>
                  <AssetImage
                    src={p.image}
                    alt={p.name}
                    tone={p.tone}
                    label={`面料 ${i + 1}`}
                    className="ft-result__img"
                  />
                  <div className="ft-result__overlay">
                    <span className="ft-result__chip">{["弹力针织", "醋酸真丝", "亚麻棉", "高定混纺"][i]}</span>
                    <div className="ft-result__icons">
                      <button type="button">⤓</button>
                      <button type="button">♡</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{
              marginTop: 14,
              padding: 14,
              borderRadius: 12,
              background: "var(--ft-bg)",
              border: "1px solid var(--ft-border)",
              display: "grid",
              gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
              gap: 10,
              fontSize: 11,
              color: "var(--ft-text2)",
            }}>
              {[
                { name: "弹力针织", thick: "180g", drape: "中", lustre: "低" },
                { name: "醋酸真丝", thick: "120g", drape: "高", lustre: "高" },
                { name: "亚麻棉", thick: "220g", drape: "低", lustre: "无" },
                { name: "高定混纺", thick: "260g", drape: "中高", lustre: "中" },
              ].map((d) => (
                <div key={d.name} style={{ display: "grid", gap: 2 }}>
                  <b style={{ fontSize: 12, color: "var(--ft-text)" }}>{d.name}</b>
                  <span>克重 {d.thick}</span>
                  <span>垂坠 {d.drape}</span>
                  <span>反光 {d.lustre}</span>
                </div>
              ))}
            </div>

            <div className="ft-actions">
              <button type="button" className="ft-actionBtn"><span className="ic">↻</span><span>重新生成</span></button>
              <button type="button" className="ft-actionBtn"><span className="ic">⤓</span><span>下载组图</span></button>
              <Link href="/my/orders" className="ft-actionBtn"><span className="ic">▦</span><span>Tech Pack</span></Link>
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
              <p>4 张图同时展示不同面料；点击切换到"对比模式"可以两两并排查看褶皱与光泽差异。</p>
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
            <Link href="/my/orders" className="ft-btn is-primary" style={{ width: "100%", justifyContent: "center" }}>
              导出 Tech Pack →
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
