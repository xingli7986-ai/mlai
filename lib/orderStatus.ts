import type { BadgeTone } from "@/components/ui/Badge";

/**
 * Order state machine surfacing per User Flow §9.1 (个人定制) + §9.2 (参团).
 *
 * The labels are stable Chinese; tones map to the design system Badge palette:
 *   gold     → in-progress / generic active
 *   neutral  → terminal but inert (closed, cancelled)
 *   dark     → emphasised pending action
 *   success  → completed / refunded successfully
 *
 * Both the short codes used by current Order rows ("pending", "paid", etc)
 * and the canonical User Flow §9 codes ("pending_payment", "in_production",
 * etc) are accepted — see normalizeOrderStatus.
 */

export interface OrderStatusInfo {
  code: string;
  label: string;
  tone: BadgeTone;
  /** Short verb describing what the user is now waiting for. */
  hint?: string;
}

const TABLE: Record<string, OrderStatusInfo> = {
  pending_payment: { code: "pending_payment", label: "待支付", tone: "dark", hint: "30 分钟内完成支付" },
  paid: { code: "paid", label: "待发货", tone: "gold", hint: "工厂排产中" },
  grouping: { code: "grouping", label: "拼团中", tone: "gold", hint: "等待满 30 人成团" },
  group_success: { code: "group_success", label: "拼团成功", tone: "success", hint: "进入生产" },
  group_failed: { code: "group_failed", label: "拼团失败", tone: "neutral", hint: "已自动退款" },
  in_production: { code: "in_production", label: "生产中", tone: "gold", hint: "约 14 个工作日" },
  shipped: { code: "shipped", label: "已发货", tone: "gold", hint: "顺丰配送中" },
  completed: { code: "completed", label: "已完成", tone: "success" },
  refund_pending: { code: "refund_pending", label: "退款中", tone: "dark", hint: "原路退回 1-3 天" },
  refunded: { code: "refunded", label: "已退款", tone: "success" },
  closed: { code: "closed", label: "已关闭", tone: "neutral", hint: "30 分钟未支付自动关闭" },
  // legacy short codes mapped to the canonical states
  pending: { code: "pending", label: "待支付", tone: "dark", hint: "30 分钟内完成支付" },
  cancelled: { code: "cancelled", label: "已取消", tone: "neutral" },
};

export function getOrderStatusInfo(status: string): OrderStatusInfo {
  return (
    TABLE[status] ?? {
      code: status,
      label: status,
      tone: "neutral",
    }
  );
}

/**
 * Normalize legacy short codes → canonical User Flow §9 codes.
 * Useful when calling APIs that expect the new vocabulary.
 */
export function normalizeOrderStatus(status: string): string {
  if (status === "pending") return "pending_payment";
  return status;
}

export type OrderActionId =
  | "pay" // 待支付 → 去支付
  | "cancel" // 待支付 → 取消订单
  | "remind_ship" // 待发货 → 提醒发货
  | "view_progress" // 拼团中 → 查看进度
  | "track" // 已发货 → 查看物流
  | "confirm" // 已发货 → 确认收货
  | "review" // 已完成 → 评价
  | "reorder"; // 已完成 / 已退款 → 再下一件

/**
 * Per User Flow §9 the available actions depend on status. Returns the
 * primary + secondary action ids for the given status — the page can map
 * these to concrete handlers.
 */
export function actionsForStatus(status: string): {
  primary: OrderActionId | null;
  secondary: OrderActionId | null;
} {
  switch (status) {
    case "pending":
    case "pending_payment":
      return { primary: "pay", secondary: "cancel" };
    case "paid":
      return { primary: "remind_ship", secondary: null };
    case "grouping":
      return { primary: "view_progress", secondary: null };
    case "group_success":
    case "in_production":
      return { primary: "view_progress", secondary: null };
    case "shipped":
      return { primary: "confirm", secondary: "track" };
    case "completed":
      return { primary: "review", secondary: "reorder" };
    case "refunded":
    case "group_failed":
      return { primary: "reorder", secondary: null };
    case "refund_pending":
      return { primary: null, secondary: null };
    case "closed":
    case "cancelled":
      return { primary: "reorder", secondary: null };
    default:
      return { primary: null, secondary: null };
  }
}
