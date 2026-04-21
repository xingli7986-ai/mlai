import { NextResponse } from "next/server";
import Replicate from "replicate";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";
export const maxDuration = 60;

const PROMPT_PREFIX =
  "seamless textile pattern design, fashion fabric print, high quality, ";

const VARIANTS = [
  "vibrant colors",
  "pastel soft tones",
  "geometric modern",
  "floral elegant",
] as const;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "REPLICATE_API_TOKEN is not configured" },
      { status: 500 }
    );
  }

  let body: { prompt?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
  if (!prompt) {
    return NextResponse.json(
      { error: "prompt is required" },
      { status: 400 }
    );
  }

  const replicate = new Replicate({ auth: token, useFileOutput: false });

  try {
    const outputs = await Promise.all(
      VARIANTS.map((variant) =>
        replicate.run("black-forest-labs/flux-schnell", {
          input: {
            prompt: `${PROMPT_PREFIX}${prompt}, ${variant}`,
            num_outputs: 1,
            aspect_ratio: "3:4",
            output_format: "webp",
            output_quality: 90,
          },
        })
      )
    );

    const images = outputs.map((out) => {
      if (typeof out === "string") return out;
      if (Array.isArray(out)) {
        const first = out[0];
        if (typeof first === "string") return first;
      }
      return null;
    });

    if (images.some((url) => !url)) {
      return NextResponse.json(
        { error: "Unexpected output format from Replicate" },
        { status: 502 }
      );
    }

    return NextResponse.json({ images });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
