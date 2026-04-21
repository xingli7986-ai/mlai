"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

const SHOWCASE = [
  {
    user: "lulu_chan",
    tag: "花卉",
    desc: "午后樱花与薄雾，粉调渐变",
    gradient: "from-[#FF6B9D] to-[#C084FC]",
  },
  {
    user: "mochi.design",
    tag: "水彩",
    desc: "抽象水墨山水，留白呼吸",
    gradient: "from-[#6BC5FF] to-[#C084FC]",
  },
  {
    user: "velvet_rose",
    tag: "复古",
    desc: "复古邮票拼贴风，琥珀调",
    gradient: "from-[#FFB86B] to-[#FF6B9D]",
  },
  {
    user: "xiaoxi",
    tag: "热带",
    desc: "夏日热带雨林，大叶植物剪影",
    gradient: "from-[#6BE3A7] to-[#6BC5FF]",
  },
  {
    user: "starry_petals",
    tag: "波普",
    desc: "波普漫画闪电，撞色黄黑",
    gradient: "from-[#FFE56B] to-[#FF6B9D]",
  },
  {
    user: "indigo_bloom",
    tag: "极简",
    desc: "极简几何矩阵，灰调冷静",
    gradient: "from-[#A78BFA] to-[#374151]",
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
            {SHOWCASE.map((s) => (
              <div
                key={s.user}
                className="w-44 shrink-0 snap-start overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md sm:w-52"
              >
                <div
                  className={`relative aspect-[3/4] bg-gradient-to-br ${s.gradient}`}
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.35),transparent_60%)]" />
                  <div className="absolute bottom-2 left-2 rounded-full bg-white/30 px-2 py-0.5 text-[10px] text-white backdrop-blur">
                    #{s.tag}
                  </div>
                </div>
                <div className="p-3">
                  <div className="text-sm font-semibold text-gray-900">
                    @{s.user}
                  </div>
                  <div className="mt-1 line-clamp-2 text-xs text-gray-500">
                    {s.desc}
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
      </footer>
    </div>
  );
}
