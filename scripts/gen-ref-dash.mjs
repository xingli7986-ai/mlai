import { writeFile } from "node:fs/promises";
import path from "node:path";

const ENDPOINT = "https://yxai.anthropic.edu.pl/v1/images/generations";
const KEY = "sk-nq0U9qsj7EP4onCWuw9dYLnE2g74bzSzpWUKXKBggkLUTgaB";

const prompt =
  "Professional dark-mode UI design for a luxury fashion brand AI design studio web application. Page: Designer dashboard with revenue analytics. Layout: 240px left sidebar, main area shows greeting headline, 4 KPI stat cards (revenue / orders / favorites / followers), a large area chart card showing revenue trend, a sidebar card with profile + quick actions, a horizontal product gallery row, and a transactions table at bottom. Color scheme: background #0C0C0F, cards #1E1E1E, accent Champagne Gold #C8A875, text #F7F0E9. All text in Chinese. Clean modern premium feel. Desktop 1440px width.";

let lastErr;
for (let attempt = 1; attempt <= 3; attempt++) {
  try {
    console.log(`attempt ${attempt}...`);
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "gpt-image-2", prompt, size: "1536x1024", n: 1 }),
    });
    const txt = await res.text();
    if (!res.ok) {
      console.error(`HTTP ${res.status}: ${txt.slice(0, 200)}`);
      continue;
    }
    const json = JSON.parse(txt);
    const item = json?.data?.[0];
    if (item?.b64_json) {
      await writeFile(path.resolve("design/ui-reference/studio-dashboard.png"), Buffer.from(item.b64_json, "base64"));
      console.log("ok");
      process.exit(0);
    } else if (item?.url) {
      const img = await fetch(item.url);
      await writeFile(path.resolve("design/ui-reference/studio-dashboard.png"), Buffer.from(await img.arrayBuffer()));
      console.log("ok via url");
      process.exit(0);
    }
  } catch (e) {
    lastErr = e;
    console.error(`err: ${e.message}`);
  }
}
console.error("all attempts failed", lastErr?.message);
process.exit(1);
