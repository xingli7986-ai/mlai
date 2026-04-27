import Link from "next/link";
import AssetImage from "@/components/AssetImage";
import { getProductDetail } from "@/lib/product-detail-data";
import "../../group-buy.css";
import "./progress.css";

type Props = {
  params: Promise<{ id: string }>;
};

const JOINED = [
  { name: "Luna", initial: "L", time: "2 分钟前" },
  { name: "Yuki", initial: "Y", time: "12 分钟前" },
  { name: "Chloe", initial: "C", time: "28 分钟前" },
  { name: "Mei", initial: "M", time: "1 小时前" },
  { name: "Reine", initial: "R", time: "1 小时前" },
  { name: "Sora", initial: "S", time: "2 小时前" },
  { name: "Ann", initial: "A", time: "3 小时前" },
  { name: "Kim", initial: "K", time: "4 小时前" },
  { name: "Jia", initial: "J", time: "6 小时前" },
  { name: "Vera", initial: "V", time: "今晨" },
];

const TIMELINE = [
  { title: "确认下单", desc: "众定订单已生成", date: "2026-04-22", status: "done" },
  { title: "成团生产", desc: "达到 30 人即开始排产", date: "预计 2026-04-29", status: "current" },
  { title: "工厂打样", desc: "5 天内交付首件确认", date: "预计 2026-05-02", status: "pending" },
  { title: "批量生产", desc: "12 天面料染色 + 缝制", date: "预计 2026-05-14", status: "pending" },
  { title: "顺丰发货", desc: "成都仓发出 · 含工艺单", date: "预计 2026-05-18", status: "pending" },
];

export default async function GroupBuyProgressPage({ params }: Props) {
  const { id } = await params;
  const detail = getProductDetail(id);

  if (!detail) {
    return (
      <main className="page-wrap gbPage">
        <div className="container" style={{ marginTop: 40 }}>
          <h1>未找到该团</h1>
          <p><Link href="/products">返回灵感画廊</Link></p>
        </div>
      </main>
    );
  }

  const { product } = detail;
  const progress = Math.min(100, Math.round((product.joined / product.target) * 100));
  const remaining = Math.max(0, product.target - product.joined);

  return (
    <main className="page-wrap gbPage gbProgressPage">
      <nav className="nav">
        <div className="container inner">
          <Link href="/" className="nav-logo">MaxLuLu <span className="ai">AI</span></Link>
          <div className="nav-center">
            <Link href="/products">灵感画廊</Link>
            <Link href="/products">个性定制</Link>
            <Link href="/my">我的衣橱</Link>
            <Link href="/studio/join">加入设计</Link>
          </div>
          <div className="nav-right">
            <a href="#share">分享</a>
            <Link href="/studio/join" className="designer-btn">设计师入驻</Link>
          </div>
        </div>
      </nav>

      <div className="container">
        <div className="gbCrumbs">
          <Link href="/products">灵感画廊</Link>
          <span className="sep">›</span>
          <Link href={`/products/${product.id}`}>{product.name}</Link>
          <span className="sep">›</span>
          <span className="current">众定进度</span>
        </div>

        <div className="gbHeader">
          <div className="gbHeader__title">
            <p className="eyebrow">PROGRESS · 众定进度</p>
            <h1>距离成团还差 {remaining} 人</h1>
          </div>
          <div className="gbHeader__steps">
            <div className="gbStep is-done"><b>1</b><span>选款</span></div>
            <span className="gbStep__sep" />
            <div className="gbStep is-done"><b>2</b><span>下单</span></div>
            <span className="gbStep__sep" />
            <div className="gbStep is-current"><b>3</b><span>等待成团</span></div>
            <span className="gbStep__sep" />
            <div className="gbStep"><b>4</b><span>排产发货</span></div>
          </div>
        </div>

        <div className="gbpGrid">
          <section className="gbpHero gbCard">
            <div className={`gbpHero__media tone-${product.tone}`}>
              <AssetImage
                src={product.image}
                alt={product.name}
                tone={product.tone}
                label={product.name.slice(0, 4)}
                className="gbpHero__img"
              />
              <span className="gbpHero__tag">众定中</span>
            </div>

            <div className="gbpHero__body">
              <div className="gbpHero__line">
                <small>当前众定</small>
                <strong>{product.name}</strong>
                <span>{detail.seriesLabel} · {product.tags[0]}</span>
              </div>

              <div className="gbpStat">
                <div className="gbpStat__count">
                  <small>已拼</small>
                  <b>{product.joined}</b>
                  <span>/ {product.target} 人</span>
                </div>
                <div className="gbpRing" style={{ ["--p" as string]: progress }}>
                  <svg viewBox="0 0 120 120" aria-hidden>
                    <circle cx="60" cy="60" r="52" stroke="rgba(176,134,92,0.14)" strokeWidth="10" fill="none" />
                    <circle
                      cx="60" cy="60" r="52"
                      stroke="url(#gbpGrad)" strokeWidth="10" fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${(progress / 100) * 326.7} 326.7`}
                      transform="rotate(-90 60 60)"
                    />
                    <defs>
                      <linearGradient id="gbpGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#C8A57F" />
                        <stop offset="100%" stopColor="#82603A" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="gbpRing__center">
                    <b>{progress}%</b>
                    <small>众定进度</small>
                  </div>
                </div>
              </div>

              <div className="gbpCountdown">
                <span>距离成团还剩</span>
                <div className="gbpCountdown__digits">
                  <b>02</b><i>天</i>
                  <b>12</b><i>:</i>
                  <b>36</b><i>:</i>
                  <b>09</b>
                </div>
              </div>

              <div className="gbpActions">
                <button type="button" className="gbpAction"><span>↗</span><b>分享好友</b></button>
                <button type="button" className="gbpAction"><span>♡</span><b>收藏</b></button>
                <button type="button" className="gbpAction"><span>✉</span><b>消息</b></button>
                <button type="button" className="gbpAction"><span>⤓</span><b>下载图</b></button>
              </div>

              <div className="gbpMembers">
                <div className="gbAvatars">
                  {JOINED.slice(0, 8).map((m) => (
                    <span key={m.name}>{m.initial}</span>
                  ))}
                  <b>+ {Math.max(0, product.joined - 8)} 人</b>
                </div>
                <small>每邀请 1 位好友成团，可获得 ¥30 设计师红包</small>
              </div>
            </div>
          </section>

          <aside className="gbpSide">
            <div className="gbCard">
              <div className="gbpSide__head">
                <div className={`gbpSide__avatar tone-${product.tone}`}>
                  <AssetImage
                    src={detail.gallery[1] ?? product.image}
                    alt={product.name}
                    tone={product.tone}
                    label="主"
                    className="gbpSide__img"
                  />
                </div>
                <div>
                  <small>本团团长</small>
                  <b>Luna · MaxLuLu Studio</b>
                  <span>已成功发起 12 个团</span>
                </div>
              </div>

              <div className="gbpMini">
                <div className="gbpMini__head">
                  <span>众定 {product.joined} / {product.target}</span>
                  <b>{progress}%</b>
                </div>
                <div className="gbpMini__bar">
                  <em style={{ width: `${progress}%` }} />
                </div>
              </div>

              <div className="gbpSide__cta">
                <button type="button" className="gbCta">+ 邀请好友拼单</button>
                <button type="button" className="gbCtaGhost">复制专属链接</button>
              </div>

              <ul className="gbpSide__rules">
                <li>· 成团后 5 天内开始排产</li>
                <li>· 不成团自动退款，本金 100% 返还</li>
                <li>· 排产期间可申请尺码调整</li>
              </ul>
            </div>

            <div className="gbCard">
              <div className="gbCard__head">
                <h2>最近加入</h2>
                <span className="more">实时更新</span>
              </div>
              <ul className="gbpFeed">
                {JOINED.slice(0, 6).map((m) => (
                  <li key={m.name}>
                    <span className="gbpFeed__avatar">{m.initial}</span>
                    <b>{m.name}</b>
                    <small>加入了众定</small>
                    <em>{m.time}</em>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>

        <section className="gbCard gbpTimeline">
          <div className="gbCard__head">
            <h2>生产进度时间线</h2>
            <span className="more">数据由工厂端同步</span>
          </div>
          <div className="gbpTimeline__grid">
            {TIMELINE.map((step, i) => (
              <article key={step.title} className={`gbpStep is-${step.status}`}>
                <div className="gbpStep__dot">
                  <span>{String(i + 1).padStart(2, "0")}</span>
                </div>
                <b>{step.title}</b>
                <p>{step.desc}</p>
                <small>{step.date}</small>
              </article>
            ))}
          </div>
        </section>

        <section className="gbpFaq">
          <div className="gbCard">
            <div className="gbCard__head">
              <h2>常见问题</h2>
              <a href="#help">联系客服 →</a>
            </div>
            <div className="gbpFaq__grid">
              {[
                { q: "成团时间不够会怎样？", a: "倒计时结束自动退款，无任何手续费。" },
                { q: "能否调整尺码 / 配色？", a: "排产前 3 天可在订单页一键调整。" },
                { q: "面料和工艺单如何确认？", a: "成团后设计师签名工艺单将随包裹寄出。" },
                { q: "运费和发货时效？", a: "顺丰包邮，从成都仓发出，2-3 天送达。" },
              ].map((f) => (
                <div key={f.q} className="gbpFaq__item">
                  <b>{f.q}</b>
                  <p>{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
