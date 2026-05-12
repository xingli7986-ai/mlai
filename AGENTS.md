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

## Deployment Verification (MANDATORY · added 2026-05-12)

After 2026-05-12 incident: 5-day silent build failure, 21 wasted commits, full rollback to 5/5 baseline. The following rules are non-negotiable.

- After every `git push` to `main`, within 5 minutes you MUST verify the Vercel build status — via the Vercel dashboard, `vercel inspect`, or by asking the user to confirm.
- If the Vercel build is RED, immediately STOP all further development. **Do NOT push more commits on top of a red build.** Layered fixes on a broken baseline are how 21 commits got wasted on 5/8-5/11.
- Do NOT say "deployed" / "live" / "shipped" / "done" / "上线" / "发布" unless the Vercel production URL has been verified responding correctly within the last hour.
- Local `npx tsc --noEmit` passing does NOT mean production works.
- Local `npm run dev` rendering does NOT mean production works.
- Definition of "done" for any feature (ALL FOUR must hold — three out of four is not done):
  1. `npx tsc --noEmit` clean locally
  2. committed and pushed to `main`
  3. Vercel build green for that commit
  4. production URL renders the feature without error in a real browser

---

## Stop-Loss Rules (MANDATORY · added 2026-05-12)

The 2026-05-12 incident escalated because the same try-on bug was patched 10+ times without questioning the premise. The following triggers force an immediate STOP.

- 2 consecutive Vercel build failures → STOP, do not push fix #3 blindly.
- 3+ attempts to fix the same bug → STOP, the diagnosis is probably wrong.
- 5+ modifications to the same file within 48 hours → STOP, the design is probably wrong.
- A pushed fix shows no symptom change → do NOT push another fix; re-investigate the root cause first.

When any trigger fires, immediately:
1. State to the user what happened (which trigger, evidence — list the commit hashes).
2. List what has already been tried, with concrete outcomes.
3. Propose 2–3 alternative directions (e.g., rollback, change approach, ask for environment access, defer feature).
4. WAIT for the user to choose. Do NOT pick one yourself.

---

## Environment Awareness (MANDATORY · added 2026-05-12)

The 2026-05-12 incident's true root cause was missing Vercel environment variables that nobody noticed for 5 days. The agent treated build failures as code bugs and "fixed" them by pushing more code.

- Before starting any task that touches API routes, database, or AI providers, confirm Vercel's most recent deployment succeeded. If the last deploy is red, the environment may be broken — STOP and ask the user before writing code.
- Required production env vars on Vercel (any missing one breaks builds or runtime):

  ```
  DATABASE_URL
  NEXTAUTH_SECRET
  NEXTAUTH_URL
  YXAI_API_KEY
  YXAI_BASE_URL
  R2_ENDPOINT
  R2_ACCESS_KEY_ID
  R2_SECRET_ACCESS_KEY
  R2_PUBLIC_URL
  R2_BUCKET
  CRON_SECRET
  ```

- If any production error suggests missing env vars (`process.env.X is undefined`, Prisma connection errors, R2 upload returning 401, Alipay signature mismatch, etc.), ask the user to verify Vercel → Project → Settings → Environment Variables. Do NOT silently invent fallbacks or assume the issue is code.

---

## Vercel Hobby Deployment Constraints (added 2026-05-12)

The 2026-05-12 incident also revealed a serverless function exceeding the 250MB Vercel Hobby limit.

- Vercel Hobby unzipped serverless function size limit: **250MB**.
- `sharp` and `@prisma/client` MUST stay in `next.config.ts` → `serverExternalPackages`. Removing them will fail at deploy time.
- Before adding any new `dependency` (not `devDependency`), estimate its installed size (and its transitive deps). Any package > 5MB needs explicit user discussion before install.
- Working budget: keep the unzipped lambda function size **≤ 200MB**, leaving 50MB safety headroom.
- After adding code that imports a new heavy package, check the Vercel build log "Lambda size" section on the next deployment.

---

## Read first

Before any task, read:

- `docs/CONTEXT_BRIEF.md`
- `docs/PROJECT_STATUS.md`
- `docs/TASK_BACKLOG.md`
- `docs/DECISIONS.md`
- `docs/DEVELOPMENT_LOG.md`
- Relevant design specs (verify each exists before relying on it):
  - `design/09_my-studio_rebuild_spec.md`
  - `design/11_my-studio_tools_design_spec.md`
  - `design/high-fidelity-v2/*.png`

**If any "Read first" file does not exist on the current branch, STOP and report to the user — do not proceed assuming the file's content from memory or from history.**

Also inspect the live state of the repo (do NOT trust historical commit hashes embedded elsewhere in this file or in docs/):

```bash
git status --short --branch
git log --oneline -10
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

For current pushed commits, always run `git log --oneline -10` against the live repo. Do NOT trust any static commit list embedded in this file or in any `docs/` file — those lists go stale fast (this section previously listed 5/4 commits unchanged for over a week during the 5/12 incident).

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
