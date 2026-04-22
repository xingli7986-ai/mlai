"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  FABRIC_LABEL,
  ORDER_STATUS_LABEL,
  SKIRT_LABEL,
  calculatePrice,
} from "@/lib/constants";

type OrderDetail = {
  id: string;
  designId: string;
  skirtType: string;
  fabric: string;
  size: string;
  customMeasurements: string | null;
  status: string;
  createdAt: string;
  design: {
    prompt: string;
    selectedImage: string | null;
    images: string[];
  };
};

function formatSize(size: string, customMeasurements: string | null): string {
  if (size !== "custom") return size;
  if (!customMeasurements) return "自定义";
  try {
    const m = JSON.parse(customMeasurements) as {
      bust?: number;
      waist?: number;
      hip?: number;
      height?: number;
    };
    if (m.bust && m.waist && m.hip && m.height) {
      return `自定义（胸围 ${m.bust}cm / 腰围 ${m.waist}cm / 臀围 ${m.hip}cm / 身高 ${m.height}cm）`;
    }
  } catch {
    /* fall through */
  }
  return "自定义";
}

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

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const orderId = params?.id;
  const { status: authStatus } = useSession();
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [toast, setToast] = useState("");
  const [zoomed, setZoomed] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (authStatus === "unauthenticated") router.replace("/login");
  }, [authStatus, router]);

  const fetchOrder = useCallback(async () => {
    if (!orderId) return;
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        cache: "no-store",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof data?.error === "string" ? data.error : "加载订单失败"
        );
      }
      setOrder(data.order ?? null);
      setLoadError("");
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "加载订单失败");
    }
  }, [orderId]);

  useEffect(() => {
    if (authStatus !== "authenticated" || !orderId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      await fetchOrder();
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [authStatus, orderId, fetchOrder]);

  useEffect(() => {
    if (!zoomed) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoomed(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoomed]);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2400);
  }

  async function handleStatusChange(newStatus: string, successMsg: string) {
    if (!orderId || actionLoading) return;
    setActionLoading(true);
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
      await fetchOrder();
      showToast(successMsg);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "操作失败");
    } finally {
      setActionLoading(false);
    }
  }

  function handlePay() {
    handleStatusChange("paid", "支付成功");
  }
  function handleCancel() {
    if (typeof window !== "undefined" && !window.confirm("确定取消订单吗？")) {
      return;
    }
    handleStatusChange("cancelled", "订单已取消");
  }
  function handleRemindShip() {
    showToast("已通知商家尽快发货 📦");
  }
  function handleConfirmReceive() {
    handleStatusChange("completed", "已确认收货");
  }
  function handleReorder() {
    if (order?.designId) {
      router.push(`/design?designId=${order.designId}`);
    } else {
      router.push("/design");
    }
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
          href="/my/orders"
          title="返回订单列表"
          className="flex items-center gap-1.5 rounded-full px-2 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100"
        >
          <span aria-hidden className="text-gray-500">
            ←
          </span>
          返回订单列表
        </Link>
        <Link
          href="/my"
          className="rounded-full px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 sm:px-4 sm:py-2"
        >
          我的
        </Link>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 sm:px-6 sm:py-10">
        {loadError ? (
          <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">
            {loadError}
          </p>
        ) : loading || !order ? (
          <div className="space-y-4">
            <div className="h-16 animate-pulse rounded-2xl bg-gray-100" />
            <div className="aspect-[3/4] max-w-sm animate-pulse rounded-2xl bg-gray-100" />
            <div className="h-40 animate-pulse rounded-2xl bg-gray-100" />
          </div>
        ) : (
          <>
            <section className="flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-gradient-to-br from-[#FF6B9D]/5 to-[#C084FC]/10 p-5 sm:p-6">
              <div>
                <div className="text-xs text-gray-500">订单状态</div>
                <div className="mt-1 flex items-center gap-2">
                  <BigStatusBadge status={order.status} />
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">应付金额</div>
                <div className="mt-1 bg-gradient-to-r from-[#FF6B9D] to-[#C084FC] bg-clip-text text-3xl font-bold text-transparent">
                  ¥ {calculatePrice(order.fabric, order.skirtType)}
                </div>
              </div>
            </section>

            <section className="mt-6 flex flex-col items-center">
              <div className="mb-3 text-xs text-gray-500">
                点击图片可放大查看
              </div>
              <button
                type="button"
                onClick={() => order.design.selectedImage && setZoomed(true)}
                className="group relative aspect-[3/4] w-64 overflow-hidden rounded-2xl ring-2 ring-[#C084FC]/30 shadow-lg shadow-[#C084FC]/20 transition hover:ring-[#C084FC]/60 sm:w-80"
                disabled={!order.design.selectedImage}
              >
                {order.design.selectedImage ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={order.design.selectedImage}
                      alt="印花大图"
                      className="h-full w-full object-cover"
                    />
                    <div className="pointer-events-none absolute right-3 top-3 rounded-full bg-black/40 px-2 py-1 text-[10px] text-white backdrop-blur-sm">
                      🔍 放大
                    </div>
                  </>
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm text-gray-400">
                    图片缺失
                  </div>
                )}
              </button>
            </section>

            <section className="mt-6">
              <h2 className="mb-3 text-sm font-semibold tracking-wide text-gray-700">
                订单信息
              </h2>
              <dl className="divide-y divide-gray-100 rounded-2xl border border-gray-100">
                <Row label="订单号" value={`#${order.id}`} mono />
                <Row
                  label="裙型"
                  value={SKIRT_LABEL[order.skirtType] ?? order.skirtType}
                />
                <Row
                  label="面料"
                  value={FABRIC_LABEL[order.fabric] ?? order.fabric}
                />
                <Row
                  label="尺码"
                  value={formatSize(order.size, order.customMeasurements)}
                />
                <Row label="价格" value={`¥ ${calculatePrice(order.fabric, order.skirtType)}`} />
                <Row label="下单时间" value={formatDate(order.createdAt)} />
              </dl>
            </section>

            <section className="mt-6">
              <h2 className="mb-3 text-sm font-semibold tracking-wide text-gray-700">
                印花描述
              </h2>
              <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-[#FF6B9D]/5 to-[#C084FC]/5 p-5 text-sm leading-relaxed text-gray-700">
                {order.design.prompt || "—"}
              </div>
            </section>

            {["paid", "shipped", "completed"].includes(order.status) && (
              <section className="mt-8 flex flex-col items-start gap-1 sm:items-end">
                <button
                  type="button"
                  onClick={() =>
                    window.open(`/api/orders/${orderId}/techpack`, "_blank")
                  }
                  className="inline-flex items-center gap-2 rounded-full border-2 border-transparent px-6 py-2.5 font-semibold transition hover:opacity-90"
                  style={{
                    backgroundImage:
                      "linear-gradient(white, white), linear-gradient(90deg, #FF6B9D, #C084FC)",
                    backgroundOrigin: "border-box",
                    backgroundClip: "padding-box, border-box",
                  }}
                >
                  <span className="text-[#C084FC]">
                    <DocumentIcon />
                  </span>
                  <span className="bg-gradient-to-r from-[#FF6B9D] to-[#C084FC] bg-clip-text text-sm text-transparent">
                    下载 Tech Pack
                  </span>
                </button>
                <span className="text-xs text-gray-400">
                  工艺技术文件，可发送给工厂用于打样生产
                </span>
              </section>
            )}

            <section className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end">
              <DetailActions
                status={order.status}
                loading={actionLoading}
                onPay={handlePay}
                onCancel={handleCancel}
                onRemindShip={handleRemindShip}
                onConfirmReceive={handleConfirmReceive}
                onReorder={handleReorder}
              />
            </section>
          </>
        )}
      </main>

      {zoomed && order?.design.selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          onClick={() => setZoomed(false)}
        >
          <button
            type="button"
            aria-label="关闭"
            onClick={() => setZoomed(false)}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-xl text-white transition hover:bg-white/20"
          >
            ✕
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={order.design.selectedImage}
            alt="印花大图"
            className="max-h-full max-w-full rounded-xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
      <span className="shrink-0 text-gray-500">{label}</span>
      <span
        className={`min-w-0 truncate text-right font-medium text-gray-900 ${
          mono ? "font-mono text-xs" : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function BigStatusBadge({ status }: { status: string }) {
  const text = ORDER_STATUS_LABEL[status] ?? status;
  const className = STATUS_CLASSNAME[status] ?? "bg-gray-100 text-gray-500";
  return (
    <span
      className={`rounded-full px-4 py-1.5 text-sm font-semibold ${className}`}
    >
      {text}
    </span>
  );
}

function DetailActions({
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
    "rounded-full bg-gradient-to-r from-[#FF6B9D] to-[#C084FC] px-8 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#C084FC]/30 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60";
  const outlineCls =
    "rounded-full border border-gray-200 bg-white px-6 py-2.5 text-sm font-medium text-gray-600 transition hover:border-gray-300 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-60";
  const mutedCls =
    "rounded-full bg-gray-100 px-6 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-60";
  const ghostCls =
    "rounded-full border border-[#C084FC] bg-white px-6 py-2.5 text-sm font-semibold text-[#C084FC] transition hover:bg-[#C084FC]/5";

  if (status === "pending") {
    return (
      <>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className={outlineCls}
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
      </>
    );
  }
  if (status === "paid") {
    return (
      <button
        type="button"
        onClick={onRemindShip}
        className={mutedCls}
      >
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

function DocumentIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  );
}
