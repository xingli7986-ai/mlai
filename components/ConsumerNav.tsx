"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type NavLink = { href: string; label: string };

const NAV_LINKS: NavLink[] = [
  { href: "/products", label: "印花衣橱" },
  { href: "/products", label: "个性定制" },
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
    const path = href.split("?")[0];
    return pathname === path || pathname.startsWith(path + "/");
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
              key={l.href}
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
