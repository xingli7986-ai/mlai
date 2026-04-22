// Print-processing pipeline: seamless tiling + 4x super-resolution.
//
// Pipeline stages:
//   1. Fetch the AI-generated print image.
//   2. Build a seamless tile by blending a half-offset copy over the original
//      with a feathered-edge alpha mask. The outer ~18% of the output draws
//      from the offset copy (whose edges are clean because they came from the
//      original's center), while the inner region keeps the original.
//   3. Upload the seamless version to R2 (intermediate artifact).
//   4. Run Real-ESRGAN 4x upscale on Replicate.
//   5. Download the upscaled output, stamp 300 DPI metadata, and upload the
//      final production file to R2.
//   6. Update the Design row with `productionImageUrl` and
//      `processingStatus = "completed"`. Any failure sets status to "failed"
//      before re-throwing.

import sharp from "sharp";
import Replicate from "replicate";
import { prisma } from "./prisma";
import { uploadBufferToR2 } from "./upload";

// Real-ESRGAN version pin. If this stops working, bump to the latest version
// hash from https://replicate.com/nightmareai/real-esrgan.
const REAL_ESRGAN_VERSION =
  "nightmareai/real-esrgan:f121d640bd286e1fdc67f9799164c1d5be36ff74576ee11c803ae5b665dd46aa";

const UPSCALE_TIMEOUT_MS = 120_000;

// ---------------------------------------------------------------------------
// Stage 1: makeSeamlessTile
// ---------------------------------------------------------------------------

export async function makeSeamlessTile(input: Buffer): Promise<Buffer> {
  const meta = await sharp(input).metadata();
  const W = meta.width ?? 1024;
  const H = meta.height ?? 1024;

  // Build the half-offset copy by extracting the four quadrants of the
  // original and placing each in the diagonally opposite corner. After this,
  // the outer edges of `shiftedRGB` hold pixels that were safely inside the
  // original (so there's no seam there), while the discontinuities have been
  // pushed to the center of the canvas.
  const hx = Math.floor(W / 2);
  const hy = Math.floor(H / 2);

  const [br, bl, tr, tl] = await Promise.all([
    sharp(input)
      .extract({ left: hx, top: hy, width: W - hx, height: H - hy })
      .toBuffer(),
    sharp(input)
      .extract({ left: 0, top: hy, width: hx, height: H - hy })
      .toBuffer(),
    sharp(input)
      .extract({ left: hx, top: 0, width: W - hx, height: hy })
      .toBuffer(),
    sharp(input)
      .extract({ left: 0, top: 0, width: hx, height: hy })
      .toBuffer(),
  ]);

  const shiftedRGB = await sharp(undefined, {
    create: {
      width: W,
      height: H,
      channels: 3,
      background: { r: 0, g: 0, b: 0 },
    },
  })
    .composite([
      { input: br, left: 0, top: 0 },
      { input: bl, left: W - hx, top: 0 },
      { input: tr, left: 0, top: H - hy },
      { input: tl, left: W - hx, top: H - hy },
    ])
    .png()
    .toBuffer();

  // Build a feathered greyscale alpha mask:
  //   - White border (~18% wide) → shifted version is opaque there
  //   - Black inner rectangle (~64% of the area) → original shows through
  //   - Blurred seam between them for a smooth ~8% fade
  const borderFrac = 0.18;
  const featherFrac = 0.08;
  const innerMarginX = Math.floor(W * borderFrac);
  const innerMarginY = Math.floor(H * borderFrac);
  const featherRadius = Math.max(1, Math.floor(W * featherFrac));

  // sharp's `create` option doesn't support 1-channel (greyscale) buffers;
  // build them as raw byte buffers with Buffer.alloc(size, fillByte) instead.
  const innerW = W - innerMarginX * 2;
  const innerH = H - innerMarginY * 2;
  const innerBlackRaw = Buffer.alloc(innerW * innerH, 0);
  const maskCanvasRaw = Buffer.alloc(W * H, 255);

  const innerBlack = await sharp(innerBlackRaw, {
    raw: { width: innerW, height: innerH, channels: 1 },
  })
    .png()
    .toBuffer();

  const mask = await sharp(maskCanvasRaw, {
    raw: { width: W, height: H, channels: 1 },
  })
    .composite([{ input: innerBlack, left: innerMarginX, top: innerMarginY }])
    .blur(featherRadius)
    .png()
    .toBuffer();

  // Attach the mask as alpha to shiftedRGB, then composite over the original.
  const shiftedRGBA = await sharp(shiftedRGB).joinChannel(mask).png().toBuffer();

  const result = await sharp(input)
    .composite([{ input: shiftedRGBA, blend: "over" }])
    .png()
    .toBuffer();

  return result;
}

// ---------------------------------------------------------------------------
// Stage 2: upscaleImage (Real-ESRGAN 4x via Replicate)
// ---------------------------------------------------------------------------

export async function upscaleImage(imageUrl: string): Promise<string> {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) {
    throw new Error("REPLICATE_API_TOKEN is not configured");
  }

  const replicate = new Replicate({ auth: token });

  const timeout = new Promise<never>((_, reject) => {
    setTimeout(
      () => reject(new Error(`Upscale timeout after ${UPSCALE_TIMEOUT_MS}ms`)),
      UPSCALE_TIMEOUT_MS
    );
  });

  const runPromise = replicate.run(REAL_ESRGAN_VERSION, {
    input: { image: imageUrl, scale: 4 },
  });

  const output = await Promise.race([runPromise, timeout]);

  // Real-ESRGAN typically returns a single URL string, but some versions
  // wrap it in an array.
  if (typeof output === "string") return output;
  if (Array.isArray(output) && typeof output[0] === "string") return output[0];
  if (
    output &&
    typeof output === "object" &&
    "url" in output &&
    typeof (output as { url: unknown }).url === "function"
  ) {
    // Newer replicate SDK may return a FileOutput-like object.
    const url = (output as { url: () => URL }).url();
    return url.toString();
  }
  throw new Error("Unexpected Replicate output shape");
}

// ---------------------------------------------------------------------------
// Stage 3: processForProduction — the full pipeline.
// ---------------------------------------------------------------------------

export async function processForProduction(designId: string): Promise<string> {
  const design = await prisma.design.findUnique({ where: { id: designId } });
  if (!design) {
    throw new Error(`Design ${designId} not found`);
  }

  const sourceUrl = design.selectedImage || design.images[0];
  if (!sourceUrl) {
    throw new Error(`Design ${designId} has no source image`);
  }

  try {
    await prisma.design.update({
      where: { id: designId },
      data: { processingStatus: "processing" },
    });

    // 1. Download the AI-generated original.
    const originalRes = await fetch(sourceUrl);
    if (!originalRes.ok) {
      throw new Error(
        `Failed to fetch source image (${originalRes.status}): ${sourceUrl}`
      );
    }
    const originalBuffer = Buffer.from(await originalRes.arrayBuffer());

    // 2. Make seamless.
    const seamlessBuffer = await makeSeamlessTile(originalBuffer);

    // 3. Upload seamless intermediate to R2 (Replicate needs a public URL).
    const seamlessKey = `production/${designId}_seamless.png`;
    const seamlessUrl = await uploadBufferToR2(
      seamlessBuffer,
      seamlessKey,
      "image/png"
    );

    // 4. 4x super-resolution via Replicate.
    const upscaledUrl = await upscaleImage(seamlessUrl);

    // 5. Download upscaled output.
    const upRes = await fetch(upscaledUrl);
    if (!upRes.ok) {
      throw new Error(
        `Failed to fetch upscaled image (${upRes.status}): ${upscaledUrl}`
      );
    }
    const upscaledBuffer = Buffer.from(await upRes.arrayBuffer());

    // 6. Stamp 300 DPI metadata and re-encode.
    const finalBuffer = await sharp(upscaledBuffer)
      .withMetadata({ density: 300 })
      .png()
      .toBuffer();

    const finalKey = `production/${designId}_300dpi.png`;
    const finalUrl = await uploadBufferToR2(
      finalBuffer,
      finalKey,
      "image/png"
    );

    await prisma.design.update({
      where: { id: designId },
      data: {
        productionImageUrl: finalUrl,
        processingStatus: "completed",
      },
    });

    return finalUrl;
  } catch (err) {
    console.error(`processForProduction failed for ${designId}:`, err);
    await prisma.design
      .update({
        where: { id: designId },
        data: { processingStatus: "failed" },
      })
      .catch((updateErr) => {
        console.error(
          `Also failed to mark design ${designId} as failed:`,
          updateErr
        );
      });
    throw err;
  }
}
