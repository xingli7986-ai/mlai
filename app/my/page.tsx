"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

type OrderWithDesign = {
  id: string;
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

const SKIRT_LABEL: Record<string, string> = {
  "a-line": "A 字裙",
  straight: "直筒裙",
  half: "半身裙",
};

const FABRIC_LABEL: Record<string, string> = {
  cotton: "棉麻",
  silk: "真丝",
};

const STATUS_LABEL: Record<string, { text: string; className: string }> = {
  paid: {
    text: "已付款",
    className: "bg-emerald-50 text-emerald-600",
  },
  pending: {
    text: "待付款",
    className: "bg-amber-50 text-amber-600",
  },
  shipped: {
    text: "已发货",
    className: "bg-sky-50 text-sky-600",
  },
  completed: {
    text: "已完成",
    className: "bg-[#C084FC]/10 text-[#C084FC]",
  },
};

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export default function MyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<OrderWithDesign[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("toast") === "ordered") {
      setToast("下单成功 🎉");
      window.history.replaceState({}, "", "/my");
      const t = setTimeout(() => setToast(""), 2800);
      return () => clearTimeout(t);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    setLoadError("");
    try {
      const res = await fetch("/api/orders/list", { cache: "no-store" });
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
    if (status === "authenticated") fetchOrders();
  }, [status, fetchOrders]);

  if (status !== "authenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-sm text-gray-400">
        加载中...
      </div>
    );
  }

  const phone = (session.user as { phone?: string } | undefined)?.phone ?? "";
  const maskedPhone = phone
    ? `${phone.slice(0, 3)} **** ${phone.slice(7)}`
    : "未知手机号";

  return (
    <div className="relative flex min-h-screen flex-col bg-white">
      {toast && (
        <div className="pointer-events-none fixed left-1/2 top-6 z-50 -translate-x-1/2">
          <div className="pointer-events-auto rounded-full bg-gradient-to-r from-[#FF6B9D] to-[#C084FC] px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-[#C084FC]/40">
            {toast}
          </div>
        </div>
      )}

      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-black/5 bg-white/80 px-6 py-4 backdrop-blur">
        <Link href="/" className="flex items-center gap-2">
          <span className="h-8 w-8 rounded-xl bg-gradient-to-br from-[#FF6B9D] to-[#C084FC]" />
          <span className="text-lg font-semibold tracking-tight">
            MaxLuLu <span className="text-[#C084FC]">AI</span>
          </span>
        </Link>
        <Link
          href="/design"
          className="rounded-full bg-gradient-to-r from-[#FF6B9D] to-[#C084FC] px-5 py-2 text-sm font-medium text-white shadow-md shadow-[#C084FC]/30 transition hover:opacity-95"
        >
          开始设计
        </Link>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
        <section className="flex items-center justify-between rounded-3xl border border-gray-100 bg-gradient-to-br from-[#FF6B9D]/5 to-[#C084FC]/10 p-6 shadow-[0_20px_60px_-30px_rgba(192,132,252,0.25)]">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF6B9D] to-[#C084FC] text-lg font-semibold text-white shadow-md shadow-[#C084FC]/30">
              {phone.slice(-2) || "ML"}
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-[#C084FC]">
                Hi, 设计师
              </div>
              <div className="mt-1 text-lg font-semibold tracking-tight">
                {maskedPhone}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="rounded-full border border-gray-200 bg-white px-5 py-2 text-sm font-medium text-gray-700 transition hover:border-[#FF6B9D] hover:text-[#FF6B9D]"
          >
            退出登录
          </button>
        </section>

        <section className="mt-8">
          <div className="mb-3 flex items-end justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">我的订单</h2>
              <p className="text-xs text-gray-500">
                {loading ? "加载中..." : `共 ${orders.length} 笔`}
              </p>
            </div>
            {orders.length > 0 && (
              <Link
                href="/design"
                className="text-sm font-medium text-[#C084FC] hover:underline"
              >
                继续设计 →
              </Link>
            )}
          </div>

          {loadError ? (
            <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">
              {loadError}
            </p>
          ) : loading ? (
            <div className="space-y-3">
              {[0, 1].map((i) => (
                <div
                  key={i}
                  className="h-24 animate-pulse rounded-2xl bg-gray-100"
                />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <EmptyState
              icon="📦"
              title="还没有订单"
              desc="去设计一件专属裙装吧"
              actionLabel="开始设计"
              actionHref="/design"
            />
          ) : (
            <ul className="space-y-3">
              {orders.map((o) => (
                <li
                  key={o.id}
                  className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:border-[#C084FC]/40 hover:shadow-md"
                >
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-[#FF6B9D]/10 to-[#C084FC]/10">
                    {o.design.selectedImage ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={o.design.selectedImage}
                        alt="印花"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                        图片缺失
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-semibold">
                        {SKIRT_LABEL[o.skirtType] ?? o.skirtType} ·{" "}
                        {FABRIC_LABEL[o.fabric] ?? o.fabric} · {o.size}
                      </span>
                      <StatusPill status={o.status} />
                    </div>
                    <div className="mt-1 truncate text-xs text-gray-500">
                      {o.design.prompt}
                    </div>
                    <div className="mt-1.5 text-xs text-gray-400">
                      {formatDate(o.createdAt)}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="bg-gradient-to-r from-[#FF6B9D] to-[#C084FC] bg-clip-text text-lg font-bold text-transparent">
                      ¥ {o.price}
                    </div>
                    <div className="mt-0.5 text-[10px] text-gray-400">
                      #{o.id.slice(-6)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      <footer className="py-10 text-center">
        <p className="bg-gradient-to-r from-[#FF6B9D] to-[#C084FC] bg-clip-text text-sm font-medium text-transparent">
          Fashion For You — 每一朵印花，都由你绽放
        </p>
      </footer>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const meta = STATUS_LABEL[status] ?? {
    text: status,
    className: "bg-gray-100 text-gray-500",
  };
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${meta.className}`}
    >
      {meta.text}
    </span>
  );
}

function EmptyState({
  icon,
  title,
  desc,
  actionLabel,
  actionHref,
}: {
  icon: string;
  title: string;
  desc: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-10 text-center">
      <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF6B9D]/10 to-[#C084FC]/10 text-2xl">
        {icon}
      </div>
      <div className="text-base font-semibold">{title}</div>
      <div className="mt-1 text-sm text-gray-500">{desc}</div>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="mt-5 inline-block rounded-full bg-gradient-to-r from-[#FF6B9D] to-[#C084FC] px-6 py-2 text-sm font-medium text-white shadow-md shadow-[#C084FC]/30 transition hover:opacity-95"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
