// 回滚后验证截图:检查 /inspiration + /products 顶栏 + 卡片占位 + Hero 占位
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

const BASE = process.env.BASE || "http://localhost:3300";
const OUT = resolve("design/screenshots/v2-rollback");
mkdirSync(OUT, { recursive: true });

async function shot(page, url, viewport, file) {
  await page.setViewportSize(viewport);
  await page.goto(`${BASE}${url}`, { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.waitForTimeout(5000);
  await page.screenshot({ path: resolve(OUT, file), fullPage: true });
  console.log("✓", file);
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newContext({ deviceScaleFactor: 1 }).then((c) => c.newPage());

  await shot(page, "/inspiration", { width: 1440, height: 900 }, "inspiration_desktop.png");
  await shot(page, "/products", { width: 1440, height: 900 }, "products_desktop.png");

  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
