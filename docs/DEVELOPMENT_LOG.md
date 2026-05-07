# MaxLuLu AI · DEVELOPMENT_LOG

## 2026-05-05 · Mainline B Batch 1 completed

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

#### `/my-studio/try-on`

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

### Validation

For each tool page:

- `npx tsc --noEmit` passed
- Desktop `1440×900` screenshot checked
- Mobile `375×800` screenshot checked
- Result-type constraints checked:
  - pattern-generate: no model/dress/try-on/sketch
  - seamless: no model/try-on/sketch
  - try-on: must be model/garment
  - sketch: must be line sketch only

### Issues discovered

1. Consumer My Studio entry may route to professional OPC Studio if href is wrong.
2. `next/font/google` caused cold-start failure; temporary system fallback added.
3. One design doc was incorrectly overwritten by User Flow content and restored.
4. 3 design docs remain modified locally and require review.

### Next

Mainline B Batch 2:

```text
real AI generation + save works + tool chaining
```

Start with read-only investigation of API/auth/models.

## 2026-05-07 · Mainline B consumer creation flow practical rebuild

### Goal

Move the consumer AI fashion design flow from isolated technical tools into a work-centered consumer journey:

```text
创建作品 → 印花创作 → 虚拟试穿 → 开始定制 → 生产资料草案 → 后台审核
```

### Completed locally

#### Login and auth support

- improved visitor/authorized state behavior across consumer navigation
- added password login support for admin phone through server-side credentials/environment configuration
- kept existing verification-code login flow compatible
- aligned route guard behavior for `/my-studio` and protected creation pages

#### Real image generation and fallback behavior

- inspected and extended `/api/ai-studio/generate`
- connected configured YXAI/image2 variables for image generation where available
- kept fallback paths for missing key/model/provider failures
- standardized consumer copy so fallback is shown as `示例预览`
- preserved provider/model/isFallback in metadata while hiding technical fields from consumer pages

#### Work persistence and digital assets

- reused existing `Design.colorAnalysis` with `studio-work-v1` metadata to avoid DB migration
- added work/result APIs under `/api/my-studio`
- persisted pattern assets, try-on assets, selected asset ids, generation groups, inspiration board, and preference memory
- fixed direct-use public print behavior so public/seed images are copied into the current work as pattern asset snapshots
- ensured repeat generation appends assets instead of overwriting old history

#### Print creation center

- evolved `/my-studio/pattern-generate` into a print creation center:
  - official print library
  - community/public seed prints
  - favorites placeholder
  - inspiration board
  - history groups
  - direct-use and remix generation
- generated the first real community seed image batch and stored it in local assets
- hid prompt/provider/model/fallback internals from the consumer UI

#### Virtual fitting

- rebuilt `/my-studio/try-on` as the consumer `虚拟试穿` page
- applied UI delivery package rules:
  - left workbench
  - large center fitting preview
  - narrow right history rail
  - `数字资产` button
  - `下一步：开始定制`
- changed try-on input from `selectedAssets.applicationResultId` to direct `selectedAssets.patternResultId`
- kept old application assets optional for compatibility

#### Confirm design and production draft

- added/minimally completed `/my-studio/confirm-design`
- confirmation now requires selected pattern + selected try-on, not application result
- writes `productionDraft` metadata with selected asset ids, quantity, size, customer options, and draft status
- added `/my-studio/production-sheet` as a production draft view
- added minimal admin production draft list capability for review workflow

#### Flow simplification

- confirmed consumer main flow:

```text
印花创作 → 虚拟试穿 → 开始定制 → 生产资料草案
```

- removed `印花应用效果` from consumer main-flow entrances, progress bars, next-step buttons, and work-card routing
- kept `/my-studio/seamless` as a compatibility page that redirects user intent to virtual fitting
- kept `productionDraft.selectedApplicationResultId` optional for old-work compatibility

### Lessons learned

1. Flow changes must be chain-level changes. Updating only one page is not enough; entries, progress bars, next buttons, work-card rules, empty states, confirmation, production draft, admin review, and acceptance docs must all be checked together.
2. UI boards are not implementation assets. Every UI delivery should include usable assets, specs, instructions, and acceptance criteria.
3. User-generated content is a digital asset. Generated images, direct-use images, inspiration boards, history groups, and selected states must persist and restore.
4. Fallback/mock must stay honest. Consumer copy is `示例预览`; technical metadata may be stored but not shown to ordinary users.
5. Error handling must protect internals. Consumer pages must not show Prisma/Neon/provider stack traces, hostnames, connection strings, or API keys.

### Validation

- `npx tsc --noEmit` passed after the latest flow-level sync.
- No migrations, seeds, commits, or pushes were executed during the knowledge update request.

### Follow-up

- confirm production-grade try-on model/provider
- define object storage/CDN for generated images
- finalize factory production draft fields
- design formal PDF/export template
- expand admin review rules and audit trail
- decide payment/order handoff timing

## 2026-05-07 · Print to personal fitting loop completion

### Goal

Complete the consumer `印花 → 用户专属上身效果` loop:

```text
印花创作 → 使用/生成印花并试穿 → 填写身材档案 + 选择版型 → 生成我的上身效果图 → 调整后重试 → 开始定制 → 生产资料草案
```

### Completed locally

- standardized `studio-work-v1.bodyProfile` with height, weight, optional measurements, usual size, body shape, fit preference, measurement mode, and update time
- standardized consumer garment templates and `selectedAssets.garmentTemplateId`
- added `/my-studio` body profile gate; if no usable profile exists, the user is guided to fill quick height/weight/size/fit preference before proceeding
- new works created from `/my-studio` receive the local body profile snapshot
- changed print cards in `/my-studio/pattern-generate`:
  - `使用此印花试穿`
  - `参考生成新印花并试穿`
  - inspiration board / favorite actions retained
- rebuilt `/my-studio/try-on` around selected pattern + body profile + garment template
- try-on generation request now sends `patternAssetId`, `patternImageUrl`, `bodyProfile`, `garmentTemplate`, `fitPreference`, and optional `revisionReason`
- fitting revisions append into `assets.tryOns[]`; selecting a fitting updates only `selectedAssets.tryOnResultId`
- `不满意，调整后重试` records revision reason and supports changing garment template before regenerating
- `confirm-design` reads selected pattern + selected try-on and shows body/template summary
- `production-sheet` displays selected pattern, selected try-on, body profile snapshot, and garment-template snapshot
- consumer UI keeps provider/model/prompt/workId/resultId hidden; fallback remains `示例预览`

### Modified files

- `lib/my-studio/types.ts`
- `lib/my-studio/work.ts`
- `app/api/my-studio/works/route.ts`
- `app/api/my-studio/works/[workId]/route.ts`
- `app/api/my-studio/works/[workId]/results/route.ts`
- `app/api/ai-studio/generate/route.ts`
- `app/my-studio/page.tsx`
- `app/my-studio/my-studio.css`
- `components/my-studio/BodyProfileGate.tsx`
- `components/my-studio/CreateDesignButton.tsx`
- `app/my-studio/pattern-generate/page.tsx`
- `app/my-studio/try-on/page.tsx`
- `app/my-studio/try-on/try-on.css`
- `app/my-studio/confirm-design/page.tsx`
- `app/my-studio/confirm-design/confirm-design.css`
- `app/my-studio/production-sheet/page.tsx`

### Not executed

- no migration / seed
- no payment / PDF / factory integration
- no commit / push
- PRD / User Flow / Sitemap were not modified in this round

### Acceptance path

1. Enter `/my-studio` and complete the body profile gate if shown.
2. Create/select a work and open `/my-studio/pattern-generate?workId=...`.
3. Click `使用此印花试穿` or choose references and click `生成新印花并试穿`.
4. On `/my-studio/try-on`, confirm body profile and garment template, then click `生成我的上身效果图`.
5. Verify a new fitting appears in history and older fittings are not overwritten.
6. Use `不满意，调整后重试`, choose `版型不喜欢`, switch template, and regenerate.
7. Open `/my-studio/confirm-design?workId=...`; verify selected pattern, selected fitting, body summary, and template display.
8. Confirm design and open `/my-studio/production-sheet?workId=...`; verify body/template snapshots are shown.
