// Shared product constants — imported by both server routes and client components.
// No React, no "use client" — pure data.

export type SkirtType = {
  id: string;
  name: string;
  desc: string;
};

export type Fabric = {
  id: string;
  name: string;
  desc: string;
  price: number;
};

export const SKIRT_TYPES: SkirtType[] = [
  { id: "a-line", name: "A 字裙", desc: "经典显瘦" },
  { id: "straight", name: "直筒裙", desc: "利落简约" },
  { id: "half", name: "半身裙", desc: "灵动百搭" },
  { id: "pleated", name: "百褶裙", desc: "飘逸复古" },
  { id: "flared", name: "鱼尾裙", desc: "收腰展摆" },
  { id: "wrap", name: "一片式裹裙", desc: "优雅随性" },
];

export const FABRICS: Fabric[] = [
  { id: "cotton", name: "棉麻", desc: "透气舒适，日常百搭", price: 299 },
  { id: "silk", name: "真丝", desc: "丝滑垂坠，高级光泽", price: 399 },
  { id: "chiffon", name: "雪纺", desc: "轻盈飘逸，仙气满满", price: 329 },
  { id: "denim", name: "牛仔", desc: "硬挺有型，休闲百搭", price: 349 },
  { id: "velvet", name: "丝绒", desc: "复古质感，秋冬优选", price: 429 },
];

export const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL"] as const;
export type SizeOption = (typeof SIZE_OPTIONS)[number];

export const SKIRT_LABEL: Record<string, string> = Object.fromEntries(
  SKIRT_TYPES.map((s) => [s.id, s.name])
);

export const FABRIC_LABEL: Record<string, string> = Object.fromEntries(
  FABRICS.map((f) => [f.id, f.name])
);

export const ORDER_STATUS_LABEL: Record<string, string> = {
  pending: "待付款",
  paid: "待发货",
  shipped: "已发货",
  completed: "已完成",
  cancelled: "已取消",
};
