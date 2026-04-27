"use client";

import Link from "next/link";
import AssetImage from "@/components/AssetImage";
import { products } from "@/lib/home-consumer-data";
import "../../studio-home.css";
import "../../fashion/fashion-tool.css";

const STYLE_TAGS = [
  "水墨晕染", "工笔花卉", "几何拼接", "扎染", "复古花鸟",
  "热带印花", "Art Deco", "波西米亚", "极简",
];

const RESULTS = products.slice(0, 4);
const HISTORY = products.slice(0, 6);

const ACTIONS = [
  { ic: "♡", label: "收藏" },
  { ic: "↗", label: "上身" },
  { ic: "⤓", label: "下载" },
  { ic: "✚", label: "再生成" },
  { ic: "✓", label: "发布" },
];

const ROUTES = [
  { code: "/studio/pattern/generate", desc: "图案生成（当前）" },
  { code: "/studio/pattern/seamless", desc: "四方连续" },
  { code: "/studio/pattern/edit", desc: "图案修改" },
  { code: "/studio/fashion/pattern", desc: "图案上身" },
  { code: "/studio/publish", desc: "发布到画廊" },
];

export default function PatternGeneratePage() {
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
          <p className="eyebrow">PATTERN STUDIO · 01</p>
          <h1>图案生成 · Pattern Generate</h1>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button type="button" className="ft-btn">导入历史</button>
          <button type="button" className="ft-btn">保存为模板</button>
          <Link href="/studio/publish" className="ft-btn is-primary">发布到画廊</Link>
        </div>
      </div>

      <div className="ft-grid">
        <aside className="ft-aside">
          <div className="ft-card">
            <div className="ft-card__head"><h2>① 输入风格</h2></div>
            <div className="ft-field">
              <label>创意描述</label>
              <textarea defaultValue="水墨写意花卉，山茶+海棠混搭，深棕底色，线条柔和；适合针织裹身裙。" />
            </div>
            <div className="ft-field" style={{ marginBottom: 0 }}>
              <label>风格标签 · 已选 3</label>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {STYLE_TAGS.map((t, i) => (
                  <span key={t} className={`ft-stage__chip ${i < 3 ? "is-active" : ""}`}>{t}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="ft-card">
            <div className="ft-card__head"><h2>参考印花 · 可选</h2></div>
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
            <small style={{ display: "block", marginTop: 8, fontSize: 11, color: "var(--ft-text3)" }}>
              拖入或点击上传 · 最多 3 张参考
            </small>
          </div>

          <div className="ft-card">
            <div className="ft-card__head"><h2>② 风格参数</h2></div>
            <div className="ft-slider">
              <label><span>复杂度</span><span>62%</span></label>
              <input type="range" min={0} max={100} defaultValue={62} />
            </div>
            <div className="ft-slider">
              <label><span>对比度</span><span>48%</span></label>
              <input type="range" min={0} max={100} defaultValue={48} />
            </div>
            <div className="ft-slider">
              <label><span>色彩饱和</span><span>72%</span></label>
              <input type="range" min={0} max={100} defaultValue={72} />
            </div>
            <div className="ft-slider" style={{ marginBottom: 0 }}>
              <label><span>纹理粒度</span><span>中</span></label>
              <input type="range" min={1} max={5} defaultValue={3} />
            </div>
          </div>

          <div className="ft-card">
            <div className="ft-card__head"><h2>③ 输出尺寸</h2></div>
            <div className="ft-field">
              <label>分辨率</label>
              <select defaultValue="2048">
                <option value="1024">1024 × 1024 · 草稿</option>
                <option value="2048">2048 × 2048 · 标准</option>
                <option value="4096">4096 × 4096 · 高清</option>
              </select>
            </div>
            <div className="ft-field">
              <label>生成数量</label>
              <select defaultValue="4">
                <option value="2">2 张</option>
                <option value="4">4 张</option>
                <option value="6">6 张</option>
                <option value="9">9 张</option>
              </select>
            </div>
            <div className="ft-field" style={{ marginBottom: 0 }}>
              <label>系列归属</label>
              <select defaultValue="ss26">
                <option value="ss26">MaxLuLu Pattern SS / 春夏 26</option>
                <option value="aw26">MaxLuLu Pattern AW / 秋冬 26</option>
                <option value="custom">自定义系列</option>
              </select>
            </div>
            <button type="button" className="ft-btn is-primary" style={{ width: "100%", marginTop: 12 }}>
              生成图案
            </button>
          </div>
        </aside>

        <section>
          <div className="ft-stage">
            <div className="ft-stage__head">
              <h2>结果预览（4 / 4） · 24 平米通版</h2>
              <div className="ft-stage__bar">
                <span className="ft-stage__chip is-active">2K</span>
                <span className="ft-stage__chip">4K</span>
                <span className="ft-stage__chip">线稿</span>
                <span className="ft-stage__chip">配色版</span>
              </div>
            </div>
            <div className="ft-results">
              {RESULTS.map((p, i) => (
                <div key={p.id} className={`ft-result tone-${p.tone}`}>
                  <AssetImage
                    src={p.image}
                    alt={p.name}
                    tone={p.tone}
                    label={`图案 ${String.fromCharCode(65 + i)}`}
                    className="ft-result__img"
                  />
                  <div className="ft-result__overlay">
                    <span className="ft-result__chip">方案 {String.fromCharCode(65 + i)}</span>
                    <div className="ft-result__icons">
                      <button type="button" aria-label="收藏">♡</button>
                      <button type="button" aria-label="上身">↗</button>
                      <button type="button" aria-label="下载">⤓</button>
                      <button type="button" aria-label="再生成">↻</button>
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
              <Link href="/studio/fashion/pattern" className="ft-actionBtn">
                <span className="ic">→</span>
                <span>上身预览</span>
              </Link>
            </div>
          </div>

          <section className="ft-helpRow">
            <article className="ft-helpCard">
              <b>组件状态示例</b>
              <p style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
                <span className="ft-stage__chip is-active">生成中</span>
                <span className="ft-stage__chip">已完成</span>
                <span className="ft-stage__chip">已收藏</span>
                <span className="ft-stage__chip">已发布</span>
              </p>
            </article>
            <article className="ft-helpCard">
              <b>结果卡片栏说明</b>
              <p>每张结果可独立"上身预览/再生成/下载/发布"。再生成沿用左侧参数，仅微调随机种子。</p>
            </article>
            <article className="ft-helpCard">
              <b>快捷指令 / 路由</b>
              <p style={{ marginTop: 10, display: "grid", gap: 4, fontSize: 11 }}>
                {ROUTES.map((r) => (
                  <span key={r.code} style={{ display: "flex", justifyContent: "space-between" }}>
                    <code style={{ color: "var(--ft-gold)", fontFamily: "monospace" }}>{r.code}</code>
                    <em style={{ fontStyle: "normal", color: "var(--ft-text2)" }}>{r.desc}</em>
                  </span>
                ))}
              </p>
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
                    <b>P-{String(2604 - i * 3).padStart(4, "0")}</b>
                    <small>{["刚刚", "12 分钟前", "1 小时前", "3 小时前", "今晨", "昨天"][i]} · {["精修", "草稿", "已发布", "草稿", "归档", "草稿"][i]}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="ft-card" style={{ background: "linear-gradient(135deg, var(--ft-gold-bg), rgba(176,134,92,0.02))" }}>
            <b style={{ display: "block", fontSize: 13, color: "var(--ft-text)", marginBottom: 6 }}>下一步：四方连续</b>
            <p style={{ margin: 0, fontSize: 12, color: "var(--ft-text2)", lineHeight: 1.7, marginBottom: 10 }}>
              满意的图案可一键转入"四方连续"工具，生成可平铺接缝。
            </p>
            <Link href="/studio/pattern/seamless" className="ft-btn is-primary" style={{ width: "100%", justifyContent: "center" }}>
              转入四方连续 →
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
