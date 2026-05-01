# MaxLuLu AI Design System 设计系统文档 & 组件规范 Component Spec

> 适用项目：MaxLuLu AI 官网、AI Studio、设计师工作台、灵感画廊、入驻页、工具页、后台管理页  
> 设计目标：统一全站视觉语言、组件规范、交互状态与前端实现标准，确保 Claude Code / Codex / 前端工程师可以稳定复刻页面效果。

---

# Part 1｜Design System 设计系统文档

## 1. 品牌视觉定位

MaxLuLu AI 是一个面向高端女装、AI 服装设计、设计师创业与消费者定制的平台。整体视觉需要同时体现：

- **高级感**：接近奢侈品官网的克制、留白、精致细节。
- **专业感**：面向设计师和品牌方，不能过度电商化或廉价促销化。
- **科技感**：作为 AI 设计平台，需要体现效率、智能、工具化能力。
- **女性审美**：色彩、图片、排版要柔和、优雅、细腻。
- **东方与法式融合**：适合 MaxLuLu 的品牌背景，既有法式浪漫，也有东方韵味。

整体风格关键词：

```txt
Luxury / Editorial / Warm Minimal / Fashion Tech / Soft Premium / Designer Studio
```

中文关键词：

```txt
高级、克制、温润、优雅、专业、留白、精致、设计师感、轻奢、时装编辑感
```

---

## 2. 设计原则

### 2.1 克制优先

不要使用过多颜色、渐变、阴影、装饰图案。MaxLuLu AI 的高级感来自留白、比例、字体层级和细节，而不是堆满视觉元素。

### 2.2 信息层级清晰

每个页面必须明确：

1. 当前页面是做什么的
2. 用户下一步应该点哪里
3. 主要信息、次要信息、辅助信息分别是什么
4. 哪些内容是品牌展示，哪些内容是功能操作

### 2.3 组件统一

按钮、卡片、输入框、侧边栏、顶部导航、弹窗、FAQ、标签等组件必须全站统一，不允许每个页面单独写一套样式。

### 2.4 设计服务转化

所有视觉优化都必须服务业务目标：

- 首页：提升品牌信任和用户探索欲
- 灵感库：提升浏览效率和收藏/购买转化
- 工具页：提升操作效率和结果确认感
- 入驻页：提升申请完成率
- 工作台：提升设计师管理作品和使用工具的效率

### 2.5 移动端不降级

移动端不是简单压缩桌面端，而是重新组织信息层级。核心 CTA、表单、卡片、图片浏览必须保持可用性。

---

## 3. 色彩系统 Colors

### 3.1 主色板

| Token | 用途 | 色值 |
|---|---|---|
| `--color-bg` | 页面主背景 | `#F6F1E8` |
| `--color-surface` | 卡片 / 表单 / 浮层背景 | `#FFFDF9` |
| `--color-surface-soft` | 浅色模块背景 | `#FBF7F0` |
| `--color-primary` | 主金色 / 主按钮 / 强调数字 | `#B38A56` |
| `--color-primary-hover` | 主金色 hover | `#9C7443` |
| `--color-primary-soft` | 浅金色背景 | `#EFE3D0` |
| `--color-text-primary` | 主标题 / 正文主色 | `#1E1B18` |
| `--color-text-secondary` | 次级正文 | `#6F665E` |
| `--color-text-muted` | 辅助说明 / placeholder | `#A39A91` |
| `--color-border` | 默认描边 | `#E7DED2` |
| `--color-border-strong` | 强描边 / hover 边框 | `#D8C4A4` |
| `--color-dark` | 深色区背景 | `#181512` |
| `--color-dark-soft` | 深棕渐变辅助 | `#2A211B` |
| `--color-white` | 白色 | `#FFFFFF` |
| `--color-error` | 错误状态 | `#C84532` |
| `--color-success` | 成功状态 | `#4F8A62` |
| `--color-warning` | 警告状态 | `#C9903D` |

### 3.2 使用规则

#### 页面背景

全站默认背景使用：

```css
background: #F6F1E8;
```

不要使用纯白作为大面积页面背景。纯白只用于卡片、弹窗、表单内部，以形成层级。

#### 主按钮和重点数字

主按钮、关键数字、重要状态使用金色：

```css
#B38A56
```

hover 使用：

```css
#9C7443
```

#### 深色区域

顶部导航、底部 CTA、强品牌模块可以使用深色：

```css
#181512
```

深色区域中的文字使用：

```css
主文字：#FFFDF9
辅助文字：rgba(255, 253, 249, 0.72)
强调文字：#D8C4A4
```

### 3.3 禁止使用

不建议出现以下颜色：

- 大面积纯黑 `#000000`
- 大面积纯白 `#FFFFFF`
- 高饱和红、蓝、绿、紫
- 电商促销橙红色
- 过亮香槟金
- 多种金色混用

---

## 4. 字体系统 Typography

### 4.1 字体选择

中文优先：

```txt
思源黑体 / Source Han Sans / Noto Sans SC / PingFang SC / Microsoft YaHei
```

英文字体优先：

```txt
Inter / Source Sans 3 / Helvetica Neue / Arial
```

品牌标题可使用衬线字体作为点缀：

```txt
Playfair Display / Cormorant Garamond / Georgia
```

> 注意：不要全站大面积使用衬线字体。衬线字体只用于品牌名、Hero 大标题、编辑感标题。

### 4.2 字体层级

| Token | 场景 | 字号 / 行高 / 字重 |
|---|---|---|
| `text-display` | 首页 Hero 超大标题 | `64px / 72px / 700` |
| `text-h1` | 页面主标题 | `56px / 64px / 700` |
| `text-h2` | 模块标题 | `36px / 44px / 600` |
| `text-h3` | 卡片组标题 | `24px / 32px / 600` |
| `text-h4` | 卡片标题 | `20px / 28px / 600` |
| `text-body-lg` | 重要正文 | `18px / 30px / 400` |
| `text-body` | 常规正文 | `16px / 28px / 400` |
| `text-body-sm` | 次级正文 | `14px / 22px / 400` |
| `text-caption` | 说明文字 | `13px / 20px / 400` |
| `text-label` | 表单标签 / 小标题 | `14px / 20px / 500` |
| `text-button` | 按钮文字 | `15px / 20px / 500` |
| `text-nav` | 导航文字 | `14px / 20px / 500` |

### 4.3 标题规则

#### Hero 标题

桌面端：

```css
font-size: 56px;
line-height: 64px;
font-weight: 700;
letter-spacing: -0.03em;
```

移动端：

```css
font-size: 38px;
line-height: 46px;
```

#### 模块标题

```css
font-size: 36px;
line-height: 44px;
font-weight: 600;
letter-spacing: -0.02em;
```

#### 卡片标题

```css
font-size: 20px;
line-height: 28px;
font-weight: 600;
```

### 4.4 文案行宽

长文案最大宽度建议：

```css
max-width: 640px;
```

正文不要横跨整屏，否则阅读体验差。

---

## 5. 间距系统 Spacing

采用 8pt 栅格系统。

| Token | 数值 | 用途 |
|---|---:|---|
| `space-1` | 4px | 极小间距 / 图标微调 |
| `space-2` | 8px | 标签间距 / 小组件内部间距 |
| `space-3` | 12px | 图标与文字间距 |
| `space-4` | 16px | 小卡片 padding / 列表间距 |
| `space-5` | 20px | 表单列间距 / 卡片内局部间距 |
| `space-6` | 24px | 标准卡片 padding |
| `space-8` | 32px | 模块内部大间距 |
| `space-10` | 40px | 页面左右 padding |
| `space-12` | 48px | 模块标题到底部内容间距 |
| `space-16` | 64px | 中等模块间距 |
| `space-18` | 72px | 页面区块间距 |
| `space-24` | 96px | 大型模块间距 |
| `space-28` | 112px | 首页大区块间距 |

### 5.1 页面容器

桌面端：

```css
max-width: 1200px;
padding-left: 40px;
padding-right: 40px;
```

大屏端：

```css
max-width: 1280px;
```

移动端：

```css
padding-left: 20px;
padding-right: 20px;
```

### 5.2 模块间距

页面 Section 之间：

```css
margin-top: 88px 或 96px;
```

模块标题到内容：

```css
margin-bottom: 40px 或 48px;
```

卡片之间：

```css
gap: 24px;
```

---

## 6. 圆角系统 Radius

| Token | 数值 | 用途 |
|---|---:|---|
| `radius-sm` | 8px | 标签、小按钮、小图标容器 |
| `radius-md` | 12px | 输入框、按钮、FAQ item |
| `radius-lg` | 16px | 标准卡片、图片 |
| `radius-xl` | 20px | 大卡片、Hero 图片组 |
| `radius-2xl` | 24px | 大型 CTA、弹窗、重点模块 |
| `radius-full` | 999px | 胶囊按钮、头像、圆形图标 |

### 使用规则

- 输入框统一 `12px`
- 按钮统一 `12px`
- 标准卡片统一 `16px`
- 大型区块统一 `20px` 或 `24px`
- 图片圆角不得混乱，同一模块中图片圆角必须一致

---

## 7. 阴影系统 Shadow

### 7.1 默认卡片阴影

```css
box-shadow:
  0 1px 2px rgba(24, 21, 18, 0.04),
  0 8px 24px rgba(24, 21, 18, 0.06);
```

### 7.2 Hover 悬浮阴影

```css
box-shadow:
  0 12px 32px rgba(24, 21, 18, 0.10),
  0 24px 64px rgba(24, 21, 18, 0.08);
```

### 7.3 弹窗阴影

```css
box-shadow:
  0 24px 80px rgba(24, 21, 18, 0.18);
```

### 7.4 使用原则

- 不要使用浓重黑色阴影。
- 阴影要非常轻，体现层级，不要产生廉价卡片感。
- Hover 状态可以上浮 2px，但不要大幅移动。

---

## 8. 栅格系统 Grid

### 8.1 页面主栅格

桌面端采用 12 栅格：

```css
display: grid;
grid-template-columns: repeat(12, 1fr);
gap: 24px;
```

### 8.2 常用布局

#### Hero 区域

```txt
左侧文案：5 columns
右侧视觉：7 columns
```

#### 四卡片布局

```css
grid-template-columns: repeat(4, 1fr);
gap: 24px;
```

#### 三卡片布局

```css
grid-template-columns: repeat(3, 1fr);
gap: 24px;
```

#### 表单双列布局

```css
grid-template-columns: repeat(2, 1fr);
column-gap: 20px;
row-gap: 20px;
```

### 8.3 响应式断点

| Breakpoint | 宽度 | 规则 |
|---|---:|---|
| `desktop-xl` | `1440px+` | 主容器 1200–1280px 居中 |
| `desktop` | `1024px–1439px` | 12 栅格，侧边栏固定 |
| `tablet` | `768px–1023px` | 8 栅格，侧边栏可收起 |
| `mobile` | `<768px` | 单列布局，隐藏桌面侧边栏 |

---

## 9. 图标系统 Icons

### 9.1 风格

图标统一使用线性图标，不使用多套风格混合。

推荐：

```txt
Lucide Icons / Phosphor Icons / Remix Icons
```

### 9.2 规格

| 场景 | 尺寸 | 线宽 |
|---|---:|---:|
| 顶部导航 icon | 18px | 1.5px |
| 侧边栏 icon | 18px | 1.5px |
| 卡片功能 icon | 24px | 1.5px |
| 大功能 icon | 28px / 32px | 1.5px |

### 9.3 图标容器

功能卡片图标容器：

```css
width: 44px;
height: 44px;
border-radius: 12px;
background: #EFE3D0;
color: #B38A56;
```

---

## 10. 图片系统 Images

### 10.1 图片风格

图片应偏向：

- 高级女装大片
- 柔和自然光
- 米色 / 奶油 / 黑金 / 东方纹样环境
- 模特姿态自然
- 服装纹样清晰
- 背景干净，有时装编辑感

避免：

- 淘宝低价感
- 过度磨皮
- 过度饱和
- 红色大字促销图
- 杂乱背景
- AI 味太重的脸部和手部

### 10.2 图片比例

| 场景 | 推荐比例 |
|---|---|
| Hero 模特图 | `3:4` / `4:5` |
| 作品卡片 | `3:4` |
| 横幅图 | `16:9` / `21:9` |
| 头像 | `1:1` |
| 工具生成预览 | `1:1` / `3:4` |

### 10.3 图片圆角

```css
border-radius: 16px 或 20px;
```

同一模块内不要混用太多圆角。

---

## 11. 动效系统 Motion

### 11.1 基础动效

```css
transition-duration: 180ms;
transition-timing-function: ease-out;
```

### 11.2 Hover 动效

卡片 hover：

```css
transform: translateY(-2px);
border-color: #D8C4A4;
```

按钮 hover：

```css
background: #9C7443;
```

FAQ 展开：

```css
transition: max-height 240ms ease-out, opacity 180ms ease-out;
```

### 11.3 禁止动效

- 大幅弹跳
- 旋转过多
- 过慢动画
- 页面元素频繁闪动
- 鼠标经过就大面积变色

---

# Part 2｜组件规范 Component Spec

---

## 1. Layout 页面布局组件

### 1.1 AppShell

用于所有登录后工作台页面。

#### 结构

```txt
AppShell
├── Header
├── Sidebar
└── MainContent
```

#### 规则

- Header 固定在顶部，`height: 72px`
- Sidebar 固定在左侧，`width: 220px`
- MainContent 根据 Sidebar 自动留出左边距
- Header 和 Sidebar 不跟随内容重复渲染
- 页面内容在 MainContent 内滚动

#### 桌面端尺寸

```css
.header {
  height: 72px;
}

.sidebar {
  width: 220px;
}

.main {
  margin-left: 220px;
  padding-top: 72px;
}
```

#### 移动端规则

- Sidebar 收起为抽屉
- Header 保留 Logo、菜单按钮、主要 CTA
- MainContent 单列展示

---

## 2. Header 顶部导航

### 2.1 用途

用于全站顶部主导航，承载品牌、一级导航、搜索、通知、用户入口、核心 CTA。

### 2.2 结构

```txt
Header
├── Logo
├── MainNav
├── HeaderActions
│   ├── SearchButton
│   ├── NotificationButton
│   ├── UserAvatar
│   └── PrimaryActionButton
```

### 2.3 尺寸

```css
height: 72px;
padding: 0 32px;
```

### 2.4 样式

```css
background: #181512;
color: #FFFDF9;
border-bottom: 1px solid rgba(255, 255, 255, 0.08);
```

### 2.5 Logo

```css
font-size: 20px;
font-weight: 700;
letter-spacing: -0.02em;
```

`AI` 可使用金色：

```css
color: #D8C4A4;
```

### 2.6 导航项

```css
font-size: 14px;
font-weight: 500;
height: 72px;
display: flex;
align-items: center;
gap: 36px;
```

### 2.7 当前选中状态

```css
color: #FFFDF9;
position: relative;
```

下划线：

```css
height: 2px;
background: #B38A56;
bottom: 0;
```

### 2.8 交互状态

| 状态 | 样式 |
|---|---|
| default | `color: rgba(255,255,255,0.72)` |
| hover | `color: #FFFDF9` |
| active | `color: #FFFDF9` + 金色下划线 |

---

## 3. Sidebar 左侧导航

### 3.1 用途

用于 AI Studio 和设计师工作台的二级导航。

### 3.2 结构

```txt
Sidebar
├── SidebarBrand
├── SidebarGroup 工作台
│   ├── NavItem 工具中心
│   ├── NavItem 我的项目
│   ├── NavItem 我的设计
│   └── NavItem 收藏夹
├── SidebarGroup 发现
│   ├── NavItem 灵感趋势
│   └── NavItem 品牌资料库
├── SidebarGroup 工具
│   ├── NavItem 图案工作室
│   ├── NavItem 款式实验室
│   └── NavItem AI 试衣间
├── SidebarGroup 账户
│   ├── NavItem 设置
│   └── NavItem 帮助中心
└── SidebarPromoCard
```

### 3.3 尺寸

```css
width: 220px;
padding: 24px 16px;
```

### 3.4 样式

```css
background: #F8F5F0;
border-right: 1px solid #E7DED2;
```

### 3.5 分组标题

```css
font-size: 12px;
line-height: 16px;
font-weight: 600;
letter-spacing: 0.08em;
text-transform: uppercase;
color: #A39A91;
margin-bottom: 8px;
```

### 3.6 菜单项

```css
height: 40px;
padding: 0 12px;
border-radius: 8px;
display: flex;
align-items: center;
gap: 10px;
font-size: 14px;
color: #6F665E;
```

### 3.7 菜单状态

| 状态 | 样式 |
|---|---|
| default | 背景透明，文字 `#6F665E` |
| hover | 背景 `#EFE3D0`，文字 `#1E1B18` |
| active | 背景 `#EAD8BC`，文字 `#1E1B18`，左侧 3px 金色条 |

### 3.8 开发注意

- 禁止在不同页面重复写 Sidebar。
- Sidebar 必须是全站唯一 Layout 组件。
- 不允许出现当前截图中那种重复菜单列表。
- 当前页面对应菜单必须高亮。

---

## 4. Button 按钮组件

### 4.1 类型

| 类型 | 用途 |
|---|---|
| Primary Button | 主要转化动作，例如“立即申请入驻”“开始设计” |
| Secondary Button | 次要动作，例如“了解更多”“先体验工具” |
| Ghost Button | 弱操作，例如“取消”“返回” |
| Text Button | 文本链接类操作 |
| Icon Button | 搜索、通知、更多操作 |

### 4.2 Primary Button

```css
height: 48px;
padding: 0 24px;
border-radius: 12px;
background: #B38A56;
color: #FFFFFF;
font-size: 15px;
font-weight: 500;
```

#### 状态

| 状态 | 样式 |
|---|---|
| default | `background: #B38A56` |
| hover | `background: #9C7443; transform: translateY(-1px)` |
| active | `transform: translateY(0)` |
| disabled | `background: #D8D0C6; color: #A39A91; cursor: not-allowed` |
| loading | 显示 loading icon，文字可变为“提交中...” |

### 4.3 Secondary Button

```css
height: 48px;
padding: 0 24px;
border-radius: 12px;
background: #FFFDF9;
border: 1px solid #E7DED2;
color: #1E1B18;
```

Hover：

```css
border-color: #D8C4A4;
background: #FBF7F0;
```

### 4.4 Icon Button

```css
width: 36px;
height: 36px;
border-radius: 999px;
display: flex;
align-items: center;
justify-content: center;
```

顶部深色导航中：

```css
background: rgba(255, 255, 255, 0.06);
color: rgba(255, 255, 255, 0.8);
```

---

## 5. Card 卡片组件

### 5.1 Base Card

```css
background: #FFFDF9;
border: 1px solid #E7DED2;
border-radius: 16px;
padding: 24px;
box-shadow: 0 1px 2px rgba(24, 21, 18, 0.04);
```

### 5.2 Hover Card

```css
transition: all 180ms ease-out;
```

Hover：

```css
transform: translateY(-2px);
border-color: #D8C4A4;
box-shadow: 0 12px 32px rgba(24, 21, 18, 0.10);
```

### 5.3 Feature Card 功能优势卡片

#### 结构

```txt
FeatureCard
├── IconBox
├── Title
└── Description
```

#### 尺寸

```css
padding: 24px;
min-height: 180px;
```

#### 标题

```css
font-size: 20px;
line-height: 28px;
font-weight: 600;
```

#### 描述

```css
font-size: 14px;
line-height: 22px;
color: #6F665E;
```

---

## 6. SectionHeader 模块标题组件

### 6.1 用途

用于每个页面 section 的标题区域，统一模块层级。

### 6.2 结构

```txt
SectionHeader
├── Eyebrow
├── Title
└── Description
```

### 6.3 Eyebrow 小标签

```css
font-size: 13px;
line-height: 20px;
font-weight: 600;
letter-spacing: 0.08em;
color: #B38A56;
text-transform: uppercase;
```

### 6.4 Title

```css
font-size: 36px;
line-height: 44px;
font-weight: 600;
color: #1E1B18;
```

### 6.5 Description

```css
font-size: 16px;
line-height: 28px;
color: #6F665E;
max-width: 640px;
```

### 6.6 对齐方式

- 首页、入驻页：可居中
- 工作台、工具页：左对齐
- 表单、FAQ：根据上下文决定，建议居中或左对齐统一

---

## 7. Form 表单组件

### 7.1 表单整体

```css
display: grid;
grid-template-columns: repeat(2, 1fr);
column-gap: 20px;
row-gap: 20px;
```

移动端：

```css
grid-template-columns: 1fr;
```

### 7.2 Label

```css
font-size: 14px;
line-height: 20px;
font-weight: 500;
color: #1E1B18;
margin-bottom: 8px;
```

必填星号：

```css
color: #C84532;
margin-left: 2px;
```

### 7.3 Input

```css
height: 48px;
padding: 0 14px;
border-radius: 12px;
border: 1px solid #E7DED2;
background: #FFFDF9;
font-size: 14px;
color: #1E1B18;
```

Placeholder：

```css
color: #A39A91;
```

### 7.4 Focus 状态

```css
border-color: #B38A56;
box-shadow: 0 0 0 3px rgba(179, 138, 86, 0.14);
outline: none;
```

### 7.5 Error 状态

```css
border-color: #C84532;
box-shadow: 0 0 0 3px rgba(200, 69, 50, 0.10);
```

错误提示：

```css
font-size: 12px;
line-height: 18px;
color: #C84532;
margin-top: 6px;
```

### 7.6 Textarea

```css
min-height: 120px;
padding: 14px;
resize: vertical;
```

### 7.7 Select

与 Input 同尺寸。右侧使用统一 chevron icon。

### 7.8 Checkbox

```css
width: 16px;
height: 16px;
border-radius: 4px;
border: 1px solid #D8C4A4;
```

选中：

```css
background: #B38A56;
border-color: #B38A56;
```

### 7.9 表单提交区

```css
display: flex;
align-items: center;
gap: 12px;
margin-top: 24px;
```

协议提示靠近提交按钮，不要放太远。

---

## 8. FAQ Accordion 手风琴组件

### 8.1 结构

```txt
FAQAccordion
└── FAQItem
    ├── QuestionRow
    │   ├── Question
    │   └── ChevronIcon
    └── Answer
```

### 8.2 Item 样式

```css
background: #FFFDF9;
border: 1px solid #E7DED2;
border-radius: 12px;
```

### 8.3 Question Row

```css
min-height: 64px;
padding: 0 20px;
display: flex;
align-items: center;
justify-content: space-between;
font-size: 16px;
font-weight: 500;
```

### 8.4 Answer

```css
padding: 0 20px 20px;
font-size: 14px;
line-height: 24px;
color: #6F665E;
```

### 8.5 状态

| 状态 | 样式 |
|---|---|
| collapsed | 只显示问题行 |
| expanded | 显示答案，chevron 旋转 180° |
| hover | 背景 `#FBF7F0` |

### 8.6 交互

- 点击整行展开，不只点击图标。
- 默认可只展开一个问题。
- 展开动画 240ms。

---

## 9. TestimonialCard 设计师案例卡片

### 9.1 用途

用于入驻页、首页、设计师社区页展示社会证明和收益案例。

### 9.2 结构

```txt
TestimonialCard
├── UserInfo
│   ├── Avatar
│   ├── Name
│   └── Role / Location
├── Quote
└── Stats
    ├── WorksCount
    └── Revenue
```

### 9.3 样式

```css
padding: 24px;
border-radius: 16px;
border: 1px solid #E7DED2;
background: #FFFDF9;
```

### 9.4 Avatar

```css
width: 56px;
height: 56px;
border-radius: 999px;
object-fit: cover;
```

### 9.5 Name

```css
font-size: 20px;
font-weight: 600;
color: #1E1B18;
```

### 9.6 Role

```css
font-size: 14px;
color: #A39A91;
```

### 9.7 Quote

```css
font-size: 15px;
line-height: 26px;
color: #6F665E;
margin-top: 18px;
```

### 9.8 Stats

```css
display: flex;
gap: 16px;
margin-top: 20px;
```

收益数字：

```css
font-size: 20px;
font-weight: 700;
color: #B38A56;
```

---

## 10. StatsCard 数据卡片

### 10.1 用途

展示核心数据，例如设计师数量、平台曝光、审核周期、收益比例。

### 10.2 结构

```txt
StatsCard
├── Value
└── Label
```

### 10.3 Value

```css
font-size: 32px;
line-height: 40px;
font-weight: 700;
color: #B38A56;
```

### 10.4 Label

```css
font-size: 13px;
line-height: 20px;
color: #6F665E;
```

### 10.5 使用规则

- 数据不能太多，一组最多 4 个。
- 数字要比说明文字明显。
- 数据之间可以用竖线或卡片分隔。

---

## 11. Stepper 入驻流程组件

### 11.1 用途

展示 3–5 步流程，例如入驻流程、设计生成流程、订单流程。

### 11.2 结构

```txt
Stepper
└── StepItem
    ├── StepNode
    ├── Title
    └── Description
```

### 11.3 StepNode

```css
width: 44px;
height: 44px;
border-radius: 999px;
background: #FFFDF9;
border: 1px solid #B38A56;
color: #B38A56;
font-size: 14px;
font-weight: 600;
```

当前步骤：

```css
background: #B38A56;
color: #FFFFFF;
```

### 11.4 连接线

```css
height: 1px;
background: #D8C4A4;
```

### 11.5 标题

```css
font-size: 16px;
font-weight: 600;
color: #1E1B18;
```

### 11.6 描述

```css
font-size: 14px;
line-height: 22px;
color: #6F665E;
max-width: 220px;
```

---

## 12. CTASection 底部转化组件

### 12.1 用途

用于页面底部收口，引导用户申请入驻、开始设计、注册或购买。

### 12.2 结构

```txt
CTASection
├── TextBlock
│   ├── Eyebrow optional
│   ├── Title
│   └── Description
├── CTAButton
└── BenefitList optional
```

### 12.3 样式

```css
background: linear-gradient(135deg, #181512 0%, #2A211B 100%);
border-radius: 24px;
padding: 48px 56px;
color: #FFFDF9;
```

### 12.4 标题

```css
font-size: 32px;
line-height: 42px;
font-weight: 600;
```

### 12.5 描述

```css
font-size: 16px;
line-height: 28px;
color: rgba(255, 253, 249, 0.72);
```

### 12.6 CTA 按钮

深色背景上的主按钮可以使用浅金色：

```css
background: #D8C4A4;
color: #181512;
```

Hover：

```css
background: #EAD8BC;
```

---

## 13. Badge 标签组件

### 13.1 用途

用于状态、分类、权益标签、模块 eyebrow。

### 13.2 样式

```css
height: 28px;
padding: 0 10px;
border-radius: 999px;
font-size: 13px;
font-weight: 500;
```

### 13.3 类型

| 类型 | 背景 | 文字 |
|---|---|---|
| Gold | `#EFE3D0` | `#9C7443` |
| Neutral | `#F2EEE8` | `#6F665E` |
| Dark | `#181512` | `#FFFDF9` |
| Success | `rgba(79,138,98,0.12)` | `#4F8A62` |

---

## 14. Modal 弹窗组件

### 14.1 用途

用于确认操作、登录、表单补充、提示信息。

### 14.2 样式

```css
width: 520px;
max-width: calc(100vw - 40px);
background: #FFFDF9;
border-radius: 24px;
padding: 32px;
box-shadow: 0 24px 80px rgba(24, 21, 18, 0.18);
```

### 14.3 遮罩

```css
background: rgba(24, 21, 18, 0.48);
backdrop-filter: blur(4px);
```

### 14.4 动效

```css
opacity: 0 → 1;
transform: translateY(8px) scale(0.98) → translateY(0) scale(1);
transition: 180ms ease-out;
```

---

## 15. Toast 轻提示组件

### 15.1 用途

用于提交成功、保存成功、失败提示。

### 15.2 样式

```css
background: #181512;
color: #FFFDF9;
border-radius: 12px;
padding: 12px 16px;
font-size: 14px;
box-shadow: 0 12px 32px rgba(24, 21, 18, 0.18);
```

### 15.3 类型

- success
- error
- warning
- info

### 15.4 位置

默认右上角：

```css
top: 88px;
right: 24px;
```

---

# Part 3｜页面级应用规范

---

## 1. 首页 Home Page

### 目标

让用户快速理解 MaxLuLu AI 是什么，并进入核心路径：浏览灵感、开始设计、加入设计师计划。

### 必备模块

1. Header
2. Hero
3. 平台定位说明
4. 核心功能展示
5. 灵感作品展示
6. AI 工具能力
7. 设计师/消费者路径
8. 社会证明
9. CTA
10. Footer

### 设计重点

- Hero 必须有强视觉图，不要左右割裂。
- 首屏主 CTA 不超过 2 个。
- 不要过度电商化。
- 强调“灵感画廊 × AI 工具 × 参团采购 × 个人定制 × 设计师创业平台”。

---

## 2. 设计师入驻页 Designer Onboarding Page

### 目标

提高设计师申请入驻转化率。

### 必备模块

1. Hero：价值主张 + 数据背书 + CTA
2. 平台优势：4 个核心价值
3. 入驻流程：4 步完成
4. 设计师案例：收益与成长证明
5. 入驻申请表单
6. FAQ
7. Bottom CTA

### 设计重点

- 页面核心是“申请表单”，所有模块都要服务表单转化。
- CTA 在 Hero、表单前、底部都要出现。
- 表单字段不要太多，降低填写压力。
- FAQ 要解决用户顾虑。

---

## 3. 工具中心 Tool Center

### 目标

让设计师快速找到并使用 AI 工具。

### 必备模块

1. 工具分类 Tabs
2. 推荐工具
3. 最近使用
4. 全部工具卡片
5. 工具状态：可用 / 即将上线 / Pro
6. 使用教程入口

### 工具卡片结构

```txt
ToolCard
├── Icon
├── ToolName
├── Description
├── Tags
└── Action
```

### 设计重点

- 工具卡片要清晰区分功能类型。
- 避免 16 个工具堆在一起无分组。
- 需要支持搜索和筛选。

---

## 4. 灵感画廊 Inspiration Gallery

### 目标

提高浏览效率、收藏率和购买/定制转化。

### 必备模块

1. 筛选栏
2. 瀑布流 / Grid
3. 作品卡片
4. 收藏按钮
5. 快速查看
6. 详情页入口

### 作品卡片结构

```txt
DesignCard
├── Image
├── Title
├── Designer
├── Price / Popularity optional
├── Tags
└── Actions
```

### 设计重点

- 图片是第一视觉。
- 卡片信息不要过多。
- hover 时出现操作按钮。
- 筛选要固定或易访问。

---

## 5. 设计师工作台 Dashboard

### 目标

帮助设计师查看数据、管理作品、继续创作。

### 必备模块

1. 欢迎区
2. 数据概览
3. 最近项目
4. 作品表现
5. 推荐工具
6. 待办事项
7. 收益概览

### 设计重点

- 数据卡片层级清晰。
- 操作入口明显。
- 不要把所有信息堆满页面。

---

# Part 4｜Claude Code 开发交付规则

## 1. 必须先做 Design Tokens

在代码中先建立统一 token，不要在页面里直接写大量十六进制颜色。

建议建立：

```txt
src/styles/tokens.css
src/styles/globals.css
src/components/ui/
src/components/layout/
src/components/sections/
```

## 2. Tailwind 配置建议

需要在 Tailwind 中扩展：

```txt
colors
fontSize
spacing
borderRadius
boxShadow
maxWidth
transitionTimingFunction
```

## 3. 组件优先，不要页面堆代码

每个页面必须优先拆成组件：

```txt
Page
├── PageHero
├── SectionHeader
├── FeatureGrid
├── Stepper
├── TestimonialGrid
├── ApplicationForm
├── FAQAccordion
└── CTASection
```

## 4. 禁止事项

- 禁止每个页面写一套 Header。
- 禁止每个页面写一套 Sidebar。
- 禁止组件内大量写死颜色。
- 禁止重复定义按钮样式。
- 禁止用图片代替文字。
- 禁止表单没有 focus / error / disabled 状态。
- 禁止只做桌面端不考虑移动端。

## 5. 每次开发完成后的自检清单

Claude Code 每次修改完成后必须自检：

```txt
1. 是否使用统一 design tokens？
2. 是否复用 Header / Sidebar / Button / Card / Form 组件？
3. 页面容器是否统一 max-width 1200px？
4. section 间距是否统一？
5. 字体层级是否符合规范？
6. 卡片圆角、描边、阴影是否统一？
7. hover / focus / active / disabled 状态是否完整？
8. 移动端是否可用？
9. 是否存在重复代码？
10. 是否通过 lint 和 build？
```

---

# Part 5｜推荐 CSS Variables

```css
:root {
  --color-bg: #F6F1E8;
  --color-surface: #FFFDF9;
  --color-surface-soft: #FBF7F0;
  --color-primary: #B38A56;
  --color-primary-hover: #9C7443;
  --color-primary-soft: #EFE3D0;
  --color-text-primary: #1E1B18;
  --color-text-secondary: #6F665E;
  --color-text-muted: #A39A91;
  --color-border: #E7DED2;
  --color-border-strong: #D8C4A4;
  --color-dark: #181512;
  --color-dark-soft: #2A211B;
  --color-error: #C84532;
  --color-success: #4F8A62;
  --color-warning: #C9903D;

  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  --radius-2xl: 24px;
  --radius-full: 999px;

  --shadow-card: 0 1px 2px rgba(24, 21, 18, 0.04), 0 8px 24px rgba(24, 21, 18, 0.06);
  --shadow-hover: 0 12px 32px rgba(24, 21, 18, 0.10), 0 24px 64px rgba(24, 21, 18, 0.08);
  --shadow-modal: 0 24px 80px rgba(24, 21, 18, 0.18);

  --container-max: 1200px;
  --header-height: 72px;
  --sidebar-width: 220px;
}
```

---

# Part 6｜推荐 Tailwind Token 映射

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        bg: '#F6F1E8',
        surface: '#FFFDF9',
        'surface-soft': '#FBF7F0',
        primary: '#B38A56',
        'primary-hover': '#9C7443',
        'primary-soft': '#EFE3D0',
        'text-primary': '#1E1B18',
        'text-secondary': '#6F665E',
        'text-muted': '#A39A91',
        border: '#E7DED2',
        'border-strong': '#D8C4A4',
        dark: '#181512',
        'dark-soft': '#2A211B',
        error: '#C84532',
        success: '#4F8A62',
        warning: '#C9903D',
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        '2xl': '24px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(24, 21, 18, 0.04), 0 8px 24px rgba(24, 21, 18, 0.06)',
        hover: '0 12px 32px rgba(24, 21, 18, 0.10), 0 24px 64px rgba(24, 21, 18, 0.08)',
        modal: '0 24px 80px rgba(24, 21, 18, 0.18)',
      },
      maxWidth: {
        container: '1200px',
      }
    }
  }
}
```

---

# Part 7｜给 Claude Code 的执行提示词

```txt
你现在是 MaxLuLu AI 项目的高级前端工程师和 UI 实现专家。

请严格按照《MaxLuLu AI Design System 设计系统文档 & 组件规范 Component Spec》执行开发。

核心要求：
1. 先建立全局 design tokens，不允许在页面中随意写死颜色、圆角、阴影。
2. 复用统一 Header、Sidebar、Button、Card、Input、Select、Textarea、SectionHeader、FAQAccordion、CTASection 等组件。
3. 页面主容器最大宽度 1200px，左右 padding 桌面端 40px，移动端 20px。
4. 全站采用 8pt spacing 系统。
5. Header 高度 72px，Sidebar 宽度 220px。
6. 所有卡片使用白色 surface、1px border、16px radius、轻阴影。
7. 主按钮使用 #B38A56，hover 使用 #9C7443。
8. 表单输入框高度 48px，圆角 12px，focus 时金色边框和低透明外发光。
9. 所有 hover 动效 180ms ease-out。
10. 移动端必须可用，不能只做桌面端。

开发顺序：
1. 检查当前项目结构。
2. 建立或更新 design tokens。
3. 重构基础 UI 组件。
4. 重构 Layout：Header + Sidebar + MainContent。
5. 再逐页优化页面。
6. 完成后运行 lint 和 build。
7. 输出修改文件清单和风险说明。

不要大改业务逻辑，不要删除已有功能。只做 UI、组件、样式、交互体验和响应式优化。
```

