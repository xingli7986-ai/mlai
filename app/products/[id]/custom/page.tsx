"use client";

import Link from "next/link";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import "./custom.css";

type Props = {
  params: Promise<{ id: string }>;
};

interface DesignDetail {
  id: string;
  title: string;
  description: string | null;
  images: string[];
  customPrice: number;
  groupPrice: number;
  fabric: string;
  skirtType: string;
  designer: { name: string | null };
}

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

function fmtPrice(cents: number): string {
  if (!cents || cents <= 0) return "¥—";
  return `¥${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export default function CustomOrderPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();

  const [detail, setDetail] = useState<DesignDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [size, setSize] = useState("M");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [region, setRegion] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`/api/designs/${id}`, { cache: "no-store" });
        const data = await res.json();
        if (!alive) return;
        if (!res.ok) throw new Error(data.error || "加载失败");
        setDetail(data.design);
      } catch (err) {
        if (alive) setLoadError(err instanceof Error ? err.message : "加载失败");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting || !detail) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const orderRes = await fetch(`/api/designs/${detail.id}/custom-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          size,
          recipientName: name,
          recipientPhone: phone,
          recipientRegion: region,
          recipientAddress: address,
          note,
        }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        if (orderRes.status === 401) {
          router.push(`/login?redirect=/products/${id}/custom`);
          return;
        }
        throw new Error(orderData.error || "下单失败");
      }

      const payRes = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: orderData.order.id, kind: "order" }),
      });
      const payData = await payRes.json();
      if (!payRes.ok) throw new Error(payData.error || "创建支付失败");

      const div = document.createElement("div");
      div.innerHTML = payData.formHtml;
      document.body.appendChild(div);
      const form = div.querySelector("form");
      if (form) form.submit();
      else window.location.href = "/my/orders";
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "下单失败");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="page-wrap">
        <div className="container" style={{ paddingTop: 60 }}>
          <div className="ml-skeleton" style={{ height: 32, marginBottom: 16 }} />
          <div className="ml-skeleton" style={{ height: 320 }} />
        </div>
      </main>
    );
  }
  if (loadError || !detail) {
    return (
      <main className="page-wrap">
        <div className="container" style={{ paddingTop: 60 }}>
          <h1>未找到该设计</h1>
          <p>{loadError}</p>
          <p><Link href="/products">返回印花衣橱</Link></p>
        </div>
      </main>
    );
  }

  return (
    <main className="page-wrap">
      <nav className="nav">
        <div className="container inner">
          <Link href="/" className="nav-logo">MaxLuLu <span className="ai">AI</span></Link>
          <div className="nav-center">
            <Link href="/products">印花衣橱</Link>
            <Link href="/my">我的衣橱</Link>
          </div>
          <div className="nav-right">
            <Link href={`/products/${detail.id}`}>← 返回详情</Link>
          </div>
        </div>
      </nav>

      <div className="container" style={{ paddingTop: 24, paddingBottom: 80 }}>
        <h1 className="ml-h2" style={{ marginBottom: 18 }}>个人定制 · 1 of 1</h1>

        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 18 }}>
          <form onSubmit={onSubmit} className="ml-card" style={{ padding: 22, display: "grid", gap: 18 }}>
            <div style={{ display: "flex", gap: 14 }}>
              <div style={{ width: 120, height: 150, borderRadius: 12, overflow: "hidden", background: "var(--ml-warm-gray)" }}>
                {detail.images[0] && (
                  <img src={detail.images[0]} alt={detail.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                )}
              </div>
              <div style={{ flex: 1 }}>
                <h2 className="ml-h3" style={{ marginBottom: 6 }}>{detail.title}</h2>
                <p className="ml-caption">面料 {detail.fabric} · 廓形 {detail.skirtType}</p>
                <p className="ml-caption" style={{ marginTop: 4 }}>设计师 · {detail.designer.name ?? "MaxLuLu Studio"}</p>
                <p className="ml-caption" style={{ marginTop: 8 }}>
                  众定价 {fmtPrice(detail.groupPrice)} · <b style={{ color: "var(--ml-primary)" }}>个人定制 {fmtPrice(detail.customPrice)}</b>
                </p>
              </div>
            </div>

            <hr className="ml-divider" />

            <div className="ml-field">
              <span className="ml-field__label">尺码</span>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {SIZES.map((s) => (
                  <button key={s} type="button" className={`ml-chip ${size === s ? "is-active" : ""}`} onClick={() => setSize(s)}>{s}</button>
                ))}
              </div>
            </div>

            <div className="ml-field">
              <span className="ml-field__label">收货人</span>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <input className="ml-input" placeholder="姓名" value={name} onChange={(e) => setName(e.target.value)} required />
                <input className="ml-input" placeholder="手机号" value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="numeric" required />
              </div>
            </div>

            <div className="ml-field">
              <span className="ml-field__label">收货地址</span>
              <input className="ml-input" placeholder="省/市/区" value={region} onChange={(e) => setRegion(e.target.value)} required style={{ marginBottom: 8 }} />
              <textarea className="ml-textarea" placeholder="详细地址" value={address} onChange={(e) => setAddress(e.target.value)} required />
            </div>

            <div className="ml-field">
              <span className="ml-field__label">个性化备注（可选）</span>
              <textarea className="ml-textarea" placeholder="如：领口加捏褶、用 silver 而非 gold 配色…" value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} />
            </div>

            {submitError && <div className="ml-toast ml-toast--error">{submitError}</div>}

            <button type="submit" className="ml-btn ml-btn--primary ml-btn--lg ml-btn--block" disabled={submitting}>
              {submitting ? "处理中…" : `支付 ${fmtPrice(detail.customPrice)} 立即定制`}
            </button>
          </form>

          <aside className="ml-card" style={{ padding: 20, alignSelf: "start", display: "grid", gap: 12 }}>
            <h3 className="ml-h3">订单金额</h3>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
              <span>个人定制价</span>
              <b>{fmtPrice(detail.customPrice)}</b>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
              <span>运费</span>
              <b>包邮</b>
            </div>
            <hr className="ml-divider" />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span className="ml-h3">应付</span>
              <b className="ml-h3" style={{ color: "var(--ml-primary)" }}>{fmtPrice(detail.customPrice)}</b>
            </div>
            <p className="ml-caption" style={{ marginTop: 4 }}>
              7 天交付 · 1 of 1 限量 · 30 天无忧退换
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}
