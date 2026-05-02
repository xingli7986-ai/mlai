"use client";

import "./ui.css";

export type VerifiedBadgeSize = "xs" | "sm" | "md";

interface Props {
  /** "认证" / "认证设计师" / 自定义文字 */
  label?: string;
  size?: VerifiedBadgeSize;
  className?: string;
}

/**
 * 认证设计师徽章 — 真版 99 md §02 / §6.3
 * 金底白字胶囊。size:xs(高 16) / sm(高 20) / md(高 24)
 */
export default function VerifiedBadge({
  label = "认证",
  size = "sm",
  className = "",
}: Props) {
  return (
    <span
      className={`ui-verified ui-verified--${size} ${className}`.trim()}
      role="img"
      aria-label="认证设计师"
    >
      {label}
    </span>
  );
}
