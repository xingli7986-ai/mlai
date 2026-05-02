# MaxLuLu AI v2 真版高保真稿 Token 提取清单

> **本版本基于真 99 md 重新校对**(`design/high-fidelity-v2/99_开发注意事项汇总.md` 1118 行,2026-05-02 补全)。
> 之前(第 1 轮)按"99 md 是空文件"退化使用 v1.1 Design System 主文档 + 05 GPT 需求清单的版本已被本版本覆盖。
> 差异修订报告见 [`v2-tokens-revision.md`](./v2-tokens-revision.md)。

日期:2026-05-02

**主配色定调**(真 md §1.1):

> 本次高保真稿采用 **Porcelain Cyan × Smoked Rose / 瓷青蓝 × 烟粉玫瑰** 作为主 UI 配色。
> 整体气质:高端女装品牌感、轻盈、柔和、知性;不使用大面积金色和米色;**金色仅用于「认证设计师」身份系统,不作为品牌主色**。

---

## 一、颜色 Token

### 1.1 Brand / Primary(瓷青蓝 Porcelain Cyan)

| Token | 值 | 来源 | 用途 |
|---|---|---|---|
| `--color-primary` | `#2F5A5D` | 真 md §1.2 | 品牌主按钮、导航选中、核心图标、重点链接 |
| `--color-primary-hover` | `#234A50` | 真 md §6.1 Secondary | hover / pressed |
| `--color-primary-pressed` | `#1C393D` | 真 md §6.1 Text Button pressed | active |
| `--color-primary-subtle` | `#E2EEF1` | 真 md §1.2 / §6.1 Secondary hover | 选中背景、浅色提示 |

### 1.2 Accent(烟粉玫瑰 Smoked Rose)— 主 CTA 用色

| Token | 值 | 来源 | 用途 |
|---|---|---|---|
| `--color-accent` | `#BA5E70` | 真 md §1.2 / §6.1 Primary Button | 核心 CTA、收藏高亮、解锁按钮 |
| `--color-accent-hover` | `#A85060` | 真 md §6.1 | Primary 按钮 hover |
| `--color-accent-pressed` | `#8F4655` | 真 md §6.1 | Primary 按钮 pressed |
| `--color-accent-subtle` | `#F4E5E7` | 真 md §1.2 / §6.3 Badge "新品" | 强调浅底、解锁区浅底 |

### 1.3 Certified Gold(认证设计师专用)

| Token | 值 | 来源 | 用途 |
|---|---|---|---|
| `--color-certified-gold` | `#C8A875` | 真 md §2.1 | 认证描边、角标、徽章、作者认证 |
| `--color-certified-gold-hover` | `#B89561` | 真 md §6.1 Gold CTA hover | 认证 CTA hover |
| `--color-certified-gold-pressed` | `#9F7E4F` | 真 md §6.1 | 认证 CTA pressed |
| `--color-certified-gold-soft` | `rgba(200,168,117,0.16)` | 真 md §6.3 Badge "已售" | 认证浅底 |

### 1.4 Bg / Surface

| Token | 值 | 来源 | 用途 |
|---|---|---|---|
| `--color-bg` | `#F3F6F6` | 真 md §1.3 | 页面整体背景 |
| `--color-surface` | `#FCFDFD` | 真 md §1.3 / §6.4 默认卡 | 卡片、商品卡、信息面板 |
| `--color-surface-elevated` | `#FFFFFF` | 真 md §1.3 | 弹窗、抽屉、浮层、移动端固定底栏 |
| `--color-subtle` | `#E6ECEC` | 真 md §1.3 | 筛选区、浅色模块、分区背景 |

### 1.5 Text

| Token | 值 | 来源 | 用途 |
|---|---|---|---|
| `--color-text-primary` | `#1E272B` | 真 md §1.4 | 页面标题、商品标题、价格、核心正文 |
| `--color-text-secondary` | `#566469` | 真 md §1.4 | 描述文字、作者名、参数说明 |
| `--color-text-tertiary` | `#879197` | 真 md §1.4 | 时间、辅助说明、计数弱信息 |
| `--color-text-disabled` | `#B7C2C8` | 真 md §1.4 | 禁用按钮、不可操作状态 |
| `--color-text-inverse` | `#FFFFFF` | 真 md §1.4 | 深色按钮、深色背景上的文字 |

### 1.6 Border / Divider

| Token | 值 | 来源 | 用途 |
|---|---|---|---|
| `--color-border` | `#D2DEDF` | 真 md §1.5 | 卡片边框、输入框、筛选 chip、缩略图 |
| `--color-border-strong` | `#B8C7CA` | 真 md §1.5 | 选中态边框、重要输入框 |
| `--color-divider` | `#E1E8E8` | 真 md §1.5 | 模块分割线、列表分隔线 |
| `--color-divider-light` | `#ECEEEE` | 真 md §1.5 | 轻量分割线、表格线 |

### 1.7 Functional

| Token | 值 | 来源 |
|---|---|---|
| `--color-success` | `#2F7D68` | 真 md §1.2 |
| `--color-warning` | `#E2A23A` | 真 md §1.2 |
| `--color-error` | `#E57373` | 真 md §1.2 |
| `--color-info` | `#4B8FE3` | 真 md §1.2 |

### 1.8 9 阶中性灰(冷色阶)

| Token | 值 | 来源 |
|---|---|---|
| `--neutral-50` | `#F8FAFA` | 真 md §1.6 |
| `--neutral-100` | `#F1F5F6` | 真 md §1.6 |
| `--neutral-200` | `#E6ECEC` | 真 md §1.6 |
| `--neutral-300` | `#D2DEDF` | 真 md §1.6 |
| `--neutral-400` | `#B8C7CA` | 真 md §1.6 |
| `--neutral-500` | `#879197` | 真 md §1.6 |
| `--neutral-600` | `#566469` | 真 md §1.6 |
| `--neutral-700` | `#34484D` | 真 md §1.6 |
| `--neutral-800` | `#1E272B` | 真 md §1.6 |
| `--neutral-900` | `#11191D` | 真 md §1.6 |

---

## 二、字体 Token

### 2.1 字族(真 md §1.7)

| 场景 | 字体 |
|---|---|
| 英文标题 | Playfair Display |
| 英文正文 / UI | Inter |
| 中文标题 | Noto Serif SC / 思源宋体 |
| 中文正文 / UI | Noto Sans SC / 思源黑体 |
| 数字 / 价格 / 计数 | Playfair Display + tabular-nums + lnum |
| 表格 / 参数 / 小型数字 | Inter + tabular-nums |

### 2.2 字号 Desktop 1440(真 md §1.8)

| 层级 | 字号 / 行高 | 字重 | 字体 |
|---|---|---|---|
| Display | `48 / 56` | Regular | Playfair Display / Noto Serif SC |
| H1 | `40 / 48` | Regular | Playfair Display / Noto Serif SC |
| H2 | `28 / 36` | Regular | Playfair Display / Noto Serif SC |
| H3 | `20 / 28` | Medium | Noto Serif SC / Inter |
| Body | `14 / 22` | Regular | Inter / Noto Sans SC |
| Body Small | `13 / 20` | Regular | Inter / Noto Sans SC |
| Caption | `12 / 18` | Regular | Inter / Noto Sans SC |
| Label | `12 / 16` | Medium | Inter / Noto Sans SC |
| Price | `22 / 28` | Regular | Playfair Display |
| Price Small | `16 / 24` | Regular | Playfair Display |

### 2.3 字号 Mobile 375

| 层级 | 字号 / 行高 |
|---|---|
| Display | `32 / 40` |
| H1 | `28 / 36` |
| H2 | `24 / 32` |
| H3 | `18 / 26` |
| Body | `14 / 22` |
| Caption | `12 / 18` |
| Label | `12 / 16` |
| Price | `20 / 28` |
| Price Small | `14 / 20` |

---

## 三、间距阶梯(真 md §5.1)

| Token | 值 |
|---|---|
| Space 0 | `0` |
| Space 1 | `4px` |
| Space 2 | `8px` |
| Space 3 | `12px` |
| Space 4 | `16px` |
| Space 5 | `20px` |
| Space 6 | `24px` |
| Space 7 | `28px` |
| Space 8 | `32px` |
| Space 10 | `40px` |
| Space 12 | `48px` |
| Space 16 | `64px` |
| Space 20 | `80px` |
| Space 24 | `96px` |

---

## 四、圆角阶梯(真 md §5.3)

| Token | 值 |
|---|---|
| Radius 0 | `0` |
| Radius XS | `2px` |
| Radius S | `4px` |
| Radius M | `8px` |
| Radius L | `12px` |
| Radius XL | `16px` |
| Radius Full | `999px` |

> 真 md 没有 Radius 2XL(24px)。第 1 轮提取的 24px 项移除,legacy `--radius-2xl` 别名指向 16px 以避免页面级硬编码失真。

---

## 五、阴影(真 md §5.4)

| Token | 值 |
|---|---|
| Shadow XS | `0 1px 2px rgba(17, 25, 29, 0.04)` |
| Shadow SM | `0 4px 12px rgba(17, 25, 29, 0.06)` |
| Shadow MD | `0 8px 24px rgba(17, 25, 29, 0.08)` |
| Shadow LG | `0 16px 40px rgba(17, 25, 29, 0.12)` |
| Shadow Certified | `0 2px 6px rgba(200, 168, 117, 0.24)` |

---

## 六、响应式断点(真 md §4.1)

| 断点 | 范围 | 栅格 |
|---|---|---|
| Desktop XL | `≥1440` | 12 columns |
| Desktop | `1200–1439` | 12 columns |
| Tablet | `768–1199` | 8 columns |
| Mobile | `<768` | 4 columns |

### 6.1 页面宽度(真 md §4.2)

| 设备 | 画板 | 内容最大宽 | 页面边距 | 栅格间距 |
|---|---|---|---|---|
| Desktop | `1440 × 900` | `1180–1200` | `40–64` | `24` |
| Tablet | `768–1199` | 自适应 | `24` | `16` |
| Mobile | `375 × 800` | 100% | `16` | `12` |

### 6.2 瀑布流响应式(真 md §4.3)

| 页面 | Desktop | Tablet | Mobile |
|---|---|---|---|
| /inspiration | 4 列 | 3 列 | 2 列 |
| /products | 5 列 | 3 列 | 2 列 |
| /my-studio/works | 3-4 列 | 2-3 列 | 单列 / 2 列 |

### 6.3 详情页响应式(真 md §4.4)

| 页面 | Desktop | Mobile |
|---|---|---|
| 灵感详情 | 左图 60% + 右信息 40% | 图在上,信息在下,CTA 固定底部 |
| 商品详情 | 左图 + 右购买面板 | 图在上,购买 CTA 固定底部 |

---

## 七、按钮状态(真 md §6.1)

### 7.1 Primary Button(主 CTA — Smoked Rose)

| 状态 | 样式 |
|---|---|
| Default | `bg: #BA5E70; color: #FFFFFF; border: 1px solid #BA5E70;` |
| Hover | `bg: #A85060; box-shadow: 0 4px 12px rgba(186,94,112,0.22);` |
| Pressed | `bg: #8F4655; transform: translateY(1px);` |
| Disabled | `bg: #E6ECEC; color: #B7C2C8; border-color: #E6ECEC;` |

### 7.2 Secondary Button(瓷青描边)

| 状态 | 样式 |
|---|---|
| Default | `bg: #FFFFFF; color: #2F5A5D; border: 1px solid #D2DEDF;` |
| Hover | `bg: #E2EEF1; color: #234A50; border-color: #2F5A5D;` |
| Pressed | `bg: #D8E9EC; border-color: #234A50;` |

### 7.3 Gold CTA(认证相关 — 极少量场景)

| 状态 | 样式 |
|---|---|
| Default | `bg: #C8A875; color: #FFFFFF; border: 1px solid #C8A875;` |
| Hover | `bg: #B89561;` |
| Pressed | `bg: #9F7E4F;` |

### 7.4 Text Button

| 状态 | 样式 |
|---|---|
| Default | `color: #2F5A5D;` |
| Hover | `color: #234A50; text-decoration: underline;` |
| Pressed | `color: #1C393D;` |

---

## 八、Tabs / Badge / Card 状态(真 md §6.2-6.4)

### 8.1 Tabs

| 状态 | 样式 |
|---|---|
| Default | `color: #566469; bg: transparent` |
| Hover | `color: #1E272B; bg: #F1F5F6` |
| Active | `color: #2F5A5D; border-bottom: 2px solid #2F5A5D` |
| Active Pill | `bg: #2F5A5D; color: #FFF; radius: 999` |

### 8.2 Badge

| 类型 | 样式 |
|---|---|
| 草稿 | `bg: #F1F5F6; color: #566469` |
| 已分享 | `bg: #E2EEF1; color: #2F5A5D` |
| 已上架 | `bg: rgba(47,125,104,0.12); color: #2F7D68` |
| 已售 | `bg: rgba(200,168,117,0.16); color: #A8874F` |
| 新品 | `bg: #F4E5E7; color: #BA5E70` |
| 热门 | `bg: rgba(226,162,58,0.14); color: #B47A25` |
| **认证 / 认证设计师** | `bg: #C8A875; color: #FFFFFF` |
| 免费 | `bg: rgba(47,125,104,0.12); color: #2F7D68` |
| 付费解锁 | `bg: #F4E5E7; color: #BA5E70` |
| 不公开 | `bg: #F1F5F6; color: #879197` |

### 8.3 Card

| 状态 | 样式 |
|---|---|
| 默认 | `bg: #FCFDFD; border: 1px solid #D2DEDF; radius: 12; shadow: shadow-xs` |
| Hover | `border: #B8C7CA; shadow: shadow-md; translateY(-2)` |
| Active | `border: #2F5A5D; box-shadow: 0 0 0 2px rgba(47,90,93,0.12)` |
| **Certified** | `border: 1.5px solid #C8A875` + 角标 |
| Disabled | `opacity: 0.56; pointer-events: none; filter: grayscale(0.2)` |

---

## 九、认证设计师视觉系统(真 md §02)

### 9.1 核心样式

| 元素 | 样式 |
|---|---|
| 认证主色 | `#C8A875` |
| 认证描边 | `1.5px solid #C8A875` |
| 认证角标背景 | `#C8A875` |
| 认证角标文字 | `#FFFFFF` |
| 认证角标字号 | `12 / 16` |
| 认证徽章圆角 | `999px` 或斜切 |
| 认证徽章阴影 | `0 2px 6px rgba(200,168,117,0.24)` |

### 9.2 应用四处(必须一致)

1. 灵感广场卡片
2. 印花衣橱商品卡片
3. 详情页作者署名区
4. 评论区头像

### 9.3 印花衣橱卡片(§2.3)

| 元素 | 样式 |
|---|---|
| 卡片描边 | `1.5px solid #C8A875` |
| 右上角角标 | 金底白字"认证" |
| 作者署名 | `by [名字]` |
| 作者名旁徽章 | 金色小圆章 14px |
| 商品价格 | 不因认证改变颜色 |

### 9.4 详情页作者署名(§2.4)

| 元素 | 样式 |
|---|---|
| 普通作者信息卡 | `border: 1px solid #D2DEDF` |
| 认证作者信息卡 | `border: 1px solid #C8A875` |
| 头像 Desktop | `40 × 40` |
| 头像 Mobile | `36 × 36` |
| 认证 Badge | 金色浅底或金色描边 + 文字 `认证设计师` |

### 9.5 评论区(§2.5)

| 元素 | 样式 |
|---|---|
| 评论头像 | 圆形 |
| 认证标识 | 头像右下角小金章 |
| 小金章尺寸 | `12 × 12` |
| 小金章边框 | `1px solid #FFFFFF` |
| 悬停 | Tooltip:`认证设计师` |

### 9.6 开发规则(§2.6)

- 认证视觉必须由统一字段控制(本仓库实现:`Designer.isCertified Boolean`)
- 不允许各页面单独写死
- 金 `#C8A875` 只用于身份识别,不用于普通促销
- 移动端认证角标不可隐藏
- 列表卡片、详情页、评论区必须复用同一套认证组件

---

## 十、数字规范(真 md §03)

- 所有数字、计数、价格使用等宽数字 + 衬线对齐
- 价格 = Playfair Display + `font-variant-numeric: tabular-nums; font-feature-settings: "tnum" 1, "lnum" 1;`
- 商品卡价格:`16 / 24 Playfair`
- 商品详情价格:`22 / 28 Playfair`
- 解锁价格:`14 / 20 Inter`
- 原价:`text-decoration: line-through; color: #879197`

---

## 十一、容器 / 布局

| Token | 值 | 来源 |
|---|---|---|
| `--container-max` | 1200px | 真 md §4.2 |
| `--container-max-lg` | 1200px | 真 md §4.2 |
| `--header-height` | 72px | (沿用 v1.1) |
| `--gutter-desktop` | 40px(范围 40–64) | 真 md §4.2 / §5.2 |
| `--gutter-mobile` | 16px | 真 md §4.2 / §5.2 |

---

## 十二、动效

| Token | 值 |
|---|---|
| `--motion-base` | `180ms ease-out` |
| `--motion-press` | `120ms ease-out` |
| `--motion-page` | `220ms cubic-bezier(0.4,0,0.2,1)` |

---

## 十三、可访问性(真 md §8.7)

- 文本 vs 背景对比度 ≥ 4.5:1
- 禁用态不只依赖颜色
- **认证状态不只依赖金色,应同时显示文字 "认证"**
- Prompt 锁定状态不只依赖模糊,应同时显示锁图标 + 文案
- 焦点态:`outline: 2px solid #2F5A5D; outline-offset: 2px`

---

## 十四、组件复用清单(真 md §8.5)

以下组件不允许各页面单独实现:

| 组件 | 说明 |
|---|---|
| `VerifiedBadge` | 认证设计师徽章 |
| `CertifiedCardFrame` | 认证卡片描边与角标 |
| `AuthorSignature` | 作者署名与认证标识 |
| `PromptVisibilityBlock` | Prompt 免费 / 付费 / 不公开 |
| `PriceText` | 价格展示与数字对齐 |
| `MetricItem` | 点赞 / 收藏 / 购买数据 |
| `StatusBadge` | 作品状态标签 |
| `BottomActionBar` | 移动端底部 CTA |
| `FilterDrawer` | 移动端筛选抽屉 |
| `MasonryGrid` | 瀑布流网格 |

> 当前仓库以工具类(globals.css `.is-certified-*`)落地认证视觉,组件化封装列入下一轮。
