"use client";

import Link from "next/link";
import AssetImage from "@/components/AssetImage";
import { products } from "@/lib/home-consumer-data";
import "../../studio-home.css";
import "../fashion-tool.css";

const RESULTS = products.slice(0, 4);
const HISTORY = products.slice(0, 6);

const ACTIONS = [
  { ic: "↻", label: "重生成" },
  { ic: "✚", label: "微调" },
  { ic: "✦", label: "高清" },
  { ic: "↗", label: "上身预览" },
  { ic: "⤓", label: "下载" },
  { ic: "✓", label: "发布" },
];

export default function PatternApplyPage() {
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
          <p className="eyebrow">GARMENT LAB · 16</p>
          <h1>图案上身 · Pattern Apply</h1>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button type="button" className="ft-btn">导入历史</button>
          <button type="button" className="ft-btn">保存到草稿</button>
          <button type="button" className="ft-btn is-primary">发布到画廊</button>
        </div>
      </div>

      <div className="ft-grid">
        <aside className="ft-aside">
          <div className="ft-card">
            <div className="ft-card__head"><h2>① 输入图案</h2></div>
            <div className="ft-thumbnail is-uploaded">
              <AssetImage
                src={products[0].image}
                alt="pattern"
                tone={products[0].tone}
                label="印花"
                className="ft-thumbnail__img"
              />
            </div>
            <div className="ft-field" style={{ marginTop: 12, marginBottom: 0 }}>
              <label>或选择已有图案</label>
              <div className="ft-pickRow">
                {products.slice(1, 4).map((p, i) => (
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
            </div>
          </div>

          <div className="ft-card">
            <div className="ft-card__head"><h2>② 选择服装</h2></div>
            <div className="ft-field">
              <label>款式分类</label>
              <select defaultValue="wrap">
                <option value="wrap">针织裹身裙</option>
                <option value="shift">直筒连衣裙</option>
                <option value="deep-v">深 V 连衣裙</option>
                <option value="flutter">飞袖连衣裙</option>
              </select>
            </div>
            <div className="ft-field">
              <label>面料</label>
              <select defaultValue="knit">
                <option value="knit">弹力针织</option>
                <option value="silk">真丝缎</option>
                <option value="linen">亚麻棉</option>
              </select>
            </div>
            <div className="ft-field">
              <label>身材类型</label>
              <select defaultValue="standard">
                <option value="petite">小个子</option>
                <option value="standard">标准</option>
                <option value="tall">高个子</option>
                <option value="curvy">丰满</option>
              </select>
            </div>
          </div>

          <div className="ft-card">
            <div className="ft-card__head"><h2>③ 上身参数</h2></div>
            <div className="ft-slider">
              <label><span>图案缩放</span><span>100%</span></label>
              <input type="range" min={40} max={160} defaultValue={100} />
            </div>
            <div className="ft-slider">
              <label><span>图案旋转</span><span>0°</span></label>
              <input type="range" min={-45} max={45} defaultValue={0} />
            </div>
            <div className="ft-slider">
              <label><span>密度</span><span>中</span></label>
              <input type="range" min={1} max={5} defaultValue={3} />
            </div>
            <button type="button" className="ft-btn is-primary" style={{ width: "100%", marginTop: 8 }}>
              生成 4 张上身效果图
            </button>
          </div>
        </aside>

        <section>
          <div className="ft-stage">
            <div className="ft-stage__head">
              <h2>对比预览区</h2>
              <div className="ft-stage__bar">
                <span className="ft-stage__chip is-active">写实模特</span>
                <span className="ft-stage__chip">线稿</span>
                <span className="ft-stage__chip">无背景</span>
                <span className="ft-stage__chip">环境光</span>
              </div>
            </div>
            <div className="ft-results">
              {RESULTS.map((p, i) => (
                <div key={p.id} className={`ft-result tone-${p.tone}`}>
                  <AssetImage
                    src={p.image}
                    alt={p.name}
                    tone={p.tone}
                    label={`方案 ${i + 1}`}
                    className="ft-result__img"
                  />
                  <div className="ft-result__overlay">
                    <span className="ft-result__chip">方案 {String.fromCharCode(65 + i)}</span>
                    <div className="ft-result__icons">
                      <button type="button">⤓</button>
                      <button type="button">♡</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="ft-actions">
              {ACTIONS.map((a) => (
                <button key={a.label} type="button" className="ft-actionBtn">
                  <span className="ic">{a.ic}</span>
                  <span>{a.label}</span>
                </button>
              ))}
            </div>
          </div>

          <section className="ft-helpRow">
            <article className="ft-helpCard">
              <b>图案使用提示</b>
              <p>建议主题图案为 PNG 透明背景，分辨率 ≥ 2000×2000，支持四方连续可获得更稳定的接缝。</p>
            </article>
            <article className="ft-helpCard">
              <b>服装贴合参数</b>
              <p>缩放与密度共同决定图案在身上的视觉占比；针织面料建议密度 3-4，真丝建议 2-3。</p>
            </article>
            <article className="ft-helpCard">
              <b>工艺导出</b>
              <p>满意的方案可一键生成 Tech Pack（含色卡 + 缝份 + 工艺单），可发送给工厂直接打样。</p>
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
                    <b>方案 #{2604 + i}</b>
                    <small>{i === 0 ? "刚刚" : `${i * 12} 分钟前`} · {["精修", "草稿", "已发布", "草稿", "草稿", "归档"][i]}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="ft-card" style={{ background: "linear-gradient(135deg, var(--ft-gold-bg), rgba(176,134,92,0.02))" }}>
            <b style={{ display: "block", fontSize: 13, color: "var(--ft-text)", marginBottom: 6 }}>下一步：发布到灵感画廊</b>
            <p style={{ margin: 0, fontSize: 12, color: "var(--ft-text2)", lineHeight: 1.7, marginBottom: 10 }}>
              选定满意方案后，可一键带入发布表单，直接进入审核流。
            </p>
            <Link href="/studio/publish" className="ft-btn is-primary" style={{ width: "100%", justifyContent: "center" }}>
              进入发布流程 →
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
