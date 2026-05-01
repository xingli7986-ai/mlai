"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";

interface Props {
  designId: string;
}

/**
 * Per User Flow §1: clicking "立即参团" must POST /api/group-buys/find-or-create
 * to resolve / create the active group buy, then navigate to /group-buy/{id}.
 * Replaces the previous direct <Link href="/group-buy/{designId}">.
 */
export default function GroupBuyCta({ designId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/group-buys/find-or-create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ designId }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "创建拼团失败");
      }
      router.push(`/group-buy/${data.groupBuyId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "创建拼团失败");
      setLoading(false);
    }
  }

  return (
    <>
      <Button variant="primary" size="lg" block onClick={onClick} loading={loading}>
        立即参团
      </Button>
      {error ? (
        <small style={{ color: "var(--color-error)", fontSize: 12 }}>{error}</small>
      ) : null}
    </>
  );
}
