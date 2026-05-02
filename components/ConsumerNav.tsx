"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type NavLink = { href: string; label: string };

// 真版 01 稿顶栏 4 项:工作室 / 设计师 / 趋势 / 定价
// 这与 IA v1.2 §1.1 文字版本(印花衣橱 / 灵感广场 / 我的设计工作室 / 热拼专区)
// 不一致 — 以稿为准(用户:稿件没画的元素严禁发挥,有的元素严禁删除)。
// 路由映射(尽量落到现有路径,不新建 placeholder):
//   工作室   → /my-studio   (批次 2 上线;暂时 404)
//   设计师   → /studio       (existing 设计师入驻 / 列表)
//   趋势     → /inspiration  (灵感广场就是趋势汇)
//   定价     → /studio/join  (existing 设计师分润页)
const NAV_LINKS: NavLink[] = [
  { href: "/my-studio", label: "工作室" },
  { href: "/studio", label: "设计师" },
  { href: "/inspiration", label: "趋势" },
  { href: "/studio/join", label: "定价" },
];

export default function ConsumerNav({
  variant = "transparent",
}: {
  variant?: "transparent" | "solid";
}) {
  const pathname = usePathname() || "/";
  const [scrolled, setScrolled] = useState(variant === "solid");

  useEffect(() => {
    if (variant === "solid") return;
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [variant]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href.startsWith("/#")) return pathname === "/";
    const [path, query = ""] = href.split("?");
    if (pathname !== path && !pathname.startsWith(path + "/")) return false;
    // When two nav items share a path (e.g. /products vs /products?intent=custom),
    // disambiguate via the query string so the right item highlights.
    if (!query) return true;
    if (typeof window === "undefined") return true;
    const params = new URLSearchParams(window.location.search);
    const expected = new URLSearchParams(query);
    for (const [k, v] of expected) {
      if (params.get(k) !== v) return false;
    }
    return true;
  };

  return (
    <nav className={`nav${scrolled ? " scrolled" : ""}`}>
      <div className="container inner">
        <Link href="/" className="nav-logo">
          MaxLuLu <span className="ai">AI</span>
        </Link>
        <div className="nav-center">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className={isActive(l.href) ? "is-active" : ""}
            >
              {l.label}
            </Link>
          ))}
        </div>
        <div className="nav-right">
          <Link href="/my">会员</Link>
          <Link href="/my">我的衣橱</Link>
        </div>
      </div>
    </nav>
  );
}
