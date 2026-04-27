"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { isAdmin } from "@/lib/admin";

type Section = "designs" | "group-buys" | "withdrawals";

interface AdminDesign {
  id: string;
  title: string;
  coverImages: string[];
  status: string;
  groupPrice: number;
  customPrice: number;
  createdAt: string;
  designer: { displayName: string; user: { phone: string } };
}
interface AdminGroupBuy {
  id: string;
  title: string;
  coverImage: string | null;
  groupPrice: number;
  designerName: string;
  targetCount: number;
  currentCount: number;
  orderCount: number;
  status: string;
  expiresAt: string;
}
interface AdminWithdrawal {
  id: string;
  amount: number;
  alipayAccount: string;
  status: string;
  createdAt: string;
  completedAt: string | null;
  designer: { displayName: string; user: { phone: string } };
}

function fmtMoney(cents: number): string {
  return `¥${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function AdminManagePage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const phone = (session?.user as { phone?: string } | undefined)?.phone;
  const admin = isAdmin(phone);

  const [section, setSection] = useState<Section>("designs");
  const [filter, setFilter] = useState("pending");
  const [designs, setDesigns] = useState<AdminDesign[]>([]);
  const [groupBuys, setGroupBuys] = useState<AdminGroupBuy[]>([]);
  const [withdrawals, setWithdrawals] = useState<AdminWithdrawal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (authStatus === "unauthenticated") router.replace("/login");
  }, [authStatus, router]);

  const load = useCallback(async () => {
    if (!admin) return;
    setLoading(true);
    setError(null);
    const path =
      section === "designs"
        ? `/api/admin/designs?status=${filter}`
        : section === "group-buys"
        ? `/api/admin/group-buys?status=${filter}`
        : `/api/admin/withdrawals?status=${filter}`;
    try {
      const res = await fetch(path, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "加载失败");
      if (section === "designs") setDesigns(data.designs || []);
      else if (section === "group-buys") setGroupBuys(data.groupBuys || []);
      else setWithdrawals(data.withdrawals || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, [admin, section, filter]);

  useEffect(() => {
    load();
  }, [load]);

  // Reset filter when switching sections.
  useEffect(() => {
    setFilter(section === "withdrawals" ? "pending" : section === "group-buys" ? "open" : "pending");
  }, [section]);

  function flash(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2400);
  }

  async function callAction(path: string, body: object, successMsg: string) {
    try {
      const res = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "操作失败");
      flash(successMsg);
      await load();
    } catch (err) {
      flash(err instanceof Error ? err.message : "操作失败");
    }
  }

  if (authStatus !== "authenticated") {
    return <main style={{ padding: 40 }}>验证登录中…</main>;
  }
  if (!admin) {
    return <main style={{ padding: 40 }}>无权访问</main>;
  }

  const filterChips =
    section === "designs"
      ? ["pending", "approved", "rejected", "all"]
      : section === "group-buys"
      ? ["open", "fulfilled", "expired", "all"]
      : ["pending", "processing", "completed", "rejected", "all"];

  return (
    <main style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px 80px" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, gap: 12, flexWrap: "wrap" }}>
        <h1 className="ml-h2">管理后台 · 审核与运营</h1>
        <Link href="/admin" className="ml-btn ml-btn--ghost">→ 订单管理</Link>
      </header>

      <div className="ml-tabs" style={{ marginBottom: 16 }}>
        {(["designs", "group-buys", "withdrawals"] as Section[]).map((s) => (
          <button
            key={s}
            type="button"
            className={`ml-tabs__item${section === s ? " is-active" : ""}`}
            onClick={() => setSection(s)}
          >
            {s === "designs" ? "设计审核" : s === "group-buys" ? "拼团管理" : "提现处理"}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {filterChips.map((f) => (
          <button
            key={f}
            type="button"
            className={`ml-chip${filter === f ? " is-active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {toast && (
        <div className="ml-toast ml-toast--success" style={{ marginBottom: 12 }}>{toast}</div>
      )}
      {error && <div className="ml-toast ml-toast--error" style={{ marginBottom: 12 }}>{error}</div>}

      {loading ? (
        <div className="ml-skeleton" style={{ height: 200 }} />
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {section === "designs" &&
            designs.map((d) => (
              <article key={d.id} className="ml-card" style={{ display: "grid", gridTemplateColumns: "80px 1fr auto", gap: 12, alignItems: "center" }}>
                <div style={{ width: 80, height: 100, borderRadius: 8, overflow: "hidden", background: "var(--ml-warm-gray)" }}>
                  {d.coverImages[0] && <img src={d.coverImages[0]} alt={d.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                </div>
                <div>
                  <b>{d.title}</b>
                  <div className="ml-caption">设计师 {d.designer.displayName} · {d.designer.user.phone}</div>
                  <div className="ml-caption">众定 {fmtMoney(d.groupPrice)} · 定制 {fmtMoney(d.customPrice)} · 状态 {d.status}</div>
                  <div className="ml-caption">提交于 {fmtDate(d.createdAt)}</div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    type="button"
                    className="ml-btn ml-btn--primary ml-btn--sm"
                    disabled={d.status === "approved"}
                    onClick={() => callAction("/api/admin/designs", { id: d.id, action: "approve" }, "已通过")}
                  >
                    通过
                  </button>
                  <button
                    type="button"
                    className="ml-btn ml-btn--ghost ml-btn--sm"
                    disabled={d.status === "rejected"}
                    onClick={() => callAction("/api/admin/designs", { id: d.id, action: "reject" }, "已拒绝")}
                  >
                    拒绝
                  </button>
                </div>
              </article>
            ))}

          {section === "group-buys" &&
            groupBuys.map((g) => (
              <article key={g.id} className="ml-card" style={{ display: "grid", gridTemplateColumns: "80px 1fr auto", gap: 12, alignItems: "center" }}>
                <div style={{ width: 80, height: 100, borderRadius: 8, overflow: "hidden", background: "var(--ml-warm-gray)" }}>
                  {g.coverImage && <img src={g.coverImage} alt={g.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                </div>
                <div>
                  <b>{g.title}</b>
                  <div className="ml-caption">设计师 {g.designerName} · 价 {fmtMoney(g.groupPrice)}</div>
                  <div className="ml-caption">已拼 {g.currentCount}/{g.targetCount} · 订单 {g.orderCount} · 状态 {g.status}</div>
                  <div className="ml-caption">截止 {fmtDate(g.expiresAt)}</div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    type="button"
                    className="ml-btn ml-btn--primary ml-btn--sm"
                    disabled={g.status === "fulfilled"}
                    onClick={() => callAction("/api/admin/group-buys", { id: g.id, action: "fulfill" }, "已成团")}
                  >
                    标成团
                  </button>
                  <button
                    type="button"
                    className="ml-btn ml-btn--ghost ml-btn--sm"
                    onClick={() => callAction("/api/admin/group-buys", { id: g.id, action: "extend", extendHours: 24 }, "已延长 24h")}
                  >
                    延长 24h
                  </button>
                  <button
                    type="button"
                    className="ml-btn ml-btn--sm"
                    disabled={g.status === "expired"}
                    onClick={() => callAction("/api/admin/group-buys", { id: g.id, action: "expire" }, "已结团并退款")}
                  >
                    结团退款
                  </button>
                </div>
              </article>
            ))}

          {section === "withdrawals" &&
            withdrawals.map((w) => (
              <article key={w.id} className="ml-card" style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "center" }}>
                <div>
                  <b>{w.designer.displayName}</b>
                  <div className="ml-caption">{w.designer.user.phone} · 支付宝 {w.alipayAccount}</div>
                  <div className="ml-caption">金额 <b style={{ color: "var(--ml-primary)" }}>{fmtMoney(w.amount)}</b> · 状态 {w.status}</div>
                  <div className="ml-caption">申请于 {fmtDate(w.createdAt)}{w.completedAt ? ` · 完成 ${fmtDate(w.completedAt)}` : ""}</div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    type="button"
                    className="ml-btn ml-btn--primary ml-btn--sm"
                    disabled={w.status !== "pending"}
                    onClick={() => callAction("/api/admin/withdrawals", { id: w.id, action: "approve" }, "已批准，状态进入处理中")}
                  >
                    批准
                  </button>
                  <button
                    type="button"
                    className="ml-btn ml-btn--gold ml-btn--sm"
                    disabled={w.status !== "processing"}
                    onClick={() => callAction("/api/admin/withdrawals", { id: w.id, action: "complete" }, "已完成转账")}
                  >
                    标完成
                  </button>
                  <button
                    type="button"
                    className="ml-btn ml-btn--ghost ml-btn--sm"
                    disabled={w.status === "completed" || w.status === "rejected"}
                    onClick={() => callAction("/api/admin/withdrawals", { id: w.id, action: "reject" }, "已拒绝并恢复余额")}
                  >
                    拒绝
                  </button>
                </div>
              </article>
            ))}

          {!loading && section === "designs" && designs.length === 0 && (
            <div className="ml-toast">没有符合条件的设计</div>
          )}
          {!loading && section === "group-buys" && groupBuys.length === 0 && (
            <div className="ml-toast">没有符合条件的拼团</div>
          )}
          {!loading && section === "withdrawals" && withdrawals.length === 0 && (
            <div className="ml-toast">没有符合条件的提现申请</div>
          )}
        </div>
      )}
    </main>
  );
}
