"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge, Button } from "@/components/ui";
import "./home-consumer.css";

const HERO_IMG = "/assets/images/home/01-hero/ChatGPT Image Apr 26, 2026, 02_09_53 PM.png";
const CUSTOM_IMG = "/assets/images/home/04-custom/ChatGPT Image Apr 26, 2026, 02_31_21 PM.png";

type HotState = "hot" | "almost" | "new";

type HotCard = {
  name: string;
  series: string;
  price: string;
  progress: number;
  joined: number;
  countdown: number;
  state: HotState;
  tagText: string;
  image: string;
};

const HOT_CARDS: HotCard[] = [
  {
    name: "山茶花漫舞 系列",
    series: "水墨晕染长袖针织连衣裙",
    price: "¥699",
    progress: 72,
    joined: 324,
    countdown: 23 * 3600 + 45 * 60 + 40,
    state: "hot",
    tagText: "热拼中",
    image: "/assets/images/home/02-hot-group/ChatGPT Image Apr 26, 2026, 02_13_25 PM.png",
  },
  {
    name: "都市艺境 系列",
    series: "几何色块拼针织裹身连衣裙",
    price: "¥799",
    progress: 85,
    joined: 285,
    countdown: 18 * 3600 + 9 * 60 + 35,
    state: "hot",
    tagText: "热拼中",
    image: "/assets/images/home/02-hot-group/ChatGPT Image Apr 26, 2026, 02_13_53 PM.png",
  },
  {
    name: "印象涟花园 系列",
    series: "艺术花卉开叉针织连衣裙",
    price: "¥699",
    progress: 93,
    joined: 182,
    countdown: 30 * 3600 + 11 * 60 + 13,
    state: "almost",
    tagText: "即将成团",
    image: "/assets/images/home/02-hot-group/ChatGPT Image Apr 26, 2026, 02_14_01 PM.png",
  },
  {
    name: "抽象线条 系列",
    series: "抽象印花针织裹身连衣裙",
    price: "¥699",
    progress: 48,
    joined: 156,
    countdown: 12 * 3600 + 33 * 60 + 56,
    state: "new",
    tagText: "新品团",
    image: "/assets/images/home/02-hot-group/ChatGPT Image Apr 26, 2026, 02_14_07 PM.png",
  },
];

type GalleryItem = {
  name: string;
  price: string;
  favs: number;
  image: string;
};

const GALLERY_ITEMS: GalleryItem[] = [
  { name: "水墨丹青", price: "¥699", favs: 523, image: "/assets/images/home/03-gallery/ChatGPT Image Apr 26, 2026, 02_22_48 PM.png" },
  { name: "休闲真丝", price: "¥799", favs: 947, image: "/assets/images/home/03-gallery/ChatGPT Image Apr 26, 2026, 02_27_48 PM.png" },
  { name: "几何构成", price: "¥699", favs: 412, image: "/assets/images/home/03-gallery/ChatGPT Image Apr 26, 2026, 02_27_57 PM.png" },
  { name: "月光蓝印", price: "¥799", favs: 567, image: "/assets/images/home/03-gallery/ChatGPT Image Apr 26, 2026, 02_28_33 PM.png" },
  { name: "色彩拼接", price: "¥799", favs: 388, image: "/assets/images/home/03-gallery/ChatGPT Image Apr 26, 2026, 02_28_45 PM.png" },
  { name: "鎏金花园", price: "¥699", favs: 321, image: "/assets/images/home/03-gallery/ChatGPT Image Apr 26, 2026, 02_28_53 PM.png" },
  { name: "热带风情", price: "¥799", favs: 289, image: "/assets/images/home/03-gallery/ChatGPT Image Apr 26, 2026, 02_29_02 PM.png" },
  { name: "都市律动", price: "¥699", favs: 398, image: "/assets/images/home/03-gallery/ChatGPT Image Apr 26, 2026, 02_29_09 PM.png" },
];

function formatCountdown(total: number) {
  const safe = Math.max(0, total);
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  const s = safe % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

interface HomeApiHotBuy {
  id: string;
  publishedDesignId: string;
  title: string;
  coverImage: string | null;
  groupPrice: number;
  currentCount: number;
  targetCount: number;
  progressPct: number;
  secondsRemaining: number;
}
interface HomeApiPopular {
  id: string;
  title: string;
  images: string[];
  groupPrice: number;
  likeCount: number;
}

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);
  const [hotCards, setHotCards] = useState<HotCard[]>(HOT_CARDS);
  const [hotLinks, setHotLinks] = useState<string[]>(HOT_CARDS.map(() => "#hot"));
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(GALLERY_ITEMS);
  const [galleryLinks, setGalleryLinks] = useState<string[]>(GALLERY_ITEMS.map(() => "/products"));
  const [countdowns, setCountdowns] = useState<number[]>(() =>
    HOT_CARDS.map((c) => c.countdown)
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/home", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as {
          hotGroupBuys: HomeApiHotBuy[];
          popularDesigns: HomeApiPopular[];
        };
        if (!alive) return;
        if (data.hotGroupBuys?.length) {
          const cards: HotCard[] = data.hotGroupBuys.slice(0, 4).map((g) => ({
            name: g.title,
            series: `众定 ${g.currentCount} / ${g.targetCount} 人`,
            price: `¥${(g.groupPrice / 100).toLocaleString()}`,
            progress: g.progressPct,
            joined: g.currentCount,
            countdown: g.secondsRemaining,
            state:
              g.progressPct >= 90
                ? ("almost" as HotState)
                : g.progressPct < 30
                ? ("new" as HotState)
                : ("hot" as HotState),
            tagText:
              g.progressPct >= 90 ? "即将成团" : g.progressPct < 30 ? "新品团" : "热拼中",
            image:
              g.coverImage ||
              "/assets/images/home/02-hot-group/ChatGPT Image Apr 26, 2026, 02_13_25 PM.png",
          }));
          setHotCards(cards);
          setHotLinks(data.hotGroupBuys.slice(0, 4).map((g) => `/products/${g.publishedDesignId}`));
          setCountdowns(cards.map((c) => c.countdown));
        }
        if (data.popularDesigns?.length) {
          const items: GalleryItem[] = data.popularDesigns.slice(0, 8).map((p) => ({
            name: p.title,
            price: `¥${(p.groupPrice / 100).toLocaleString()}`,
            favs: p.likeCount,
            image:
              p.images?.[0] ||
              "/assets/images/home/03-gallery/ChatGPT Image Apr 26, 2026, 02_22_48 PM.png",
          }));
          setGalleryItems(items);
          setGalleryLinks(data.popularDesigns.slice(0, 8).map((p) => `/products/${p.id}`));
        }
      } catch {
        /* keep mock fallback */
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setCountdowns((prev) => prev.map((t) => (t > 0 ? t - 1 : 0)));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="page-wrap">
      <nav className={`nav${scrolled ? " scrolled" : ""}`}>
        <div className="container inner">
          <Link href="/" className="nav-logo">
            MaxLuLu <span className="ai">AI</span>
          </Link>
          <div className="nav-center">
            <Link href="/products">印花衣橱</Link>
            <a href="#custom">个性定制</a>
            <a href="#hot">热拼专区</a>
          </div>
          <div className="nav-right">
            <Link href="/my">会员</Link>
            <Link href="/my">我的衣橱</Link>
            <span className="nav-divider" />
            <Link href="/studio/join" className="designer-btn">
              设计师入驻
            </Link>
          </div>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-bg">
          <Image
            src={HERO_IMG}
            alt="MaxLuLu AI · 春夏品牌大片"
            fill
            priority
            unoptimized
            sizes="100vw"
            className="hero-img"
          />
          <div className="hero-overlay" />
        </div>
        <div className="container hero-content">
          <div className="hero-copy">
            <h1>
              让你的灵感，
              <br />
              与喜欢的设计，
              <br />
              都能穿上身
            </h1>
            <p className="sub">
              通过上千款设计师原创艺术印花，
              <br />
              或定制你的专属针织印花连衣裙
            </p>
            <div className="ctas">
              <Button as="a" href="/products" variant="primary" size="lg">去印花衣橱</Button>
              <Button as="a" href="/studio" variant="secondary" size="lg">定制专区</Button>
            </div>
            <div className="trust-row">
              <span className="trust-item">
                <span className="ic">✦</span>设计师原创
              </span>
              <span className="trust-item">
                <span className="ic">✦</span>1000+ 全球印花
              </span>
              <span className="trust-item">
                <span className="ic">✦</span>支付宝担保
              </span>
              <span className="trust-item">
                <span className="ic">✦</span>7天退换无忧
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="hot">
        <div className="container">
          <div className="section-head">
            <h2>正在热拼 · 拼满即产</h2>
            <a href="#hot" className="more">
              查看热拼 →
            </a>
          </div>
          <div className="hot-grid">
            {hotCards.map((card, idx) => {
              const badgeTone =
                card.state === "almost" ? "gold" : card.state === "new" ? "neutral" : "dark";
              return (
                <article key={card.name} className="hot-card">
                  <div className="img-wrap">
                    <Image
                      src={card.image}
                      alt={card.name}
                      fill
                      sizes="(max-width: 480px) 50vw, (max-width: 1024px) 50vw, 25vw"
                      className="hot-img"
                    />
                    <Badge tone={badgeTone} className="hot-card__badge">{card.tagText}</Badge>
                  </div>
                  <div className="body">
                    <div className="name">{card.name}</div>
                    <div className="series">{card.series}</div>
                    <div className="price">{card.price}</div>
                    <div className="progress">
                      <div
                        className="pfill"
                        style={{ width: `${card.progress}%` }}
                      />
                    </div>
                    <div className="meta">
                      <span className="joined">已拼 {card.joined}人</span>
                      <span className="countdown">
                        <span className="dot">●</span>{" "}
                        {formatCountdown(countdowns[idx] ?? 0)}
                      </span>
                    </div>
                    <Button as="a" href={hotLinks[idx] || "/products"} variant="primary" size="sm" block>去拼团</Button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section" id="gallery">
        <div className="container">
          <div className="section-head">
            <h2>印花衣橱 · 千款设计等你挑</h2>
            <Link href="/products" className="more">
              看更多 →
            </Link>
          </div>
          <div className="gallery-grid">
            {galleryItems.map((item, idx) => (
              <Link href={galleryLinks[idx] || "/products"} key={`${item.name}-${idx}`} className="gallery-card">
                <div className="img-wrap">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="(max-width: 480px) 50vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="gallery-img"
                  />
                  <div className="overlay">
                    <span>查看详情</span>
                  </div>
                </div>
                <div className="info">
                  <div className="gname">{item.name}</div>
                  <div className="gbot">
                    <span className="gprice">{item.price}</span>
                    <span className="gfav">♡ {item.favs}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section custom" id="custom">
        <div className="container">
          <div className="custom-inner">
            <div className="custom-left">
              <h2>个性定制 · 专属你的独一无二</h2>
              <p className="desc">
                描述你心目中的印花图案，选择款式与面料，工厂直接为你生产。
              </p>
              <div className="steps-row">
                <div className="step">
                  <div className="step-icon" aria-hidden>
                    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="32" cy="32" r="5" />
                      <ellipse cx="32" cy="17" rx="6" ry="10" />
                      <ellipse cx="32" cy="47" rx="6" ry="10" />
                      <ellipse cx="17" cy="32" rx="10" ry="6" />
                      <ellipse cx="47" cy="32" rx="10" ry="6" />
                      <ellipse cx="22" cy="22" rx="7" ry="5" transform="rotate(-45 22 22)" />
                      <ellipse cx="42" cy="22" rx="7" ry="5" transform="rotate(45 42 22)" />
                      <ellipse cx="22" cy="42" rx="7" ry="5" transform="rotate(45 22 42)" />
                      <ellipse cx="42" cy="42" rx="7" ry="5" transform="rotate(-45 42 42)" />
                    </svg>
                  </div>
                  <div className="step-t">选择印花图案</div>
                  <div className="step-d">
                    描述灵感或
                    <br />
                    浏览现有图案
                  </div>
                  <div className="step-line" />
                </div>
                <div className="step">
                  <div className="step-icon" aria-hidden>
                    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M24 12 L28 14 L32 11 L36 14 L40 12 L42 22 L50 56 L14 56 L22 22 Z" />
                      <path d="M28 14 Q32 9 36 14" />
                      <path d="M22 22 L18 30" />
                      <path d="M42 22 L46 30" />
                    </svg>
                  </div>
                  <div className="step-t">选择裙型版型</div>
                  <div className="step-d">
                    裹身裙 · A字裙
                    <br />
                    直筒裙 · 百褶裙
                  </div>
                  <div className="step-line" />
                </div>
                <div className="step">
                  <div className="step-icon" aria-hidden>
                    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="10" y="22" width="44" height="20" rx="2" />
                      <rect x="6" y="42" width="52" height="8" rx="1" />
                      <path d="M14 22 L14 18 Q14 14 18 14 L26 14" />
                      <line x1="46" y1="22" x2="46" y2="38" />
                      <line x1="46" y1="38" x2="42" y2="38" />
                      <line x1="42" y1="38" x2="42" y2="46" />
                      <circle cx="42" cy="48" r="1.6" fill="currentColor" />
                      <circle cx="20" cy="32" r="3" />
                      <line x1="32" y1="28" x2="42" y2="28" />
                    </svg>
                  </div>
                  <div className="step-t">下单定制生产</div>
                  <div className="step-d">
                    选面料尺码
                    <br />
                    专属一件起做
                  </div>
                </div>
              </div>
            </div>
            <div className="custom-right">
              <div className="custom-img">
                <Image
                  src={CUSTOM_IMG}
                  alt="定制效果展示"
                  fill
                  sizes="(max-width: 1024px) 90vw, 400px"
                  className="custom-bg"
                />
                <div className="custom-card">
                  <h3>
                    不止是连衣裙，
                    <br />
                    设计你的专属款
                  </h3>
                  <div className="feats">
                    <span className="feat">
                      <span className="ck">✓</span> 定制印花
                    </span>
                    <span className="feat">
                      <span className="ck">✓</span> 天然面料
                    </span>
                    <span className="feat">
                      <span className="ck">✓</span> 贴合身形
                    </span>
                    <span className="feat">
                      <span className="ck">✓</span> 专属一件
                    </span>
                  </div>
                  <div className="price-row">
                    <span className="plabel">定制价</span>
                    <span className="pbig">¥1599</span>
                    <span className="plabel">起</span>
                  </div>
                  <Button as="a" href="/products" variant="primary">立即定制</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="trust-bar">
        <div className="container">
          <div className="trust-bar-row">
            <div className="trust-item2">
              <div className="trust-icon">✦</div>
              <span className="trust-t">2009年上海创立</span>
            </div>
            <div className="trust-item2">
              <div className="trust-icon">✦</div>
              <span className="trust-t">15年印花连衣裙专家</span>
            </div>
            <div className="trust-item2">
              <div className="trust-icon">✦</div>
              <span className="trust-t">100+ 门店历史</span>
            </div>
            <div className="trust-item2">
              <div className="trust-icon">✦</div>
              <span className="trust-t">7天退换无忧</span>
            </div>
          </div>
        </div>
      </div>

      <section className="cta">
        <div className="container">
          <h2>从灵感到成衣，只需一步</h2>
          <p className="sub">Fashion For You — 每一朵印花，都由你绽放</p>
          <div className="btns">
            <Button as="a" href="/products" variant="primary" size="lg">探索印花衣橱</Button>
            <Button as="a" href="/products" variant="secondary" size="lg">开始定制</Button>
          </div>
          <div className="cta-chips">
            <div className="cta-chip">
              <span className="cta-chip-ic" aria-hidden>✦</span>
              <span className="cta-chip-t">原创印花设计</span>
            </div>
            <div className="cta-chip">
              <span className="cta-chip-ic" aria-hidden>✦</span>
              <span className="cta-chip-t">大牌剪裁工艺</span>
            </div>
            <div className="cta-chip">
              <span className="cta-chip-ic" aria-hidden>✦</span>
              <span className="cta-chip-t">贴合身形定制</span>
            </div>
            <div className="cta-chip">
              <span className="cta-chip-ic" aria-hidden>✦</span>
              <span className="cta-chip-t">天然面料严选</span>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <div className="footer-top">
            <div className="footer-brand">
              <div className="logo">
                MaxLuLu <span className="ai">AI</span>
              </div>
              <div className="info">
                2009年上海创立
                <br />
                15年印花连衣裙专家
                <br />
                上海禄创企业管理有限公司
              </div>
              <div className="slogan">Fashion For You</div>
              <div className="footer-social">
                <a href="#weibo" aria-label="微博">微</a>
                <a href="#weibo2" aria-label="微博">博</a>
                <a href="#redbook" aria-label="小红书">书</a>
                <a href="#douyin" aria-label="抖音">抖</a>
              </div>
            </div>
            <div className="footer-col">
              <div className="ft">帮助中心</div>
              <Link href="/size-guide">尺码指南</Link>
              <a href="#shipping">物流与退换</a>
              <a href="#payment">支付说明</a>
            </div>
            <div className="footer-col">
              <div className="ft">关于我们</div>
              <a href="#story">品牌故事</a>
              <Link href="/studio/join">设计师招募</Link>
              <a href="#stores">门店查询</a>
            </div>
            <div className="footer-col">
              <div className="ft">服务与支持</div>
              <a href="#support">联系客服</a>
              <Link href="/privacy">隐私政策</Link>
              <Link href="/terms">用户协议</Link>
            </div>
            <div className="footer-col">
              <div className="ft">关注我们</div>
              <a href="#wechat">微信公众号</a>
              <a href="#weibo3">微博</a>
              <a href="#redbook2">小红书</a>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© 2009-2026 MaxLuLu AI</span>
            <span>上海禄创企业管理有限公司</span>
            <span>沪ICP备XXXXXXXX号</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
