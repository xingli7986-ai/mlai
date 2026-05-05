# AGENTS.md — MaxLuLu AI Agent Instructions

> For Codex / Claude Code / local development agents.
> Always read this file before touching code.

---

## 决策边界(2026-05-02 补充)

以下情况,Agent 必须停下来向用户提问,严禁擅自决定方向:

1. 用户的 message 是"列出问题/差异"性质,没有显式动词("修复"、"执行"、"做以下"),
   不要把"列出差异"读成"隐含要修",先回应"识别到 X 项差异,要修哪几项 / 怎么修?"

2. 稿件、IA 文档、PRD 文档、Sitemap 文档之间出现冲突,
   尤其涉及产品架构(导航项、路由、权限、业务规则)时,
   严禁自己拍板。报告冲突,等用户决策。

3. "1:1 还原稿件" 这条规则的应用范围限定在视觉细节(颜色/字号/字距/间距/布局),
   不延伸到产品架构。导航项数量、文字、href 是产品架构,以 IA/Sitemap 文档为准。

4. 引入新素材(图片、字体、第三方库)前,确认来源、授权、产品语义是否正确。
   仓库已有的素材如果是为 A 用途生成,挪到 B 用途使用前,先问用户。

5. "原地待命"、"暂停"、"等用户决策"这类指令是绝对的:一个动作都不要做。
   不是"你判断停在哪好"。

6. 数据库写入(seed 脚本、迁移)在用户没明确要求时不要执行。
   即使代码修改了 seed,运行时机要用户决定。

---

## Read first

Before any task, read:

- `docs/CONTEXT_BRIEF.md`
- `docs/PROJECT_STATUS.md`
- `docs/TASK_BACKLOG.md`
- `docs/DECISIONS.md`
- `docs/DEVELOPMENT_LOG.md`
- Relevant design specs:
  - `design/09_my-studio_rebuild_spec.md`
  - `design/11_my-studio_tools_design_spec.md`
  - `design/high-fidelity-v2/*.png`

Also inspect:

```bash
git status --short --branch
git log --oneline -12
```

---

## Product identity

MaxLuLu AI is a premium women's fashion ecommerce and AI print-creation platform.

Core product:
- knitted printed dresses
- A-line dresses
- deep-V wrap dresses
- midi printed dresses

Brand mood:
- premium womenswear
- refined, restrained, modern
- Shanghai urban elegance
- print-driven feminine power
- DVF / Toteme / NET-A-PORTER / Mytheresa direction

Do **not** make it look like:
- SaaS dashboard
- Taobao promotion page
- wholesale fashion page
- generic admin panel
- heavy AI tech product
- cheap gradients / excessive pink / over-filtered model imagery

---

## Current product mainlines

A. Consumer purchase flow
`products → group/custom order → payment → delivery`

B. Consumer creation flow
`AI creation → save work → custom order → production sheet → factory`

C. Designer ecosystem
`designer onboarding → professional Studio → publish → revenue share`

Current focus: **Mainline B, Batch 2: real AI generation + save works + chain results across tools.**

---

## Two Studio systems — do not confuse

### Consumer My Studio

Routes:

```text
/my-studio
/my-studio/pattern-generate
/my-studio/seamless
/my-studio/try-on
/my-studio/sketch
```

Rules:
- use `ConsumerNav`
- light premium fashion UI
- no left professional sidebar
- consumer-friendly language
- no professional jargon unless hidden behind friendly guidance

### Professional OPC / Designer Studio

Typical signs:
- professional left sidebar
- AI Studio / 图案工作室
- 图案生成 / 画风复刻 / 四方连续 / 图案融合 / 工艺融合
- 服装实验室 / 设计师计划

Do not edit professional Studio unless explicitly asked.
Consumer My Studio entry links must not route to professional Studio pages.

---

## Completed consumer My Studio pages

Already implemented and pushed:

- `/my-studio`
- `/my-studio/pattern-generate`
- `/my-studio/seamless`
- `/my-studio/try-on`
- `/my-studio/sketch`

Latest pushed commits include:

```text
360f567 fix: my-studio tools auth flow + prompt dedup
46c0dcc fix: my-studio tool card links point to consumer routes
75767d8 feat(my-studio): add sketch generation tool page
84b9c72 feat(my-studio): add try-on preview tool page
8f87ece feat(my-studio): add seamless fabric layout tool page
6305633 docs(my-studio): add tool specs and high-fidelity boards
c3e253a fix(my-studio): align home page values to spec 09
1331c9b feat(my-studio): add pattern generate tool page
8137141 feat(my-studio): polish visual layout and local font fallback
```

---

## Result-type constraints

| Tool | Correct result | Must not show |
|---|---|---|
| pattern-generate | floral print / pattern image | model, dress, try-on, sketch |
| seamless | fabric layout / seamless print | model, try-on, sketch |
| try-on | model / garment wearing result | pure pattern as final result |
| sketch | front/back fashion line sketch | model, pattern, try-on image |

---

## Development safety rules

- Do not guess API schemas.
- Inspect existing route/API/model before editing.
- Do not modify unrelated pages.
- Do not commit or push unless explicitly requested.
- Do not include screenshots, logs, temp files, or unrelated design docs in commits.
- If a document title does not match its filename, stop and report.
- If a consumer entry goes to professional Studio, report and fix the consumer entry only.

---

## Documentation update rules

After a development round, first output a documentation update plan. Do not edit docs automatically.

- `DEVELOPMENT_LOG.md`: update after actual development.
- `PROJECT_STATUS.md`: update when phase/status/blockers change.
- `TASK_BACKLOG.md`: update when tasks are added/completed/reprioritized.
- `CONTEXT_BRIEF.md`: update when entering a new phase or preparing a new conversation.
- `DECISIONS.md`: update only for important product/technical decisions and only when authorized.

Do not auto-edit PRD / User Flow / Sitemap unless explicitly requested.
