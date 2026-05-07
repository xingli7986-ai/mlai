# MaxLuLu AI · CONTEXT_BRIEF

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

| Mainline | Goal | Status |
|---|---|---|
| A. Consumer purchase | products → order → pay → delivery | UI basis done, Alipay key blocks payment |
| B. Consumer creation | create work → print creation → virtual fitting → customization → production draft | Current focus |
| C. Designer ecosystem | onboard → professional Studio → publish → revenue share | Partial Studio tools done |

Current phase: **Mainline B, Batch 2.**

Batch 2 goal:

```text
real AI generation + save works + chain workId/resultId across tools
```

Current consumer creation flow:

```text
创建作品 → 印花创作 → 虚拟试穿 → 开始定制 → 生产资料草案 → 后台审核
```

Important implementation notes:

- `/my-studio/seamless` is no longer a consumer main-flow step; it is kept only as old-link compatibility / internal technical capability.
- `/my-studio/try-on` directly reads `selectedAssets.patternResultId` and can generate virtual fitting without `selectedAssets.applicationResultId`.
- `/my-studio/confirm-design` only requires selected pattern + selected try-on result.
- `productionDraft` is the minimal production draft carrier. `productionDraft.selectedApplicationResultId` is optional for old-work compatibility.
- Consumer pages must hide provider/model/prompt/workId/resultId/fallback technical fields.
- `studio-work-v1.bodyProfile` and `selectedAssets.garmentTemplateId` are the consumer-side fitting context. Try-on assets store body/profile and garment-template snapshots so revision history remains auditable without a DB migration.

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

## Completed and pushed

Completed consumer My Studio work:

- `/my-studio` home
- `/my-studio/pattern-generate`
- `/my-studio/seamless`
- `/my-studio/try-on`
- `/my-studio/sketch`
- my-studio specs and high-fidelity boards
- `.gitignore` cleanup
- temporary local font fallback

Pushed commits:

```text
75767d8 feat(my-studio): add sketch generation tool page
84b9c72 feat(my-studio): add try-on preview tool page
8f87ece feat(my-studio): add seamless fabric layout tool page
6305633 docs(my-studio): add tool specs and high-fidelity boards
c3e253a fix(my-studio): align home page values to spec 09
1331c9b feat(my-studio): add pattern generate tool page
8137141 feat(my-studio): polish visual layout and local font fallback
```

## Current unresolved items

1. Real try-on model quality and model/provider configuration still need production confirmation.
2. Generated images still need durable object storage/CDN strategy instead of relying on temporary/provider URLs.
3. Production draft fields need factory standards: fabric code, composition, gsm, width, print method, colorfastness, factory note format.
4. Formal PDF/export template is still pending; current export direction is browser print unless a PDF library/template is approved.
5. Admin production draft review needs fuller rules, status transitions, and audit behavior.
6. Payment/order handoff remains out of scope until business rules and Alipay credentials are confirmed.
7. Local font fallback works, but final high-fidelity font plan still needed.
8. Three design docs are modified locally and need separate review:
   - PRD v1.1
   - User Flow v1.1
   - Sitemap v1.1

## Recommended next task

Stabilize the consumer creation closed loop:

- verify direct-use print → selected pattern → virtual fitting → selected try-on → confirm design → production draft
- validate image2 / try-on provider behavior and fallback copy
- harden production draft API/UI and admin review states
- define storage/CDN strategy for generated images
- define factory production draft fields and final PDF/export requirements
