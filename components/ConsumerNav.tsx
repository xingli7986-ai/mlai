"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type NavLink = { href: string; label: string };

const NAV_LINKS: NavLink[] = [
  { href: "/products", label: "印花衣橱" },
  // 个性定制 → /products?intent=custom 让用户在 /products 上点击时
  // URL 真的变化、页面 effect 重跑，并触发 hero 引导提示。
  // IA §2.1 字面规定的目标也是 /products（"选款后进定制页"）。
  { href: "/products?intent=custom", label: "个性定制" },
  { href: "/products?sort=hot-group", label: "热拼专区" },
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
