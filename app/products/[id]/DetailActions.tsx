"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface CommentItem {
  id: string;
  content: string;
  rating: number | null;
  createdAt: string;
  user: { id: string; name: string; avatar: string | null };
}

interface Props {
  designId: string;
  initialLiked: boolean;
  initialFavorited: boolean;
  initialLikeCount: number;
  initialCommentCount: number;
  groupPrice: number;
  customPrice: number;
  slot: "top" | "body";
}

function fmtPrice(cents: number): string {
  if (!cents || cents <= 0) return "¥—";
  return `¥${cents.toLocaleString()}`;
}

const STATE_EVENT = "pdp-actions-state";

type SharedState = {
  liked: boolean;
  favorited: boolean;
  likeCount: number;
  commentTotal: number;
};

export default function DetailActions(props: Props) {
  const {
    designId,
    initialLiked,
    initialFavorited,
    initialLikeCount,
    initialCommentCount,
    groupPrice,
    customPrice,
    slot,
  } = props;

  const [liked, setLiked] = useState(initialLiked);
  const [favorited, setFavorited] = useState(initialFavorited);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [commentTotal, setCommentTotal] = useState(initialCommentCount);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  const [comments, setComments] = useState<CommentItem[]>([]);
  const [commentLoading, setCommentLoading] = useState(true);
  const [composer, setComposer] = useState("");
  const [posting, setPosting] = useState(false);
  const composerRef = useRef<HTMLTextAreaElement>(null);

  // Cross-instance sync: top + body slots both run as separate React trees,
  // so broadcast state changes through a CustomEvent on `window`.
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<SharedState & { from: number }>).detail;
      if (!detail) return;
      setLiked(detail.liked);
      setFavorited(detail.favorited);
      setLikeCount(detail.likeCount);
      setCommentTotal(detail.commentTotal);
    };
    window.addEventListener(STATE_EVENT, handler as EventListener);
    return () => window.removeEventListener(STATE_EVENT, handler as EventListener);
  }, []);

  function broadcast(next: Partial<SharedState>) {
    const detail: SharedState = {
      liked: next.liked ?? liked,
      favorited: next.favorited ?? favorited,
      likeCount: next.likeCount ?? likeCount,
      commentTotal: next.commentTotal ?? commentTotal,
    };
    window.dispatchEvent(new CustomEvent(STATE_EVENT, { detail }));
  }

  // Body slot owns the comments fetch.
  useEffect(() => {
    if (slot !== "body") return;
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`/api/designs/${designId}/comments?limit=20`, { cache: "no-store" });
        const data = await res.json();
        if (!alive) return;
        if (res.ok) {
          setComments(data.comments || []);
          setCommentTotal(data.total ?? 0);
          broadcast({ commentTotal: data.total ?? 0 });
        }
      } finally {
        if (alive) setCommentLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [designId, slot]);

  function flash(kind: "success" | "error", text: string) {
    setToast({ kind, text });
    setTimeout(() => setToast(null), 2400);
  }

  async function toggleLike() {
    if (busy) return;
    setBusy(true);
    const optimistic = !liked;
    const nextCount = Math.max(0, likeCount + (optimistic ? 1 : -1));
    setLiked(optimistic);
    setLikeCount(nextCount);
    broadcast({ liked: optimistic, likeCount: nextCount });
    try {
      const res = await fetch(`/api/designs/${designId}/like`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setLiked(!optimistic);
        setLikeCount(likeCount);
        broadcast({ liked: !optimistic, likeCount });
        flash("error", data.error || "请先登录");
        return;
      }
      setLiked(data.liked);
      setLikeCount(data.likeCount);
      broadcast({ liked: data.liked, likeCount: data.likeCount });
    } catch {
      setLiked(!optimistic);
      setLikeCount(likeCount);
      broadcast({ liked: !optimistic, likeCount });
      flash("error", "网络错误");
    } finally {
      setBusy(false);
    }
  }

  async function toggleFavorite() {
    if (busy) return;
    setBusy(true);
    const optimistic = !favorited;
    setFavorited(optimistic);
    broadcast({ favorited: optimistic });
    try {
      const res = await fetch(`/api/designs/${designId}/favorite`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setFavorited(!optimistic);
        broadcast({ favorited: !optimistic });
        flash("error", data.error || "请先登录");
        return;
      }
      setFavorited(data.favorited);
      broadcast({ favorited: data.favorited });
      flash("success", data.favorited ? "已加入衣橱" : "已取消收藏");
    } catch {
      setFavorited(!optimistic);
      broadcast({ favorited: !optimistic });
      flash("error", "网络错误");
    } finally {
      setBusy(false);
    }
  }

  async function postComment(e: React.FormEvent) {
    e.preventDefault();
    const content = composer.trim();
    if (!content || posting) return;
    setPosting(true);
    try {
      const res = await fetch(`/api/designs/${designId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (!res.ok) {
        flash("error", data.error || "评论失败");
        return;
      }
      setComments((cs) => [data.comment, ...cs]);
      const nextTotal = commentTotal + 1;
      setCommentTotal(nextTotal);
      broadcast({ commentTotal: nextTotal });
      setComposer("");
      composerRef.current?.blur();
      flash("success", "评论已发布");
    } catch {
      flash("error", "网络错误");
    } finally {
      setPosting(false);
    }
  }

  if (slot === "top") {
    return (
      <div className="pdpIcons">
        <button
          type="button"
          aria-label="点赞"
          onClick={toggleLike}
          disabled={busy}
          className={liked ? "is-on is-on--like" : ""}
        >
          {liked ? "♥" : "♡"} {likeCount}
        </button>
        <button
          type="button"
          aria-label="收藏"
          onClick={toggleFavorite}
          disabled={busy}
          className={favorited ? "is-on is-on--fav" : ""}
        >
          {favorited ? "★" : "☆"}
        </button>
        <button type="button" aria-label="分享">↗</button>
      </div>
    );
  }

  return (
    <>
      <section className="container pdpReviews" id="comments">
        <div className="pdpReviews__head">
          <p className="eyebrow">COMMENTS · 用户评论</p>
          <h2>评论 ({commentTotal})</h2>
        </div>

        <form onSubmit={postComment} className="pdpComposer">
          <textarea
            ref={composerRef}
            className="pdpComposer__input"
            placeholder="说说你对这件作品的看法…"
            value={composer}
            onChange={(e) => setComposer(e.target.value)}
            rows={3}
            maxLength={1000}
          />
          <div className="pdpComposer__foot">
            <span className="pdpComposer__count">{composer.length}/1000</span>
            <button
              type="submit"
              className="pdpCtaPrimary pdpCtaPrimary--sm"
              disabled={!composer.trim() || posting}
            >
              {posting ? "发布中…" : "发布评论"}
            </button>
          </div>
        </form>

        <div className="pdpReviewList">
          {commentLoading ? (
            <div className="pdpReviewEmpty">加载评论中…</div>
          ) : comments.length === 0 ? (
            <div className="pdpReviewEmpty">还没有评论，来抢沙发吧。</div>
          ) : (
            comments.map((c) => (
              <article key={c.id} className="pdpReview">
                <div className="pdpReview__head">
                  <span className="pdpReview__avatar">{c.user.name.slice(0, 1)}</span>
                  <div>
                    <b>{c.user.name}</b>
                    <small>{new Date(c.createdAt).toLocaleString("zh-CN")}</small>
                  </div>
                </div>
                <p>{c.content}</p>
              </article>
            ))
          )}
        </div>
      </section>

      <StickyBar
        designId={designId}
        groupPrice={groupPrice}
        customPrice={customPrice}
        favorited={favorited}
        onToggleFavorite={toggleFavorite}
        busy={busy}
      />

      {toast && (
        <div className={`pdpToast pdpToast--${toast.kind}`}>{toast.text}</div>
      )}
    </>
  );
}

function StickyBar({
  designId,
  groupPrice,
  customPrice,
  favorited,
  onToggleFavorite,
  busy,
}: {
  designId: string;
  groupPrice: number;
  customPrice: number;
  favorited: boolean;
  onToggleFavorite: () => void;
  busy: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted || typeof document === "undefined") return null;

  const node = (
    <div className="pdpSticky">
      <div className="pdpSticky__inner">
        <div className="pdpSticky__price">
          <small>起拼价</small>
          <b>{fmtPrice(groupPrice)}</b>
          <span>定制价 {fmtPrice(customPrice)}</span>
        </div>
        <div className="pdpSticky__cta">
          <button
            type="button"
            className={`pdpSticky__fav ${favorited ? "is-on" : ""}`}
            onClick={onToggleFavorite}
            disabled={busy}
            aria-label={favorited ? "已加入心愿单" : "加入心愿单"}
          >
            {favorited ? "★" : "☆"}
            <span>{favorited ? "已收藏" : "心愿单"}</span>
          </button>
          <Link href={`/products/${designId}/custom`} className="pdpSticky__btn pdpSticky__btn--ghost">
            个人定制
          </Link>
          <Link href={`/group-buy/${designId}`} className="pdpSticky__btn pdpSticky__btn--primary">
            立即参团
          </Link>
        </div>
      </div>
    </div>
  );

  return createPortal(node, document.body);
}
