"use client";

import Link from "next/link";
import AssetImage from "@/components/AssetImage";
import { products } from "@/lib/home-consumer-data";
import "../studio-home.css";
import "./join.css";

const BENEFITS = [
  { ic: "✦", title: "稳定分润 10%", desc: "每件成衣订单按设计师分润，平台 / 工厂 / 设计师三方透明结算。" },
  { ic: "✚", title: "一站式工具", desc: "16 个 AI 工具，从灵感到 Tech Pack 到工艺单全部内置。" },
  { ic: "★", title: "稳定流量入口", desc: "每月 200 万 + 印花衣橱曝光，新人可申请首期推荐位。" },
  { ic: "↻", title: "无库存压力", desc: "众定制成团模式，平台帮你预收订金，工厂直接生产。" },
];

const PROCESS = [
  { no: "01", title: "在线申请", desc: "提交作品集 + 个人简介，3 个工作日内完成审核。" },
  { no: "02", title: "签约入驻", desc: "电子签约 + 个人主页生成，绑定结算账户。" },
  { no: "03", title: "上传作品", desc: "在 Studio 工具中创作或上传，发布到印花衣橱。" },
  { no: "04", title: "获得分润", desc: "成团后自动结算，T+1 到账，可随时提现。" },
];

const CASES = [
  {
    name: "Luna",
    studio: "MaxLuLu Studio · 巴黎",
    quote: "MaxLuLu AI 帮我把灵感落地成可量产的针织印花裙，14 个月里上架了 23 件作品，最热的一款累计销售 2,840 件。",
    works: "23",
    revenue: "¥86万",
  },
  {
    name: "Yuki",
    studio: "Yuki Atelier · 东京",
    quote: "我以前只做高定，没有渠道接触量产。平台让我用四方连续工具直接出图，一个月就完成了首单众定。",
    works: "18",
    revenue: "¥42万",
  },
  {
    name: "Reine",
    studio: "Atelier Reine · 上海",
    quote: "众定制让我不再担心库存，工厂直接对接。粉丝在我开新款 24 小时内就能成团，这种节奏只有这里有。",
    works: "31",
    revenue: "¥124万",
  },
];

const FAQ = [
  { q: "入驻是否收费？", a: "完全免费。仅在订单成交后按 5% 平台费 + 工厂加工费扣除，设计师可获 10% 销售额分润。" },
  { q: "需要提供哪些资料？", a: "至少 3 件原创作品（图片或矢量图）+ 设计师简介 + 身份证 + 银行卡四要素，全程在线提交。" },
  { q: "是否要求独家代理？", a: "不要求独家。但 MaxLuLu 首发的款式可享额外 5% 流量补贴 90 天。" },
  { q: "排产周期与版权？", a: "众定成团后 14 个工作日内完成生产，作品版权归设计师所有，平台仅获信息网络传播权。" },
  { q: "未成团如何处理？", a: "30 天内未达 30 人即自动退款，不影响你的设计师评分。" },
];

const HERO_TILES = products.slice(0, 6);

export default function DesignerLandingPage() {
  return (
    <div className="dl-root">
      <div className="st-tabs">
        <Link href="/studio">工具页</Link>
        <Link href="/products">我的设计</Link>
        <Link href="/products">灵感</Link>
        <Link href="/studio/publish">发布设计</Link>
        <Link href="/studio/dashboard">设计师中心</Link>
        <Link href="/studio/join" className="is-active">入驻申请</Link>
      </div>

      <section className="dl-hero">
        <div className="dl-container" style={{ display: "contents" }}>
          <div>
            <p className="eyebrow">设计师入驻申请</p>
            <h1>成为 MaxLuLu AI<br />设计师</h1>
            <p>每个原创印花都能被穿上身。我们用 AI 工具帮你把灵感快速变成针织印花连衣裙，工厂直接生产，让你的作品直达全国 200 万 + 用户。</p>
            <div className="dl-hero__stats">
              <div className="dl-hero__stat"><b>128</b><small>签约设计师</small></div>
              <div className="dl-hero__stat"><b>10%</b><small>设计师分润</small></div>
              <div className="dl-hero__stat"><b>14天</b><small>排产周期</small></div>
              <div className="dl-hero__stat"><b>200万+</b><small>月活用户</small></div>
            </div>
            <div className="dl-hero__cta">
              <a href="#apply" className="dl-btn is-primary">立即申请入驻</a>
              <Link href="/studio" className="dl-btn">先体验工具 →</Link>
            </div>
          </div>
          <div className="dl-hero__media">
            {HERO_TILES.map((p) => (
              <div key={p.id} className={`dl-hero__tile tone-${p.tone}`}>
                <AssetImage
                  src={p.image}
                  alt={p.name}
                  tone={p.tone}
                  label={p.name}
                  className="dl-hero__img"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="dl-section dl-section--card">
        <div className="dl-container">
          <div className="dl-section__head">
            <p className="eyebrow">平台优势</p>
            <h2>为什么选择 MaxLuLu AI</h2>
            <p>从灵感到成衣，AI 工具 + 众定制工厂 + 透明分润，让每一位设计师都能持续创作。</p>
          </div>
          <div className="dl-benefits">
            {BENEFITS.map((b) => (
              <div key={b.title} className="dl-benefit">
                <span className="ic">{b.ic}</span>
                <b>{b.title}</b>
                <p>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="dl-section">
        <div className="dl-container">
          <div className="dl-section__head">
            <p className="eyebrow">入驻流程</p>
            <h2>4 步完成入驻</h2>
            <p>从提交申请到上线作品，平均 5 个工作日。审核期间也可在 Studio 工具中熟悉操作。</p>
          </div>
          <div className="dl-process">
            {PROCESS.map((s) => (
              <div key={s.no} className="dl-step">
                <span className="dl-step__no">{s.no}</span>
                <b>{s.title}</b>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="dl-section dl-section--card">
        <div className="dl-container">
          <div className="dl-section__head">
            <p className="eyebrow">设计师案例</p>
            <h2>她们已经在 MaxLuLu 上找到了节奏</h2>
          </div>
          <div className="dl-cases">
            {CASES.map((c) => (
              <article key={c.name} className="dl-case">
                <div className="dl-case__head">
                  <span className="dl-case__avatar">{c.name.slice(0, 1)}</span>
                  <div>
                    <b>{c.name}</b>
                    <small>{c.studio}</small>
                  </div>
                </div>
                <p>"{c.quote}"</p>
                <div className="dl-case__stats">
                  <span><b>{c.works}</b> 件作品</span>
                  <span><b>{c.revenue}</b> 累计分润</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="dl-section" id="apply">
        <div className="dl-container">
          <div className="dl-section__head">
            <p className="eyebrow">入驻申请</p>
            <h2>提交申请，我们 3 天内回复</h2>
            <p>建议附上 3 件原创作品 + 个人简介。提交后会发送验证短信到你的手机号。</p>
          </div>
          <form className="dl-form" onSubmit={(e) => e.preventDefault()}>
            <div className="dl-field">
              <label>姓名</label>
              <input type="text" placeholder="例：Luna" />
            </div>
            <div className="dl-field">
              <label>设计工作室</label>
              <input type="text" placeholder="例：MaxLuLu Studio" />
            </div>
            <div className="dl-field">
              <label>手机号</label>
              <input type="tel" placeholder="+86 138 ****" />
            </div>
            <div className="dl-field">
              <label>邮箱</label>
              <input type="email" placeholder="hi@maxlulu.ai" />
            </div>
            <div className="dl-field">
              <label>设计风格</label>
              <select defaultValue="ink">
                <option value="ink">水墨晕染</option>
                <option value="floral">工笔花卉</option>
                <option value="geometry">几何拼接</option>
                <option value="tropical">热带印花</option>
                <option value="custom">其他 / 自定义</option>
              </select>
            </div>
            <div className="dl-field">
              <label>从业年限</label>
              <select defaultValue="3-5">
                <option value="0-2">0-2 年</option>
                <option value="3-5">3-5 年</option>
                <option value="6-10">6-10 年</option>
                <option value="10+">10 年以上</option>
              </select>
            </div>
            <div className="dl-field dl-field--full">
              <label>作品集链接 / 简介</label>
              <textarea placeholder="附上 Behance / 小红书 / 个人站等链接，简介 100 字内。" />
            </div>
            <div className="dl-form__cta">
              <button type="submit" className="dl-btn is-primary">提交申请</button>
              <Link href="/studio" className="dl-btn">先体验工具</Link>
              <small style={{ marginLeft: "auto" }}>提交即表示同意 <Link href="/terms" style={{ color: "var(--dl-gold)" }}>《设计师入驻协议》</Link></small>
            </div>
          </form>
        </div>
      </section>

      <section className="dl-section dl-section--card">
        <div className="dl-container">
          <div className="dl-section__head">
            <p className="eyebrow">常见问题</p>
            <h2>关于入驻，我们听过最多的问题</h2>
          </div>
          <div className="dl-faq">
            {FAQ.map((f) => (
              <div key={f.q} className="dl-faq__item">
                <b>{f.q}</b>
                <p>{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="dl-container">
        <div className="dl-cta">
          <h2>从今天起，被更多人穿上身</h2>
          <p>用 16 个 AI 工具 + 众定制工厂，把每个原创印花变成可量产的连衣裙。</p>
          <a href="#apply" className="dl-btn is-primary">立即申请入驻</a>
        </div>
      </section>
    </div>
  );
}
