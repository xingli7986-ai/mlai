"use client";

import Link from "next/link";
import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { useSession } from "next-auth/react";

const SHOWCASE = [
  {
    url: "https://pub-39ccb989bffa4f729bb1ae58876f3b36.r2.dev/designs/1776808085069_1.webp",
    title: "樱花水彩",
  },
  {
    url: "https://pub-39ccb989bffa4f729bb1ae58876f3b36.r2.dev/designs/1776808085069_2.webp",
    title: "樱花水彩",
  },
  {
    url: "https://pub-39ccb989bffa4f729bb1ae58876f3b36.r2.dev/designs/1776808434564_2.webp",
    title: "几何花卉",
  },
  {
    url: "https://pub-39ccb989bffa4f729bb1ae58876f3b36.r2.dev/designs/1776808434564_3.webp",
    title: "几何花卉",
  },
  {
    url: "https://pub-39ccb989bffa4f729bb1ae58876f3b36.r2.dev/designs/1776808481930_1.webp",
    title: "热带植物",
  },
  {
    url: "https://pub-39ccb989bffa4f729bb1ae58876f3b36.r2.dev/designs/1776808481930_2.webp",
    title: "热带植物",
  },
  {
    url: "https://pub-39ccb989bffa4f729bb1ae58876f3b36.r2.dev/designs/1776808504320_0.webp",
    title: "水墨牡丹",
  },
  {
    url: "https://pub-39ccb989bffa4f729bb1ae58876f3b36.r2.dev/designs/1776808504320_1.webp",
    title: "水墨牡丹",
  },
];

// 12 items for masonry — repeat SHOWCASE with shuffled indexes
const GALLERY = Array.from({ length: 12 }, (_, i) => {
  const item = SHOWCASE[(i * 3 + 1) % SHOWCASE.length];
  const aspects = ["3/4", "4/5", "1/1", "5/4", "3/4", "4/5"];
  return { ...item, aspect: aspects[i % aspects.length] };
});

const FLOWERS = [
  { top: "8%", left: "6%", size: 56, duration: 9, delay: 0 },
  { top: "18%", left: "82%", size: 72, duration: 11, delay: 1.2 },
  { top: "62%", left: "10%", size: 44, duration: 8, delay: 2 },
  { top: "55%", left: "78%", size: 60, duration: 10, delay: 0.6 },
  { top: "82%", left: "48%", size: 36, duration: 12, delay: 1.8 },
  { top: "32%", left: "45%", size: 40, duration: 13, delay: 3.2 },
];

function useInView(
  ref: RefObject<HTMLElement | null>,
  options?: IntersectionObserverInit
) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, ...options }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, options]);
  return inView;
}

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref);
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } ${className}`}
    >
      {children}
    </div>
  );
}

function AnimatedCounter({
  target,
  duration = 1500,
  suffix = "",
}: {
  target: number;
  duration?: number;
  suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const inView = useInView(ref);
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const easeOutExpo = (t: number) =>
      t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      setValue(Math.round(target * easeOutExpo(t)));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, target, duration]);

  return (
    <span ref={ref}>
      {value}
      {suffix}
    </span>
  );
}

export default function HomePage() {
  const { data: session, status } = useSession();
  const isAuthed = status === "authenticated" && !!session;

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-black/5 bg-white/80 px-4 py-3 backdrop-blur sm:px-6 sm:py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="h-7 w-7 rounded-xl bg-gradient-to-br from-[#FF6B9D] to-[#C084FC] sm:h-8 sm:w-8" />
          <span className="text-base font-semibold tracking-tight sm:text-lg">
            MaxLuLu <span className="text-[#C084FC]">AI</span>
          </span>
        </Link>
        <nav className="flex items-center gap-2">
          {isAuthed ? (
            <Link
              href="/my"
              className="rounded-full px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 sm:px-4 sm:py-2"
            >
              我的
            </Link>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-gradient-to-r from-[#FF6B9D] to-[#C084FC] px-4 py-1.5 text-sm font-medium text-white shadow-md shadow-[#C084FC]/30 transition hover:opacity-95 sm:px-5 sm:py-2"
            >
              登录
            </Link>
          )}
        </nav>
      </header>

      {/* ======= 区域 1: Hero ======= */}
      <section
        className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-5 text-center"
        style={{
          background:
            "linear-gradient(135deg, #1a0a2e 0%, #2d1b4e 30%, #4a1942 60%, #1a0a2e 100%)",
          backgroundSize: "400% 400%",
          animation: "gradientShift 20s ease infinite",
        }}
      >
        <div className="pointer-events-none absolute inset-0">
          {FLOWERS.map((f, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                top: f.top,
                left: f.left,
                animation: `float ${f.duration}s ease-in-out infinite`,
                animationDelay: `${f.delay}s`,
              }}
            >
              <FlowerSVG size={f.size} />
            </div>
          ))}
        </div>

        <h1
          className="relative text-5xl font-bold tracking-tight text-white md:text-7xl"
          style={{
            animation: "fadeInUp 0.8s ease-out backwards",
            animationDelay: "0.1s",
          }}
        >
          Fashion For You
        </h1>
        <p
          className="relative mt-5 text-xl font-medium text-white md:text-2xl"
          style={{
            animation: "fadeInUp 0.8s ease-out backwards",
            animationDelay: "0.3s",
          }}
        >
          每一朵印花，都由你绽放
        </p>
        <p
          className="relative mt-6 max-w-md text-base leading-relaxed text-white/80 md:text-lg"
          style={{
            animation: "fadeInUp 0.8s ease-out backwards",
            animationDelay: "0.5s",
          }}
        >
          用 AI 描述你的灵感，生成专属印花，定制你的裙装
        </p>
        <Link
          href="/design"
          className="relative mt-10 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 px-10 py-4 text-base font-bold text-white shadow-lg transition hover:scale-105 sm:text-lg"
          style={{
            animation: "fadeInUp 0.8s ease-out backwards",
            animationDelay: "0.7s",
          }}
        >
          <span>开始设计</span>
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-white"
          >
            <path d="M5 12h14M13 5l7 7-7 7" />
          </svg>
        </Link>

        <div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/60"
          aria-hidden
        >
          <svg
            viewBox="0 0 24 24"
            width="24"
            height="24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              animation: "float 2.4s ease-in-out infinite",
            }}
          >
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </div>
      </section>

      {/* ======= 区域 2: Social Proof ======= */}
      <section className="bg-gray-50 py-16 sm:py-20">
        <Reveal className="mx-auto max-w-5xl px-5 sm:px-6">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-6">
            <StatCell
              icon={<BrushIcon />}
              value={500}
              suffix="+"
              label="件印花设计"
              caption="累计生成的独一无二印花"
            />
            <StatCell
              icon={<UserIcon />}
              value={128}
              suffix="+"
              label="位设计师"
              caption="来自社区的创作者"
            />
            <StatCell
              icon={<PaletteIcon />}
              value={14}
              label="种风格预设"
              caption="覆盖主流时尚风格"
            />
          </div>
        </Reveal>
      </section>

      {/* ======= 区域 3: 3-Step Flow ======= */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-5xl px-5 sm:px-6">
          <Reveal className="text-center">
            <h2 className="bg-gradient-to-r from-[#FF6B9D] to-[#C084FC] bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
              三步，定制你的专属裙装
            </h2>
            <p className="mt-3 text-sm text-gray-500 sm:text-base">
              从灵感到成衣，比想象中更简单
            </p>
          </Reveal>

          <div className="relative mt-12 grid grid-cols-1 gap-8 sm:mt-16 sm:grid-cols-3 sm:gap-6">
            {/* Dashed connector lines */}
            <div
              aria-hidden
              className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 border-l-2 border-dashed border-[#C084FC]/30 sm:hidden"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute left-[16.5%] right-[16.5%] top-16 hidden h-px border-t-2 border-dashed border-[#C084FC]/30 sm:block"
            />

            {[
              {
                num: "01",
                title: "描述灵感",
                desc: "输入你想要的印花风格，或选择预设标签",
                icon: <LightbulbIcon />,
              },
              {
                num: "02",
                title: "AI 生成印花",
                desc: "AI 为你生成 4 款独一无二的印花方案",
                icon: <SparkleIcon />,
              },
              {
                num: "03",
                title: "选裙型下单",
                desc: "挑选裙型和面料，一键下单定制",
                icon: <DressIcon />,
              },
            ].map((step, i) => (
              <Reveal key={step.num} delay={i * 200}>
                <div className="relative rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-[#C084FC]/40 hover:shadow-xl sm:p-8">
                  <div className="absolute -top-3 left-6 rounded-full bg-gradient-to-r from-[#FF6B9D] to-[#C084FC] px-3 py-1 text-xs font-bold text-white shadow-md shadow-[#C084FC]/30">
                    {step.num}
                  </div>
                  <div className="mt-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF6B9D]/10 to-[#C084FC]/10 text-[#C084FC]">
                    {step.icon}
                  </div>
                  <h3 className="mt-4 text-xl font-bold tracking-tight">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-500">
                    {step.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ======= 区域 4: Masonry Gallery ======= */}
      <section className="bg-gray-50 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-5 sm:px-6">
          <Reveal className="text-center">
            <h2 className="bg-gradient-to-r from-[#FF6B9D] to-[#C084FC] bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
              设计师们的灵感
            </h2>
            <p className="mt-3 text-sm text-gray-500 sm:text-base">
              来自社区的真实 AI 印花作品
            </p>
          </Reveal>

          <div className="mt-10 columns-2 gap-3 sm:mt-14 md:columns-3 md:gap-4 lg:columns-4">
            {GALLERY.map((item, i) => (
              <Reveal
                key={`${item.url}-${i}`}
                delay={i * 80}
                className="mb-3 break-inside-avoid md:mb-4"
              >
                <div
                  className="group relative overflow-hidden rounded-xl bg-gray-100 shadow-sm transition duration-300 hover:shadow-xl"
                  style={{ aspectRatio: item.aspect }}
                >
                  <Image
                    src={item.url}
                    alt={item.title}
                    fill
                    sizes="(min-width: 1024px) 280px, (min-width: 768px) 33vw, 50vw"
                    loading="lazy"
                    className="object-cover transition duration-300 group-hover:scale-105"
                  />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ======= 区域 5: Bottom CTA ======= */}
      <section className="relative overflow-hidden py-20 text-center sm:py-28">
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "linear-gradient(135deg, #FF6B9D 0%, #C084FC 100%)",
          }}
        />
        <Reveal className="mx-auto max-w-2xl px-5 sm:px-6">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-5xl">
            开始你的第一件设计
          </h2>
          <p className="mt-5 text-base text-white/90 sm:text-lg">
            从一句灵感描述开始，让 AI 为你绽放
          </p>
          <Link
            href="/design"
            className="mt-10 inline-flex items-center gap-2 rounded-full bg-white px-10 py-4 text-base font-bold text-[#C084FC] shadow-xl shadow-black/20 transition hover:bg-[#C084FC] hover:text-white sm:text-lg"
          >
            <span>立即体验</span>
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </Link>
        </Reveal>
      </section>

      {/* ======= 区域 6: Footer ======= */}
      <footer className="py-10 text-center">
        <p className="bg-gradient-to-r from-[#FF6B9D] to-[#C084FC] bg-clip-text text-sm font-medium text-transparent">
          Fashion For You — 每一朵印花，都由你绽放
        </p>
        <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-400">
          <Link href="/terms" className="hover:text-[#C084FC] hover:underline">
            用户协议
          </Link>
          <span className="text-gray-200">·</span>
          <Link href="/privacy" className="hover:text-[#C084FC] hover:underline">
            隐私政策
          </Link>
        </div>
      </footer>
    </div>
  );
}

function StatCell({
  icon,
  value,
  suffix,
  label,
  caption,
}: {
  icon: ReactNode;
  value: number;
  suffix?: string;
  label: string;
  caption: string;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF6B9D] to-[#C084FC] text-white shadow-md shadow-[#C084FC]/30">
        {icon}
      </div>
      <div className="bg-gradient-to-r from-[#FF6B9D] to-[#C084FC] bg-clip-text text-4xl font-black tracking-tight text-transparent sm:text-5xl">
        <AnimatedCounter target={value} suffix={suffix} />
      </div>
      <div className="mt-1 text-sm font-semibold text-gray-700 sm:text-base">
        {label}
      </div>
      <div className="mt-1 text-xs text-gray-400">{caption}</div>
    </div>
  );
}

function FlowerSVG({ size = 48 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 60 60"
      aria-hidden
      style={{ filter: "drop-shadow(0 4px 8px rgba(255,255,255,0.3))" }}
    >
      <g fill="white" fillOpacity="0.22">
        {[0, 60, 120, 180, 240, 300].map((angle) => (
          <ellipse
            key={angle}
            cx="30"
            cy="14"
            rx="7"
            ry="13"
            transform={`rotate(${angle} 30 30)`}
          />
        ))}
      </g>
      <circle cx="30" cy="30" r="5" fill="white" fillOpacity="0.4" />
    </svg>
  );
}

function BrushIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18.37 2.63 14 7l3 3 4.37-4.37a2.12 2.12 0 0 0-3-3Z" />
      <path d="M9 8a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2 5 5 0 0 0 5-5V8Z" />
      <path d="M14 7 6 15" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function PaletteIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="13.5" cy="6.5" r="1.2" fill="currentColor" />
      <circle cx="17.5" cy="10.5" r="1.2" fill="currentColor" />
      <circle cx="8.5" cy="7.5" r="1.2" fill="currentColor" />
      <circle cx="6.5" cy="12.5" r="1.2" fill="currentColor" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.5-.7 1.5-1.5v-1c0-.8.7-1.5 1.5-1.5H18c2.2 0 4-1.8 4-4 0-5.5-4.5-10-10-10Z" />
    </svg>
  );
}

function LightbulbIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="28"
      height="28"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
      <path d="M9 18h6" />
      <path d="M10 22h4" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="28"
      height="28"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.64 5.64l2.83 2.83M15.53 15.53l2.83 2.83M5.64 18.36l2.83-2.83M15.53 8.47l2.83-2.83" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
    </svg>
  );
}

function DressIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="28"
      height="28"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 3h8l-2 5 5 13H5l5-13-2-5Z" />
      <path d="M5 18q7 2 14 0" />
    </svg>
  );
}
