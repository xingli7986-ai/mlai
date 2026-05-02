// V2 高保真稿对照截图捕获脚本
// 桌面 1440×900 + 移动 375×800,共 4 张
// 输出到 design/screenshots/v2-applied/

import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

const BASE = process.env.BASE || "http://localhost:3300";
const OUT = resolve("design/screenshots/v2-applied");
mkdirSync(OUT, { recursive: true });

async function shot(page, url, viewport, file) {
  await page.setViewportSize(viewport);
  await page.goto(`${BASE}${url}`, { waitUntil: "domcontentloaded", timeout: 60000 });
  // Give Next.js client render + image fetches time
  await page.waitForTimeout(2500);
  await page.screenshot({ path: resolve(OUT, file), fullPage: true });
  console.log("✓", file);
}

async function fetchOneDesignId() {
  const res = await fetch(`${BASE}/api/designs?limit=1`);
  const j = await res.json();
  return j?.designs?.[0]?.id || null;
}

(async () => {
  const id = await fetchOneDesignId();
  console.log("designId:", id);

  const browser = await chromium.launch();
  const ctx = await browser.newContext({ deviceScaleFactor: 1 });
  const page = await ctx.newPage();

  await shot(page, "/products", { width: 1440, height: 900 }, "desktop_products.png");
  await shot(page, "/products", { width: 375, height: 800 }, "mobile_products.png");

  if (id) {
    await shot(page, `/products/${id}`, { width: 1440, height: 900 }, "desktop_product_detail.png");
    await shot(page, `/products/${id}`, { width: 375, height: 800 }, "mobile_product_detail.png");
  } else {
    console.warn("no designId — skip detail shots");
  }

  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
