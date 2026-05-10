import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import { getAuthUser } from "@/lib/getAuthUser";
import { uploadBufferToR2 } from "@/lib/upload";
import {
  prepareGarmentImageAsset,
  selectModelBaseAsset,
} from "@/lib/my-studio/garment-template-render";
import {
  generateFashnTryOn,
  generateFashnTryOnMax,
  getFashnProviderCapability,
} from "@/lib/my-studio/tryon-provider";
import {
  generateMaskedGarmentTryOn,
  generateWithGPTImage2,
  generateWithGPTImage2Edit,
  getGPTImage2Config,
  getTryOnProviderCapability as getYxaiTryOnProviderCapability,
} from "@/lib/suchuang";
import {
  TOOL_PROMPT_MAP,
  type StudioTool,
} from "@/lib/ai-studio-prompts";
import { getUserRole } from "@/lib/userRole";
import { checkUsageLimit, recordUsage, getDailyUsage } from "@/lib/aiUsage";
import {
  fallbackMessageForTool,
  getFallbackImagesForTool,
  resultTypeForTool,
} from "@/lib/my-studio/fallbacks";
import type {
  TryOnFidelityMode,
  TryOnProviderCapability,
  TryOnQualityScores,
  TryOnReferenceMode,
} from "@/lib/my-studio/types";

export const runtime = "nodejs";
export const maxDuration = 120;

const GEMINI_MODEL_ID = "gemini-3-pro-image-preview";

type StudioModel = "gpt-image-2" | "gemini";

interface StudioGenerateRequest {
  tool?: StudioTool;
  toolType?: StudioTool | "seamless" | "try-on" | "sketch";
  model?: StudioModel;
  prompt?: string;
  params?: Record<string, unknown>;
  images?: string[]; // base64 data URLs or plain base64
  sourceImageUrl?: string;
  sourceImageUrls?: string[];
  workId?: string;
  patternAssetId?: string;
  patternImageUrl?: string;
  patternTileAssetId?: string;
  garmentTemplateAssetId?: string;
  modelBaseAssetId?: string;
  bodyProfile?: Record<string, unknown>;
  garmentTemplate?: Record<string, unknown>;
  requestedFidelityMode?: TryOnFidelityMode;
  allowDegrade?: boolean;
  fitPreference?: string;
  revisionReason?: string;
  count?: number;
  size?: string;
}

const IMAGE2_REAL_TOOLS = new Set<StudioTool>(["pattern-generate", "seamless-tile", "pattern-apply"]);

function normalizeTool(
  value: StudioGenerateRequest["tool"] | StudioGenerateRequest["toolType"],
): StudioTool | null {
  if (value === "seamless") return "seamless-tile";
  if (value === "try-on") return "pattern-apply";
  if (value === "sketch") return "sketch-generate";
  if (typeof value === "string" && value in TOOL_PROMPT_MAP) {
    return value as StudioTool;
  }
  return null;
}

function fallbackResponse(params: {
  tool: StudioTool;
  count: number;
  userId: string;
  limit: number;
  role: string;
  reason: string;
  prompt?: string;
  provider?: string;
  model?: string;
  message?: string;
  fidelityMode?: TryOnFidelityMode;
  referenceMode?: TryOnReferenceMode;
  patternReferenceUsed?: boolean;
  maskUsed?: boolean;
  isProductionReady?: boolean;
  warnings?: string[];
  providerCapability?: TryOnProviderCapability;
  jobId?: string;
  qualityScores?: TryOnQualityScores;
}) {
  const images = getFallbackImagesForTool(params.tool, params.count);
  const used = recordUsage(params.userId);
  return NextResponse.json({
    success: true,
    tool: params.tool,
    imageUrl: images[0] ?? "",
    images,
    resultType: resultTypeForTool(params.tool),
    isFallback: true,
    provider: params.provider,
    model: params.model,
    fidelityMode: params.fidelityMode,
    referenceMode: params.referenceMode,
    patternReferenceUsed: params.patternReferenceUsed,
    maskUsed: params.maskUsed,
    isProductionReady: params.isProductionReady,
    warnings: params.warnings,
    providerCapability: params.providerCapability,
    jobId: params.jobId,
    message: params.message || fallbackMessageForTool(params.tool),
    metadata: {
      reason: params.reason,
      role: params.role,
      prompt: params.prompt,
      fidelityMode: params.fidelityMode,
      referenceMode: params.referenceMode,
      patternReferenceUsed: params.patternReferenceUsed,
      maskUsed: params.maskUsed,
      isProductionReady: params.isProductionReady,
      warnings: params.warnings,
      providerCapability: params.providerCapability,
      qualityScores: params.qualityScores,
    },
    used,
    limit: params.limit,
  });
}

type TryOnExecutionMode = {
  fidelityMode: TryOnFidelityMode;
  referenceMode: TryOnReferenceMode;
  patternReferenceUsed: boolean;
  maskUsed: boolean;
  isProductionReady: boolean;
  warnings: string[];
  providerCapability: TryOnProviderCapability;
  jobId: string;
  blocked?: boolean;
  blockCode?: string;
  canDegrade?: boolean;
};

function resolveTryOnExecutionMode(
  body: StudioGenerateRequest,
  capability: TryOnProviderCapability,
  sourceImageUrls: string[],
): TryOnExecutionMode {
  const requested = body.requestedFidelityMode || "reference_image";
  const allowDegrade = body.allowDegrade !== false;
  const hasPatternImage = Boolean(body.patternImageUrl || sourceImageUrls[0]);
  const isFashnMode = requested === "garment_tryon" || requested === "garment_tryon_high_quality";
  const hasMask = Boolean((body.params as Record<string, unknown> | undefined)?.garmentRegionMaskUrl);
  const hasGarmentImage = Boolean(
    (body.params as Record<string, unknown> | undefined)?.garmentImageUrl || body.patternImageUrl || sourceImageUrls[0],
  );
  const hasModelBase = Boolean(
    (body.params as Record<string, unknown> | undefined)?.modelBaseImageUrl || body.bodyProfile,
  );
  if (isFashnMode) {
    const warnings: string[] = [];
    if (requested === "garment_tryon") {
      warnings.push("高保真试穿已生成后，生产前仍需确认版型与工艺细节。");
    } else {
      warnings.push("高质量确认图仅供后台审核，生产前仍需确认版型与工艺细节。");
    }
    const base = {
      fidelityMode: requested,
      referenceMode: "true_image_reference" as const,
      patternReferenceUsed: true,
      maskUsed: false,
      isProductionReady: false,
      warnings,
      providerCapability: capability,
      jobId: `tryon-job-${Date.now()}`,
    };

    if (!capability.supportsGarmentTryOn) {
      return {
        ...base,
        patternReferenceUsed: false,
        blocked: true,
        blockCode: "FASHN_PROVIDER_NOT_CONFIGURED",
        canDegrade: allowDegrade,
      };
    }
    if (!hasPatternImage || !hasGarmentImage) {
      return {
        ...base,
        patternReferenceUsed: false,
        blocked: true,
        blockCode: "GARMENT_IMAGE_NOT_READY",
        canDegrade: allowDegrade,
      };
    }
    if (!hasModelBase) {
      return {
        ...base,
        blocked: true,
        blockCode: "MODEL_BASE_NOT_READY",
        canDegrade: allowDegrade,
      };
    }
    return base;
  }
  const canMasked =
    requested === "masked_garment_tryon" &&
    hasPatternImage &&
    hasMask &&
    capability.supportsGarmentTryOn &&
    capability.supportsMask;
  const canReference =
    hasPatternImage &&
    (capability.supportsImageReference || capability.supportsImageEdit || capability.supportsMultiImageInput);
  const warnings: string[] = [];

  if (requested === "masked_garment_tryon") {
    if (canMasked) {
      return {
        fidelityMode: "masked_garment_tryon",
        referenceMode: "masked_tryon",
        patternReferenceUsed: true,
        maskUsed: true,
        isProductionReady: false,
        warnings: ["高保真试穿结果仍需后台确认工艺细节后才能进入生产。"],
        providerCapability: capability,
        jobId: `tryon-job-${Date.now()}`,
      };
    }

    return {
      fidelityMode: "masked_garment_tryon",
      referenceMode: "masked_tryon",
      patternReferenceUsed: false,
      maskUsed: false,
      isProductionReady: false,
      warnings: [
        hasPatternImage
          ? "当前高保真试穿 provider 尚未接入真实服装 mask / garment try-on 能力。"
          : "缺少当前印花图，无法进入高保真试穿。",
      ],
      providerCapability: capability,
      jobId: `tryon-job-${Date.now()}`,
      blocked: true,
      blockCode: "MASKED_TRYON_PROVIDER_NOT_READY",
      canDegrade: true,
    };
  }

  if (requested === "reference_image") {
    if (canReference) {
      warnings.push("当前使用真实参考图试穿，结果仍用于设计预览，生产前需要后台确认。");
      return {
        fidelityMode: "reference_image",
        referenceMode: "true_image_reference",
        patternReferenceUsed: true,
        maskUsed: false,
        isProductionReady: false,
        warnings,
        providerCapability: capability,
        jobId: `tryon-job-${Date.now()}`,
      };
    }

    if (!allowDegrade) {
      return {
        fidelityMode: "reference_image",
        referenceMode: "true_image_reference",
        patternReferenceUsed: false,
        maskUsed: false,
        isProductionReady: false,
        warnings: ["当前 provider 尚未接入真实参考图输入能力。"],
        providerCapability: capability,
        jobId: `tryon-job-${Date.now()}`,
        blocked: true,
        blockCode: "REFERENCE_IMAGE_PROVIDER_NOT_READY",
        canDegrade: true,
      };
    }
  }

  if (canMasked) {
    return {
      fidelityMode: "masked_garment_tryon",
      referenceMode: "masked_tryon",
      patternReferenceUsed: true,
      maskUsed: true,
      isProductionReady: false,
      warnings: ["高保真试穿结果仍需后台确认工艺细节后才能进入生产。"],
      providerCapability: capability,
      jobId: `tryon-job-${Date.now()}`,
    };
  }

  if (canReference && requested !== "approximate") {
    warnings.push("当前供应商支持真实参考图输入，但未检测到服装区域 mask，结果仅用于设计预览。");
    return {
      fidelityMode: "reference_image",
      referenceMode: "true_image_reference",
      patternReferenceUsed: true,
      maskUsed: false,
      isProductionReady: false,
      warnings,
      providerCapability: capability,
      jobId: `tryon-job-${Date.now()}`,
    };
  }

  warnings.push(
    hasPatternImage
      ? "当前供应商只支持文生图，印花图不会作为真实图像输入，结果为示意试穿。"
      : "缺少当前印花图，结果为示意试穿。",
  );
  if (!allowDegrade && requested !== "approximate") {
    return {
      fidelityMode: "approximate",
      referenceMode: "prompt_url_only",
      patternReferenceUsed: false,
      maskUsed: false,
      isProductionReady: false,
      warnings,
      providerCapability: capability,
      jobId: `tryon-job-${Date.now()}`,
      blocked: true,
      blockCode: "HIGH_FIDELITY_PROVIDER_NOT_READY",
      canDegrade: true,
    };
  }
  return {
    fidelityMode: "approximate",
    referenceMode: "prompt_url_only",
    patternReferenceUsed: false,
    maskUsed: false,
    isProductionReady: false,
    warnings,
    providerCapability: capability,
    jobId: `tryon-job-${Date.now()}`,
  };
}

function estimateTryOnQualityScores(mode: TryOnExecutionMode, fullBodyRequested: boolean): TryOnQualityScores {
  const printFidelity =
    mode.fidelityMode === "garment_tryon_high_quality"
      ? 0.82
      : mode.fidelityMode === "garment_tryon"
        ? 0.72
        : mode.fidelityMode === "masked_garment_tryon"
          ? 0.8
          : mode.fidelityMode === "reference_image"
            ? 0.6
            : 0.35;
  return {
    printFidelity,
    silhouetteFidelity:
      mode.fidelityMode === "garment_tryon_high_quality"
        ? 0.82
        : mode.fidelityMode === "garment_tryon" || mode.fidelityMode === "masked_garment_tryon"
          ? 0.75
          : mode.fidelityMode === "reference_image"
            ? 0.55
            : 0.35,
    fullBody: fullBodyRequested ? 0.75 : 0.45,
    realism: mode.fidelityMode === "approximate" ? 0.55 : 0.7,
    bodyProportion: fullBodyRequested ? 0.65 : 0.45,
    scoreMethod: "rule_placeholder",
  };
}

function fallbackMessageForReason(tool: StudioTool, reason: string): string {
  if (reason === "missing-yxai-api-key" || reason === "missing-google-ai-key") {
    return "AI 图片生成服务未配置，当前展示备用示例图。";
  }
  if (reason === "tryon-model-not-configured") {
    return "试穿模型未配置，当前展示备用示例图。";
  }
  if (reason === "sketch-model-not-configured") {
    return "线稿模型未配置，当前展示备用示例图。";
  }
  if (reason.includes("failed") || reason.includes("error") || reason.includes("empty")) {
    return "AI 生成暂时失败，已为你展示备用示例图。";
  }
  return fallbackMessageForTool(tool);
}

function hasR2Config(): boolean {
  return Boolean(
    process.env.R2_ENDPOINT &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_PUBLIC_URL,
  );
}

function providerCapabilityForTryOn(requested?: TryOnFidelityMode): TryOnProviderCapability {
  if (requested === "garment_tryon" || requested === "garment_tryon_high_quality") {
    return getFashnProviderCapability();
  }
  return getYxaiTryOnProviderCapability();
}

function tryOnBlockedMessage(code: string): string {
  if (code === "MASKED_TRYON_PROVIDER_NOT_READY") {
    return "服装区域 mask 级高保真试穿尚未接入，可先使用高保真参考试穿或快速示意试穿。";
  }
  if (code === "IMAGE2_EDIT_FAILED") {
    return "参考图试穿暂时失败，可先使用快速示意试穿。";
  }
  if (code === "FASHN_PROVIDER_NOT_CONFIGURED") {
    return "高保真试穿服务尚未配置，可先使用快速示意试穿。";
  }
  if (code === "GARMENT_IMAGE_NOT_READY") {
    return "服装图还没有准备好，可先使用快速示意试穿。";
  }
  if (code === "MODEL_BASE_NOT_READY") {
    return "模特底图还没有准备好，可先使用快速示意试穿。";
  }
  if (code === "HIGH_FIDELITY_PROVIDER_NOT_READY") {
    return "当前高保真试穿模型尚未接入，请先使用快速示意试穿。";
  }
  return "当前高保真能力暂时不可用，请先使用快速示意试穿。";
}

function textField(record: Record<string, unknown> | undefined, key: string): string {
  const value = record?.[key];
  return typeof value === "string" ? value : "";
}

function buildImage2EditTryOnPrompt(basePrompt: string, body: StudioGenerateRequest): string {
  const template = body.garmentTemplate;
  const bodyProfile = body.bodyProfile;
  const templateParts = [
    textField(template, "name"),
    textField(template, "silhouette"),
    textField(template, "neckline"),
    textField(template, "sleeveLength") || textField(template, "sleeve"),
    textField(template, "dressLength") || textField(template, "skirtLength"),
    textField(template, "waistline"),
    textField(template, "closure"),
  ].filter(Boolean);
  const bodyParts = [
    bodyProfile?.heightCm ? `height ${bodyProfile.heightCm}cm` : "",
    bodyProfile?.weightKg ? `weight ${bodyProfile.weightKg}kg` : "",
    bodyProfile?.usualSize ? `usual size ${bodyProfile.usualSize}` : "",
    bodyProfile?.fitPreference ? `fit preference ${bodyProfile.fitPreference}` : "",
  ].filter(Boolean);
  const wrapHint = templateParts.some((part) => /wrap|裹身/i.test(part))
    ? "This is a wrap dress, not an A-line dress. Show wrap-front construction and waist tie. Do not replace it with an A-line silhouette."
    : "";

  return [
    basePrompt,
    "Use the uploaded image as the real visual reference for the fabric print.",
    "Design a full-body fashion try-on preview of a model wearing a dress using this exact print as the main fabric inspiration.",
    "Preserve the uploaded print's color palette, motif style, density, and background tone as much as possible.",
    "Follow the selected garment silhouette and body profile.",
    templateParts.length > 0 ? `Selected garment details: ${templateParts.join(", ")}.` : "",
    bodyParts.length > 0 ? `Body profile reference: ${bodyParts.join(", ")}.` : "",
    "Generate a full-body, head-to-toe, front-facing fashion preview with both feet visible.",
    "Do not replace the print with a different floral pattern. Do not invent a different silhouette.",
    wrapHint,
  ].filter(Boolean).join("\n");
}

async function persistGeneratedImage(sourceUrl: string, key: string): Promise<string> {
  if (!hasR2Config()) return sourceUrl;
  const dataUrl = parseBase64Image(sourceUrl);
  if (dataUrl) {
    try {
      return await uploadBufferToR2(dataUrl.buffer, key, dataUrl.mimeType);
    } catch (err) {
      console.error("R2 upload for data URL failed, using original image data:", err);
      return sourceUrl;
    }
  }
  try {
    const imgRes = await fetch(sourceUrl);
    if (!imgRes.ok) return sourceUrl;
    const buffer = Buffer.from(await imgRes.arrayBuffer());
    const contentType = imgRes.headers.get("content-type") || "image/png";
    return await uploadBufferToR2(buffer, key, contentType);
  } catch (err) {
    console.error("R2 upload for generated URL failed, using provider URL:", err);
    return sourceUrl;
  }
}

async function ensureProviderInputUrl(sourceUrl: string, key: string): Promise<string> {
  if (!sourceUrl) return "";
  if (sourceUrl.startsWith("data:") || /^https?:\/\//i.test(sourceUrl)) {
    return persistGeneratedImage(sourceUrl, key);
  }

  if (!sourceUrl.startsWith("/")) return sourceUrl;

  if (hasR2Config()) {
    try {
      const publicPath = sourceUrl.replace(/^\/+/, "");
      const filePath = path.join(process.cwd(), "public", publicPath);
      const buffer = await readFile(filePath);
      return await uploadBufferToR2(buffer, key, contentTypeForFile(sourceUrl));
    } catch (err) {
      console.error("[ai-studio/generate] local provider input upload failed", err);
    }
  }

  const publicBase = process.env.NEXT_PUBLIC_BASE_URL || process.env.R2_PUBLIC_URL || "";
  if (!publicBase) return "";
  return `${publicBase.replace(/\/+$/, "")}${sourceUrl}`;
}

function contentTypeForFile(fileName: string): string {
  const ext = path.extname(fileName).toLowerCase();
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".webp") return "image/webp";
  if (ext === ".svg") return "image/svg+xml";
  return "image/png";
}

function parseBase64Image(
  input: string
): { buffer: Buffer; mimeType: string } | null {
  // Accept either full data URL or raw base64.
  const match = input.match(/^data:([^;]+);base64,(.+)$/);
  if (match) {
    return {
      mimeType: match[1],
      buffer: Buffer.from(match[2], "base64"),
    };
  }
  try {
    return {
      mimeType: "image/png",
      buffer: Buffer.from(input, "base64"),
    };
  } catch {
    return null;
  }
}

async function uploadInputImages(
  images: string[],
  batchId: number
): Promise<string[]> {
  const urls: string[] = [];
  for (let i = 0; i < images.length; i++) {
    const parsed = parseBase64Image(images[i]);
    if (!parsed) continue;
    const ext = parsed.mimeType.split("/")[1]?.split(";")[0] || "png";
    const key = `studio/inputs/${batchId}_${i}.${ext}`;
    const url = await uploadBufferToR2(parsed.buffer, key, parsed.mimeType);
    urls.push(url);
  }
  return urls;
}

export async function POST(req: Request) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json(
      { success: false, error: "请先登录后再使用 AI 创作。" },
      { status: 401 }
    );
  }

  // PRD §6.4: per-role daily generation cap.
  const { role, aiDailyLimit } = await getUserRole(user);
  const limitCheck = checkUsageLimit(user.id, aiDailyLimit);
  if (!limitCheck.ok) {
    return NextResponse.json(
      {
        success: false,
        error: limitCheck.error,
        role,
        used: getDailyUsage(user.id),
        limit: aiDailyLimit,
      },
      { status: limitCheck.status },
    );
  }

  let body: StudioGenerateRequest;
  try {
    body = (await req.json()) as StudioGenerateRequest;
  } catch {
    return NextResponse.json(
      { success: false, error: "请求内容格式不正确，请刷新后重试。" },
      { status: 400 }
    );
  }

  const tool = normalizeTool(body.tool ?? body.toolType);
  if (!tool) {
    return NextResponse.json(
      { success: false, error: "未知的 AI 创作工具，请返回工作室重新选择。" },
      { status: 400 }
    );
  }

  const rawModel = body.model;
  const model: StudioModel = rawModel === "gemini" ? "gemini" : "gpt-image-2";
  const count = typeof body.count === "number" && body.count > 0 ? Math.min(body.count, 4) : 4;
  const size = typeof body.size === "string" ? body.size : "1:1";
  const inputImages = Array.isArray(body.images) ? body.images : [];
  const sourceImageUrls = [
    typeof body.patternImageUrl === "string" ? body.patternImageUrl : "",
    typeof body.sourceImageUrl === "string" ? body.sourceImageUrl : "",
    ...(Array.isArray(body.sourceImageUrls) ? body.sourceImageUrls : []),
  ].filter((url): url is string => Boolean(url && typeof url === "string"));

  const promptBuilder = TOOL_PROMPT_MAP[tool];
  const builtPrompt = promptBuilder(body.params || {});
  const finalPrompt = body.prompt ? `${builtPrompt}\n\n${body.prompt}` : builtPrompt;

  const batchId = Date.now();

  // Upload any input images first (they're needed as public URLs for GPT-Image-2
  // and as R2-hosted references anyway).
  let inputUrls: string[] = [];
  try {
    if (inputImages.length > 0) {
      inputUrls = await uploadInputImages(inputImages, batchId);
    }
  } catch (err) {
    console.error("Input image upload failed:", err);
    return fallbackResponse({
      tool,
      count,
      userId: user.id,
      limit: aiDailyLimit,
      role,
      reason: "input-upload-failed",
      prompt: finalPrompt,
    });
  }

  try {
    if (model === "gpt-image-2") {
      const image2Config = getGPTImage2Config();
      const tryOnMode =
        tool === "pattern-apply"
          ? resolveTryOnExecutionMode(body, providerCapabilityForTryOn(body.requestedFidelityMode), sourceImageUrls)
          : undefined;
      const tryOnQualityScores = tryOnMode
        ? estimateTryOnQualityScores(tryOnMode, finalPrompt.toLowerCase().includes("full-body") || finalPrompt.toLowerCase().includes("head to toe"))
        : undefined;
      if (tryOnMode?.blocked) {
        const code = tryOnMode.blockCode || "HIGH_FIDELITY_PROVIDER_NOT_READY";
        if (
          code === "FASHN_PROVIDER_NOT_CONFIGURED" ||
          code === "GARMENT_IMAGE_NOT_READY" ||
          code === "MODEL_BASE_NOT_READY" ||
          code === "MASKED_TRYON_PROVIDER_NOT_READY" ||
          code === "IMAGE2_EDIT_FAILED"
        ) {
          const message = tryOnBlockedMessage(code);
          return NextResponse.json(
            {
              success: false,
              ok: false,
              code,
              error: message,
              message,
              canDegrade: tryOnMode.canDegrade ?? true,
              fidelityMode: tryOnMode.fidelityMode,
              referenceMode: tryOnMode.referenceMode,
              patternReferenceUsed: tryOnMode.patternReferenceUsed,
              maskUsed: tryOnMode.maskUsed,
              isProductionReady: false,
              warnings: tryOnMode.warnings,
              providerCapability: tryOnMode.providerCapability,
              jobId: tryOnMode.jobId,
            },
            { status: 422 },
          );
        }
        const message = code === "HIGH_FIDELITY_PROVIDER_NOT_READY"
          ? "当前高保真试穿模型尚未接入，请先使用快速示意试穿。"
          : "当前参考图试穿能力尚未接入，请先使用快速示意试穿。";
        return NextResponse.json(
          {
            success: false,
            ok: false,
            code,
            error: message,
            message,
            canDegrade: tryOnMode.canDegrade ?? true,
            fidelityMode: tryOnMode.fidelityMode,
            referenceMode: tryOnMode.referenceMode,
            patternReferenceUsed: tryOnMode.patternReferenceUsed,
            maskUsed: tryOnMode.maskUsed,
            isProductionReady: false,
            warnings: tryOnMode.warnings,
            providerCapability: tryOnMode.providerCapability,
            jobId: tryOnMode.jobId,
          },
          { status: 422 },
        );
      }
      if (
        tool === "pattern-apply" &&
        (tryOnMode?.fidelityMode === "garment_tryon" ||
          tryOnMode?.fidelityMode === "garment_tryon_high_quality")
      ) {
        try {
          const patternImageUrl = body.patternImageUrl || sourceImageUrls[0] || "";
          const garment = prepareGarmentImageAsset({
            selectedPattern: {
              id: body.patternAssetId || `pattern-${batchId}`,
              imageUrl: patternImageUrl,
            },
            garmentTemplate: body.garmentTemplate,
          });
          const modelBase = selectModelBaseAsset(body.bodyProfile);
          const garmentImageUrl = await ensureProviderInputUrl(
            garment.asset.imageUrl,
            `studio/fashn-inputs/${batchId}_garment.jpg`,
          );
          const modelImageUrl = await ensureProviderInputUrl(
            modelBase.asset.fullBodyImageUrl || "",
            `studio/fashn-inputs/${batchId}_model.jpg`,
          );

          if (!garmentImageUrl) throw new Error("GARMENT_IMAGE_NOT_READY");
          if (!modelImageUrl) throw new Error("MODEL_BASE_NOT_READY");

          const result = tryOnMode.fidelityMode === "garment_tryon_high_quality"
            ? await generateFashnTryOnMax({
                modelImageUrl,
                garmentImageUrl,
                category: "one-pieces",
                mode: "confirm",
                bodyProfile: body.bodyProfile,
                garmentTemplate: body.garmentTemplate,
              })
            : await generateFashnTryOn({
                modelImageUrl,
                garmentImageUrl,
                category: "one-pieces",
                mode: "preview",
                bodyProfile: body.bodyProfile,
                garmentTemplate: body.garmentTemplate,
              });
          const persistedImageUrl = await persistGeneratedImage(
            result.imageUrl,
            `studio/outputs/${batchId}_fashn_tryon.jpg`,
          );
          const warnings = [...result.warnings, ...garment.warnings, ...modelBase.warnings, ...tryOnMode.warnings];
          const used = recordUsage(user.id);
          return NextResponse.json({
            success: true,
            tool,
            imageUrl: persistedImageUrl,
            images: [persistedImageUrl],
            resultType: resultTypeForTool(tool),
            isFallback: false,
            provider: result.provider,
            model: result.model,
            fidelityMode: result.fidelityMode,
            referenceMode: result.referenceMode,
            patternReferenceUsed: result.patternReferenceUsed,
            maskUsed: result.maskUsed,
            isProductionReady: result.isProductionReady,
            warnings,
            providerCapability: tryOnMode.providerCapability,
            jobId: tryOnMode.jobId,
            providerJobId: result.providerJobId,
            providerResultUrl: result.providerResultUrl,
            persistedImageUrl,
            garmentImageAsset: garment.asset,
            modelBaseSource: modelBase.asset.modelBaseSource,
            tryOnProvider: "fashn",
            message: result.fidelityMode === "garment_tryon_high_quality" ? "高质量确认图已生成。" : "高保真试穿已生成。",
            metadata: {
              role,
              prompt: finalPrompt,
              sourceImageUrls,
              fidelityMode: result.fidelityMode,
              referenceMode: result.referenceMode,
              patternReferenceUsed: result.patternReferenceUsed,
              maskUsed: result.maskUsed,
              isProductionReady: result.isProductionReady,
              warnings,
              providerCapability: tryOnMode.providerCapability,
              jobId: tryOnMode.jobId,
              providerJobId: result.providerJobId,
              providerResultUrl: result.providerResultUrl,
              persistedImageUrl,
              garmentImageAsset: garment.asset,
              modelBaseSource: modelBase.asset.modelBaseSource,
              modelBaseAsset: modelBase.asset,
              tryOnProvider: "fashn",
              qualityScores: tryOnQualityScores,
            },
            used,
            limit: aiDailyLimit,
          });
        } catch (err) {
          const code = err instanceof Error ? err.message : "FASHN_TRYON_FAILED";
          const safeCode =
            code === "FASHN_PROVIDER_NOT_CONFIGURED" ||
            code === "GARMENT_IMAGE_NOT_READY" ||
            code === "MODEL_BASE_NOT_READY" ||
            code === "FASHN_TRYON_TIMEOUT"
              ? code
              : "FASHN_TRYON_FAILED";
          const message = safeCode === "FASHN_TRYON_TIMEOUT"
            ? "高保真试穿生成超时，可先使用快速示意试穿。"
            : safeCode === "FASHN_TRYON_FAILED"
              ? "高保真试穿暂时失败，可先使用快速示意试穿。"
              : tryOnBlockedMessage(safeCode);
          return NextResponse.json(
            {
              success: false,
              ok: false,
              code: safeCode,
              error: message,
              message,
              canDegrade: true,
              fidelityMode: tryOnMode.fidelityMode,
              referenceMode: tryOnMode.referenceMode,
              patternReferenceUsed: false,
              maskUsed: false,
              isProductionReady: false,
              warnings: [message],
              providerCapability: tryOnMode.providerCapability,
              jobId: tryOnMode.jobId,
            },
            { status: 422 },
          );
        }
      }
      if (tool === "pattern-apply" && tryOnMode?.fidelityMode === "reference_image") {
        try {
          const patternImageUrl = body.patternImageUrl || sourceImageUrls[0] || inputUrls[0] || "";
          if (!patternImageUrl) {
            return NextResponse.json(
              {
                success: false,
                ok: false,
                code: "IMAGE2_REFERENCE_IMAGE_NOT_READY",
                error: "还没有找到当前印花图，请先回到印花创作中心选择印花。",
                message: "还没有找到当前印花图，请先回到印花创作中心选择印花。",
                canDegrade: false,
                fidelityMode: "reference_image",
                referenceMode: "true_image_reference",
                patternReferenceUsed: false,
                maskUsed: false,
                isProductionReady: false,
                warnings: ["缺少当前印花图，无法使用参考图试穿。"],
                providerCapability: tryOnMode.providerCapability,
                jobId: tryOnMode.jobId,
              },
              { status: 422 },
            );
          }

          const editPrompt = buildImage2EditTryOnPrompt(finalPrompt, body);
          const result = await generateWithGPTImage2Edit({
            prompt: editPrompt,
            imageUrl: patternImageUrl,
            size,
            n: 1,
          });
          const sourceUrl = result.imageUrl || result.base64 || "";
          if (!sourceUrl) throw new Error("IMAGE2_EDIT_EMPTY_RESULT");

          const persistedImageUrl = await persistGeneratedImage(
            sourceUrl,
            `studio/outputs/${batchId}_yxai_reference_tryon.png`,
          );
          const needsLongTermStorage = sourceUrl.startsWith("data:") && persistedImageUrl === sourceUrl;
          const warnings = [
            "已使用当前印花作为真实参考图生成试穿预览，生产前仍需确认版型与工艺细节。",
            "服装区域 mask 尚未接入，因此当前不是最终生产级试穿。",
            ...(needsLongTermStorage ? ["当前结果需转存为长期资产后再进入订单或工艺单。"] : []),
            ...tryOnMode.warnings,
          ];
          const used = recordUsage(user.id);
          return NextResponse.json({
            success: true,
            tool,
            imageUrl: persistedImageUrl,
            images: [persistedImageUrl],
            resultType: resultTypeForTool(tool),
            isFallback: false,
            provider: result.provider,
            model: result.model,
            fidelityMode: "reference_image",
            referenceMode: "true_image_reference",
            patternReferenceUsed: true,
            maskUsed: false,
            isProductionReady: false,
            warnings,
            providerCapability: tryOnMode.providerCapability,
            jobId: tryOnMode.jobId,
            providerResultUrl: result.imageUrl || (result.base64 ? "base64:data-url" : undefined),
            persistedImageUrl,
            tryOnProvider: "yxai",
            message: "高保真参考试穿已生成。",
            metadata: {
              role,
              prompt: editPrompt,
              sourceImageUrls: [patternImageUrl],
              patternImageUrl,
              fidelityMode: "reference_image",
              referenceMode: "true_image_reference",
              patternReferenceUsed: true,
              maskUsed: false,
              isProductionReady: false,
              warnings,
              providerCapability: tryOnMode.providerCapability,
              jobId: tryOnMode.jobId,
              providerResultUrl: result.imageUrl || (result.base64 ? "base64:data-url" : undefined),
              persistedImageUrl,
              tryOnProvider: "yxai",
              qualityScores: tryOnQualityScores,
            },
            used,
            limit: aiDailyLimit,
          });
        } catch (err) {
          console.error("[ai-studio/generate] image2 edit try-on failed", err instanceof Error ? err.message : err);
          const message = tryOnBlockedMessage("IMAGE2_EDIT_FAILED");
          return NextResponse.json(
            {
              success: false,
              ok: false,
              code: "IMAGE2_EDIT_FAILED",
              error: message,
              message,
              canDegrade: true,
              fidelityMode: "reference_image",
              referenceMode: "true_image_reference",
              patternReferenceUsed: false,
              maskUsed: false,
              isProductionReady: false,
              warnings: [message],
              providerCapability: tryOnMode.providerCapability,
              jobId: tryOnMode.jobId,
            },
            { status: 422 },
          );
        }
      }

      if (tool === "pattern-apply" && tryOnMode?.fidelityMode === "masked_garment_tryon") {
        try {
          const params = (body.params || {}) as Record<string, unknown>;
          const result = await generateMaskedGarmentTryOn({
            patternImageUrl: body.patternImageUrl || sourceImageUrls[0] || "",
            garmentTemplateImageUrl: typeof params.garmentTemplateImageUrl === "string" ? params.garmentTemplateImageUrl : undefined,
            garmentRegionMaskUrl: typeof params.garmentRegionMaskUrl === "string" ? params.garmentRegionMaskUrl : undefined,
            modelBaseImageUrl: typeof params.modelBaseImageUrl === "string" ? params.modelBaseImageUrl : undefined,
            bodyProfile: body.bodyProfile,
            garmentTemplate: body.garmentTemplate,
            prompt: finalPrompt,
            negativePrompt: typeof params.negativePrompt === "string" ? params.negativePrompt : undefined,
          });
          const imageUrl = await persistGeneratedImage(result.imageUrl, `studio/outputs/${batchId}_masked_tryon.png`);
          const used = recordUsage(user.id);
          return NextResponse.json({
            success: true,
            tool,
            imageUrl,
            images: [imageUrl],
            resultType: resultTypeForTool(tool),
            isFallback: false,
            provider: result.provider,
            model: result.model,
            fidelityMode: "masked_garment_tryon",
            referenceMode: "masked_tryon",
            patternReferenceUsed: true,
            maskUsed: true,
            isProductionReady: false,
            warnings: tryOnMode.warnings,
            providerCapability: tryOnMode.providerCapability,
            jobId: tryOnMode.jobId,
            message: "高保真试穿生成完成",
            metadata: {
              role,
              prompt: finalPrompt,
              sourceImageUrls,
              fidelityMode: "masked_garment_tryon",
              referenceMode: "masked_tryon",
              patternReferenceUsed: true,
              maskUsed: true,
              isProductionReady: false,
              warnings: tryOnMode.warnings,
              providerCapability: tryOnMode.providerCapability,
              jobId: tryOnMode.jobId,
              qualityScores: tryOnQualityScores,
            },
            used,
            limit: aiDailyLimit,
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : "";
          if (message === "MASKED_GARMENT_TRYON_PROVIDER_NOT_CONFIGURED") {
            return NextResponse.json(
              {
                success: false,
                ok: false,
                code: "MASKED_TRYON_PROVIDER_NOT_READY",
                error: "服装区域 mask 级高保真试穿尚未接入，可先使用高保真参考试穿或快速示意试穿。",
                message: "服装区域 mask 级高保真试穿尚未接入，可先使用高保真参考试穿或快速示意试穿。",
                canDegrade: true,
                fidelityMode: "masked_garment_tryon",
                referenceMode: "masked_tryon",
                patternReferenceUsed: false,
                maskUsed: false,
                isProductionReady: false,
                warnings: ["当前 provider 未配置 masked garment try-on adapter。"],
                providerCapability: tryOnMode.providerCapability,
                jobId: tryOnMode.jobId,
              },
              { status: 422 },
            );
          }
          console.error("[ai-studio/generate] masked garment try-on failed", err);
          return NextResponse.json(
            {
              success: false,
              ok: false,
              code: "HIGH_FIDELITY_PROVIDER_FAILED",
              error: "高保真试穿暂时失败，请先使用快速示意试穿。",
              message: "高保真试穿暂时失败，请先使用快速示意试穿。",
              canDegrade: true,
            },
            { status: 502 },
          );
        }
      }
      if (!IMAGE2_REAL_TOOLS.has(tool)) {
        const reason = tool === "pattern-apply"
          ? "tryon-model-not-configured"
          : "sketch-model-not-configured";
        return fallbackResponse({
          tool,
          count,
          userId: user.id,
          limit: aiDailyLimit,
          role,
          reason,
          prompt: finalPrompt,
          provider: image2Config.provider,
          model: image2Config.model,
          fidelityMode: tryOnMode?.fidelityMode,
          referenceMode: tryOnMode?.referenceMode,
          patternReferenceUsed: tryOnMode?.patternReferenceUsed,
          maskUsed: tryOnMode?.maskUsed,
          isProductionReady: tryOnMode?.isProductionReady,
          warnings: tryOnMode?.warnings,
          providerCapability: tryOnMode?.providerCapability,
          jobId: tryOnMode?.jobId,
          qualityScores: tryOnQualityScores,
          message: fallbackMessageForReason(tool, reason),
        });
      }
      if (!image2Config.hasApiKey) {
        return fallbackResponse({
          tool,
          count,
          userId: user.id,
          limit: aiDailyLimit,
          role,
          reason: "missing-yxai-api-key",
          prompt: finalPrompt,
          provider: image2Config.provider,
          model: image2Config.model,
          fidelityMode: tryOnMode?.fidelityMode,
          referenceMode: tryOnMode?.referenceMode,
          patternReferenceUsed: tryOnMode?.patternReferenceUsed,
          maskUsed: tryOnMode?.maskUsed,
          isProductionReady: tryOnMode?.isProductionReady,
          warnings: tryOnMode?.warnings,
          providerCapability: tryOnMode?.providerCapability,
          jobId: tryOnMode?.jobId,
          qualityScores: tryOnQualityScores,
          message: fallbackMessageForReason(tool, "missing-yxai-api-key"),
        });
      }

      const genOne = async (index: number): Promise<string | null> => {
        try {
          const variationInstruction = tool === "pattern-apply"
            ? `(Variation ${index + 1}: keep the exact same selected print, floral layout, density, color balance, background tone, and selected garment silhouette. Vary only model pose, camera angle, and lighting slightly. Keep full-body head-to-toe framing.)`
            : `(Variation ${index + 1}: slightly different composition and color emphasis)`;
          const variantPrompt = count > 1
            ? `${finalPrompt}\n\n${variationInstruction}`
            : finalPrompt;
          const urls = await generateWithGPTImage2(variantPrompt, {
            size,
            urls: [...inputUrls, ...sourceImageUrls].length > 0
              ? [...inputUrls, ...sourceImageUrls]
              : undefined,
          });
          const sourceUrl = urls[0];
          if (!sourceUrl) return null;
          const key = `studio/outputs/${batchId}_${index}.png`;
          return await persistGeneratedImage(sourceUrl, key);
        } catch (err) {
          console.error(`GPT-Image-2 variant ${index} failed:`, err);
          return null;
        }
      };

      const results = await Promise.all(
        Array.from({ length: count }, (_, i) => genOne(i))
      );
      const images = results
        .filter((u): u is string => typeof u === "string");

      if (images.length === 0) {
        return fallbackResponse({
          tool,
          count,
          userId: user.id,
          limit: aiDailyLimit,
          role,
          reason: "gpt-image-empty-result",
          prompt: finalPrompt,
          provider: image2Config.provider,
          model: image2Config.model,
          fidelityMode: tryOnMode?.fidelityMode,
          referenceMode: tryOnMode?.referenceMode,
          patternReferenceUsed: tryOnMode?.patternReferenceUsed,
          maskUsed: tryOnMode?.maskUsed,
          isProductionReady: tryOnMode?.isProductionReady,
          warnings: tryOnMode?.warnings,
          providerCapability: tryOnMode?.providerCapability,
          jobId: tryOnMode?.jobId,
          qualityScores: tryOnQualityScores,
          message: fallbackMessageForReason(tool, "gpt-image-empty-result"),
        });
      }
      const used = recordUsage(user.id);
      return NextResponse.json({
        success: true,
        tool,
        imageUrl: images[0] ?? "",
        images,
        resultType: resultTypeForTool(tool),
        isFallback: false,
        provider: image2Config.provider,
        model: image2Config.model,
        fidelityMode: tryOnMode?.fidelityMode,
        referenceMode: tryOnMode?.referenceMode,
        patternReferenceUsed: tryOnMode?.patternReferenceUsed,
        maskUsed: tryOnMode?.maskUsed,
        isProductionReady: tryOnMode?.isProductionReady,
        warnings: tryOnMode?.warnings,
        providerCapability: tryOnMode?.providerCapability,
        jobId: tryOnMode?.jobId,
        message: "生成完成",
        metadata: {
          role,
          prompt: finalPrompt,
          sourceImageUrls,
          fidelityMode: tryOnMode?.fidelityMode,
          referenceMode: tryOnMode?.referenceMode,
          patternReferenceUsed: tryOnMode?.patternReferenceUsed,
          maskUsed: tryOnMode?.maskUsed,
          isProductionReady: tryOnMode?.isProductionReady,
          warnings: tryOnMode?.warnings,
          providerCapability: tryOnMode?.providerCapability,
          jobId: tryOnMode?.jobId,
          qualityScores: tryOnQualityScores,
        },
        used,
        limit: aiDailyLimit,
      });
    }

    // Gemini branch
    const apiKey = process.env.GOOGLE_AI_KEY;
    if (!apiKey) {
      return fallbackResponse({
        tool,
        count,
        userId: user.id,
        limit: aiDailyLimit,
        role,
        reason: "missing-google-ai-key",
        prompt: finalPrompt,
        provider: "google",
        model: GEMINI_MODEL_ID,
        message: fallbackMessageForReason(tool, "missing-google-ai-key"),
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    // For Gemini multimodal input, we need the raw base64 so we can attach
    // inlineData. Parse directly from the request payload instead of refetching.
    const inlineParts: { inlineData: { mimeType: string; data: string } }[] = [];
    for (const raw of inputImages) {
      const parsed = parseBase64Image(raw);
      if (parsed) {
        inlineParts.push({
          inlineData: {
            mimeType: parsed.mimeType,
            data: parsed.buffer.toString("base64"),
          },
        });
      }
    }

    const genOne = async (index: number): Promise<string | null> => {
      try {
        const variantPrompt = count > 1
          ? `${finalPrompt}\n\n(Variation ${index + 1}: slightly different composition and color emphasis)`
          : finalPrompt;
        const response = await ai.models.generateContent({
          model: GEMINI_MODEL_ID,
          contents: [
            {
              role: "user",
              parts: [{ text: variantPrompt }, ...inlineParts],
            },
          ],
          config: {
            responseModalities: ["IMAGE", "TEXT"],
            temperature: 1.0,
          },
        });

        const parts = response.candidates?.[0]?.content?.parts ?? [];
        for (const part of parts) {
          const inline = part.inlineData;
          const mimeType = inline?.mimeType;
          const data = inline?.data;
          if (!inline || !data || !mimeType?.startsWith("image/")) continue;
          const buffer = Buffer.from(data, "base64");
          const ext = mimeType.split("/")[1]?.split(";")[0] || "png";
          const key = `studio/outputs/${batchId}_${index}.${ext}`;
          if (!hasR2Config()) {
            return `data:${mimeType};base64,${data}`;
          }
          return await uploadBufferToR2(buffer, key, mimeType);
        }
        return null;
      } catch (err) {
        console.error(`Gemini variant ${index} failed:`, err);
        return null;
      }
    };

    const results = await Promise.all(
      Array.from({ length: count }, (_, i) => genOne(i))
    );
    const images = results
      .filter((u): u is string => typeof u === "string");

    if (images.length === 0) {
      return fallbackResponse({
        tool,
        count,
        userId: user.id,
        limit: aiDailyLimit,
        role,
        reason: "gemini-empty-result",
        prompt: finalPrompt,
        provider: "google",
        model: GEMINI_MODEL_ID,
        message: fallbackMessageForReason(tool, "gemini-empty-result"),
      });
    }
    const used = recordUsage(user.id);
    return NextResponse.json({
      success: true,
      tool,
      imageUrl: images[0] ?? "",
      images,
      resultType: resultTypeForTool(tool),
      isFallback: false,
      provider: "google",
      model: GEMINI_MODEL_ID,
      message: "生成完成",
      metadata: { role, prompt: finalPrompt },
      used,
      limit: aiDailyLimit,
    });
  } catch (err) {
    console.error("AI Studio generate error:", err);
    return fallbackResponse({
      tool,
      count,
      userId: user.id,
      limit: aiDailyLimit,
      role,
      reason: err instanceof Error ? err.message : "generation-error",
      prompt: finalPrompt,
      message: fallbackMessageForReason(tool, "generation-error"),
    });
  }
}
