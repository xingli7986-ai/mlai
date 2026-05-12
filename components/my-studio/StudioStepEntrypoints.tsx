const TOOL_ASSETS = "/assets/my-studio/03_tool_illustrations";

const STEPS = [
  {
    title: "印花创作中心",
    desc: "选择精选花型，或用 AI 生成专属印花。",
    href: "/my-studio/pattern-generate",
    tone: "rose",
    image: `${TOOL_ASSETS}/maxlulu-my-studio-tool-pattern-generation-512x512.png`,
    cta: "开始创作",
  },
  {
    title: "虚拟试穿",
    desc: "查看印花穿在衣服上的整体上身效果。",
    href: "/my-studio/try-on",
    tone: "blue",
    image: `${TOOL_ASSETS}/maxlulu-my-studio-tool-try-on-512x512.png`,
    cta: "生成试穿",
  },
  {
    title: "开始定制",
    desc: "确认尺码、版型偏好和定制方式。",
    href: "/my-studio/confirm-design",
    tone: "neutral",
    image: `${TOOL_ASSETS}/maxlulu-my-studio-tool-seamless-repeat-512x512.png`,
    cta: "确认设计",
  },
  {
    title: "生产资料草案",
    desc: "确认后由系统生成后台审核资料。",
    href: "/my-studio/production-sheet",
    tone: "neutral",
    image: `${TOOL_ASSETS}/maxlulu-my-studio-tool-line-sketch-512x512.png`,
    cta: "查看草案",
  },
];

export default function StudioStepEntrypoints() {
  return (
    <section className="container" aria-label="快速开始创作">
      <p className="msHint">
        <span className="msHint__icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 3 14.4 8.6 20 11l-5.6 2.4L12 19l-2.4-5.6L4 11l5.6-2.4L12 3Z" />
          </svg>
        </span>
        <span>
          <b>快速开始创作</b> · 从灵感到成衣，AI 陪你完成每一步。
        </span>
      </p>

      <div className="msTools">
        {STEPS.map((step) => (
          <a className={`msTool msTool--${step.tone}`} href={step.href} key={step.title}>
            <span className="msTool__icon">
              <img src={step.image} alt="" />
            </span>
            <h3>{step.title}</h3>
            <p>{step.desc}</p>
            <span className="msTool__cta">{step.cta}</span>
          </a>
        ))}
      </div>
    </section>
  );
}
