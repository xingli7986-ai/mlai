"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";

const NAV_LINKS = [
  { label: "NEW IN", href: "/studio" },
  { label: "DRESSES", href: "/studio" },
  { label: "CLOTHING", href: "/studio" },
  { label: "AI DESIGN", href: "/studio", active: true },
  { label: "INSPIRATION", href: "/studio" },
  { label: "ABOUT", href: "/studio" },
];

const R2_BRAND = "https://pub-39ccb989bffa4f729bb1ae58876f3b36.r2.dev/brand";

const FEATURED = [
  { url: `${R2_BRAND}/featured-01.png`, title: "Parisian Reverie", category: "PRINT DRESS · MAXI", price: 899 },
  { url: `${R2_BRAND}/featured-02.png`, title: "Shanghai Dusk", category: "MAXI DRESS · FLORAL", price: 799 },
  { url: `${R2_BRAND}/featured-03.png`, title: "Black Tie Paris", category: "EVENING GOWN · SATIN", price: 999 },
  { url: `${R2_BRAND}/featured-04.png`, title: "Rose Garden", category: "PRINT DRESS · FLORAL", price: 699 },
  { url: `${R2_BRAND}/featured-05.png`, title: "Willow Whisper", category: "MAXI DRESS · BOTANICAL", price: 649 },
  { url: `${R2_BRAND}/featured-06.png`, title: "Ink Waltz", category: "PRINT DRESS · MAXI", price: 849 },
  { url: `${R2_BRAND}/featured-07.png`, title: "Porcelain Bloom", category: "PRINT DRESS · CHIFFON", price: 699 },
  { url: `${R2_BRAND}/featured-08.png`, title: "Bohemian Rose", category: "MAXI DRESS · BOHO", price: 749 },
  { url: `${R2_BRAND}/featured-09.png`, title: "Midnight Noir", category: "EVENING GOWN · SILK", price: 929 },
  { url: `${R2_BRAND}/featured-10.png`, title: "Courtyard Bloom", category: "PRINT DRESS · CLASSIC", price: 779 },
];

const HERO_IMAGE = `${R2_BRAND}/hero-banner.png`;

export default function HomePage() {
  const { data: session, status } = useSession();
  const isAuthed = status === "authenticated" && !!session;

  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: "#F7F0E9", color: "#0C0C0F" }}>
      {/* ======= Top Nav ======= */}
      <header
        className="sticky top-0 z-30"
        style={{
          backgroundColor: "rgba(247,240,233,0.92)",
          borderBottom: "1px solid #D8D7D3",
          backdropFilter: "blur(10px)",
        }}
      >
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link
            href="/"
            className="text-lg tracking-tight sm:text-xl"
            style={{ fontFamily: "var(--font-display)", color: "#0C0C0F" }}
          >
            MaxLuLu <span style={{ color: "#C8A875" }}>AI</span>
          </Link>

          <div className="hidden items-center gap-7 md:flex">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="relative py-1 text-[11px] uppercase"
                style={{
                  letterSpacing: "0.2em",
                  color: l.active ? "#0C0C0F" : "#4A4A4A",
                  fontFamily: "var(--font-body)",
                  fontWeight: l.active ? 600 : 400,
                }}
              >
                {l.label}
                {l.active && (
                  <span
                    className="absolute -bottom-[6px] left-0 right-0 h-[2px]"
                    style={{ backgroundColor: "#C8A875" }}
                  />
                )}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Search"
              className="hidden h-9 w-9 items-center justify-center rounded-full sm:inline-flex"
              style={{ color: "#0C0C0F" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3-3" />
              </svg>
            </button>
            <Link
              href={isAuthed ? "/my" : "/login"}
              aria-label="Account"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full"
              style={{ color: "#0C0C0F" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </Link>
            <Link
              href="/my"
              aria-label="Bag"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full"
              style={{ color: "#0C0C0F" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                <path d="M3 6h18" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            </Link>
          </div>
        </nav>
      </header>

      {/* ======= Hero ======= */}
      <section
        className="relative w-full overflow-hidden h-[50vh] min-h-[420px] md:h-[70vh] md:min-h-[560px]"
        style={{ backgroundColor: "#F7F0E9" }}
      >
        <div className="absolute inset-0">
          <Image
            src={HERO_IMAGE}
            alt="MaxLuLu AI — Design the Extraordinary"
            fill
            priority
            sizes="100vw"
            className="object-cover"
            style={{ objectPosition: "75% center" }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to right, rgba(247,240,233,0.85) 0%, rgba(247,240,233,0.55) 35%, rgba(247,240,233,0) 65%)",
            }}
          />
        </div>

        <div className="relative mx-auto flex h-full max-w-7xl items-center px-5 sm:px-8">
          <div className="max-w-xl">
            <p
              className="mb-3 text-[10px] uppercase sm:mb-4 sm:text-[11px]"
              style={{
                color: "#0C0C0F",
                letterSpacing: "0.3em",
                fontFamily: "var(--font-body)",
                opacity: 0.7,
              }}
            >
              AI-POWERED DESIGN TOOLS · MEET TIMELESS ELEGANCE
            </p>
            <h1
              className="text-[32px] leading-[1.05] tracking-tight sm:text-[48px]"
              style={{
                color: "#0C0C0F",
                fontFamily: "var(--font-display)",
                fontWeight: 500,
              }}
            >
              Design the
              <br />
              <span style={{ fontStyle: "italic" }}>Extraordinary</span>
            </h1>
            <p
              className="mt-4 max-w-md text-sm leading-relaxed sm:mt-5 sm:text-base"
              style={{
                color: "#0C0C0F",
                fontFamily: "var(--font-body)",
              }}
            >
              每一朵印花，都由你绽放。
            </p>
            <p
              className="mt-3 text-[10px] uppercase sm:text-[11px]"
              style={{
                color: "#0C0C0F",
                letterSpacing: "0.25em",
                fontFamily: "var(--font-body)",
                opacity: 0.65,
              }}
            >
              15 YEARS OF PRINT DRESSES · SHANGHAI · PARIS · WORLDWIDE
            </p>

            <div className="mt-6 flex flex-wrap gap-3 sm:mt-8">
              <Link
                href="/studio"
                className="inline-flex items-center gap-2 px-6 py-3 text-[11px] uppercase transition hover:opacity-90 sm:px-7 sm:py-3.5"
                style={{
                  backgroundColor: "#F9F9FF",
                  color: "#0C0C0F",
                  letterSpacing: "0.25em",
                  fontFamily: "var(--font-body)",
                  fontWeight: 600,
                }}
              >
                Explore AI Studio
                <span aria-hidden>→</span>
              </Link>
              <Link
                href="/design"
                className="inline-flex items-center gap-2 border px-6 py-3 text-[11px] uppercase transition hover:bg-[#F9F9FF] sm:px-7 sm:py-3.5"
                style={{
                  borderColor: "#F9F9FF",
                  color: "#0C0C0F",
                  letterSpacing: "0.25em",
                  fontFamily: "var(--font-body)",
                  fontWeight: 600,
                }}
              >
                Shop New Arrivals
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ======= Featured Designs ======= */}
      <section style={{ backgroundColor: "#F7F0E9" }} className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mb-8 flex items-end justify-between gap-4 sm:mb-10">
            <h2
              className="text-2xl tracking-wide sm:text-3xl"
              style={{
                color: "#0C0C0F",
                fontFamily: "var(--font-display)",
                fontWeight: 500,
                letterSpacing: "0.05em",
              }}
            >
              Featured Designs
            </h2>
            <Link
              href="/studio"
              className="text-[11px] uppercase"
              style={{
                color: "#7D5B6E",
                letterSpacing: "0.25em",
                fontFamily: "var(--font-body)",
                fontWeight: 600,
              }}
            >
              View All →
            </Link>
          </div>

          <div className="-mx-5 overflow-x-auto px-5 pb-4 sm:-mx-8 sm:px-8">
            <div className="flex gap-4 sm:gap-5">
              {FEATURED.map((item) => (
                <article
                  key={item.url}
                  className="group w-[220px] flex-shrink-0 overflow-hidden rounded-lg sm:w-[240px] lg:w-[260px]"
                  style={{
                    backgroundColor: "#FFFFFF",
                    boxShadow: "0 1px 2px rgba(12,12,15,0.04), 0 4px 12px rgba(12,12,15,0.06)",
                  }}
                >
                  <div
                    className="relative aspect-[3/4] w-full overflow-hidden"
                    style={{ backgroundColor: "#F1EDE6" }}
                  >
                    <Image
                      src={item.url}
                      alt={item.title}
                      fill
                      sizes="(min-width: 1024px) 20vw, (min-width: 640px) 240px, 220px"
                      loading="lazy"
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="flex items-baseline justify-between gap-2 px-4 py-3 sm:px-4 sm:py-4">
                    <div className="min-w-0">
                      <p
                        className="truncate text-[10px] uppercase"
                        style={{
                          color: "#7D5B6E",
                          letterSpacing: "0.2em",
                          fontFamily: "var(--font-body)",
                        }}
                      >
                        {item.category}
                      </p>
                      <h3
                        className="mt-1 truncate text-base"
                        style={{
                          color: "#0C0C0F",
                          fontFamily: "var(--font-display)",
                          fontWeight: 500,
                        }}
                      >
                        {item.title}
                      </h3>
                    </div>
                    <span
                      className="flex-shrink-0 text-sm"
                      style={{
                        color: "#C8A875",
                        fontFamily: "var(--font-body)",
                        fontWeight: 600,
                      }}
                    >
                      ¥{item.price}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ======= Atelier Strip ======= */}
      <section
        className="py-14 text-center sm:py-16"
        style={{
          backgroundColor: "#F1EDE6",
          borderTop: "1px solid #D8D7D3",
          borderBottom: "1px solid #D8D7D3",
        }}
      >
        <div className="mx-auto max-w-3xl px-5">
          <p
            className="text-[11px] uppercase"
            style={{
              color: "#C8A875",
              letterSpacing: "0.3em",
              fontFamily: "var(--font-body)",
            }}
          >
            Romantic · Artistic · Timeless
          </p>
          <h3
            className="mt-4 text-2xl sm:text-3xl"
            style={{
              color: "#0C0C0F",
              fontFamily: "var(--font-display)",
              fontWeight: 500,
            }}
          >
            Parisian inspiration meets Eastern aesthetics.
          </h3>
          <p
            className="mt-4 text-sm leading-relaxed sm:text-base"
            style={{
              color: "#4A4A4A",
              fontFamily: "var(--font-body)",
            }}
          >
            从一句灵感描述开始，AI 为你绘制独属于你的印花，再将它裁成一条专属的裙装。
          </p>
          <Link
            href="/design"
            className="mt-8 inline-flex items-center gap-2 px-7 py-3 text-[11px] uppercase transition hover:opacity-90"
            style={{
              backgroundColor: "#C8A875",
              color: "#0C0C0F",
              letterSpacing: "0.25em",
              fontFamily: "var(--font-body)",
              fontWeight: 600,
            }}
          >
            Start your design →
          </Link>
        </div>
      </section>

      {/* ======= Footer Strip ======= */}
      <footer
        className="py-10 text-center"
        style={{ backgroundColor: "#0C0C0F" }}
      >
        <p
          className="text-[11px] uppercase"
          style={{
            color: "#C8A875",
            letterSpacing: "0.3em",
            fontFamily: "var(--font-body)",
          }}
        >
          15 Years of Crafting Print Dresses · Shanghai Design · Global Elegance
        </p>
        <div
          className="mt-4 flex items-center justify-center gap-4 text-[11px]"
          style={{
            color: "#8A8A8A",
            letterSpacing: "0.2em",
            fontFamily: "var(--font-body)",
          }}
        >
          <Link href="/terms" className="transition hover:text-[#C8A875]">
            TERMS
          </Link>
          <span>·</span>
          <Link href="/privacy" className="transition hover:text-[#C8A875]">
            PRIVACY
          </Link>
        </div>
      </footer>
    </div>
  );
}
