import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { getAuthUser } from "@/lib/getAuthUser";
import { uploadBufferToR2 } from "@/lib/upload";

// TODO: Add GOOGLE_AI_KEY to Vercel environment variables
export const runtime = "nodejs";
export const maxDuration = 120;

const MODEL_ID = "gemini-3-pro-image-preview";
const NUM_VARIANTS = 4;

const styleMap: Record<string, string> = {
  floral: "盛开的花卉印花：花瓣层次、自然晕染、细腻笔触",
  geometric: "现代几何：精密线条、对称构图、对比色块",
  watercolor: "水彩风格：泼墨、晕染、留白意境",
  vintage: "复古印花：60年代波普、Art Deco、经典格纹",
  tropical: "热带风情：棕榈叶、鹤望兰、鲜艳配色",
  minimalist: "极简印花：细线条、单色调、克制优雅",
  newchinese: "新中式：传统纹样现代演绎、刺绣感、盘扣元素",
  starry: "星空梦幻：深邃星河、渐变色彩、浪漫神秘",
  ocean: "海洋风情：波浪纹理、贝壳珊瑚、蓝白色调",
  garden: "秘密花园：繁花似锦、蝴蝶鸟雀、自然生机",
  aurora: "极光幻彩：流动渐变、梦幻光影、未来感",
  porcelain: "青花瓷韵：青花纹样、陶瓷质感、东方雅致",
};

function buildMaxLuLuPrompt(userPrompt: string, style?: string): string {
  const baseContext = `You are a fashion design AI for MaxLuLu, a premium Chinese fashion brand established in 2009 in Paris and Shanghai. The brand is known for elegant printed dresses with French sophistication.

Design Requirements:
- Generate a COMPLETE outfit visualization: a photorealistic editorial portrait of a woman wearing the printed MaxLuLu dress
- Clean studio or soft natural lighting, Vogue/Elle magazine quality
- Emphasize the print pattern, fabric drape, and silhouette
- Elegant, confident pose; tasteful framing (3:4 portrait aspect)
- Color palette, composition and print motifs should match the brief below`;

  const styleDesc =
    style && styleMap[style] ? `\nPrint Style: ${styleMap[style]}` : "";

  return `${baseContext}${styleDesc}\n\nUser's design request: ${userPrompt}\n\nGenerate a photorealistic fashion editorial image of a woman wearing this MaxLuLu dress design. The image should look like it belongs in Vogue or Elle magazine.`;
}

export async function POST(req: Request) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const apiKey = process.env.GOOGLE_AI_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GOOGLE_AI_KEY is not configured" },
      { status: 500 }
    );
  }

  let body: { prompt?: unknown; style?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const prompt =
    typeof body.prompt === "string" ? body.prompt.trim() : "";
  const style = typeof body.style === "string" ? body.style : undefined;
  if (!prompt) {
    return NextResponse.json(
      { error: "请输入设计描述" },
      { status: 400 }
    );
  }

  const ai = new GoogleGenAI({ apiKey });
  const brandPrompt = buildMaxLuLuPrompt(prompt, style);
  const batchId = Date.now();

  async function generateOne(index: number): Promise<string | null> {
    try {
      const variantPrompt = `${brandPrompt}\n\n(Variation ${index + 1}: slightly different composition and color emphasis)`;
      const response = await ai.models.generateContent({
        model: MODEL_ID,
        contents: [
          {
            role: "user",
            parts: [{ text: variantPrompt }],
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
        const key = `designs/${batchId}_${index}.${ext}`;
        try {
          return await uploadBufferToR2(buffer, key, mimeType);
        } catch (uploadErr) {
          console.error(`R2 upload failed for ${key}:`, uploadErr);
          return null;
        }
      }
      return null;
    } catch (err) {
      console.error(`Gemini generation failed for variant ${index}:`, err);
      return null;
    }
  }

  try {
    const results = await Promise.all(
      Array.from({ length: NUM_VARIANTS }, (_, i) => generateOne(i))
    );
    const images = results.filter((u): u is string => typeof u === "string");

    if (images.length === 0) {
      return NextResponse.json(
        { error: "生成失败，请重试" },
        { status: 502 }
      );
    }

    return NextResponse.json({ images });
  } catch (err) {
    console.error("Generate error:", err);
    const message = err instanceof Error ? err.message : "生成失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
