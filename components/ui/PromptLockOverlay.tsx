"use client";

import type { ReactNode } from "react";
import Button from "./Button";
import "./ui.css";

export type PromptVisibility = "free" | "paid" | "private";

interface Props {
  visibility: PromptVisibility;
  /** 解锁价格(分) */
  unlockPrice?: number;
  /** 已解锁(免费 / 付费已解锁 / 作者本人) */
  unlocked: boolean;
  /** 解锁触发 — 业务层接 alipay 流程 */
  onUnlock?: () => void;
  /** loading 状态 — 支付跳转中 */
  loading?: boolean;
  /** unlocked=true 时显示的 prompt 内容 */
  children?: ReactNode;
  className?: string;
}

function fmtPrice(cents: number): string {
  return `¥${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`;
}

/**
 * Prompt 公开状态遮罩 — 真版 99 md §6.5
 * 三种状态:free(直接显示) / paid(模糊 + 解锁按钮)/ private(显示"作者未公开")
 * 同时显示锁图标 + 文案(真 md §8.7 可访问性:不只依赖模糊)
 */
export default function PromptLockOverlay({
  visibility,
  unlockPrice = 0,
  unlocked,
  onUnlock,
  loading = false,
  children,
  className = "",
}: Props) {
  if (unlocked && children) {
    return <div className={`ui-prompt-lock ui-prompt-lock--unlocked ${className}`.trim()}>{children}</div>;
  }

  if (visibility === "private") {
    return (
      <div className={`ui-prompt-lock ui-prompt-lock--private ${className}`.trim()}>
        <span className="ui-prompt-lock__icon" aria-hidden>
          ⊘
        </span>
        <p className="ui-prompt-lock__title">作者未公开</p>
        <p className="ui-prompt-lock__hint">仅作者可见,暂不支持查看 prompt</p>
      </div>
    );
  }

  if (visibility === "paid") {
    return (
      <div className={`ui-prompt-lock ui-prompt-lock--paid ${className}`.trim()}>
        <div className="ui-prompt-lock__blur" aria-hidden>
          {children ?? <p>· · · · · · · · · · · · · · · · · ·</p>}
        </div>
        <div className="ui-prompt-lock__veil">
          <span className="ui-prompt-lock__icon" aria-hidden>
            🔒
          </span>
          <p className="ui-prompt-lock__title">付费查看创作详情</p>
          <p className="ui-prompt-lock__hint">解锁后可见 prompt + 参数,30% 平台 / 70% 创作者</p>
          <Button
            variant="primary"
            size="md"
            onClick={onUnlock}
            loading={loading}
            loadingLabel="跳转支付中..."
          >
            {fmtPrice(unlockPrice)} 解锁
          </Button>
        </div>
      </div>
    );
  }

  // free 但没传 children — fallback
  return <div className={`ui-prompt-lock ui-prompt-lock--free ${className}`.trim()}>{children}</div>;
}
