# MaxLuLu AI v2 真版规范校对 + 认证设计师视觉数据落地报告

> 日期:2026-05-02 | 第 2 轮(基于真版 99_开发注意事项汇总.md 1118 行)

---

## 1. Token 差异修订清单

完整逐条 diff 见 [`v2-tokens-revision.md`](./v2-tokens-revision.md)。本节是 TL;DR。

### 1.1 主配色完全切换

| 维度 | 旧(第 1 轮,空 md 退化) | 真 md(本轮) |
|---|---|---|
| 品牌主色 | 暖金 #B38A56 | **瓷青蓝 #2F5A5D** |
| 主 CTA | 暖金 #B38A56 | **烟粉玫瑰 #BA5E70** |
| 金色定位 | 品牌主色 | **仅认证设计师身份系统** |
| 页面底色 | 暖米 #F6F1E8 | **冷灰青 #F3F6F6** |
| 文字主色 | 暖深 #1E1B18 | **冷深 #1E272B** |

> 真 md §1.1 原话:**"不使用大面积金色和米色;金色仅用于「认证设计师」身份系统,不作为品牌主色"**。

### 1.2 颜色 token 修订(共 30+ 条)

完整表见 [`v2-tokens-revision.md`](./v2-tokens-revision.md) §二。涵盖:Primary 全套、Accent 全套(新增)、Certified Gold 全套(从 designer-gold 迁移)、Bg/Surface 4 阶、Text 5 阶、Border/Divider 4 阶、Functional 4 阶、9 阶冷色中性灰。

### 1.3 字号体系整体下移一阶

| 旧 H1 | `56/64/700` | 真 md H1 | `40/48/400` |
| 旧 H2 | `36/44/600` | 真 md H2 | `28/36/400` |
| 旧 H3 | `24/32/600` | 真 md H3 | `20/28/500 Medium` |
| 旧 Body | `16/28/400` | 真 md Body | `14/22/400` |
| H4 | 移除(真 md 无该层) |
| Body Large | 移除(真 md 无更大正文阶) |
| Price(新引入) | — | `22/28 Playfair Regular` |
| Price Small(新引入) | — | `16/24 Playfair Regular` |

### 1.4 圆角降阶

| 旧 XL | `20px` | 真 md XL | `16px` |
| 旧 2XL | `24px` | 真 md 无该层(别名 → 16px) |

### 1.5 阴影换冷色

新阴影 token:`shadow-xs/sm/md/lg`(rgba 17,25,29 冷色阶 vs 旧 24,21,18 暖色阶)。
新增 `--shadow-certified: 0 2px 6px rgba(200,168,117,0.24)`(真 md §2.1 认证徽章专属)。

### 1.6 间距 / 断点

- 新增 `--space-7: 28px`(真 md §5.1)
- 断点修订:tablet 上限 1199(旧 1023);desktop 起 1200(旧 1024);desktop-xl 1440 一致

---

## 2. 代码改动文件清单

| 文件 | 改动 |
|---|---|
| `app/globals.css` | :root 整体覆盖到真 md 配色;认证工具类按真 md §2 重写(角标 12/16,头像金圈,评论金章,chip "认证设计师") |
| `app/home-consumer.css` | legacy `--gold/--text/--bg/...` 别名值切换到冷色配色,`--gold` 实际指 Porcelain Cyan |
| `app/product-pages.css` | 末尾 v1.2 节重写:H1 40/48,卡片 4:5,价格 16/24 Playfair,搜索按钮 + 主 CTA 改 Smoked Rose,认证卡圆角降到 12px |
| `prisma/schema.prisma` | `Designer.isCertified Boolean @default(false)` |
| `scripts/seed-designs.ts` | 4 设计师 specs 加 `isCertified` 字段;upsert 同步 |
| `app/api/designs/route.ts` | 列表查询 select + 返回 `designer.isCertified` |
| `app/api/designs/[id]/route.ts` | 详情查询 select + 返回 `designer.isCertified` |
| `design/v2-tokens-extracted.md` | 全文重写(以真 md 为准) |
| `design/v2-tokens-revision.md` | 新增,差异修订报告 |
| `scripts/v2-certified-capture.mjs` | 新增,6 张截图捕获脚本 |

`/products/page.tsx` 与 `/products/[id]/page.tsx` 已在第 1 轮接入 `is-certified-card` / `is-certified-chip` 工具类;本轮无需再改前端逻辑,只是数据通了视觉就亮了。

---

## 3. 数据库 Schema 变更

```prisma
model Designer {
  // ... 原字段保留不动 ...
  isCertified     Boolean  @default(false)  // 新增
}
```

迁移命令:`npx prisma db push`(已执行,exit 0,Neon Postgres 同步完成)。

种子结果(`npx tsx scripts/seed-designs.ts` 后查询验证):

| 设计师 | isCertified |
|---|---|
| Luna · MaxLuLu Studio | ✅ true |
| Yuki · Yuki Atelier | ❌ false |
| Reine · Atelier Reine | ✅ true |
| Mei · Mei Botanical | ❌ false |

> **未动**:其他字段(name / bio / avatar / displayName)逐字保留。

API 验证(/api/designs?limit=24 返回示例):

```json
"designer": {
  "name": "Reine · Atelier Reine",
  "avatar": "https://maxlulu-assets.r2.dev/designers/reine.png",
  "isCertified": true
}
```

---

## 4. 6 张截图 + 与稿件差异对比

存放路径:`design/screenshots/v2-certified-applied/`

实际截图选取的 ID(动态从 API 选第一个匹配项):
- 认证作品:`鸢尾蓝 · 法式中袖`(Reine · Atelier Reine)
- 普通作品:`鎏金落日 · 缎面礼服`(Mei · Mei Botanical)

| 文件 | 视口 | 对照稿 |
|---|---|---|
| desktop_products.png | 1440×900 | 02 桌面区 |
| mobile_products.png | 375×800 | 02 移动区 |
| desktop_pdp_certified.png | 1440×900 | 06 桌面区(认证) |
| mobile_pdp_certified.png | 375×800 | 06 移动区(认证) |
| desktop_pdp_normal.png | 1440×900 | 06 桌面区(对照) |
| mobile_pdp_normal.png | 375×800 | 06 移动区(对照) |

### 4.1 配色对照(肉眼)

| 元素 | 真稿(02 / 06) | 实际渲染 | 一致 |
|---|---|---|---|
| 页面底色 | 冷灰青 | #F3F6F6 冷灰青 | ✅ |
| 顶栏导航 active | 瓷青 | --gold (=#2F5A5D 瓷青) | ✅ |
| Hero 数据数字 | 瓷青衬线 | --gold 瓷青 Playfair | ✅ |
| 搜索 / 主 CTA 按钮 | 烟粉玫瑰 | #BA5E70 Smoked Rose | ✅ |
| 卡片描边普通 | #D2DEDF 浅灰青 | --border #D2DEDF | ✅ |
| 文字主色 | 冷深 | #1E272B | ✅ |
| 商品图比例 | 4:5 | 4:5 | ✅ |

### 4.2 认证视觉对照

| 元素 | 真稿(02 / 06) | 实际渲染 | 一致 |
|---|---|---|---|
| /products Reine/Luna 卡片描边 | 1.5px 金 #C8A875 | 1.5px #C8A875 | ✅ |
| /products Reine/Luna 角标 | 金底白字"认证"右上角 | 角标 24h padding 0 8 #C8A875 文字 12/16 #FFF | ✅ |
| /products Yuki/Mei 卡片 | 无特殊视觉 | 1px #D2DEDF 默认描边 | ✅ |
| Hot Group Buys mini 卡 | 同样按 isCertified 应用 | Reine 在 hot strip 里也带角标 | ✅ |
| /products/[id] Reine 作者卡 | 1px 金描边 | `.pdpDesigner.is-certified { border: 1px solid #C8A875 }` | ✅ |
| /products/[id] Reine 作者标签 | "认证设计师" | small 文字切到"认证设计师" + 金色 | ✅ |
| /products/[id] Reine 名字旁 chip | 金底白字"认证" 高 20 圆角 999 | `.is-certified-chip { bg #C8A875; color #FFF }` | ✅ |
| /products/[id] Mei 作者卡(对照) | 默认 #D2DEDF 描边 | 默认 | ✅ |
| /products/[id] Mei 作者标签(对照) | "设计师" | small 文字"设计师" | ✅ |

### 4.3 移动端对照(真 md §2.6 移动认证角标不可隐藏)

| 元素 | 真稿(02 / 06 移动) | 实际渲染 | 一致 |
|---|---|---|---|
| Reine 卡角标 | 仍可见 | 高 22 padding 0 6 font 11/14 — 可见 | ✅ |
| 主网格列数 | 2 列 | 2 列 | ✅ |
| 详情页堆叠 | 图上信息下 | 图在上,信息在下 | ✅ |
| 移动认证作者卡 | 金描边保留 | `.pdpDesigner.is-certified` 移动同样应用 | ✅ |

### 4.4 已知数据缺口(非违规)

- 商品图大多为线性渐变占位:种子 `coverImages` 指向 R2 URL,环境无法外网拉取时回退到 tone-* 渐变。属数据问题,不是设计问题。
- 评论区目前无认证评论数据,因此 `is-certified-avatar--comment::after` 小金章 12×12 工具类已就位,但视觉无法在截图中验证(需要用户在评论区有认证设计师评论时才呈现)。

---

## 5. 待用户决策

| 项 | 暂定方案 | 待用户回复 |
|---|---|---|
| `--gold` 变量名实指瓷青(冷色)且全站引用 | 保留命名,值替换;命名重构留给后续 cleanup PR | 是否同意?或需要立刻批量 rename 为 `--color-primary` |
| 认证 chip 文字 | 卡片角标用"认证";详情页名字旁 chip 用"认证";详情页"设计师" small 标签用"认证设计师" | 是否需要在卡片角标也用"认证设计师"全文? |
| 评论区认证小金章 | 工具类 `.is-certified-avatar--comment` 已就位,等评论组件接入 | 评论组件什么时候接 isCertified? |
| 商品图 4:5 | 已切到 4:5 | 是否需要重新生成种子封面以更接近真稿? |
| `Button` 组件主样式 | 当前使用 `var(--gold)`(=瓷青);真 md Primary 应是 Smoked Rose | `Button` UI 组件 variant=primary 是否需要切到 Accent rose? |
| `--radius-2xl` 别名指向 16px | 真 md 无 24px 圆角层 | 是否同意?或需要保留 24px 给某些元素? |

---

## 6. 验证

- ✅ `npx prisma db push` exit 0(Neon Postgres 同步完成)
- ✅ `npx tsx scripts/seed-designs.ts` 设计师 isCertified 落地
- ✅ `/api/designs` + `/api/designs/[id]` 返回 isCertified
- ✅ `npx tsc --noEmit` exit 0
- ✅ 6 张截图全部捕获,认证设计师视觉肉眼可见
- ✅ 业务逻辑 / 支付 / 订单 / 认证逻辑(/login)未动
- ✅ 设计师其他字段(name / bio / avatar)未动
- ✅ /inspiration 与 /my-studio 未开发(留下一轮)

---

## 7. 与第 1 轮报告(`v2-update-report.md`)关系

- 第 1 轮基于"99 md 是空文件"的前提,退化使用 v1.1 Design System 主文档,产出"暖金 + 米色"系。
- 真 md 是"瓷青 + 烟粉"系,与第 1 轮系统性矛盾。
- 第 1 轮 commit (`1659d84`) 与截图保留作历史,本轮 commit 覆盖到真 md 体系。
- 旧版 `design/screenshots/v2-applied/` 截图已停止更新;新版 `design/screenshots/v2-certified-applied/` 是当前事实。
