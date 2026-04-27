"use client";

import { useState, useEffect, useRef } from "react";

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
}

export default function DetailActions({
  designId,
  initialLiked,
  initialFavorited,
  initialLikeCount,
  initialCommentCount,
}: Props) {
  const [liked, setLiked] = useState(initialLiked);
  const [favorited, setFavorited] = useState(initialFavorited);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  const [comments, setComments] = useState<CommentItem[]>([]);
  const [commentTotal, setCommentTotal] = useState(initialCommentCount);
  const [commentLoading, setCommentLoading] = useState(true);
  const [composer, setComposer] = useState("");
  const [posting, setPosting] = useState(false);
  const composerRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`/api/designs/${designId}/comments?limit=20`, { cache: "no-store" });
        const data = await res.json();
        if (!alive) return;
        if (res.ok) {
          setComments(data.comments || []);
          setCommentTotal(data.total ?? 0);
        }
      } finally {
        if (alive) setCommentLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [designId]);

  function flash(kind: "success" | "error", text: string) {
    setToast({ kind, text });
    setTimeout(() => setToast(null), 2400);
  }

  async function toggleLike() {
    if (busy) return;
    setBusy(true);
    const optimistic = !liked;
    setLiked(optimistic);
    setLikeCount((c) => Math.max(0, c + (optimistic ? 1 : -1)));
    try {
      const res = await fetch(`/api/designs/${designId}/like`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        // revert
        setLiked(!optimistic);
        setLikeCount((c) => Math.max(0, c + (optimistic ? -1 : 1)));
        flash("error", data.error || "请先登录");
        return;
      }
      setLiked(data.liked);
      setLikeCount(data.likeCount);
    } catch {
      setLiked(!optimistic);
      setLikeCount((c) => Math.max(0, c + (optimistic ? -1 : 1)));
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
    try {
      const res = await fetch(`/api/designs/${designId}/favorite`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setFavorited(!optimistic);
        flash("error", data.error || "请先登录");
        return;
      }
      setFavorited(data.favorited);
      flash("success", data.favorited ? "已加入衣橱" : "已取消收藏");
    } catch {
      setFavorited(!optimistic);
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
      setCommentTotal((c) => c + 1);
      setComposer("");
      composerRef.current?.blur();
      flash("success", "评论已发布");
    } catch {
      flash("error", "网络错误");
    } finally {
      setPosting(false);
    }
  }

  return (
    <>
      <div className="pdpIcons">
        <button
          type="button"
          aria-label="点赞"
          onClick={toggleLike}
          disabled={busy}
          style={{ color: liked ? "#7f1f2b" : undefined }}
        >
          {liked ? "♥" : "♡"} {likeCount}
        </button>
        <button
          type="button"
          aria-label="收藏"
          onClick={toggleFavorite}
          disabled={busy}
          style={{ color: favorited ? "#c9a36a" : undefined }}
        >
          {favorited ? "★" : "☆"}
        </button>
        <button type="button" aria-label="分享">↗</button>
      </div>

      {toast && (
        <div className={`ml-toast ml-toast--${toast.kind}`} style={{
          position: "fixed",
          bottom: 24,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 100,
        }}>
          {toast.text}
        </div>
      )}

      <section className="pdpReviews container" id="comments" style={{ marginTop: 32 }}>
        <div className="pdpReviews__head">
          <div>
            <p className="eyebrow">COMMENTS · 评论</p>
            <h2>评论 ({commentTotal})</h2>
          </div>
        </div>

        <form onSubmit={postComment} style={{ marginBottom: 18, display: "grid", gap: 8 }}>
          <textarea
            ref={composerRef}
            className="ml-textarea"
            placeholder="说说你对这件作品的看法…"
            value={composer}
            onChange={(e) => setComposer(e.target.value)}
            rows={3}
            maxLength={1000}
          />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="ml-caption">{composer.length}/1000</span>
            <button
              type="submit"
              className="ml-btn ml-btn--primary"
              disabled={!composer.trim() || posting}
            >
              {posting ? "发布中…" : "发布评论"}
            </button>
          </div>
        </form>

        <div className="pdpReviewList">
          {commentLoading ? (
            <div className="ml-toast">加载评论中…</div>
          ) : comments.length === 0 ? (
            <div className="ml-toast">还没有评论，来抢沙发吧。</div>
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
    </>
  );
}
