import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const TARGET = process.argv[2] || "before";
const BASE = "http://localhost:3000";
const OUT = path.resolve(`design/screenshots/${TARGET}`);

const PAGES = [
  ["studio-home", "/studio"],
  ["studio-join", "/studio/join"],
  ["studio-dashboard", "/studio/dashboard"],
  ["studio-publish", "/studio/publish"],
  ["studio-pattern-generate", "/studio/pattern/generate"],
];

const VIEWPORTS = [
  ["desktop-1440", { width: 1440, height: 900 }],
  ["mobile-375", { width: 375, height: 812 }],
];

await mkdir(OUT, { recursive: true });

const browser = await chromium.launch();
try {
  for (const [vpName, viewport] of VIEWPORTS) {
    const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    for (const [name, p] of PAGES) {
      const url = `${BASE}${p}`;
      console.log(`[${vpName}] ${url}`);
      try {
        await page.goto(url, { waitUntil: "networkidle", timeout: 45000 });
      } catch (e) {
        console.warn(`  goto warn: ${e.message}`);
      }
      await page.waitForTimeout(1500);
      const file = path.join(OUT, `${name}__${vpName}.png`);
      await page.screenshot({ path: file, fullPage: true });
      console.log(`  -> ${file}`);
    }
    await ctx.close();
  }
} finally {
  await browser.close();
}
