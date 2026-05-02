// 响应式 + my-studio 占位页验证截图,1440 / 1920 / 2560 三宽各 2 页 = 6 张
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

const BASE = process.env.BASE || "http://localhost:3300";
const OUT = resolve("design/screenshots/v2-responsive-fix");
mkdirSync(OUT, { recursive: true });

async function shot(page, url, viewport, file) {
  await page.setViewportSize(viewport);
  await page.goto(`${BASE}${url}`, { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.waitForLoadState("networkidle", { timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(3000);
  await page.screenshot({ path: resolve(OUT, file), fullPage: true });
  console.log("✓", file);
}

const widths = [
  { w: 1440, h: 900, label: "1440" },
  { w: 1920, h: 1080, label: "1920" },
  { w: 2560, h: 1440, label: "2560" },
];

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newContext({ deviceScaleFactor: 1 }).then((c) => c.newPage());

  for (const v of widths) {
    await shot(page, "/inspiration", { width: v.w, height: v.h }, `inspiration_${v.label}.png`);
    await shot(page, "/my-studio", { width: v.w, height: v.h }, `my-studio_${v.label}.png`);
  }

  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
