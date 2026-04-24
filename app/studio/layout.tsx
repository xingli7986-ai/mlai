"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";

type IconName =
  | "dashboard"
  | "folder"
  | "image"
  | "heart"
  | "sparkles"
  | "book"
  | "settings"
  | "crown";

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (name) {
    case "dashboard":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7" height="9" rx="1.5" />
          <rect x="14" y="3" width="7" height="5" rx="1.5" />
          <rect x="14" y="12" width="7" height="9" rx="1.5" />
          <rect x="3" y="16" width="7" height="5" rx="1.5" />
        </svg>
      );
    case "folder":
      return (
        <svg {...common}>
          <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
        </svg>
      );
    case "image":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="9" cy="9" r="2" />
          <path d="m21 15-5-5L5 21" />
        </svg>
      );
    case "heart":
      return (
        <svg {...common}>
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z" />
        </svg>
      );
    case "sparkles":
      return (
        <svg {...common}>
          <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.64 5.64l2.83 2.83M15.53 15.53l2.83 2.83M5.64 18.36l2.83-2.83M15.53 8.47l2.83-2.83" />
        </svg>
      );
    case "book":
      return (
        <svg {...common}>
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
        </svg>
      );
    case "settings":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 0 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 0 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 0 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 0 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
        </svg>
      );
    case "crown":
      return (
        <svg {...common}>
          <path d="M3 7l4 5 5-8 5 8 4-5-2 12H5L3 7Z" />
        </svg>
      );
  }
}

interface NavItem {
  key: string;
  label: string;
  href: string;
  icon: IconName;
}

const NAV_ITEMS: NavItem[] = [
  { key: "dashboard", label: "Dashboard", href: "/studio", icon: "dashboard" },
  { key: "projects", label: "My Projects", href: "/studio", icon: "folder" },
  { key: "designs", label: "My Designs", href: "/my", icon: "image" },
  { key: "favorites", label: "Favorites", href: "/studio", icon: "heart" },
  { key: "inspiration", label: "Inspiration", href: "/studio", icon: "sparkles" },
  { key: "brand", label: "Brand Library", href: "/studio", icon: "book" },
  { key: "settings", label: "Settings", href: "/my", icon: "settings" },
];

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname() || "/studio";
  return (
    <aside
      className="flex h-full w-60 flex-col border-r"
      style={{ backgroundColor: "#1E1E1E", borderColor: "#2A2A2A" }}
    >
      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const active =
              item.key === "dashboard"
                ? pathname === "/studio"
                : false;
            return (
              <li key={item.key}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition"
                  style={{
                    color: active ? "#C8A875" : "#D8D7D3",
                    backgroundColor: active ? "rgba(200,168,117,0.08)" : "transparent",
                  }}
                >
                  <span
                    className="inline-flex h-5 w-5 items-center justify-center"
                    style={{ color: active ? "#C8A875" : "#D8D7D3" }}
                  >
                    <Icon name={item.icon} />
                  </span>
                  <span className="tracking-wide">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div
        className="mx-3 my-4 border-t"
        style={{ borderColor: "#2A2A2A" }}
      />

      <div className="px-5 pb-6">
        <div className="flex items-center gap-2" style={{ color: "#C8A875" }}>
          <Icon name="crown" size={16} />
          <span
            className="text-xs uppercase tracking-[0.2em]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Designer
          </span>
        </div>
        <p className="mt-1 text-xs" style={{ color: "#8A8A8A" }}>
          Premium toolkit
        </p>
      </div>
    </aside>
  );
}

export default function StudioLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div
      className="flex min-h-screen flex-col"
      style={{ backgroundColor: "#0C0C0F", color: "#F9F9FF" }}
    >
      <header
        className="sticky top-0 z-40 flex h-14 items-center justify-between border-b px-4 sm:h-[60px] sm:px-6"
        style={{
          backgroundColor: "rgba(12,12,15,0.92)",
          borderColor: "#2A2A2A",
          backdropFilter: "blur(10px)",
        }}
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg md:hidden"
            style={{ backgroundColor: "#1E1E1E", color: "#D8D7D3" }}
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          </button>
          <Link
            href="/studio"
            className="text-lg tracking-tight sm:text-xl"
            style={{ fontFamily: "var(--font-display)", color: "#F9F9FF" }}
          >
            MaxLuLu <span style={{ color: "#C8A875" }}>AI</span>
          </Link>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <button
            type="button"
            aria-label="Search"
            className="hidden h-9 w-9 items-center justify-center rounded-full sm:inline-flex"
            style={{ backgroundColor: "#1E1E1E", color: "#D8D7D3" }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3-3" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Notifications"
            className="hidden h-9 w-9 items-center justify-center rounded-full sm:inline-flex"
            style={{ backgroundColor: "#1E1E1E", color: "#D8D7D3" }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
          </button>
          <Link
            href="/my"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-xs font-medium"
            style={{ backgroundColor: "#C8A875", color: "#0C0C0F" }}
            aria-label="Account"
          >
            M
          </Link>
          <Link
            href="/studio/pattern/generate"
            className="hidden rounded-lg px-3.5 py-2 text-xs font-medium tracking-wide transition hover:opacity-90 sm:inline-flex"
            style={{ backgroundColor: "#C8A875", color: "#0C0C0F" }}
          >
            + New Project
          </Link>
        </div>
      </header>

      <div className="flex flex-1">
        <div className="hidden md:block">
          <Sidebar />
        </div>

        {mobileOpen && (
          <div
            className="fixed inset-0 z-50 md:hidden"
            role="dialog"
            aria-modal="true"
          >
            <div
              className="absolute inset-0"
              style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
              onClick={() => setMobileOpen(false)}
            />
            <div className="absolute inset-y-0 left-0">
              <Sidebar onNavigate={() => setMobileOpen(false)} />
            </div>
          </div>
        )}

        <main className="flex-1 px-4 py-6 sm:px-8 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
