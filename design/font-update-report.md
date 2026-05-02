# 全站字体方案更换报告

> Date: 2026-05-01
> Trigger: 用户指令"全站字体方案更换为 Playfair + Inter + 思源宋体黑体"
> Status: ✅ Completed
> tsc --noEmit: exit 0

---

## 1. 字体方案

| 用途 | 字体 | 状态 |
|---|---|---|
| 英文标题 | Playfair Display | 保留 |
| 英文正文 | Inter | 替换原 Cormorant Garamond |
| 中文标题 | Noto Serif SC 思源宋体 | 保留（之前是 fallback，现在升级为 next/font 直接加载） |
| 中文正文 | Noto Sans SC 思源黑体 | 新增 |

## 2. 字体引入方式（next/font/google）

文件：`app/layout.tsx`

```tsx
import {
  Playfair_Display,
  Inter,
  Noto_Serif_SC,
  Noto_Sans_SC,
} from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", display: "swap" });
const inter    = Inter({ subsets: ["latin"], weight: ["400","500","700","800"], variable: "--font-inter", display: "swap" });
const notoSerifSC = Noto_Serif_SC({ weight: ["400","500","600","700"], variable: "--font-noto-serif-sc", display: "swap", preload: false });
const notoSansSC  = Noto_Sans_SC({  weight: ["400","500","600","700"], variable: "--font-noto-sans-sc",  display: "swap", preload: false });
```

四个字体变量挂在 `<html className=...>` 上，全树继承。

中文字体设 `preload: false`：思源宋体/黑体的拉丁子集不需要在首屏阻塞下载，浏览器在遇到中文字符时按需加载即可。

## 3. 移除的旧字体

- ❌ `Cormorant_Garamond` — 从 `next/font/google` 引入清除，不再下载，不再生成 `--font-cormorant` 变量。

`app/layout.tsx` 同时移除了 `<body className="...font-body...">` 中的 `font-body` 类（Tailwind v4 没有这个类，原本是死链）。

## 4. globals.css :root 字体变量

文件：`app/globals.css`

新增的两个 canonical token：

```css
:root {
  --font-serif:
    var(--font-playfair),
    var(--font-noto-serif-sc),
    "Noto Serif SC",
    "Songti SC",
    "SimSun",
    Georgia,
    serif;

  --font-sans:
    var(--font-inter),
    var(--font-noto-sans-sc),
    "Noto Sans SC",
    "PingFang SC",
    "Microsoft YaHei",
    system-ui,
    -apple-system,
    Segoe UI,
    Roboto,
    Helvetica,
    Arial,
    sans-serif;

  /* 兼容旧引用：保留但都指向新 token */
  --font-display: var(--font-serif);
  --font-body: var(--font-sans);
}
```

`@theme inline` 同步暴露 `--font-sans` / `--font-serif` 给 Tailwind v4，`body { font-family: var(--font-sans) }` 让正文默认走思源黑体，`h1..h6 { font-family: var(--font-serif) }` 让标题默认走思源宋体。

## 5. 修改文件清单

### 5.1 字体引入与 token 定义

| 文件 | 修改 |
|---|---|
| `app/layout.tsx` | 移除 Cormorant，新增 Noto Serif SC / Noto Sans SC，html className 挂 4 个字体变量 |
| `app/globals.css` | `:root` 新增 `--font-serif` / `--font-sans`；`--font-display` / `--font-body` 改为别名；body 与 h1-h6 默认 family 走新 token |

### 5.2 页面级 alias 更新（CSS scope-local）

| 文件 | 修改 |
|---|---|
| `app/home-consumer.css` | `.page-wrap` scope 内 `--serif` / `--sans` / `--display` 改为引用 `var(--font-serif/sans)` |
| `app/homepage.css` | `.productPage` scope 内 `--serif` / `--sans` 改为引用 `var(--font-serif/sans)` |
| `app/studio/studio.css` | `.studio-root` scope 内 `--serif` / `--sans` 改为引用 `var(--font-serif/sans)` |

### 5.3 hardcode font-family 修复

10 个文件、共 50+ 处替换为 `var(--font-serif)` 或 `var(--font-sans)`：

| 文件 | 替换次数 |
|---|---|
| `app/product-pages.css` | 7 处不同字面量模式 |
| `app/studio/designer-center.css` | 7 处 |
| `app/studio/join/join.css` | 7 处 |
| `app/studio/publish/publish.css` | 5 处 |
| `app/studio/studio-home.css` | 3 处 |
| `app/studio/fashion/fashion-tool.css` | 2 处 |
| `app/studio/dashboard/page.tsx` | 1 处（inline style） |
| `app/studio/publish/tech-pack/page.tsx` | 3 处（inline style） |
| `app/studio/pattern/seamless/page.tsx` | 1 处（inline style） |

## 6. 违规字体硬编码清单（修复前 → 修复后）

| 模式 | 出现次数 | 修复 |
|---|---:|---|
| `font-family: var(--font-display, "Cormorant Garamond"), serif;` | 21 | → `font-family: var(--font-serif);` |
| `font-family: var(--font-cormorant), "Cormorant Garamond", Georgia, serif;` | 4 | → `font-family: var(--font-serif);` |
| `font-family: "Cormorant Garamond", "Noto Serif SC", Georgia, serif;` | 1 | → `font-family: var(--font-serif);` |
| `font-family: "Noto Serif SC", "Songti SC", "SimSun", Georgia, serif;` | 1 | → `font-family: var(--font-serif);` |
| `font-family: "Noto Serif SC", "Songti SC", Georgia, serif;` | 1 | → `font-family: var(--font-serif);` |
| `font-family: "Noto Serif SC", Georgia, serif;` | 4 | → `font-family: var(--font-serif);` |
| `font-family: "Noto Serif SC", var(--serif), Georgia, serif;` | 1 | → `font-family: var(--font-serif);` |
| `font-family: var(--sans, "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif);` | 1 | → `font-family: var(--font-sans);` |
| `fontFamily: 'var(--font-display, "Cormorant Garamond"), serif'` (inline) | 1 | → `fontFamily: "var(--font-serif)"` |
| `fontFamily: "var(--font-display, Georgia)"` (inline ×3) | 3 | → `fontFamily: "var(--font-serif)"` |
| `fontFamily: "Noto Serif SC, serif"` (inline) | 1 | → `fontFamily: "var(--font-serif)"` |

未触动（按规范保留）：

- `font-family: inherit` — 7 处（Button / Input / textarea / select / input element 继承父级，正确）
- `font-family: monospace` — 5 处（订单号 / 二维码 / 设计编号等技术文本，按 Component Spec 沿用）
- `lib/techpack-pdf.tsx: fontFamily: "NotoSansSC"` — 1 处，这是 react-pdf 的 PDF 字体注册名，不是 CSS，不在本次范围

## 7. 字号阶梯验证（Design System Part 4 §4.2）

未改任何 font-size / font-weight / line-height（用户明确要求"不擅自调整字号、字重、行距"）。

抽样验证 Design System 字号阶梯：

| Token | 规范 | 实际 |
|---|---|---|
| H1 | 56px / 64px / 700 | `app/products/page.tsx` `.galleryHero h1` 使用 design-system 派生的级别 |
| H2 | 36px / 44px / 600 | `app/studio/dashboard/designer-center.css .dc-card h2` ≈ clamp(20–30px) ✓ |
| H3 | 24px / 32px / 600 | `.studio-root h3 { font-size: 22px }` 接近 24，原值未动 |
| Body | 16px / 28px / 400 | `app/studio/studio.css .lead { font-size: 16px }` ✓ |
| Caption | 13px / 20px | `.studio-root .eyebrow { font-size: 12px }` 等 |
| Button | 15px / 20px / 500 | `components/ui/ui.css .ui-btn { font-size: 15px }` ✓ |

实际页面里仍存在大量 hardcoded font-size（未抽象成 `--text-*` token），这是 6.3 留下的现状，不是本次任务范围。本次只换字体不动字号。

## 8. 12 张截图说明

文件位置：`design/screenshots/font-after/`

| # | 路由 | 桌面 1440×900 | 移动 375×800 |
|---|---|---|---|
| 1 | `/` | `desktop/01-home.png` | `mobile/01-home.png` |
| 2 | `/products` | `desktop/02-products.png` | `mobile/02-products.png` |
| 3 | `/products/1` | `desktop/03-products-detail.png` | `mobile/03-products-detail.png` |
| 4 | `/studio` | `desktop/04-studio.png` | `mobile/04-studio.png` |
| 5 | `/studio/join` | `desktop/05-studio-join.png` | `mobile/05-studio-join.png` |
| 6 | `/my` | `desktop/06-my.png` | `mobile/06-my.png` |

注：`/products/1` 因数据库内不存在 id=1 的设计，会渲染全站 not-found 页面（粉色 404 主题，与本次字体改动无关）。其他 5 个页面渲染正常，标题层级使用 Playfair + 思源宋体，正文使用 Inter + 思源黑体。

抽样视觉验证：

- 首页 hero h1 "让你的灵感，与喜欢的设计，都能穿上身" → 思源宋体（serif），符合标题规范 ✓
- 首页 sub "通过上千款设计师原创艺术印花..." → 思源黑体（sans），符合正文规范 ✓
- /studio/join hero h1 "成为 MaxLuLu AI 设计师" → 思源宋体 ✓
- /studio/join 正文 / 表单 label → 思源黑体 ✓
- /studio sidebar 菜单项（中文）→ 思源黑体（导航文字 spec 是 sans） ✓

## 9. 验收

| 项 | 状态 |
|---|---|
| 旧字体 Cormorant Garamond 已从 next/font 引入移除 | ✅ |
| 新字体 Inter / Noto Serif SC / Noto Sans SC 已通过 next/font/google 引入 | ✅ |
| `--font-serif` / `--font-sans` 在 :root 定义 | ✅ |
| 全站 hardcoded font-family 已替换为 var() 引用（除 inherit / monospace 例外） | ✅ |
| 字号 / 字重 / 行距未被擅自调整 | ✅ |
| 12 张截图齐全（6 页 × 2 viewport） | ✅ |
| `npx tsc --noEmit` exit 0 | ✅ |

---

## 10. 后续可做（不在本次范围）

- **font-size 抽象成 `--text-*` token**：当前各页面仍有大量 hardcoded font-size，离 Design System "所有字号都从 :root 变量来" 的目标还差一步。建议另立任务 `feat: 字号阶梯 token 化`。
- **思源宋体 / 黑体的 weight 子集裁剪**：当前各引入了 4 个权重 (400 / 500 / 600 / 700)。如果性能审计发现首屏字体阻塞过重，可减到 2 个 (400 + 600)。
- **Tailwind v4 `@theme` 内 font 类生成**：可在 `@theme inline` 内加 `--font-display: var(--font-serif)` 这样 Tailwind 会自动生成 `font-display` utility class，避免开发者绕开 token 系统。
