# 全站消费者前台统一 ConsumerNav + 个性定制 UX 修复报告

> Date: 2026-05-01
> Trigger: 用户确认方案 C1 + 两点补充（架构修复 + UX 修复）
> Status: ✅ Completed
> tsc --noEmit: exit 0

---

## 1. 修复方案与执行清单

| # | 内容 | 状态 |
|---|---|---|
| 一-1 | 审计 7 个消费者前台页面 ConsumerNav 使用情况 | ✅ |
| 一-2 | 6 个 inline nav 改为 ConsumerNav 引用 | ✅ |
| 一-3 | `/products` 搜索框移到 hero 区下方、FilterBar 上方 | ✅ |
| 二-4 | ConsumerNav "个性定制" href → `/products?intent=custom` | ✅ |
| 二-5 | `/products` 读取 `searchParams.intent`，显示 hero 引导 banner | ✅ |
| 三-6 | tsc --noEmit | ✅ exit 0 |
| 三-7 | 12 张 Playwright 截图 | ✅ `design/screenshots/nav-unified/{desktop,mobile}/` |
| 三-8 | 本报告 | ✅ |

## 2. 修改文件清单

### 2.1 ConsumerNav 本身

| 文件 | 修改 |
|---|---|
| `components/ConsumerNav.tsx` | NAV_LINKS 第二项 href 改为 `/products?intent=custom`；isActive() 函数小幅扩展，让 `/products` vs `/products?intent=custom` 能区分高亮（详见 §6 备注） |

### 2.2 6 个消费者前台页面（inline nav → ConsumerNav）

| 文件 | 修改 |
|---|---|
| `app/page.tsx` | 删除 `<nav className="nav scrolled">…</nav>` 块（19 行），改为 `<ConsumerNav variant="transparent" />`；同时移除已不再使用的 `scrolled` state + scroll listener |
| `app/products/page.tsx` | 删除 `<nav>` 块；新增 `<ConsumerNav variant="solid" />`；新增 `gallerySearchRow` section（搜索框）；新增 `intent === "custom"` 条件渲染的 `galleryIntent` banner |
| `app/products/[id]/custom/page.tsx` | 删除 `<nav>` 块；新增 `<ConsumerNav variant="solid" />`；移除 "← 返回详情" 链接（ConsumerNav 不放页面级跳转） |
| `app/group-buy/[id]/page.tsx` | 删除 `<nav>` 块；新增 `<ConsumerNav variant="solid" />`；同上去掉 "← 返回详情" |
| `app/group-buy/[id]/progress/page.tsx` | 删除 `<nav>` 块；新增 `<ConsumerNav variant="solid" />`；去掉 inline 的 "分享" 按钮（页内已经有 `gbpActions__share` 等） |
| `app/my/page.tsx` | 删除 `<nav>` 块；新增 `<ConsumerNav variant="solid" />`；inline 的 `mcNavSearch` / `mcNavBell` / `mcNavAvatar` 按钮一并移除（这些是 `/my` 私有元素，原本就和 ConsumerNav 重复） |

### 2.3 CSS

| 文件 | 修改 |
|---|---|
| `app/product-pages.css` | 新增 `.gallerySearchRow` / `.gallerySearch--row` / `.gallerySearchSubmit` 样式（搜索行）；新增 `.galleryIntent` 样式（intent banner） |

### 2.4 工具与文档

| 文件 | 修改 |
|---|---|
| `scripts/screenshot-nav-unified.mjs` | 新增 — 6 页 × 2 viewport 批量截图脚本 |
| `design/nav-unified-report.md` | 本报告 |

未触动：
- `app/products/[id]/page.tsx`（之前就已经在用 ConsumerNav，无需修改）
- 任何 Studio / Admin / 公开 join 页面的 nav

## 3. 每个页面 nav 修改前后对比

| 页面 | 修改前 | 修改后 | 副带变化 |
|---|---|---|---|
| `/`（首页） | 自己写一份 nav，3 个中心链接，scroll-aware 透明背景，右侧有"会员/我的衣橱/设计师入驻" | `<ConsumerNav variant="transparent" />` —— scroll-aware 由组件内部处理 | 移除了页面里多余的 `scrolled` state + scroll listener |
| `/products` | inline nav；中心 3 个链接里 "个性定制" 与 "印花衣橱" 同 href（点击无响应根因）；右侧含搜索框 | ConsumerNav；搜索框迁移到 hero 区下方独立 `gallerySearchRow` section；intent=custom 时显示金色引导 banner | 解决了 `nav-audit.md` 列出的两个根因 |
| `/products/[id]/custom` | 自定义 nav（"印花衣橱 / 我的衣橱" + "← 返回详情"） | ConsumerNav | "← 返回详情" 不再放在 nav 里；用户可通过浏览器返回或 ConsumerNav 的 "印花衣橱" 回到列表 |
| `/group-buy/[id]` | 自定义 nav（同 custom） | ConsumerNav | 同上 |
| `/group-buy/[id]/progress` | 自定义 nav，4 个中心链接（多放了"我的衣橱"），右侧含"分享" | ConsumerNav | "分享" 在页面内 `gbpActions__share` 按钮已有，nav 不重复放 |
| `/my` | 自定义 nav，4 个中心链接 + 右侧 search/bell/avatar 三个按钮 | ConsumerNav；右侧只保留 ConsumerNav 自带的"会员 / 我的衣橱" | search/bell/avatar 三按钮在 IA §2.1 里没规定，移除以与 ConsumerNav 对齐；mcNavSearch/Bell/Avatar 的 CSS 类仍在 my-center.css 中（无引用，但留作日后重新接入侧边栏时复用） |

`/products/[id]` 之前就用 ConsumerNav，本次未动。

## 4. 搜索框新位置说明

### 旧位置（修改前）

`/products` 页面 inline nav 的右侧 `<div class="nav-right">` 内，220px 宽、34px 高的胶囊框，与 "会员"、"我的衣橱" 链接挤在同一行。

### 新位置（修改后）

`/products` 页面独立 `<section class="gallerySearchRow">`，位于 `galleryHero` 之下、`galleryFilters` 之上。布局：

```
.gallerySearchRow
└── .container (max-width 1200px, padding 0 32px)
    └── .gallerySearch.gallerySearch--row
        ├── icon ⌕
        ├── <input type="search" placeholder="搜索设计、风格、面料">
        └── .gallerySearchSubmit "搜索"
```

样式约束（`app/product-pages.css` 新增）：
- 桌面端 `max-width: 720px`，居左排列；高度 44px；左右各 16px padding
- 移动端 `max-width: 100%`；高度 40px；container padding 收到 20px
- 圆角 999px；底色 `var(--surface)`；边框 1px `var(--border)`；focus-within 时金色描边

不顶到屏幕边：通过 `gallerySearchRow .container` 的 `max-width: 1200px + padding 0 32px` 双重约束。

## 5. UX 修复 — 个性定制 banner

### 5.1 ConsumerNav 链接

```ts
const NAV_LINKS = [
  { href: "/products", label: "印花衣橱" },
  { href: "/products?intent=custom", label: "个性定制" }, // ← 改动点
  { href: "/products?sort=hot-group", label: "热拼专区" },
];
```

点击 "个性定制" 后 URL 真正变化（`/products` → `/products?intent=custom`），Next.js 客户端路由触发 effect，页面重新渲染。

### 5.2 isActive() 微调

新 href 与 "印花衣橱" 共享 path `/products`，原 isActive 只看 path，会让两个 nav 同时高亮。新逻辑：

- path 不匹配 → false
- path 匹配但 nav href 没有 query → 立即 true
- path + query 都匹配 `window.location.search` 的 expected query → true，否则 false

**注：** 这是 ConsumerNav 内部的 helper 函数 logic 调整，没有新增 props、没有新增 JSX 结构、没有改导出接口。属于"修 bug 必要的内部小调整"。如果用户认为已超出"不擅自改 ConsumerNav 内部结构"边界，可以撤回 isActive 改动并接受双高亮副作用。

### 5.3 /products hero 引导 banner

```tsx
{intent === "custom" && (
  <div className="galleryIntent" role="status">
    <Badge tone="gold">个性定制</Badge>
    <span>挑一件喜欢的款式 → 进入个性定制流程</span>
  </div>
)}
```

样式：单行内联 banner，金色软底 (`--gold-bg`) + 金色细描边，`Badge tone="gold"` 标签 + 引导文本。
- 不是 modal、不阻塞操作
- 仅 `intent=custom` 时渲染，普通访问 `/products` 看不到
- 桌面端 inline-flex；移动端因 hero 自身 column 布局而自然落到下方

## 6. 12 张截图说明

文件位置：`design/screenshots/nav-unified/`

| # | 路由 | 桌面 1440×900 | 移动 375×800 | 重点观察 |
|---|---|---|---|---|
| 1 | `/` | `desktop/01-home.png` | `mobile/01-home.png` | ConsumerNav 透明态，scroll 后变实底；首屏左侧 hero 文字、右侧大模特图 |
| 2 | `/products` | `desktop/02-products.png` | `mobile/02-products.png` | ConsumerNav 实底，"印花衣橱" 高亮；搜索行独立显示；**未**显示 intent banner |
| 3 | `/products?intent=custom` | `desktop/03-products-intent-custom.png` | `mobile/03-products-intent-custom.png` | ConsumerNav "**个性定制**" 高亮；hero 区 banner "挑一件喜欢的款式 → 进入个性定制流程" 显示；搜索行正常 |
| 4 | `/products/{realId}` | `desktop/04-products-detail.png` | `mobile/04-products-detail.png` | ConsumerNav 实底（与之前相同，本次未改）；底下 PDP 内容 |
| 5 | `/group-buy/{realId}` | `desktop/05-group-buy.png` | `mobile/05-group-buy.png` | ConsumerNav 实底；"参团结算" 标题；订单表单 |
| 6 | `/my` | `desktop/06-my.png` | `mobile/06-my.png` | ConsumerNav 实底（替换原带 search/bell/avatar 的自定义 nav）；账户卡片、统计行、衣橱网格；侧边栏依旧由页面自身渲染 |

`{realId}` = `cmohnsl6q001nw7vs5yxo34kh`（鎏金落日 · 缎面礼服 — 数据库存在的真实设计 id，避免触发 not-found）。

## 7. 验收

| 项 | 状态 |
|---|---|
| 7 个消费者前台页面全部走 ConsumerNav，无 inline nav 残留 | ✅（grep `<nav className="nav"` 验证消费者前台 0 命中） |
| ConsumerNav 内部 JSX 结构、props 接口未改 | ✅（仅 NAV_LINKS 数据 + isActive helper 内部逻辑调整） |
| `/products` 搜索框新位置：hero 下方 / FilterBar 上方 / 桌面 max-width 720 / 移动 100% | ✅ |
| ConsumerNav "个性定制" href = `/products?intent=custom` | ✅ |
| `/products` 读取 `searchParams.intent === "custom"` 显示 banner | ✅ |
| Banner 是 Badge + 单行文本，不是 modal | ✅ |
| 字号 / 字重 / 行距 / 颜色 / 间距未被擅自调整 | ✅ |
| `npx tsc --noEmit` exit 0 | ✅ |
| 12 张截图齐全 | ✅ |
| Studio / Admin / 公开 join 页面的 nav 未触碰 | ✅ |
| IA 文档未改 | ✅ |

## 8. 未做（保留给后续）

- **/my 右上角的 search / bell / avatar 三按钮**：本次按 IA §2.1 移除以与 ConsumerNav 对齐。如果未来要做"消费者通知中心"，会需要扩展 ConsumerNav 或建立独立的 `/my` 子导航 —— 不在本次范围。
- **`/group-buy/[id]/progress` 的 "分享" 按钮**：原放在 nav 里，本次移除。页面内 `gbpActions__share` 已有功能等价的按钮，所以不影响，但视觉位置不同。如果用户希望 nav 仍提供分享入口，需要扩展 ConsumerNav 加 `rightSlot` prop（即原方案 B2）—— 用户已明确不增加 props，所以保留现状。
- **首页 `<a href="#custom">`、`<a href="#hot">` 的锚点导航**：原 inline nav 用过，但 ConsumerNav 没有这两个锚点。考虑到 IA §2.1 没要求锚点跳转，且 ConsumerNav "个性定制" 现在跳到 `/products?intent=custom`，路径更清晰。锚点可以从首页 hero 段下方的 chips/banner 重新引入 —— 不在本次范围。
