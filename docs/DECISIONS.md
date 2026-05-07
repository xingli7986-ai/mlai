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

| Batch | Scope | Status |
|---|---|---|
| 1 | consumer tool pages UI + interaction | Done |
| 2 | real AI generation + save works + chaining | Current |
| 3 | custom configuration + payment | Not started |
| 4 | production sheet + admin review + PDF | Not started |
| 5 | order/factory/logistics status | Not started |

Batch 2 must be completed before payment/work-order/factory work.

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

## D008 · Current not-in-scope items

Do not start these unless explicitly requested:

- Alipay payment implementation
- custom configuration page
- production sheet PDF
- factory integration
- logistics notification
- designer revenue share

## D009 · Consumer creation flow simplified

The consumer-facing AI fashion design flow is confirmed as:

```text
创建作品 → 印花创作 → 虚拟试穿 → 开始定制 → 生产资料草案 → 后台审核
```

Decision details:

- `印花应用效果` / `seamless` / `四方连续` is no longer a consumer main-flow step.
- `/my-studio/seamless` remains only for old-link compatibility or internal technical capability.
- `/my-studio/try-on` is the consumer main-flow virtual fitting page and reads the selected pattern directly.
- `/my-studio/confirm-design` must not require `selectedAssets.applicationResultId`; it only requires selected pattern + selected try-on result.
- `productionDraft.selectedApplicationResultId` remains optional for backward compatibility with old works.

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

Standardized metadata fields in `studio-work-v1`:

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
