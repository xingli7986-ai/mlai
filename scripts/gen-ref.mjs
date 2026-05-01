import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const ENDPOINT = "https://yxai.anthropic.edu.pl/v1/images/generations";
const KEY = "sk-nq0U9qsj7EP4onCWuw9dYLnE2g74bzSzpWUKXKBggkLUTgaB";
const OUT = path.resolve("design/ui-reference");

await mkdir(OUT, { recursive: true });

const PROMPTS = [
  {
    name: "studio-home",
    prompt:
      "Professional dark-mode UI design for a luxury fashion brand AI design studio web application. Page: Studio home dashboard. Layout: 240px left sidebar with vertical navigation groups (Workspace / Discover / Tools / Account), main content area with a hero greeting card on top, then a 4-column grid of pattern tool cards, then a 4-column grid of fashion tool cards, recent drafts gallery and inspiration list at the bottom. Color scheme: background #0C0C0F, cards #1E1E1E, accent Champagne Gold #C8A875, text #F7F0E9. All text in Chinese. Clean, modern, premium feel like D.SD fashion design tool. Show complete page layout with sidebar navigation on left (240px width), main content area on right. Desktop 1440px width.",
  },
  {
    name: "studio-dashboard",
    prompt:
      "Professional dark-mode UI design for a luxury fashion brand AI design studio web application. Page: Designer dashboard with revenue analytics. Layout: 240px left sidebar, main area shows greeting headline, 4 KPI stat cards (revenue / orders / favorites / followers), a large area chart card showing revenue trend, a sidebar card with profile + quick actions, a horizontal product gallery row, and a transactions table at bottom. Color scheme: background #0C0C0F, cards #1E1E1E, accent Champagne Gold #C8A875, text #F7F0E9, subtle wine-red #7F1F2B for active states. All text in Chinese. Clean, modern, premium feel like D.SD fashion design tool. Show complete page layout with sidebar navigation on left (240px width), main content area on right. Desktop 1440px width.",
  },
  {
    name: "studio-pattern-generate",
    prompt:
      "Professional dark-mode UI design for a luxury fashion brand AI design studio web application. Page: AI pattern generation tool. Layout: 240px left sidebar with active 图案工作室 expanded showing sub-tools, then a parameters panel column on the left of main area (style chips, reference image strip, sliders, output size selector, generate button), a center result preview column with a 2x2 grid of generated pattern thumbnails, and a right column showing recent history. Color scheme: background #0C0C0F, cards #1E1E1E, accent Champagne Gold #C8A875, text #F7F0E9. All text in Chinese, header reads 图案生成. Clean, modern, premium feel like D.SD fashion design tool. Show complete page layout with sidebar navigation on left (240px width), main content area on right. Desktop 1440px width.",
  },
];

for (const { name, prompt } of PROMPTS) {
  console.log(`generating ${name}...`);
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-image-2",
        prompt,
        size: "1536x1024",
        n: 1,
      }),
    });
    const txt = await res.text();
    if (!res.ok) {
      console.error(`  HTTP ${res.status}: ${txt.slice(0, 400)}`);
      await writeFile(path.join(OUT, `${name}.error.txt`), `HTTP ${res.status}\n${txt}`);
      continue;
    }
    let json;
    try {
      json = JSON.parse(txt);
    } catch {
      console.error(`  not JSON: ${txt.slice(0, 200)}`);
      await writeFile(path.join(OUT, `${name}.error.txt`), txt);
      continue;
    }
    const item = json?.data?.[0];
    if (item?.b64_json) {
      await writeFile(path.join(OUT, `${name}.png`), Buffer.from(item.b64_json, "base64"));
      console.log(`  -> ${name}.png (b64)`);
    } else if (item?.url) {
      const img = await fetch(item.url);
      const buf = Buffer.from(await img.arrayBuffer());
      await writeFile(path.join(OUT, `${name}.png`), buf);
      console.log(`  -> ${name}.png (from url)`);
    } else {
      console.error(`  no image data, body: ${txt.slice(0, 400)}`);
      await writeFile(path.join(OUT, `${name}.error.txt`), txt);
    }
  } catch (e) {
    console.error(`  error: ${e.message}`);
    await writeFile(path.join(OUT, `${name}.error.txt`), e.stack || e.message);
  }
}
