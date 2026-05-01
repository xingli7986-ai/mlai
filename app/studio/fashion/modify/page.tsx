"use client";

import Link from "next/link";
import AssetImage from "@/components/AssetImage";
import { products } from "@/lib/home-consumer-data";
import "../../studio-home.css";
import "../fashion-tool.css";

const COMPARE = products.slice(0, 2);
const CANDIDATES = products.slice(2, 6);
const HISTORY = products.slice(0, 5);

const MODIFY_AREAS = [
  { id: "neck", label: "领口" },
  { id: "sleeve", label: "袖子" },
  { id: "waist", label: "腰部" },
  { id: "hem", label: "下摆" },
  { id: "back", label: "后背" },
  { id: "custom", label: "自定义" },
];

export default function ModifyPage() {
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
          <p className="eyebrow">GARMENT LAB · 10</p>
          <h1>局部改款 · Local Modify</h1>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button type="button" className="ft-btn">撤销</button>
          <button type="button" className="ft-btn">保存到草稿</button>
          <button type="button" className="ft-btn is-primary">应用并发布</button>
        </div>
      </div>

      <div className="ft-grid">
        <aside className="ft-aside">
          <div className="ft-card">
            <div className="ft-card__head"><h2>① 输入图</h2></div>
            <div className="ft-thumbnail is-uploaded">
              <AssetImage
                src={products[0].image}
                alt="原图"
                tone={products[0].tone}
                label="原图"
                className="ft-thumbnail__img"
              />
            </div>
            <small style={{ display: "block", marginTop: 8, fontSize: 11, color: "var(--ft-text2)" }}>
              文件名：wrap-dress-floral-v2.png
            </small>
          </div>

          <div className="ft-card">
            <div className="ft-card__head"><h2>② 蒙版工具</h2></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 10 }}>
              <button type="button" className="ft-btn">画笔</button>
              <button type="button" className="ft-btn is-primary">魔棒</button>
              <button type="button" className="ft-btn">套索</button>
              <button type="button" className="ft-btn">擦除</button>
            </div>
            <div className="ft-slider">
              <label><span>笔刷大小</span><span>32 px</span></label>
              <input type="range" min={4} max={120} defaultValue={32} />
            </div>
            <div className="ft-slider">
              <label><span>羽化</span><span>8 px</span></label>
              <input type="range" min={0} max={32} defaultValue={8} />
            </div>
          </div>

          <div className="ft-card">
            <div className="ft-card__head"><h2>③ 标记 / 替换</h2></div>
            <div className="ft-field">
              <label>修改区域</label>
              <select defaultValue="neck">
                {MODIFY_AREAS.map((m) => (
                  <option key={m.id} value={m.id}>{m.label}</option>
                ))}
              </select>
            </div>
            <div className="ft-field">
              <label>修改指令</label>
              <textarea defaultValue="把领口改成深 V 领，加细绑带交叉装饰，保留原印花。" />
            </div>
            <button type="button" className="ft-btn is-primary" style={{ width: "100%" }}>
              生成 4 个改款方案
            </button>
          </div>

          <div className="ft-card">
            <div className="ft-card__head"><h2>④ 灵感预设</h2></div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {["深 V 领", "方领", "高领", "拉链款", "灯笼袖", "鱼尾摆", "开叉"].map((t) => (
                <span key={t} className="ft-stage__chip" style={{ cursor: "pointer" }}>{t}</span>
              ))}
            </div>
          </div>
        </aside>

        <section>
          <div className="ft-stage">
            <div className="ft-stage__head">
              <h2>对比预览区</h2>
              <div className="ft-stage__bar">
                <span className="ft-stage__chip is-active">原图 / 改款</span>
                <span className="ft-stage__chip">蒙版叠加</span>
                <span className="ft-stage__chip">线稿</span>
                <span className="ft-stage__chip">无背景</span>
              </div>
            </div>
            <div className="ft-results" style={{ gridTemplateColumns: "1fr 1fr" }}>
              {COMPARE.map((p, i) => (
                <div key={p.id} className={`ft-result tone-${p.tone}`}>
                  <AssetImage
                    src={p.image}
                    alt={p.name}
                    tone={p.tone}
                    label={i === 0 ? "原图" : "改款 V1"}
                    className="ft-result__img"
                  />
                  <div className="ft-result__overlay">
                    <span className="ft-result__chip">{i === 0 ? "原图 · Before" : "改款 · After"}</span>
                    <div className="ft-result__icons">
                      <button type="button">⤓</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 18 }}>
              <h2 style={{ fontSize: 14, marginBottom: 10 }}>候选方案</h2>
              <div className="ft-results" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
                {CANDIDATES.map((p, i) => (
                  <div key={p.id} className={`ft-result tone-${p.tone}`} style={{ aspectRatio: "3 / 4" }}>
                    <AssetImage
                      src={p.image}
                      alt={p.name}
                      tone={p.tone}
                      label={`改款 ${String.fromCharCode(65 + i)}`}
                      className="ft-result__img"
                    />
                    <div className="ft-result__overlay">
                      <span className="ft-result__chip">候选 {String.fromCharCode(65 + i)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <section className="ft-helpRow">
            <article className="ft-helpCard">
              <b>蒙版边界 · 1 cm 缝份</b>
              <p>系统会自动将你画出的蒙版区域外扩 1 cm 以模拟缝份，确保替换后边界自然。</p>
            </article>
            <article className="ft-helpCard">
              <b>保留原印花</b>
              <p>勾选"保留原印花"后，AI 会优先在改款区域复用原图的色彩与纹理特征。</p>
            </article>
            <article className="ft-helpCard">
              <b>批量生成</b>
              <p>每次最多生成 4 个候选方案，每个方案在右侧"编辑历史"中独立保存。</p>
            </article>
          </section>
        </section>

        <aside className="ft-aside">
          <div className="ft-card">
            <div className="ft-card__head">
              <h2>编辑历史</h2>
              <a href="#all" className="more">全部 →</a>
            </div>
            <div className="ft-history">
              {HISTORY.map((p, i) => (
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
                    <b>V{HISTORY.length - i}</b>
                    <small>{["改 V 领", "改袖型", "改下摆", "腰侧调整", "整体配色"][i]}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="ft-card" style={{ background: "linear-gradient(135deg, var(--ft-gold-bg), rgba(176,134,92,0.02))" }}>
            <b style={{ display: "block", fontSize: 13, color: "var(--ft-text)", marginBottom: 6 }}>下一步：图案上身</b>
            <p style={{ margin: 0, fontSize: 12, color: "var(--ft-text2)", lineHeight: 1.7, marginBottom: 10 }}>
              满意改款后，可直接传到"图案上身"工具，生成模特上身效果。
            </p>
            <Link href="/studio/fashion/pattern" className="ft-btn is-primary" style={{ width: "100%", justifyContent: "center" }}>
              发送到 图案上身 →
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
