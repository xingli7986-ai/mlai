"use client";

import VerifiedBadge from "./VerifiedBadge";
import "./ui.css";

export type AuthorSignatureSize = "sm" | "md" | "lg";

interface Props {
  name: string;
  avatar?: string | null;
  isCertified?: boolean;
  /** sm = 卡片底署名(头像 24);md = 详情页(头像 40);lg = Hero 区(头像 56) */
  size?: AuthorSignatureSize;
  /** 显示 "by " 前缀(列表卡片用) */
  prefix?: boolean;
  /** 角标 chip 用全称还是短称 */
  certifiedLabel?: "短" | "全";
  className?: string;
}

/**
 * 作者署名 — 真版 99 md §2.4 / §8.5(AuthorSignature 组件)
 * 头像(认证用金圈) + 名字 + 认证 chip
 */
export default function AuthorSignature({
  name,
  avatar,
  isCertified = false,
  size = "md",
  prefix = false,
  certifiedLabel = "短",
  className = "",
}: Props) {
  const cls = ["ui-author", `ui-author--${size}`, className].filter(Boolean).join(" ");
  const avatarCls = `ui-author__avatar${isCertified ? " is-certified-avatar" : ""}`;
  const initial = name?.slice(0, 1) ?? "?";

  return (
    <span className={cls}>
      <span className={avatarCls} aria-hidden>
        {avatar ? (
          <img src={avatar} alt={name} className="ui-author__img" />
        ) : (
          <span className="ui-author__ph">{initial}</span>
        )}
      </span>
      <span className="ui-author__body">
        {prefix && <span className="ui-author__prefix">by </span>}
        <span className="ui-author__name">{name}</span>
        {isCertified && (
          <VerifiedBadge
            label={certifiedLabel === "全" ? "认证设计师" : "认证"}
            size={size === "lg" ? "md" : "sm"}
          />
        )}
      </span>
    </span>
  );
}
