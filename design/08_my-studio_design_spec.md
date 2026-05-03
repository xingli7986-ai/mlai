
# MaxLuLu AI `/my-studio` 设计规范参数表

## 一、配色系统

|用途|色值（HEX）|使用位置|
|---|--:|---|
|主色 / 瓷青蓝|`#234A58`|品牌主识别色、导航激活态、主视觉文字、工具选中态、次按钮文字、聚焦边框|
|主色 Hover / 深瓷青|`#235660`|主色按钮 hover、深色图标、重点状态|
|主色浅底|`#E2EEF1`|图案生成 / 上身试穿类工具卡浅底、选中背景、提示底色|
|强调色 / 烟粉玫瑰|`#C06A73`|主 CTA「开始创作」、英文副标题、激活下划线、定制下单、发布强调动作|
|强调色 Hover|`#AB5760`|主 CTA hover / pressed 前一层状态|
|强调色 Pressed|`#9A4E5A`|主 CTA pressed 状态|
|强调色浅底|`#F4E5E7`|四方连续 / 线稿生成类工具卡浅底、空状态浅色背景、弱强调徽章|
|认证金|`#C8A875`|「认证设计师可解锁 16 个专业工具」提示、认证徽章、认证设计师专属状态；普通用户页面中只做轻提示|
|认证金 Hover|`#B89561`|Gold CTA hover|
|认证金 Pressed|`#9F7E4F`|Gold CTA pressed|
|标题文字色|`#1E272B`|Hero 中文标题「我的设计工作室」、模块标题、作品标题、Logo 主文字|
|正文文字色|`#566469`|Hero 描述、工具说明、作品辅助描述、导航默认文字|
|次要 / 灰色文字|`#879397`|创建时间、弱提示、统计说明、空状态辅助文案|
|禁用文字色|`#BECCCA`|禁用按钮、不可用状态文字|
|反色文字|`#FFFFFF`|主按钮文字、深色按钮文字、认证金按钮文字|
|页面背景色|`#F3F6F6`|`/my-studio` 页面整体背景，实际效果图外层因展示板叠加呈现更暖|
|展示板背景采样色|`#FEFDFC`|当前效果图外层 ivory 背景主采样色，非核心系统 token|
|展示板暖调背景采样色|`#FAF7F3`|当前效果图左上角暖象牙白采样色，非核心系统 token|
|卡片 / 区块背景|`#FCFDFD`|Hero 面板、工具卡、作品卡、导航栏、统计卡|
|浮层 / 强白背景|`#FFFFFF`|弹窗、移动端底部栏、手机端卡片高亮面|
|浅色区块背景|`#E6ECEC`|禁用背景、筛选区、弱背景块|
|工具卡浅蓝背景|`#F7F8F8`|效果图中「图案生成」工具卡内部背景采样值，建议落地用 `#E2EEF1` 的低透明度|
|工具卡浅玫瑰背景|`#FCF7F4`|效果图中「四方连续」工具卡内部背景采样值，建议落地用 `#F4E5E7` 的低透明度|
|边框色|`#D2DEDF`|卡片、输入框、统计卡、工具卡描边|
|强边框色|`#B8C7CA`|卡片 hover / active 边框|
|分割线色|`#E1E8E8`|顶部导航下边线、模块分割线、卡片内部分隔线|
|成功色|`#2F7D68`|已发布、已上架、成功状态|
|警告色|`#E2A23A`|轻提醒、次数提醒、临界状态|
|错误色|`#E57373`|删除、失败、危险操作|
|信息色|`#4B8FE3`|系统提示、AI 状态提示|
|图像素材玫瑰色采样|`#DCC2B9`|插画、花朵、连衣裙纹理中的柔粉肤色 / 花色，非 UI token|
|图像素材深玫瑰采样|`#A45F64`|生成图中按钮和花朵阴影的混合采样色，落地仍使用 `#C06A73`|
|图像素材蓝灰采样|`#758C9C`|当前效果图中蓝灰按钮视觉采样色，落地建议映射到 `#234A58` / `#235660`|
|渐变色|`≈ #FEFDFC → #FAF7F3，180°`|效果图展示板外层柔光背景；页面实现中可不使用，保持 `#F3F6F6` 更统一|
|毛玻璃 / 遮罩|`rgba(255,255,255,0.72)`|付费解锁 / prompt 锁定类遮罩，当前 `/my-studio` 主图未强展示|
|主按钮阴影色|`rgba(192,106,115,0.22)`|主按钮 hover 阴影|
|默认阴影色|`rgba(30,39,43,0.04)`|默认卡片阴影|
|Hover 阴影色|`rgba(30,39,43,0.08)`|卡片 hover / 浮层阴影|

---

## 二、字体与排版

|层级|字号(px)|字重|行高|颜色|使用位置|
|---|--:|--:|--:|--:|---|
|页面大标题 / Desktop H1|`40px`|`400`|`48px`|`#1E272B`|Hero 中文标题「我的设计工作室」|
|页面英文副标题|`28px`|`400`|`36px`|`#C06A73`|Hero 英文标题「My Design Studio」|
|页面大标题 / Mobile H1|`28px`|`400`|`36px`|`#1E272B`|移动端「我的设计工作室」|
|模块标题|`20px`|`500`|`28px`|`#1E272B`|「我的作品」、工具卡标题、空状态标题|
|卡片 / 小标题|`14px`|`500`|`22px`|`#1E272B`|作品卡标题，如「玫瑰藤蔓印花」|
|工具卡标题|`20px`|`500`|`28px`|`#234A58`|「图案生成」「四方连续」「上身试穿」「线稿生成」|
|正文|`14px`|`400`|`22px`|`#566469`|Hero 描述、工具说明、空状态说明|
|小正文 / 参数文字|`13px`|`400`|`20px`|`#566469`|作品来源、状态说明、用户信息|
|按钮文字|`14px`|`600`|`20px`|`#FFFFFF` / `#234A58`|「开始创作」「开始第一次创作」「查看详情」|
|标签 / 辅助文字|`12px`|`400`|`18px`|`#879397`|创建时间、统计说明、提示信息|
|导航菜单文字|`14px`|`400`|`22px`|`#566469`|顶部导航默认态|
|导航激活文字|`14px`|`600`|`22px`|`#C06A73`|「我的设计工作室」当前页|
|统计数字|`32px`|`400`|`40px`|`#1E272B`|我的作品 `28` / 已定制 `6` / 已发布 `8`|
|移动端统计数字|`22px`|`400`|`28px`|`#1E272B`|移动端统计卡数字|
|作品操作文字|`12px`|`400` / `500`|`18px`|`#566469` / `#C06A73`|保存到相册、定制下单、发布到灵感广场|

中文字体族：`Noto Serif SC / 思源宋体` 用于标题；`Noto Sans SC / 思源黑体` 用于正文与 UI。  
英文/数字字体族：`Playfair Display` 用于英文标题和统计数字；`Inter` 用于英文正文、UI、参数、按钮。  
数字规范：统计数字、价格、计数统一启用 `tabular-nums`。

```css
.stat-number,
.count,
.metric,
.price {
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum" 1, "lnum" 1;
}
```

---

## 三、间距系统

|位置|数值(px)|
|---|--:|
|页面最大内容宽度|`1200px`|
|Desktop 页面左右边距|`64px`|
|Tablet 页面左右边距|`24px`|
|Mobile 页面左右边距|`16px`|
|导航栏高度 / Desktop|`64px`|
|导航栏高度 / Mobile|`56px`|
|Hero 内边距 / Desktop|`64px`|
|Hero 内边距 / Mobile|`24px`|
|模块与模块垂直间距 / Desktop|`40px`|
|模块与模块垂直间距 / Mobile|`24px`|
|工具卡与工具卡间距 / Desktop|`24px`|
|工具卡与工具卡间距 / Mobile|`12px`|
|作品卡与作品卡间距 / Desktop|`16px`|
|作品卡与作品卡间距 / Mobile|`12px`|
|统计卡间距|`16px`|
|卡片内边距 / 大卡片|`24px`|
|卡片内边距 / 普通卡片|`16px`|
|卡片内边距 / 作品卡|`12px`|
|标题与副标题间距|`8px`|
|标题与正文间距|`12px`|
|正文与按钮间距|`16px`|
|图标与文字间距 / Desktop|`8px`|
|图标与文字间距 / Mobile|`6px`|
|统计数字与标签间距|`4px`|
|卡片图片与文字间距|`12px`|
|作品操作行间距|`8px`|
|页面底部安全留白 / Desktop|`48px`|
|页面底部安全留白 / Mobile|`32px`|

基础间距 token：

|Token|数值|
|---|--:|
|Space 1|`4px`|
|Space 2|`8px`|
|Space 3|`12px`|
|Space 4|`16px`|
|Space 6|`24px`|
|Space 8|`32px`|
|Space 10|`40px`|
|Space 12|`48px`|
|Space 16|`64px`|
|Space 20|`80px`|

---

## 四、组件样式

### 按钮

|类型|背景色|文字色|边框|圆角(px)|高度(px)|左右内边距(px)|
|---|--:|--:|---|--:|--:|--:|
|主按钮|`#C06A73`|`#FFFFFF`|`1px solid #C06A73`|`8px`|`40px`|`24px`|
|主按钮 Hover|`#AB5760`|`#FFFFFF`|`1px solid #AB5760`|`8px`|`40px`|`24px`|
|主按钮 Pressed|`#9A4E5A`|`#FFFFFF`|`1px solid #9A4E5A`|`8px`|`40px`|`24px`|
|次要按钮|`#FFFFFF`|`#234A58`|`1px solid #D2DEDF`|`8px`|`40px`|`20px`|
|次要按钮 Hover|`#E2EEF1`|`#234A58`|`1px solid #234A58`|`8px`|`40px`|`20px`|
|工具卡紧凑按钮|`#C06A73` / `#234A58`|`#FFFFFF`|`1px solid transparent`|`999px`|`32px`|`16px`|
|文字按钮|`transparent`|`#566469`|`none`|`0px`|`32px`|`0px`|
|文字强调按钮|`transparent`|`#C06A73`|`none`|`0px`|`32px`|`0px`|
|禁用按钮|`#E6ECEC`|`#BECCCA`|`1px solid #E6ECEC`|`8px`|`40px`|`24px`|

按钮 CSS 建议：

```css
.btn-primary {
  height: 40px;
  padding: 0 24px;
  border-radius: 8px;
  border: 1px solid #C06A73;
  background: #C06A73;
  color: #FFFFFF;
  font-size: 14px;
  line-height: 20px;
  font-weight: 600;
}

.btn-primary:hover {
  background: #AB5760;
  border-color: #AB5760;
  box-shadow: 0 4px 12px 0 rgba(192, 106, 115, 0.22);
}

.btn-primary:active {
  background: #9A4E5A;
  transform: translateY(1px);
}
```

---

### 卡片

|属性|值|
|---|---|
|背景色|`#FCFDFD`|
|圆角|`12px`|
|边框|`1px solid #D2DEDF`|
|Hover 边框|`1px solid #B8C7CA`|
|默认阴影|`0 1px 2px 0 rgba(30, 39, 43, 0.04)`|
|Hover 阴影|`0 8px 24px 0 rgba(30, 39, 43, 0.08)`|
|Hover 位移|`translateY(-2px)`|
|Overflow|`hidden`|
|过渡|`150ms ease-out`|

```css
.card {
  background: #FCFDFD;
  border: 1px solid #D2DEDF;
  border-radius: 12px;
  box-shadow: 0 1px 2px 0 rgba(30, 39, 43, 0.04);
  overflow: hidden;
  transition: border-color 150ms ease-out, box-shadow 150ms ease-out, transform 150ms ease-out;
}

.card:hover {
  border-color: #B8C7CA;
  box-shadow: 0 8px 24px 0 rgba(30, 39, 43, 0.08);
  transform: translateY(-2px);
}
```

---

### Hero 面板

|属性|值|
|---|--:|
|背景色|`#FCFDFD`|
|圆角|`16px`|
|内边距 / Desktop|`64px`|
|内边距 / Mobile|`24px`|
|最小高度 / Desktop|`≈ 320px`|
|最小高度 / Mobile|`≈ 220px`|
|布局|Desktop 双栏；Mobile 上下堆叠，插画可绝对定位于右上角|
|插画透明度|`≈ 0.82`|
|花卉背景透明度|`≈ 0.10–0.18`|

---

### 统计卡片

|属性|值|
|---|--:|
|背景色|`#FCFDFD`|
|边框|`1px solid #D2DEDF`|
|圆角|`12px`|
|高度 / Desktop|`64px`|
|宽度 / Desktop|`≈ 160px`|
|高度 / Mobile|`56px`|
|宽度 / Mobile|`calc((100% - 16px) / 3)`|
|图标尺寸|`28px`|
|图标颜色|`#C06A73`|
|数字字号|`32px` Desktop / `22px` Mobile|
|标签字号|`12px`|
|内边距|`12px 16px`|

---

### 工具卡片

|属性|值|
|---|--:|
|背景色 / 默认|`#FCFDFD`|
|背景色 / 主色浅底|`#E2EEF1`|
|背景色 / 强调浅底|`#F4E5E7`|
|边框|`1px solid #D2DEDF`|
|圆角|`12px`|
|内边距 / Desktop|`24px`|
|内边距 / Mobile|`16px`|
|高度 / Desktop|`≈ 168px`|
|高度 / Mobile|`≈ 124px`|
|Desktop 布局|`grid-template-columns: repeat(4, 1fr)`|
|Mobile 布局|`grid-template-columns: repeat(2, 1fr)`|
|图标尺寸 / Desktop|`48px`|
|图标尺寸 / Mobile|`36px`|
|标题字号|`20px` Desktop / `16px` Mobile|
|描述字号|`14px` Desktop / `12px` Mobile|
|CTA 高度|`32px`|
|CTA 圆角|`999px`|

---

### 作品卡片

|属性|值|
|---|--:|
|背景色|`#FCFDFD`|
|圆角|`12px`|
|边框|`1px solid #D2DEDF`|
|阴影|`0 1px 2px 0 rgba(30, 39, 43, 0.04)`|
|内边距|`12px`|
|图片比例|`4:3`|
|图片圆角|`8px`|
|标题字号|`14px`|
|标题行高|`22px`|
|时间字号|`12px`|
|操作区上边距|`12px`|
|操作行高度|`24px`|
|操作行间距|`8px`|
|Desktop 推荐列数|`6` 张预览卡 / 实现可用 `auto-fit`|
|Mobile 推荐列数|`1` 列或 `2` 列|

作品卡片结构：

```text
作品图
标题
创建时间
分割线
保存到相册
定制下单
发布到灵感广场
```

---

### 空状态模块

|属性|值|
|---|--:|
|背景色|`#FCFDFD`|
|边框|`1px solid #D2DEDF`|
|圆角|`16px`|
|内边距 / Desktop|`32px`|
|内边距 / Mobile|`24px`|
|插画尺寸 / Mobile|`≈ 140px × 180px`|
|标题字号|`24px` Mobile|
|正文字号|`14px`|
|CTA 高度|`40px`|
|CTA 背景|`#C06A73`|

空状态文案：

```text
还没有作品
从第一朵花开始创作吧，完成一次生成后，你的作品会出现在这里。
开始第一次创作
```

---

### 输入框（当前效果图主页面未出现；如后续增加作品搜索，按此规范）

|属性|值|
|---|---|
|高度|`40px`|
|圆角|`8px`|
|边框颜色（默认）|`#D2DEDF`|
|边框颜色（聚焦）|`#234A58`|
|背景色|`#FFFFFF`|
|输入文字色|`#1E272B`|
|placeholder 文字色|`#879397`|
|左右内边距|`12px`|
|图标尺寸|`16px`|
|聚焦态|`outline: 2px solid #234A58; outline-offset: 2px;`|

---

### 图标

|属性|值|
|---|---|
|风格|线性|
|线宽|`1.5px`|
|移动端现有图标统一线宽|`1.8px`|
|默认颜色|`#566469`|
|激活颜色|`#234A58`|
|CTA / 强调颜色|`#C06A73`|
|认证颜色|`#C8A875`|
|顶栏图标尺寸|`20px`|
|工具卡图标尺寸|`48px` Desktop / `36px` Mobile|
|作品操作图标尺寸|`14px`|
|Hero 统计图标尺寸|`28px`|
|移动端底栏图标尺寸|`22px`|
|图标与文字间距|`8px` Desktop / `6px` Mobile|

---

## 五、页面结构（从上到下）

|序号|模块名称|布局方式|背景色|模块高度 / 内容描述|
|--:|---|---|--:|---|
|1|顶部导航|Desktop：Logo 左置，导航居中，用户头像右置；Mobile：Logo + 汉堡菜单|`#FCFDFD`|Desktop `64px`；Mobile `56px`；下边框 `1px solid #E1E8E8`|
|2|Hero 区|Desktop 双栏：左侧标题 / 描述 / 统计，右侧时装插画；Mobile 堆叠布局|`#FCFDFD`|Desktop `≈ 320px`；Mobile `≈ 220px`；标题「我的设计工作室 / My Design Studio」|
|3|统计数据区|3 个统计卡横向排列；Mobile 保持 3 等分紧凑排列|`#FCFDFD`|每项包含图标、标签、数字；我的作品 `28` / 已定制 `6` / 已发布 `8`|
|4|工具说明提示|单行提示，左侧小星标 / 点缀图标|`transparent`|文案：`精选 4 个入门工具 · 认证设计师可解锁 16 个专业工具`|
|5|AI 创作工具入口|Desktop：4 列工具卡；Mobile：2 × 2 工具卡|`#FCFDFD` / 浅色 token|包含图标、名称、描述、`开始创作` 按钮；4 个工具：图案生成、四方连续、上身试穿、线稿生成|
|6|我的作品标题栏|左标题 + 右侧「查看全部作品 →」|`transparent`|高度 `≈ 32px`；顶部间距 `40px`|
|7|我的作品网格|Desktop：效果图展示 6 张预览卡；实现建议 `auto-fit`；Mobile：新用户展示空状态|`transparent`|每个作品卡包含作品图、标题、创建时间、保存到相册、定制下单、发布到灵感广场|
|8|作品卡操作区|卡片内纵向 3 个操作出口|`#FCFDFD`|保存到相册：中性；定制下单：`#C06A73` 强调；发布到灵感广场：中性|
|9|移动端空状态|大卡片 + 插画 + CTA|`#FCFDFD`|标题「还没有作品」；CTA「开始第一次创作」；用于第一次进入页面的引导|
|10|页面底部安全留白|Desktop / Mobile 自适应|`transparent`|Desktop `48px`；Mobile `32px`|

---

## 六、响应式说明

当前设计效果图画布宽度：`1448px`  
设计图中展示的目标视口：Desktop `1440 × 900px`，Mobile `375 × 800px`

|断点|范围|布局规则|
|---|--:|---|
|Desktop XL|`≥1440px`|内容最大宽度 `1200px`，左右边距 `64px`，工具卡 4 列，作品卡 5–6 列预览|
|Desktop|`1024–1439px`|12 栅格，左右边距 `40px`，工具卡 4 列，作品卡 4 列|
|Tablet|`768–1023px`|8 栅格，左右边距 `24px`，Hero 上下或 6/2 分栏，工具卡 2 列，作品卡 2–3 列|
|Mobile|`<768px`|4 栅格，左右边距 `16px`，顶部改汉堡菜单，Hero 堆叠，工具卡 2 列，作品区优先空状态 / 单列卡片|
|Mobile Spec|`375px`|移动端设计基准；页面内容宽度 `343px`|

移动端适配规则：

|模块|Mobile 规则|
|---|---|
|顶部导航|高度 `56px`，左 Logo，右汉堡菜单；不展示完整导航链接|
|Hero|标题字号 `28/36px`，英文副标题 `18–20px`，插画缩小并放在右上或 Hero 下方|
|统计卡|3 等分，单卡高度 `56px`，数字 `22/28px`|
|工具卡|`2` 列网格，gap `12px`，按钮高度 `32px`|
|我的作品|新用户优先展示空状态；已有作品时可单列大卡或 2 列小卡|
|CTA|主动作按钮高度 `40px`，移动端宽度可设为 `100%`|
|空状态|插画与文案同卡展示，按钮放在文案下方，避免用户不知道下一步|

---

## 可直接落地的 CSS Token

```css
:root {
  /* Brand */
  --color-primary: #234A58;
  --color-primary-deep: #235660;
  --color-primary-subtle: #E2EEF1;

  --color-accent: #C06A73;
  --color-accent-hover: #AB5760;
  --color-accent-pressed: #9A4E5A;
  --color-accent-subtle: #F4E5E7;

  --color-certified-gold: #C8A875;
  --color-certified-gold-hover: #B89561;
  --color-certified-gold-pressed: #9F7E4F;

  /* Background */
  --color-bg: #F3F6F6;
  --color-surface: #FCFDFD;
  --color-surface-elevated: #FFFFFF;
  --color-subtle: #E6ECEC;

  /* Text */
  --color-text-primary: #1E272B;
  --color-text-secondary: #566469;
  --color-text-tertiary: #879397;
  --color-text-disabled: #BECCCA;
  --color-text-inverse: #FFFFFF;

  /* Border */
  --color-border: #D2DEDF;
  --color-border-strong: #B8C7CA;
  --color-divider: #E1E8E8;

  /* Status */
  --color-success: #2F7D68;
  --color-warning: #E2A23A;
  --color-error: #E57373;
  --color-info: #4B8FE3;

  /* Radius */
  --radius-xs: 2px;
  --radius-s: 4px;
  --radius-m: 8px;
  --radius-l: 12px;
  --radius-xl: 16px;
  --radius-full: 999px;

  /* Shadow */
  --shadow-xs: 0 1px 2px 0 rgba(30, 39, 43, 0.04);
  --shadow-sm: 0 4px 12px 0 rgba(30, 39, 43, 0.06);
  --shadow-md: 0 8px 24px 0 rgba(30, 39, 43, 0.08);
  --shadow-lg: 0 16px 40px 0 rgba(30, 39, 43, 0.12);

  /* Layout */
  --container-max: 1200px;
  --page-padding-desktop: 64px;
  --page-padding-tablet: 24px;
  --page-padding-mobile: 16px;
  --nav-height-desktop: 64px;
  --nav-height-mobile: 56px;

  /* Typography */
  --font-title-en: "Playfair Display";
  --font-title-cn: "Noto Serif SC", "Source Han Serif SC", serif;
  --font-body-en: "Inter";
  --font-body-cn: "Noto Sans SC", "Source Han Sans SC", sans-serif;
}
```
