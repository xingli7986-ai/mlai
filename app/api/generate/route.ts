import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { getAuthUser } from "@/lib/getAuthUser";
import { uploadBufferToR2 } from "@/lib/upload";
import { generateWithGPTImage2 } from "@/lib/suchuang";

export const runtime = "nodejs";
export const maxDuration = 120;

const GEMINI_MODEL_ID = "gemini-3-pro-image-preview";
const NUM_VARIANTS = 4;

const styleMap: Record<string, string> = {
  floral: "seamless textile pattern with blooming floral motifs: layered petals, natural watercolor bleed, delicate brushwork",
  geometric: "seamless geometric abstract textile pattern: precise lines, symmetrical composition, contrasting color blocks",
  watercolor: "seamless watercolor textile pattern: ink splash, soft bleeding edges, negative space aesthetic",
  vintage: "seamless vintage textile pattern: 60s pop art, Art Deco, classic plaid and checker motifs",
  tropical: "seamless tropical textile pattern: palm leaves, bird-of-paradise, vibrant tropical palette",
  minimalist: "seamless minimalist textile pattern: thin lines, monochrome palette, restrained elegance",
  newchinese: "seamless new-Chinese textile pattern: modern reinterpretation of traditional motifs, embroidery feel, knot and frog elements",
  starry: "seamless starry-night textile pattern: deep galaxy, gradient colors, romantic and mysterious",
  ocean: "seamless ocean textile pattern: wave textures, shells and coral, blue-and-white tones",
  garden: "seamless secret-garden textile pattern: dense blooms, butterflies and birds, natural vitality",
  aurora: "seamless aurora textile pattern: flowing gradients, dreamy light, futuristic glow",
  porcelain: "seamless blue-and-white porcelain textile pattern: classic china motifs, ceramic texture, oriental elegance",
};

function buildMaxLuLuPrompt(userPrompt: string, style?: string): string {
  const styleDesc =
    style && styleMap[style] ? styleMap[style] : "elegant seamless textile pattern";

  return `Create a seamless textile pattern design for fabric printing.
Style: ${styleDesc}.
Design description: ${userPrompt}.

Requirements:
- This must be a flat pattern design, NOT a photo of clothing or a model
- The pattern should be tileable/seamless for fabric repeat printing
- High detail, professional textile design quality
- Clean edges suitable for seamless tiling
- View: flat lay, top-down perspective
- No garments, no mannequins, no human figures, no 3D objects

Output a 2D flat pattern design only. Do not generate any clothing, garment, model, or mannequin imagery.`;
}

export async function POST(req: Request) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  let body: { prompt?: unknown; style?: unknown; model?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const prompt =
    typeof body.prompt === "string" ? body.prompt.trim() : "";
  const style = typeof body.style === "string" ? body.style : undefined;
  const rawModel = typeof body.model === "string" ? body.model : "gpt-image-2";
  const model: "gpt-image-2" | "gemini" =
    rawModel === "gemini" ? "gemini" : "gpt-image-2";

  if (!prompt) {
    return NextResponse.json({ error: "请输入设计描述" }, { status: 400 });
  }

  const brandPrompt = buildMaxLuLuPrompt(prompt, style);
  const batchId = Date.now();

  if (model === "gpt-image-2") {
    if (!process.env.SUCHUANG_API_KEY) {
      return NextResponse.json(
        { error: "SUCHUANG_API_KEY is not configured" },
        { status: 500 }
      );
    }

    async function generateOneGPT(index: number): Promise<string | null> {
      try {
        const variantPrompt = `${brandPrompt}\n\n(Variation ${index + 1}: slightly different composition and color emphasis)`;
        const urls = await generateWithGPTImage2(variantPrompt, { size: "1:1" });
        const sourceUrl = urls[0];
        if (!sourceUrl) return null;

        const imgRes = await fetch(sourceUrl);
        if (!imgRes.ok) {
          console.error(`Failed to fetch GPT-Image-2 output: ${imgRes.status}`);
          return null;
        }
        const buffer = Buffer.from(await imgRes.arrayBuffer());
        const key = `designs/${batchId}_${index}.png`;
        return await uploadBufferToR2(buffer, key, "image/png");
      } catch (err) {
        console.error(`GPT-Image-2 generation failed for variant ${index}:`, err);
        return null;
      }
    }

    try {
      const results = await Promise.all(
        Array.from({ length: NUM_VARIANTS }, (_, i) => generateOneGPT(i))
      );
      const images = results.filter((u): u is string => typeof u === "string");

      if (images.length === 0) {
        return NextResponse.json({ error: "生成失败，请重试" }, { status: 502 });
      }

      return NextResponse.json({ images });
    } catch (err) {
      console.error("GPT-Image-2 generate error:", err);
      const message = err instanceof Error ? err.message : "生成失败";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  // Gemini branch (unchanged logic)
  const apiKey = process.env.GOOGLE_AI_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GOOGLE_AI_KEY is not configured" },
      { status: 500 }
    );
  }

  const ai = new GoogleGenAI({ apiKey });

  async function generateOneGemini(index: number): Promise<string | null> {
    try {
      const variantPrompt = `${brandPrompt}\n\n(Variation ${index + 1}: slightly different composition and color emphasis)`;
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL_ID,
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
      Array.from({ length: NUM_VARIANTS }, (_, i) => generateOneGemini(i))
    );
    const images = results.filter((u): u is string => typeof u === "string");

    if (images.length === 0) {
      return NextResponse.json({ error: "生成失败，请重试" }, { status: 502 });
    }

    return NextResponse.json({ images });
  } catch (err) {
    console.error("Generate error:", err);
    const message = err instanceof Error ? err.message : "生成失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
