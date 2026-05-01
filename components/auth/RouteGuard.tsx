"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import type { UserRole } from "@/lib/userRole";
import { Button, EmptyState } from "@/components/ui";

interface Props {
  /**
   * Set of roles allowed to view the wrapped page. Order doesn't matter.
   * Examples:
   *   ["designer"]                  → /studio/publish
   *   ["designer", "designer_pending"] → /studio/dashboard
   *   ["admin"]                     → /admin/manage
   */
  allow: UserRole[];
  /**
   * Where to send guests. Defaults to /login?redirect=<current>.
   */
  guestRedirect?: string;
  children: ReactNode;
}

interface RoleResponse {
  role: UserRole;
  userId: string | null;
}

/**
 * Client-side route guard.
 *
 * Per PRD §6.3, several routes require specific roles. Server-component
 * conversion of every page would be heavy, so we do an authoritative role
 * fetch from /api/me/role on mount and gate the children. The matching
 * server-side checks still live on each API route — this component is the
 * UX surface, not the security boundary.
 */
export default function RouteGuard({ allow, guestRedirect, children }: Props) {
  const router = useRouter();
  const pathname = usePathname() || "/";
  const [state, setState] = useState<
    | { kind: "loading" }
    | { kind: "ok"; role: UserRole }
    | { kind: "guest" }
    | { kind: "denied"; role: UserRole }
  >({ kind: "loading" });

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/me/role", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as RoleResponse;
        if (!alive) return;
        if (data.role === "guest" || !data.userId) {
          setState({ kind: "guest" });
          return;
        }
        if (allow.includes(data.role)) {
          setState({ kind: "ok", role: data.role });
        } else {
          setState({ kind: "denied", role: data.role });
        }
      } catch {
        if (alive) setState({ kind: "guest" });
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (state.kind === "loading") {
    return (
      <div style={{ minHeight: "60vh", display: "grid", placeItems: "center" }}>
        <div className="ui-skeleton" style={{ width: 240, height: 16 }} />
      </div>
    );
  }

  if (state.kind === "guest") {
    const target = guestRedirect ?? `/login?redirect=${encodeURIComponent(pathname)}`;
    return (
      <div style={{ padding: 80 }}>
        <EmptyState
          title="需要登录"
          description="该页面仅限登录用户访问，请先登录。"
          action={
            <Button variant="primary" onClick={() => router.push(target)}>立即登录</Button>
          }
        />
      </div>
    );
  }

  if (state.kind === "denied") {
    const isStudio = allow.some((r) => r === "designer" || r === "designer_pending");
    const isAdmin = allow.includes("admin");
    return (
      <div style={{ padding: 80 }}>
        <EmptyState
          title={isAdmin ? "无管理员权限" : "需要设计师权限"}
          description={
            isAdmin
              ? "此页面仅限管理员访问。"
              : isStudio && state.role === "consumer"
                ? "成为签约设计师后即可使用，先体验入驻申请吧。"
                : "你的账号尚不具备访问此页面的权限。"
          }
          action={
            isStudio ? (
              <Button variant="primary" onClick={() => router.push("/studio/join")}>申请入驻</Button>
            ) : (
              <Button variant="primary" onClick={() => router.push("/")}>返回首页</Button>
            )
          }
        />
      </div>
    );
  }

  return <>{children}</>;
}
