import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { getAuthUser } from "@/lib/getAuthUser";
import { uploadBufferToR2 } from "@/lib/upload";
import {
  FABRICS,
  NECKLINES,
  SKIRT_LENGTHS,
  SKIRT_TYPES,
  SLEEVE_TYPES,
} from "@/lib/constants";

export const runtime = "nodejs";
export const maxDuration = 120;

const MODEL_ID = "gemini-3-pro-image-preview";
const NUM_VARIANTS = 2;

const HEIGHT_RE = /^\d{3}cm$/;

const BODY_MAP: Record<string, string> = {
  slim: "slim and slender",
  standard: "average and naturally proportioned",
  curvy: "curvy with a defined waistline",
  plus: "plus-size with a graceful silhouette",
};

const SKIN_MAP: Record<string, string> = {
  fair: "fair porcelain",
  natural: "natural warm",
  tan: "sun-kissed tan",
  dark: "rich deep warm-brown",
};

const SCENE_MAP: Record<string, string> = {
  studio:
    "a minimalist photography studio with soft overhead lighting and a neutral backdrop",
  street:
    "an urban Parisian street with vintage buildings softly blurred in the background, natural daylight",
  office:
    "a modern office interior with floor-to-ceiling windows and soft daylight",
  garden:
    "a lush garden with blooming florals, warm golden-hour light filtering through leaves",
  beach:
    "a sandy beach at sunset with ocean horizon and soft golden backlight",
  evening:
    "an elegant evening gala indoor setting with soft dramatic lighting and bokeh highlights",
};

const POSE_MAP: Record<string, string> = {
  front:
    "standing facing the camera with a confident, direct gaze",
  side:
    "in profile side view with one hand resting softly on the hip",
  "three-quarter":
    "in a three-quarter turn pose with a subtle relaxed smile",
  walking:
    "caught mid-stride walking toward the camera with natural movement in the fabric",
};

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

  let body: {
    printImageUrl?: unknown;
    prompt?: unknown;
    skirtType?: unknown;
    neckline?: unknown;
    sleeveType?: unknown;
    skirtLength?: unknown;
    fabric?: unknown;
    modelHeight?: unknown;
    bodyType?: unknown;
    skinTone?: unknown;
    scene?: unknown;
    pose?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const printImageUrl =
    typeof body.printImageUrl === "string" ? body.printImageUrl.trim() : "";
  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
  const skirtTypeId =
    typeof body.skirtType === "string" ? body.skirtType : "";
  const necklineId =
    typeof body.neckline === "string" ? body.neckline : "";
  const sleeveId =
    typeof body.sleeveType === "string" ? body.sleeveType : "";
  const lengthId =
    typeof body.skirtLength === "string" ? body.skirtLength : "";
  const fabricId = typeof body.fabric === "string" ? body.fabric : "";
  const modelHeight =
    typeof body.modelHeight === "string" ? body.modelHeight : "";
  const bodyType = typeof body.bodyType === "string" ? body.bodyType : "";
  const skinTone = typeof body.skinTone === "string" ? body.skinTone : "";
  const scene = typeof body.scene === "string" ? body.scene : "";
  const pose = typeof body.pose === "string" ? body.pose : "";

  if (!printImageUrl || !printImageUrl.startsWith("http")) {
    return NextResponse.json(
      { error: "printImageUrl is required" },
      { status: 400 }
    );
  }
  if (!prompt) {
    return NextResponse.json(
      { error: "prompt is required" },
      { status: 400 }
    );
  }

  const skirt = SKIRT_TYPES.find((s) => s.id === skirtTypeId);
  const neckline = NECKLINES.find((n) => n.id === necklineId);
  const sleeve = SLEEVE_TYPES.find((s) => s.id === sleeveId);
  const length = SKIRT_LENGTHS.find((l) => l.id === lengthId);
  const fabric = FABRICS.find((f) => f.id === fabricId);

  if (!skirt || !neckline || !sleeve || !length || !fabric) {
    return NextResponse.json(
      { error: "invalid skirt / neckline / sleeve / length / fabric id" },
      { status: 400 }
    );
  }
  if (!HEIGHT_RE.test(modelHeight)) {
    return NextResponse.json({ error: "invalid modelHeight" }, { status: 400 });
  }
  if (!BODY_MAP[bodyType]) {
    return NextResponse.json({ error: "invalid bodyType" }, { status: 400 });
  }
  if (!SKIN_MAP[skinTone]) {
    return NextResponse.json({ error: "invalid skinTone" }, { status: 400 });
  }
  if (!SCENE_MAP[scene]) {
    return NextResponse.json({ error: "invalid scene" }, { status: 400 });
  }
  if (!POSE_MAP[pose]) {
    return NextResponse.json({ error: "invalid pose" }, { status: 400 });
  }

  // Fetch the print reference image so Gemini can see it.
  let refBase64: string;
  let refMime: string;
  try {
    const refRes = await fetch(printImageUrl);
    if (!refRes.ok) {
      throw new Error(`Reference image fetch failed: ${refRes.status}`);
    }
    refMime = refRes.headers.get("content-type") || "image/webp";
    refBase64 = Buffer.from(await refRes.arrayBuffer()).toString("base64");
  } catch (err) {
    console.error("Failed to fetch print reference:", err);
    return NextResponse.json(
      { error: "无法读取印花参考图" },
      { status: 502 }
    );
  }

  const basePrompt = `Professional fashion photography of a ${modelHeight} ${BODY_MAP[bodyType]} female model with ${SKIN_MAP[skinTone]} skin tone.
She is wearing a ${skirt.enName} dress with ${neckline.enName} neckline, ${sleeve.enName} sleeves, ${length.enName} length.
The dress is made of ${fabric.enName} fabric (${fabric.composition}, ${fabric.gsm}).
The dress features a seamless printed pattern: ${prompt}.
Scene: ${SCENE_MAP[scene]}. Pose: ${POSE_MAP[pose]}.

Requirements:
- Magazine editorial quality, professional lighting and color grading.
- The print pattern on the dress MUST match the provided reference image closely in motif, palette, and scale.
- Full body shot showing the complete dress from neckline to hem.
- Photorealistic, high resolution, sharp focus on the model.
- The dress should have natural fabric draping appropriate for ${fabric.enName}.
- Neutral flattering expression on the model. Natural skin texture, no over-smoothing.`;

  const ai = new GoogleGenAI({ apiKey });
  const batchId = Date.now();

  async function generateOne(index: number): Promise<string | null> {
    try {
      const variantPrompt = `${basePrompt}\n\n(Variant ${index + 1}: slightly different framing / lighting angle while keeping the same model, scene, and outfit.)`;
      const response = await ai.models.generateContent({
        model: MODEL_ID,
        contents: [
          {
            role: "user",
            parts: [
              { text: variantPrompt },
              { inlineData: { mimeType: refMime, data: refBase64 } },
            ],
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
        const key = `try-on/${batchId}_${index}.${ext}`;
        try {
          return await uploadBufferToR2(buffer, key, mimeType);
        } catch (uploadErr) {
          console.error(`R2 upload failed for ${key}:`, uploadErr);
          return null;
        }
      }
      return null;
    } catch (err) {
      console.error(`Try-on generation failed for variant ${index}:`, err);
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
    console.error("Try-on batch failed:", err);
    const message = err instanceof Error ? err.message : "生成失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
