# MaxLuLu AI 组件视觉样例、页面线框图与 Claude Code 页面复刻任务单

> 适用范围：MaxLuLu AI P0 核心页面 + 关键 P1 页面  
> 目标：让 Claude Code 不再“凭感觉优化”，而是严格按 Design System、组件样例和页面线框图一比一复刻。

---

# Part 1｜《组件视觉样例 Component Visual Samples》

## 0. 全局实现前提

所有组件必须基于 Design System，不允许在页面中随意写死颜色、圆角、阴影、字体。

### 基础 Token

```txt
Background: #F6F1E8
Surface: #FFFDF9
Surface Soft: #FBF7F0
Primary Gold: #B38A56
Gold Hover: #9C7443
Primary Soft: #EFE3D0
Text Primary: #1E1B18
Text Secondary: #6F665E
Text Muted: #A39A91
Border: #E7DED2
Border Strong: #D8C4A4
Dark: #181512
Dark Soft: #2A211B
Error: #C84532
Success: #4F8A62
Warning: #C9903D
```

### 通用类名约定

```txt
页面背景：bg-bg
卡片背景：bg-surface
浅模块背景：bg-surface-soft
主按钮：bg-primary hover:bg-primary-hover
主文字：text-text-primary
次文字：text-text-secondary
弱文字：text-text-muted
默认描边：border-border
强描边：border-border-strong
深色模块：bg-dark
```

---

## 1. Header 顶部导航

### 组件名称

```txt
Header / ConsumerHeader / StudioHeader
```

### 使用场景

- 消费者前台页面：`/`、`/products`、`/products/[id]`、`/group-buy/[id]`、`/my`
    
- Studio 页面：`/studio/*`
    
- `/studio/join` 使用 PublicJoinHeader，不显示 Studio Sidebar
    

### 结构

```txt
Header
├── LogoArea
│   ├── LogoText: MaxLuLu AI
│   └── SubLabel optional
├── Navigation optional
├── SearchButton
├── NotificationButton optional
├── UserAvatar / LoginButton
└── PrimaryActionButton
```

### 尺寸

```txt
height: 72px
padding-x: 32px desktop / 20px mobile
Logo width: auto
Nav item gap: 36px
Icon button: 36px × 36px
Primary action height: 40px
```

### 颜色

```txt
background: #181512
text default: rgba(255,253,249,0.72)
text active: #FFFDF9
active underline: #B38A56
primary action background: #B38A56
primary action hover: #9C7443
border-bottom: rgba(255,255,255,0.08)
```

### 状态

```txt
default: 导航文字 72% 白
hover: 导航文字变 #FFFDF9
active: 导航文字 #FFFDF9 + 底部 2px 金色线
sticky: 页面滚动时固定顶部
mobile: 隐藏完整 nav，显示菜单按钮
```

### 交互

- Header 始终 sticky top-0。
    
- StudioHeader 顶部只放：Logo、搜索、通知、头像、新建设计。
    
- Studio 主导航全部交给 Sidebar，不在 Header 里重复。
    

### Tailwind class 建议

```txt
header:
sticky top-0 z-50 h-[72px] bg-dark border-b border-white/10

inner:
h-full px-8 max-w-none flex items-center justify-between

nav:
h-full hidden lg:flex items-center gap-9

nav item:
relative h-full flex items-center text-sm font-medium text-white/70 hover:text-white transition-colors

active underline:
after:absolute after:left-0 after:right-0 after:bottom-0 after:h-[2px] after:bg-primary

icon button:
h-9 w-9 rounded-full bg-white/5 hover:bg-white/10 text-white/75 hover:text-white transition
```

### React 组件拆分建议

```txt
components/layout/Header.tsx
components/layout/ConsumerHeader.tsx
components/layout/StudioHeader.tsx
components/layout/PublicJoinHeader.tsx
components/ui/IconButton.tsx
components/ui/UserAvatar.tsx
```

---

## 2. Sidebar 侧边栏

### 组件名称

```txt
StudioSidebar
```

### 使用场景

所有真正的 Studio 工作台页面：

```txt
/studio
/studio/dashboard
/studio/publish
/studio/pattern/*
/studio/fashion/*
/studio/projects
/studio/designs
/studio/settings
```

不用于：

```txt
/studio/join
```

### 结构

```txt
StudioSidebar
├── SidebarBrand
├── SidebarGroup 工作台
│   ├── 工具中心
│   ├── 设计师中心
│   ├── 我的项目
│   ├── 我的设计
│   └── 发布设计
├── SidebarGroup 资源
│   └── 灵感库
├── SidebarGroup 工具
│   ├── 图案工作室 expandable
│   └── 服装实验室 expandable
├── SidebarGroup 账户
│   └── 设置
└── SidebarPromoCard optional
```

### 尺寸

```txt
width: 220px
padding: 24px 16px
menu item height: 40px
menu radius: 8px
icon size: 18px
icon/text gap: 10px
group margin-bottom: 24px
```

### 颜色

```txt
background: #F8F5F0
border-right: #E7DED2
section label: #A39A91
menu text: #6F665E
menu hover bg: #EFE3D0
menu active bg: #EAD8BC
menu active text: #1E1B18
active left bar: #B38A56
```

### 状态

```txt
default: 透明背景 + 次级文字
hover: 浅金背景 + 主文字
active: 浅金加深背景 + 左侧 3px 金色条
collapsed: 宽度 72px，只显示 icon
expanded: 宽度 220px，显示完整文字
```

### 交互

- 图案工作室、服装实验室可展开/收起。
    
- 当前路由对应菜单必须 active。
    
- Sidebar 自身可滚动，主内容独立滚动。
    

### Tailwind class 建议

```txt
sidebar:
fixed left-0 top-[72px] bottom-0 z-40 w-[220px] bg-[#F8F5F0] border-r border-border px-4 py-6 overflow-y-auto

group label:
px-3 mb-2 text-[12px] leading-4 font-semibold tracking-[0.08em] uppercase text-text-muted

nav item:
relative h-10 px-3 rounded-lg flex items-center gap-2.5 text-sm text-text-secondary hover:bg-primary-soft hover:text-text-primary transition

active item:
bg-[#EAD8BC] text-text-primary before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[3px] before:rounded-full before:bg-primary
```

### React 组件拆分建议

```txt
components/layout/StudioSidebar.tsx
components/layout/SidebarGroup.tsx
components/layout/SidebarItem.tsx
components/layout/SidebarExpandable.tsx
components/layout/SidebarPromoCard.tsx
```

---

## 3. Button 按钮系统

## 3.1 PrimaryButton

### 使用场景

- 立即申请入驻
    
- 立即支付
    
- 开始设计
    
- 提交申请
    
- 发布设计
    
- 保存作品
    

### 结构

```txt
Button
├── Icon optional
├── Label
└── Spinner optional
```

### 尺寸

```txt
height: 48px
padding: 0 24px
radius: 12px
font-size: 15px
font-weight: 500
```

### 颜色

```txt
background: #B38A56
hover: #9C7443
text: #FFFFFF
disabled background: #D8D0C6
disabled text: #A39A91
```

### 状态

```txt
default: 金色实心
hover: 深金色 + 上浮 1px
active: 回到原位
loading: spinner + 文案“提交中...”
disabled: 灰金色，不可点击
```

### 交互

- loading 时禁止重复点击。
    
- 支付、提交、发布类操作必须有 loading。
    

### Tailwind class 建议

```txt
inline-flex h-12 items-center justify-center gap-2 rounded-md bg-primary px-6 text-[15px] font-medium text-white shadow-sm transition-all duration-180 ease-out hover:-translate-y-px hover:bg-primary-hover disabled:pointer-events-none disabled:bg-[#D8D0C6] disabled:text-text-muted
```

### React 组件拆分建议

```txt
components/ui/Button.tsx
variant: primary | secondary | ghost | text | danger
size: sm | md | lg
props: loading, disabled, iconLeft, iconRight
```

## 3.2 SecondaryButton

### 使用场景

- 了解更多
    
- 先体验工具
    
- 返回
    
- 取消
    

### 尺寸

```txt
height: 48px
padding: 0 24px
radius: 12px
```

### 颜色

```txt
background: #FFFDF9
border: #E7DED2
hover background: #FBF7F0
hover border: #D8C4A4
text: #1E1B18
```

### Tailwind class 建议

```txt
inline-flex h-12 items-center justify-center gap-2 rounded-md border border-border bg-surface px-6 text-[15px] font-medium text-text-primary transition-all duration-180 ease-out hover:border-border-strong hover:bg-surface-soft
```

## 3.3 TextButton

### 使用场景

- 查看详情
    
- 编辑
    
- 删除前的弱入口
    
- 展开更多
    

### Tailwind class 建议

```txt
inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-hover transition-colors
```

## 3.4 IconButton

### 使用场景

- 搜索
    
- 通知
    
- 收藏
    
- 更多
    
- 关闭弹窗
    

### 尺寸

```txt
36px × 36px
radius: 999px
icon: 18px
```

### Tailwind class 建议

```txt
inline-flex h-9 w-9 items-center justify-center rounded-full border border-transparent text-text-secondary transition hover:bg-primary-soft hover:text-text-primary
```

---

## 4. Card 卡片系统

## 4.1 BaseCard

### 使用场景

所有页面内容容器。

### 结构

```txt
Card
├── CardHeader optional
├── CardContent
└── CardFooter optional
```

### 尺寸

```txt
padding: 24px
radius: 16px
border: 1px
```

### 颜色

```txt
background: #FFFDF9
border: #E7DED2
shadow: soft card shadow
hover border: #D8C4A4
```

### Tailwind class 建议

```txt
rounded-lg border border-border bg-surface p-6 shadow-card transition-all duration-180 ease-out
hover:-translate-y-0.5 hover:border-border-strong hover:shadow-hover
```

### React 组件拆分建议

```txt
components/ui/Card.tsx
Card
CardHeader
CardTitle
CardDescription
CardContent
CardFooter
```

## 4.2 FeatureCard

### 使用场景

平台优势、功能价值、服务说明。

### 结构

```txt
FeatureCard
├── IconBox
├── Title
└── Description
```

### 尺寸

```txt
min-height: 180px
icon box: 44px × 44px
icon size: 24px
padding: 24px
```

### Tailwind class 建议

```txt
rounded-lg border border-border bg-surface p-6 shadow-card transition-all hover:-translate-y-0.5 hover:border-border-strong hover:shadow-hover

icon box:
mb-5 flex h-11 w-11 items-center justify-center rounded-md bg-primary-soft text-primary

title:
text-xl font-semibold text-text-primary

description:
mt-2 text-sm leading-6 text-text-secondary
```

## 4.3 ToolCard

### 使用场景

Studio 工具首页，展示 16 个 AI 工具。

### 结构

```txt
ToolCard
├── IconBox
├── ToolName
├── Description
├── Tags
├── StatusBadge optional
└── ActionArea
```

### 尺寸

```txt
height: 220px 左右
padding: 24px
icon box: 48px × 48px
tags gap: 8px
```

### 状态

```txt
available: 可进入工具
comingSoon: 显示“即将上线”，卡片不可点击或弱点击
pro: 显示 Pro 标签
loading: 骨架屏
```

### Tailwind class 建议

```txt
group rounded-lg border border-border bg-surface p-6 shadow-card transition-all hover:-translate-y-0.5 hover:border-border-strong hover:shadow-hover cursor-pointer
```

### React 组件拆分建议

```txt
components/studio/ToolCard.tsx
components/studio/ToolGrid.tsx
```

## 4.4 DesignCard 作品卡片

### 使用场景

印花衣橱、首页热门作品、收藏列表、我的设计。

### 结构

```txt
DesignCard
├── ImageWrapper
│   ├── Image
│   ├── FavoriteButton
│   └── QuickActions hover
├── Title
├── DesignerName
├── Price / GroupBuyInfo
└── Tags optional
```

### 尺寸

```txt
image ratio: 3:4
card radius: 16px
image radius: 16px
content padding-top: 14px
```

### 状态

```txt
default: 显示图片、标题、设计师、价格/热度
hover: 图片轻微放大 1.03，显示快速操作
favorite active: 金色填充或实心 icon
loading: skeleton
empty image: 占位图
```

### Tailwind class 建议

```txt
group cursor-pointer
image wrapper:
relative aspect-[3/4] overflow-hidden rounded-lg bg-surface-soft border border-border
image:
h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]
content:
mt-3 space-y-1
```

### React 组件拆分建议

```txt
components/product/DesignCard.tsx
components/product/DesignGrid.tsx
components/product/FavoriteButton.tsx
```

---

## 5. SectionHeader 模块标题

### 使用场景

页面每个 section 的标题区域。

### 结构

```txt
SectionHeader
├── Eyebrow optional
├── Title
└── Description optional
```

### 尺寸

```txt
eyebrow: 13px / 20px / 600
title: 36px / 44px / 600
description: 16px / 28px
max-width: 640px
margin-bottom: 40px or 48px
```

### 颜色

```txt
eyebrow: #B38A56
title: #1E1B18
description: #6F665E
```

### Tailwind class 建议

```txt
wrapper center:
mx-auto mb-12 max-w-2xl text-center

eyebrow:
mb-3 text-[13px] font-semibold uppercase tracking-[0.08em] text-primary

title:
text-4xl font-semibold tracking-[-0.02em] text-text-primary

description:
mt-4 text-base leading-7 text-text-secondary
```

### React 组件拆分建议

```txt
components/ui/SectionHeader.tsx
align: left | center
```

---

## 6. Form 表单系统

## 6.1 FormField

### 使用场景

登录、入驻申请、定制下单、提现、发布设计。

### 结构

```txt
FormField
├── Label
├── Input / Select / Textarea
├── HelperText optional
└── ErrorText optional
```

### 尺寸

```txt
input height: 48px
input padding-x: 14px
radius: 12px
label margin-bottom: 8px
row gap: 20px
```

### 颜色

```txt
input bg: #FFFDF9
input border: #E7DED2
focus border: #B38A56
focus shadow: rgba(179,138,86,0.14)
error: #C84532
placeholder: #A39A91
```

### 状态

```txt
default
hover: border #D8C4A4
focus: gold border + soft ring
error: red border + error text
disabled: soft gray bg + muted text
```

### Tailwind class 建议

```txt
label:
mb-2 block text-sm font-medium text-text-primary

input:
h-12 w-full rounded-md border border-border bg-surface px-3.5 text-sm text-text-primary placeholder:text-text-muted transition focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15 disabled:bg-[#F2F0ED] disabled:text-text-muted

error:
mt-1.5 text-xs leading-5 text-error
```

### React 组件拆分建议

```txt
components/ui/FormField.tsx
components/ui/Input.tsx
components/ui/Select.tsx
components/ui/Textarea.tsx
components/ui/Checkbox.tsx
```

## 6.2 ApplicationForm 入驻申请表单

### 结构

```txt
ApplicationForm
├── 2-column fields
│   ├── 姓名
│   ├── 手机号
│   ├── 工作室/个人
│   ├── 邮箱
│   ├── 设计经验
│   └── 作品链接
├── Textarea 自我介绍
├── AgreementCheckbox
└── SubmitArea
```

### Tailwind class 建议

```txt
form grid:
grid grid-cols-1 gap-5 md:grid-cols-2

full width item:
md:col-span-2

submit area:
md:col-span-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between
```

---

## 7. StatsCard 数据卡片

### 使用场景

Hero 数据、参团进度、设计师收益、Dashboard 数据概览。

### 结构

```txt
StatsCard
├── Value
├── Label
└── Trend optional
```

### 尺寸

```txt
padding: 20px
radius: 16px
value: 32px / 40px / 700
label: 13px / 20px
```

### 颜色

```txt
value: #B38A56
label: #6F665E
background: #FFFDF9 or transparent
border: #E7DED2
```

### Tailwind class 建议

```txt
rounded-lg border border-border bg-surface p-5
value: text-[32px] leading-10 font-bold text-primary
label: mt-1 text-[13px] leading-5 text-text-secondary
```

### React 组件拆分建议

```txt
components/ui/StatsCard.tsx
components/ui/StatsGrid.tsx
```

---

## 8. Stepper 流程组件

### 使用场景

入驻流程、发布设计四步、订单流程、参团流程。

### 结构

```txt
Stepper
├── StepItem 01
├── Connector
├── StepItem 02
├── Connector
├── StepItem 03
└── StepItem 04
```

### 尺寸

```txt
node: 44px × 44px
connector: 1px height
step title: 16px / 24px / 600
description: 14px / 22px
```

### 颜色

```txt
active node: #B38A56 + white text
inactive node: #FFFDF9 + #B38A56 border
connector: #D8C4A4
```

### 状态

```txt
completed: 金色实心 + check icon
current: 金色实心 + number
upcoming: 白底金边 + number
```

### Tailwind class 建议

```txt
stepper:
grid grid-cols-1 gap-6 md:grid-cols-4

node:
mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-primary text-sm font-semibold text-primary

active node:
bg-primary text-white
```

### React 组件拆分建议

```txt
components/ui/Stepper.tsx
components/ui/StepItem.tsx
```

---

## 9. FAQAccordion 手风琴

### 使用场景

入驻页、购买页、定制页、帮助中心。

### 结构

```txt
FAQAccordion
└── FAQItem
    ├── QuestionRow
    │   ├── Question
    │   └── Chevron
    └── Answer
```

### 尺寸

```txt
question row min-height: 64px
padding-x: 20px
answer padding: 0 20px 20px
radius: 12px
```

### 颜色

```txt
background: #FFFDF9
border: #E7DED2
hover bg: #FBF7F0
question: #1E1B18
answer: #6F665E
```

### 状态

```txt
collapsed: 只显示问题
expanded: 展示答案，chevron 旋转 180°
hover: 浅背景
```

### Tailwind class 建议

```txt
item:
rounded-md border border-border bg-surface overflow-hidden

button:
flex min-h-16 w-full items-center justify-between px-5 text-left text-base font-medium text-text-primary transition hover:bg-surface-soft

answer:
px-5 pb-5 text-sm leading-6 text-text-secondary
```

### React 组件拆分建议

```txt
components/ui/FAQAccordion.tsx
components/ui/FAQItem.tsx
```

---

## 10. CTASection 底部转化组件

### 使用场景

首页底部、设计师入驻页底部、工具页转化、产品详情转化。

### 结构

```txt
CTASection
├── TextBlock
│   ├── Eyebrow optional
│   ├── Title
│   └── Description
├── BenefitList optional
└── CTAButton
```

### 尺寸

```txt
padding: 48px 56px desktop / 32px 24px mobile
radius: 24px
min-height: 260px
```

### 颜色

```txt
background: linear-gradient(135deg, #181512, #2A211B)
title: #FFFDF9
description: rgba(255,253,249,0.72)
button bg: #D8C4A4
button text: #181512
```

### Tailwind class 建议

```txt
rounded-2xl bg-gradient-to-br from-dark to-dark-soft px-6 py-10 text-white md:px-14 md:py-12
```

### React 组件拆分建议

```txt
components/sections/CTASection.tsx
```

---

## 11. Modal 弹窗

### 使用场景

登录弹窗、提现申请、确认删除、发布确认、支付提示。

### 结构

```txt
Modal
├── Overlay
├── ModalPanel
│   ├── ModalHeader
│   ├── ModalContent
│   └── ModalFooter
```

### 尺寸

```txt
width: 520px
max-width: calc(100vw - 40px)
padding: 32px
radius: 24px
```

### 颜色

```txt
overlay: rgba(24,21,18,0.48)
panel bg: #FFFDF9
shadow: modal shadow
```

### 状态

```txt
open: fade in + translateY 8px to 0
close: fade out
loading: 禁用按钮
```

### Tailwind class 建议

```txt
overlay:
fixed inset-0 z-[100] bg-dark/50 backdrop-blur-sm

panel:
fixed left-1/2 top-1/2 z-[101] w-[520px] max-w-[calc(100vw-40px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-surface p-8 shadow-modal
```

### React 组件拆分建议

```txt
components/ui/Modal.tsx
components/auth/LoginModal.tsx
```

---

## 12. Toast 轻提示

### 使用场景

保存成功、提交失败、支付状态提示、复制邀请码成功。

### 结构

```txt
Toast
├── Icon
├── Message
└── Close optional
```

### 尺寸

```txt
padding: 12px 16px
radius: 12px
font-size: 14px
```

### 颜色

```txt
default bg: #181512
text: #FFFDF9
success icon: #4F8A62
error icon: #C84532
warning icon: #C9903D
```

### Tailwind class 建议

```txt
rounded-md bg-dark px-4 py-3 text-sm text-white shadow-modal
```

### React 组件拆分建议

```txt
components/ui/Toast.tsx
hooks/useToast.ts
```

---

## 13. EmptyState 空状态

### 使用场景

无收藏、无订单、无作品、无搜索结果、无项目。

### 结构

```txt
EmptyState
├── Illustration/Icon
├── Title
├── Description
└── Action optional
```

### 尺寸

```txt
padding: 56px 24px
icon box: 56px × 56px
title: 20px / 28px
description: 14px / 22px
```

### Tailwind class 建议

```txt
flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-surface-soft px-6 py-14 text-center
```

### React 组件拆分建议

```txt
components/ui/EmptyState.tsx
```

---

## 14. Skeleton 加载态

### 使用场景

列表加载、卡片加载、详情加载、Dashboard 数据加载。

### 结构

```txt
SkeletonBlock
SkeletonCard
SkeletonGrid
```

### 颜色

```txt
base: #EFE8DD
highlight: #F8F3EC
```

### Tailwind class 建议

```txt
animate-pulse rounded-md bg-[#EFE8DD]
```

### React 组件拆分建议

```txt
components/ui/Skeleton.tsx
```

---

# Part 2｜《页面线框图 Wireframe Spec》

## 全局页面布局原则

### 消费者页面 PublicLayout

```txt
PublicLayout
├── ConsumerHeader
├── main
│   └── PageSections
└── Footer
```

### Studio 工作台页面 StudioLayout

```txt
StudioLayout
├── StudioHeader
├── StudioSidebar
└── StudioMain
    └── PageContent
```

### 入驻页 PublicJoinLayout

```txt
PublicJoinLayout
├── PublicJoinHeader
├── main
│   └── JoinSections
└── Footer
```

注意：`/studio/join` 保持路由不变，但不显示 StudioSidebar。

---

## P0 页面 1：首页 `/`

### 页面目标

让用户快速理解 MaxLuLu AI 的定位：AI 服装设计灵感画廊 × 参团购买 × 个人定制 × 设计师创业平台，并引导进入印花衣橱、开始定制或设计师入驻。

### Layout

```txt
PublicLayout
```

### 页面结构

```txt
HomePage
├── HeroSection
│   ├── Left: Eyebrow + H1 + Description + CTAGroup
│   └── Right: FashionImageCollage / FeaturedDesignPreview
├── HomeStatsBar
├── HotGroupBuySection
│   ├── SectionHeader
│   └── DesignCardGrid 4 columns
├── InspirationGallerySection
│   ├── SectionHeader
│   ├── CategoryTabs
│   └── DesignCardGrid / Masonry
├── AIStudioIntroSection
│   ├── Left: ToolPreviewCards
│   └── Right: Text + CTA
├── CustomizationSection
│   ├── Image
│   └── Text + ProcessMiniStepper
├── DesignerJoinTeaser
├── TrustSection
└── BottomCTA
```

### 桌面布局

```txt
main container: max-width 1200px, padding-x 40px
Hero: 12 columns, left 5 columns, right 7 columns
HotGroupBuy: 4 columns
Inspiration: 4 columns or masonry
AIStudioIntro: 2 columns, 6 / 6
section spacing: 96px
```

### 移动端布局

```txt
Hero: 单列，图片在文字后
DesignCardGrid: 2 columns mobile / 1 column small mobile
CTAGroup: 垂直排列
section spacing: 64px
```

### 使用组件

```txt
ConsumerHeader
SectionHeader
Button
DesignCard
StatsCard
FeatureCard
Stepper
CTASection
Footer
```

---

## P0 页面 2：印花衣橱 `/products`

### 页面目标

让消费者高效浏览作品、筛选商品、进入详情、收藏或参团购买。

### Layout

```txt
PublicLayout
```

### 页面结构

```txt
ProductsPage
├── ProductsHero
│   ├── Eyebrow
│   ├── H1: 印花衣橱
│   └── Description
├── FilterBar
│   ├── SearchInput
│   ├── CategorySelect
│   ├── FabricSelect
│   ├── SortSelect
│   └── ViewToggle optional
├── ProductsContent
│   ├── ActiveFilterChips
│   ├── ResultCount
│   └── DesignGrid
├── Pagination / LoadMore
└── BottomCTA optional
```

### 桌面布局

```txt
FilterBar: sticky under header optional
DesignGrid: 4 columns, gap 24px
Card image ratio: 3:4
Page container: max-width 1200px
```

### 移动端布局

```txt
FilterBar: 折叠为筛选按钮 + bottom sheet
DesignGrid: 2 columns
Sort: 顶部右侧 dropdown
```

### 使用组件

```txt
ConsumerHeader
SectionHeader
Input
Select
Badge
DesignCard
SkeletonGrid
EmptyState
Pagination
```

---

## P0 页面 3：设计详情 `/products/[id]`

### 页面目标

展示设计作品细节，推动用户参团购买或个人定制。

### Layout

```txt
PublicLayout
```

### 页面结构

```txt
ProductDetailPage
├── Breadcrumb
├── ProductHero
│   ├── Left: ImageGallery
│   │   ├── MainImage
│   │   └── ThumbnailList
│   └── Right: ProductInfoPanel
│       ├── Title
│       ├── DesignerInfo
│       ├── Tags
│       ├── Price / GroupBuyPrice
│       ├── GroupBuyProgressMini
│       ├── CTAGroup: 参团购买 / 定制此款
│       ├── FavoriteShareActions
│       └── ServicePromises
├── ProductDescription
├── FabricAndCraftSection
├── SimilarDesigns
└── BottomStickyPurchaseBar mobile
```

### 桌面布局

```txt
ProductHero: left 7 columns, right 5 columns
ImageGallery sticky optional
InfoPanel sticky top 96px optional
SimilarDesigns: 4 columns
```

### 移动端布局

```txt
Image first, info second
CTA 使用底部 sticky bar
Thumbnails 横向滑动
```

### 使用组件

```txt
Breadcrumb
ImageGallery
Badge
Button
StatsCard
ProgressBar
DesignCard
CTASection
```

---

## P0 页面 4：参团购买 `/group-buy/[id]`

### 页面目标

让用户确认商品、选择尺码、填写地址、使用邀请码、完成支付。

### Layout

```txt
PublicLayout
```

### 页面结构

```txt
GroupBuyPage
├── CheckoutHeader
│   ├── StepIndicator: 选择信息 → 确认支付 → 参团成功
├── MainCheckoutGrid
│   ├── Left: OrderFormCard
│   │   ├── ProductSummary
│   │   ├── SizeSelector
│   │   ├── QuantitySelector optional
│   │   ├── AddressForm
│   │   ├── InvitationCodeInput
│   │   └── Notes optional
│   └── Right: PaymentSummaryCard sticky
│       ├── PriceBreakdown
│       ├── GroupProgress
│       ├── Countdown
│       ├── AgreementCheckbox
│       └── PayButton
├── FAQMini
└── SecurityNotice
```

### 桌面布局

```txt
Left: 8 columns
Right: 4 columns
PaymentSummaryCard sticky top 96px
```

### 移动端布局

```txt
单列
支付汇总变为底部 sticky summary
地址表单字段单列
```

### 使用组件

```txt
Stepper
Card
FormField
Input
Select
RadioGroup
Button
ProgressBar
Countdown
FAQAccordion
LoginModal
Toast
```

---

## P0 页面 5：参团进度 `/group-buy/[id]/progress`

### 页面目标

展示参团进度、剩余时间、参与者、邀请码分享，促进用户拉新。

### Layout

```txt
PublicLayout
```

### 页面结构

```txt
GroupBuyProgressPage
├── ProgressHeroCard
│   ├── StatusBadge
│   ├── CircularProgress
│   ├── CurrentCount / TargetCount
│   ├── Countdown
│   └── StatusMessage
├── ProductSummaryCard
├── ParticipantAvatarList
├── InviteShareCard
│   ├── InviteCode
│   ├── CopyButton
│   ├── ShareButtons
│   └── RewardHint
├── NextStepsStepper
└── RecommendedDesigns
```

### 桌面布局

```txt
Top: ProgressHero centered max-width 760px
Below: 2 columns, ProductSummary 5 columns + InviteShare 7 columns
RecommendedDesigns: 4 columns
```

### 移动端布局

```txt
全部单列
CircularProgress 缩小
分享按钮全宽
```

### 使用组件

```txt
Card
Badge
CircularProgress
Countdown
AvatarGroup
Button
Stepper
DesignCard
Toast
```

---

## P0 页面 6：个人中心 `/my`

### 页面目标

让消费者查看订单、收藏、参团、邀约和账户信息。

### Layout

```txt
PublicLayout
```

### 页面结构

```txt
MyPage
├── AccountHeaderCard
│   ├── Avatar
│   ├── Name / Phone
│   ├── MembershipInfo optional
│   └── QuickStats
├── MyTabs
│   ├── 我的订单
│   ├── 我的收藏
│   ├── 我的参团
│   ├── 我的邀约
│   └── 账号设置
├── TabContent
│   ├── OrderList / FavoriteGrid / GroupBuyList / InviteList / SettingsForm
└── EmptyState for each tab
```

### 桌面布局

```txt
AccountHeader full width
Tabs left aligned
OrderList 单列卡片
FavoriteGrid 4 columns
```

### 移动端布局

```txt
Tabs 横向滚动
订单卡片单列
收藏 2 columns
```

### 使用组件

```txt
Card
Tabs
StatsCard
DesignCard
OrderCard
Badge
Button
EmptyState
FormField
```

---

## P0 页面 7：Studio 工具首页 `/studio`

### 页面目标

让设计师快速找到 AI 工具，继续最近项目，进入创作流程。

### Layout

```txt
StudioLayout
```

### 页面结构

```txt
StudioHomePage
├── StudioWelcomeHeader
│   ├── H1: 欢迎回来
│   ├── Description
│   └── PrimaryCTA: 新建设计
├── QuickStatsGrid
│   ├── 我的设计
│   ├── 已发布
│   ├── 本月生成
│   └── 收益预估 optional
├── RecentProjectsSection
├── ToolCategoryTabs
│   ├── 全部
│   ├── 图案工作室
│   └── 服装实验室
├── ToolGrid
│   ├── ToolCard × tools
└── HelpAndTutorialCard
```

### 桌面布局

```txt
Studio main padding: 32px 40px
ToolGrid: 3 columns or 4 columns depending width
StatsGrid: 4 columns
```

### 移动端布局

```txt
StudioSidebar 抽屉
ToolGrid: 1 column / 2 columns tablet
StatsGrid: 2 columns
```

### 使用组件

```txt
StudioHeader
StudioSidebar
SectionHeader
StatsCard
ToolCard
Tabs
Card
Button
EmptyState
```

---

## P0 页面 8：设计师入驻 `/studio/join`

### 页面目标

作为公开营销页，提升设计师入驻申请转化。

### Layout

```txt
PublicJoinLayout
```

注意：不显示 StudioSidebar，不要求 designer 权限。

### 页面结构

```txt
DesignerJoinPage
├── JoinHero
│   ├── Left: Eyebrow + H1 + Description + CTAGroup
│   └── Right: FashionImageCollage + DarkValueCard
├── JoinStatsBar
├── PlatformBenefits
│   ├── SectionHeader
│   └── FeatureCardGrid 4 columns
├── JoinProcess
│   ├── SectionHeader
│   └── Stepper 4 steps
├── DesignerTestimonials
│   ├── SectionHeader
│   └── TestimonialCardGrid 3 columns
├── ApplicationFormSection
│   ├── SectionHeader
│   └── ApplicationForm
├── FAQSection
│   ├── SectionHeader
│   └── FAQAccordion
└── BottomCTA
```

### 桌面布局

```txt
Hero height: 620–680px
Hero left: 5 columns
Hero right: 7 columns
FeatureGrid: 4 columns
Testimonials: 3 columns
ApplicationForm: max-width 920px, 2 columns
FAQ: max-width 920px
```

### 移动端布局

```txt
Hero 单列
FeatureGrid 单列
Testimonials 单列
ApplicationForm 单列
```

### 使用组件

```txt
PublicJoinHeader
SectionHeader
Button
StatsCard
FeatureCard
Stepper
TestimonialCard
ApplicationForm
FAQAccordion
CTASection
```

---

## P0 页面 9：图案生成 `/studio/pattern/generate`

### 页面目标

让设计师通过 prompt 和参数生成图案，保存结果或发布设计。

### Layout

```txt
StudioLayout
```

### 页面结构

```txt
PatternGeneratePage
├── ToolPageHeader
│   ├── Breadcrumb
│   ├── H1: 图案生成
│   ├── Description
│   └── HelpButton
├── ToolWorkspace
│   ├── LeftPanel: PromptAndSettings
│   │   ├── PromptTextarea
│   │   ├── StyleSelect
│   │   ├── ColorPaletteSelect
│   │   ├── RatioSelect
│   │   ├── QuantitySelect
│   │   └── GenerateButton
│   └── RightPanel: ResultArea
│       ├── EmptyState / LoadingState / ResultGrid
│       ├── ResultCard actions: 保存 / 下载 / 重新生成 / 发布
│       └── GenerationHistory
├── TipsSection optional
└── RecentSavedDesigns optional
```

### 桌面布局

```txt
Workspace: 12 columns
LeftPanel: 4 columns, sticky
RightPanel: 8 columns
ResultGrid: 2 columns
```

### 移动端布局

```txt
LeftPanel 在上，RightPanel 在下
ResultGrid 单列
GenerateButton sticky bottom optional
```

### 使用组件

```txt
StudioHeader
StudioSidebar
ToolPageHeader
FormField
Textarea
Select
Button
ResultCard
Skeleton
EmptyState
Toast
Modal
```

---

## P0 页面 10：线稿成款 `/studio/fashion/render`

### 页面目标

让设计师上传或选择线稿，输入风格和面料信息，生成成衣效果图。

### Layout

```txt
StudioLayout
```

### 页面结构

```txt
FashionRenderPage
├── ToolPageHeader
│   ├── Breadcrumb
│   ├── H1: 线稿成款
│   └── Description
├── ToolWorkspace
│   ├── LeftPanel: InputControls
│   │   ├── UploadSketch
│   │   ├── PromptTextarea
│   │   ├── FabricSelect
│   │   ├── StyleSelect
│   │   ├── ColorSelect
│   │   └── GenerateButton
│   └── RightPanel: RenderResults
│       ├── BeforeAfterPreview optional
│       ├── ResultGrid
│       └── Actions
├── HistorySection
└── PublishHintCard
```

### 桌面布局

```txt
LeftPanel: 4 columns
RightPanel: 8 columns
Upload area height: 220px
ResultGrid: 2 columns
```

### 移动端布局

```txt
单列
上传区全宽
生成结果单列
```

### 使用组件

```txt
UploadDropzone
FormField
Textarea
Select
Button
ResultCard
EmptyState
Skeleton
Toast
```

---

## P1 页面 11：发布设计 `/studio/publish`

### 页面目标

让设计师从已保存作品中选择设计，填写信息，确认定价，提交审核。

### Layout

```txt
StudioLayout
```

### 页面结构

```txt
PublishDesignPage
├── ToolPageHeader
│   ├── H1: 发布设计
│   └── Description
├── PublishStepper
│   ├── 01 选择设计
│   ├── 02 填写信息
│   ├── 03 确认定价
│   └── 04 提交审核
├── PublishFormWorkspace
│   ├── StepContent
│   └── PreviewPanel sticky
├── FooterActions
│   ├── PreviousButton
│   ├── SaveDraftButton
│   └── Next / SubmitButton
```

### Step 1 选择设计

```txt
SavedDesignGrid
Filter: 全部 / 图案 / 服装 / 最近生成
```

### Step 2 填写信息

```txt
Title
Description
Category
Fabric
StyleTags
CareInstructions optional
```

### Step 3 确认定价

```txt
SystemPriceCard
GroupBuyPrice
CustomPrice
DesignerRevenueEstimate
```

### Step 4 提交审核

```txt
ReviewSummary
AgreementCheckbox
SubmitButton
```

### 桌面布局

```txt
Left content: 8 columns
Right preview: 4 columns sticky
```

### 使用组件

```txt
Stepper
DesignCard
FormField
Input
Textarea
Select
Badge
Card
Button
Toast
Modal
```

---

## P1 页面 12：设计师中心 `/studio/dashboard`

### 页面目标

让设计师查看作品、收益、发布状态、生成数据、待办事项。

### Layout

```txt
StudioLayout
```

### 页面结构

```txt
DesignerDashboardPage
├── DashboardHeader
│   ├── Greeting
│   ├── DateRangeSelect
│   └── PrimaryCTA: 发布设计
├── StatsOverview
│   ├── 累计收益
│   ├── 可提现余额
│   ├── 已发布作品
│   └── 本月订单
├── RevenueChartSection
├── WorkPerformanceSection
│   ├── TopDesignsTable
│   └── RecentOrdersList
├── PendingTasksSection
│   ├── 待审核作品
│   ├── 审核未通过
│   └── 可提现提醒
└── RecentActivitySection
```

### 桌面布局

```txt
StatsOverview: 4 columns
RevenueChart: 8 columns
PendingTasks: 4 columns
Tables full width
```

### 移动端布局

```txt
Stats: 2 columns
Charts 单列
Tables 转卡片列表
```

### 使用组件

```txt
StatsCard
Card
ChartCard
Table
Badge
Button
EmptyState
Tabs
```

---

# Part 3｜《Claude Code 页面复刻任务单》

## 通用任务要求

Claude Code 在执行任何页面前必须遵守：

```txt
1. 不改变业务逻辑，除非任务明确要求。
2. 所有颜色、圆角、阴影、字体必须使用 Design System tokens。
3. 优先复用 components/ui、components/layout、components/sections。
4. 不允许每个页面单独写一套 Header / Sidebar / Button / Card。
5. 页面容器统一 max-width 1200px，桌面左右 padding 40px，移动端 20px。
6. 所有 hover / focus / disabled / loading 状态必须完整。
7. 所有页面必须支持移动端。
8. 修改完成后运行 lint 和 build。
9. 输出修改文件清单。
10. 说明未完成项和风险点。
```

---

## 任务 1：首页 `/`

### 页面目标

提升首页品牌质感和转化效率，让用户明确理解 MaxLuLu AI 的三条路径：逛印花衣橱、个人定制、设计师入驻。

### 路由

```txt
/
```

### 使用 Layout

```txt
PublicLayout
```

### 使用组件

```txt
ConsumerHeader
SectionHeader
Button
DesignCard
FeatureCard
StatsCard
CTASection
Footer
```

### 模块结构

```txt
HeroSection
HomeStatsBar
HotGroupBuySection
InspirationGallerySection
AIStudioIntroSection
CustomizationSection
DesignerJoinTeaser
BottomCTA
```

### 数据接口

```txt
GET /api/home
GET /api/designs?sort=hot-group
GET /api/designs?sort=popular
```

### 交互状态

```txt
DesignCard hover 显示收藏/查看详情
CTA 点击跳转 /products 或 /studio/join
数据加载时显示 Skeleton
无数据时显示 EmptyState
```

### 响应式规则

```txt
桌面 Hero 左 5 右 7
移动端 Hero 单列
卡片桌面 4 列，平板 3 列，移动 2 列
```

### 验收标准

```txt
- 首页首屏不再电商促销感，呈现高级 fashion-tech 质感
- CTA 清晰，不超过两个主操作
- 热拼和灵感作品卡片使用统一 DesignCard
- 移动端布局不溢出
- npm run build 通过
```

### 禁止事项

```txt
- 禁止大面积促销红色
- 禁止多个不同风格卡片混用
- 禁止 Hero 文案和图片左右割裂
```

---

## 任务 2：印花衣橱 `/products`

### 页面目标

优化作品浏览效率，提升点击详情、收藏和参团转化。

### 路由

```txt
/products
```

### 使用 Layout

```txt
PublicLayout
```

### 使用组件

```txt
SectionHeader
Input
Select
Badge
DesignCard
EmptyState
Skeleton
Pagination
```

### 模块结构

```txt
ProductsHero
FilterBar
ActiveFilterChips
DesignGrid
Pagination / LoadMore
```

### 数据接口

```txt
GET /api/designs?sort=&category=&fabric=&page=&search=
POST /api/designs/[id]/favorite
POST /api/designs/[id]/like
```

### 交互状态

```txt
筛选变更后刷新列表
搜索防抖 300ms
收藏未登录时弹出 LoginModal
卡片 hover 图片轻微放大
加载时显示 SkeletonGrid
```

### 响应式规则

```txt
桌面 4 列
平板 3 列
移动 2 列
筛选栏移动端变为筛选按钮 + 抽屉
```

### 验收标准

```txt
- 筛选栏清晰、不过重
- DesignCard 样式统一
- 无数据时有 EmptyState
- 移动端筛选可用
```

### 禁止事项

```txt
- 禁止卡片高度混乱
- 禁止图片拉伸变形
- 禁止筛选项堆满一行导致溢出
```

---

## 任务 3：设计详情 `/products/[id]`

### 页面目标

强化商品价值展示，引导用户选择“参团购买”或“定制此款”。

### 路由

```txt
/products/[id]
```

### 使用 Layout

```txt
PublicLayout
```

### 使用组件

```txt
ImageGallery
Badge
Button
ProgressBar
DesignCard
CTASection
LoginModal
```

### 模块结构

```txt
Breadcrumb
ProductHero
ProductDescription
FabricAndCraftSection
SimilarDesigns
MobileStickyPurchaseBar
```

### 数据接口

```txt
GET /api/designs/[id]
POST /api/designs/[id]/like
POST /api/designs/[id]/favorite
POST /api/group-buys/find-or-create
```

### 交互状态

```txt
点击参团购买 → POST find-or-create → 跳转 /group-buy/[id]
点击定制此款 → 跳转 /products/[id]/custom
收藏/点赞未登录 → LoginModal
图片缩略图切换主图
```

### 响应式规则

```txt
桌面左图右信息
移动端图片在上，CTA sticky bottom
```

### 验收标准

```txt
- 路由统一使用 [id]，不再使用 [slug]
- 参团购买按钮权重最高
- 定制按钮为次按钮
- 移动端有底部购买栏
```

### 禁止事项

```txt
- 禁止 GET 接口创建拼团
- 禁止详情页 CTA 不明显
- 禁止图片区域和信息区域高度严重失衡
```

---

## 任务 4：参团购买 `/group-buy/[id]`

### 页面目标

让用户快速确认订单信息并完成支付宝支付。

### 路由

```txt
/group-buy/[id]
```

### 使用 Layout

```txt
PublicLayout
```

### 使用组件

```txt
Stepper
Card
FormField
Input
Select
RadioGroup
Button
ProgressBar
Countdown
LoginModal
Toast
```

### 模块结构

```txt
CheckoutHeader
OrderFormCard
PaymentSummaryCard
FAQMini
SecurityNotice
```

### 数据接口

```txt
GET /api/group-buys/[id]
POST /api/group-buys/[id]/orders
POST /api/payment/create { orderId, kind: 'group-buy' }
```

### 交互状态

```txt
未登录点击支付 → LoginModal
邀请码输入后校验并更新价格
创建订单 loading
支付按钮 loading
支付失败/取消保持 pending_payment
```

### 响应式规则

```txt
桌面左表单 8 列，右汇总 4 列 sticky
移动端支付汇总 sticky bottom
```

### 验收标准

```txt
- 表单字段清晰
- 支付金额以后端返回为准
- 支付按钮 loading 防重复点击
- 支付汇总在移动端可见
```

### 禁止事项

```txt
- 禁止前端自行计算最终支付金额作为支付依据
- 禁止没有登录拦截
- 禁止支付中重复提交
```

---

## 任务 5：参团进度 `/group-buy/[id]/progress`

### 页面目标

展示拼团状态，鼓励用户分享邀请码，推动拼团成功。

### 路由

```txt
/group-buy/[id]/progress
```

### 使用 Layout

```txt
PublicLayout
```

### 使用组件

```txt
Card
Badge
CircularProgress
Countdown
AvatarGroup
Button
Stepper
DesignCard
Toast
```

### 模块结构

```txt
ProgressHeroCard
ProductSummaryCard
ParticipantAvatarList
InviteShareCard
NextStepsStepper
RecommendedDesigns
```

### 数据接口

```txt
GET /api/group-buys/[id]
GET /api/group-buys/[id]/participants
POST /api/invitations/copy-log optional
```

### 交互状态

```txt
复制邀请码 → Toast
分享按钮调用浏览器分享能力 optional
倒计时结束后刷新状态
不同拼团状态展示不同文案
```

### 响应式规则

```txt
桌面中心卡片 + 双列内容
移动端全部单列
分享按钮全宽
```

### 验收标准

```txt
- 清楚显示已参团人数 / 目标人数
- 清楚显示剩余时间
- 邀请码一键复制可用
- 拼团成功/失败/进行中状态视觉不同
```

### 禁止事项

```txt
- 禁止只显示数字不解释状态
- 禁止邀请码隐藏太深
```

---

## 任务 6：个人中心 `/my`

### 页面目标

让消费者查看订单、收藏、参团、邀约和账户设置。

### 路由

```txt
/my
```

### 使用 Layout

```txt
PublicLayout
```

### 使用组件

```txt
Card
Tabs
StatsCard
OrderCard
DesignCard
Badge
Button
EmptyState
FormField
```

### 模块结构

```txt
AccountHeaderCard
MyTabs
OrderList
FavoriteGrid
GroupBuyList
InviteList
SettingsForm
```

### 数据接口

```txt
GET /api/my/orders
GET /api/my/favorites
GET /api/my/group-buys
GET /api/my/invitations
GET /api/my/profile
PATCH /api/my/profile
```

### 交互状态

```txt
未登录访问 → LoginModal 或重定向
Tabs 切换保留 query 参数
订单状态显示 Badge
空列表显示 EmptyState
```

### 响应式规则

```txt
Tabs 移动端横向滚动
收藏移动端 2 列
订单移动端卡片化
```

### 验收标准

```txt
- 用户能快速找到订单和参团
- 状态 badge 清晰
- 空状态有明确下一步 CTA
```

### 禁止事项

```txt
- 禁止把所有数据堆在一个页面无分组
- 禁止移动端表格横向溢出
```

---

## 任务 7：Studio 工具首页 `/studio`

### 页面目标

让设计师快速进入工具、查看最近项目和基础数据。

### 路由

```txt
/studio
```

### 使用 Layout

```txt
StudioLayout
```

### 使用组件

```txt
StudioHeader
StudioSidebar
StatsCard
ToolCard
Tabs
Card
Button
EmptyState
```

### 模块结构

```txt
StudioWelcomeHeader
QuickStatsGrid
RecentProjectsSection
ToolCategoryTabs
ToolGrid
HelpAndTutorialCard
```

### 数据接口

```txt
GET /api/designer/dashboard optional
GET /api/studio/recent-projects optional
```

### 交互状态

```txt
点击 ToolCard 跳转对应工具
comingSoon 工具不可进入或显示提示
未登录或 guest 根据权限矩阵限制生成
```

### 响应式规则

```txt
桌面 Sidebar 固定
移动端 Sidebar 抽屉
ToolGrid 桌面 3-4 列，移动 1-2 列
```

### 验收标准

```txt
- 顶部不再重复主导航
- Sidebar 是唯一主导航
- 工具按图案工作室/服装实验室分组
- 已接通工具状态清晰
```

### 禁止事项

```txt
- 禁止 Header 和 Sidebar 重复菜单
- 禁止 16 个工具无分组平铺
```

---

## 任务 8：设计师入驻 `/studio/join`

### 页面目标

提升设计师申请入驻转化率，作为公开营销页展示，不进入 Studio 工作台体验。

### 路由

```txt
/studio/join
```

### 使用 Layout

```txt
PublicJoinLayout
```

### 使用组件

```txt
PublicJoinHeader
SectionHeader
Button
StatsCard
FeatureCard
Stepper
TestimonialCard
ApplicationForm
FAQAccordion
CTASection
```

### 模块结构

```txt
JoinHero
JoinStatsBar
PlatformBenefits
JoinProcess
DesignerTestimonials
ApplicationFormSection
FAQSection
BottomCTA
```

### 数据接口

```txt
POST /api/designer/register
```

### 交互状态

```txt
点击立即申请入驻 → 滚动到表单
表单提交 loading
提交成功 Toast + 显示审核中提示
表单校验错误 inline 显示
FAQ 可展开
```

### 响应式规则

```txt
桌面 Hero 左 5 右 7
表单双列
移动端全部单列
```

### 验收标准

```txt
- 不出现 StudioSidebar
- 不要求 designer 权限
- Hero 首屏完整
- 表单双列布局
- FAQ 可展开
- 移动端单列
```

### 禁止事项

```txt
- 禁止把入驻页做成后台页面
- 禁止显示 Studio 工作台菜单
- 禁止表单没有校验和 loading
```

---

## 任务 9：图案生成 `/studio/pattern/generate`

### 页面目标

让设计师输入 prompt 和参数后生成图案，并保存到我的设计。

### 路由

```txt
/studio/pattern/generate
```

### 使用 Layout

```txt
StudioLayout
```

### 使用组件

```txt
ToolPageHeader
FormField
Textarea
Select
Button
ResultCard
Skeleton
EmptyState
Toast
Modal
```

### 模块结构

```txt
ToolPageHeader
PromptAndSettingsPanel
ResultArea
GenerationHistory
TipsSection
```

### 数据接口

```txt
POST /api/ai-studio/generate
POST /api/designs/save
```

### 交互状态

```txt
生成中显示 loading skeleton
生成失败显示错误提示和重试按钮
结果可保存、下载、重新生成、发布
未授权用户根据权限矩阵限制
```

### 响应式规则

```txt
桌面左 4 右 8
移动端上下布局
生成按钮移动端可 sticky bottom
```

### 验收标准

```txt
- 左侧参数区清晰
- 右侧结果区有 empty/loading/result/error 四种状态
- 保存成功有 Toast
- 不破坏已有 API 逻辑
```

### 禁止事项

```txt
- 禁止生成中页面无反馈
- 禁止结果图按钮遮挡图片主体
```

---

## 任务 10：线稿成款 `/studio/fashion/render`

### 页面目标

让设计师上传线稿并生成成衣效果图。

### 路由

```txt
/studio/fashion/render
```

### 使用 Layout

```txt
StudioLayout
```

### 使用组件

```txt
ToolPageHeader
UploadDropzone
FormField
Textarea
Select
Button
ResultCard
EmptyState
Skeleton
Toast
```

### 模块结构

```txt
ToolPageHeader
UploadAndSettingsPanel
RenderResultArea
HistorySection
PublishHintCard
```

### 数据接口

```txt
POST /api/ai-studio/generate
POST /api/designs/save
```

### 交互状态

```txt
上传文件支持拖拽
上传后显示预览
生成中 loading
生成结果可保存/发布
错误时显示可重试提示
```

### 响应式规则

```txt
桌面左 4 右 8
移动端单列
上传区全宽
```

### 验收标准

```txt
- 上传区清晰可点击
- 线稿预览不变形
- 结果区状态完整
- 移动端可用
```

### 禁止事项

```txt
- 禁止上传后没有预览
- 禁止接受错误格式但不提示
```

---

## 任务 11：发布设计 `/studio/publish`

### 页面目标

让设计师将已保存设计提交审核发布到印花衣橱。

### 路由

```txt
/studio/publish
```

### 使用 Layout

```txt
StudioLayout
```

### 使用组件

```txt
Stepper
DesignCard
FormField
Input
Textarea
Select
Badge
Card
Button
Toast
Modal
```

### 模块结构

```txt
PublishHeader
PublishStepper
Step1SelectDesign
Step2DesignInfo
Step3PricingConfirm
Step4ReviewSubmit
PreviewPanel
FooterActions
```

### 数据接口

```txt
GET /api/studio/designs?saved=true
POST /api/designs/publish
```

### 交互状态

```txt
步骤切换
保存草稿
提交审核 loading
提交成功 Toast + 跳转 /studio/dashboard
表单错误 inline 提示
```

### 响应式规则

```txt
桌面左内容 8，右预览 4 sticky
移动端预览在上或折叠
```

### 验收标准

```txt
- 4 步流程清晰
- 不能未选择设计就下一步
- 不能未填必填信息就提交
- 预览卡片实时更新
```

### 禁止事项

```txt
- 禁止一步塞完所有字段
- 禁止提交审核无确认反馈
```

---

## 任务 12：设计师中心 `/studio/dashboard`

### 页面目标

让设计师查看收益、作品表现、订单、待办和近期活动。

### 路由

```txt
/studio/dashboard
```

### 使用 Layout

```txt
StudioLayout
```

### 使用组件

```txt
StatsCard
Card
ChartCard
Table
Badge
Button
EmptyState
Tabs
```

### 模块结构

```txt
DashboardHeader
StatsOverview
RevenueChartSection
WorkPerformanceSection
PendingTasksSection
RecentActivitySection
```

### 数据接口

```txt
GET /api/designer/dashboard
GET /api/designer/orders
GET /api/designer/works
GET /api/designer/withdrawals optional
```

### 交互状态

```txt
时间范围切换刷新数据
空数据展示 EmptyState
收益卡片可点击查看明细 optional
提现按钮根据余额和权限显示 disabled/active
```

### 响应式规则

```txt
桌面 Stats 4 列
移动端 Stats 2 列
表格移动端转卡片
```

### 验收标准

```txt
- 数据概览清晰
- 待办事项明显
- 空数据状态完整
- 移动端没有表格溢出
```

### 禁止事项

```txt
- 禁止收益数据无单位
- 禁止状态 badge 文案不清
- 禁止表格移动端横向溢出
```

---

# Part 4｜Claude Code 总执行顺序

```txt
第 1 步：建立/校准 design tokens
第 2 步：建立基础 UI 组件 Button / Card / Form / Badge / Modal / Toast / Skeleton
第 3 步：建立 Layout 组件 ConsumerHeader / StudioHeader / StudioSidebar / PublicLayout / StudioLayout / PublicJoinLayout
第 4 步：先重构 /studio/join，验证设计系统落地
第 5 步：重构 /studio 工具首页和两个核心工具页
第 6 步：重构消费者核心购买链路 /products → /products/[id] → /group-buy/[id] → progress
第 7 步：重构 /my
第 8 步：重构 /studio/publish 和 /studio/dashboard
第 9 步：统一响应式、hover、focus、loading、empty 状态
第 10 步：跑 lint/build，输出修改文件清单和风险说明
```

---

# Part 5｜给 Claude Code 的总提示词

```txt
你现在是 MaxLuLu AI 项目的高级前端工程师和 UI 复刻专家。

请严格按照以下三份规范执行：
1.《Design System 设计系统文档》
2.《组件视觉样例 Component Visual Samples》
3.《页面线框图 Wireframe Spec》

本次任务不是自由设计，而是按规范一比一重构核心页面。

核心规则：
- 不要改变业务逻辑，除非任务明确要求。
- 所有样式必须使用 design tokens。
- 不允许重复写 Header、Sidebar、Button、Card、Form。
- /studio/join 使用 PublicJoinLayout，不显示 StudioSidebar。
- /studio 页面使用 StudioLayout，主导航只放 Sidebar，Header 不重复导航。
- 产品详情统一使用 /products/[id]。
- 参团 find-or-create 使用 POST /api/group-buys/find-or-create，不要用 GET 创建资源。
- 所有页面必须有 loading、empty、error、disabled、hover、focus 状态。
- 所有页面必须兼容移动端。

执行顺序：
1. 先检查现有项目结构和组件。
2. 建立或更新 design tokens。
3. 建立或重构基础 UI 组件。
4. 建立或重构 Layout。
5. 按页面任务单逐页重构。
6. 每完成一个页面，检查是否符合验收标准。
7. 最后运行 lint 和 build。
8. 输出修改文件清单、影响范围和风险点。

禁止：
- 禁止每个页面写一套独立样式。
- 禁止写死大量 hex 色值。
- 禁止 Header 和 Sidebar 重复导航。
- 禁止移动端布局溢出。
- 禁止表单没有校验和状态反馈。
- 禁止生成中没有 loading。
```