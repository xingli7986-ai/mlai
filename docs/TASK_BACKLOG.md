# MaxLuLu AI · TASK_BACKLOG

## P0 · Mainline B Batch 2

### Completed / substantially implemented in current local work

- [x] Reuse existing `Design.colorAnalysis` as `studio-work-v1` metadata instead of adding a new DB model.
- [x] Create and read consumer works through `/api/my-studio/works`.
- [x] Persist generated/selected digital assets in work metadata.
- [x] Persist `assets.patterns`, `assets.tryOns`, selected pattern, selected try-on, inspiration board, and generation groups.
- [x] Implement print creation center with official/library/community/favorites/history sources.
- [x] Copy direct-use public/seed prints into the current work as pattern asset snapshots.
- [x] Connect image2/YXAI for pattern generation where configured, with fallback marked as fallback.
- [x] Seed first version of community print examples under local assets.
- [x] Reframe consumer flow to `印花创作 → 虚拟试穿 → 开始定制 → 生产资料草案`.
- [x] Keep `/my-studio/seamless` only as compatibility/internal technical route.
- [x] Make `/my-studio/try-on` read selected pattern directly; application asset is optional.
- [x] Add minimal `/my-studio/confirm-design`.
- [x] Generate minimal `productionDraft` metadata.
- [x] Add minimal production draft view and admin production draft list capability.
- [x] Hide provider/model/prompt/workId/resultId/fallback technical details from consumer UI.
- [x] Standardize `bodyProfile` + `garmentTemplates` inside `studio-work-v1` metadata without DB migration.
- [x] Add `/my-studio` body profile gate and pass saved body profile into newly created works.
- [x] Make try-on generation carry `patternAssetId`, `patternImageUrl`, `bodyProfile`, `garmentTemplate`, `fitPreference`, and `revisionReason`.
- [x] Append fitting revisions into `assets.tryOns[]` and update only `selectedAssets.tryOnResultId` for the current fitting.
- [x] Persist body/profile and garment-template snapshots into try-on assets and `productionDraft`.

### AI generation and auth

- [x] Inspect and extend `/api/ai-studio/generate`
- [x] Confirm and preserve supported tool keys:
  - [x] `pattern-generate`
  - [x] `seamless-tile` / compatibility
  - [x] `pattern-apply`
  - [x] `sketch-generate` / compatibility
- [x] Align generation authorization with existing auth/session helpers
- [x] Preserve admin unlimited AI rule for configured/admin phone
- [ ] Confirm final production AI usage rules for normal consumers

### Work persistence

- [x] Inspect existing Prisma models for designs/works/creations
- [x] Reuse `Design` + `colorAnalysis` metadata for consumer studio works
- [x] Define saved result schema:
  - [x] pattern result
  - [x] application result as optional legacy/technical asset
  - [x] try-on result
  - [x] sketch result as non-consumer-main-flow production asset
  - [x] status/currentStep
  - [x] image URLs / metadata
- [x] Build save endpoints for work/result persistence

### Tool chaining

- [x] pattern-generate saves work assets and uses real `workId`
- [x] try-on reads selected pattern by `workId`
- [x] try-on saves result and updates work
- [x] confirm-design reads selected pattern + selected try-on and writes `productionDraft`
- [x] production-sheet reads selected assets and production draft
- [x] `/my-studio` reads updated works
- [x] `/my-studio/seamless` remains compatible but is not a consumer main-flow step

### Home page and works

- [x] `/my-studio` works area reads real saved works
- [x] empty/data states connected
- [x] work card actions route to correct main-flow step
- [x] status badges reflect current work state

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
- [ ] Update project docs when Batch 2 starts/finishes
