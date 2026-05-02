# MaxLuLu AI v1.2 全站升级报告

> 版本:v1.2 高保真稿对齐 | 日期:2026-05-02
> 范围:文档合并 + 视觉系统对齐 + /products / /products/[id] 1:1 还原

---

## 1. 提取的 Token 清单

完整 token 清单见 [`v2-tokens-extracted.md`](./v2-tokens-extracted.md),包含:

- **颜色 token** — Primary 主金色、Designer Gold 认证金、Bg/Surface、Text 三阶、Border/Divider、功能色 4 个、9 阶中性灰、深色 3 阶
- **字体 token** — Serif / Sans 字族、Display / H1–H4 / Body 三阶 / Caption / Label / Button / Nav 字号 + 行高 + 字重 + 字距
- **间距阶梯** — 0/4/8/12/16/20/24/32/40/48/64/72/80/96/112(15 阶)
- **圆角阶梯** — 0/2/8/12/16/20/24/999(8 阶)
- **阴影** — card / hover / modal / **designer**(认证金光,新增)
- **响应式断点** — mobile <768 / tablet 768–1023 / desktop 1024–1439 / desktop-xl ≥1440
- **/products 网格列数** — 桌面 5 / 平板 3 / 移动 2(02 稿确认)

每条 token 标注了来源(从哪张稿哪个位置提取),冲突时按"99_开发注意事项汇总.png → 05 GPT 需求清单 → Design System v1.1 主文档 → 6 张高保真稿"优先级裁决。

> **来源说明**:`99_开发注意事项汇总.md` 实际为 0 字节空文件,故"以 .md 为准"无可参照实体;改用 .png 版本 + 05_GPT 需求清单交叉校对。报告 §7 已列出该项至"待用户决策"。

---

## 2. v1.2 主文档合并清单

| 输出文件 | 由何而来 | 行数 |
|---|---|---|
| `01_PRD_产品需求文档_v1.2.md` | `MaxLuLu AI 产品需求文档(PRD)v1.1.md` + `01_PRD_产品需求文档_v1.2_补丁.md` | 558 |
| `02_IA_信息架构_v1.2.md` | `MaxLuLu AI 网站信息架构(IA)v1.1.md` + `02_IA_信息架构_v1.2_补丁.md` | 321 |
| `03_Sitemap_页面清单_v1.2.md` | `MaxLuLu AI 页面清单(Sitemap)v1.1.md` + `03_Sitemap_页面清单_v1.2_补丁.md` | 177 |
| `04_UserFlow_用户流程_v1.2.md` | `MaxLuLu AI 用户流程(User Flow)v1.1.md` + `04_UserFlow_用户流程_v1.2_补丁.md` | 602 |

合并策略(每份文件顶部已声明):

1. 第一部分 = v1.1 主文档原文(逐字保留)
2. 第二部分 = v1.2 补丁(标注"v1.2 增量(基于 v1.1 + 补丁合并)")
3. 补丁内显式标注"替换 v1.1 §X"的章节,以补丁为准

v1.1 原文件保留不动,补丁文件保留作为变更追溯。

---

## 3. :root 变量更新前后对比

### 3.1 新增

| Token | 值 | 用途 |
|---|---|---|
| `--color-designer-gold` | `#C8A875` | 认证设计师金 |
| `--color-designer-gold-soft` | `#E8D9B8` | 角标淡色填充 |
| `--color-designer-gold-strong` | `#A8884B` | 角标边描线 |
| `--color-accent` / `--color-accent-hover` | 别名指向 designer-gold | 语义化 |
| `--color-text-tertiary` | `#A39A91` | 三阶文字(原 muted 别名保留) |
| `--color-divider` | `#EFE7DD` | 分隔线 |
| `--color-info` | `#3E78B2` | 信息蓝 |
| `--neutral-50 .. --neutral-900` | 9 阶中性灰 | 中性色阶 |
| `--radius-0` / `--radius-2` | 0 / 2px | 圆角阶梯补全 |
| `--shadow-designer` | 金光阴影 | 认证设计师卡片 |
| `--space-0` / `--space-20` | 0 / 80px | 间距阶梯补全 |
| `--gutter-desktop` / `--gutter-mobile` | 40 / 20px | 容器 padding token 化 |
| `--bp-mobile` ... `--bp-desktop-xl` | 768/1024/1280/1440 | 断点 token 化 |
| `--motion-press` / `--motion-page` | 120ms / 220ms cubic-bezier | 动效阶梯 |
| `--text-display-*` ... `--text-nav-*` | 完整 12 阶字号体系 | 排版 token 化 |

### 3.2 调整(legacy 名保留为 fallback,值对齐 v2)

`app/home-consumer.css` :root 中 legacy token 重新对齐:

| 变量 | v1.1(旧) | v1.2(新) | 说明 |
|---|---|---|---|
| `--gold` | `#B0865C` | `#B38A56` | 对齐 globals.css `--color-primary` |
| `--gold-hover` | `#9A7448` | `#9C7443` | 对齐 `--color-primary-hover` |
| `--gold-light` | `#C8A57F` | `#D8C4A4` | 对齐 `--color-primary-strong` |
| `--gold-bg` | rgba(176,134,92,0.06) | rgba(179,138,86,0.08) | 与新 gold 同色相 |
| `--gold-border` | rgba(176,134,92,0.3) | rgba(179,138,86,0.32) | 同上 |
| `--gold-dark` | `#82603A` | `#9C7443` | 与 hover 一致(语义合并) |
| `--bg` / `--bg-main` | `#F5EFE5` | `#F6F1E8` | `--color-bg` |
| `--bg-soft` | `#FAF6F5` | `#FBF7F0` | `--color-surface-soft` |
| `--bg-deep` | `#E5E2DB` | `#EFE7DD` | `--color-divider`(语义化) |
| `--card` | `#FAF6F5` | `#FFFDF9` | `--color-surface` |
| `--card-hover` | `#F5EFE5` | `#FBF7F0` | `--color-surface-soft` |
| `--text` / `--text-main` | `#2B241F` | `#1E1B18` | `--color-text-primary` |
| `--text2` / `--text-sub` | `#7A7A6F` | `#6F665E` | `--color-text-secondary` |
| `--text3` | `#A09A92` | `#A39A91` | `--color-text-tertiary` |
| `--border` | `#E5E2DB` | `#E7DED2` | `--color-border` |
| `--border-light` | `#EFEBE5` | `#EFE7DD` | `--color-divider` |
| `--dark` | `#111111` | `#181512` | `--color-dark` |
| `--red` | `#D95D4F` | `#C84532` | `--color-error` |
| `--shadow-soft` / `--shadow-card` | 旧色调 | 新阴影规范 | 对齐 globals.css 新阴影 token |

### 3.3 保留不动

- `--font-serif` / `--font-sans` / `--font-display` / `--font-body` 字族(2026-05-01 字体方案落地后未变)
- `--container-max` / `--container-max-lg` / `--header-height` / `--sidebar-width`
- `--radius-sm/md/lg/xl/2xl/full` 数值
- `--space-1/2/3/4/5/6/8/10/12/16/18/24/28` 数值
- 旧别名 `--font-display` / `--font-body` 全部保留

---

## 4. 认证设计师工具类定义

来源:05_GPT高保真稿需求清单.md §通用视觉要求("认证设计师视觉系统在四处必须一致")。

定义在 `app/globals.css` 末尾,共 4 个工具类:

| 类名 | 作用 | 应用位置 |
|---|---|---|
| `.is-certified-card` | 卡片金描边 + 右上角"认证"角标 + 微金光阴影 | 灵感广场卡片 / 印花衣橱卡片 |
| `.is-certified-card::before` | 56×24px(桌面)/ 44×20px(移动)金丝带角标 | 自动随上类生成 |
| `.is-certified-avatar` | 头像金圈(`box-shadow: 0 0 0 2px gold`) | 商品详情作者署名 / 评论区头像 |
| `.is-certified-chip` | "✦ 认证"小 chip(高 20,内圆角) | 名字旁内联 |

精确值:

```css
.is-certified-card { border: 1.5px solid var(--color-designer-gold); box-shadow: var(--shadow-designer); }
.is-certified-card::before { content:"认证"; bg: #C8A875; color:#FFF; font-size:10px; letter-spacing:0.12em; }
```

`/products` 页面接入(`app/products/page.tsx` + `app/product-pages.css` 末尾 v1.2 节):

- `.galleryCard.is-certified` 同时启用 `.is-certified-card` 工具类
- `overflow: visible` 让角标不被裁剪;media 内圆角靠 `.galleryCard__media` 自身 `border-radius`

`/products/[id]` 接入(`app/products/[id]/page.tsx`):

- `.pdpDesigner.is-certified` 启用 `.is-certified-avatar` + 名字旁 `.is-certified-chip`
- "设计师"标签替换为"认证设计师",颜色金色

---

## 5. /products 与 /products/[id] 稿 vs 实际差异表

> 桌面截图 = 1440×900,移动截图 = 375×800,存于 `design/screenshots/v2-applied/`。

| 页面 | 模块 | 稿件预期 | 实际渲染 | 是否一致 | 差异说明 |
|---|---|---|---|---|---|
| /products 桌面 | 顶栏 ConsumerNav | 印花衣橱激活 + 搜索 + 我的衣橱 | 一致(ConsumerNav variant=solid) | ✅ | — |
| /products 桌面 | Hero 标题字号 | H1 衬线 56/64/700 → mobile 38/46 | clamp(38,4vw,56) 衬线 700 | ✅ 已修复(T1) | v1.1 旧值 clamp(48,4.6vw,76) 改为 v2 H1 |
| /products 桌面 | Hero 数据统计 | 30 / 128 / 56 三栏右对齐金色衬线 | 一致 | ✅ | — |
| /products 桌面 | 筛选 chip 行 | 圆角胶囊 + active 金底白字 | 一致(`.chip.is-active` 用 var(--gold)=#B38A56) | ✅ | — |
| /products 桌面 | Hot Group Buys 5 横排 | 5 列 mini 卡 | 5 列 mini 卡 | ✅ | — |
| /products 桌面 | 主网格列数 | 5 列 / gap 20-16 | repeat(5, 1fr) gap 20px 16px | ✅ | — |
| /products 桌面 | 卡片卡尺寸 | 3:4 媒体区 + 12-14 padding 信息区 | aspect-ratio:3/4 + padding 12 12 14 | ✅ | — |
| /products 桌面 | 卡片标题字号 | 14/22 sans 500 | 14 sans 500 | ✅ | — |
| /products 桌面 | 卡片价格字号 | 衬线 H4 20/600 | Playfair 20/600 | ✅ 已修复(T1) | v1.1 旧 18/700 sans 改为 v2 H4 衬线 |
| /products 桌面 | 卡片"by 作者" | 14/22 secondary | 14/22 var(--color-text-secondary) | ✅ 已修复(T1) | v1.1 旧 11px tertiary 改为 v2 body-sm secondary;模板加 "by " 前缀 |
| /products 桌面 | 认证设计师卡片 | 1.5px 金描边 + 金丝带角标 | 工具类已就位,需 API 返回 `designer.isCertified=true` 才呈现 | ⚠️ 待数据 | API 当前未返回该字段,视为 false。视觉系统已就位(globals.css `.is-certified-*` + 卡片 `.is-certified` hook),数据落地后零代码改动呈现。 |
| /products 桌面 | 右侧筛选边栏 | 印花风格 + 价格区间 | 一致 | ✅ | — |
| /products 移动 | 网格列数 | 2 列 | 2 列 gap 16/12 | ✅ | — |
| /products 移动 | chip 行横滚 | 横滚不换行 | overflow-x:auto + nowrap | ✅ | — |
| /products 移动 | Hero 堆叠 | 标题 → 描述 → 数据 单列 | 一致 | ✅ | — |
| /products/[id] 桌面 | 缩略图列(左) | 4 张竖向缩略图 | pdpThumbCol × 4 | ✅ | — |
| /products/[id] 桌面 | 主图区(中) | 大图 3:4 + 众定中徽章 + 放大 | 一致 | ✅ | — |
| /products/[id] 桌面 | 信息卡(右) | 标题 H1 衬线 + 编号 + 描述 | 一致 | ✅ | — |
| /products/[id] 桌面 | 价格双 tab | 起拼价 + 个人定制价 | 一致(.pdpPriceTabs) | ✅ | — |
| /products/[id] 桌面 | 进度条 | 已下单 X 件 / 30 | 一致 | ✅ | — |
| /products/[id] 桌面 | 设计师署名 | 头像 + 名字 + 角标 + 关注 | 一致;认证标 chip 已就位(待数据) | ⚠️ 待数据 | 同上,API 缺 isCertified |
| /products/[id] 桌面 | 尺码 chips | S/M/L/XL/XXL 圆角 | 一致 | ✅ | — |
| /products/[id] 桌面 | 配色 swatches | 5 色圆点 | 一致 | ✅ | — |
| /products/[id] 桌面 | CTA 双按钮 | 立即开团(主)+ 个人定制(次) | 一致 | ✅ | — |
| /products/[id] 桌面 | 信任 ul | 30 天退换 / 顺丰 / 不成团退款 | 一致 | ✅ | — |
| /products/[id] 桌面 | 印花故事区 | 标题 + 文字 + 4 缩略 | 一致 | ✅ | — |
| /products/[id] 桌面 | 面料工艺规格 | 6 格规格 + 工艺单签名 | 一致(.pdpSpecGrid) | ✅ | — |
| /products/[id] 移动 | 全栈式布局 | 缩略图 → 主图 → 信息 → 故事 → 规格 → 评论 | 一致 | ✅ | — |
| /products/[id] 移动 | 底部 sticky CTA | 立即开团 + 个人定制 | 一致 | ✅ | — |

### 5.1 T1(token 类)差异 — 全部已修复

1. ✅ Hero h1 字号 → 对齐 v2 H1 token clamp(38–56)
2. ✅ 卡片价格字号 → Playfair 20/600 H4
3. ✅ 卡片署名字号/颜色 → 14/22 secondary + "by " 前缀
4. ✅ 全局 legacy 变量(`--gold` 等)值对齐 v2 :root token
5. ✅ globals.css :root 新增 designer-gold / 9 阶中性灰 / 完整字号体系 / 间距 + 圆角 + 阴影 + 断点 token

### 5.2 T2(布局类)差异 — 全部已就位

1. ✅ 桌面 5 列 / 平板 3 列 / 移动 2 列(`.galleryGrid` + `@media`)
2. ✅ 商品详情桌面 thumb-col / main-media / info-card 三栏
3. ✅ 商品详情移动堆叠 + 底部 sticky CTA

### 5.3 待数据 — 非本轮违规

- 认证设计师卡片金描边 + 角标:视觉系统已就位,等 API 返回 `designer.isCertified=true` 即呈现;无需再改 UI。建议下一轮对接 v1.2 PRD §6.1 升级路径接口时同步注入该字段。

---

## 6. 4 张截图说明

存放路径:`design/screenshots/v2-applied/`

| 文件 | 视口 | 对照稿 | 用途 |
|---|---|---|---|
| `desktop_products.png` | 1440×900 | 02_products_印花衣橱.png 桌面区 | /products 桌面 1:1 验证 |
| `mobile_products.png` | 375×800 | 02_products_印花衣橱.png 移动区 | /products 移动 1:1 验证 |
| `desktop_product_detail.png` | 1440×900 | 06_product-detail_商品详情.png 桌面区 | /products/[id] 桌面 1:1 验证 |
| `mobile_product_detail.png` | 375×800 | 06_product-detail_商品详情.png 移动区 | /products/[id] 移动 1:1 验证 |

捕获脚本:`scripts/v2-capture.mjs`(自动从 `/api/designs?limit=1` 取一个真实存在的设计 ID 跑详情页)。

> **图片占位说明**:截图中商品图区显示为 tone-* 渐变(线性渐变占位),原因是种子数据多数无 `images[0]`。这是数据问题,不是设计问题;线性渐变占位逻辑(`.galleryCard__media.tone-*`)由 v1.0 即存在,本轮未动。

---

## 7. 还未还原的页面清单(下一轮)

| 路由 | 状态 | 优先级 | 来源稿 |
|---|---|---|---|
| `/inspiration` | ❌ 无代码,需新建 | P1 | 01_inspiration_灵感广场.png |
| `/inspiration/[id]` | ❌ 无代码,需新建 | P1 | 03_inspiration-detail_灵感作品详情.png |
| `/my-studio` | ❌ 无代码,需新建 | P1 | 04_my-studio_我的设计工作室.png |
| `/my-studio/works` | ❌ 无代码,需新建 | P1 | 05_my-studio-works_我的作品列表.png |
| `/studio` | ✅ 已存在,不在本轮 | — | (沿用 v1.1 设计师 Studio) |
| `/studio/join` | ✅ 已存在,不在本轮 | — | — |
| `/studio/dashboard` | ✅ 已存在,不在本轮 | — | — |
| `/my` 我的衣橱 | ✅ 已存在,不在本轮 | — | — |

下一轮 + 本轮的 token 系统已就位,下一轮 4 个新页面可直接使用 `globals.css` :root v2 + `.is-certified-*` 工具类,无需重定义。

---

## 8. 待用户决策

| 项 | 暂定方案 | 待用户回复 |
|---|---|---|
| `99_开发注意事项汇总.md` 是 0 字节空文件 | 退化用 .png + 05 GPT 需求清单 + Design System v1.1 主文档拼合 | 请补全 .md 内容,本轮 token 清单将以新版本重新校对 |
| API 是否新增 `designer.isCertified` 字段 | 当前 UI 已 ready,字段缺失视为 false | 确认对接节点,建议与 PRD v1.2 §6.1 升级路径同期 |
| 角标精确像素 1.5px? | 取自 05 GPT 需求清单 | 如稿件实际为 1px 或 2px 请告知 |
| 角标尺寸(桌面 56×24,移动 44×20) | 按比例估算 | 如稿件有标注像素请告知 |
| 卡片"by 作者"前缀字符 | 加了 "by " 与 02 稿一致 | 中英版本如需动态切换请告知 |

---

## 9. 验证

- ✅ `npx tsc --noEmit` exit 0(干净)
- ✅ 4 张截图全部成功捕获
- ✅ 差异表 T1 + T2 全部 `已修复` 或 `已一致`
- ✅ 业务逻辑 / API / 路由 / 深色模式均未动
- ✅ 稿中无的元素未发挥;稿中有的元素未删除
- ✅ 1:1 还原硬要求:每条 token 与稿件 / Design System 对齐,差异表逐项核验
