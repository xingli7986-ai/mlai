import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { getAuthUser } from "@/lib/getAuthUser";
import { uploadBufferToR2 } from "@/lib/upload";
import { generateWithGPTImage2 } from "@/lib/suchuang";
import {
  TOOL_PROMPT_MAP,
  type StudioTool,
} from "@/lib/ai-studio-prompts";

export const runtime = "nodejs";
export const maxDuration = 120;

const GEMINI_MODEL_ID = "gemini-3-pro-image-preview";

type StudioModel = "gpt-image-2" | "gemini";

interface StudioGenerateRequest {
  tool: StudioTool;
  model?: StudioModel;
  prompt?: string;
  params?: Record<string, unknown>;
  images?: string[]; // base64 data URLs or plain base64
  count?: number;
  size?: string;
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
      { success: false, error: "未登录" },
      { status: 401 }
    );
  }

  let body: StudioGenerateRequest;
  try {
    body = (await req.json()) as StudioGenerateRequest;
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const tool = body.tool;
  if (!tool || !(tool in TOOL_PROMPT_MAP)) {
    return NextResponse.json(
      { success: false, error: `未知工具: ${tool}` },
      { status: 400 }
    );
  }

  const rawModel = body.model;
  const model: StudioModel = rawModel === "gemini" ? "gemini" : "gpt-image-2";
  const count = typeof body.count === "number" && body.count > 0 ? Math.min(body.count, 4) : 4;
  const size = typeof body.size === "string" ? body.size : "1:1";
  const inputImages = Array.isArray(body.images) ? body.images : [];

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
    return NextResponse.json(
      { success: false, error: "输入图片上传失败" },
      { status: 500 }
    );
  }

  try {
    if (model === "gpt-image-2") {
      if (!process.env.SUCHUANG_API_KEY) {
        return NextResponse.json(
          { success: false, error: "SUCHUANG_API_KEY is not configured" },
          { status: 500 }
        );
      }

      const genOne = async (index: number): Promise<string | null> => {
        try {
          const variantPrompt = count > 1
            ? `${finalPrompt}\n\n(Variation ${index + 1}: slightly different composition and color emphasis)`
            : finalPrompt;
          const urls = await generateWithGPTImage2(variantPrompt, {
            size,
            urls: inputUrls.length > 0 ? inputUrls : undefined,
          });
          const sourceUrl = urls[0];
          if (!sourceUrl) return null;
          const imgRes = await fetch(sourceUrl);
          if (!imgRes.ok) return null;
          const buffer = Buffer.from(await imgRes.arrayBuffer());
          const key = `studio/outputs/${batchId}_${index}.png`;
          return await uploadBufferToR2(buffer, key, "image/png");
        } catch (err) {
          console.error(`GPT-Image-2 variant ${index} failed:`, err);
          return null;
        }
      };

      const results = await Promise.all(
        Array.from({ length: count }, (_, i) => genOne(i))
      );
      const images = results
        .filter((u): u is string => typeof u === "string")
        .map((url) => ({ url }));

      if (images.length === 0) {
        return NextResponse.json(
          { success: false, error: "生成失败，请重试" },
          { status: 502 }
        );
      }
      return NextResponse.json({ success: true, images });
    }

    // Gemini branch
    const apiKey = process.env.GOOGLE_AI_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "GOOGLE_AI_KEY is not configured" },
        { status: 500 }
      );
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
      .filter((u): u is string => typeof u === "string")
      .map((url) => ({ url }));

    if (images.length === 0) {
      return NextResponse.json(
        { success: false, error: "生成失败，请重试" },
        { status: 502 }
      );
    }
    return NextResponse.json({ success: true, images });
  } catch (err) {
    console.error("AI Studio generate error:", err);
    const message = err instanceof Error ? err.message : "生成失败";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
