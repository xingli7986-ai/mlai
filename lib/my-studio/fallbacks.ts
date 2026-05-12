import type { StudioResultKind } from "./types";

const A_WORK = "/assets/my-studio/04_work_thumbnails";
const A_TRY = "/assets/my-studio/05_try_on_results";

export const STUDIO_FALLBACK_IMAGES = {
  pattern: [
    `${A_WORK}/maxlulu-my-studio-work-rose-vine-print-1080x1440.png`,
    `${A_WORK}/maxlulu-pattern-teal-peony-1080x1440.png`,
    `${A_WORK}/maxlulu-my-studio-work-blue-floral-print-1080x1440.png`,
    `${A_WORK}/maxlulu-pattern-coral-spring-1080x1440.png`,
  ],
  seamless: [
    `${A_WORK}/maxlulu-pattern-watercolor-pink-1080x1440.png`,
    `${A_WORK}/maxlulu-pattern-soft-pink-peony-1080x1440.png`,
    `${A_WORK}/maxlulu-pattern-teal-peony-1080x1440.png`,
    `${A_WORK}/maxlulu-my-studio-work-blue-floral-print-1080x1440.png`,
  ],
  tryOn: [
    `${A_TRY}/tryon-floral-fullbody-front-1080x1440.png`,
    `${A_TRY}/tryon-floral-portrait-side-1080x1440.png`,
    `${A_TRY}/tryon-floral-wrap-front-1080x1440.png`,
  ],
} satisfies Record<Exclude<StudioResultKind, "sketch">, string[]>;

export function resultKindForTool(tool: string): StudioResultKind {
  if (tool === "seamless-tile" || tool === "seamless") return "seamless";
  if (tool === "pattern-apply" || tool === "try-on") return "tryOn";
  if (tool === "sketch-generate" || tool === "sketch") return "sketch";
  return "pattern";
}

export function resultTypeForTool(tool: string): string {
  const kind = resultKindForTool(tool);
  if (kind === "seamless") return "fabric_layout_seamless_pattern";
  if (kind === "tryOn") return "model_garment_wearing_image";
  if (kind === "sketch") return "front_back_fashion_line_sketch";
  return "floral_print_pattern";
}

export function fallbackMessageForTool(tool: string): string {
  const kind = resultKindForTool(tool);
  if (kind === "seamless") return "AI 面料铺排服务暂不可用，已返回可继续流程的示例面料图。";
  if (kind === "tryOn") return "AI 试穿服务暂不可用，已返回可继续流程的示例试穿图。";
  if (kind === "sketch") return "AI 线稿服务暂不可用，已返回可继续流程的示例线稿。";
  return "AI 印花生成服务暂不可用，已返回可继续流程的示例印花。";
}

export function getFallbackImagesForTool(tool: string, count = 1): string[] {
  const kind = resultKindForTool(tool);
  if (kind === "sketch") return [createSketchFallbackDataUrl()];
  const pool = STUDIO_FALLBACK_IMAGES[kind];
  const safeCount = Math.max(1, Math.min(count, pool.length));
  return pool.slice(0, safeCount);
}

function createSketchFallbackDataUrl(): string {
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900">
  <rect width="1200" height="900" fill="#FCFDFD"/>
  <g fill="none" stroke-linecap="round" stroke-linejoin="round">
    <g transform="translate(260 115)" stroke="#9B7A68" stroke-width="7">
      <text x="150" y="20" text-anchor="middle" fill="#234A58" stroke="none" font-family="serif" font-size="42">Front</text>
      <ellipse cx="150" cy="92" rx="34" ry="40"/>
      <path d="M121 132c8 10 18 15 29 15s22-5 30-15"/>
      <path d="M90 190c35-26 85-26 120 0l20 54-46 26-12 256H128l-12-256-46-26z"/>
      <path d="M112 250c24 32 53 48 87 0"/>
      <path d="M128 526c-34 52-58 108-72 168h188c-14-60-38-116-72-168"/>
      <path d="M150 288v390"/>
      <path d="M104 386h92"/>
      <path d="M82 694c42 14 92 14 136 0"/>
    </g>
    <g transform="translate(700 115)" stroke="#879397" stroke-width="7">
      <text x="150" y="20" text-anchor="middle" fill="#234A58" stroke="none" font-family="serif" font-size="42">Back</text>
      <ellipse cx="150" cy="92" rx="34" ry="40"/>
      <path d="M116 132c12 8 24 12 34 12s23-4 34-12"/>
      <path d="M90 190c35-26 85-26 120 0l20 54-46 26-12 256H128l-12-256-46-26z"/>
      <path d="M112 250c20 18 55 18 76 0"/>
      <path d="M128 526c-34 52-58 108-72 168h188c-14-60-38-116-72-168"/>
      <path d="M150 290v390"/>
      <path d="M104 386h92"/>
      <path d="M82 694c42 14 92 14 136 0"/>
    </g>
  </g>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.trim())}`;
}
