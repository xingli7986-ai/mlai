"use client";

import Link from "next/link";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Button, EmptyState, Input, Skeleton, Textarea, useToast } from "@/components/ui";
import ConsumerNav from "@/components/ConsumerNav";
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
  const toast = useToast();

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
          toast.show("请先登录后再下单", { tone: "warning" });
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
      const message = err instanceof Error ? err.message : "下单失败";
      setSubmitError(message);
      toast.show(message, { tone: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="page-wrap">
        <div className="container" style={{ paddingTop: 60 }}>
          <Skeleton height={32} style={{ marginBottom: 16 }} />
          <Skeleton height={320} />
        </div>
      </main>
    );
  }
  if (loadError || !detail) {
    return (
      <main className="page-wrap">
        <div className="container" style={{ paddingTop: 60 }}>
          <EmptyState
            title="未找到该设计"
            description={loadError ?? "该设计可能已下架或不存在。"}
            action={<Button as="a" href="/products" variant="primary">返回印花衣橱</Button>}
          />
        </div>
      </main>
    );
  }

  return (
    <main className="page-wrap">
      <ConsumerNav variant="solid" />

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

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Input label="姓名" value={name} onChange={(e) => setName(e.target.value)} required placeholder="收货人姓名" />
              <Input label="手机号" value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="numeric" required placeholder="11 位手机号" />
            </div>

            <Input
              label="收货地址"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              required
              placeholder="省 / 市 / 区"
            />
            <Textarea
              label="详细地址"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              placeholder="街道、楼号、门牌号"
            />

            <Textarea
              label="个性化备注（可选）"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={500}
              placeholder="如：领口加捏褶、用 silver 而非 gold 配色…"
            />

            {submitError && (
              <span className="ui-field__error">{submitError}</span>
            )}

            <Button type="submit" variant="primary" size="lg" block loading={submitting}>
              {submitting ? "处理中…" : `支付 ${fmtPrice(detail.customPrice)} 立即定制`}
            </Button>
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
