# MaxLuLu AI — UI 开发交付说明

> 版本：v1.0 | 日期：2026-05-01 本文档是给 Claude Code 的开发规范。每次开发新页面或修改 UI 时必须遵守。

---

## 一、开发前必读

每次开发页面前，Claude Code 必须先加载以下文档：

|文档|路径|用途|
|---|---|---|
|设计系统|design/05_DesignSystem_设计系统.md|颜色/字号/间距/组件规范|
|页面设计稿|design/ 目录下对应的 PNG 图片|UI 视觉参照|
|核心文档|项目知识库|架构/API/代码约定|

**没有设计稿的页面不开发。先让 GPT 出设计稿，再开发。**

---

## 二、页面开发交付模板

每次给 Claude Code 开发一个页面时，必须提供以下信息（由 GPT 或 Claude.ai 准备）：

### 2.1 必须提供

```
1. 页面名称和路由
2. 页面目标（用户来这个页面要完成什么）
3. 设计稿图片（至少 1 张 UI 效果图 + 1 张标注规范图）
4. 模块列表（从上到下，每个模块名称 + 用途）
5. 数据来源（接哪个 API，或硬编码）
6. 交互说明（按钮点击后做什么、表单提交到哪里）
```

### 2.2 标准指令格式

```
请按照以下要求开发 [页面名称] 页面：

1. 页面路由: [路由]
2. 设计稿: design/[文件名].png
3. 设计系统: design/05_DesignSystem_设计系统.md

模块结构（从上到下）:
- 模块 A: [说明]
- 模块 B: [说明]
- 模块 C: [说明]

数据来源:
- [API 端点] 或 [硬编码数据]

交互:
- 按钮 X 点击 → [跳转/弹窗/调 API]
- 表单提交 → [API 端点]

要求:
1. 所有颜色使用 CSS 变量（设计系统中定义的）
2. 不使用 inline style
3. 不使用负边距
4. 复用 ConsumerNav / Studio layout
5. 响应式：桌面优先，兼容 375px 手机端
6. 完成后 npx tsc --noEmit
7. Playwright 截图验证
8. git add -A && git commit -m "feat: [页面名称]" && git push
```

---

## 三、CSS 编写规范

### 3.1 文件组织

|规则|说明|
|---|---|
|一个页面一个 CSS 文件|如 join.css、publish.css|
|全局样式在 globals.css|CSS 变量、reset、字体加载|
|组件样式跟组件走|如 ConsumerNav.css、AssetImage.css|
|Studio 共享样式在 studio.css|sidebar、topbar、layout|

### 3.2 命名规范

```css
/* 页面根容器用 2 字母缩写 + root */
.dl-root { }    /* designer landing (join) */
.st-root { }    /* studio home */
.dc-root { }    /* designer center (dashboard) */
.pb-root { }    /* publish */
.ft-root { }    /* fashion tool */

/* 模块用页面缩写 + 模块名 */
.dl-hero { }
.dl-section { }
.dl-stats { }
.dl-cta { }

/* 状态用 is- 前缀 */
.is-active { }
.is-loading { }
.is-disabled { }
```

### 3.3 禁止事项

|禁止|替代方案|
|---|---|
|`color: #B38A56`|`color: var(--color-primary)`|
|`margin: -32px -40px`|用正向 padding 控制间距|
|`style={{ fontSize: 14 }}`|CSS 类 + 设计系统字号|
|`!important`|提高选择器优先级|
|在 page.tsx 中写大段 inline style|写在对应 .css 文件中|

---

## 四、组件复用规则

### 4.1 已有组件（必须复用）

|组件|路径|用途|
|---|---|---|
|ConsumerNav|components/ConsumerNav.tsx|消费者页面顶部导航|
|Studio Layout|app/studio/layout.tsx|Studio 侧边栏 + 顶栏|
|AssetImage|components/AssetImage.tsx|图片 + fallback 占位|

### 4.2 待建组件（第一次用到时新建）

|组件|建议路径|说明|
|---|---|---|
|Button|components/ui/Button.tsx|主按钮/次级/幽灵，参照设计系统 6.1|
|Card|components/ui/Card.tsx|通用卡片，参照设计系统 6.2|
|Input|components/ui/Input.tsx|输入框，参照设计系统 6.3|
|Select|components/ui/Select.tsx|下拉框|
|Badge|components/ui/Badge.tsx|标签|
|SectionHeader|components/ui/SectionHeader.tsx|Section 三行式标题|
|StatsCard|components/ui/StatsCard.tsx|数据统计卡|
|Modal|components/ui/Modal.tsx|弹窗|
|Toast|components/ui/Toast.tsx|提示通知|

**规则：** 新建组件时必须参照设计系统文档中的组件规范，不自行发明样式。

---

## 五、图片处理规范

|场景|处理方式|
|---|---|
|设计师作品图|从 R2 加载，用 AssetImage 包裹（失败时 fallback）|
|首页素材图|public/assets/images/home/ 目录|
|AI 生成图|存 R2，通过 R2_PUBLIC_URL 访问|
|图片宽高比|服装图 3:4，正方形图 1:1，Hero 图 16:9|
|占位/加载|AssetImage 内置 fallback，渐变色占位|

---

## 六、API 对接规范

### 6.1 前端调用格式

```typescript
// GET 请求
const res = await fetch('/api/designs?page=1&limit=12');
const data = await res.json();

// POST 请求
const res = await fetch('/api/orders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ designId, skirtType, fabric }),
});
const data = await res.json();
```

### 6.2 错误处理

```typescript
if (!res.ok) {
  const error = await res.json();
  // 显示 error.error 给用户（Toast 或 alert）
  return;
}
```

### 6.3 金额展示

```typescript
// 数据库存的是分（整数），展示时转元
const displayPrice = (cents: number) => `¥${(cents / 100).toFixed(2)}`;
// 例：59900 → "¥599.00"
```

---

## 七、自检清单

Claude Code 每次完成页面开发后，必须逐项检查：

```
□ 1. 所有颜色是否使用 CSS 变量？（搜索 # 开头的十六进制色值，不应存在）
□ 2. 字号是否符合设计系统层级？（不应出现 11px、13.5px 等非标字号）
□ 3. 间距是否合理？（不应出现负边距、不应有 0px 间距的紧凑堆叠）
□ 4. ConsumerNav / Studio Layout 是否正确复用？（不自行创建导航）
□ 5. 按钮/卡片/输入框是否符合设计系统规范？
□ 6. 响应式在 375px 是否正常？（Playwright 截图 375px 宽度验证）
□ 7. 图片加载失败时是否有 fallback？
□ 8. npx tsc --noEmit 是否通过？
□ 9. 修改是否影响了其他页面？（Playwright 截图相邻页面验证）
□ 10. 与设计稿对比差距在哪里？（截图对比，列出差异）
```

---

## 八、Git 提交规范

|类型|格式|示例|
|---|---|---|
|新功能|feat: [描述]|feat: studio join page redesign|
|Bug 修复|fix: [描述]|fix: sidebar overlap on join page|
|样式调整|style: [描述]|style: unify button colors to design tokens|
|重构|refactor: [描述]|refactor: extract Button component|
|文档|docs: [描述]|docs: update design system|

提交后自动 push：`git add -A && git commit -m "类型: 描述" && git push`

---

## 九、Claude Code 启动规范

```powershell
cd D:\maxlulu-ai
claude --dangerously-skip-permissions
```

**每次启动后的第一条指令应该是加载设计系统：**

```
读取 design/05_DesignSystem_设计系统.md，记住所有 CSS 变量和组件规范。后续所有 UI 开发都按这份规范执行。
```