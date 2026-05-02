import { chromium } from "playwright";
import { mkdir } from "fs/promises";
import path from "path";

const BASE = "http://localhost:3000";
const OUT = path.resolve("design/screenshots/font-numbers-after");

const PAGES = [
  { name: "01-home", url: "/" },
  { name: "02-products", url: "/products" },
  { name: "03-products-detail", url: "/products/1" },
  { name: "04-studio", url: "/studio" },
  { name: "05-my", url: "/my" },
];

async function snap(page, dir, name, url) {
  try {
    await page.goto(BASE + url, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(2500);
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
  const desktopDir = path.join(OUT, "desktop");
  const mobileDir = path.join(OUT, "mobile");
  await mkdir(desktopDir, { recursive: true });
  await mkdir(mobileDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });

  const desktopCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const desktopPage = await desktopCtx.newPage();
  for (const p of PAGES) {
    await snap(desktopPage, desktopDir, p.name, p.url);
  }
  await desktopCtx.close();

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
    await snap(mobilePage, mobileDir, p.name, p.url);
  }
  await mobileCtx.close();

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
