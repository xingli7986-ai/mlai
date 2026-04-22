// Shared product constants — imported by both server routes and client components.
// No React, no "use client" — pure data.

export type SkirtType = {
  id: string;
  name: string;
  enName: string;
  desc: string;
};

export type Fabric = {
  id: string;
  name: string;
  enName: string;
  composition: string;
  gsm: string;
  priceLevel: 1 | 2 | 3;
};

export type Neckline = { id: string; name: string; enName: string };
export type SleeveType = { id: string; name: string; enName: string };
export type SkirtLength = {
  id: string;
  name: string;
  enName: string;
  refLengthCm: number;
};

export const SKIRT_TYPES: SkirtType[] = [
  { id: "a-line", name: "A 字裙", enName: "A-line", desc: "经典显瘦" },
  { id: "shift", name: "直筒裙", enName: "Shift", desc: "利落简约" },
  { id: "bodycon", name: "修身裙", enName: "Bodycon", desc: "曲线凸显" },
  { id: "wrap", name: "裹身裙", enName: "Wrap", desc: "优雅随性" },
  { id: "pleated", name: "百褶裙", enName: "Pleated", desc: "飘逸复古" },
  { id: "mermaid", name: "鱼尾裙", enName: "Mermaid", desc: "收腰展摆" },
  { id: "flared", name: "伞摆裙", enName: "Flared", desc: "A 摆延伸" },
  { id: "shirt-dress", name: "衬衫裙", enName: "Shirt Dress", desc: "知性休闲" },
  { id: "slip", name: "吊带裙", enName: "Slip", desc: "慵懒优雅" },
  { id: "cheongsam", name: "旗袍", enName: "Cheongsam", desc: "东方韵味" },
  { id: "ball-gown", name: "公主裙", enName: "Ball Gown", desc: "蓬松华丽" },
  { id: "tiered", name: "蛋糕裙", enName: "Tiered", desc: "层叠飘逸" },
];

export const FABRICS: Fabric[] = [
  { id: "cotton", name: "纯棉", enName: "Cotton", composition: "100% 棉", gsm: "180GSM", priceLevel: 1 },
  { id: "cotton-linen", name: "棉麻", enName: "Cotton Linen", composition: "55% 棉 45% 麻", gsm: "200GSM", priceLevel: 1 },
  { id: "silk", name: "真丝", enName: "Silk", composition: "100% 桑蚕丝", gsm: "16 姆米", priceLevel: 3 },
  { id: "chiffon", name: "雪纺", enName: "Chiffon", composition: "100% 涤纶", gsm: "75GSM", priceLevel: 2 },
  { id: "satin", name: "缎面", enName: "Satin", composition: "97% 涤纶 3% 氨纶", gsm: "135GSM", priceLevel: 2 },
  { id: "denim", name: "牛仔", enName: "Denim", composition: "98% 棉 2% 氨纶", gsm: "280GSM", priceLevel: 2 },
  { id: "velvet", name: "丝绒", enName: "Velvet", composition: "92% 涤纶 8% 氨纶", gsm: "220GSM", priceLevel: 2 },
  { id: "lace", name: "蕾丝", enName: "Lace", composition: "90% 锦纶 10% 氨纶", gsm: "115GSM", priceLevel: 2 },
  { id: "polyester", name: "涤纶", enName: "Polyester", composition: "100% 涤纶", gsm: "140GSM", priceLevel: 1 },
  { id: "organza", name: "欧根纱", enName: "Organza", composition: "100% 涤纶", gsm: "50GSM", priceLevel: 2 },
  { id: "knit", name: "针织", enName: "Knit", composition: "95% 棉 5% 氨纶", gsm: "200GSM", priceLevel: 2 },
  { id: "acetate", name: "醋酸", enName: "Acetate", composition: "100% 醋酸纤维", gsm: "115GSM", priceLevel: 2 },
];

export const NECKLINES: Neckline[] = [
  { id: "round", name: "圆领", enName: "Round" },
  { id: "v-neck", name: "V 领", enName: "V-neck" },
  { id: "square", name: "方领", enName: "Square" },
  { id: "off-shoulder", name: "一字领", enName: "Off-shoulder" },
  { id: "high-neck", name: "高领", enName: "High neck" },
  { id: "collar", name: "翻领", enName: "Collar" },
  { id: "halter", name: "挂脖领", enName: "Halter" },
  { id: "sweetheart", name: "心形领", enName: "Sweetheart" },
];

export const SLEEVE_TYPES: SleeveType[] = [
  { id: "sleeveless", name: "无袖", enName: "Sleeveless" },
  { id: "short", name: "短袖", enName: "Short sleeve" },
  { id: "elbow", name: "肘袖", enName: "Elbow sleeve" },
  { id: "three-quarter", name: "七分袖", enName: "Three-quarter sleeve" },
  { id: "long", name: "长袖", enName: "Long sleeve" },
  { id: "puff", name: "泡泡袖", enName: "Puff sleeve" },
  { id: "flutter", name: "荷叶袖", enName: "Flutter sleeve" },
  { id: "bell", name: "喇叭袖", enName: "Bell sleeve" },
  { id: "bishop", name: "主教袖", enName: "Bishop sleeve" },
  { id: "spaghetti", name: "细吊带", enName: "Spaghetti strap" },
];

export const SKIRT_LENGTHS: SkirtLength[] = [
  { id: "mini", name: "超短", enName: "Mini", refLengthCm: 75 },
  { id: "short", name: "短款", enName: "Short", refLengthCm: 85 },
  { id: "knee", name: "过膝", enName: "Knee", refLengthCm: 95 },
  { id: "midi", name: "中长", enName: "Midi", refLengthCm: 110 },
  { id: "maxi", name: "长款", enName: "Maxi", refLengthCm: 135 },
  { id: "floor", name: "及地", enName: "Floor", refLengthCm: 148 },
];

// Pricing ------------------------------------------------------------

export const BASE_PRICE_BY_LEVEL: Record<1 | 2 | 3, number> = {
  1: 599,
  2: 999,
  3: 1599,
};

// Skirt craftsmanship surcharge by complexity tier.
const SKIRT_COMPLEXITY_ADDON: Record<string, number> = {
  // simple
  shift: 0,
  slip: 0,
  // medium
  "a-line": 100,
  "shirt-dress": 100,
  flared: 100,
  bodycon: 100,
  // complex
  wrap: 200,
  pleated: 200,
  tiered: 200,
  // high complexity
  mermaid: 400,
  cheongsam: 400,
  "ball-gown": 400,
};

export function calculatePrice(fabricId: string, skirtId: string): number {
  const fabric = FABRICS.find((f) => f.id === fabricId);
  const base = fabric
    ? BASE_PRICE_BY_LEVEL[fabric.priceLevel]
    : BASE_PRICE_BY_LEVEL[1];
  const addon = SKIRT_COMPLEXITY_ADDON[skirtId] ?? 0;
  return base + addon;
}

// Sizes & labels -----------------------------------------------------

export const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL"] as const;
export type SizeOption = (typeof SIZE_OPTIONS)[number];

export const SKIRT_LABEL: Record<string, string> = Object.fromEntries(
  SKIRT_TYPES.map((s) => [s.id, s.name])
);

export const FABRIC_LABEL: Record<string, string> = Object.fromEntries(
  FABRICS.map((f) => [f.id, f.name])
);

export const NECKLINE_LABEL: Record<string, string> = Object.fromEntries(
  NECKLINES.map((n) => [n.id, n.name])
);

export const SLEEVE_LABEL: Record<string, string> = Object.fromEntries(
  SLEEVE_TYPES.map((s) => [s.id, s.name])
);

export const SKIRT_LENGTH_LABEL: Record<string, string> = Object.fromEntries(
  SKIRT_LENGTHS.map((l) => [l.id, l.name])
);

export const ORDER_STATUS_LABEL: Record<string, string> = {
  pending: "待付款",
  paid: "待发货",
  shipped: "已发货",
  completed: "已完成",
  cancelled: "已取消",
};
