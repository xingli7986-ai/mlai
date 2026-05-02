"use client";

import Link from "next/link";
import { useEffect, useState, use } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button, EmptyState, Input, Skeleton, Textarea, useToast } from "@/components/ui";
import ConsumerNav from "@/components/ConsumerNav";
import "../group-buy.css";

type Props = {
  params: Promise<{ id: string }>;
};

interface PublishedDesignLite {
  id: string;
  title: string;
  coverImages: string[];
  groupPrice: number;
  customPrice: number;
}
interface GroupBuy {
  id: string;
  publishedDesignId: string;
  publishedDesign: PublishedDesignLite;
  targetCount: number;
  currentCount: number;
  status: string;
  expiresAt: string;
  progressPct: number;
  secondsRemaining: number;
}
interface InviterInfo {
  inviter: { id: string; name: string; avatar: string | null };
  inviterReward: number;
  inviteeReward: number;
}

const SIZES = ["S", "M", "L", "XL", "XXL"];

function fmtPrice(cents: number): string {
  if (!cents || cents <= 0) return "¥—";
  return `¥${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function fmtCountdown(s: number): string {
  if (s <= 0) return "已过期";
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${h}小时${m.toString().padStart(2, "0")}分${sec.toString().padStart(2, "0")}秒`;
}

export default function GroupBuyCheckoutPage({ params }: Props) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();
  const toast = useToast();
  const inviteCode = searchParams.get("invite") || "";

  const [groupBuy, setGroupBuy] = useState<GroupBuy | null>(null);
  const [inviter, setInviter] = useState<InviterInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [size, setSize] = useState("M");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [region, setRegion] = useState("");
  const [address, setAddress] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`/api/group-buys/${id}`, { cache: "no-store" });
        const data = await res.json();
        if (!alive) return;
        if (!res.ok) throw new Error(data.error || "加载失败");
        setGroupBuy(data.groupBuy);
        setSeconds(data.groupBuy.secondsRemaining);
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

  useEffect(() => {
    if (!inviteCode) return;
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`/api/invitations/${inviteCode}`, { cache: "no-store" });
        const data = await res.json();
        if (alive && res.ok) setInviter(data);
      } catch {
        // silent
      }
    })();
    return () => {
      alive = false;
    };
  }, [inviteCode]);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [seconds]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting || !groupBuy) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const orderRes = await fetch(`/api/group-buys/${groupBuy.id}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          size,
          recipientName: name,
          recipientPhone: phone,
          recipientRegion: region,
          recipientAddress: address,
          inviteCode: inviteCode || undefined,
        }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        if (orderRes.status === 401) {
          toast.show("请先登录后再下单", { tone: "warning" });
          router.push(`/login?redirect=/group-buy/${id}${inviteCode ? `?invite=${inviteCode}` : ""}`);
          return;
        }
        throw new Error(orderData.error || "下单失败");
      }

      const payRes = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: orderData.order.id, kind: "group-buy" }),
      });
      const payData = await payRes.json();
      if (!payRes.ok) throw new Error(payData.error || "创建支付失败");

      // The Alipay flow returns an HTML form that auto-submits.
      const div = document.createElement("div");
      div.innerHTML = payData.formHtml;
      document.body.appendChild(div);
      const form = div.querySelector("form");
      if (form) form.submit();
      else window.location.href = `/group-buy/${groupBuy.id}/progress`;
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
      <main className="page-wrap gbPage">
        <div className="container" style={{ paddingTop: 60 }}>
          <Skeleton height={32} style={{ marginBottom: 16 }} />
          <Skeleton height={240} style={{ marginBottom: 16 }} />
          <Skeleton height={320} />
        </div>
      </main>
    );
  }

  if (loadError || !groupBuy) {
    return (
      <main className="page-wrap gbPage">
        <div className="container" style={{ paddingTop: 60 }}>
          <EmptyState
            title="未找到该拼团"
            description={loadError ?? "请稍后重试或返回印花衣橱挑选其他款式。"}
            action={<Button as="a" href="/products" variant="primary">返回印花衣橱</Button>}
          />
        </div>
      </main>
    );
  }

  const design = groupBuy.publishedDesign;
  const baseCents = design.groupPrice;
  const discountCents = inviter ? inviter.inviteeReward : 0;
  const totalCents = Math.max(0, baseCents - discountCents);

  return (
    <main className="page-wrap gbPage">
      <ConsumerNav variant="solid" />

      <div className="container" style={{ paddingTop: 24, paddingBottom: 80 }}>
        <h1 className="ml-h2" style={{ marginBottom: 18 }}>参团结算</h1>

        {inviter && (
          <div className="ml-toast ml-toast--success" style={{ marginBottom: 16 }}>
            <strong>{inviter.inviter.name}</strong> 邀请你参团，立减 {fmtPrice(inviter.inviteeReward)}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 18 }}>
          <form onSubmit={onSubmit} className="ml-card" style={{ padding: 22, display: "grid", gap: 18 }}>
            <div style={{ display: "flex", gap: 14 }}>
              <div style={{ width: 96, height: 120, borderRadius: 12, overflow: "hidden", background: "var(--ml-warm-gray)" }}>
                {design.coverImages[0] && (
                  <img src={design.coverImages[0]} alt={design.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                )}
              </div>
              <div style={{ flex: 1 }}>
                <h2 className="ml-h3" style={{ marginBottom: 6 }}>{design.title}</h2>
                <p className="ml-caption">众定价 {fmtPrice(design.groupPrice)} · 个人定制价 {fmtPrice(design.customPrice)}</p>
                <div style={{ marginTop: 10 }}>
                  <div style={{ height: 6, background: "var(--ml-warm-gray)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ width: `${groupBuy.progressPct}%`, height: "100%", background: "var(--ml-primary)" }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 12, color: "var(--ml-text-2)" }}>
                    <span>已拼 {groupBuy.currentCount} / {groupBuy.targetCount} 人</span>
                    <span>剩余 {fmtCountdown(seconds)}</span>
                  </div>
                </div>
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

            <Input label="收货地址" value={region} onChange={(e) => setRegion(e.target.value)} required placeholder="省 / 市 / 区" />
            <Textarea label="详细地址" value={address} onChange={(e) => setAddress(e.target.value)} required placeholder="街道、门牌号" />

            {submitError && (
              <span className="ui-field__error">{submitError}</span>
            )}

            <Button type="submit" variant="primary" size="lg" block loading={submitting}>
              {submitting ? "处理中…" : `支付 ${fmtPrice(totalCents)} 参团`}
            </Button>
          </form>

          <aside className="ml-card" style={{ padding: 20, alignSelf: "start", display: "grid", gap: 12 }}>
            <h3 className="ml-h3">订单金额</h3>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
              <span>众定价</span>
              <b>{fmtPrice(baseCents)}</b>
            </div>
            {inviter && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--ml-primary)" }}>
                <span>邀请立减</span>
                <b>-{fmtPrice(discountCents)}</b>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
              <span>运费</span>
              <b>包邮</b>
            </div>
            <hr className="ml-divider" />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span className="ml-h3">应付</span>
              <b className="ml-h3" style={{ color: "var(--ml-primary)" }}>{fmtPrice(totalCents)}</b>
            </div>
            <p className="ml-caption" style={{ marginTop: 4 }}>
              不成团全额退款 · 顺丰包邮 · 30 天无忧退换
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}
