# MaxLuLu AI · PROJECT_STATUS

Last updated: 2026-05-12 (post-incident rebuild)

## Production Deployment Health

| Field | Value |
|---|---|
| Vercel Project | mlai-app |
| Production URL | https://mlai-app.vercel.app |
| Last green build | `7ea6335` on 2026-05-12 |
| Current build status | ✅ Green |
| Env vars verified | 2026-05-12 |
| Bundle size budget | ≤ 200MB (Vercel Hobby cap 250MB) |
| Current bundle status | Within budget (sharp + @prisma/client in `serverExternalPackages`) |

> ⚠️ **Stop-loss rule**: If `Current build status` becomes RED, ALL feature development is automatically paused. The only allowed work is build restoration. See `AGENTS.md` → Stop-Loss Rules.

### Recent build history

| Date | Commit | Status | Notes |
|---|---|---|---|
| 2026-05-12 | `7ea6335` | ✅ Green | Defensive SVG width/height attributes |
| 2026-05-12 | `54d9f34` | ✅ Green | Rollback to 5/5 baseline + serverExternalPackages |
| 2026-05-07 → 2026-05-12 | `937eb30` → `6a0965c` | ❌ Red (5 days silent) | 21 commits silently failing on Vercel; rolled back |
| 2026-05-05 | `435e494` | ✅ Green | 5/5 baseline (current restoration target) |

## Project overview

| Item | Status |
|---|---|
| Project | MaxLuLu AI |
| Type | premium womenswear ecommerce + AI print-creation platform |
| Current mainline | B. Consumer creation flow (restart pending) |
| Current phase | **Post-incident stabilization. Batch 2 attempt failed and was rolled back.** |
| Recent milestone (verified live) | 4 consumer My Studio tool pages live on 5/5 baseline |

## Mainlines

| Mainline | Goal | Status (verified live) |
|---|---|---|
| A. Consumer purchase | browse → group/custom order → pay → delivery | UI basis live, Alipay key blocks payment |
| B. Consumer creation | create work → print creation → personal fitting → customization → production draft | **Reset to Batch 1.** Batch 2 attempt rolled back 2026-05-12. |
| C. Designer ecosystem | onboard → professional Studio → publish → revenue share | partially live, publish/revenue share pending |

## Batch plan for Mainline B

| Batch | Scope | Status |
|---|---|---|
| 1 | 4 consumer tool pages UI + interaction | **Live (5/5)** |
| 2 | real AI generation + save works + tool chaining | **Failed attempt rolled back. Awaits new plan.** |
| 3 | custom configuration + payment | Not started, blocked by Alipay key |
| 4 | production sheet + admin review + PDF export | Not started |
| 5 | order status + factory + logistics | Not started |

## Pages — pushed vs deployed

> Pushed = on `origin/main`. Deployed = Vercel build green AND production URL renders. Only "Deployed" counts as done.

| Route | Pushed | Deployed | Notes |
|---|---|---|---|
| `/my-studio` | ✅ | ✅ | 5/5 inline 268-line version, hero + stats + tools + works preview |
| `/my-studio/pattern-generate` | ✅ | ✅ | basic prompt + style tags + API attempt + mock fallback |
| `/my-studio/seamless` | ✅ | ✅ | basic seamless UI + API attempt + mock fallback |
| `/my-studio/try-on` | ✅ | ✅ | basic try-on UI + API attempt + mock fallback (5/5 simple version) |
| `/my-studio/sketch` | ✅ | ✅ | basic sketch UI + API attempt + SVG fallback |
| `/my-studio/confirm-design` | ❌ | ❌ | rolled back |
| `/my-studio/production-sheet` | ❌ | ❌ | rolled back |
| `/api/my-studio/works/*` | ❌ | ❌ | rolled back |

## Last successfully deployed commits

> These are the commits currently live on production. Always cross-check with `git log --oneline -10` against `origin/main` — do not rely on this static list past 2026-05-15.

```text
7ea6335 fix: add explicit SVG dimensions to stats icons
54d9f34 rollback to 5/5 baseline + add serverExternalPackages
435e494 docs: merge AGENTS.md with project context
360f567 fix: my-studio tools auth flow + prompt dedup
46c0dcc fix: my-studio tool card links point to consumer routes
75767d8 feat(my-studio): add sketch generation tool page
84b9c72 feat(my-studio): add try-on preview tool page
8f87ece feat(my-studio): add seamless fabric layout tool page
6305633 docs(my-studio): add tool specs and high-fidelity boards
c3e253a fix(my-studio): align home page values to spec 09
```

## Current blockers

| Blocker | Severity | Impact | Next action |
|---|---|---|---|
| Batch 2 architecture failed | High | 5 days of work lost, persistence/try-on/order draft features removed | Define new Batch 2 plan with deployment verification gates |
| Vercel env vars management | High | Lost env vars caused silent 5-day failure | Document env var rotation/audit process; treat env var loss as P0 incident |
| production try-on provider quality | Medium | Real fitting output still needs model/provider QA | Validate configured YXAI/image2 behavior and decide final try-on provider |
| generated image storage strategy | Medium | Provider URLs may not be durable enough for production | Define R2/CDN persistence policy |
| factory production draft fields | Medium | Draft still uses TODO standards | Collect fabric/factory/PDF rules |
| Alipay key missing | Medium | Payment flow blocked | Product owner obtains Alipay credentials |
| font fallback not final | Low | Visual fidelity limited | Later next/font/local task |

## Local working tree note

The following docs may still be modified locally and require separate review:

```text
design/MaxLuLu AI 产品需求文档（PRD）v1.1.md
design/MaxLuLu AI 用户流程（User Flow）v1.1.md
design/MaxLuLu AI 页面清单（Sitemap）v1.1.md
```

Do not auto-commit these.
