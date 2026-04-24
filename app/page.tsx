"use client";

import { useEffect, useRef, useState } from "react";
import "./homepage.css";

const R2_BRAND = "https://pub-39ccb989bffa4f729bb1ae58876f3b36.r2.dev/brand";

const HERO_IMAGE = `${R2_BRAND}/hero-banner.png`;

const FEATURED = [
  { src: `${R2_BRAND}/featured-01.png`, name: "Paris Ink Blossom", price: "$289", alt: "巴黎黑白艺术印花连衣裙" },
  { src: `${R2_BRAND}/featured-02.png`, name: "Moon Garden", price: "$248", alt: "灰蓝花园印花连衣裙" },
  { src: `${R2_BRAND}/featured-03.png`, name: "Shanghai Noir", price: "$319", alt: "黑色优雅晚装长裙" },
  { src: `${R2_BRAND}/featured-04.png`, name: "Fleur de Rose", price: "$268", alt: "粉色花卉印花连衣裙" },
  { src: `${R2_BRAND}/featured-05.png`, name: "Dragonfly Whisper", price: "$298", alt: "蜻蜓植物图案香槟色连衣裙" },
];

const TOOLS = [
  { no: "01", title: "Text to Design", desc: "Generate silhouettes and print concepts from a design brief." },
  { no: "02", title: "Print Generator", desc: "Create romantic florals, ink motifs, and heritage patterns." },
  { no: "03", title: "Color Palette", desc: "Extract champagne, taupe, blush, and charcoal palettes." },
  { no: "04", title: "Style Transfer", desc: "Apply French romantic or Eastern elegance styling." },
];

type Gallery = {
  src: string;
  name: string;
  alt: string;
  categories: string[];
  tall?: boolean;
};

const GALLERY: Gallery[] = [
  { src: `${R2_BRAND}/featured-06.png`, name: "Ink Movement", alt: "黑白艺术印花长裙灵感图", categories: ["print", "romantic"] },
  { src: `${R2_BRAND}/featured-07.png`, name: "Blue Floral Veil", alt: "灰蓝花卉印花长裙灵感图", categories: ["floral", "oriental"], tall: true },
  { src: `${R2_BRAND}/featured-08.png`, name: "Rose Hat", alt: "玫瑰色印花裙与黑色宽檐帽灵感图", categories: ["floral", "romantic"] },
  { src: `${R2_BRAND}/featured-09.png`, name: "Noir Elegance", alt: "黑色礼服与宽檐帽灵感图", categories: ["noir", "oriental"], tall: true },
  { src: `${R2_BRAND}/featured-10.png`, name: "Architectural Muse", alt: "米色黑色印花裙建筑空间灵感图", categories: ["print", "romantic"] },
  { src: `${R2_BRAND}/featured-01.png`, name: "Paris Print", alt: "巴黎黑白印花裙灵感图", categories: ["print", "romantic"] },
  { src: `${R2_BRAND}/featured-04.png`, name: "Soft Rose Garden", alt: "粉色花园长裙灵感图", categories: ["floral", "romantic"], tall: true },
  { src: `${R2_BRAND}/featured-03.png`, name: "Shanghai Noir", alt: "巴黎露台黑色长裙灵感图", categories: ["noir"] },
];

const FILTERS = [
  { label: "For You", value: "all" },
  { label: "Print Dress", value: "print" },
  { label: "Floral", value: "floral" },
  { label: "Noir", value: "noir" },
  { label: "Romantic", value: "romantic" },
  { label: "Oriental", value: "oriental" },
];

const NAV_LINKS = [
  { label: "NEW IN", href: "#new-in" },
  { label: "DRESSES", href: "#featured" },
  { label: "CLOTHING", href: "#featured" },
  { label: "AI DESIGN", href: "#studio" },
  { label: "INSPIRATION", href: "#inspiration" },
  { label: "ABOUT", href: "#about" },
];

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 21s-7.5-4.5-9.4-9.2C1.2 8.4 3 5.4 6.1 5.1c1.8-.2 3.4.7 4.2 2 1-1.3 2.5-2.2 4.4-2 3 .3 4.8 3.3 3.5 6.7C19.5 16.5 12 21 12 21Z" />
    </svg>
  );
}

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [wishlist, setWishlist] = useState<Set<number>>(new Set());
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const els = root.querySelectorAll<HTMLElement>(".reveal");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const toggleWishlist = (i: number) => {
    setWishlist((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  return (
    <div ref={rootRef} className="home-root">
      <header className={`site-header${scrolled ? " is-scrolled" : ""}`}>
        <a className="brand" href="#" aria-label="MaxLuLu AI 首页">
          <span className="brand__logo">MaxLuLu AI</span>
          <span className="brand__tagline">AI-POWERED FASHION DESIGN &amp; SHOPPING PLATFORM</span>
        </a>

        <nav className={`main-nav${menuOpen ? " is-open" : ""}`} aria-label="主导航">
          {NAV_LINKS.map((l) => (
            <a key={l.label} href={l.href} onClick={() => setMenuOpen(false)}>
              {l.label}
            </a>
          ))}
        </nav>

        <div className="header-actions" aria-label="快捷操作">
          <button className="icon-btn" type="button" aria-label="搜索">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="m21 21-4.35-4.35m2.1-5.4a7.25 7.25 0 1 1-14.5 0 7.25 7.25 0 0 1 14.5 0Z" />
            </svg>
          </button>
          <button className="icon-btn" type="button" aria-label="账户">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M20 21a8 8 0 0 0-16 0m12-13a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" />
            </svg>
          </button>
          <button className="icon-btn" type="button" aria-label="购物袋">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6.5 8.5h13l-1.1 12h-12.8l-1.1-12h2Zm2 0a3.5 3.5 0 0 1 7 0" />
            </svg>
          </button>
          <button
            className={`menu-btn${menuOpen ? " is-open" : ""}`}
            type="button"
            aria-label="打开菜单"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </header>

      <main>
        <section className="hero" id="new-in" aria-label="MaxLuLu AI 首页头图">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="hero__image" src={HERO_IMAGE} alt="巴黎远景下穿着黑白印花长裙的优雅模特" fetchPriority="high" />
          <div className="hero__overlay" aria-hidden="true"></div>

          <div className="hero__content reveal is-visible">
            <p className="eyebrow">FRENCH ROMANTIC · EASTERN ELEGANCE</p>
            <h1>
              Design the
              <br />
              Extraordinary
            </h1>
            <p className="hero__subtitle">
              AI-POWERED DESIGN TOOLS
              <br />
              MEET TIMELESS ELEGANCE
            </p>

            <div className="hero__cta">
              <a className="btn btn--dark" href="#studio">
                EXPLORE AI STUDIO
              </a>
              <a className="btn btn--link" href="#featured">
                SHOP NEW ARRIVALS
              </a>
            </div>

            <div className="hero__meta" aria-label="品牌信息">
              <span>15 YEARS OF PRINT DESIGN HERITAGE</span>
              <span>SHANGHAI · PARIS · NEW YORK</span>
            </div>
          </div>
        </section>

        <section className="section section--featured" id="featured">
          <div className="section__head reveal">
            <div>
              <p className="section-kicker">FEATURED DESIGNS</p>
              <h2>Romantic print dresses for modern elegance</h2>
            </div>
            <a className="view-link" href="#inspiration">
              VIEW ALL
            </a>
          </div>

          <div className="product-track" aria-label="精选设计列表">
            {FEATURED.map((item, i) => {
              const active = wishlist.has(i);
              return (
                <article key={item.src} className="product-card reveal">
                  <figure>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.src} alt={item.alt} loading="lazy" />
                    <button
                      className={`wishlist${active ? " is-active" : ""}`}
                      type="button"
                      aria-label={`收藏 ${item.name}`}
                      onClick={() => toggleWishlist(i)}
                    >
                      <HeartIcon />
                    </button>
                  </figure>
                  <div className="product-card__body">
                    <span>{item.name}</span>
                    <strong>{item.price}</strong>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="studio-teaser section" id="studio">
          <div className="studio-teaser__copy reveal">
            <p className="section-kicker">AI DESIGN STUDIO</p>
            <h2>Create, refine, and regenerate prints in seconds</h2>
            <p>
              Text-to-design, image-to-outfit, color palette extraction, and print generation tools are arranged for a fashion-first workflow.
            </p>
            <a className="btn btn--gold" href="/studio">
              START A NEW PROJECT
            </a>
          </div>

          <div className="tool-grid reveal" aria-label="AI 设计工具预览">
            {TOOLS.map((t) => (
              <article key={t.no}>
                <span>{t.no}</span>
                <strong>{t.title}</strong>
                <p>{t.desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section inspiration" id="inspiration">
          <div className="section__head reveal">
            <div>
              <p className="section-kicker">INSPIRATION GALLERY</p>
              <h2>Curated design references</h2>
            </div>
            <button className="filter-button" type="button" aria-label="筛选">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 6h16M7 12h10M10 18h4" />
              </svg>
              Filters
            </button>
          </div>

          <div className="chips reveal" role="list" aria-label="灵感筛选">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                className={`chip${activeFilter === f.value ? " is-active" : ""}`}
                type="button"
                onClick={() => setActiveFilter(f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="gallery-grid" aria-label="灵感图片列表">
            {GALLERY.map((g, i) => {
              const visible = activeFilter === "all" || g.categories.includes(activeFilter);
              const classes = ["gallery-card", "reveal"];
              if (g.tall) classes.push("tall");
              if (!visible) classes.push("is-hidden");
              const favIdx = 1000 + i;
              const active = wishlist.has(favIdx);
              return (
                <article key={g.src + i} className={classes.join(" ")}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={g.src} alt={g.alt} loading="lazy" />
                  <div className="gallery-card__meta">
                    <span>{g.name}</span>
                    <button
                      type="button"
                      aria-label={`收藏 ${g.name}`}
                      onClick={() => toggleWishlist(favIdx)}
                      style={{ color: active ? "var(--soft-blush)" : undefined }}
                    >
                      {active ? "♥" : "♡"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="site-footer" id="about">
        <p>15 YEARS OF CRAFTING PRINT DRESSES</p>
        <span>·</span>
        <p>SHANGHAI DESIGN</p>
        <span>·</span>
        <p>GLOBAL ELEGANCE</p>
        <strong>ML</strong>
      </footer>
    </div>
  );
}
