"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const TABS = [
  { label: "图案工作室", href: "/studio", prefix: "/studio/pattern" },
  { label: "服装实验室", href: "/studio", prefix: "/studio/fashion" },
];

export default function StudioLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "/studio";

  function isActive(prefix: string): boolean {
    if (prefix === "/studio/pattern") return pathname.startsWith("/studio/pattern");
    if (prefix === "/studio/fashion") return pathname.startsWith("/studio/fashion");
    return false;
  }

  return (
    <div
      className="flex min-h-screen flex-col"
      style={{ backgroundColor: "#2D1B26", color: "#F4EFE6" }}
    >
      <header
        className="sticky top-0 z-40 backdrop-blur"
        style={{
          backgroundColor: "rgba(45,27,38,0.9)",
          borderBottom: "1px solid #44283A",
        }}
      >
        <nav className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link
            href="/studio"
            className="flex items-center gap-2 text-sm font-semibold tracking-tight sm:text-base"
          >
            <span
              className="inline-flex h-7 w-7 items-center justify-center rounded-md text-sm font-bold"
              style={{ backgroundColor: "#C8A875", color: "#2D1B26" }}
              aria-hidden
            >
              M
            </span>
            <span className="hidden sm:inline">MaxLuLu AI Studio</span>
            <span className="sm:hidden">Studio</span>
          </Link>

          <div className="flex items-center gap-4 sm:gap-8">
            {TABS.map((t) => {
              const active = isActive(t.prefix);
              return (
                <Link
                  key={t.label}
                  href={t.href}
                  className="relative py-1.5 text-xs font-medium transition sm:text-sm"
                  style={{ color: active ? "#C8A875" : "#987283" }}
                >
                  {t.label}
                  <span
                    className="absolute -bottom-[10px] left-0 right-0 h-[2px] rounded-full transition"
                    style={{ backgroundColor: active ? "#C8A875" : "transparent" }}
                  />
                </Link>
              );
            })}
          </div>

          <Link
            href="/"
            className="text-xs transition hover:opacity-80 sm:text-sm"
            style={{ color: "#987283" }}
          >
            返回首页
          </Link>
        </nav>
      </header>

      <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </div>
  );
}
