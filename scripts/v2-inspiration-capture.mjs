// /inspiration 链路对照截图
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

const BASE = process.env.BASE || "http://localhost:3300";
const OUT = resolve("design/screenshots/v2-inspiration");
mkdirSync(OUT, { recursive: true });

async function shot(page, url, viewport, file) {
  await page.setViewportSize(viewport);
  await page.goto(`${BASE}${url}`, { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.waitForTimeout(5000);
  await page.screenshot({ path: resolve(OUT, file), fullPage: true });
  console.log("✓", file);
}

(async () => {
  // 选第一条作品的 ID 用于详情页
  const j = await fetch(`${BASE}/api/inspiration?pageSize=4`).then((r) => r.json());
  const id = j.works?.[0]?.id;
  console.log("detail id:", id, "—", j.works?.[0]?.title);

  const browser = await chromium.launch();
  const ctx = await browser.newContext({ deviceScaleFactor: 1 });
  const page = await ctx.newPage();

  await shot(page, "/inspiration", { width: 1440, height: 900 }, "desktop_inspiration.png");
  await shot(page, "/inspiration", { width: 375, height: 800 }, "mobile_inspiration.png");
  if (id) {
    await shot(page, `/inspiration/${id}`, { width: 1440, height: 900 }, "desktop_inspiration_detail.png");
    await shot(page, `/inspiration/${id}`, { width: 375, height: 800 }, "mobile_inspiration_detail.png");
  }
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
