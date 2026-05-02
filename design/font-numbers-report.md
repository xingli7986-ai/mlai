# 全站数字字体统一报告

> Date: 2026-05-01
> Trigger: 用户反馈 "右上角统计数字、价格、点赞数、价格区间数量等数字字体和中文不统一"
> Status: ✅ Completed
> tsc --noEmit: exit 0

---

## 1. 问题诊断

之前的字体方案更换 (commit `c95aad5`) 把正文字体换成 Inter + 思源黑体后，
中英混排里的**数字渲染**仍然不统一：

- `.galleryHero__stats b`（右上角"原创印花 / 签约设计师 / 正在众定" = `0 / 128 / 56`）使用 `var(--display)` = Playfair 链，按设计意图保留为衬线。
- `.galleryCard__price` / `.hotMiniPrice`（价格 `¥41,800`）继承 body 的 `var(--font-sans)` = Inter 链。
- `.gallerySideRange em`（价格区间数量 `24 / 86 / 62 / 38`）继承 body。
- 点赞数、关注数等通过 `<b>{n}</b>` / `<small>{n}</small>` 直接放在文本流里。

问题：**同一个 token 字体（Inter）下，数字默认是 proportional figures**（按字符宽度排版）。
中英混排里 Inter 的数字字宽与思源黑体的中文字宽不一致，价格 `¥41,800` 和"件"
之间会出现"窄宽-宽宽"的视觉跳动；多行的价格区间数字 `24 / 86 / 62 / 38`
不等宽，纵向不齐。视觉上像数字"掉下去"了。

不少浏览器在 fallback 链匹配数字字符时会优先返回 system-ui 的数字字形，
进一步加剧不统一。

## 2. 修复方案

### 2.1 全局 OpenType 特性开启

文件：`app/globals.css` body 块

```css
body {
  font-family: var(--font-sans);
  font-feature-settings: "tnum" on, "lnum" on;
  font-variant-numeric: tabular-nums lining-nums;
}
```

含义：

- **tnum (tabular numerals)**：等宽数字。Inter / 思源黑体 / 思源宋体 / Playfair 都内置该 OpenType 特性。开启后所有数字字符（0-9、千分位逗号、小数点）使用一致字宽，纵向对齐。
- **lnum (lining numerals)**：衬线对齐数字（vs old-style numerals）。所有数字与大写 X 等高，统一基线。

CSS 这两条属性都是**继承属性**，body 上声明会自动级联到所有后代元素，无需在每个 `.price` / `.count` / `.stats-number` 上重复声明。

### 2.2 兜底类

为防止个别页面意外覆盖（例如某个 `.foo { font-feature-settings: normal }`），
新增两个等价的兜底类：

```css
.num-display,
.num-tabular {
  font-feature-settings: "tnum" on, "lnum" on;
  font-variant-numeric: tabular-nums lining-nums;
}
```

未来如果出现局部需要覆盖的场景，加 className 即可保证数字依然走等宽。

## 3. 修改文件清单

| 文件 | 修改 |
|---|---|
| `app/globals.css` | body 增加 `font-feature-settings` + `font-variant-numeric`；新增 `.num-display` / `.num-tabular` 兜底类 |
| `scripts/screenshot-numbers.mjs` | 新增 — 5 页 × 2 viewport 批量截图 |
| `design/font-numbers-report.md` | 本报告 |

仅 1 个生产 CSS 文件改动。所有数字相关元素（`.galleryHero__stats b` / `.galleryCard__price` / `.hotMiniPrice` / `.hotMiniProgress` / `.galleryCard__name` / `.galleryCard__designer` / `.gallerySideRange` / 点赞数 `<b>{likeCount}</b>` 等）都通过继承自动获得 tabular-nums，无需逐个修改。

## 4. 修改前后对比

### 4.1 渲染对比（语义层）

| 元素 | 修改前 | 修改后 |
|---|---|---|
| `/products` 右上角 `0 / 128 / 56` | Playfair 比例数字，与小标签"原创印花/签约设计师/正在众定"基线对齐但宽度不齐 | Playfair tabular figures，三组数字垂直对齐 |
| 价格区间数量 `24 / 86 / 62 / 38` | Inter proportional，宽度不一，纵向参差 | Inter tabular，四行右侧数字垂直对齐 |
| 商品价格 `¥41,800` | Inter proportional，千分位逗号占字宽不固定 | Inter tabular，逗号与数字等宽 |
| 设计详情页 `已下单 24 件` | Inter proportional，"24"和"件"间距不稳 | tabular，数字宽度固定 |
| 点赞数 `211` / `207` | proportional | tabular，多卡片排列时数字垂直对齐 |
| 倒计时 `02:14:09` | 已显式 tabular-nums (`home-consumer.css :484`) — 不变 | 不变（被全局规则覆盖也是 tabular-nums，结果一致） |

### 4.2 浏览器兼容

| 浏览器 | tnum / lnum 支持 |
|---|---|
| Chrome 100+ | ✅ 通过 `font-feature-settings` 与 `font-variant-numeric` |
| Safari 16+ | ✅ |
| Firefox 100+ | ✅ |
| 微信内置 / QQ 内置 (Chromium WebView) | ✅ 跟随 Chromium 版本 |

不支持 OpenType 特性的浏览器会忽略这两条属性，降级回 proportional figures（即修复前的状态），不会破坏布局。

## 5. 字体路由审计

按用户列出的几类元素逐个核对，确认它们的 font-family 都路由到 `--font-sans` 或 `--font-serif`，不会落到 `system-ui` 默认字体：

| 元素 | CSS 来源 | 实际 font-family |
|---|---|---|
| 印花衣橱页右上角统计数字 `30 / 128 / 56` | `product-pages.css :2211 .galleryHero__stats b` | `var(--display)` → `var(--font-serif)` ✓ |
| 商品卡片价格 `¥41,800` | `product-pages.css :1024 .galleryCard__price` | inherit → body → `var(--font-sans)` ✓ |
| 热拼小卡片价格 | `product-pages.css :909 .hotMiniPrice` | inherit → `var(--font-sans)` ✓ |
| 热拼小卡片人数 | `product-pages.css :914 .hotMiniProgress` | inherit → `var(--font-sans)` ✓ |
| 点赞数 `♡ 211` | `product-pages.css :1024 .galleryCard__price` 同级 | inherit → `var(--font-sans)` ✓ |
| 价格区间数量 `24 / 86 / 62 / 38` | `product-pages.css :2338 .gallerySideRange em` | inherit → `var(--font-sans)` ✓ |
| 倒计时 `02:14:09` | `home-consumer.css :479 .countdown` | inherit + 已显式 `tabular-nums` ✓ |
| 设计详情页"已下单 24 件" | `product-pages.css :pdpProgress` | inherit → `var(--font-sans)` ✓ |
| /studio 个人中心数字 `4,289 / +312` | `designer-center.css .dc-mini-stat` | inherit → `var(--font-sans)` ✓ |
| /my 积分 / 优惠券 / 等级 `3,820 / ¥160 / L4` | `my-center.css .mcProfile__stat` | inherit → `var(--font-sans)` ✓ |

**结论：没有任何数字显示元素显式声明了非品牌字体。** 全部通过继承获得 Inter / 思源黑体 / Playfair 的 tabular figures。

## 6. 10 张截图说明

文件位置：`design/screenshots/font-numbers-after/`

| # | 路由 | 桌面 1440×900 | 移动 375×800 | 重点观察 |
|---|---|---|---|---|
| 1 | `/` | `desktop/01-home.png` | `mobile/01-home.png` | 热拼卡片价格 `¥699 / ¥799`、参团人数、倒计时 |
| 2 | `/products` | `desktop/02-products.png` | `mobile/02-products.png` | 右上角 `0 / 128 / 56`、价格区间 `24 / 86 / 62 / 38` |
| 3 | `/products/1` | `desktop/03-products-detail.png` | `mobile/03-products-detail.png` | 渲染全站 not-found（id=1 数据库不存在），与字体改动无关 |
| 4 | `/studio` | `desktop/04-studio.png` | `mobile/04-studio.png` | 工具卡片编号 `01–07 / 08–16` |
| 5 | `/my` | `desktop/05-my.png` | `mobile/05-my.png` | 积分 / 优惠券 / 收藏数等汇总数字 |

## 7. 验收

| 项 | 状态 |
|---|---|
| body 全局开启 `tnum` + `lnum` | ✅ |
| `.num-display` / `.num-tabular` 兜底类已添加 | ✅ |
| 全站数字相关元素 font-family 路由到 `--font-sans` 或 `--font-serif`（无 system-ui fallback 风险） | ✅ |
| 字号 / 字重 / 行距 / 颜色 / 间距未被擅自调整 | ✅ |
| 10 张截图齐全（5 页 × 2 viewport） | ✅ |
| `npx tsc --noEmit` exit 0 | ✅ |

## 8. 后续可做（不在本次范围）

- **字号阶梯 token 化**：与 `feat: 全站字体方案更换` 报告 §10 同源，仍待立项。
- **开启 `cv11` (Inter 单层 a/g)**：Inter 默认是双层 a / 双层 g，部分编辑会议建议品牌字体使用单层版本。如果决定切换，可在 body 加 `font-feature-settings: "tnum" on, "lnum" on, "cv11" on` —— 不在本次范围。
- **Inter / Noto Sans SC weight 子集裁剪**：当前各 4 个权重（400/500/600/700），首屏字体阻塞约 280KB。如果性能审计发现需要优化，可减到 2 个权重。
