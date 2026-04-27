"use client";

import Link from "next/link";
import AssetImage from "@/components/AssetImage";
import { products } from "@/lib/home-consumer-data";
import "../studio-home.css";
import "./publish.css";

const TAGS = [
  "水墨晕染", "工笔花卉", "几何", "扎染", "复古条纹", "热带印花",
  "通勤", "晚宴", "夏日度假", "约会", "针织", "真丝", "高级混纺",
];

const PUBLISHED = products.slice(0, 4).map((p, i) => ({
  ...p,
  status: ["已上架", "审核中", "草稿", "已下架"][i],
  statusClass: ["", "is-pending", "is-pending", "is-rejected"][i],
}));

export default function PublishPage() {
  return (
    <div className="pb-root">
      <div className="st-tabs">
        <Link href="/studio">工具页</Link>
        <Link href="/products">我的设计</Link>
        <Link href="/products">灵感</Link>
        <Link href="/studio/publish" className="is-active">发布设计</Link>
        <Link href="/studio/dashboard">设计师中心</Link>
      </div>

      <div className="pb-header">
        <div>
          <p className="eyebrow">PUBLISH DESIGN · 发布作品</p>
          <h1>把作品上架到印花衣橱</h1>
        </div>
        <div className="pb-actions">
          <button type="button" className="pb-btn">保存草稿</button>
          <button type="button" className="pb-btn">预览</button>
          <button type="button" className="pb-btn is-primary">提交审核</button>
        </div>
      </div>

      <div className="pb-grid">
        <aside className="pb-aside">
          <b>发布步骤</b>
          <a href="#imgs" className="is-active"><span>① 上传作品图</span><small>4 / 8</small></a>
          <a href="#info"><span>② 基本信息</span><small></small></a>
          <a href="#tags"><span>③ 标签 / 配色</span><small>3</small></a>
          <a href="#price"><span>④ 价格 / 工艺</span><small></small></a>
          <a href="#agree"><span>⑤ 协议确认</span><small></small></a>
        </aside>

        <section className="pb-main">
          <article className="pb-card" id="imgs">
            <div className="pb-card__head">
              <h2>① 上传作品图</h2>
              <span className="more">建议主图竖图 3:4，最少 3 张</span>
            </div>
            <div className="pb-uploadGrid">
              <div className={`pb-tile pb-tile__main tone-${products[0].tone}`}>
                <AssetImage
                  src={products[0].image}
                  alt={products[0].name}
                  tone={products[0].tone}
                  label="主图"
                  className="pb-tile__img"
                />
                <span className="pb-tile__badge">主图</span>
              </div>
              {products.slice(1, 4).map((p) => (
                <div key={p.id} className={`pb-tile tone-${p.tone}`}>
                  <AssetImage
                    src={p.image}
                    alt={p.name}
                    tone={p.tone}
                    label={p.name.slice(0, 2)}
                    className="pb-tile__img"
                  />
                </div>
              ))}
              <div className="pb-tile is-add">
                <div>
                  <b>+</b>
                  <small>拖拽 / 点击上传</small>
                </div>
              </div>
            </div>
          </article>

          <article className="pb-card" id="info">
            <h2>② 基本信息</h2>
            <div className="pb-field">
              <label>作品名称</label>
              <input type="text" defaultValue="墨影花园针织印花裹身裙" />
            </div>
            <div className="pb-row2">
              <div className="pb-field">
                <label>作品分类</label>
                <select defaultValue="dress">
                  <option value="dress">连衣裙 · 裹身款</option>
                  <option value="midi">连衣裙 · 直筒款</option>
                  <option value="evening">晚宴款</option>
                </select>
              </div>
              <div className="pb-field">
                <label>系列归属</label>
                <select defaultValue="classic">
                  <option value="classic">经典裹身系列</option>
                  <option value="commute">通勤知性系列</option>
                  <option value="vacation">夏日度假系列</option>
                  <option value="evening">晚宴聚会系列</option>
                </select>
              </div>
            </div>
            <div className="pb-field">
              <label>设计描述</label>
              <textarea defaultValue="水墨写意花卉印花，针织 V 领裹身设计，腰侧褶裥提供立体修身效果。从办公室到晚餐都能驾驭。" />
            </div>
          </article>

          <article className="pb-card" id="tags">
            <h2>③ 标签 / 配色</h2>
            <div className="pb-field">
              <label>设计标签 · 已选 3 / 8</label>
              <div className="pb-tags">
                {TAGS.map((t, i) => (
                  <span key={t} className={`pb-tag ${i < 3 ? "is-active" : ""}`}>{t}</span>
                ))}
              </div>
            </div>
            <div className="pb-field">
              <label>主色 / 配色</label>
              <div className="pb-swatchRow">
                {(["ink", "blue", "rose", "gold", "green", "cream", "mauve", "charcoal"] as const).map((c, i) => (
                  <button key={c} type="button" className={`pb-swatch pb-swatch--${c} ${i < 3 ? "is-active" : ""}`} />
                ))}
              </div>
            </div>
          </article>

          <article className="pb-card" id="price">
            <h2>④ 价格 / 工艺</h2>
            <div className="pb-priceRow">
              <div className="pb-priceBox">
                <small>众定价（30 人成团）</small>
                <b>¥ 599</b>
              </div>
              <div className="pb-priceBox">
                <small>个人定制价</small>
                <b>¥ 1,299</b>
              </div>
              <div className="pb-priceBox">
                <small>设计师分润 30%</small>
                <b>¥ 179.7</b>
              </div>
            </div>
            <div className="pb-row2" style={{ marginTop: 14 }}>
              <div className="pb-field">
                <label>排产周期</label>
                <select defaultValue="14">
                  <option value="7">7 天 · 急单</option>
                  <option value="14">14 天 · 标准</option>
                  <option value="21">21 天 · 高定</option>
                </select>
              </div>
              <div className="pb-field">
                <label>面料预设</label>
                <select defaultValue="knit">
                  <option value="knit">弹力针织印花</option>
                  <option value="silk">醋酸真丝缎</option>
                  <option value="linen">亚麻棉混纺</option>
                </select>
              </div>
            </div>
            <div className="pb-field">
              <label>工艺细节备注</label>
              <textarea placeholder="例：水洗后建议反面晾晒；可加内衬；袖口缝头处理方式 ..." />
            </div>
          </article>

          <article className="pb-card" id="agree">
            <h2>⑤ 协议确认</h2>
            <div className="pb-checks">
              <label className="pb-check">
                <input type="checkbox" defaultChecked />
                <span>本作品为我本人原创，与平台已签订《设计师入驻协议》</span>
              </label>
              <label className="pb-check">
                <input type="checkbox" defaultChecked />
                <span>同意按 30% 分润 + 5% 平台费 + 工厂加工费的结算方式</span>
              </label>
              <label className="pb-check">
                <input type="checkbox" />
                <span>申请 90 天首发流量补贴（独家上架，可在 90 天后改为多平台分发）</span>
              </label>
            </div>
            <div style={{ marginTop: 18, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button type="button" className="pb-btn is-primary">提交审核</button>
              <button type="button" className="pb-btn">保存为草稿</button>
              <small style={{ marginLeft: "auto", color: "var(--pb-text3)", fontSize: 11, alignSelf: "center" }}>预计 24 小时内完成审核</small>
            </div>
          </article>
        </section>

        <aside className="pb-side">
          <article className="pb-card">
            <div className="pb-card__head">
              <h2>已发布作品</h2>
              <Link href="/studio/dashboard" className="more">全部 →</Link>
            </div>
            <div className="pb-published">
              {PUBLISHED.map((p) => (
                <div key={p.id} className="pb-published__item">
                  <div className={`pb-published__media tone-${p.tone}`}>
                    <AssetImage
                      src={p.image}
                      alt={p.name}
                      tone={p.tone}
                      label={p.name.slice(0, 2)}
                      className="pb-published__img"
                    />
                  </div>
                  <div>
                    <b>{p.name}</b>
                    <small>{p.price.split("–")[0]}</small>
                  </div>
                  <em className={p.statusClass}>{p.status}</em>
                </div>
              ))}
            </div>
          </article>

          <article className="pb-help">
            <b>发布前小贴士</b>
            <p>主图建议使用真人模特竖图，背景干净；标签覆盖风格 + 场景；价格可填初稿，审核通过后仍可微调。</p>
            <Link href="/studio/join">查看入驻协议 →</Link>
          </article>
        </aside>
      </div>
    </div>
  );
}
