"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  FABRIC_LABEL,
  ORDER_STATUS_LABEL,
  SKIRT_LABEL,
} from "@/lib/constants";

type OrderWithDesign = {
  id: string;
  designId: string;
  skirtType: string;
  fabric: string;
  size: string;
  price: number;
  status: string;
  createdAt: string;
  design: {
    prompt: string;
    selectedImage: string | null;
    images: string[];
  };
};

const TABS = [
  { id: "all", label: "全部" },
  { id: "pending", label: "待付款" },
  { id: "paid", label: "待发货" },
  { id: "shipped", label: "已发货" },
  { id: "completed", label: "已完成" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const EMPTY_TEXT: Record<TabId, string> = {
  all: "还没有任何订单",
  pending: "没有待付款的订单",
  paid: "没有待发货的订单",
  shipped: "没有已发货的订单",
  completed: "没有已完成的订单",
};

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

export default function OrdersPage() {
  const { status: authStatus } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState<TabId>(() => {
    if (typeof window === "undefined") return "all";
    const q = new URLSearchParams(window.location.search).get("tab");
    const valid = TABS.find((t) => t.id === q);
    return valid ? valid.id : "all";
  });
  const [orders, setOrders] = useState<OrderWithDesign[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [toast, setToast] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  useEffect(() => {
    if (authStatus === "unauthenticated") router.replace("/login");
  }, [authStatus, router]);

  const fetchOrders = useCallback(async (t: TabId) => {
    setLoading(true);
    setLoadError("");
    try {
      const url =
        t === "all" ? "/api/orders/list" : `/api/orders/list?status=${t}`;
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
    if (authStatus === "authenticated") fetchOrders(tab);
  }, [authStatus, tab, fetchOrders]);

  async function handleStatusChange(
    orderId: string,
    newStatus: string,
    successMsg: string
  ) {
    if (actionLoadingId) return;
    setActionLoadingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) {
        throw new Error(
          typeof data?.error === "string" ? data.error : "操作失败"
        );
      }
      await fetchOrders(tab);
      showToast(successMsg);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "操作失败");
    } finally {
      setActionLoadingId(null);
    }
  }

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2400);
  }

  if (authStatus !== "authenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-sm text-gray-400">
        加载中...
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
        <Link
          href="/design"
          className="rounded-full bg-gradient-to-r from-[#FF6B9D] to-[#C084FC] px-4 py-1.5 text-sm font-medium text-white shadow-md shadow-[#C084FC]/30 transition hover:opacity-95 sm:px-5 sm:py-2"
        >
          开始设计
        </Link>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 sm:px-6 sm:py-10">
        <div className="mb-4 flex items-end justify-between">
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            我的订单
          </h1>
          <div className="text-xs text-gray-500">
            {loading ? "加载中..." : `共 ${orders.length} 笔`}
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
            <div className="text-base font-semibold">{EMPTY_TEXT[tab]}</div>
            <div className="mt-1 text-sm text-gray-500">
              去设计一件专属裙装吧
            </div>
            <Link
              href="/design"
              className="mt-5 inline-block rounded-full bg-gradient-to-r from-[#FF6B9D] to-[#C084FC] px-6 py-2 text-sm font-medium text-white shadow-md shadow-[#C084FC]/30 transition hover:opacity-95"
            >
              开始设计
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {orders.map((o) => (
              <OrderCard
                key={o.id}
                order={o}
                loading={actionLoadingId === o.id}
                onPay={() => handleStatusChange(o.id, "paid", "支付成功")}
                onCancel={() => {
                  if (
                    typeof window !== "undefined" &&
                    !window.confirm("确定取消订单吗？")
                  ) {
                    return;
                  }
                  handleStatusChange(o.id, "cancelled", "订单已取消");
                }}
                onRemindShip={() => showToast("已通知商家尽快发货 📦")}
                onConfirmReceive={() =>
                  handleStatusChange(o.id, "completed", "已确认收货")
                }
                onReorder={() =>
                  router.push(
                    o.designId ? `/design?designId=${o.designId}` : "/design"
                  )
                }
              />
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const text = ORDER_STATUS_LABEL[status] ?? status;
  const className = STATUS_CLASSNAME[status] ?? "bg-gray-100 text-gray-500";
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${className}`}
    >
      {text}
    </span>
  );
}

function OrderCard({
  order,
  loading,
  onPay,
  onCancel,
  onRemindShip,
  onConfirmReceive,
  onReorder,
}: {
  order: OrderWithDesign;
  loading: boolean;
  onPay: () => void;
  onCancel: () => void;
  onRemindShip: () => void;
  onConfirmReceive: () => void;
  onReorder: () => void;
}) {
  return (
    <li className="relative rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:border-[#C084FC]/40 hover:shadow-md">
      <Link
        href={`/my/orders/${order.id}`}
        aria-label={`订单详情 #${order.id.slice(-6)}`}
        className="absolute inset-0 z-0 rounded-2xl"
      />
      <div className="pointer-events-none relative flex items-start gap-3 sm:items-center sm:gap-4">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-[#FF6B9D]/10 to-[#C084FC]/10 sm:h-20 sm:w-20">
          {order.design.selectedImage ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={order.design.selectedImage}
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
            <span className="truncate text-sm font-semibold">
              {SKIRT_LABEL[order.skirtType] ?? order.skirtType} ·{" "}
              {FABRIC_LABEL[order.fabric] ?? order.fabric} · {order.size}
            </span>
            <StatusPill status={order.status} />
          </div>
          <div className="mt-1 truncate text-xs text-gray-500">
            {order.design.prompt}
          </div>
          <div className="mt-1.5 text-[11px] text-gray-400">
            {formatDate(order.createdAt)}
          </div>
        </div>
        <div className="hidden shrink-0 text-right sm:block">
          <div className="bg-gradient-to-r from-[#FF6B9D] to-[#C084FC] bg-clip-text text-lg font-bold text-transparent">
            ¥ {order.price}
          </div>
          <div className="mt-0.5 text-[10px] text-gray-400">
            #{order.id.slice(-6)}
          </div>
        </div>
      </div>

      <div className="relative z-10 mt-3 flex items-center justify-between gap-3 border-t border-gray-100 pt-3">
        <div className="pointer-events-none flex items-center gap-3 sm:hidden">
          <span className="text-[11px] text-gray-400">
            #{order.id.slice(-6)}
          </span>
          <div className="bg-gradient-to-r from-[#FF6B9D] to-[#C084FC] bg-clip-text text-base font-bold text-transparent">
            ¥ {order.price}
          </div>
        </div>
        <div className="pointer-events-none hidden text-[11px] text-gray-400 sm:block">
          点击卡片查看详情
        </div>
        <OrderActions
          status={order.status}
          loading={loading}
          onPay={onPay}
          onCancel={onCancel}
          onRemindShip={onRemindShip}
          onConfirmReceive={onConfirmReceive}
          onReorder={onReorder}
        />
      </div>
    </li>
  );
}

function OrderActions({
  status,
  loading,
  onPay,
  onCancel,
  onRemindShip,
  onConfirmReceive,
  onReorder,
}: {
  status: string;
  loading: boolean;
  onPay: () => void;
  onCancel: () => void;
  onRemindShip: () => void;
  onConfirmReceive: () => void;
  onReorder: () => void;
}) {
  const primaryCls =
    "rounded-full bg-gradient-to-r from-[#FF6B9D] to-[#C084FC] px-5 py-1.5 text-xs font-semibold text-white shadow-md shadow-[#C084FC]/30 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60";
  const mutedCls =
    "rounded-full bg-gray-100 px-4 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-200";
  const ghostCls =
    "rounded-full border border-[#C084FC] bg-white px-4 py-1.5 text-xs font-semibold text-[#C084FC] transition hover:bg-[#C084FC]/5";

  if (status === "pending") {
    return (
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="text-xs text-gray-400 underline-offset-2 hover:text-gray-600 hover:underline disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "处理中..." : "取消订单"}
        </button>
        <button
          type="button"
          onClick={onPay}
          disabled={loading}
          className={primaryCls}
        >
          {loading ? "处理中..." : "去支付"}
        </button>
      </div>
    );
  }
  if (status === "paid") {
    return (
      <button type="button" onClick={onRemindShip} className={mutedCls}>
        提醒发货
      </button>
    );
  }
  if (status === "shipped") {
    return (
      <button
        type="button"
        onClick={onConfirmReceive}
        disabled={loading}
        className={primaryCls}
      >
        {loading ? "处理中..." : "确认收货"}
      </button>
    );
  }
  if (status === "completed") {
    return (
      <button type="button" onClick={onReorder} className={ghostCls}>
        再来一件
      </button>
    );
  }
  if (status === "cancelled") {
    return (
      <button type="button" onClick={onReorder} className={ghostCls}>
        重新下单
      </button>
    );
  }
  return null;
}
