# ADR-0003:消费端 My Studio 与专业 OPC/设计师 Studio 严格隔离

- 状态:Accepted(已实施,列为硬边界)
- 日期:2026-07-09(据 `CLAUDE.md`、`AGENTS.md`、`docs/DECISIONS.md` D004/D006 归纳补录)
- 关联:`app/my-studio/*`、`app/studio/*`、`components/my-studio/*`、`components/studio/*`、`components/ConsumerNav.tsx`、`lib/ai-studio-prompts.ts`

## 背景

平台有两类完全不同的创作用户:普通消费者(轻量、时尚化、无专业术语)与专业设计师(左侧专业侧边栏、图案工作室/服装实验室、专业工作流)。历史上曾出现消费端入口错误跳转到专业 Studio 页、把"1:1 还原稿件"误用到产品架构层的问题(见 `CLAUDE.md` 决策边界)。

## 决策

- 两套 Studio 在**路由、导航、组件、文案**四层隔离:
  - 消费端:`/my-studio`、`/my-studio/{pattern-generate,seamless,try-on,sketch,confirm-design}`,用 `ConsumerNav`,轻高端时尚 UI,无专业侧边栏,消费者友好文案。
  - 专业端:`/studio/*`(独立 layout + 左侧专业侧边栏),图案生成/画风复刻/四方连续/图案融合/工艺融合、服装实验室、设计师计划等。
- **消费端入口链接不得指向专业 Studio 页**;非明确要求不得编辑专业 Studio。
- 工具结果类型硬约束(`docs/DECISIONS.md` D006):pattern-generate 只出印花图、seamless 只出四方连续、try-on 只出模特着装图、sketch 只出线稿,互不串味。
- "1:1 还原稿件"仅限视觉细节(颜色/字号/字距/间距/布局),**不延伸到产品架构**(导航项/路由/权限以 IA/Sitemap 为准)。

## 后果

- 正面:两类用户体验清晰不串扰;结果类型约束避免 AI 输出跑偏误导定制。
- 负面/约束:两套并存增加维护面,改动需先判断落在哪一侧;AI 生成路由(`/api/ai-studio/generate`)对两端共用,需靠 `tool`/`toolType` 归一化 + prompt map 区分,逻辑集中且复杂。
