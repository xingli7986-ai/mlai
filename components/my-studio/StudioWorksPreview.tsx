const WORK_ASSETS = "/assets/my-studio/04_work_thumbnails";

const WORKS = [
  {
    title: "玫瑰藤蔓连衣裙",
    time: "今天更新",
    image: `${WORK_ASSETS}/maxlulu-my-studio-work-rose-vine-print-1080x1440.png`,
    continueHref: "/my-studio/pattern-generate?workId=demo-rose-dress",
  },
  {
    title: "蓝白水彩通勤裙",
    time: "昨天更新",
    image: `${WORK_ASSETS}/maxlulu-my-studio-work-blue-floral-print-1080x1440.png`,
    continueHref: "/my-studio/try-on?workId=demo-blue-dress",
  },
  {
    title: "夏日花园度假裙",
    time: "3 天前",
    image: `${WORK_ASSETS}/maxlulu-my-studio-work-summer-garden-dress-1080x1440.png`,
    continueHref: "/my-studio/confirm-design?workId=demo-garden-dress",
  },
  {
    title: "珊瑚春日印花",
    time: "上周",
    image: `${WORK_ASSETS}/maxlulu-pattern-coral-spring-1080x1440.png`,
    continueHref: "/my-studio/pattern-generate?workId=demo-coral-print",
  },
  {
    title: "柔粉牡丹印花",
    time: "上周",
    image: `${WORK_ASSETS}/maxlulu-pattern-soft-pink-peony-1080x1440.png`,
    continueHref: "/my-studio/pattern-generate?workId=demo-peony-print",
  },
  {
    title: "青绿牡丹灵感",
    time: "05/08",
    image: `${WORK_ASSETS}/maxlulu-pattern-teal-peony-1080x1440.png`,
    continueHref: "/my-studio/pattern-generate?workId=demo-teal-print",
  },
];

export default function StudioWorksPreview() {
  return (
    <section className="msWorks container" id="my-design-works" aria-label="我的最新作品">
      <div className="msWorks__head">
        <h2>我的最新作品</h2>
        <a href="/my-studio#my-design-works" className="msWorks__more">
          查看全部资产
        </a>
      </div>
      <div className="msWorksGrid">
        {WORKS.map((work) => (
          <article className="msWork" key={work.title}>
            <a className="msWork__media" href={work.continueHref}>
              <img src={work.image} alt={work.title} />
            </a>
            <div className="msWork__body">
              <h3 className="msWork__title">{work.title}</h3>
              <p className="msWork__time">{work.time}</p>
              <div className="msWork__actions">
                <a className="msWork__action msWork__action--accent" href={work.continueHref}>
                  <ArrowIcon />
                  继续设计
                </a>
                <a className="msWork__action" href="/my-studio#my-design-works">
                  <GridIcon />
                  查看资产
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 4h7v7H4V4Z" />
      <path d="M13 4h7v7h-7V4Z" />
      <path d="M4 13h7v7H4v-7Z" />
      <path d="M13 13h7v7h-7v-7Z" />
    </svg>
  );
}
