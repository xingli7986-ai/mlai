// Tech Pack static data: POM database, grading rules, construction templates, BOM templates.
// Pure data — no React, imported by PDF template and future /api/techpack generation route.

import { FABRICS, SKIRT_LENGTHS, type Fabric } from "./constants";

// ---------------------------------------------------------------------------
// POM (Points of Measure) definitions — 17 standard dress measurements.
// ---------------------------------------------------------------------------

export type PomDefinition = {
  id: string;
  name: string;
  unit: "cm";
  tolerance: number;
};

export const POM_DEFINITIONS: PomDefinition[] = [
  { id: "cb-length", name: "衣长 (CB Length)", unit: "cm", tolerance: 1.0 },
  { id: "chest", name: "胸围 (Chest Width)", unit: "cm", tolerance: 1.0 },
  { id: "waist", name: "腰围 (Waist)", unit: "cm", tolerance: 1.0 },
  { id: "hip", name: "臀围 (Hip)", unit: "cm", tolerance: 1.0 },
  { id: "shoulder", name: "肩宽 (Shoulder)", unit: "cm", tolerance: 0.5 },
  { id: "cf-length", name: "前衣长 (CF Length)", unit: "cm", tolerance: 1.0 },
  { id: "sleeve-length", name: "袖长 (Sleeve Length)", unit: "cm", tolerance: 1.0 },
  { id: "sleeve-opening", name: "袖口宽 (Sleeve Opening)", unit: "cm", tolerance: 0.5 },
  { id: "armhole-depth", name: "袖笼深 (Armhole Depth)", unit: "cm", tolerance: 0.5 },
  { id: "neck-width", name: "领宽 (Neck Width)", unit: "cm", tolerance: 0.5 },
  { id: "front-neck-drop", name: "前领深 (Front Neck Drop)", unit: "cm", tolerance: 0.5 },
  { id: "back-neck-drop", name: "后领深 (Back Neck Drop)", unit: "cm", tolerance: 0.3 },
  { id: "hem-width", name: "下摆宽 (Hem Width)", unit: "cm", tolerance: 1.0 },
  { id: "hem-sweep", name: "下摆围 (Hem Sweep)", unit: "cm", tolerance: 1.5 },
  { id: "waist-to-hem", name: "腰到下摆 (Waist to Hem)", unit: "cm", tolerance: 1.0 },
  { id: "slit-length", name: "开衩长 (Slit Length)", unit: "cm", tolerance: 0.5 },
  { id: "zipper-length", name: "拉链长 (Zipper Length)", unit: "cm", tolerance: 0.5 },
];

// M-size baseline. cb-length and waist-to-hem are overridden at calc time
// based on the user's chosen skirtLength.
export const BASE_M_MEASUREMENTS: Record<string, number> = {
  "cb-length": 90,
  chest: 90,
  waist: 72,
  hip: 96,
  shoulder: 38,
  "cf-length": 87,
  "sleeve-length": 57,
  "sleeve-opening": 24,
  "armhole-depth": 21,
  "neck-width": 18,
  "front-neck-drop": 10,
  "back-neck-drop": 2,
  "hem-width": 55,
  "hem-sweep": 110,
  "waist-to-hem": 48,
  "slit-length": 0,
  "zipper-length": 56,
};

// Per-POM grading increments. `standard` applies between adjacent XS/S/M/L
// sizes; `plus` applies for the larger L→XL and XL→XXL steps.
export const GRADING_RULES: Record<string, { standard: number; plus: number }> = {
  chest: { standard: 4, plus: 6 },
  waist: { standard: 4, plus: 6 },
  hip: { standard: 4, plus: 6 },
  shoulder: { standard: 1, plus: 1 },
  "cb-length": { standard: 1, plus: 1 },
  "cf-length": { standard: 1, plus: 1 },
  "sleeve-length": { standard: 1, plus: 1 },
  "sleeve-opening": { standard: 0.5, plus: 1 },
  "armhole-depth": { standard: 0.5, plus: 0.5 },
  "neck-width": { standard: 0.5, plus: 0.5 },
  "front-neck-drop": { standard: 0, plus: 0 },
  "back-neck-drop": { standard: 0, plus: 0 },
  "hem-width": { standard: 3, plus: 4 },
  "hem-sweep": { standard: 6, plus: 8 },
  "waist-to-hem": { standard: 0.5, plus: 0.5 },
  "slit-length": { standard: 0, plus: 0 },
  "zipper-length": { standard: 1, plus: 1 },
};

export const SIZE_CODES = ["XS", "S", "M", "L", "XL", "XXL"] as const;
export type SizeCode = (typeof SIZE_CODES)[number];

// Grading offsets from M for each size.
// XS..L use `standard` increments; L→XL and XL→XXL add `plus` increments.
const SIZE_OFFSET: Record<SizeCode, { std: number; plus: number }> = {
  XS: { std: -2, plus: 0 },
  S: { std: -1, plus: 0 },
  M: { std: 0, plus: 0 },
  L: { std: 1, plus: 0 },
  XL: { std: 1, plus: 1 },
  XXL: { std: 1, plus: 2 },
};

export function calculateAllSizes(
  skirtLengthId: string
): Record<string, Record<string, number>> {
  const refLen =
    SKIRT_LENGTHS.find((l) => l.id === skirtLengthId)?.refLengthCm ??
    BASE_M_MEASUREMENTS["cb-length"];

  const baseM: Record<string, number> = {
    ...BASE_M_MEASUREMENTS,
    "cb-length": refLen,
    "waist-to-hem": Math.max(refLen - 42, 10),
  };

  const result: Record<string, Record<string, number>> = {};
  for (const size of SIZE_CODES) {
    const off = SIZE_OFFSET[size];
    const row: Record<string, number> = {};
    for (const pom of POM_DEFINITIONS) {
      const rules = GRADING_RULES[pom.id] ?? { standard: 0, plus: 0 };
      const m = baseM[pom.id] ?? 0;
      const val = m + off.std * rules.standard + off.plus * rules.plus;
      row[pom.id] = Math.round(val * 10) / 10;
    }
    result[size] = row;
  }
  return result;
}

// ---------------------------------------------------------------------------
// Construction / sewing templates per skirt type.
// ---------------------------------------------------------------------------

export const CONSTRUCTION_TEMPLATES: Record<string, string> = {
  "a-line":
    `A 字裙经典结构: 前后身片各收 2 个腰省定型, 侧缝 4 线包缝 1cm 缝份。
后中缝装隐形拉链 25cm, 拉链止口距领圈下 1cm, 拉头藏于后领下 0.5cm。
下摆双折 2.5cm 暗缝, 外观不可见线迹。
领圈与袖窿用 2.5cm 斜纱贴边内扣, 车缝 0.1cm 明止口。`,

  shift:
    `直筒连衣裙简洁结构: 身片无省道, 整片裁剪轮廓。
侧缝 4 线包缝 1cm 缝份。
领圈与袖窿用 1cm 斜纱包边, 0.1cm 双针明线固定。
下摆双折 2cm, 0.1cm 止口明线车缝。`,

  bodycon:
    `修身贴合款弹力结构: 面料需含 3-5% 弹性纤维。
使用 3 线包缝 + 双针绷缝防止弹力处断线。
前后公主缝从袖窿延伸至下摆, 缝份 1cm, 弧线处打剪口减张力。
领圈与袖窿用斜纱贴边反扣 0.1cm 明线固定。
后中装隐形拉链 45cm 全长, 拉链止口 1.2cm, 下摆双针绷缝 2cm 保持弹性。`,

  wrap:
    `裹身裙结构: 左前片与右前片交叠, 右前片下端内缝固定腰内扣防移位。
腰带宽 4cm 含粘合衬, 两端钉牢于侧缝腰线位置, 预留环腰打结余量。
裹襟边与领圈连续双折 1cm, 0.1cm 止口明线。
下摆 1.5cm 卷边暗缝, 下摆向侧缝延伸形成自然开衩。`,

  pleated:
    `百褶裙专项工艺: 面料先按 3cm 间距刀褶热定型, 褶宽 3cm、褶深 1.5cm。
褶顶距腰缝 5cm 处用棒针套结 (bar tack) 固定防散褶。
腰头 3cm 含粘合衬, 两端装钩扣。
侧缝装隐形拉链 20cm。
下摆 2cm 双折暗缝, 缝线不可压倒褶子。`,

  mermaid:
    `鱼尾裙复杂结构: 公主缝贯穿身片至膝上, 膝盖以下接鱼尾片。
鱼尾片缝份须打剪口减张力, 接缝处车缝 0.5cm 明止口并锁边。
侧缝可加鱼骨条加强腰部造型。
后中装隐形拉链 50cm 全长。
下摆 1cm 窄卷边, 保留鱼尾自然弧度。`,

  flared:
    `伞摆裙结构: 整圆裁片或 1/2 圆片, 腰到下摆自然大摆。
侧缝 4 线包缝 1cm 缝份。
腰头 2cm 含粘合衬, 装钩扣或纽扣。
侧缝装隐形拉链 20cm。
下摆 0.5cm 三折窄卷边, 减少下摆厚度。`,

  "shirt-dress":
    `衬衫式连衣裙结构: 前中门襟 3cm 宽含粘合衬, 装 6-8 粒 1.1cm 树脂扣。
翻领由领面、领里、衬三层组成, 领尖净距 7cm。
肩线落肩 2cm, 短袖配贴边袖口。
腰带宽 4cm 两端各开 1 个扣眼, 侧缝设带襻。
下摆 2cm 双折暗缝。`,

  slip:
    `吊带裙精细工艺: 轻薄面料全件法式缝 (French seam), 缝份反面净 0.3cm。
细肩带 0.8cm 宽, 包芯棉线穿织, 长度可调。
V 领斜纱包边 0.6cm, 0.1cm 明止口。
下摆 0.3cm 三折卷边。
侧缝装 18cm 隐形拉链。`,

  cheongsam:
    `旗袍传统工艺: 立领 3cm 高含双层粘合衬, 领嘴弧度手工归拔。
斜襟开合, 前襟从领嘴至右侧腋下装 5 粒手工盘扣。
斜襟线迹内侧装 25cm 隐形拉链辅助穿脱。
侧缝开衩 30-40cm, 开衩边斜纱包边 0.8cm 净止口。
下摆 2.5cm 双折暗缝, 侧缝底端打倒三角套结加固。`,

  "ball-gown":
    `礼服蓬裙结构: 紧身上半身含内衬, 侧缝装鱼骨 4 根。
腰线下接 1/2 圆片或多片扇形拼接, 形成超大裙摆。
裙身内加 2-3 层网纱 / 硬纱衬裙增加蓬度。
下摆内侧车马尾衬带 0.5cm 宽, 保持下摆挺括外翻。
后中装隐形拉链 60cm 全长。`,

  tiered:
    `多层蛋糕裙结构: 腰头 3cm 含衬, 下接第一层褶皱裙片。
每一层褶皱比上层长度放大 2 倍 (抽褶倍数 2×), 共 3-4 层。
各层接合处平缝后外露 0.5cm 车明线。
每层下摆 0.5cm 三折窄卷边。
侧缝装 20cm 隐形拉链贯通腰头至上层下方。`,
};

// Generic construction requirements applied on top of the skirt-specific notes.
export const COMMON_CONSTRUCTION_NOTES: string[] = [
  "侧缝: 四线包缝, 缝份 1.0cm, 压倒一侧平整。",
  "肩缝: 0.7cm 缝份, 锁边后倒缝至后片。",
  "领口 / 袖窿: 根据款式采用 1.0cm 斜纱包边或 2.5cm 斜纱贴边内扣。",
  "下摆: 默认双折 2.5cm 暗缝, 轻薄面料改为 0.5cm 三折窄卷边。",
  "内衬: 真丝 / 蕾丝 / 雪纺 / 欧根纱 面料配素绉缎内衬, 独立缝合后于肩线与腰线固定。",
  "针距: 3.0mm (12 针 / 3cm), 明线 2.5mm。缝线与面料同色号。",
  "拉链: 统一使用 YKK 尼龙隐形拉链, 拉头藏于布边反面。",
  "整烫: 裁片先烫衬, 成品入包装前整件蒸汽熨烫定型。",
];

// ---------------------------------------------------------------------------
// Bill of Materials (BOM) templates per fabric type.
// ---------------------------------------------------------------------------

export type BomItem = {
  item: string;
  spec: string;
  quantity: string;
  placement: string;
};

// Shared auxiliaries — applied after the main fabric row for every BOM.
export const SHARED_BOM_ITEMS: BomItem[] = [
  { item: "缝线", spec: "涤纶 #30, 与面料同色号", quantity: "约 100 m / 件", placement: "各缝合部位" },
  { item: "隐形拉链", spec: "YKK 尼龙隐形拉链 25cm, 同色", quantity: "1 根", placement: "后中缝或侧缝" },
  { item: "品牌织标", spec: "MaxLuLu 织唛 3×1.5cm", quantity: "1 枚", placement: "后领中" },
  { item: "洗标", spec: "尼龙满幅洗标 10×2.5cm, 中英双语", quantity: "1 枚", placement: "左侧缝距腰 15cm" },
  { item: "尺码标", spec: "纸质尺码标 1×2cm", quantity: "1 枚", placement: "品牌织标下方" },
  { item: "吊牌", spec: "双联纸质吊牌 300gsm", quantity: "1 套", placement: "左侧腋下" },
  { item: "PE 袋", spec: "独立透明 PE 袋 30×40cm", quantity: "1 个", placement: "外包装" },
];

// Per-fabric BOM overrides. Everything else (main-fabric spec, wash label, etc.)
// is derived from the `FABRICS` entry so width / shrinkage / care instructions
// stay in sync with the product catalog.
const LINING_STANDARD: BomItem = {
  item: "内衬",
  spec: "素绉缎 100% Polyester 衬里, 幅宽 150cm",
  quantity: "1.2–1.5 m",
  placement: "身片衬里",
};

const LINING_NUDE: BomItem = {
  item: "内衬",
  spec: "肤色素绉缎 100% Polyester 衬里, 幅宽 150cm",
  quantity: "1.2–1.5 m",
  placement: "身片衬里",
};

const BOM_FABRIC_OVERRIDES: Record<
  string,
  { mainQuantity?: string; extras?: BomItem[] }
> = {
  silk: { mainQuantity: "1.8–2.2 m", extras: [LINING_STANDARD] },
  chiffon: { mainQuantity: "2.0–2.5 m", extras: [LINING_STANDARD] },
  organza: { mainQuantity: "2.0–2.5 m", extras: [LINING_STANDARD] },
  lace: { extras: [LINING_NUDE] },
  denim: {
    extras: [
      {
        item: "金属扣",
        spec: "工字扣 8mm 金属色",
        quantity: "4 颗",
        placement: "口袋 / 腰头",
      },
    ],
  },
  knit: { mainQuantity: "1.3–1.6 m" },
};

function buildBomForFabric(f: Fabric): BomItem[] {
  const ov = BOM_FABRIC_OVERRIDES[f.id] ?? {};
  const mainQuantity = ov.mainQuantity ?? "1.5–1.8 m";
  const extras = ov.extras ?? [];
  return [
    {
      item: "主面料",
      spec: `${f.composition}, ${f.gsm}, 幅宽 ${f.width}, 缩水率 ${f.shrinkage}`,
      quantity: mainQuantity,
      placement: "主体",
    },
    ...extras,
    {
      item: "缝线",
      spec: "涤纶 #30, 与面料同色号",
      quantity: "约 100 m / 件",
      placement: "各缝合部位",
    },
    {
      item: "隐形拉链",
      spec: "YKK 尼龙隐形拉链 25cm, 同色",
      quantity: "1 根",
      placement: "后中缝或侧缝",
    },
    {
      item: "品牌织标",
      spec: "MaxLuLu 织唛 3×1.5cm",
      quantity: "1 枚",
      placement: "后领中",
    },
    {
      item: "洗标",
      spec: `尼龙满幅洗标 10×2.5cm, 中英双语。洗涤说明: ${f.careInstructions}`,
      quantity: "1 枚",
      placement: "左侧缝距腰 15cm",
    },
    {
      item: "尺码标",
      spec: "纸质尺码标 1×2cm",
      quantity: "1 枚",
      placement: "品牌织标下方",
    },
    {
      item: "吊牌",
      spec: "双联纸质吊牌 300gsm",
      quantity: "1 套",
      placement: "左侧腋下",
    },
    {
      item: "PE 袋",
      spec: "独立透明 PE 袋 30×40cm",
      quantity: "1 个",
      placement: "外包装",
    },
  ];
}

export const BOM_TEMPLATES: Record<string, BomItem[]> = Object.fromEntries(
  FABRICS.map((f) => [f.id, buildBomForFabric(f)])
);

// ---------------------------------------------------------------------------
// Labeling & packaging — fixed template applied on Page 7 of the Tech Pack.
// ---------------------------------------------------------------------------

export const PACKAGING_TEMPLATE = {
  brandLabel: {
    title: "品牌织标 (Main Label)",
    spec: "MaxLuLu 双层缎面织唛, 尺寸 3×1.5cm, 米白底粉紫字, 四周 0.1cm 明线缝合于后领中。",
  },
  careLabel: {
    title: "洗标 (Care Label)",
    spec: "尼龙满幅洗标 10×2.5cm, 印刷中英双语, 含以下字段: 成分 / 洗涤符号 / 产地 / 执行标准 / 品牌客服电话。缝于左侧缝距腰 15cm 处。",
  },
  sizeLabel: {
    title: "尺码标 (Size Label)",
    spec: "纸质尺码标 1×2cm 印刷, 缝于品牌织标下方, 与洗标同一缝线。",
  },
  hangTag: {
    title: "吊牌 (Hang Tag)",
    spec: "双联纸质吊牌 300GSM, 含款号 / 款名 / 尺码 / 条形码 / 建议零售价, 棉线 + 塑封丁字钉安装于左腋下。",
  },
  packaging: {
    title: "包装方式 (Packaging)",
    spec: "整件蒸汽熨烫后套 30×40cm 独立 PE 袋, 袋口双面胶封口; 礼盒装另配防尘绒布袋 + 印花包装盒 32×24×4cm。",
  },
};

// ---------------------------------------------------------------------------
// Season helper — decide SS / AW by month (Asia-Pacific cycle).
// ---------------------------------------------------------------------------

export function seasonFromDate(d: Date): string {
  const m = d.getMonth() + 1;
  const y = d.getFullYear();
  if (m >= 2 && m <= 7) return `SS ${y}`;
  return `AW ${m >= 8 ? y : y - 1}`;
}
