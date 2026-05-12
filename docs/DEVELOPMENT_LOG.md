# MaxLuLu AI · DEVELOPMENT_LOG

## Validation template (mandatory from 2026-05-12)

Every "Completed" entry below must include a Validation block of the form:

```
### Validation
- `npx tsc --noEmit`: pass (commit <hash>)
- Vercel build: <green | red> — <build URL or commit hash>
- Production URL verified: <yes / no — URL + timestamp>
```

Entries without all three lines are NOT complete. Local `tsc` alone is no longer sufficient.

---

## 2026-05-12 · INCIDENT — Five-day silent build failure + 21-commit rollback

### Trigger

User reported that the my-studio try-on feature failed to generate results on production.

### Investigation

- Discovered `app/my-studio/page.tsx` had imported 3 components (`StudioOverviewCards`, `StudioStepEntrypoints`, `StudioWorksPreview`) since commit `937eb30` on 2026-05-07, but the component files had **never been created** in any commit.
- Re-ran `npx tsc --noEmit` and confirmed 3 module-not-found errors. These errors had been present for 5 days.
- Vercel build had been red since `937eb30` was pushed, but no one noticed because there was no deployment-verification habit.
- Subsequent commits (5/8 - 5/11, 18 of them) were piled on top of the red baseline, including new code that pushed the serverless function over the 250MB Vercel Hobby limit.
- Vercel environment variables had also been lost / reset around the same window, masking the build symptoms with additional runtime errors.

### Impact

- 21 commits pushed to `main` between 2026-05-07 and 2026-05-12, of which 0 ever reached production.
- ~3 calendar days of work lost (5/8, 5/9, 5/11 — 5/10 had no commits).
- Features that never actually shipped despite being marked "done" in docs:
  - body profile gate
  - FASHN try-on provider scaffold
  - image2 `/images/edits` reference try-on
  - masked garment try-on
  - custom order confirmation flow (`/my-studio/confirm-design`)
  - production draft + admin draft list
  - work creation/persistence APIs (`/api/my-studio/works/*`)
  - `studio-work-v1` metadata model (bodyProfile, garmentTemplates, productionDraft)

### Root cause

Primary: Vercel environment variables were lost; nobody noticed because there was no deployment verification step in the agent's loop. Build failures were treated as "weird local bugs" and "fixed" by pushing more code.

Secondary: `937eb30` introduced imports for files that didn't exist in the same commit, causing tsc to fail immediately. Local development continued to "work" because the failures were on `app/my-studio/page.tsx` only, and the user was testing other pages.

Tertiary: The cumulative weight of FASHN scaffold + image2 edit + masked try-on + many retry/timeout fixes pushed the lambda over 250MB. Even if the env vars had been correct, the function would have failed to deploy.

### Why not detected sooner

- No "after push, check Vercel" rule.
- No "after build failure, stop" rule.
- `docs/DEVELOPMENT_LOG.md` had no entries for 5/8 - 5/11 (4-day gap during the failure window).
- `docs/TASK_BACKLOG.md` `[x]` marker conflated "locally tsc clean" with "deployed to production".
- `AGENTS.md` "Read first" listed docs that documented features as done when they actually weren't.

### Action taken on 2026-05-12

1. Created safety branch `backup-before-rollback` from previous HEAD (preserves all 21 commits locally).
2. `git reset --hard 435e494` to last-known-good commit (5/5).
3. Re-applied two verified improvements on the clean baseline:
   - `next.config.ts` → `serverExternalPackages: ['sharp', '@prisma/client']` (`54d9f34`).
   - Defensive `width="28" height="28"` on `.msStat` SVG icons (`7ea6335`).
4. Force-pushed to `main` (user explicitly authorized).
5. Verified Vercel rebuild green on commit `7ea6335`.
6. Rewrote `AGENTS.md`, `docs/CONTEXT_BRIEF.md`, `docs/PROJECT_STATUS.md`, `docs/TASK_BACKLOG.md`, `docs/DECISIONS.md`, `docs/DEVELOPMENT_LOG.md` to add the rules that would have prevented this.

### Action items (preventive)

- [D] `AGENTS.md` adds mandatory rules: Deployment Verification / Stop-Loss / Environment Awareness / Vercel Hobby Constraints (this commit).
- [D] `docs/DECISIONS.md` adds D014 (deployment gate) / D015 (stop-loss) / D016 (bundle budget) / D017 (env vars) / D018 (agent honesty) (this commit).
- [D] `docs/PROJECT_STATUS.md` adds "Production Deployment Health" table at the top, separating "Pushed" from "Deployed" (this commit).
- [D] `docs/TASK_BACKLOG.md` introduces `[ ] / [L] / [D] / [R]` status legend, replacing single `[x]` (this commit).
- [ ] Push `backup-before-rollback` branch to `origin` so the 21 rolled-back commits are not local-only.
- [ ] Set up Vercel deploy notification (Slack / email) so future build failures don't go 5 days unnoticed.
- [ ] Document Vercel env vars audit process (who can rotate, where the canonical list lives).
- [ ] Plan a new Batch 2 with deployment verification gates between every increment.

### Validation

- `npx tsc --noEmit`: pass (commit pending after this docs commit)
- Vercel build: green at `7ea6335` (pre-docs commit) — re-verify after this docs commit lands.
- Production URL verified: https://mlai-app.vercel.app rendered correctly at `7ea6335` on 2026-05-12.

---

## 2026-05-07 · Mainline B consumer creation flow practical rebuild [ROLLED BACK 2026-05-12]

> ⚠️ The work described in this entry was rolled back on 2026-05-12 and is no longer on `main`. Code preserved on the `backup-before-rollback` branch. Validation below is **retroactively invalid** — `tsc` may have passed locally but Vercel build was red the entire time.

### Goal

Move the consumer AI fashion design flow from isolated technical tools into a work-centered consumer journey:

```text
创建作品 → 印花创作 → 虚拟试穿 → 开始定制 → 生产资料草案 → 后台审核
```

### Attempted locally

- improved visitor/authorized state behavior across consumer navigation
- added password login support for admin phone through server-side credentials/environment configuration
- extended `/api/ai-studio/generate` with `pattern-apply` / fidelity modes / FASHN / image2 edit branches
- added work/result APIs under `/api/my-studio`
- persisted pattern assets, try-on assets, selected asset ids, generation groups, inspiration board, preference memory in `studio-work-v1` metadata
- evolved `/my-studio/pattern-generate` into a print creation center with official library / community seeds / favorites / inspiration board / history groups / direct-use / remix generation
- rebuilt `/my-studio/try-on` as the consumer `虚拟试穿` page with body profile + garment template + fitting history
- added `/my-studio/confirm-design` and `/my-studio/production-sheet`
- added minimal admin production draft list capability

### Validation (retroactively invalid)

- `npx tsc --noEmit`: was passing locally at the time
- Vercel build: **RED — never went green between 2026-05-07 and 2026-05-12** (only discovered on 2026-05-12)
- Production URL: **never verified for this work** — this is the root failure that the 2026-05-12 incident retro addresses

### Lessons learned (now hardened into rules — see D014-D018)

1. Flow changes must be chain-level changes. Updating only one page is not enough.
2. UI boards are not implementation assets. Every UI delivery should include usable assets, specs, instructions, and acceptance criteria.
3. User-generated content must persist as digital assets.
4. Fallback/mock must stay honest.
5. Error handling must protect internals.
6. **(NEW after 5/12)** Local tsc pass + manual smoke test ≠ deployment success. Production URL verification is mandatory before claiming completion.
7. **(NEW after 5/12)** Same-day repeated commits with similar messages (`fix: try-on timeout`, `fix: stabilize try-on`, etc.) are a stop-loss trigger, not normal work.

---

## 2026-05-07 · Print to personal fitting loop completion [ROLLED BACK 2026-05-12]

> ⚠️ Rolled back. Code on `backup-before-rollback`. Same retroactive validation invalidity as above entry.

### Attempted

- standardized `studio-work-v1.bodyProfile` with height, weight, optional measurements, usual size, body shape, fit preference, measurement mode, update time
- standardized consumer garment templates and `selectedAssets.garmentTemplateId`
- added `/my-studio` body profile gate
- changed print cards in `/my-studio/pattern-generate` (`使用此印花试穿` / `参考生成新印花并试穿`)
- rebuilt `/my-studio/try-on` around selected pattern + body profile + garment template
- try-on generation request carried `patternAssetId`, `patternImageUrl`, `bodyProfile`, `garmentTemplate`, `fitPreference`, optional `revisionReason`
- fitting revisions appended into `assets.tryOns[]`
- `confirm-design` read selected pattern + selected try-on and showed body/template summary
- `production-sheet` displayed selected pattern, selected try-on, body profile, garment-template snapshots

### Validation (retroactively invalid)

- `npx tsc --noEmit`: was passing locally
- Vercel build: **RED — never went green**
- Production URL: **never verified**

---

## 2026-05-05 · Mainline B Batch 1 completed [VERIFIED LIVE]

### Goal

Implement consumer My Studio home and 4 consumer AI tool pages:

```text
/my-studio
/my-studio/pattern-generate
/my-studio/seamless
/my-studio/try-on
/my-studio/sketch
```

### Completed

#### `/my-studio`

- consumer My Studio home
- Hero / stats / 4 tool entries / works preview
- aligned to spec 09
- removed V2 debug marker

Commits:

```text
8137141 feat(my-studio): polish visual layout and local font fallback
c3e253a fix(my-studio): align home page values to spec 09
```

#### `/my-studio/pattern-generate`

- prompt input, 200 char limit
- style tags multi-select
- print type selection
- API attempt with mock fallback
- idle/loading/result/error
- result images must be floral/pattern images
- save toast
- next to `/my-studio/seamless`
- recent history prepend

Commit:

```text
1331c9b feat(my-studio): add pattern generate tool page
```

#### `/my-studio/seamless`

- source pattern, layout mode, sliders, background color
- API attempt with mock fallback
- idle/loading/result/error
- fabric preview / placement tab
- result must be fabric/pattern image
- save toast
- next to `/my-studio/try-on`
- recent history prepend

Commit:

```text
8f87ece feat(my-studio): add seamless fabric layout tool page
```

#### `/my-studio/try-on` (Batch 1 simple version)

- template, sleeve, skirt length controls
- source pattern card
- API attempt with mock fallback
- idle/loading/result/error
- result must be model/garment try-on image
- save toast
- custom order placeholder
- publish placeholder
- next to `/my-studio/sketch`
- recent history prepend

Commit:

```text
84b9c72 feat(my-studio): add try-on preview tool page
```

#### `/my-studio/sketch`

- neckline, sleeve, skirt length, waistline, description
- API attempt with inline SVG fallback
- idle/loading/result/error
- result must be front/back fashion line sketch
- save toast
- attach to current work toast
- return to `/my-studio`
- recent history prepend

Commit:

```text
75767d8 feat(my-studio): add sketch generation tool page
```

#### Design documentation

- added my-studio specs
- added debug checklist
- added 4 high-fidelity v2 boards
- fixed `.gitignore`

Commit:

```text
6305633 docs(my-studio): add tool specs and high-fidelity boards
```

### Validation (5/5 — retroactively confirmed live on 5/12)

- `npx tsc --noEmit`: pass
- Desktop `1440×900` screenshot checked
- Mobile `375×800` screenshot checked
- Result-type constraints checked
- Vercel build: green at the time
- Production URL: re-verified on 2026-05-12 as `7ea6335` rolled-back baseline still rendering correctly

### Issues discovered

1. Consumer My Studio entry may route to professional OPC Studio if href is wrong.
2. `next/font/google` caused cold-start failure; temporary system fallback added.
3. One design doc was incorrectly overwritten by User Flow content and restored.
4. 3 design docs remain modified locally and require review.

### Next (at the time — superseded by 5/12 rollback)

Mainline B Batch 2:

```text
real AI generation + save works + tool chaining
```

This was attempted between 5/7 and 5/11 and was rolled back on 5/12 (see incident entry at top).
