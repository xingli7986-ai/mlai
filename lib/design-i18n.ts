const SKIRT_TYPE: Record<string, string> = {
  wrap: "裹身裙",
  shift: "直筒裙",
  aline: "A 字裙",
  fishtail: "鱼尾裙",
  pencil: "铅笔裙",
};

const FABRIC: Record<string, string> = {
  silk: "真丝",
  knit: "针织",
  blend: "高级混纺",
  linen: "亚麻",
  lace: "蕾丝",
  cotton: "纯棉",
  wool: "羊毛",
};

const NECKLINE: Record<string, string> = {
  v: "V 领",
  vneck: "V 领",
  round: "圆领",
  square: "方领",
  squared: "方领",
  "off-shoulder": "一字肩",
  off_shoulder: "一字肩",
  halter: "挂脖",
  collared: "翻领",
};

const SLEEVE: Record<string, string> = {
  long: "长袖",
  short: "短袖",
  sleeveless: "无袖",
  cap: "盖肩袖",
  puff: "泡泡袖",
  "3-quarter": "七分袖",
  three_quarter: "七分袖",
};

const LENGTH: Record<string, string> = {
  mini: "短款",
  midi: "中长款",
  maxi: "长款",
  knee: "及膝",
};

function translate(map: Record<string, string>, raw: string | null | undefined): string | null {
  if (!raw) return null;
  const key = raw.toLowerCase().trim();
  return map[key] ?? raw;
}

export const zhSkirtType = (v: string | null | undefined) => translate(SKIRT_TYPE, v);
export const zhFabric = (v: string | null | undefined) => translate(FABRIC, v);
export const zhNeckline = (v: string | null | undefined) => translate(NECKLINE, v);
export const zhSleeve = (v: string | null | undefined) => translate(SLEEVE, v);
export const zhLength = (v: string | null | undefined) => translate(LENGTH, v);

const TONES = ["ink", "blue", "rose", "wine", "coffee", "green", "gold", "camellia"] as const;
export type Tone = (typeof TONES)[number];

export function toneFromId(id: string): Tone {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return TONES[h % TONES.length];
}
