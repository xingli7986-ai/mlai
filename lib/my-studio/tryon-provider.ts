import type {
  StudioBodyProfile,
  GarmentTemplateAsset,
  TryOnFidelityMode,
  TryOnProviderCapability,
  TryOnReferenceMode,
} from "@/lib/my-studio/types";

const DEFAULT_FASHN_BASE_URL = "https://api.fashn.ai";
const DEFAULT_TRYON_MODEL = "tryon-v1.6";
const DEFAULT_TRYON_MAX_MODEL = "tryon-max";
const POLL_INTERVAL_MS = 2000;
const MAX_POLL_MS = 90_000;

export type FashnTryOnMode = "preview" | "confirm";

export interface FashnTryOnInput {
  modelImageUrl: string;
  garmentImageUrl: string;
  category: "one-pieces";
  mode: FashnTryOnMode;
  bodyProfile?: StudioBodyProfile;
  garmentTemplate?: GarmentTemplateAsset | Record<string, unknown>;
}

export interface FashnTryOnResult {
  imageUrl: string;
  provider: "fashn";
  model: string;
  fidelityMode: TryOnFidelityMode;
  referenceMode: TryOnReferenceMode;
  patternReferenceUsed: true;
  maskUsed: false;
  isProductionReady: false;
  warnings: string[];
  providerJobId?: string;
  providerResultUrl?: string;
}

type FashnRunResponse = {
  id?: string;
  prediction_id?: string;
  status?: string;
  output?: unknown;
  error?: unknown;
};

type FashnStatusResponse = FashnRunResponse & {
  logs?: string;
};

export function getFashnProviderCapability(): TryOnProviderCapability {
  return {
    provider: "fashn",
    model: process.env.FASHN_TRYON_MODEL || DEFAULT_TRYON_MODEL,
    supportsTextToImage: false,
    supportsImageReference: Boolean(process.env.FASHN_API_KEY),
    supportsImageEdit: false,
    supportsMask: false,
    supportsGarmentTryOn: Boolean(process.env.FASHN_API_KEY),
    supportsPoseControl: false,
    supportsMultiImageInput: Boolean(process.env.FASHN_API_KEY),
    notes: [
      "FASHN Try-On v1.6 uses true model and garment image inputs.",
      "It is used as the consumer real-time garment try-on provider.",
      "Try-On Max is reserved for high-quality confirmation/review images.",
    ],
  };
}

export async function generateFashnTryOn(input: FashnTryOnInput): Promise<FashnTryOnResult> {
  const model = process.env.FASHN_TRYON_MODEL || DEFAULT_TRYON_MODEL;
  const result = await runFashnPrediction(model, {
    model_image: input.modelImageUrl,
    garment_image: input.garmentImageUrl,
    category: input.category,
    garment_photo_type: "flat-lay",
    mode: "balanced",
    output_format: "jpeg",
    return_base64: false,
  });

  return {
    imageUrl: result.imageUrl,
    provider: "fashn",
    model,
    fidelityMode: "garment_tryon",
    referenceMode: "true_image_reference",
    patternReferenceUsed: true,
    maskUsed: false,
    isProductionReady: false,
    warnings: ["高保真试穿已生成，生产前仍需确认版型与工艺细节。"],
    providerJobId: result.providerJobId,
    providerResultUrl: result.imageUrl,
  };
}

export async function generateFashnTryOnMax(input: FashnTryOnInput): Promise<FashnTryOnResult> {
  const model = process.env.FASHN_TRYON_MAX_MODEL || DEFAULT_TRYON_MAX_MODEL;
  const result = await runFashnPrediction(model, {
    product_image: input.garmentImageUrl,
    model_image: input.modelImageUrl,
    prompt: "Preserve the selected garment, print, and silhouette for a high-quality fashion confirmation image.",
    resolution: "1k",
    generation_mode: "balanced",
    output_format: "png",
    return_base64: false,
  });

  return {
    imageUrl: result.imageUrl,
    provider: "fashn",
    model,
    fidelityMode: "garment_tryon_high_quality",
    referenceMode: "true_image_reference",
    patternReferenceUsed: true,
    maskUsed: false,
    isProductionReady: false,
    warnings: ["高质量确认图已生成，生产前仍需后台审核。"],
    providerJobId: result.providerJobId,
    providerResultUrl: result.imageUrl,
  };
}

async function runFashnPrediction(
  modelName: string,
  inputs: Record<string, unknown>,
): Promise<{ imageUrl: string; providerJobId?: string }> {
  const apiKey = process.env.FASHN_API_KEY;
  if (!apiKey) throw new Error("FASHN_PROVIDER_NOT_CONFIGURED");

  const runResponse = await fetch(fashnUrl("/run"), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model_name: modelName,
      inputs,
    }),
  });

  const runData = (await safeJson(runResponse)) as FashnRunResponse;
  if (!runResponse.ok) {
    throw new Error("FASHN_TRYON_FAILED");
  }

  const immediateUrl = extractOutputUrl(runData.output);
  const jobId = runData.id || runData.prediction_id;
  if (immediateUrl) return { imageUrl: immediateUrl, providerJobId: jobId };
  if (!jobId) throw new Error("FASHN_TRYON_FAILED");

  const startedAt = Date.now();
  while (Date.now() - startedAt < MAX_POLL_MS) {
    await sleep(POLL_INTERVAL_MS);
    const statusResponse = await fetch(fashnUrl(`/status/${encodeURIComponent(jobId)}`), {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });
    const statusData = (await safeJson(statusResponse)) as FashnStatusResponse;
    if (!statusResponse.ok) {
      throw new Error("FASHN_TRYON_FAILED");
    }

    const status = String(statusData.status || "").toLowerCase();
    const outputUrl = extractOutputUrl(statusData.output);
    if ((status === "completed" || status === "succeeded" || status === "success") && outputUrl) {
      return { imageUrl: outputUrl, providerJobId: jobId };
    }
    if (status === "failed" || status === "canceled" || status === "cancelled" || status === "timed_out") {
      throw new Error("FASHN_TRYON_FAILED");
    }
  }

  throw new Error("FASHN_TRYON_TIMEOUT");
}

function fashnUrl(path: string): string {
  const rawBase = (process.env.FASHN_BASE_URL || DEFAULT_FASHN_BASE_URL).replace(/\/+$/, "");
  const base = rawBase.endsWith("/v1") ? rawBase : `${rawBase}/v1`;
  return `${base}${path}`;
}

async function safeJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

function extractOutputUrl(output: unknown): string | undefined {
  if (typeof output === "string") return output;
  if (Array.isArray(output)) {
    const first = output.find((item) => typeof item === "string" || isImageObject(item));
    if (typeof first === "string") return first;
    if (isImageObject(first)) return first.url || first.image_url;
  }
  if (isImageObject(output)) return output.url || output.image_url;
  return undefined;
}

function isImageObject(value: unknown): value is { url?: string; image_url?: string } {
  return Boolean(value && typeof value === "object");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
