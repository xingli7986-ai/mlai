import { chromium } from "playwright";
import { mkdir } from "fs/promises";
import path from "path";

const BASE = "http://localhost:3000";
const OUT = path.resolve("design/screenshots");

const PAGES = [
  // Consumer
  { name: "home", url: "/" },
  { name: "products", url: "/products" },
  { name: "products-detail", url: "/products/1" },
  { name: "products-custom", url: "/products/1/custom" },
  { name: "group-buy", url: "/group-buy/1" },
  { name: "group-buy-progress", url: "/group-buy/1/progress" },
  { name: "my", url: "/my" },
  { name: "my-orders", url: "/my/orders" },
  { name: "my-orders-detail", url: "/my/orders/1" },
  { name: "login", url: "/login" },
  { name: "privacy", url: "/privacy" },
  { name: "terms", url: "/terms" },
  { name: "size-guide", url: "/size-guide" },
  // Studio
  { name: "studio", url: "/studio" },
  { name: "studio-join", url: "/studio/join" },
  { name: "studio-dashboard", url: "/studio/dashboard" },
  { name: "studio-publish", url: "/studio/publish" },
  { name: "studio-publish-tech-pack", url: "/studio/publish/tech-pack" },
  // Pattern tools
  { name: "studio-pattern-generate", url: "/studio/pattern/generate" },
  { name: "studio-pattern-seamless", url: "/studio/pattern/seamless" },
  { name: "studio-pattern-style-clone", url: "/studio/pattern/style-clone" },
  { name: "studio-pattern-fusion", url: "/studio/pattern/fusion" },
  { name: "studio-pattern-craft", url: "/studio/pattern/craft" },
  { name: "studio-pattern-edit", url: "/studio/pattern/edit" },
  { name: "studio-pattern-enhance", url: "/studio/pattern/enhance" },
  // Fashion tools
  { name: "studio-fashion-sketch", url: "/studio/fashion/sketch" },
  { name: "studio-fashion-render", url: "/studio/fashion/render" },
  { name: "studio-fashion-modify", url: "/studio/fashion/modify" },
  { name: "studio-fashion-innovate", url: "/studio/fashion/innovate" },
  { name: "studio-fashion-style-fusion", url: "/studio/fashion/style-fusion" },
  { name: "studio-fashion-color", url: "/studio/fashion/color" },
  { name: "studio-fashion-recolor", url: "/studio/fashion/recolor" },
  { name: "studio-fashion-fabric", url: "/studio/fashion/fabric" },
  { name: "studio-fashion-pattern", url: "/studio/fashion/pattern" },
  // Admin
  { name: "admin-manage", url: "/admin/manage" },
];

async function snap(page, dir, name, url) {
  try {
    await page.goto(BASE + url, { waitUntil: "domcontentloaded", timeout: 30000 });
    // Give the page a moment to render fonts/images
    await page.waitForTimeout(800);
    await page.screenshot({
      path: path.join(dir, name + ".png"),
      fullPage: false,
      type: "png",
    });
    console.log("OK    " + name + " " + url);
  } catch (err) {
    console.log("FAIL  " + name + " " + url + " :: " + (err && err.message ? err.message : err));
  }
}

async function main() {
  await mkdir(path.join(OUT, "desktop"), { recursive: true });
  await mkdir(path.join(OUT, "mobile"), { recursive: true });

  const browser = await chromium.launch({ headless: true });

  // Desktop pass — 1440x900
  const desktopCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const desktopPage = await desktopCtx.newPage();
  for (const p of PAGES) {
    await snap(desktopPage, path.join(OUT, "desktop"), p.name, p.url);
  }
  await desktopCtx.close();

  // Mobile pass — 375x800
  const mobileCtx = await browser.newContext({
    viewport: { width: 375, height: 800 },
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  const mobilePage = await mobileCtx.newPage();
  for (const p of PAGES) {
    await snap(mobilePage, path.join(OUT, "mobile"), p.name, p.url);
  }
  await mobileCtx.close();

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
