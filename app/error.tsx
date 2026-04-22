"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Route error:", error);
  }, [error]);

  const message =
    typeof error?.message === "string" && error.message.length > 0
      ? error.message
      : "未知错误，请稍后再试";

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-white px-6 py-16 text-center">
      <div className="pointer-events-none absolute inset-x-0 top-24 -z-0 mx-auto h-72 w-72 rounded-full bg-gradient-to-br from-[#FF6B9D]/30 to-[#C084FC]/30 blur-3xl" />

      <div className="relative mb-6">
        <AlertIcon />
      </div>

      <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#FF6B9D]/10 to-[#C084FC]/10 px-4 py-1.5 text-xs font-medium text-[#C084FC]">
        Something went wrong
      </span>
      <h1 className="mt-4 bg-gradient-to-r from-[#FF6B9D] to-[#C084FC] bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
        哎呀，出了点问题
      </h1>
      <p className="mt-4 max-w-sm break-words text-sm text-gray-500 sm:text-base">
        {message}
      </p>
      {error?.digest && (
        <p className="mt-2 font-mono text-[11px] text-gray-300">
          digest: {error.digest}
        </p>
      )}

      <div className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-full bg-gradient-to-r from-[#FF6B9D] to-[#C084FC] px-8 py-3 text-base font-semibold text-white shadow-xl shadow-[#C084FC]/40 transition hover:-translate-y-0.5 hover:opacity-95"
        >
          重试
        </button>
        <Link
          href="/"
          className="rounded-full border border-gray-200 bg-white px-8 py-3 text-center text-base font-medium text-gray-700 transition hover:border-[#C084FC] hover:text-[#C084FC]"
        >
          返回首页
        </Link>
      </div>

      <p className="mt-12 bg-gradient-to-r from-[#FF6B9D] to-[#C084FC] bg-clip-text text-xs font-medium text-transparent">
        Fashion For You — 每一朵印花，都由你绽放
      </p>
    </main>
  );
}

function AlertIcon() {
  return (
    <svg
      viewBox="0 0 88 88"
      width="88"
      height="88"
      aria-hidden
      className="drop-shadow-[0_10px_30px_rgba(192,132,252,0.35)]"
    >
      <defs>
        <linearGradient id="alertGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF6B9D" />
          <stop offset="100%" stopColor="#C084FC" />
        </linearGradient>
      </defs>
      <circle cx="44" cy="44" r="40" fill="url(#alertGrad)" />
      <rect x="40" y="24" width="8" height="30" rx="4" fill="#ffffff" />
      <circle cx="44" cy="62" r="4" fill="#ffffff" />
    </svg>
  );
}
