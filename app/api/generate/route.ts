import { NextResponse } from "next/server";
import Replicate from "replicate";
import { getAuthUser } from "@/lib/getAuthUser";
import { uploadImageFromUrl } from "@/lib/upload";

export const runtime = "nodejs";
export const maxDuration = 60;

const PROMPT_PREFIX =
  "seamless textile pattern design, fashion fabric print, high quality, ";

export async function POST(req: Request) {
  const user = await getAuthUser(req);
  if (!user) {
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
    const output = await replicate.run("black-forest-labs/flux-schnell", {
      input: {
        prompt: `${PROMPT_PREFIX}${prompt}`,
        num_outputs: 4,
        aspect_ratio: "3:4",
        output_format: "webp",
        output_quality: 90,
      },
    });

    const replicateUrls = Array.isArray(output)
      ? output.filter((url): url is string => typeof url === "string")
      : [];

    if (replicateUrls.length === 0) {
      return NextResponse.json(
        { error: "Unexpected output format from Replicate" },
        { status: 502 }
      );
    }

    const batchId = Date.now();
    const images = await Promise.all(
      replicateUrls.map(async (url, i) => {
        const key = `designs/${batchId}_${i}.webp`;
        try {
          return await uploadImageFromUrl(url, key);
        } catch (uploadErr) {
          console.error(
            `R2 upload failed for ${key}, falling back to Replicate URL:`,
            uploadErr
          );
          return url;
        }
      })
    );

    return NextResponse.json({ images });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
