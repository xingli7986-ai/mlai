"use client";

import type { ReactNode } from "react";
import "./ui.css";

interface Props {
  /** 是否启用认证视觉(false 时退化为普通卡 1px 描边) */
  certified: boolean;
  /** 角标文字,默认"认证";不显示传 null */
  ribbonLabel?: string | null;
  className?: string;
  children: ReactNode;
}

/**
 * 认证卡片外壳 — 真版 99 md §2.2 / §2.3 / §6.4
 * - certified=true:1.5px 金描边 + 右上角金底白字角标 + 微金光阴影
 * - certified=false:默认 1px #D2DEDF 描边
 * 复用四处:灵感广场卡片 / 印花衣橱卡片 / 详情页作者卡 / 评论头像不在此封装
 */
export default function CertifiedCardFrame({
  certified,
  ribbonLabel = "认证",
  className = "",
  children,
}: Props) {
  const cls = [
    "ui-certified-frame",
    certified ? "is-certified" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cls} data-ribbon={certified && ribbonLabel ? ribbonLabel : undefined}>
      {children}
    </div>
  );
}
