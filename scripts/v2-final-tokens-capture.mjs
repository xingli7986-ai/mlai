// V2 final token + Button primary accent rose 验证截图
// 4 张:/products 桌面+移动 + /products/[id] 桌面+移动(cert id)
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

const BASE = process.env.BASE || "http://localhost:3300";
const OUT = resolve("design/screenshots/v2-final-tokens");
mkdirSync(OUT, { recursive: true });

async function shot(page, url, viewport, file) {
  await page.setViewportSize(viewport);
  await page.goto(`${BASE}${url}`, { waitUntil: "domcontentloaded", timeout: 60000 });
  // Give Next.js client render + skeleton → real cards transition
  await page.waitForTimeout(5000);
  await page.screenshot({ path: resolve(OUT, file), fullPage: true });
  console.log("✓", file);
}

(async () => {
  // pick first cert design id
  let id = null;
  for (let p = 1; p <= 5 && !id; p++) {
    const j = await fetch(`${BASE}/api/designs?limit=24&page=${p}`).then((r) => r.json());
    const hit = j.designs?.find((d) => d.designer?.isCertified === true);
    if (hit) id = hit.id;
  }
  console.log("certified id:", id);

  const browser = await chromium.launch();
  const ctx = await browser.newContext({ deviceScaleFactor: 1 });
  const page = await ctx.newPage();

  await shot(page, "/products", { width: 1440, height: 900 }, "desktop_products.png");
  await shot(page, "/products", { width: 375, height: 800 }, "mobile_products.png");
  if (id) {
    await shot(page, `/products/${id}`, { width: 1440, height: 900 }, "desktop_product_detail.png");
    await shot(page, `/products/${id}`, { width: 375, height: 800 }, "mobile_product_detail.png");
  }
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
