import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

const BASE = process.env.BASE || "http://localhost:3300";
const OUT = resolve("design/screenshots/v2-hero-redo");
mkdirSync(OUT, { recursive: true });

async function shot(page, url, viewport, file, options = {}) {
  await page.setViewportSize(viewport);
  await page.goto(`${BASE}${url}`, { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.waitForLoadState("networkidle", { timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(3000);
  await page.screenshot({ path: resolve(OUT, file), ...options });
  console.log("✓", file);
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newContext({ deviceScaleFactor: 1 }).then((c) => c.newPage());

  // 全页桌面 + 移动
  await shot(page, "/inspiration", { width: 1440, height: 900 }, "desktop_full.png", { fullPage: true });
  await shot(page, "/inspiration", { width: 375, height: 800 }, "mobile_full.png", { fullPage: true });

  // hero 局部(viewport 截不滚动)
  await shot(page, "/inspiration", { width: 1440, height: 900 }, "desktop_hero_viewport.png", { fullPage: false });
  await shot(page, "/inspiration", { width: 375, height: 800 }, "mobile_hero_viewport.png", { fullPage: false });

  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
