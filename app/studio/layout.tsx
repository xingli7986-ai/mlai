"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";
import "./studio.css";

type IconName =
  | "home"
  | "folder"
  | "grid"
  | "heart"
  | "bulb"
  | "book"
  | "pattern"
  | "shirt"
  | "settings"
  | "crown"
  | "search"
  | "bell"
  | "menu"
  | "chevron-right"
  | "chevron-down";

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
    case "home":
      return (
        <svg {...common}>
          <path d="M3 11.5 12 4l9 7.5" />
          <path d="M5 10.5V20h14v-9.5" />
          <path d="M10 20v-5h4v5" />
        </svg>
      );
    case "folder":
      return (
        <svg {...common}>
          <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
        </svg>
      );
    case "grid":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
      );
    case "heart":
      return (
        <svg {...common}>
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z" />
        </svg>
      );
    case "bulb":
      return (
        <svg {...common}>
          <path d="M9 18h6M10 21h4" />
          <path d="M12 3a6 6 0 0 0-4 10.5c.7.7 1.2 1.5 1.4 2.5h5.2c.2-1 .7-1.8 1.4-2.5A6 6 0 0 0 12 3Z" />
        </svg>
      );
    case "book":
      return (
        <svg {...common}>
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
        </svg>
      );
    case "pattern":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <circle cx="17.5" cy="6.5" r="3.5" />
          <path d="M14 14l3 3 4-4" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
        </svg>
      );
    case "shirt":
      return (
        <svg {...common}>
          <path d="M8 3 4 6l2 4 2-1v12h8V9l2 1 2-4-4-3-2 2c-.7.7-2.7.7-4 0L8 3Z" />
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
    case "chevron-right":
      return (
        <svg {...common}>
          <path d="M9 6l6 6-6 6" />
        </svg>
      );
    case "chevron-down":
      return (
        <svg {...common}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      );
  }
}

interface NavItem {
  label: string;
  href: string;
  icon: IconName;
  match?: (pathname: string) => boolean;
  badge?: string;
}

interface NavGroup {
  id: string;
  title: string;
  type: "list" | "expandable";
  items: NavItem[];
  defaultOpen?: boolean;
}

const NAV_GROUPS: NavGroup[] = [
  {
    id: "workspace",
    title: "工作台",
    type: "list",
    items: [
      { label: "工具首页", href: "/studio", icon: "home", match: (p) => p === "/studio" },
      { label: "我的项目", href: "/studio/projects", icon: "folder", match: (p) => p.startsWith("/studio/projects") },
      { label: "我的设计", href: "/studio/designs", icon: "grid", match: (p) => p.startsWith("/studio/designs") },
      { label: "设计师中心", href: "/studio/dashboard", icon: "crown", match: (p) => p.startsWith("/studio/dashboard") },
      { label: "发布设计", href: "/studio/publish", icon: "bulb", match: (p) => p.startsWith("/studio/publish") },
    ],
  },
  {
    id: "tools",
    title: "工具",
    type: "expandable",
    defaultOpen: true,
    items: [
      { label: "图案工作室", href: "/studio/pattern/generate", icon: "pattern", match: (p) => p.startsWith("/studio/pattern") },
      { label: "服装实验室", href: "/studio/fashion/sketch", icon: "shirt", match: (p) => p.startsWith("/studio/fashion") },
    ],
  },
  {
    id: "account",
    title: "账户",
    type: "list",
    items: [
      { label: "设置", href: "/studio/settings", icon: "settings", match: (p) => p.startsWith("/studio/settings") },
    ],
  },
];

const PATTERN_SUB: NavItem[] = [
  { label: "图案生成", href: "/studio/pattern/generate", icon: "pattern", match: (p) => p === "/studio/pattern/generate" },
  { label: "画风复刻", href: "/studio/pattern/style", icon: "pattern", match: (p) => p === "/studio/pattern/style" },
  { label: "四方连续", href: "/studio/pattern/seamless", icon: "pattern", match: (p) => p === "/studio/pattern/seamless" },
  { label: "图案融合", href: "/studio/pattern/fusion", icon: "pattern", match: (p) => p === "/studio/pattern/fusion" },
  { label: "工艺融合", href: "/studio/pattern/craft", icon: "pattern", match: (p) => p === "/studio/pattern/craft" },
  { label: "图案涂改", href: "/studio/pattern/edit", icon: "pattern", match: (p) => p === "/studio/pattern/edit" },
  { label: "图案变清晰", href: "/studio/pattern/upscale", icon: "pattern", match: (p) => p === "/studio/pattern/upscale" },
];

const FASHION_SUB: NavItem[] = [
  { label: "线稿生成", href: "/studio/fashion/sketch", icon: "shirt", match: (p) => p === "/studio/fashion/sketch" },
  { label: "线稿成款", href: "/studio/fashion/render", icon: "shirt", match: (p) => p === "/studio/fashion/render" },
  { label: "局部改款", href: "/studio/fashion/modify", icon: "shirt", match: (p) => p === "/studio/fashion/modify" },
  { label: "款式创新", href: "/studio/fashion/innovate", icon: "shirt", match: (p) => p === "/studio/fashion/innovate" },
  { label: "风格融合", href: "/studio/fashion/style-fusion", icon: "shirt", match: (p) => p === "/studio/fashion/style-fusion" },
  { label: "系列配色", href: "/studio/fashion/colorway", icon: "shirt", match: (p) => p === "/studio/fashion/colorway" },
  { label: "定向换色", href: "/studio/fashion/recolor", icon: "shirt", match: (p) => p === "/studio/fashion/recolor" },
  { label: "面料上身", href: "/studio/fashion/fabric", icon: "shirt", match: (p) => p === "/studio/fashion/fabric" },
  { label: "图案上身", href: "/studio/fashion/pattern", icon: "shirt", match: (p) => p === "/studio/fashion/pattern" },
];

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname() || "/studio";
  const [openTools, setOpenTools] = useState({
    pattern: pathname.startsWith("/studio/pattern"),
    fashion: pathname.startsWith("/studio/fashion") || pathname.startsWith("/studio/publish"),
  });
  const isActive = useMemo(
    () => (item: NavItem) => (item.match ? item.match(pathname) : pathname === item.href),
    [pathname]
  );

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <Link href="/studio" onClick={onNavigate}>
          <b>MaxLuLu</b>
          <span>AI Studio</span>
        </Link>
      </div>

      <div className="sidebar-scroll">
        {NAV_GROUPS.map((group) => (
          <div key={group.id} className="nav-group">
            <div className="group-label">{group.title}</div>
            {group.type === "list" &&
              group.items.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`nav-item${isActive(item) ? " is-active" : ""}`}
                  onClick={onNavigate}
                >
                  <Icon name={item.icon} />
                  <span>{item.label}</span>
                </Link>
              ))}
            {group.type === "expandable" &&
              group.items.map((item) => {
                const key = item.label.includes("图案") ? "pattern" : "fashion";
                const isOpen = openTools[key];
                const sub = key === "pattern" ? PATTERN_SUB : FASHION_SUB;
                const groupActive = item.match ? item.match(pathname) : false;
                return (
                  <div key={item.label}>
                    <button
                      type="button"
                      className={`nav-item is-row${groupActive ? " is-active" : ""}`}
                      onClick={() => setOpenTools((s) => ({ ...s, [key]: !s[key] }))}
                    >
                      <Icon name={item.icon} />
                      <span>{item.label}</span>
                      <Icon name={isOpen ? "chevron-down" : "chevron-right"} size={14} />
                    </button>
                    {isOpen && (
                      <div className="nav-sub">
                        {sub.map((s) => (
                          <Link
                            key={s.label}
                            href={s.href}
                            className={`nav-item is-sub${isActive(s) ? " is-active" : ""}`}
                            onClick={onNavigate}
                          >
                            <span className="dot" />
                            <span>{s.label}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        ))}
      </div>

      <Link href="/studio/join" className="designer-card" onClick={onNavigate}>
        <div className="dc-icon">
          <Icon name="crown" size={16} />
        </div>
        <div className="dc-body">
          <b>设计师计划</b>
          <small>设计师入驻 / 升级</small>
        </div>
        <Icon name="chevron-right" size={14} />
      </Link>
    </aside>
  );
}

export default function StudioLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "/studio";
  const [open, setOpen] = useState(false);

  // /studio/join is a public marketing page — render the minimal public shell
  // (no studio sidebar) per IA §2.4.
  if (pathname === "/studio/join") {
    return (
      <div className="studio-root studio-root--public">
        <header className="public-header">
          <Link href="/" className="public-header__brand" aria-label="MaxLuLu AI">
            <span className="brand-name">
              MaxLuLu <em>AI</em>
            </span>
          </Link>
          <nav className="public-header__nav">
            <Link href="/" className="public-link">返回首页</Link>
            <Link href="/login" className="public-link">登录</Link>
          </nav>
        </header>
        <main className="public-main">{children}</main>
      </div>
    );
  }

  return (
    <div className="studio-root">
      <header className="topbar">
        <div>
          <button
            className="hamburger"
            type="button"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
          >
            <Icon name="menu" />
          </button>
          <Link href="/studio" aria-label="MaxLuLu AI 设计工作室">
            <span className="brand-name">
              MaxLuLu <em>AI</em>
            </span>
            <span className="brand-sub">AI 设计工作室</span>
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
            + 新建项目
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
