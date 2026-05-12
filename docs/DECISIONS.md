# MaxLuLu AI · DECISIONS

## D001 · Brand UI direction

MaxLuLu AI must look like a premium womenswear brand with AI creation capability, not a SaaS tool.

Chosen design keywords:

```text
premium womenswear, refined, restrained, modern, Shanghai urban elegance, print-driven feminine power
```

Rejected styles:

```text
Taobao promotion, wholesale fashion, generic SaaS, heavy tech, cheap gradients, over-filtered pink
```

## D002 · Final palette

Final palette:

```text
Primary / Porcelain Cyan: #234A58
Accent / Smoked Rose: #C06A73
Certified Gold: #C8A875
Background: #F3F6F6
Surface: #FCFDFD
```

Certified Gold is only for certified designer identity, not normal CTA/promotion.

## D003 · Fonts

Target fonts:

- English title: Playfair Display
- English/UI: Inter
- Chinese title: Noto Serif SC / 思源宋体
- Chinese body/UI: Noto Sans SC / 思源黑体

Temporary decision:
`app/layout.tsx` uses system fallback due to Google Fonts cold-start failure. Later replace with local fonts via `next/font/local`.

## D004 · Consumer My Studio and OPC Studio are separate

Consumer routes:

```text
/my-studio
/my-studio/pattern-generate
/my-studio/seamless
/my-studio/try-on
/my-studio/sketch
```

Professional OPC/Designer Studio has its own sidebar/tooling and must not be mixed with consumer My Studio.

## D005 · Mainline B batch plan

Consumer creation flow has 5 batches:

| Batch | Scope | Status (2026-05-12) |
|---|---|---|
| 1 | consumer tool pages UI + interaction | Done (live) |
| 2 | real AI generation + save works + chaining | **Failed attempt rolled back; requires new plan** |
| 3 | custom configuration + payment | Not started |
| 4 | production sheet + admin review + PDF | Not started |
| 5 | order/factory/logistics status | Not started |

Batch 2 must be completed before payment/work-order/factory work. The 5/7-5/11 attempt is on `backup-before-rollback`; do not auto-restart without explicit user direction.

## D006 · Tool result-type constraints

| Tool | Correct output | Must not output |
|---|---|---|
| pattern-generate | floral print/pattern image | model, dress, try-on, sketch |
| seamless | fabric layout / seamless pattern | model, try-on, sketch |
| try-on | model/garment wearing image | pure pattern as final result |
| sketch | front/back line sketch | model, pattern, try-on image |

## D007 · Documentation maintenance

Docs update rule:

- Output update plan first.
- Do not auto-edit PRD/User Flow/Sitemap.
- Do not auto-commit docs.
- Do not auto-push.
- If title does not match filename, stop and report.
- Do NOT write "deployed" / "live" / "shipped" in any doc unless the corresponding production URL has been verified within the last hour (see D018).

## D008 · Current not-in-scope items

Do not start these unless explicitly requested:

- Alipay payment implementation
- custom configuration page
- production sheet PDF
- factory integration
- logistics notification
- designer revenue share

## D009 · Consumer creation flow simplified

The consumer-facing AI fashion design flow was confirmed (2026-05-07) as:

```text
创建作品 → 印花创作 → 虚拟试穿 → 开始定制 → 生产资料草案 → 后台审核
```

> ⚠️ The implementation supporting this flow was rolled back on 2026-05-12. The flow as a product goal is still valid, but the previous implementation approach is not. A new Batch 2 plan must be designed before this flow can be re-attempted.

## D010 · UI design delivery must be implementation-ready

UI design work must not deliver only attractive boards. A usable UI delivery package must include:

- UI board / visual reference
- page-level purpose and constraints
- implementation-ready visual assets
- asset names, paths, suggested sizes, purpose, CSS usage, and production-readiness notes
- design parameter table
- page structure and interaction rules
- data persistence / state rules
- Codex implementation instructions
- acceptance checklist
- missing asset / follow-up confirmation list

UI boards are references only. Do not paste a full board image into a page. Design images must be split into usable assets when the page needs actual media.

## D011 · User-generated content is a digital asset

All user-generated or selected creation content must be persisted as current work assets, not kept only in frontend state.

Required behavior:

- refresh-safe and back-navigation-safe
- additional generations append instead of overwriting history
- selected asset state must restore after refresh
- direct-use public prints must be copied as snapshots into the current work assets
- source, time, prompt/params, provider, model, and `isFallback` should be stored in metadata where available
- consumer UI must not expose internal technical metadata by default

> ⚠️ The 5/7-5/11 implementation of this decision was rolled back on 2026-05-12. The principle stands; the implementation does not currently exist in `main`.

## D012 · Fallback and mock results must be honest

Fallback/mock output must never be presented as real AI or production-ready output.

Rules:

- consumer-facing fallback copy is `示例预览`
- missing key/model/provider failures must show Chinese friendly messages
- metadata may store provider/model/isFallback, but consumer pages should hide those fields
- never hardcode API keys
- temporary mock/fallback is allowed to keep flow usable, but final reports must call it out explicitly

## D013 · Personal fitting context is stored as work metadata

Consumer virtual fitting must use the current work's fitting context, without introducing a new database table during Batch 2.

Standardized metadata fields in `studio-work-v1` (design only — implementation rolled back 2026-05-12):

- `bodyProfile`: height, weight, key measurements, usual size, body shape, fit preference, measurement mode, and update time
- `garmentTemplates`: selectable consumer-facing dress templates
- `selectedAssets.garmentTemplateId`: currently selected fitting template
- `assets.tryOns[]`: append-only fitting history with selected pattern id, body/profile snapshot, garment-template snapshot, revision reason, source, created time, and optional provider/model/isFallback metadata
- `productionDraft.bodyProfileSnapshot` and `productionDraft.garmentTemplateSnapshot`: frozen context used for production review

Rules:

- New try-on generations append to `assets.tryOns[]`; they must not overwrite older fitting results.
- Selecting a fitting result only updates `selectedAssets.tryOnResultId`.
- `confirm-design` and `production-sheet` rely on selected pattern + selected try-on, not `applicationResultId`.
- Consumer UI must describe fallback as `示例预览` and must not expose provider/model/prompt/workId/resultId.

> ⚠️ The data shape is a design contract; the implementation does not currently exist on `main`. Do not assume any of these fields are read/written by current code.

---

## D014 · Deployment Verification Gate (added 2026-05-12)

After the 2026-05-12 incident (5-day silent build failure):

- Every `git push` to `main` MUST be followed by Vercel build verification within 5 minutes.
- If the build is RED, no further pushes to `main` are allowed until it is green again. The only allowed action is restoration (rollback or root-cause fix).
- "Done" requires four conditions simultaneously: `tsc` clean + pushed + Vercel green + production URL renders correctly. Three of four is not done.
- Local development environment success does NOT imply production success. The agent is forbidden from inferring deployment health from local tooling.

Authoritative source: `AGENTS.md` → Deployment Verification (MANDATORY).

## D015 · Stop-Loss Protocol (added 2026-05-12)

To prevent another 21-commit-blind-loop incident:

- 2 consecutive Vercel build failures → STOP and escalate.
- 3+ attempts at the same bug → STOP and escalate.
- 5+ modifications to the same file within 48h → STOP and escalate.
- A fix that does not change symptoms → STOP, re-investigate root cause, do not push another fix.

On stop trigger: state the trigger, list prior attempts and outcomes, propose 2–3 alternatives, wait for user decision. The agent does NOT pick the alternative.

Authoritative source: `AGENTS.md` → Stop-Loss Rules (MANDATORY).

## D016 · Bundle Size Budget (added 2026-05-12)

After the 2026-05-12 250MB-exceeded incident:

- Vercel Hobby serverless function unzipped size limit: 250MB.
- Working budget: ≤ 200MB (50MB safety headroom).
- `sharp` and `@prisma/client` must remain in `next.config.ts` → `serverExternalPackages`. Removing them will break deploys.
- Any new `dependency` (not `devDependency`) > 5MB requires explicit user discussion before install.
- After adding code that imports a new heavy package, verify Vercel build log's "Lambda size" section on next deployment.

## D017 · Environment Awareness (added 2026-05-12)

After the 2026-05-12 missing-env-vars incident:

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

- Before starting any task touching API routes, DB, or AI providers, confirm Vercel's most recent deployment succeeded. If it didn't, the env state may be broken — stop and ask the user.
- Production errors that look like missing env vars (`process.env.X is undefined`, Prisma connection failures, R2 401, Alipay signature mismatch) must be escalated to the user as an env-vars question, NOT silently patched with fallbacks.

Authoritative source: `AGENTS.md` → Environment Awareness (MANDATORY).

## D018 · Agent Honesty about Deployment State (added 2026-05-12)

After the 2026-05-12 incident, where rolled-back work was described as "completed" in docs:

- The agent MUST NOT use the words "deployed" / "live" / "shipped" / "上线" / "已发布" / "完成" / "done" for any feature unless the production URL has been verified responding correctly within the last hour.
- "Pushed" and "deployed" are different states. The agent must use "pushed" until production verification completes.
- When updating `DEVELOPMENT_LOG.md` / `PROJECT_STATUS.md` / `TASK_BACKLOG.md`, the agent must use the `[L]` / `[D]` / `[R]` status legend defined in `TASK_BACKLOG.md`. Do not collapse them into a single `[x]`.
- D012 (fallback honesty toward end users) and D018 (agent honesty toward project state) are sibling rules — both protect the project from optimistic misrepresentation.

Authoritative source: `AGENTS.md` → Deployment Verification (MANDATORY).
