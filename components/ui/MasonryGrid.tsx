"use client";

import type { ReactNode } from "react";
import "./ui.css";

interface Props {
  /** 列数:可传 number(全断点同) 或 { desktop, tablet, mobile } */
  columns?:
    | number
    | { desktop?: number; tablet?: number; mobile?: number };
  /** 列间距(px),默认 24 */
  gap?: number;
  /** 移动列间距(px),默认 12 */
  gapMobile?: number;
  className?: string;
  children: ReactNode;
}

/**
 * 瀑布流 / 等高网格容器 — 真版 99 md §8.5(MasonryGrid 组件)
 *
 * 用 CSS Grid 模拟瀑布流(等列宽、行内对齐),不做 column-count Pinterest 那种
 * 不规则瀑布(后者图片排版会跨列错位,与 02 印花衣橱稿不一致)。
 *
 * 默认:桌面 4 列 / 平板 3 列 / 移动 2 列 — 与 /inspiration 真稿一致。
 */
export default function MasonryGrid({
  columns = { desktop: 4, tablet: 3, mobile: 2 },
  gap = 24,
  gapMobile = 12,
  className = "",
  children,
}: Props) {
  const desktop = typeof columns === "number" ? columns : columns.desktop ?? 4;
  const tablet = typeof columns === "number" ? columns : columns.tablet ?? 3;
  const mobile = typeof columns === "number" ? columns : columns.mobile ?? 2;

  const style = {
    "--ui-masonry-cols-desktop": desktop,
    "--ui-masonry-cols-tablet": tablet,
    "--ui-masonry-cols-mobile": mobile,
    "--ui-masonry-gap": `${gap}px`,
    "--ui-masonry-gap-mobile": `${gapMobile}px`,
  } as React.CSSProperties;

  return (
    <div className={`ui-masonry ${className}`.trim()} style={style}>
      {children}
    </div>
  );
}
