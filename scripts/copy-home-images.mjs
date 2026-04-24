// One-off image copier — maps the user's raw home assets into Next.js public/
// slots whose filenames are dictated by lib/home-consumer-data.ts.
//
// Run with:  node scripts/copy-home-images.mjs

import fs from "node:fs/promises";
import path from "node:path";

const SRC_ROOT = path.resolve("assets/images/home");
const DST_ROOT = path.resolve("public/assets/images/home");

// Target filenames in order, per target directory.
const TARGETS = {
  "01-hero": ["summer-knit-wrap-dress-hero.png"],
  "02-featured-designs/dresses-summer": [
    "01-ink-garden-knit-wrap-dress.png",
    "02-camellia-ink-v-neck-dress.png",
    "03-black-white-abstract-wrap-dress.png",
    "04-wine-rose-waist-tie-dress.png",
    "05-blue-white-sea-breeze-wrap-dress.png",
    "06-vintage-coffee-floral-wrap-dress.png",
    "07-navy-geometry-commute-dress.png",
    "08-almond-floral-high-waist-dress.png",
    "09-dusty-rose-ink-short-sleeve-dress.png",
    "10-black-fine-floral-office-dress.png",
    "11-ink-green-botanical-midi-dress.png",
    "12-island-blue-knit-midi-dress.png",
    "13-morning-mist-tea-dress.png",
    "14-coral-floral-flutter-sleeve-dress.png",
    "15-palm-shadow-light-wrap-dress.png",
    "16-black-gold-floral-evening-dress.png",
    "17-twilight-rose-slim-dress.png",
    "18-deep-sea-abstract-slit-dress.png",
  ],
  "03-scenes": [
    "commute-knit-print-dress.png",
    "date-floral-wrap-dress.png",
    "dinner-black-gold-dress.png",
    "travel-blue-white-dress.png",
    "daily-soft-knit-dress.png",
    "party-v-neck-dress.png",
  ],
  "04-prints": [
    "ink-floral-print.png",
    "camellia-ink-print.png",
    "blue-white-geometry-print.png",
    "vintage-oil-floral-print.png",
    "black-gold-evening-print.png",
    "dusty-rose-floral-print.png",
  ],
  "07-brand-story": [
    "elegant-fashion-studio-with-city-view.png",
    "serene-fabric-studio-in-muted-tones.png",
    "fashion-design-workspace-in-soft-light.png",
  ],
};

// Source directory (under assets/images/home) that feeds each target directory.
// Index-prefix match: 01→01, 02→02, 03→03-group-buy, 04→04-ai-tools, 07→07.
const SOURCE_FOR = {
  "01-hero": "01-hero",
  "02-featured-designs/dresses-summer": "02-featured-designs",
  "03-scenes": "03-group-buy",
  "04-prints": "04-ai-tools",
  "07-brand-story": "07-brand-story",
};

async function listImages(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  return entries
    .filter(
      (e) =>
        e.isFile() &&
        [".png", ".jpg", ".jpeg", ".webp", ".gif"].includes(
          path.extname(e.name).toLowerCase()
        )
    )
    .map((e) => e.name)
    .sort(); // stable alphabetical
}

async function main() {
  const summary = [];
  const skipped = [];

  for (const [targetDir, targetNames] of Object.entries(TARGETS)) {
    const sourceDirName = SOURCE_FOR[targetDir];
    const sourceDir = path.join(SRC_ROOT, sourceDirName);
    const outDir = path.join(DST_ROOT, targetDir);
    await fs.mkdir(outDir, { recursive: true });

    let sources;
    try {
      sources = await listImages(sourceDir);
    } catch (err) {
      console.error(`[skip] source dir missing: ${sourceDir}`);
      void err;
      continue;
    }

    const n = Math.min(sources.length, targetNames.length);
    for (let i = 0; i < n; i++) {
      const src = path.join(sourceDir, sources[i]);
      const dst = path.join(outDir, targetNames[i]);
      await fs.copyFile(src, dst);
      summary.push(`✓ ${path.relative(process.cwd(), src)}  →  ${path.relative(process.cwd(), dst)}`);
    }

    // Report leftovers.
    for (let i = n; i < targetNames.length; i++) {
      skipped.push(`[missing source] ${targetDir}/${targetNames[i]}`);
    }
    for (let i = n; i < sources.length; i++) {
      skipped.push(
        `[unused source]  ${path.relative(process.cwd(), path.join(sourceDir, sources[i]))}`
      );
    }
  }

  console.log("Copied:\n" + summary.join("\n"));
  console.log(`\nCopied ${summary.length} files.\n`);
  if (skipped.length) {
    console.log("Gaps:\n" + skipped.join("\n"));
    console.log(`\n${skipped.length} gap(s) — fallback gradient will render for missing slots.`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
