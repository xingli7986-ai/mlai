"use client";

import Link from "next/link";
import AssetImage from "@/components/AssetImage";
import { products } from "@/lib/home-consumer-data";
import "../../studio-home.css";
import "../../fashion/fashion-tool.css";

const TILES = [
  { id: "direct", label: "直接平铺" },
  { id: "mirror", label: "对称翻转" },
  { id: "rotate", label: "45° 旋转" },
  { id: "hex", label: "六角拼接" },
];

const HISTORY = products.slice(0, 5);

export default function PatternSeamlessPage() {
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
          <p className="eyebrow">PATTERN STUDIO · 03</p>
          <h1>四方连续 · Seamless Tile</h1>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button type="button" className="ft-btn">导入图案</button>
          <button type="button" className="ft-btn">保存草稿</button>
          <Link href="/studio/publish" className="ft-btn is-primary">发布到画廊</Link>
        </div>
      </div>

      <div className="ft-grid">
        <aside className="ft-aside">
          <div className="ft-card">
            <div className="ft-card__head"><h2>① 输入图案</h2></div>
            <div className="ft-thumbnail is-uploaded">
              <AssetImage
                src={products[0].image}
                alt="输入图案"
                tone={products[0].tone}
                label="原图"
                className="ft-thumbnail__img"
              />
            </div>
            <small style={{ display: "block", marginTop: 8, fontSize: 11, color: "var(--ft-text2)" }}>
              MaxLuLu Pattern · 12.png
            </small>
          </div>

          <div className="ft-card">
            <div className="ft-card__head"><h2>② 拼接方式</h2></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              {TILES.map((t, i) => (
                <button key={t.id} type="button" className={`ft-btn ${i === 1 ? "is-primary" : ""}`} style={{ height: 36, padding: "0 10px", fontSize: 11 }}>
                  {t.label}
                </button>
              ))}
            </div>
            <div className="ft-slider" style={{ marginTop: 12 }}>
              <label><span>重叠 / Overlap</span><span>18%</span></label>
              <input type="range" min={0} max={50} defaultValue={18} />
            </div>
            <div className="ft-slider" style={{ marginBottom: 0 }}>
              <label><span>羽化 / Feather</span><span>8 px</span></label>
              <input type="range" min={0} max={32} defaultValue={8} />
            </div>
          </div>

          <div className="ft-card">
            <div className="ft-card__head"><h2>③ 微调</h2></div>
            <div className="ft-slider">
              <label><span>缩放</span><span>100%</span></label>
              <input type="range" min={40} max={160} defaultValue={100} />
            </div>
            <div className="ft-slider">
              <label><span>旋转</span><span>0°</span></label>
              <input type="range" min={-180} max={180} defaultValue={0} />
            </div>
            <div className="ft-slider">
              <label><span>X 位移</span><span>0 px</span></label>
              <input type="range" min={-200} max={200} defaultValue={0} />
            </div>
            <div className="ft-slider" style={{ marginBottom: 0 }}>
              <label><span>Y 位移</span><span>0 px</span></label>
              <input type="range" min={-200} max={200} defaultValue={0} />
            </div>
          </div>

          <div className="ft-card">
            <div className="ft-card__head"><h2>④ 接缝校准</h2></div>
            <div style={{ display: "grid", gap: 8 }}>
              <label className="ft-stage__chip" style={{ justifyContent: "space-between", width: "100%", height: 32 }}>
                <span>自动消除接缝</span>
                <span style={{ color: "var(--ft-gold)" }}>ON</span>
              </label>
              <label className="ft-stage__chip" style={{ justifyContent: "space-between", width: "100%", height: 32 }}>
                <span>边缘镜像采样</span>
                <span style={{ color: "var(--ft-gold)" }}>ON</span>
              </label>
              <label className="ft-stage__chip" style={{ justifyContent: "space-between", width: "100%", height: 32 }}>
                <span>颜色平衡</span>
                <span style={{ color: "var(--ft-text2)" }}>OFF</span>
              </label>
            </div>
            <button type="button" className="ft-btn is-primary" style={{ width: "100%", marginTop: 12 }}>
              生成无缝四方连续
            </button>
          </div>
        </aside>

        <section>
          <div className="ft-stage">
            <div className="ft-stage__head">
              <h2>预览（2×2 / 3×3 / 单平铺）</h2>
              <div className="ft-stage__bar">
                <span className="ft-stage__chip">1×</span>
                <span className="ft-stage__chip is-active">2×</span>
                <span className="ft-stage__chip">3×</span>
                <span className="ft-stage__chip">5×</span>
                <span className="ft-stage__chip">网格线</span>
              </div>
            </div>

            <div className="ft-results" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
              {products.slice(0, 3).map((p, i) => (
                <div key={p.id} className={`ft-result tone-${p.tone}`} style={{ aspectRatio: "1" }}>
                  <AssetImage
                    src={p.image}
                    alt={p.name}
                    tone={p.tone}
                    label={["2×2 拼贴", "3×3 拼贴", "单 Tile"][i]}
                    className="ft-result__img"
                  />
                  <div className="ft-result__overlay">
                    <span className="ft-result__chip">{["2×2 拼贴", "3×3 拼贴", "单 Tile"][i]}</span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{
              marginTop: 16,
              display: "grid",
              gridTemplateColumns: "1fr 130px",
              gap: 16,
              alignItems: "center",
              padding: 14,
              borderRadius: 12,
              background: "var(--ft-bg)",
              border: "1px solid var(--ft-border)",
            }}>
              <div className="ft-slider" style={{ marginBottom: 0 }}>
                <label><span>实时预览缩放</span><span>120%</span></label>
                <input type="range" min={50} max={300} defaultValue={120} />
              </div>
              <div style={{ position: "relative", textAlign: "center" }}>
                <svg width="100" height="100" viewBox="0 0 100 100" aria-hidden>
                  <circle cx="50" cy="50" r="42" stroke="rgba(176,134,92,0.16)" strokeWidth="8" fill="none" />
                  <circle cx="50" cy="50" r="42" stroke="var(--ft-gold)" strokeWidth="8" fill="none" strokeLinecap="round" strokeDasharray={`${0.96 * 264} 264`} transform="rotate(-90 50 50)" />
                </svg>
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <b style={{ fontFamily: "var(--font-display, Georgia)", fontSize: 22, color: "var(--ft-gold)", lineHeight: 1, fontWeight: 700 }}>96%</b>
                  <small style={{ fontSize: 10, color: "var(--ft-text2)" }}>无缝度</small>
                </div>
              </div>
            </div>

            <div className="ft-actions">
              <button type="button" className="ft-actionBtn"><span className="ic">⤓</span><span>导出 PNG</span></button>
              <button type="button" className="ft-actionBtn"><span className="ic">⤓</span><span>导出 SVG</span></button>
              <button type="button" className="ft-actionBtn"><span className="ic">▦</span><span>导出工艺单</span></button>
              <Link href="/studio/fashion/pattern" className="ft-actionBtn"><span className="ic">↗</span><span>上身演示</span></Link>
              <button type="button" className="ft-actionBtn"><span className="ic">♡</span><span>收藏</span></button>
              <Link href="/studio/publish" className="ft-actionBtn"><span className="ic">✓</span><span>发布</span></Link>
            </div>
          </div>

          <section className="ft-helpRow">
            <article className="ft-helpCard">
              <b>处理逻辑</b>
              <p>系统会基于"重叠 / 羽化"参数计算贴边像素，并以镜像采样去除接缝；超过 18% 重叠通常足以通过工厂打样。</p>
            </article>
            <article className="ft-helpCard">
              <b>交互细则</b>
              <p>滑块调节实时预览；切换拼接方式不会丢失参数；点击预览图可全屏检查接缝；右上方"无缝度"超过 90% 即可发布。</p>
            </article>
            <article className="ft-helpCard">
              <b>路由</b>
              <p style={{ marginTop: 8, fontFamily: "monospace", fontSize: 11, color: "var(--ft-text2)" }}>
                /studio/pattern/seamless<br />
                ↗ /studio/fashion/pattern<br />
                ↗ /studio/publish
              </p>
            </article>
          </section>
        </section>

        <aside className="ft-aside">
          <div className="ft-card">
            <div className="ft-card__head">
              <h2>历史记录</h2>
              <Link href="/studio/dashboard" className="more">全部 →</Link>
            </div>
            <div className="ft-history">
              {HISTORY.map((p, i) => (
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
                    <b>S-{String(2604 - i * 5).padStart(4, "0")}</b>
                    <small>{["96%", "92%", "88%", "84%", "76%"][i]} 无缝度 · {["刚刚", "12 分钟前", "1 小时前", "今晨", "昨天"][i]}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="ft-card">
            <div className="ft-card__head"><h2>配色派生</h2></div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {(["ink", "blue", "rose", "gold", "green", "wine", "coffee", "camellia"] as const).map((t, i) => (
                <button key={t} type="button" aria-label={t} style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  border: i === 0 ? "2px solid var(--ft-gold)" : "2px solid transparent",
                  outline: "1px solid var(--ft-border)",
                  outlineOffset: i === 0 ? 2 : 0,
                  cursor: "pointer",
                  padding: 0,
                  background: {
                    ink: "linear-gradient(135deg, #2b241f, #4a3f36)",
                    blue: "linear-gradient(135deg, #4a6a88, #2c4258)",
                    rose: "linear-gradient(135deg, #c08a90, #82505a)",
                    gold: "linear-gradient(135deg, #c8a570, #8a6a40)",
                    green: "linear-gradient(135deg, #4a6a4a, #2c402c)",
                    wine: "linear-gradient(135deg, #7a2030, #4a121d)",
                    coffee: "linear-gradient(135deg, #8a6a4a, #5a4530)",
                    camellia: "linear-gradient(135deg, #b94a3a, #6b2820)",
                  }[t],
                }} />
              ))}
            </div>
            <small style={{ display: "block", marginTop: 10, fontSize: 11, color: "var(--ft-text3)" }}>
              点击颜色生成同图案 8 个配色版本
            </small>
          </div>

          <div className="ft-card" style={{ background: "linear-gradient(135deg, var(--ft-gold-bg), rgba(176,134,92,0.02))" }}>
            <b style={{ display: "block", fontSize: 13, color: "var(--ft-text)", marginBottom: 6 }}>下一步：图案上身</b>
            <p style={{ margin: 0, fontSize: 12, color: "var(--ft-text2)", lineHeight: 1.7, marginBottom: 10 }}>
              四方连续完成后，可直接进入"图案上身"工具，看真人模特效果。
            </p>
            <Link href="/studio/fashion/pattern" className="ft-btn is-primary" style={{ width: "100%", justifyContent: "center" }}>
              转入 图案上身 →
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
