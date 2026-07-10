import Link from "next/link";
import ConsumerNav from "@/components/ConsumerNav";
import BodyProfileGate from "@/components/my-studio/BodyProfileGate";
import CreateDesignButton from "@/components/my-studio/CreateDesignButton";
import "./my-studio.css";

const FLOW_STEPS = [
  {
    title: "印花创作",
    desc: "选择官方或社区印花，也可以参考灵感图生成新的印花方案。",
    href: "/my-studio/pattern-generate",
  },
  {
    title: "虚拟试穿",
    desc: "使用当前印花、身材档案和版型生成上身效果图。",
    href: "/my-studio/try-on",
  },
  {
    title: "开始定制",
    desc: "确认款式、尺码、数量、面料和收货信息。",
    href: "/my-studio/confirm-design",
  },
  {
    title: "生产资料草案",
    desc: "用户确认后生成后台和工厂可继续审核的制作资料。",
    href: "/my-studio/production-sheet",
  },
];

const MOCK_WORKS = [
  {
    title: "法式玫瑰裹身裙",
    image: "/assets/my-studio/05_try_on_results/tryon-floral-wrap-front-1080x1440.png",
    meta: "裹身裙 / 通勤 / M",
    progress: "虚拟试穿",
    stats: "印花 4 / 试穿 3",
    href: "/my-studio/try-on",
  },
  {
    title: "蓝白水彩 A 字裙",
    image: "/assets/my-studio/04_work_thumbnails/maxlulu-my-studio-work-blue-floral-print-1080x1440.png",
    meta: "A 字裙 / 日常 / M",
    progress: "印花创作",
    stats: "印花 6 / 试穿 0",
    href: "/my-studio/pattern-generate",
  },
  {
    title: "夏日花园连衣裙",
    image: "/assets/my-studio/05_try_on_results/tryon-floral-fullbody-front-1080x1440.png",
    meta: "收腰裙 / 度假 / S",
    progress: "开始定制",
    stats: "印花 3 / 试穿 2",
    href: "/my-studio/confirm-design",
  },
];

export default function MyStudioPage() {
  return (
    <main className="my-studio-page">
      <ConsumerNav variant="solid" />
      <BodyProfileGate />

      <section className="msHero">
        <div className="msHero__copy">
          <p className="msEyebrow">MaxLuLu AI Studio</p>
          <h1>从一张印花开始，完成你的专属连衣裙定制。</h1>
          <p>
            当前消费者创作链路已经收敛为：印花创作、虚拟试穿、开始定制、生产资料草案。
            每一步都会保留你的数字资产，方便继续修改和回看。
          </p>
          <div className="msHero__actions">
            <CreateDesignButton label="创建新的服装设计" />
            <Link className="msGhostButton" href="/my-studio/pattern-generate">
              进入印花创作中心
            </Link>
          </div>
        </div>
        <div className="msHero__visual" aria-hidden>
          <img
            src="/assets/my-studio/01_hero/maxlulu-my-studio-hero-fashion-illustration-1200x900.png"
            alt=""
          />
        </div>
      </section>

      <section className="msFlow" aria-label="消费者创作流程">
        <div className="msSectionHead">
          <p className="msEyebrow">Creation Flow</p>
          <h2>继续设计时会按这条路径前进</h2>
        </div>
        <div className="msFlow__grid">
          {FLOW_STEPS.map((step, index) => (
            <Link key={step.title} className="msFlowCard" href={step.href}>
              <span>{index + 1}</span>
              <strong>{step.title}</strong>
              <p>{step.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section id="my-design-works" className="msWorks">
        <div className="msSectionHead">
          <p className="msEyebrow">Works</p>
          <h2>我的设计资产</h2>
          <p>作品卡会优先展示当前上身效果，其次展示当前印花，方便你从正确步骤继续。</p>
        </div>
        <div className="msWorks__grid">
          {MOCK_WORKS.map((work) => (
            <article key={work.title} className="msWorkCard">
              <img src={work.image} alt={work.title} />
              <div>
                <span>{work.progress}</span>
                <h3>{work.title}</h3>
                <p>{work.meta}</p>
                <small>{work.stats}</small>
                <div className="msWorkCard__actions">
                  <Link href={work.href}>继续设计</Link>
                  <Link href="/my-studio/production-sheet">生产资料草案</Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
