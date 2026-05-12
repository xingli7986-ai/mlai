# MaxLuLu AI · CONTEXT_BRIEF

## Current Production State (2026-05-12 post-incident)

| Field | Value |
|---|---|
| Production URL | https://mlai-app.vercel.app |
| Current baseline | 5/5 commit `435e494` + post-rollback fixes (`54d9f34`, `7ea6335`) |
| Last verified green build | `7ea6335` on 2026-05-12 |
| Build status | ✅ Green (restored after 5-day outage 2026-05-07 → 2026-05-12) |
| Env vars verified on Vercel | 2026-05-12 |
| Latest incident | 2026-05-12 — see `DEVELOPMENT_LOG.md` |

> ⚠️ All work pushed between 2026-05-07 (commit `937eb30`) and 2026-05-12 (commit `6a0965c`) was **rolled back via force push**. That includes: body profile gate, FASHN try-on provider scaffold, image2 edit reference try-on, masked garment try-on, custom order confirmation flow, production draft, work creation API, `lib/my-studio/types.ts`, `lib/my-studio/work.ts`, `lib/my-studio/tryon-provider.ts`, and the StudioOverviewCards / StudioStepEntrypoints / StudioWorksPreview components (which were imported but never actually created — the original breakage).
>
> The rolled-back commits are preserved on the local `backup-before-rollback` branch only; they are not on `origin/main`. **Do not treat any feature described in this brief as live unless it is also listed under "Verified live on production" below.**

### Verified live on production (5/5 baseline)

- `/my-studio` — consumer My Studio home (hero + stats + 4 tool entries + works preview)
- `/my-studio/pattern-generate` — basic prompt input + style tags + API attempt + mock fallback
- `/my-studio/seamless` — basic seamless tile UI + API attempt + mock fallback
- `/my-studio/try-on` — basic try-on UI + API attempt + mock fallback (simple 5/5 version, NOT the 5/7-5/11 rewrite)
- `/my-studio/sketch` — basic sketch UI + API attempt + SVG fallback

### NOT live (rolled back, do not assume working)

- Personal try-on with body profile + garment template
- FASHN try-on provider integration
- image2 `/images/edits` reference try-on
- Masked garment try-on
- `/my-studio/confirm-design`
- `/my-studio/production-sheet` consumer-facing draft view
- Admin production draft list
- Work creation/persistence APIs (`/api/my-studio/works/*`)
- `studio-work-v1` metadata model (bodyProfile, garmentTemplates, productionDraft, etc.)

---

## What this project is

MaxLuLu AI is a premium women's fashion ecommerce and AI print-creation platform.

Core products:
- knitted printed dresses
- A-line dresses
- deep-V wrap dresses
- midi printed dresses

Brand direction:
- Shanghai premium womenswear
- refined, restrained, modern
- print-driven feminine power
- DVF / Toteme / NET-A-PORTER / Mytheresa reference
- slogan: `Fashion For You — 每一朵印花，都由你绽放`

Primary UI palette:
- Porcelain Cyan `#234A58`
- Smoked Rose `#C06A73`
- Certified Gold `#C8A875`
- Background `#F3F6F6`
- Surface `#FCFDFD`

## Current product mainlines

| Mainline | Goal | Status (post-rollback) |
|---|---|---|
| A. Consumer purchase | products → order → pay → delivery | UI basis done, Alipay key blocks payment |
| B. Consumer creation | create work → print creation → virtual fitting → customization → production draft | **Reset to Batch 1** after 5/12 rollback. Batch 2 attempt failed and is removed. |
| C. Designer ecosystem | onboard → professional Studio → publish → revenue share | Partial Studio tools done |

Current phase: **Mainline B, restart of Batch 2 planning. Do NOT re-attempt 5/7-5/11 architecture without an explicit new plan.**

Previous (failed) Batch 2 goal was:

```text
real AI generation + save works + chain workId/resultId across tools
```

This attempt failed in production (see 5/12 incident). A second attempt requires:

1. A working Vercel deployment baseline (currently restored ✅).
2. Env vars verified before writing any DB / API code.
3. Smaller, incrementally-verified commits — each deployed and verified green before the next.

## Studio boundary

### Consumer My Studio

Routes:

```text
/my-studio
/my-studio/pattern-generate
/my-studio/seamless
/my-studio/try-on
/my-studio/sketch
```

This is for ordinary consumers. Use ConsumerNav, light premium fashion UI, no professional sidebar.

### Professional OPC / Designer Studio

Typical signs:
- left professional sidebar
- 图案工作室 / 图案生成 / 四方连续 / 工艺融合 / 服装实验室
- professional designer workflow

Do not confuse it with `/my-studio/*`.

## Important implementation notes

> ⚠️ The previous version of this section described `studio-work-v1` metadata, `selectedAssets.patternResultId`, `productionDraft`, `bodyProfile` snapshots, and try-on revision history. **All of those were part of the 5/7-5/11 architecture that was rolled back.** They do not exist in the current codebase. Any future re-implementation needs to start from the 5/5 baseline (which has no work persistence, no body profile gate, no production draft).

Current 5/5 baseline reality:

- Try-on / pattern / seamless / sketch pages each maintain their own local state (no cross-tool chaining).
- No DB-backed "work" entity for consumer creations. The Prisma `Design` model is used by older paths; consumer my-studio pages use mock data + localStorage.
- AI generation goes through `/api/ai-studio/generate` which calls `generateWithGPTImage2` from `lib/suchuang.ts`. This is the original 5/5 flow — no `pattern-apply` / try-on / FASHN / masked / reference-image branches.
- Fallback images come from `lib/my-studio/fallbacks.ts` does NOT exist on current main (it was added in 5c3633b which got rolled back).

## Recommended next task

Before doing anything else, agree with the user on a plan that satisfies all of:

1. Builds and verifies live before introducing the next change (per `AGENTS.md` Deployment Verification rules).
2. Re-introduces persistence only after env vars / DB connectivity are verified end-to-end on production.
3. Does not re-introduce the 937eb30-style "import 5 components, only build 2" pattern. Every new import must reference a file that exists in the same commit.
4. Stays within Vercel Hobby 250MB lambda budget (target ≤ 200MB).

Do NOT auto-restart Batch 2 without explicit user direction. The previous Batch 2 plan is on hold.
