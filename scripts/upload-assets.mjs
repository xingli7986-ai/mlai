// One-off asset uploader.
//
// Walks assets/images/** and uploads every file to R2 under `brand/<same
// relative path>`. Filenames are slugified (lowercase, spaces/commas → `-`)
// so the resulting URLs are web-safe. Sequential files inside the same
// folder get a 2-digit index prefix so they sort stably.
//
// Run with:
//   node --env-file=.env scripts/upload-assets.mjs

import fs from "node:fs/promises";
import path from "node:path";
import mime from "node:util"; // unused
import {
  S3Client,
  PutObjectCommand,
} from "@aws-sdk/client-s3";

void mime; // silence linter; real mime inference is hand-rolled below

const ROOT = path.resolve("assets/images");
const BUCKET = "maxlulu-ai";

const r2 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const PUBLIC_URL = process.env.R2_PUBLIC_URL;
if (!PUBLIC_URL) {
  console.error("R2_PUBLIC_URL is not set. Run with `node --env-file=.env ...`.");
  process.exit(1);
}

function contentTypeFor(ext) {
  const e = ext.toLowerCase();
  if (e === ".png") return "image/png";
  if (e === ".jpg" || e === ".jpeg") return "image/jpeg";
  if (e === ".webp") return "image/webp";
  if (e === ".gif") return "image/gif";
  if (e === ".svg") return "image/svg+xml";
  return "application/octet-stream";
}

async function walk(dir) {
  const out = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  entries.sort((a, b) => a.name.localeCompare(b.name));
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      out.push(...(await walk(full)));
    } else if (e.isFile()) {
      const ext = path.extname(e.name).toLowerCase();
      if ([".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"].includes(ext)) {
        out.push(full);
      }
    }
  }
  return out;
}

function keyFor(absPath, indexInFolder) {
  const rel = path.relative(ROOT, absPath).split(path.sep).join("/");
  const dir = path.dirname(rel);
  const ext = path.extname(rel).toLowerCase();
  // 2-digit index prefix + lowercase kebab of the trailing folder name.
  const leaf = dir.split("/").pop() || "asset";
  const slug = leaf
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const name = `${String(indexInFolder).padStart(2, "0")}-${slug}${ext}`;
  return `brand/${dir}/${name}`.replace(/\/+/g, "/");
}

async function main() {
  const files = await walk(ROOT);
  console.log(`Found ${files.length} image files under ${ROOT}`);

  // Group by parent folder so indexes reset per folder.
  const byDir = new Map();
  for (const f of files) {
    const d = path.dirname(f);
    if (!byDir.has(d)) byDir.set(d, []);
    byDir.get(d).push(f);
  }

  const results = [];
  for (const [dir, items] of byDir) {
    items.sort();
    for (let i = 0; i < items.length; i++) {
      const file = items[i];
      const key = keyFor(file, i + 1);
      const body = await fs.readFile(file);
      const contentType = contentTypeFor(path.extname(file));
      await r2.send(
        new PutObjectCommand({
          Bucket: BUCKET,
          Key: key,
          Body: body,
          ContentType: contentType,
        })
      );
      const url = `${PUBLIC_URL}/${key}`;
      results.push({ source: file, key, url });
      console.log(`✓ ${url}`);
    }
    void dir;
  }

  console.log("\n=== Upload summary ===");
  console.log(`Uploaded ${results.length} file(s).\n`);
  console.log("URL list:");
  for (const r of results) {
    console.log(r.url);
  }

  await fs.writeFile(
    "scripts/upload-assets-result.json",
    JSON.stringify(results, null, 2),
    "utf8"
  );
  console.log("\nWrote scripts/upload-assets-result.json");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
