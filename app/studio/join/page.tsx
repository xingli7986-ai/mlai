"use client";

import Link from "next/link";
import AssetImage from "@/components/AssetImage";
import { products } from "@/lib/home-consumer-data";
import {
  Badge,
  Button,
  Card,
  FAQAccordion,
  Input,
  SectionHeader,
  Select,
  StatsCard,
  Stepper,
  Textarea,
} from "@/components/ui";
import "../studio-home.css";
import "./join.css";

const BENEFITS = [
  { ic: "✦", title: "稳定分润 10%", desc: "每件成衣订单按设计师分润，平台 / 工厂 / 设计师三方透明结算。" },
  { ic: "✚", title: "一站式工具", desc: "16 个 AI 工具，从灵感到 Tech Pack 到工艺单全部内置。" },
  { ic: "★", title: "稳定流量入口", desc: "每月 200 万 + 印花衣橱曝光，新人可申请首期推荐位。" },
  { ic: "↻", title: "无库存压力", desc: "众定制成团模式，平台帮你预收订金，工厂直接生产。" },
];

const PROCESS = [
  { title: "在线申请", description: "提交作品集 + 个人简介，3 个工作日内完成审核。" },
  { title: "签约入驻", description: "电子签约 + 个人主页生成，绑定结算账户。" },
  { title: "上传作品", description: "在 Studio 工具中创作或上传，发布到印花衣橱。" },
  { title: "获得分润", description: "成团后自动结算，T+1 到账，可随时提现。" },
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
      <section className="dl-hero">
        <div>
          <Badge tone="gold" className="dl-hero__eyebrow">设计师入驻申请</Badge>
          <h1>
            成为 MaxLuLu AI
            <br />
            设计师
          </h1>
          <p className="dl-hero__lead">
            每个原创印花都能被穿上身。我们用 AI 工具帮你把灵感快速变成针织印花连衣裙，工厂直接生产，让你的作品直达全国 200 万 + 用户。
          </p>
          <div className="dl-hero__stats">
            <StatsCard variant="plain" value="128" label="签约设计师" />
            <StatsCard variant="plain" value="10%" label="设计师分润" />
            <StatsCard variant="plain" value="14天" label="排产周期" />
            <StatsCard variant="plain" value="200万+" label="月活用户" />
          </div>
          <div className="dl-hero__cta">
            <Button as="a" href="#apply" variant="primary">立即申请入驻</Button>
            <Button as="a" href="/studio" variant="secondary">先体验工具 →</Button>
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
      </section>

      <section className="dl-section dl-section--card">
        <div className="dl-container">
          <SectionHeader
            align="center"
            eyebrow="平台优势"
            title="为什么选择 MaxLuLu AI"
            description="从灵感到成衣，AI 工具 + 众定制工厂 + 透明分润，让每一位设计师都能持续创作。"
            className="dl-section__head--center"
          />
          <div className="dl-benefits">
            {BENEFITS.map((b) => (
              <Card key={b.title} hover className="dl-benefit">
                <div className="dl-benefit__icon" aria-hidden>{b.ic}</div>
                <div className="dl-benefit__title">{b.title}</div>
                <p className="dl-benefit__desc">{b.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="dl-section">
        <div className="dl-container">
          <SectionHeader
            align="center"
            eyebrow="入驻流程"
            title="4 步完成入驻"
            description="从提交申请到上线作品，平均 5 个工作日。审核期间也可在 Studio 工具中熟悉操作。"
            className="dl-section__head--center"
          />
          <Stepper steps={PROCESS} current={0} layout="horizontal" className="dl-stepper" />
        </div>
      </section>

      <section className="dl-section dl-section--card">
        <div className="dl-container">
          <SectionHeader
            align="center"
            eyebrow="设计师案例"
            title="她们已经在 MaxLuLu 上找到了节奏"
            description="真实的设计师，真实的作品和分润数据，验证 MaxLuLu 的众定制路径。"
            className="dl-section__head--center"
          />
          <div className="dl-cases">
            {CASES.map((c) => (
              <Card key={c.name} hover className="dl-case">
                <div className="dl-case__head">
                  <span className="dl-case__avatar">{c.name.slice(0, 1)}</span>
                  <div>
                    <div className="dl-case__name">{c.name}</div>
                    <small>{c.studio}</small>
                  </div>
                </div>
                <p className="dl-case__quote">&ldquo;{c.quote}&rdquo;</p>
                <div className="dl-case__stats">
                  <span>
                    <b>{c.works}</b>件作品
                  </span>
                  <span>
                    <b>{c.revenue}</b>累计分润
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="dl-section" id="apply">
        <div className="dl-container">
          <SectionHeader
            align="center"
            eyebrow="入驻申请"
            title="提交申请，我们 3 天内回复"
            description="建议附上 3 件原创作品 + 个人简介。提交后会发送验证短信到你的手机号。"
            className="dl-section__head--center"
          />
          <div className="dl-form-wrap">
            <form className="dl-form" onSubmit={(e) => e.preventDefault()}>
              <Input label="姓名" required placeholder="例：Luna" />
              <Input label="设计工作室" required placeholder="例：MaxLuLu Studio" />
              <Input label="手机号" required type="tel" placeholder="+86 138 ****" />
              <Input label="邮箱" type="email" placeholder="hi@maxlulu.ai" />
              <Select
                label="设计风格"
                defaultValue="ink"
                options={[
                  { value: "ink", label: "水墨晕染" },
                  { value: "floral", label: "工笔花卉" },
                  { value: "geometry", label: "几何拼接" },
                  { value: "tropical", label: "热带印花" },
                  { value: "custom", label: "其他 / 自定义" },
                ]}
              />
              <Select
                label="从业年限"
                defaultValue="3-5"
                options={[
                  { value: "0-2", label: "0-2 年" },
                  { value: "3-5", label: "3-5 年" },
                  { value: "6-10", label: "6-10 年" },
                  { value: "10+", label: "10 年以上" },
                ]}
              />
              <Textarea
                label="作品集链接 / 简介"
                placeholder="附上 Behance / 小红书 / 个人站等链接，简介 100 字内。"
                containerClassName="dl-field--full"
              />
              <div className="dl-form__cta">
                <Button type="submit" variant="primary">提交申请</Button>
                <Button as="a" href="/studio" variant="secondary">先体验工具</Button>
                <small className="dl-form__note">
                  提交即表示同意 <Link href="/terms">《设计师入驻协议》</Link>
                </small>
              </div>
            </form>
          </div>
        </div>
      </section>

      <section className="dl-section dl-section--card">
        <div className="dl-container">
          <SectionHeader
            align="center"
            eyebrow="常见问题"
            title="关于入驻，我们听过最多的问题"
            className="dl-section__head--center"
          />
          <div className="dl-faq-wrap">
            <FAQAccordion items={FAQ} defaultOpen={0} />
          </div>
        </div>
      </section>

      <section className="dl-container">
        <div className="dl-cta">
          <p className="eyebrow">FROM TODAY</p>
          <h2>从今天起，被更多人穿上身</h2>
          <p>加入 MaxLuLu AI，获得稳定的流量入口、众定制工厂、透明分润，让每个原创印花都能落地成衣。</p>
          <div className="dl-cta__actions">
            <Button as="a" href="#apply" variant="primary">立即申请入驻</Button>
            <Button as="a" href="/studio" variant="ghost">先体验工具 →</Button>
          </div>
          <span className="dl-cta__hint">
            已有账号？<Link href="/login">立即登录</Link>
          </span>
        </div>
      </section>
    </div>
  );
}
