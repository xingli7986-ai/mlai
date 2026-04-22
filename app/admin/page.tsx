"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { isAdmin } from "@/lib/admin";
import {
  FABRIC_LABEL,
  ORDER_STATUS_LABEL,
  SKIRT_LABEL,
} from "@/lib/constants";

type AdminOrder = {
  id: string;
  designId: string;
  userId: string;
  skirtType: string;
  fabric: string;
  size: string;
  price: number;
  status: string;
  createdAt: string;
  user: { phone: string; name: string | null };
  design: { prompt: string; selectedImage: string | null };
};

const TABS = [
  { id: "all", label: "全部" },
  { id: "pending", label: "待付款" },
  { id: "paid", label: "待发货" },
  { id: "shipped", label: "已发货" },
  { id: "completed", label: "已完成" },
  { id: "cancelled", label: "已取消" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const STATUS_CLASSNAME: Record<string, string> = {
  pending: "bg-amber-50 text-amber-600",
  paid: "bg-sky-50 text-sky-600",
  shipped: "bg-indigo-50 text-indigo-600",
  completed: "bg-emerald-50 text-emerald-600",
  cancelled: "bg-gray-100 text-gray-500",
};

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export default function AdminOrdersPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const phone = (session?.user as { phone?: string } | undefined)?.phone;
  const admin = isAdmin(phone);

  const [tab, setTab] = useState<TabId>("all");
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [shippingId, setShippingId] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (authStatus === "unauthenticated") router.replace("/login");
  }, [authStatus, router]);

  useEffect(() => {
    if (authStatus !== "authenticated") return;
    if (admin) return;
    const t = window.setTimeout(() => router.replace("/"), 1800);
    return () => window.clearTimeout(t);
  }, [authStatus, admin, router]);

  const fetchOrders = useCallback(async (t: TabId) => {
    setLoading(true);
    setLoadError("");
    try {
      const url =
        t === "all"
          ? "/api/admin/orders"
          : `/api/admin/orders?status=${t}`;
      const res = await fetch(url, { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof data?.error === "string" ? data.error : "加载订单失败"
        );
      }
      setOrders(Array.isArray(data.orders) ? data.orders : []);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "加载订单失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard data-fetching pattern
    if (authStatus === "authenticated" && admin) fetchOrders(tab);
  }, [authStatus, admin, tab, fetchOrders]);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2400);
  }

  async function handleShip(orderId: string) {
    if (shippingId) return;
    if (
      typeof window !== "undefined" &&
      !window.confirm("确认将该订单标记为已发货？")
    ) {
      return;
    }
    setShippingId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/ship`, {
        method: "PATCH",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) {
        throw new Error(
          typeof data?.error === "string" ? data.error : "发货失败"
        );
      }
      await fetchOrders(tab);
      showToast("订单已标记为已发货 🚚");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "发货失败");
    } finally {
      setShippingId(null);
    }
  }

  if (authStatus !== "authenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-sm text-gray-400">
        加载中...
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 text-3xl">
          🔒
        </div>
        <h1 className="bg-gradient-to-r from-[#FF6B9D] to-[#C084FC] bg-clip-text text-2xl font-bold text-transparent">
          无权限
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          此页面仅限管理员访问，即将为你跳转到首页...
        </p>
        <Link
          href="/"
          className="mt-6 rounded-full bg-gradient-to-r from-[#FF6B9D] to-[#C084FC] px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#C084FC]/30"
        >
          立即返回首页
        </Link>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-white">
      {toast && (
        <div className="pointer-events-none fixed left-1/2 top-6 z-50 -translate-x-1/2">
          <div className="rounded-full bg-gradient-to-r from-[#FF6B9D] to-[#C084FC] px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-[#C084FC]/40">
            {toast}
          </div>
        </div>
      )}

      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-black/5 bg-white/80 px-4 py-3 backdrop-blur sm:px-6 sm:py-4">
        <Link
          href="/my"
          title="返回"
          className="flex items-center gap-1.5 sm:gap-2"
        >
          <span aria-hidden className="text-gray-400">
            ←
          </span>
          <span className="h-7 w-7 rounded-xl bg-gradient-to-br from-[#FF6B9D] to-[#C084FC] sm:h-8 sm:w-8" />
          <span className="text-base font-semibold tracking-tight sm:text-lg">
            MaxLuLu <span className="text-[#C084FC]">AI</span>
          </span>
        </Link>
        <span className="rounded-full border border-[#C084FC]/40 bg-[#C084FC]/10 px-3 py-1 text-xs font-medium text-[#C084FC]">
          ADMIN
        </span>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 sm:py-10">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
              订单管理
            </h1>
            <p className="mt-1 text-xs text-gray-500">
              {loading ? "加载中..." : `共 ${orders.length} 笔订单`}
            </p>
          </div>
        </div>

        <div className="sticky top-14 z-[5] -mx-4 mb-4 overflow-x-auto border-b border-gray-100 bg-white/80 px-4 backdrop-blur sm:top-[72px] sm:-mx-6 sm:px-6">
          <nav className="flex min-w-max items-center gap-1 sm:gap-2">
            {TABS.map((t) => {
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`relative shrink-0 px-3 py-3 text-sm font-medium transition sm:px-4 ${
                    active
                      ? "text-[#C084FC]"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  {t.label}
                  {active && (
                    <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-gradient-to-r from-[#FF6B9D] to-[#C084FC]" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {loadError ? (
          <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">
            {loadError}
          </p>
        ) : loading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-28 animate-pulse rounded-2xl bg-gray-100"
              />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-10 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF6B9D]/10 to-[#C084FC]/10 text-2xl">
              📦
            </div>
            <div className="text-sm text-gray-500">该 Tab 下暂无订单</div>
          </div>
        ) : (
          <ul className="space-y-3">
            {orders.map((o) => {
              const statusText = ORDER_STATUS_LABEL[o.status] ?? o.status;
              const statusClass =
                STATUS_CLASSNAME[o.status] ?? "bg-gray-100 text-gray-500";
              return (
                <li
                  key={o.id}
                  className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:border-[#C084FC]/40 hover:shadow-md"
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-[#FF6B9D]/10 to-[#C084FC]/10 sm:h-24 sm:w-24">
                      {o.design.selectedImage ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={o.design.selectedImage}
                          alt="印花"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px] text-gray-400">
                          图片缺失
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="font-mono text-xs text-gray-400">
                          #{o.id.slice(0, 8)}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusClass}`}
                        >
                          {statusText}
                        </span>
                      </div>
                      <div className="mt-1 truncate text-sm font-semibold">
                        {SKIRT_LABEL[o.skirtType] ?? o.skirtType} ·{" "}
                        {FABRIC_LABEL[o.fabric] ?? o.fabric} · {o.size}
                      </div>
                      <div className="mt-1 truncate text-xs text-gray-500">
                        {o.design.prompt}
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-400">
                        <span>👤 {o.user.phone}</span>
                        <span>⏰ {formatDate(o.createdAt)}</span>
                      </div>
                    </div>
                    <div className="hidden shrink-0 text-right sm:block">
                      <div className="bg-gradient-to-r from-[#FF6B9D] to-[#C084FC] bg-clip-text text-lg font-bold text-transparent">
                        ¥ {o.price}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3 border-t border-gray-100 pt-3">
                    <div className="flex items-center gap-3 sm:hidden">
                      <div className="bg-gradient-to-r from-[#FF6B9D] to-[#C084FC] bg-clip-text text-base font-bold text-transparent">
                        ¥ {o.price}
                      </div>
                    </div>
                    <div className="hidden text-[11px] text-gray-400 sm:block">
                      用户 ID: <span className="font-mono">{o.userId.slice(-8)}</span>
                    </div>
                    {o.status === "paid" ? (
                      <button
                        type="button"
                        onClick={() => handleShip(o.id)}
                        disabled={shippingId === o.id}
                        className="rounded-full bg-gradient-to-r from-[#FF6B9D] to-[#C084FC] px-5 py-1.5 text-xs font-semibold text-white shadow-md shadow-[#C084FC]/30 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {shippingId === o.id ? "发货中..." : "🚚 标记发货"}
                      </button>
                    ) : (
                      <span className="text-[11px] text-gray-300">
                        {o.status === "pending" && "等待用户付款"}
                        {o.status === "shipped" && "已发货，等待用户收货"}
                        {o.status === "completed" && "订单已完成"}
                        {o.status === "cancelled" && "订单已取消"}
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}
