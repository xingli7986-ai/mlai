import { chromium } from "playwright";
import path from "path";

const BASE = "http://localhost:3000";
const OUT = path.resolve("design/screenshots/desktop");

const PAGES = [
  { name: "home", url: "/" },
  { name: "products-detail", url: "/products/1" },
  { name: "products-custom", url: "/products/1/custom" },
  { name: "my-orders", url: "/my/orders" },
  { name: "admin-manage", url: "/admin/manage" },
];

async function snap(page, name, url) {
  try {
    await page.goto(BASE + url, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(800);
    await page.screenshot({
      path: path.join(OUT, name + ".png"),
      fullPage: false,
      type: "png",
    });
    console.log("OK    " + name);
  } catch (err) {
    console.log("FAIL  " + name + " :: " + (err && err.message ? err.message : err));
  }
}

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
for (const p of PAGES) await snap(page, p.name, p.url);
await ctx.close();
await browser.close();
