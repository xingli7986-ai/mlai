"use client";

import { useState, useTransition } from "react";
import { Button, PromptLockOverlay } from "@/components/ui";
import type { PromptVisibility } from "@/components/ui";

interface Props {
  workId: string;
  initialLiked: boolean;
  initialFavorited: boolean;
  initialLikeCount: number;
  initialFavoriteCount: number;
  promptVisibility: PromptVisibility;
  unlockPrice: number;
  promptUnlocked: boolean;
  prompt?: string | null;
  params?: unknown;
}

export default function InspirationActions({
  workId,
  initialLiked,
  initialFavorited,
  initialLikeCount,
  initialFavoriteCount,
  promptVisibility,
  unlockPrice,
  promptUnlocked,
  prompt,
  params,
}: Props) {
  const [liked, setLiked] = useState(initialLiked);
  const [favorited, setFavorited] = useState(initialFavorited);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [favCount, setFavCount] = useState(initialFavoriteCount);
  const [unlocked, setUnlocked] = useState(promptUnlocked);
  const [unlocking, startUnlock] = useTransition();

  async function toggleLike() {
    const res = await fetch(`/api/inspiration/${workId}/like`, { method: "POST" });
    if (res.status === 401) {
      window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
      return;
    }
    const j = await res.json();
    if (typeof j.likeCount === "number") {
      setLiked(!!j.liked);
      setLikeCount(j.likeCount);
    }
  }
  async function toggleFav() {
    const res = await fetch(`/api/inspiration/${workId}/favorite`, { method: "POST" });
    if (res.status === 401) {
      window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
      return;
    }
    const j = await res.json();
    if (typeof j.favoriteCount === "number") {
      setFavorited(!!j.favorited);
      setFavCount(j.favoriteCount);
    }
  }
  function onUnlock() {
    startUnlock(async () => {
      const res = await fetch(`/api/inspiration/${workId}/unlock-prompt`, { method: "POST" });
      if (res.status === 401) {
        window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
        return;
      }
      const j = await res.json();
      if (j.unlocked) {
        setUnlocked(true);
        // 重新取一次详情拿 prompt
        location.reload();
        return;
      }
      if (j.formHtml) {
        // alipay form — 内嵌一个临时 div,提交跳支付宝
        const wrap = document.createElement("div");
        wrap.innerHTML = j.formHtml;
        document.body.appendChild(wrap);
        const form = wrap.querySelector("form");
        form?.submit();
        return;
      }
      alert(j.error ?? "解锁失败,请稍后再试");
    });
  }
  function onGroupBuy() {
    alert("发起团购功能开发中,敬请期待");
  }

  return (
    <>
      <div className="inspMetrics">
        <div className="inspMetric"><b>{likeCount}</b><small>♡ 喜欢</small></div>
        <div className="inspMetric"><b>{favCount}</b><small>★ 收藏</small></div>
        <div className="inspMetric"><b>0</b><small>解锁</small></div>
        <div className="inspMetric"><b>0</b><small>评论</small></div>
      </div>

      <div className="inspActions">
        <button type="button" className={`inspActionBtn ${liked ? "is-on" : ""}`} onClick={toggleLike}>
          {liked ? "♥" : "♡"} {liked ? "已喜欢" : "喜欢"}
        </button>
        <button type="button" className={`inspActionBtn ${favorited ? "is-on" : ""}`} onClick={toggleFav}>
          ★ {favorited ? "已收藏" : "收藏"}
        </button>
        <button type="button" className="inspActionBtn" onClick={() => navigator.clipboard?.writeText(window.location.href)}>
          ↗ 分享
        </button>
      </div>

      <div className="inspPromptSection">
        <p className="inspPromptSection__title">PROMPT · 创作详情</p>
        <PromptLockOverlay
          visibility={promptVisibility}
          unlockPrice={unlockPrice}
          unlocked={unlocked && !!prompt}
          loading={unlocking}
          onUnlock={onUnlock}
        >
          {unlocked && prompt && (
            <>
              <p className="inspPromptText">{prompt}</p>
              {params != null && (
                <p className="inspParams">参数 · {JSON.stringify(params)}</p>
              )}
            </>
          )}
        </PromptLockOverlay>
      </div>

      <div className="inspCtaStack">
        <Button as="a" href={`/products?intent=custom&from=${workId}`} variant="primary" size="lg" block>
          基于这个改造
        </Button>
        <Button variant="secondary" size="lg" block onClick={onGroupBuy}>
          发起团购
        </Button>
        {promptVisibility === "paid" && !unlocked && (
          <Button variant="ghost" size="lg" block onClick={onUnlock}>
            ¥{(unlockPrice / 100).toFixed(0)} 解锁详情
          </Button>
        )}
      </div>

      {/* Mobile sticky bottom CTA */}
      <div className="inspStickyCta">
        <Button as="a" href={`/products?intent=custom&from=${workId}`} variant="primary" size="md">
          基于这个改造
        </Button>
        <Button variant="secondary" size="md" onClick={onGroupBuy}>
          发起团购
        </Button>
      </div>
    </>
  );
}

