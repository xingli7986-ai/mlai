const OVERVIEW_ITEMS = [
  {
    value: "12",
    label: "设计作品",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M7 8V6a5 5 0 0 1 10 0v2" />
        <path d="M5 8h14l-1 12H6L5 8Z" />
      </svg>
    ),
  },
  {
    value: "4",
    label: "进行中",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 4h10l4 4v12H5V4Z" />
        <path d="M15 4v5h5" />
        <path d="M8 14h8M8 17h5" />
      </svg>
    ),
  },
  {
    value: "28",
    label: "收藏灵感",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 21s-7-4.4-7-10a4 4 0 0 1 7-2.65A4 4 0 0 1 19 11c0 5.6-7 10-7 10Z" />
      </svg>
    ),
  },
];

export default function StudioOverviewCards() {
  return (
    <section className="container msOverview" aria-label="设计资产概览">
      <div className="msHero__stats">
        {OVERVIEW_ITEMS.map((item) => (
          <article className="msStat" key={item.label}>
            <span className="msStat__icon">{item.icon}</span>
            <span className="msStat__body">
              <b>{item.value}</b>
              <small>{item.label}</small>
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}
