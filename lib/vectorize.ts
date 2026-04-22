// Color separation + vectorization pipeline.
//
// Input: a raster print image (Buffer — PNG/JPEG/whatever sharp can read).
// Output:
//   - aiBuffer : a PDF byte stream saved with .ai extension. Adobe Illustrator
//     opens "distilled" AI files (which are just PDFs) transparently. Each
//     color in the palette is drawn as a separately-filled path, so
//     downstream tools see the file as a set of vector objects per color.
//   - svgString : the same geometry as an SVG document (useful for web
//     preview / fallback plate output).
//   - colors : per-color breakdown with Pantone mapping + area percentage.
//
// Vectorization is done at the input raster's native resolution by potrace,
// then scaled to a 4096×4096 output page (standard production-file size).

import sharp from "sharp";
import potrace from "potrace";
import { PDFDocument, rgb } from "pdf-lib";
import { findClosestPantone } from "./pantone-map";

const DEFAULT_NUM_COLORS = 8;
const KMEANS_SAMPLE_LIMIT = 20_000; // pixels sampled for centroid search
const KMEANS_MAX_ITERS = 30;
const OUTPUT_CANVAS = 4096; // points for the final PDF / SVG viewBox

export type ColorInfo = {
  hex: string;
  pantoneCode: string;
  pantoneName: string;
  percentage: number;
};

export async function generateProductionAI(
  imageBuffer: Buffer,
  options: { numColors?: number } = {}
): Promise<{ aiBuffer: Buffer; svgString: string; colors: ColorInfo[] }> {
  const numColors = options.numColors ?? DEFAULT_NUM_COLORS;

  // 1. Read raw RGB from the input.
  const { data, info } = await sharp(imageBuffer)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  if (channels !== 3) {
    throw new Error(`Expected 3-channel RGB, got ${channels}`);
  }
  const totalPixels = width * height;

  // 2. K-means quantization on a random sample of pixels.
  const centroids = runKMeans(data, totalPixels, numColors);

  // 3. Assign every pixel to the nearest centroid; tally cluster sizes.
  const assignments = new Uint8Array(totalPixels);
  const counts = new Array<number>(centroids.length).fill(0);
  for (let i = 0; i < totalPixels; i++) {
    const o = i * 3;
    const r = data[o];
    const g = data[o + 1];
    const b = data[o + 2];
    let bestIdx = 0;
    let bestDist = Number.POSITIVE_INFINITY;
    for (let k = 0; k < centroids.length; k++) {
      const [cr, cg, cb] = centroids[k];
      const dr = r - cr;
      const dg = g - cg;
      const db = b - cb;
      const d = dr * dr + dg * dg + db * db;
      if (d < bestDist) {
        bestDist = d;
        bestIdx = k;
      }
    }
    assignments[i] = bestIdx;
    counts[bestIdx]++;
  }

  // 4. For each cluster: build a binary mask, trace, and map to Pantone.
  const layers: Array<{
    pathD: string;
    color: ColorInfo;
    rgb: [number, number, number];
  }> = [];

  for (let k = 0; k < centroids.length; k++) {
    if (counts[k] === 0) continue;

    const mask = Buffer.alloc(totalPixels);
    for (let i = 0; i < totalPixels; i++) {
      if (assignments[i] === k) mask[i] = 255;
    }

    // Encode the mask as PNG so potrace can consume it via its Buffer API.
    const maskPng = await sharp(mask, {
      raw: { width, height, channels: 1 },
    })
      .png()
      .toBuffer();

    const svgOut = await traceMask(maskPng);
    const pathD = extractAllPathD(svgOut);
    if (!pathD) continue;

    const [cr, cg, cb] = centroids[k];
    const rInt = Math.round(cr);
    const gInt = Math.round(cg);
    const bInt = Math.round(cb);
    const hex = `#${toHex(rInt)}${toHex(gInt)}${toHex(bInt)}`;
    const pantone = findClosestPantone(rInt, gInt, bInt);

    layers.push({
      pathD,
      rgb: [rInt, gInt, bInt],
      color: {
        hex,
        pantoneCode: pantone.code,
        pantoneName: pantone.name,
        percentage: Math.round((counts[k] / totalPixels) * 1000) / 10,
      },
    });
  }

  // Sort by area descending so the biggest-area color draws first.
  layers.sort((a, b) => b.color.percentage - a.color.percentage);

  // 5. Assemble the SVG document.
  const scale = OUTPUT_CANVAS / width;
  const svgString = buildSvg(layers, width, height, scale);

  // 6. Assemble the PDF / .ai file.
  const aiBuffer = await buildPdf(layers, width, scale);

  return {
    aiBuffer,
    svgString,
    colors: layers.map((l) => l.color),
  };
}

// ---------------------------------------------------------------------------
// K-means++ on a pixel sample.
// ---------------------------------------------------------------------------

function runKMeans(
  data: Buffer,
  totalPixels: number,
  k: number
): Array<[number, number, number]> {
  // Deterministic-ish sampling via strided walk across the pixel array.
  const sampleSize = Math.min(KMEANS_SAMPLE_LIMIT, totalPixels);
  const stride = Math.max(1, Math.floor(totalPixels / sampleSize));
  const sample: Array<[number, number, number]> = [];
  for (let i = 0; i < totalPixels; i += stride) {
    const o = i * 3;
    sample.push([data[o], data[o + 1], data[o + 2]]);
    if (sample.length >= sampleSize) break;
  }

  // k-means++ initialization: first centroid random, each subsequent one
  // chosen with probability proportional to squared distance from the nearest
  // existing centroid. Improves over vanilla random init.
  const centroids: Array<[number, number, number]> = [];
  centroids.push(sample[Math.floor(Math.random() * sample.length)]);
  while (centroids.length < k) {
    const dists = sample.map((p) => {
      let minD = Number.POSITIVE_INFINITY;
      for (const c of centroids) {
        const dr = p[0] - c[0];
        const dg = p[1] - c[1];
        const db = p[2] - c[2];
        const d = dr * dr + dg * dg + db * db;
        if (d < minD) minD = d;
      }
      return minD;
    });
    const totalD = dists.reduce((a, b) => a + b, 0);
    let r = Math.random() * totalD;
    let pick = 0;
    for (let i = 0; i < dists.length; i++) {
      r -= dists[i];
      if (r <= 0) {
        pick = i;
        break;
      }
    }
    centroids.push(sample[pick]);
  }

  // Lloyd iterations.
  for (let iter = 0; iter < KMEANS_MAX_ITERS; iter++) {
    const sums: Array<[number, number, number]> = centroids.map(() => [0, 0, 0]);
    const counts = centroids.map(() => 0);

    for (const p of sample) {
      let bestIdx = 0;
      let bestDist = Number.POSITIVE_INFINITY;
      for (let i = 0; i < centroids.length; i++) {
        const c = centroids[i];
        const dr = p[0] - c[0];
        const dg = p[1] - c[1];
        const db = p[2] - c[2];
        const d = dr * dr + dg * dg + db * db;
        if (d < bestDist) {
          bestDist = d;
          bestIdx = i;
        }
      }
      sums[bestIdx][0] += p[0];
      sums[bestIdx][1] += p[1];
      sums[bestIdx][2] += p[2];
      counts[bestIdx]++;
    }

    let shifted = 0;
    for (let i = 0; i < centroids.length; i++) {
      if (counts[i] === 0) continue;
      const nr = sums[i][0] / counts[i];
      const ng = sums[i][1] / counts[i];
      const nb = sums[i][2] / counts[i];
      const dr = nr - centroids[i][0];
      const dg = ng - centroids[i][1];
      const db = nb - centroids[i][2];
      shifted += dr * dr + dg * dg + db * db;
      centroids[i] = [nr, ng, nb];
    }
    if (shifted < 1) break; // converged
  }

  return centroids;
}

// ---------------------------------------------------------------------------
// Potrace wrapper.
// ---------------------------------------------------------------------------

function traceMask(maskPng: Buffer): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    potrace.trace(
      maskPng,
      {
        turdSize: 5,
        alphaMax: 1.0,
        optTolerance: 0.2,
        threshold: 128,
      },
      (err: Error | null, svg: string) => {
        if (err) reject(err);
        else resolve(svg);
      }
    );
  });
}

function extractAllPathD(svgString: string): string {
  const matches = [...svgString.matchAll(/\sd="([^"]+)"/g)];
  return matches.map((m) => m[1]).join(" ");
}

function toHex(n: number): string {
  return Math.max(0, Math.min(255, Math.round(n)))
    .toString(16)
    .padStart(2, "0");
}

// ---------------------------------------------------------------------------
// SVG assembly — one <g> per separation, layer id includes Pantone code.
// ---------------------------------------------------------------------------

function buildSvg(
  layers: Array<{ pathD: string; color: ColorInfo; rgb: [number, number, number] }>,
  srcWidth: number,
  srcHeight: number,
  scale: number
): string {
  const layerXml = layers
    .map((layer, idx) => {
      const safeId = `Layer_${idx + 1}_Pantone_${layer.color.pantoneCode.replace(
        /[^A-Za-z0-9-]/g,
        "_"
      )}`;
      const fill = layer.color.hex;
      return `  <g id="${safeId}" inkscape:label="${layer.color.pantoneCode} ${escapeXml(
        layer.color.pantoneName
      )}" fill="${fill}"><path d="${layer.pathD}"/></g>`;
    })
    .join("\n");

  const outW = srcWidth * scale;
  const outH = srcHeight * scale;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" width="${outW}" height="${outH}" viewBox="0 0 ${outW} ${outH}">
  <g transform="scale(${scale})">
${layerXml}
  </g>
</svg>
`;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ---------------------------------------------------------------------------
// PDF / .ai assembly via pdf-lib. Each separation draws as a filled SVG path;
// Illustrator parses each drawSvgPath call as a separate object, which is
// enough for per-color pickability even without formal OCG layers.
// ---------------------------------------------------------------------------

async function buildPdf(
  layers: Array<{ pathD: string; color: ColorInfo; rgb: [number, number, number] }>,
  srcWidth: number,
  scale: number
): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.setTitle("MaxLuLu Print Pattern");
  pdfDoc.setCreator("MaxLuLu AI");
  pdfDoc.setProducer("MaxLuLu AI Print Processor");

  const page = pdfDoc.addPage([OUTPUT_CANVAS, OUTPUT_CANVAS]);
  // pdf-lib's drawSvgPath places the path with its (0,0) at the given (x, y).
  // SVG y grows downward; PDF y grows upward. Placing y = pageHeight and using
  // scale handles the flip.
  for (const layer of layers) {
    const [r, g, b] = layer.rgb;
    page.drawSvgPath(layer.pathD, {
      x: 0,
      y: OUTPUT_CANVAS,
      scale: scale,
      color: rgb(r / 255, g / 255, b / 255),
      borderWidth: 0,
    });
  }

  const bytes = await pdfDoc.save();
  return Buffer.from(bytes);
}
