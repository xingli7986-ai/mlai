# MaxLuLu AI v1.2 — 越权改动选择性回滚报告

> 日期:2026-05-03
> 触发:用户对 commit `bc5842c` 的越权改动做选择性回滚
> 范围:回滚顶栏 + 作品封面;保留 Hero 布局结构

---

## 1. 回滚的内容

### 1.1 顶栏 ConsumerNav 4 项 → IA v1.2 §1.1 定义

文件:`components/ConsumerNav.tsx`

**回滚前(commit `bc5842c`,越权扩展为以稿为准):**

```tsx
const NAV_LINKS: NavLink[] = [
  { href: "/my-studio", label: "工作室" },
  { href: "/studio", label: "设计师" },
  { href: "/inspiration", label: "趋势" },
  { href: "/studio/join", label: "定价" },
];
// + 越权决策的注释段(已删除)
```

**回滚后(IA v1.2 §1.1):**

```tsx
// IA v1.2 §1.1 — 顶栏 4 项,顺序 + 文字以 IA 文档为准。
// /my-studio 在批次 2 上线前为 404,但 IA 已定义,导航项保留。
const NAV_LINKS: NavLink[] = [
  { href: "/products", label: "印花衣橱" },
  { href: "/inspiration", label: "灵感广场" },
  { href: "/my-studio", label: "我的设计工作室" },
  { href: "/products?sort=hot-group", label: "热拼专区" },
];
```

`isActive(href)` 的 path + query 区分逻辑保留不动。

### 1.2 作品封面 SAMPLE_COVERS → R2 占位 URL

文件:`scripts/seed-inspiration.ts`

**回滚前:**

```ts
const SAMPLE_COVERS = [
  "/assets/images/home/02-featured-designs/dresses-summer/01-ink-garden-knit-wrap-dress.png",
  "/assets/images/home/02-featured-designs/dresses-summer/02-camellia-ink-v-neck-dress.png",
  // ... 12 张本地 AI 生成图(原本是首页占位素材,被错误挪用为"创作者作品")
];
```

**回滚后:**

```ts
// 占位 URL — 不要把 public/assets/images/home/ 的图当作品封面用,那是首页占位图,
// 不是创作者作品。等 GPT(或真实创作者)提供作品图后再替换。
// 当前 URL 在测试环境不可达,前端 <img> 走 onError 路径,呈现纯色 / 渐变占位。
const SAMPLE_COVERS = [
  "https://maxlulu-assets.r2.dev/inspiration/work-01.jpg",
  "https://maxlulu-assets.r2.dev/inspiration/work-02.jpg",
  "https://maxlulu-assets.r2.dev/inspiration/work-03.jpg",
  "https://maxlulu-assets.r2.dev/inspiration/work-04.jpg",
  "https://maxlulu-assets.r2.dev/inspiration/work-05.jpg",
  "https://maxlulu-assets.r2.dev/inspiration/work-06.jpg",
  "https://maxlulu-assets.r2.dev/inspiration/work-07.jpg",
  "https://maxlulu-assets.r2.dev/inspiration/work-08.jpg",
];
```

---

## 2. 保留的内容

### 2.1 Hero 区 480px 布局

文件:`app/inspiration/inspiration.css` + `app/inspiration/page.tsx`

**保留**(commit `bc5842c` 中正确部分):

- `.inspHero` 480px 高(移动 380px) — 与稿 01 一致
- `.inspHero__overlay` 米色渐变蒙版 — 文字可读性
- `.inspHero__inner` grid 布局(左 copy + 右 stats) — 桌面;移动堆叠
- `.inspHero__stats` 半透明浮层(瓷青 Playfair 数字)
- 移动端断点(`@media (max-width: 767px)`)
- CTA href = `/my-studio`(批次 2 上线即生效,IA v1.2 已定)

### 2.2 Hero 背景图 — 改为占位

文件:`app/inspiration/inspiration.css` + `app/inspiration/page.tsx`

**改:**

- `.inspHero__bg` 内的 `<img>` 删除 → 改为空 div
- 加 `.inspHero__bg--placeholder` CSS 类:瓷青 + 烟粉对角渐变占位
- JSX 注释:`{/* 等待 GPT 提供 hero banner 图 — 当前用 CSS 渐变占位,布局保留 480px */}`

```css
.inspHero__bg--placeholder {
  background:
    radial-gradient(ellipse at 78% 50%, rgba(186, 94, 112, 0.22) 0%, transparent 55%),
    radial-gradient(ellipse at 30% 80%, rgba(47, 90, 93, 0.16) 0%, transparent 55%),
    linear-gradient(135deg, var(--color-bg) 0%, var(--color-subtle) 100%);
}
```

---

## 3. 数据库写入回滚情况

### 3.1 操作

跑 `npx tsx scripts/seed-inspiration.ts` 一次,upsert 模式按 title 匹配,14 条 `InspirationWork` 行被覆盖:

| 字段 | 旧值(`bc5842c` 写入) | 新值(本次回滚) |
|---|---|---|
| `coverImage` | `/assets/images/home/...png` | `https://maxlulu-assets.r2.dev/inspiration/work-XX.jpg` |
| `images[]` | `[localPath, localPath]` | `[r2Url, r2Url]` |

### 3.2 验证

```
npx tsx -e "...inspirationWork.findMany({...})"
→ {
  "title": "墨韵山茶 · 灵感线稿",
  "coverImage": "https://maxlulu-assets.r2.dev/inspiration/work-01.jpg"
},
{
  "title": "海风蓝调 · 几何瓷青",
  "coverImage": "https://maxlulu-assets.r2.dev/inspiration/work-02.jpg"
},
...
```

Neon Postgres 已写回占位 URL。其他字段(title / description / prompt / params / promptVisibility / unlockPrice / styleTags / 计数)未动。

### 3.3 副作用范围

- 14 条 `InspirationWork` `coverImage` 和 `images[]` 字段
- 不影响 Designer / User / 其他表
- 不影响 Like / Favorite / Comment / PromptUnlock 关联记录

---

## 4. 当前 /inspiration 页面视觉差异清单

### 4.1 已正常(可上线)

- ✅ 顶栏 4 项:印花衣橱 / 灵感广场 / 我的设计工作室 / 热拼专区(IA v1.2)
- ✅ 灵感广场 active 高亮(瓷青下划线)
- ✅ /products 顶栏 active 高亮"印花衣橱"恢复
- ✅ Hero 区 480px 高度保留,布局正常
- ✅ Hero 文字层(eyebrow + H1 + lead + CTA)正常
- ✅ Hero 右侧 stats 浮层正常(14 / 6 / 14 瓷青 Playfair)
- ✅ 工具筛选 / 排序 / prompt 筛选 tabs
- ✅ 4 列 / 3 列 / 2 列响应式 MasonryGrid
- ✅ Reine / Luna 卡片金描边 + "认证"角标(`.is-certified-card`)
- ✅ 卡片底 AuthorSignature 显示"by [名字]" + 认证 chip
- ✅ 右侧 sticky 边栏(印花风格 + 解锁价格 + Join promo)

### 4.2 等待 GPT(或真实创作者)提供素材

| 元素 | 当前状态 | 等什么 |
|---|---|---|
| Hero 背景图 | 瓷青 + 烟粉 CSS 渐变占位 | GPT 提供 hero banner 图(对照 01 稿 480px 模特大图区,1440 宽) |
| 14 条 InspirationWork 卡片图 | tone-* 渐变占位(`.inspCard__placeholder`) | 真实创作者作品图,或批次 2 上线后通过 `/my-studio/share` 生成 |
| /inspiration/[id] 主图 | 同上(R2 URL 不可达 fallback) | 同上 |
| 评论区认证小金章 | 工具类已就位,无评论数据呈现不出来 | 评论组件接 isCertified(批次 2 一起做) |

### 4.3 跟稿 01 对比的具体差异(肉眼)

| 模块 | 稿 01 | 当前实现 | 差异类型 |
|---|---|---|---|
| Hero 模特大图 | 真实模特穿印花裙的高保真大图 | CSS 渐变占位 | T3(数据,等 GPT) |
| 卡片图 | 真实模特穿印花裙 | tone-* 单色渐变 | T3(数据,等 GPT) |
| 卡片署名小金章 | 名字旁圆形小金章 14px | 当前用 chip 文字"认证"(在 `.is-certified-chip`) | T1(细节,可调) |
| 顶栏右上 + 关注 / 搜索 | 稿 01 显示搜索图标 | 当前 `nav-right` 只有 会员 / 我的衣橱 | T2(布局,本轮不在范围) |

T1 / T2 类差异等用户决策再处理。T3 类等素材到位。

---

## 5. 后续可执行的事项(等用户指令)

1. GPT 提供 Hero banner 图 → 替换 `.inspHero__bg--placeholder` 为 `<img>`
2. GPT 提供 14 张作品图 → 替换 `SAMPLE_COVERS` 为新路径,重跑 `seed-inspiration.ts`
3. IA v1.3 / Sitemap v1.3 是否需要把"工作室 / 设计师 / 趋势 / 定价"作为新顶栏方案固化下来(冲突解决方向之一)
4. 卡片署名"认证"chip 是否要换成真版 99 md §2.3 的"圆形小金章 14px"

---

## 6. 验证

- ✅ `npx tsc --noEmit` exit 0
- ✅ `npx tsx scripts/seed-inspiration.ts` 14 条 updated
- ✅ Prisma 查询确认 coverImage 已写回 R2 占位
- ✅ Playwright 截图(`design/screenshots/v2-rollback/`)
  - `inspiration_desktop.png`:顶栏 4 项 IA v1.2 + Hero 渐变占位 + 卡片占位 + 灵感广场 active
  - `products_desktop.png`:顶栏同上 + 印花衣橱 active 恢复正常
- ✅ 业务逻辑 / 支付 / 订单 / 认证逻辑 / 路由 未动
- ✅ 设计师 / 用户字段未动
- ✅ batch 1 的 Schema / API / 5 组件 未动
