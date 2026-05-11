/**
 * 永鑫科技 GPT-Image-2 — OpenAI 兼容 /images/generations
 * 同步返回 data[0].url 或 data[0].b64_json
 *
 * 文件名保留为 suchuang.ts 仅为兼容历史 import 路径，
 * 实际后端已切换到永鑫科技。
 */

import { readFile } from "fs/promises";
import path from "path";

import type { TryOnProviderCapability } from "@/lib/my-studio/types";

const API_KEY = process.env.YXAI_API_KEY!;
const BASE_URL = process.env.YXAI_BASE_URL || "https://yxai.anthropic.edu.pl/v1";
const IMAGE_MODEL = process.env.YXAI_IMAGE_MODEL || "gpt-image-2";
const IMAGE2_EDIT_TIMEOUT_MS = 90_000;

export const GPT_IMAGE2_PROVIDER = "yxai";

export function getGPTImage2Config() {
  return {
    provider: GPT_IMAGE2_PROVIDER,
    baseUrl: BASE_URL,
    model: IMAGE_MODEL,
    hasApiKey: Boolean(process.env.YXAI_API_KEY),
  };
}

export function getTryOnProviderCapability(): TryOnProviderCapability {
  return {
    provider: GPT_IMAGE2_PROVIDER,
    model: IMAGE_MODEL,
    supportsTextToImage: Boolean(process.env.YXAI_API_KEY),
    supportsImageReference: Boolean(process.env.YXAI_API_KEY),
    supportsImageEdit: Boolean(process.env.YXAI_API_KEY),
    supportsMask: false,
    supportsGarmentTryOn: false,
    supportsPoseControl: false,
    supportsMultiImageInput: false,
    notes: [
      "YXAI image2 supports text-to-image through /images/generations.",
      "YXAI image2 supports a single real image input through /images/edits multipart form-data.",
      "Mask and dedicated garment try-on are not enabled in the current verified YXAI integration.",
    ],
  };
}

export async function generateMaskedGarmentTryOn(_input: {
  patternImageUrl: string;
  garmentTemplateImageUrl?: string;
  garmentRegionMaskUrl?: string;
  modelBaseImageUrl?: string;
  bodyProfile?: unknown;
  garmentTemplate?: unknown;
  prompt: string;
  negativePrompt?: string;
}): Promise<{
  imageUrl: string;
  provider: string;
  model: string;
  raw?: unknown;
}> {
  throw new Error("MASKED_GARMENT_TRYON_PROVIDER_NOT_CONFIGURED");
}

interface OpenAIImageResponse {
  created?: number;
  data: Array<{
    url?: string;
    b64_json?: string;
    revised_prompt?: string;
  }>;
  error?: { message?: string; type?: string; code?: string };
}

type ResolvedEditImage = {
  buffer: Buffer;
  mimeType: string;
  fileName: string;
};

type GPTImage2EditInput = {
  prompt: string;
  imageUrl?: string;
  imagePath?: string;
  imageBuffer?: Buffer;
  imageMimeType?: string;
  size?: string;
  n?: number;
  timeoutMs?: number;
};

type GPTImage2EditResult = {
  imageUrl?: string;
  base64?: string;
  provider: string;
  model: string;
  raw?: unknown;
};

const SIZE_MAP: Record<string, string> = {
  "1:1": "1024x1024",
  "3:4": "768x1024",
  "4:3": "1024x768",
  "9:16": "576x1024",
  "16:9": "1024x576",
  "2:3": "768x1152",
  "3:2": "1152x768",
};

function normalizeSize(input?: string): string {
  if (!input) return "1024x1024";
  if (SIZE_MAP[input]) return SIZE_MAP[input];
  if (/^\d+x\d+$/.test(input)) return input;
  return "1024x1024";
}

function normalizeBaseUrl(input: string): string {
  return input.replace(/\/+$/, "");
}

function isAbortLikeError(error: unknown): boolean {
  return Boolean(error && typeof error === "object" && "name" in error && (error as { name?: unknown }).name === "AbortError");
}

function mimeTypeFromName(fileName: string, fallback = "image/png"): string {
  const ext = path.extname(fileName).toLowerCase();
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  if (ext === ".png") return "image/png";
  return fallback;
}

function parseDataUrl(input: string): ResolvedEditImage | null {
  const match = input.match(/^data:([^;,]+);base64,(.+)$/);
  if (!match) return null;
  return {
    buffer: Buffer.from(match[2], "base64"),
    mimeType: match[1] || "image/png",
    fileName: "reference.png",
  };
}

async function resolveEditImage(input: GPTImage2EditInput, signal?: AbortSignal): Promise<ResolvedEditImage> {
  if (input.imageBuffer) {
    return {
      buffer: input.imageBuffer,
      mimeType: input.imageMimeType || "image/png",
      fileName: "reference.png",
    };
  }

  if (input.imagePath) {
    const resolvedPath = path.isAbsolute(input.imagePath)
      ? input.imagePath
      : path.join(process.cwd(), input.imagePath);
    const buffer = await readFile(resolvedPath);
    return {
      buffer,
      mimeType: input.imageMimeType || mimeTypeFromName(resolvedPath),
      fileName: path.basename(resolvedPath) || "reference.png",
    };
  }

  if (input.imageUrl) {
    const dataUrl = parseDataUrl(input.imageUrl);
    if (dataUrl) return dataUrl;

    if (input.imageUrl.startsWith("/")) {
      const localPublicPath = path.join(process.cwd(), "public", input.imageUrl.replace(/^\/+/, ""));
      const buffer = await readFile(localPublicPath);
      return {
        buffer,
        mimeType: input.imageMimeType || mimeTypeFromName(localPublicPath),
        fileName: path.basename(localPublicPath) || "reference.png",
      };
    }

    const res = await fetch(input.imageUrl, { signal });
    if (!res.ok) {
      throw new Error(`IMAGE2_EDIT_INPUT_FETCH_FAILED:${res.status}`);
    }
    const arrayBuffer = await res.arrayBuffer();
    const contentType = res.headers.get("content-type") || input.imageMimeType || "image/png";
    const urlFileName = (() => {
      try {
        const parsed = new URL(input.imageUrl || "");
        return path.basename(parsed.pathname) || "reference.png";
      } catch {
        return "reference.png";
      }
    })();
    return {
      buffer: Buffer.from(arrayBuffer),
      mimeType: contentType.split(";")[0] || "image/png",
      fileName: urlFileName,
    };
  }

  throw new Error("IMAGE2_EDIT_INPUT_REQUIRED");
}

function safeProviderError(status: number, text: string): string {
  const compact = text
    .replace(/Bearer\s+[A-Za-z0-9._-]+/g, "Bearer ***")
    .replace(/"api[_-]?key"\s*:\s*"[^"]+"/gi, '"apiKey":"***"')
    .slice(0, 240);
  return `IMAGE2_EDIT_FAILED:HTTP_${status}:${compact}`;
}

export async function generateWithGPTImage2Edit(input: GPTImage2EditInput): Promise<GPTImage2EditResult> {
  if (!API_KEY) {
    throw new Error("IMAGE2_EDIT_API_KEY_MISSING");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), input.timeoutMs ?? IMAGE2_EDIT_TIMEOUT_MS);

  try {
    const resolvedImage = await resolveEditImage(input, controller.signal);
    const size = normalizeSize(input.size);
    const n = Math.max(1, Math.min(input.n ?? 1, 4));
    const form = new FormData();
    form.append("model", IMAGE_MODEL);
    form.append("prompt", input.prompt);
    form.append("size", size);
    form.append("n", String(n));

    const imageBytes = Uint8Array.from(resolvedImage.buffer);
    form.append("image", new Blob([imageBytes], { type: resolvedImage.mimeType }), resolvedImage.fileName);

    const res = await fetch(`${normalizeBaseUrl(BASE_URL)}/images/edits`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
      body: form,
      signal: controller.signal,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(safeProviderError(res.status, text));
    }

    const data = (await res.json()) as OpenAIImageResponse;
    if (data.error) {
      throw new Error(`IMAGE2_EDIT_FAILED:${data.error.code || data.error.type || data.error.message || "provider_error"}`);
    }

    const first = Array.isArray(data.data) ? data.data[0] : undefined;
    if (!first?.url && !first?.b64_json) {
      throw new Error("IMAGE2_EDIT_EMPTY_RESULT");
    }

    return {
      imageUrl: first.url,
      base64: first.b64_json ? `data:image/png;base64,${first.b64_json}` : undefined,
      provider: GPT_IMAGE2_PROVIDER,
      model: IMAGE_MODEL,
      raw: {
        created: data.created,
        revised_prompt: first.revised_prompt,
        output: first.url ? "url" : "base64",
      },
    };
  } catch (error) {
    if (isAbortLikeError(error)) {
      throw new Error("IMAGE2_EDIT_TIMEOUT");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * 调永鑫科技 OpenAI 兼容生图接口。
 * 返回图像 URL 数组（如永鑫只回 base64，会转成 data URL）。
 */
export async function generateWithGPTImage2(
  prompt: string,
  options?: {
    size?: string;
    n?: number;
    /**
     * 兼容旧调用：可传入参考图 URL 数组，自动拼接进 prompt 文本。
     * （OpenAI 标准 /images/generations 不接受图片输入；如需图生图请用
     * /images/edits，目前永鑫接口未启用，先以文本提示形式承接。）
     */
    urls?: string[];
  }
): Promise<string[]> {
  const size = normalizeSize(options?.size);
  const n = Math.max(1, Math.min(options?.n ?? 1, 4));

  let finalPrompt = prompt;
  if (options?.urls && options.urls.length > 0) {
    const refs = options.urls.map((u, i) => `[Reference image ${i + 1}]: ${u}`).join("\n");
    finalPrompt = `${prompt}\n\nUse these as visual reference inputs:\n${refs}`;
  }

  const res = await fetch(`${BASE_URL}/images/generations`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: IMAGE_MODEL,
      prompt: finalPrompt,
      size,
      n,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`永鑫科技生图失败: HTTP ${res.status} ${text.slice(0, 200)}`);
  }

  const data = (await res.json()) as OpenAIImageResponse;

  if (data.error) {
    throw new Error(`永鑫科技生图失败: ${data.error.message || data.error.code || "unknown"}`);
  }

  if (!Array.isArray(data.data) || data.data.length === 0) {
    throw new Error("永鑫科技生图失败: 返回为空");
  }

  return data.data
    .map((item) => {
      if (item.url) return item.url;
      if (item.b64_json) return `data:image/png;base64,${item.b64_json}`;
      return null;
    })
    .filter((u): u is string => typeof u === "string");
}
