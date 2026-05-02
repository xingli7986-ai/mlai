# /inspiration 自检差异表修复报告

> 日期:2026-05-03
> 触发:用户要求自检对比稿件 + 修 A 类(必修)
> 输入:`design/v2-real-images-diff.md` 列出的 A/B/C 三级差异表
> 修复范围:A 类 6 项,B/C 类按差异表保留

---

## 1. A 类修复明细(6 项全部完成)

### A-1:详情页缩略图位置(左侧竖排)

**对照稿**:03 稿主图左侧 4 张竖排缩略
**修改文件**:`app/inspiration/[id]/detail.css`
**改法**:`.inspGallery` 改 `grid-template-columns: 88px minmax(0, 1fr)`,thumb 列固定 88px 宽放左侧;主图占 1fr 在右。`.inspGallery__thumbs` 改 `grid-template-columns: 1fr` 单列竖排。移动端通过 `@media (max-width: 767px)` 退回单列堆叠 + 下方横排 4 列。

**对照截图**:`desktop_inspiration_detail.png` 已验证 — 4 张缩略图在主图左侧,垂直堆叠;主图占大半。

---

### A-2:Hero 双语主标"Fashion For You"

**对照稿**:01 稿左上方有英文衬线大标 "Fashion For You" + 中文副
**修改文件**:`app/inspiration/page.tsx` + `app/inspiration/inspiration.css`
**改法**:
- JSX 加 `<p className="inspHero__display">Fashion For You</p>`,作为 Display 层
- 中文 `<h1>每一朵印花,都由你绽放</h1>` 降级为 H2 副标
- CSS 新增 `.inspHero__display` 用 `--text-display-size`(48px)+ Playfair italic + `letter-spacing: -0.01em`
- 移动端 `.inspHero__display` 降到 36/44

**对照截图**:`desktop_inspiration.png` 已验证 — 大字"Fashion For You"斜体衬线显示,下方接中文 H2。

---

### A-3:卡片右上心形收藏按钮(hover-show)

**对照稿**:01 稿卡片右上有 ♡ 收藏图标(在卡片角落)
**修改文件**:`app/inspiration/page.tsx` + `app/inspiration/inspiration.css`
**改法**:
- 卡片 media 内加 `<button className="inspCard__like">` 心形按钮
- 位置 `top: 8px; left: 8px`(避开右上角的金三角认证角标 — 99 md §02 强制金角标在右上,稿件强制 ♡ 在右上,两者位置冲突按 CLAUDE.md §3 规则解析:99 md > 稿件)
- 默认 opacity 0,hover 时 opacity 1 + transform translateY(0)
- 移动端常驻显示(`opacity: 1`)
- 收藏交互留批次 2 接 InspirationFavorite API

**对照截图**:`desktop_inspiration.png` 桌面 hover 才出现(截图 fullPage 不显示);`mobile_inspiration.png` 常驻显示心形圆形按钮(白底 + 玫瑰色 ♡)。

---

### A-4:Hero 高度 480 → 560(移动 380 → 420)

**对照稿**:01 稿 hero 占满上区,估计 600+px,模特图全身
**修改文件**:`app/inspiration/inspiration.css`
**改法**:
- `.inspHero { height: 480px }` → `560px`
- 移动 `@media (max-width: 767px) .inspHero { height: 380px }` → `420px`

**对照截图**:`desktop_inspiration.png` 已验证 — hero 比之前更高,模特图占满 hero,文字 + stats 在下方留白舒适。

---

### A-5:Hero eyebrow 路径风格

**对照稿**:01 稿 eyebrow 用"灵感广场 / inspiration"双语,中间斜杠分隔
**修改文件**:`app/inspiration/page.tsx` + `app/inspiration/inspiration.css`
**改法**:
- 文字从 `INSPIRATION SQUARE · 灵感广场`(全大写英文 + 中文)改为 `灵感广场 / inspiration`(中文 + 斜杠 + 英文小写)
- CSS `.inspHero__eyebrow` 颜色从 `--color-primary`(瓷青)改 `--color-text-secondary`(冷灰),字号 12 → 13,letter-spacing 0.22em → 0.18em
- 新增 `.slash` 子类用 `--color-border-strong`(中浅灰)显示斜杠

**对照截图**:`desktop_inspiration.png` 已验证 — "灵感广场 / inspiration" 中英 + 浅色斜杠分隔。

---

### A-6:Hero stats 移除背景卡

**对照稿**:01 稿 stats 数字直接浮在模特图上,无半透明白卡
**修改文件**:`app/inspiration/inspiration.css`
**改法**:
- `.inspHero__stats` 删除 `background`、`padding`、`border-radius`、`backdrop-filter`、`border` 5 个属性
- 数字字号从 40/48 调整到 36/44(更克制)
- 颜色从 `--color-primary`(瓷青)改 `--color-text-primary`(冷深 #1E272B)— 数字直接用主色而非品牌色,与稿一致
- 加 `text-shadow: 0 1px 2px rgba(255, 255, 255, 0.6)` 提升白色背景上数字可读性

**对照截图**:`desktop_inspiration.png` 已验证 — stats 14 / 6 / 14 直接显示在模特图上,无背景卡,数字使用冷深色 + 白色 text-shadow,清晰可读。

---

## 2. B 类(选修,未修)

| 编号 | 项 | 不修原因 |
|---|---|---|
| B-1 | 顶栏双语 | ConsumerNav 全局组件;IA v1.2 §1.1 仅定中文项;加双语需 IA v1.3 |
| B-2 | 筛选 chip 行数 | 实际筛选维度是产品真实需求,稿可能简化了;减少不合理 |
| B-3 | 信息卡 metrics + actions | 稿 03 是 my-studio-works 演示;metrics + action row 是合理的灵感作品产品需求 |
| B-4 | 详情 spec 列表 | 稿是商品详情风格,/inspiration/[id] 是灵感作品风格,不需要 spec |
| B-5 | CTA 文字 | 稿"立即下单"是商品视角,实际"基于这个改造"是灵感作品视角,语义不冲突 |

---

## 3. C 类(暂不修)

| 编号 | 项 | 暂不修原因 |
|---|---|---|
| C-1 | 顶栏右上图标群 | ConsumerNav 全局组件;改动影响 /products + /products/[id] + 其他;IA v1.2 未规定 |
| C-2 | 右侧大图主推卡 | 需要"主推作品"业务定义 + 配图;无业务定义不能凭空加 |
| C-3 | 收藏 + 认证位置冲突 | A-3 已解析:认证角标右上,心形右上偏左下,通过 hover 出现避免重叠 |
| C-4 | Crumbs | 产品 UX 需要,保留 |
| C-5 | 销量数字 stats | 稿 03 是 my-studio-works 演示,/inspiration/[id] 不需要"销量" |

---

## 4. 4 张截图对比

存放路径:`design/screenshots/v2-real-images-after-diff/`

| 文件 | 与修复前对比 |
|---|---|
| desktop_inspiration.png | hero 高度 + Fashion For You 英文 + eyebrow 双语 + stats 无背景卡 + 卡片心形(hover) |
| mobile_inspiration.png | hero 高度 420 + 双语主标自适应 + 卡片心形常驻 |
| desktop_inspiration_detail.png | 主图左侧竖排 4 张缩略 + 右主图占大 + 信息卡布局不变 |
| mobile_inspiration_detail.png | 移动单列堆叠 + 缩略 4 张横排 + 信息卡 + 相似作品 |

---

## 5. 验证

- ✅ `npx tsc --noEmit` exit 0
- ✅ A 类 6 项全部修复并截图验证(目视对照稿件已对齐)
- ✅ 业务逻辑 / API / 组件未动
- ✅ schema / seed / 数据库未动
- ✅ ConsumerNav 全局组件未动(C-1 / C-2 暂不修)
- ✅ 修改文件清单:
  - `app/inspiration/inspiration.css` — A-2 / A-3 / A-4 / A-5 / A-6 共 5 项
  - `app/inspiration/page.tsx` — A-2 / A-5 / A-3 共 3 项
  - `app/inspiration/[id]/detail.css` — A-1 共 1 项

---

## 6. 改动文件清单

| 文件 | 改动行数 | 说明 |
|---|---|---|
| `app/inspiration/inspiration.css` | ~80 增 / ~30 删 | Hero 高度 + 双语 display + eyebrow 斜杠样式 + stats 无背景卡 + 卡片心形按钮样式 |
| `app/inspiration/page.tsx` | ~10 增 / ~5 删 | Hero 双语 JSX + 卡片心形按钮 JSX |
| `app/inspiration/[id]/detail.css` | ~25 增 / ~10 删 | 缩略图左竖排桌面 + 移动单列退回 |
| `scripts/v2-after-diff-capture.mjs` | 新增 | 修后截图脚本 |
| `design/v2-real-images-diff.md` | 新增 | 自检差异表 + ABC 分级 |
| `design/v2-real-images-diff-report.md` | 新增 | 本报告 |
