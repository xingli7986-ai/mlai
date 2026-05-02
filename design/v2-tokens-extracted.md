# MaxLuLu AI v2 高保真稿 Token 提取清单

> 抽取来源:`design/high-fidelity-v2/` 6 张高保真稿(01–06) + 99_开发注意事项汇总.png + 05_GPT高保真稿需求清单.md。
> `99_开发注意事项汇总.md` 为 0 字节空文件,因此 token 优先级:99_开发注意事项汇总.png(可读)→ 05 需求清单 →《MaxLuLu AI Design System 设计系统文档 & 组件规范》(v1.1 主设计文档)→ 6 张高保真稿。
> 颜色值与 v1.1 设计系统主文档完全一致(GPT 需求清单 §通用视觉要求明确"全部沿用 Design System 的颜色、字体、组件规范")。v2 新增的是**认证设计师视觉系统**和**新页面**,基础 token 不动。

日期:2026-05-02

---

## 一、颜色 Token

### 1.1 Brand / Primary(主金色)

| Token | 值 | 来源 |
|---|---|---|
| `--color-primary` | `#B38A56` | 99_开发注意事项汇总.png 02 色彩系统第 1 列 / 06 商品详情页 CTA "立即下单"按钮 |
| `--color-primary-hover` | `#9C7443` | 99 png hover 演示色块 / Design System §3.1 |
| `--color-primary-soft` | `#EFE3D0` | 02 印花衣橱筛选 chip active 背景 / 99 png pill chip |
| `--color-primary-strong` | `#D8C4A4` | 99 png 强描边色块 / Design System §3.1 |

### 1.2 Accent(认证设计师金 — Designer Gold)

| Token | 值 | 来源 |
|---|---|---|
| `--color-designer-gold` | `#C8A875` | 05 §通用视觉要求 "金色描边 1.5px (#C8A875)" 直接给出 |
| `--color-designer-gold-soft` | `#E8D9B8` | 02 印花衣橱认证卡片右上角金色丝带角标的浅色填充 |
| `--color-designer-gold-strong` | `#A8884B` | 99 png 角标边描线 |

### 1.3 Bg / Surface(背景与表面)

| Token | 值 | 来源 |
|---|---|---|
| `--color-bg` | `#F6F1E8` | 01–06 全部页面主背景 / 99 png 主底色 |
| `--color-surface` | `#FFFDF9` | 01–06 卡片、信息面板背景 / 06 商品详情右侧信息卡 |
| `--color-surface-soft` | `#FBF7F0` | 02 印花衣橱筛选条 / 03 灵感作品详情 prompt 卡 |

### 1.4 Text(文字)

| Token | 值 | 来源 |
|---|---|---|
| `--color-text-primary` | `#1E1B18` | 01–06 主文字、标题(印花衣橱、商品标题) |
| `--color-text-secondary` | `#6F665E` | 02 卡片下方"by 设计师" / 06 价格副文 / 04 工作室次级正文 |
| `--color-text-tertiary` | `#A39A91` | 02 占位文字、Caption / 99 png placeholder |
| `--color-text-on-dark` | `#FFFDF9` | 06 深色 CTA 文字 / 99 png 深底白字 |

### 1.5 Border / Divider

| Token | 值 | 来源 |
|---|---|---|
| `--color-border` | `#E7DED2` | 02 卡片描边 / 06 信息卡 1px 描边 |
| `--color-border-strong` | `#D8C4A4` | 02 hover 描边 / 03 prompt 卡边 |
| `--color-divider` | `#EFE7DD` | 06 详情区分隔线 / 99 png 分隔线 |

### 1.6 功能色

| Token | 值 | 来源 |
|---|---|---|
| `--color-success` | `#4F8A62` | 99 png 功能色色板 |
| `--color-warning` | `#C9903D` | 99 png 警告 |
| `--color-error` | `#C84532` | 99 png 错误 / 06 库存提示 |
| `--color-info` | `#3E78B2` | 99 png 信息蓝 |

### 1.7 9 阶中性灰

| Token | 值 | 来源 |
|---|---|---|
| `--neutral-50` | `#FAF7F3` | 99 png 中性色第 1 阶 |
| `--neutral-100` | `#F2EEE9` | 暖灰底色 |
| `--neutral-200` | `#E6E1DA` | 浅灰描边 |
| `--neutral-300` | `#D1CBC2` | 中浅灰 |
| `--neutral-400` | `#B8B0A4` | 中灰(02 卡片占位) |
| `--neutral-500` | `#8A8278` | 中灰二阶 |
| `--neutral-600` | `#6F665E` | 02 副文字 |
| `--neutral-700` | `#4D453E` | 04 次级标题 |
| `--neutral-800` | `#2A211B` | 06 强对比文字 |
| `--neutral-900` | `#1E1B18` | 主文字 |

### 1.8 深色

| Token | 值 | 来源 |
|---|---|---|
| `--color-dark` | `#181512` | 99 png 深棕底色 |
| `--color-dark-soft` | `#2A211B` | 99 png 深棕渐变次色 |
| `--color-white` | `#FFFFFF` | 标准白(只用于卡内、弹窗) |

---

## 二、字体 Token

> 字族结构与 v1.1 一致(2026-05-01 字体方案更新已落地):衬线 = Playfair Display + 思源宋体;无衬线 = Inter + 思源黑体。

### 2.1 字族

| Token | 值 | 来源 |
|---|---|---|
| `--font-family-serif` | `"Playfair Display", "Noto Serif SC", Georgia, serif` | 01 Hero "Fashion For You" / 06 商品标题 / 99 png 字体规范 |
| `--font-family-sans` | `"Inter", "Noto Sans SC", "PingFang SC", "Microsoft YaHei", system-ui, sans-serif` | 全站正文 / 99 png Body 规范 |

### 2.2 字号 / 行高 / 字重 / 字距

| Token | 字号 | 行高 | 字重 | 字距 | 字族 | 来源 |
|---|---|---|---|---|---|---|
| `text-display` | 64px | 72px | 700 | -0.03em | serif | 01 Hero "Fashion For You" 桌面 |
| `text-h1` | 56px | 64px | 700 | -0.03em | serif | 02/06 页面主标题桌面 |
| `text-h2` | 36px | 44px | 600 | -0.02em | serif | 02 模块标题"印花故事" |
| `text-h3` | 24px | 32px | 600 | -0.01em | serif | 04 卡片组标题 |
| `text-h4` | 20px | 28px | 600 | 0 | sans | 02/06 卡片标题 |
| `text-body-lg` | 18px | 30px | 400 | 0 | sans | 06 商品描述 |
| `text-body` | 16px | 28px | 400 | 0 | sans | 全站正文 |
| `text-body-sm` | 14px | 22px | 400 | 0 | sans | 02 卡片下方"by xxx" |
| `text-sub` | 13px | 20px | 400 | 0 | sans | 06 副信息行 |
| `text-caption` | 13px | 20px | 400 | 0 | sans | 02 占位文字 / 06 编号 |
| `text-label` | 14px | 20px | 500 | 0 | sans | 表单标签 |
| `text-button` | 15px | 20px | 500 | 0 | sans | 06 CTA 按钮 |
| `text-nav` | 14px | 20px | 500 | 0 | sans | 顶栏导航 |

### 2.3 移动端 H1 / H2

| Token | 桌面 | 移动 | 来源 |
|---|---|---|---|
| `text-h1-mobile` | 56/64 | 38px / 46px / 700 | 99 png 移动 Hero / Design System §4.3 |
| `text-h2-mobile` | 36/44 | 28px / 36px / 600 | 99 png 移动 H2 |

---

## 三、间距阶梯 Spacing

8pt 栅格,扩展到 96px:

| Token | 值 | 用途 | 来源 |
|---|---|---|---|
| `--space-0` | 0 | 紧贴 | 通用 |
| `--space-1` | 4px | 极小间距 / 图标微调 | 99 png 间距系统 |
| `--space-2` | 8px | 标签内、组件内 | 02 chip 内 padding 上下 |
| `--space-3` | 12px | 图标与文字 | 02 卡片底 padding |
| `--space-4` | 16px | 小卡 padding / 列表 gap | 02 卡片网格 gap |
| `--space-5` | 20px | 表单列间距 | 06 信息卡内列 |
| `--space-6` | 24px | 标准卡 padding | 06 CTA 卡 padding |
| `--space-8` | 32px | 模块内大间距 | 02 区块 |
| `--space-10` | 40px | 页面左右 padding 桌面 | 容器 padding |
| `--space-12` | 48px | 模块标题到内容 | 02/06 |
| `--space-16` | 64px | 中等模块间距 | 全站 |
| `--space-18` | 72px | 页面区块间距 | 99 png |
| `--space-20` | 80px | 大模块间距 | 99 png |
| `--space-24` | 96px | 大型模块 / 区段 | 99 png |
| `--space-28` | 112px | 首页大区块 | (沿用 v1.1) |

---

## 四、圆角阶梯 Radius

| Token | 值 | 用途 | 来源 |
|---|---|---|---|
| `--radius-0` | 0 | 无圆角 | — |
| `--radius-2` | 2px | 微圆角(标签内组件) | 99 png |
| `--radius-sm` | 8px | 小按钮 / 标签 | 02 chip |
| `--radius-md` | 12px | 输入框 / 按钮 / FAQ | 06 CTA / Input |
| `--radius-lg` | 16px | 标准卡 / 图片 | 02/06 卡片 |
| `--radius-xl` | 20px | 大卡 / Hero 图组 | 04 工作室创作卡 |
| `--radius-2xl` | 24px | 大型 CTA / 弹窗 | 06 信息面板 |
| `--radius-full` | 999px | 胶囊 / 头像 / 圆形图标 | 02 价格 chip / 03 头像 |

---

## 五、阴影 Shadow

| Token | 值 | 来源 |
|---|---|---|
| `--shadow-card` | `0 1px 2px rgba(24,21,18,0.04), 0 8px 24px rgba(24,21,18,0.06)` | 02 卡片默认 |
| `--shadow-hover` | `0 12px 32px rgba(24,21,18,0.10), 0 24px 64px rgba(24,21,18,0.08)` | 02 卡片 hover |
| `--shadow-modal` | `0 24px 80px rgba(24,21,18,0.18)` | 弹窗 |
| `--shadow-designer` | `0 0 0 1.5px rgba(200,168,117,0.55), 0 8px 24px rgba(168,136,75,0.18)` | 02 认证设计师卡片金色描边 + 微金光 |

---

## 六、响应式断点 Breakpoints

| Token | 范围 | 规则 | 来源 |
|---|---|---|---|
| `desktop-xl` | ≥1440px | 容器 1200–1280 居中,5 列网格 | 02 桌面区(1440 视图) |
| `desktop` | 1024–1439 | 12 栅格,侧边栏固定 | 99 png |
| `tablet` | 768–1023 | 8 栅格,3 列网格 | 02 平板区 |
| `mobile` | <768 | 单列 / 2 列网格,隐藏侧边栏 | 02/06 移动区 |

### 6.1 印花衣橱 /products 网格列数(关键)

| 断点 | 列数 | 来源 |
|---|---|---|
| 桌面 ≥1280 | **5 列** | 02 桌面稿可数到 5 列 |
| 平板 768–1279 | **3 列** | 02 平板示意 |
| 移动 <768 | **2 列** | 02 移动稿底部示意 |

### 6.2 灵感广场 /inspiration 列数

| 断点 | 列数 | 来源 |
|---|---|---|
| 桌面 ≥1280 | 4 列瀑布流 | 05 §1 / 01 桌面 |
| 平板 | 3 列 | 05 §1 |
| 移动 | 2 列 | 05 §1 |

---

## 七、认证设计师视觉系统(v2 新增,4 处统一)

来源:05_GPT高保真稿需求清单.md §通用视觉要求 + 02 印花衣橱 + 06 商品详情 + 03 灵感作品详情。

### 7.1 三要素

1. **金色描边**:`1.5px solid var(--color-designer-gold)`(#C8A875)
   - 描边圆角与卡片半径一致(避免双层错位)
2. **右上角金丝带角标**(corner ribbon):
   - 尺寸:32×32px(桌面)/ 24×24px(移动)
   - 颜色:`--color-designer-gold` 实心,内嵌"认证"白字 10px
   - 圆角与卡片左下角对称
3. **微金光阴影**:`--shadow-designer`(可选,hover 时强化)

### 7.2 应用四处

| 位置 | 元素 | 描述 |
|---|---|---|
| 灵感广场 /inspiration 卡片 | `.galleryCard.is-certified` | 描边 + 角标 |
| 印花衣橱 /products 卡片 | `.galleryCard.is-certified` | 同上 |
| 商品详情 /products/[id] 作者署名 | `.pdpDesigner.is-certified` | 头像金圈 + 名字旁角标 chip |
| 评论区头像 | `.commentAvatar.is-certified` | 头像金圈 |

### 7.3 工具类(在 globals.css 落地)

```css
.is-certified-card { border: 1.5px solid var(--color-designer-gold); border-radius: var(--radius-lg); position: relative; }
.is-certified-card::after { /* 金丝带角标 */ }
.is-certified-avatar { box-shadow: 0 0 0 2px var(--color-designer-gold); }
```

---

## 八、容器 / 布局

| Token | 值 | 来源 |
|---|---|---|
| `--container-max` | 1200px | Design System §5.1 |
| `--container-max-lg` | 1280px | 02 桌面 5 列布局基准 |
| `--header-height` | 72px | 02 顶栏 / 99 png |
| `--gutter-desktop` | 40px | 桌面左右 padding |
| `--gutter-mobile` | 20px | 移动左右 padding |

---

## 九、动效

| Token | 值 | 来源 |
|---|---|---|
| `--motion-base` | `180ms ease-out` | Design System / 通用 hover |
| `--motion-press` | `120ms ease-out` | 按下动效 |
| `--motion-page` | `220ms cubic-bezier(0.4,0,0.2,1)` | 页面切换 |

---

## 十、来源备注 & 待用户决策

- **99_开发注意事项汇总.md 是 0 字节空文件**:本轮按 99_开发注意事项汇总.png + 05 GPT 需求清单 + Design System v1.1 主文档拼合。后续如需"以 md 为准",请用户补全 md 内容,本份 token 清单将以那份为最高优先级重新校对。
- **金色描边精确像素**:5 章 §1.7 "1.5px"取自 05 GPT 需求清单。如稿件实际为 1px 或 2px 请告知。
- **角标尺寸**:稿中显示但未标注精确像素,本清单按比例估算 32px(桌面)。
