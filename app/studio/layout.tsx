"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import "./studio.css";

type IconName =
  | "dashboard"
  | "folder"
  | "image"
  | "heart"
  | "sparkles"
  | "book"
  | "settings"
  | "crown"
  | "search"
  | "bell"
  | "menu";

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
    "aria-hidden": true,
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
    case "search":
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3-3" />
        </svg>
      );
    case "bell":
      return (
        <svg {...common}>
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
      );
    case "menu":
      return (
        <svg {...common}>
          <path d="M3 6h18M3 12h18M3 18h18" />
        </svg>
      );
  }
}

interface NavItem {
  label: string;
  href: string;
  icon: IconName;
  matcher: (pathname: string) => boolean;
}

const PRIMARY_NAV: NavItem[] = [
  {
    label: "Dashboard",
    href: "/studio",
    icon: "dashboard",
    matcher: (p) => p === "/studio",
  },
  {
    label: "My Projects",
    href: "/studio",
    icon: "folder",
    matcher: () => false,
  },
  {
    label: "My Designs",
    href: "/my",
    icon: "image",
    matcher: () => false,
  },
  {
    label: "Favorites",
    href: "/studio",
    icon: "heart",
    matcher: () => false,
  },
  {
    label: "Inspiration",
    href: "/studio",
    icon: "sparkles",
    matcher: () => false,
  },
  {
    label: "Brand Library",
    href: "/studio",
    icon: "book",
    matcher: () => false,
  },
  {
    label: "Settings",
    href: "/my",
    icon: "settings",
    matcher: () => false,
  },
];

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname() || "/studio";
  return (
    <aside className="sidebar">
      <div className="nav-group">
        <div className="group-label">Workspace</div>
        {PRIMARY_NAV.slice(0, 4).map((item) => {
          const active = item.matcher(pathname);
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`nav-item${active ? " is-active" : ""}`}
              onClick={onNavigate}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="nav-group">
        <div className="group-label">Discover</div>
        {PRIMARY_NAV.slice(4, 6).map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="nav-item"
            onClick={onNavigate}
          >
            <Icon name={item.icon} />
            <span>{item.label}</span>
          </Link>
        ))}
      </div>

      <div className="nav-group">
        <div className="group-label">Account</div>
        {PRIMARY_NAV.slice(6).map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="nav-item"
            onClick={onNavigate}
          >
            <Icon name={item.icon} />
            <span>{item.label}</span>
          </Link>
        ))}
      </div>

      <div className="designer-badge">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Icon name="crown" size={16} />
          <h4>Designer Plan</h4>
        </div>
        <p>开启设计师权益，解锁高级工具与收益分润。</p>
      </div>
    </aside>
  );
}

export default function StudioLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="studio-root">
      <header className="topbar">
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button
            className="hamburger"
            type="button"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
          >
            <Icon name="menu" />
          </button>
          <Link href="/studio" aria-label="MaxLuLu AI Studio">
            <span className="brand-name">
              MaxLuLu <em>AI</em>
            </span>
            <span className="brand-sub">AI Design Studio</span>
          </Link>
        </div>

        <div className="topbar-actions">
          <button type="button" className="icon-btn" aria-label="搜索">
            <Icon name="search" />
          </button>
          <button type="button" className="icon-btn" aria-label="通知">
            <Icon name="bell" />
          </button>
          <Link href="/my" className="avatar" aria-label="账户">
            M
          </Link>
          <Link href="/studio/pattern/generate" className="btn gold small">
            + New Project
          </Link>
        </div>
      </header>

      <div className="layout">
        <Sidebar />

        <div
          className="mobile-sidebar"
          data-open={open ? "true" : "false"}
          role="dialog"
          aria-modal="true"
        >
          <div className="scrim" onClick={() => setOpen(false)} />
          <Sidebar onNavigate={() => setOpen(false)} />
        </div>

        <main className="main">{children}</main>
      </div>
    </div>
  );
}
