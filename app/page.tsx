"use client";

import Link from "next/link";
import Image from "next/image";
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

export default function HomePage() {
  const { data: session, status } = useSession();
  const isAuthed = status === "authenticated" && !!session;

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-black/5 bg-white/80 px-4 py-3 backdrop-blur sm:px-6 sm:py-4">
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

      <main className="relative flex flex-1 flex-col items-center justify-center px-5 py-10 text-center sm:px-6 sm:py-16">
        <div className="pointer-events-none absolute inset-x-0 top-20 -z-0 mx-auto h-72 w-72 rounded-full bg-gradient-to-br from-[#FF6B9D]/30 to-[#C084FC]/30 blur-3xl" />

        <span className="mb-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#FF6B9D]/10 to-[#C084FC]/10 px-4 py-1.5 text-xs font-medium text-[#C084FC] sm:mb-6">
          ✨ AI 印花设计平台
        </span>
        <h1 className="max-w-3xl bg-gradient-to-r from-[#FF6B9D] to-[#C084FC] bg-clip-text text-3xl font-bold leading-tight tracking-tight text-transparent sm:text-5xl md:text-6xl">
          AI 印花设计，为你而生
        </h1>
        <p className="mt-4 max-w-xl text-sm text-gray-500 sm:mt-5 sm:text-base md:text-lg">
          描述你想要的图案，AI 为你生成独一无二的印花裙
        </p>
        <div className="mt-8 flex w-full max-w-xs flex-col items-stretch gap-3 sm:mt-10 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-4">
          <Link
            href="/design"
            className="rounded-full bg-gradient-to-r from-[#FF6B9D] to-[#C084FC] px-6 py-3 text-center text-base font-semibold text-white shadow-xl shadow-[#C084FC]/40 transition hover:-translate-y-0.5 hover:opacity-95 sm:px-8 sm:py-3.5"
          >
            开始设计 →
          </Link>
          {!isAuthed && (
            <Link
              href="/login"
              className="rounded-full border border-gray-200 bg-white px-6 py-3 text-center text-base font-medium text-gray-700 transition hover:border-[#C084FC] hover:text-[#C084FC] sm:px-8 sm:py-3.5"
            >
              先去登录
            </Link>
          )}
        </div>

        <div className="mt-14 grid w-full max-w-4xl grid-cols-1 gap-4 sm:mt-20 sm:grid-cols-3">
          {[
            { t: "描述想法", d: "用一句话说出你想要的印花" },
            { t: "AI 生成", d: "数秒内获得多款设计方案" },
            { t: "定制上身", d: "选择裙型面料，直接下单" },
          ].map((f, i) => (
            <div
              key={f.t}
              className="rounded-2xl border border-gray-100 bg-white p-5 text-left shadow-sm"
            >
              <div className="mb-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#FF6B9D] to-[#C084FC] text-xs font-semibold text-white">
                {i + 1}
              </div>
              <div className="text-base font-semibold">{f.t}</div>
              <div className="mt-1 text-sm text-gray-500">{f.d}</div>
            </div>
          ))}
        </div>

        <section className="mt-16 w-full max-w-5xl text-left sm:mt-24">
          <div className="mb-4 flex items-end justify-between px-1">
            <div>
              <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                设计师们的灵感
              </h2>
              <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                来自社区的印花作品，横向滑动查看更多
              </p>
            </div>
            <span className="hidden text-xs text-gray-400 sm:block">
              ← 滑动 →
            </span>
          </div>
          <div className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
            {SHOWCASE.map((s, i) => (
              <div
                key={`${s.url}-${i}`}
                className="w-44 shrink-0 snap-start overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md sm:w-52"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                  <Image
                    src={s.url}
                    alt={s.title}
                    fill
                    sizes="(min-width: 640px) 208px, 176px"
                    loading="lazy"
                    className="object-cover"
                  />
                  <div className="absolute bottom-2 left-2 rounded-full bg-white/30 px-2 py-0.5 text-[10px] text-white backdrop-blur">
                    #{s.title}
                  </div>
                </div>
                <div className="p-3">
                  <div className="text-sm font-semibold text-gray-900">
                    {s.title}
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    MaxLuLu AI 原创印花
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

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
