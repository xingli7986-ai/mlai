// V2 真版 — 认证设计师视觉数据落地后的对照截图
// 桌面 1440×900 + 移动 375×800,共 6 张
// 输出:design/screenshots/v2-certified-applied/

import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

const BASE = process.env.BASE || "http://localhost:3300";
const OUT = resolve("design/screenshots/v2-certified-applied");
mkdirSync(OUT, { recursive: true });

async function shot(page, url, viewport, file) {
  await page.setViewportSize(viewport);
  await page.goto(`${BASE}${url}`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: resolve(OUT, file), fullPage: true });
  console.log("✓", file);
}

async function findDesignIdByCertification(certified) {
  // Page through results to find one matching cert flag
  for (let page = 1; page <= 5; page++) {
    const res = await fetch(`${BASE}/api/designs?limit=24&page=${page}`);
    const j = await res.json();
    const hit = j.designs?.find((d) => d.designer?.isCertified === certified);
    if (hit) return { id: hit.id, designerName: hit.designer.name, title: hit.title };
  }
  return null;
}

(async () => {
  const certified = await findDesignIdByCertification(true);
  const normal = await findDesignIdByCertification(false);
  console.log("certified pick:", certified);
  console.log("normal pick:", normal);

  const browser = await chromium.launch();
  const ctx = await browser.newContext({ deviceScaleFactor: 1 });
  const page = await ctx.newPage();

  // 1+2 印花衣橱
  await shot(page, "/products", { width: 1440, height: 900 }, "desktop_products.png");
  await shot(page, "/products", { width: 375, height: 800 }, "mobile_products.png");

  // 3+4 商品详情(认证设计师)
  if (certified) {
    await shot(page, `/products/${certified.id}`, { width: 1440, height: 900 }, "desktop_pdp_certified.png");
    await shot(page, `/products/${certified.id}`, { width: 375, height: 800 }, "mobile_pdp_certified.png");
  }

  // 5+6 商品详情(普通设计师对照)
  if (normal) {
    await shot(page, `/products/${normal.id}`, { width: 1440, height: 900 }, "desktop_pdp_normal.png");
    await shot(page, `/products/${normal.id}`, { width: 375, height: 800 }, "mobile_pdp_normal.png");
  }

  await browser.close();

  // Stash picks for the report
  console.log(JSON.stringify({ certified, normal }, null, 2));
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
