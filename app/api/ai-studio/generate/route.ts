import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { getAuthUser } from "@/lib/getAuthUser";
import { uploadBufferToR2 } from "@/lib/upload";
import { generateWithGPTImage2, getGPTImage2Config } from "@/lib/suchuang";
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
  bodyProfile?: Record<string, unknown>;
  garmentTemplate?: Record<string, unknown>;
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
    message: params.message || fallbackMessageForTool(params.tool),
    metadata: {
      reason: params.reason,
      role: params.role,
      prompt: params.prompt,
    },
    used,
    limit: params.limit,
  });
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
        message: "生成完成",
        metadata: { role, prompt: finalPrompt, sourceImageUrls },
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
