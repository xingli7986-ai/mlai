/**
 * AI Studio 工具 Prompt 模板库
 * 每个工具对应一个 buildXxxPrompt 函数
 */

// ========== 图案工作室 ==========

/** 01 图案生成 */
export function buildPatternGeneratePrompt(params: {
  patternType: string;
  arrangement: string;
  colorPalette: string;
  userPrompt: string;
}): string {
  return `Generate a seamless textile print pattern for high-end women's fashion.
Pattern type: ${params.patternType}
Arrangement: ${params.arrangement}
Color palette: ${params.colorPalette}
Design description: ${params.userPrompt}
Style: Suitable for MaxLuLu brand - elegant, French-romantic with Eastern charm.
Output: Square format, tileable, high resolution, no text, no watermark.
Background should be clean and the pattern should be production-ready for digital fabric printing.`;
}

/** 02 画风复刻 — 需要参考图，prompt 只描述新图案内容 */
export function buildStyleReplicatePrompt(params: {
  userPrompt: string;
  styleFidelity?: number;
}): string {
  return `Analyze the artistic style of the reference image carefully - including color palette, brushwork, texture, mood, and composition style.
Now create a completely NEW textile print pattern in exactly the same artistic style.
The new pattern should depict: ${params.userPrompt}
Style fidelity: ${params.styleFidelity ?? 0.8}
Output: Square format, tileable, suitable for fabric printing. No text, no watermark.`;
}

/** 03 四方连续 — 需要原图 */
export function buildSeamlessTilePrompt(): string {
  return `Take this design and create a seamless four-way repeating tile pattern from it.
The pattern must tile perfectly in all directions (left-right, top-bottom) with no visible seams.
Maintain the original design's colors, style, and key elements.
Output: Square format, exactly tileable. When repeated 3x3, the result should look like one continuous pattern with no borders visible.`;
}

/** 04 图案融合 — 需要两张图 */
export function buildPatternFusionPrompt(params: {
  weightA: number;
  weightB: number;
  blendMode: string;
  userPrompt?: string;
}): string {
  return `Blend these two patterns into a single cohesive new textile print design.
Pattern A weight: ${params.weightA}%
Pattern B weight: ${params.weightB}%
Blend mode: ${params.blendMode}
${params.userPrompt ? `Additional instructions: ${params.userPrompt}` : ""}
Output: A unified, harmonious pattern suitable for fabric printing. Square format, tileable. No text, no watermark.`;
}

/** 05 工艺融合 — 需要原图 */
export function buildCraftFusionPrompt(params: {
  craftType: string;
  fabricBase: string;
}): string {
  const craftDescriptions: Record<string, string> = {
    embroidery:
      "Embroidery: visible thread texture, slight dimensional relief, stitch patterns",
    "wax-printing":
      "Wax printing (蜡染): wax-resist cracks, organic color bleeding, batik texture",
    "screen-printing":
      "Screen printing: slight ink layering, halftone dots visible at edges",
    "heat-transfer":
      "Heat transfer: smooth glossy finish, vivid colors, slight sheen",
    "digital-direct":
      "Digital direct printing: photographic detail, smooth gradients, fabric texture visible",
    "hand-painted":
      "Hand painted: brush strokes, slight irregularity, artistic feel",
    watermark:
      "Watermark printing: subtle, tone-on-tone, visible only at certain angles",
    "gold-foil":
      "Gold foil (烫金): metallic reflective surface, embossed feel, luxury texture",
  };
  return `Take this pattern design and render it as if it were produced using the following technique on ${params.fabricBase} fabric.
Craft technique: ${craftDescriptions[params.craftType] || params.craftType}
Show realistic craft-specific characteristics.
Output: Show the pattern applied on a flat piece of ${params.fabricBase} fabric, photographed from above. No text, no watermark.`;
}

/** 06 图案涂改 — 需要原图（用户在前端画了标记） */
export function buildPatternEditPrompt(params: {
  editDescription: string;
}): string {
  return `I have marked an area in this pattern that I want to modify.
The marked area should be changed to: ${params.editDescription}
Keep everything outside the marked area exactly the same.
The modification should blend naturally with the surrounding pattern.
Output: The full pattern with only the marked area changed.`;
}

/** 07 图案变清晰 — 不需要 prompt，走阿里云超分接口 */

// ========== 服装实验室 ==========

/** 08 线稿生成 */
export function buildSketchGeneratePrompt(params: {
  garmentType: string;
  skirtType?: string;
  neckline?: string;
  sleeveType?: string;
  skirtLength?: string;
  userPrompt?: string;
  view: string;
}): string {
  return `Generate a professional fashion technical flat sketch (fashion croquis / tech pack illustration).
Garment type: ${params.garmentType}
${params.skirtType ? `Silhouette: ${params.skirtType}` : ""}
${params.neckline ? `Neckline: ${params.neckline}` : ""}
${params.sleeveType ? `Sleeve: ${params.sleeveType}` : ""}
${params.skirtLength ? `Length: ${params.skirtLength}` : ""}
${params.userPrompt ? `Additional details: ${params.userPrompt}` : ""}
View: ${
    params.view === "both"
      ? "Front view and back view side by side"
      : params.view === "front"
      ? "Front view only"
      : "Back view only"
  }
Style: Clean black line drawing on white background. No color fill. No model/body.
Show construction details: seam lines, darts, closures, topstitching.
Professional fashion illustration standard suitable for factory tech pack.`;
}

/** 09 线稿成款 — 需要线稿图 */
export function buildSketchToDesignPrompt(params: {
  fabricName: string;
  color: string;
  printDescription?: string;
  scene: string;
}): string {
  return `Transform this fashion technical sketch into a photorealistic garment visualization.
Apply the following specifications:
- Fabric: ${params.fabricName}
- Primary color: ${params.color}
${params.printDescription ? `- Pattern/Print: ${params.printDescription}` : ""}
- Background: ${
    params.scene === "plain"
      ? "Solid white background"
      : params.scene === "studio"
      ? "Studio lighting, neutral backdrop"
      : "Natural outdoor setting"
  }
Show the garment as if photographed on a flat surface or invisible mannequin.
Maintain all structural details from the original sketch.
Render realistic fabric drape, texture, and sheen.`;
}

/** 10 局部改款 — 需要原图（用户画了标记） */
export function buildPartialModifyPrompt(params: {
  editDescription: string;
}): string {
  return `Modify this garment design in the marked area only.
Modification: ${params.editDescription}
Keep the rest of the garment exactly the same - same fabric, same color, same fit.
The modification should look natural and proportionally correct.
Maintain the original image style (sketch or photorealistic).`;
}

/** 11 款式创新 */
export function buildStyleInnovatePrompt(params: {
  garmentType: string;
  styleTags: string[];
  season: string;
  userPrompt?: string;
}): string {
  return `Design an innovative and original women's ${params.garmentType} for ${params.season}.
Style direction: ${params.styleTags.join(", ")}
${params.userPrompt ? `Design brief: ${params.userPrompt}` : ""}
Brand context: MaxLuLu - elegant, French-romantic, Eastern charm, known for signature prints.
Output: Show the garment as a fashion illustration, front view, on a figure silhouette.
The design should be production-feasible and commercially viable for a mid-to-high-end brand.`;
}

/** 12 风格融合 — 需要两张图 */
export function buildStyleFusionPrompt(params: {
  fromA: string;
  fromB: string;
  userPrompt?: string;
}): string {
  return `Create a new garment design that fuses elements from these two reference designs.
From Design A, take: ${params.fromA}
From Design B, take: ${params.fromB}
${params.userPrompt ? `Additional direction: ${params.userPrompt}` : ""}
Output: A cohesive new design that feels intentional, not forced.
Show as a fashion illustration suitable for a lookbook.`;
}

/** 13 系列配色 — 需要原图 */
export function buildColorSeriesPrompt(params: {
  colorStyle: string;
  count: number;
  keepColor?: string;
}): string {
  return `Take this garment design and create ${params.count} different color variations.
Color palette style: ${params.colorStyle}
${
  params.keepColor
    ? `Keep ${params.keepColor} unchanged, only change the other colors.`
    : ""
}
Show all variations in a grid layout, each clearly different but maintaining the same garment structure.
Each color scheme should be commercially viable for a women's fashion brand.`;
}

/** 14 定向换色 — 需要原图 */
export function buildRecolorPrompt(params: {
  sourceColor: string;
  targetColor: string;
}): string {
  return `In this garment image, change the ${params.sourceColor} areas to ${params.targetColor}.
Keep all other colors exactly the same.
Maintain the fabric texture, lighting, and shadows - only change the hue.
The result should look natural, as if the garment was originally made in this color.`;
}

/** 15 面料上身 — 需要面料图+服装图 */
export function buildFabricApplyPrompt(params: {
  fabricDescription: string;
  area: string;
}): string {
  return `Apply this fabric texture/pattern to the garment shown in the second image.
Application area: ${params.area === "full" ? "Entire garment" : params.area}
The fabric should show realistic draping, folds, and natural material behavior.
Fabric properties: ${params.fabricDescription}
Show appropriate light reflection and shadow based on the fabric type.
Output: A photorealistic rendering of the garment in this fabric.`;
}

/** 16 图案上身 — 需要印花图+服装图或裙型选择 */
export function buildPatternApplyPrompt(params: {
  skirtType?: string;
  placement: string;
  scale: string;
  fabricName?: string;
}): string {
  return `Apply this textile print pattern to ${
    params.skirtType
      ? `a ${params.skirtType} dress`
      : "the garment in the second image"
  }.
Print placement: ${
    params.placement === "full"
      ? "All-over print covering the entire garment"
      : params.placement
  }
Print scale: ${params.scale}
${params.fabricName ? `Fabric type: ${params.fabricName}` : ""}
Show realistic fabric draping with the print following the garment's contours and folds.
The print should wrap around curves naturally, not look like a flat sticker.
Output: Photorealistic product photo suitable for e-commerce. No text, no watermark.`;
}

// ========== Tool → Prompt Builder Map ==========

export type StudioTool =
  | "pattern-generate"
  | "style-replicate"
  | "seamless-tile"
  | "pattern-fusion"
  | "craft-fusion"
  | "pattern-edit"
  | "sketch-generate"
  | "sketch-to-design"
  | "partial-modify"
  | "style-innovate"
  | "style-fusion"
  | "color-series"
  | "recolor"
  | "fabric-apply"
  | "pattern-apply";

export const TOOL_PROMPT_MAP: Record<
  StudioTool,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (params: any) => string
> = {
  "pattern-generate": buildPatternGeneratePrompt,
  "style-replicate": buildStyleReplicatePrompt,
  "seamless-tile": buildSeamlessTilePrompt,
  "pattern-fusion": buildPatternFusionPrompt,
  "craft-fusion": buildCraftFusionPrompt,
  "pattern-edit": buildPatternEditPrompt,
  "sketch-generate": buildSketchGeneratePrompt,
  "sketch-to-design": buildSketchToDesignPrompt,
  "partial-modify": buildPartialModifyPrompt,
  "style-innovate": buildStyleInnovatePrompt,
  "style-fusion": buildStyleFusionPrompt,
  "color-series": buildColorSeriesPrompt,
  recolor: buildRecolorPrompt,
  "fabric-apply": buildFabricApplyPrompt,
  "pattern-apply": buildPatternApplyPrompt,
};
