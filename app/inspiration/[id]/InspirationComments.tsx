"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui";

interface CommentItem {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatar: string | null;
    isCertified: boolean;
  };
}

function fmtTime(ts: string): string {
  const d = new Date(ts);
  return d.toLocaleString("zh-CN", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function InspirationComments({ workId }: { workId: string }) {
  const [list, setList] = useState<CommentItem[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch(`/api/inspiration/${workId}/comments?limit=20`, { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => {
        if (alive && j.comments) setList(j.comments);
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [workId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const text = content.trim();
    if (!text || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/inspiration/${workId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });
      if (res.status === 401) {
        window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
        return;
      }
      const j = await res.json();
      if (j.comment) {
        setList((prev) => [j.comment, ...prev]);
        setContent("");
      } else {
        alert(j.error ?? "评论失败");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="container inspCommentsSection">
      <h2>评论 · {list.length}</h2>
      <form className="inspCommentForm" onSubmit={submit}>
        <textarea
          placeholder="留下你的想法 · 让创作者听到"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={1000}
        />
        <Button type="submit" variant="primary" size="md" loading={submitting}>
          发布
        </Button>
      </form>

      {loading ? (
        <p style={{ color: "var(--color-text-tertiary)", fontSize: 13 }}>加载评论中…</p>
      ) : list.length === 0 ? (
        <p style={{ color: "var(--color-text-tertiary)", fontSize: 13 }}>还没有评论,来抢沙发。</p>
      ) : (
        <ul className="inspCommentList" style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {list.map((c) => (
            <li key={c.id} className="inspComment">
              <span
                className={`inspComment__avatar${c.user.isCertified ? " is-certified-avatar" : ""}`}
                aria-hidden
              >
                {c.user.avatar ? (
                  <img src={c.user.avatar} alt={c.user.name} />
                ) : (
                  c.user.name.slice(0, 1)
                )}
              </span>
              <div className="inspComment__body">
                <div className="inspComment__head">
                  <span className="inspComment__name">{c.user.name}</span>
                  <span className="inspComment__date">{fmtTime(c.createdAt)}</span>
                </div>
                <p className="inspComment__content">{c.content}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
