import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

const BASE = process.env.BASE || "http://localhost:3300";
const OUT = resolve("design/screenshots/v2-hero-redo-v2");
mkdirSync(OUT, { recursive: true });

async function shot(page, url, viewport, file) {
  await page.setViewportSize(viewport);
  await page.goto(`${BASE}${url}`, { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.waitForLoadState("networkidle", { timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(3000);
  await page.screenshot({ path: resolve(OUT, file), fullPage: true });
  console.log("✓", file);
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newContext({ deviceScaleFactor: 1 }).then((c) => c.newPage());

  await shot(page, "/inspiration", { width: 1440, height: 900 }, "desktop_inspiration.png");
  await shot(page, "/inspiration", { width: 375, height: 800 }, "mobile_inspiration.png");

  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
