# MaxLuLu AI · TASK_BACKLOG

## Status legend (added 2026-05-12)

| Marker | Meaning |
|---|---|
| `[ ]` | Not started |
| `[L]` | Locally implemented (tsc clean) — **NOT yet verified live** |
| `[D]` | Deployed AND verified on production URL |
| `[R]` | Rolled back — was attempted but reverted; do not assume the code exists |

> Only `[D]` counts as done. Any task marked `[L]` for more than 48h without becoming `[D]` should be investigated (likely a deploy failure was missed).
>
> The 2026-05-12 incident retrospective revealed that the previous `[x]` marker conflated "locally implemented" with "done", which directly enabled the 5-day silent failure. The two-state model is mandatory going forward.

## P0 · Mainline B Batch 2 (FAILED ATTEMPT — rolled back 2026-05-12)

> ⚠️ Everything below in this section was attempted between 2026-05-07 and 2026-05-11. The implementation was force-pushed off `main` on 2026-05-12. Code preserved only on the local `backup-before-rollback` branch.
>
> Do NOT re-mark these as `[L]` or `[D]` without explicitly cherry-picking the code back AND verifying it on production. The new Batch 2 plan should be designed from scratch with incremental deployment verification.

### Work persistence (rolled back)

- [R] Reuse existing `Design.colorAnalysis` as `studio-work-v1` metadata
- [R] Create and read consumer works through `/api/my-studio/works`
- [R] Persist generated/selected digital assets in work metadata
- [R] Persist `assets.patterns`, `assets.tryOns`, selected pattern/try-on, inspiration board, generation groups
- [R] Implement print creation center (official/library/community/favorites/history sources)
- [R] Copy direct-use public/seed prints as pattern asset snapshots
- [R] Connect image2/YXAI for pattern generation with fallback marking
- [R] Seed first version of community print examples
- [R] Reframe consumer flow to `印花创作 → 虚拟试穿 → 开始定制 → 生产资料草案`
- [R] Make `/my-studio/try-on` read selected pattern directly; application asset optional
- [R] Add minimal `/my-studio/confirm-design`
- [R] Generate minimal `productionDraft` metadata
- [R] Add minimal production draft view and admin production draft list
- [R] Hide provider/model/prompt/workId/resultId/fallback technical details
- [R] Standardize `bodyProfile` + `garmentTemplates` inside `studio-work-v1` metadata
- [R] Add `/my-studio` body profile gate; pass saved body profile into newly created works
- [R] Make try-on generation carry `patternAssetId`, `patternImageUrl`, `bodyProfile`, `garmentTemplate`, `fitPreference`, `revisionReason`
- [R] Append fitting revisions into `assets.tryOns[]`
- [R] Persist body/profile and garment-template snapshots into try-on assets and `productionDraft`

### Try-on provider work (rolled back)

- [R] FASHN try-on provider scaffold (`lib/my-studio/tryon-provider.ts`)
- [R] image2 `/images/edits` reference try-on path in `/api/ai-studio/generate`
- [R] Masked garment try-on path
- [R] Reference-image fidelity mode
- [R] Garment template render helpers (`lib/my-studio/garment-template-render.ts`)
- [R] Body profile + garment template typed definitions (`lib/my-studio/types.ts`)
- [R] Work store helpers (`lib/my-studio/work.ts`)
- [R] Multiple rounds of try-on timeout / abort / hang fixes (5/11 commits 2b86f74, 7104286, ac4ac94, 2490f58, 3ec0c38, 9dab8bd)

### Refactor casualties (rolled back)

- [R] `StudioOverviewCards` component (imported by `/my-studio/page.tsx` but **never actually created** — the original 5/12 build-breaking bug)
- [R] `StudioStepEntrypoints` component (same — never created)
- [R] `StudioWorksPreview` component (same — never created)
- [R] `BodyProfileGate` component (created but orphaned after page rollback)
- [R] `CreateDesignButton` component (created but orphaned after page rollback)
- [R] Custom order confirmation flow (`/my-studio/confirm-design/page.tsx` 650 lines)
- [R] `StudioStepGate`, `StudioWorkSummary` helper components

### Items that remain `[D]` from 5/5 baseline

These were implemented before the failed Batch 2 attempt and survived the rollback:

- [D] `/my-studio` home with hero / stats / 4 tool entries / works preview (inline 268-line version)
- [D] `/my-studio/pattern-generate` basic UI with prompt + style tags + API attempt + mock fallback
- [D] `/my-studio/seamless` basic UI with API attempt + mock fallback
- [D] `/my-studio/try-on` basic UI with API attempt + mock fallback (simple version — NOT the rolled-back rewrite)
- [D] `/my-studio/sketch` basic UI with API attempt + SVG fallback
- [D] `/api/ai-studio/generate` with `pattern-generate` / `seamless-tile` / `pattern-apply` / `sketch-generate` tool keys (basic version, no fidelity modes)
- [D] Admin unlimited AI rule for configured admin phone
- [D] `serverExternalPackages: ['sharp', '@prisma/client']` in `next.config.ts` (added 2026-05-12 post-rollback)
- [D] Explicit `width="28" height="28"` on `.msStat` SVG icons (added 2026-05-12 defensive)

## P1 · Plan a NEW Batch 2 (before resuming any work)

- [ ] Confirm Vercel env vars baseline (already verified 2026-05-12 — re-check before any DB code)
- [ ] Decide whether to re-implement work persistence (Prisma-backed) or stick with current localStorage approach
- [ ] If re-implementing: design smaller, deployment-verified increments — each step must be `[D]` before the next starts
- [ ] If re-implementing: avoid the 937eb30 "import 5 components, build 2" pattern — every import must reference a file that exists in the same commit
- [ ] Decide whether to re-introduce body profile gate, custom order confirmation, production draft (if yes, in what order)
- [ ] Decide whether to keep try-on as `/api/ai-studio/generate` extension or a separate `/api/my-studio/try-on` endpoint
- [ ] Document the new plan in a fresh design spec (e.g. `design/12_my-studio_batch2_v2.md`) before writing code

## P1 · Custom order and publish

- [ ] finalize custom order entry after confirm-design / production draft rules
- [ ] publish to inspiration
- [ ] design order model
- [ ] Alipay key setup
- [ ] payment status handling

## P1 · Production draft and admin review

- [ ] standardize production draft fields:
  - [ ] fabric code
  - [ ] fabric composition
  - [ ] gsm
  - [ ] width
  - [ ] print method
  - [ ] colorfastness standard
  - [ ] craft notes
  - [ ] factory notes
- [ ] formal PDF / print template
- [ ] admin review rules and audit trail
- [ ] approved/rejected revision loop
- [ ] decide whether payment is before or after admin approval

## P1 · Image generation and storage

- [ ] production-grade virtual try-on model/provider
- [ ] QA whether current image2 provider can reliably preserve selected print and body proportions for fitting
- [ ] image quality controls and moderation policy
- [ ] persist generated images to R2/CDN/object storage
- [ ] public print library backend and licensing/authorization rules
- [ ] replace seed/mock community prints with real public asset source

## P1 · Professional designer ecosystem

- [ ] keep consumer My Studio separate from OPC Studio
- [ ] designer publish flow
- [ ] certified designer visuals
- [ ] revenue share placeholder/model

## P2 · Visual and technical polish

- [ ] local fonts with `next/font/local`
- [ ] extract shared AI Studio components
- [ ] unify toast component
- [ ] unify loading animation
- [ ] polish mobile states
- [ ] improve generated image quality

## P2 · Document review

- [ ] Review PRD v1.1 local M diff
- [ ] Review User Flow v1.1 local M diff
- [ ] Review Sitemap v1.1 local M diff
- [ ] Decide commit or restore

## P0 · Operational hygiene (added 2026-05-12 post-incident)

- [ ] Push `backup-before-rollback` branch to `origin` so the 21 rolled-back commits are not local-only
- [ ] Document env var rotation/audit process (where the canonical list lives, who has write access, alert if any drift)
- [ ] Decide whether to keep `replicate` npm dependency (currently in 5/5 `package.json` but no longer imported anywhere — flagged but kept for backward compatibility)
- [ ] Set up Vercel deploy notification (Slack / email) so future build failures don't go 5 days unnoticed
