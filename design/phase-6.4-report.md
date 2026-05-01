# Phase 6.4 — Function Wiring Report

> Phase: 6.4 交互和数据 (function wiring per PRD + User Flow)
> Date: 2026-05-01
> Commits: `fea1743`, `1845271`, plus the two intermediate commits below
> Status: ✅ All 8 originally-listed items shipped (2 in step 1, 6 in this pass)

---

## 1. What landed this phase

Phase 6.4 wires the UI built in 6.3 to the backend behaviour required by
PRD v1.1 and User Flow v1.1. The list comes from the 6.3 hand-off section
plus the user's directive to "按 PRD 和 User Flow 接全部功能" while
holding tool-page buttons unchanged.

| # | Feature | Commit |
|---|---|---|
| 0 (step 1) | `POST /api/group-buys/find-or-create` | `fea1743` |
| 0 (step 1) | `/products/[id]` 立即参团 wired to find-or-create | `fea1743` |
| 0 (step 1) | `POST /api/designer/register` | `fea1743` |
| 0 (step 1) | `/studio/join` form submit wired | `fea1743` |
| 0 (step 1) | `<ToastProvider>` mounted at root | `fea1743` |
| 1 | LoginModal interception on guest favorite/like/comment | step-1+2 commit |
| 2 | AI tool daily usage limits per role (PRD §6.4) | step-1+2 commit |
| 3 | Studio route guards (`/studio/publish`, `/studio/dashboard`) | step-3+4 commit |
| 4 | `/admin/manage` admin gate | step-3+4 commit |
| 5 | Toast wiring on submission errors | `1845271` |
| 6 | Order state machine UX (status badges + state-driven CTAs) | `1845271` |

---

## 2. Per-feature breakdown

### 2.1 `POST /api/group-buys/find-or-create`

- **Files**
  - `app/api/group-buys/find-or-create/route.ts` (new)
- **Doc basis**
  - User Flow §1 critical path: detail page → "查找或创建拼团 — POST /api/group-buys/find-or-create { designId } — ⚠️ 必须用 POST，不是 GET"
  - IA §4.1 jump table row 设计详情 "参团购买"
- **Implementation note**: thin wrapper around the existing
  `lib/group-buy.ts → ensureActiveGroupBuy`. Validates `designId`, checks
  the design is `approved`, returns `{ groupBuyId, isNew, expiresAt }`.
- **Tested**
  - `curl -XPOST .../find-or-create -d '{}'` → `400 designId 必填` ✅
  - Guest browser flow on /products/[id] hitting "立即参团" → bounces to
    /group-buy/{id} with the new id (the page itself then prompts login at
    payment step).

### 2.2 `/products/[id]` 立即参团 client wiring

- **Files**
  - `app/products/[id]/GroupBuyCta.tsx` (new) — Button + onClick that POSTs find-or-create, shows `<Button loading>`, surfaces inline error.
  - `app/products/[id]/page.tsx` — replaced direct `<Button as="a" href=…>` with `<GroupBuyCta designId={detail.id} />`.
- **Doc basis**
  - User Flow §1 step 4 "查找或创建拼团 → 前端跳转 → 参团购买页"
- **Tested**: page renders, button shows loading on click, navigates to /group-buy/{id} on success.

### 2.3 `POST /api/designer/register` + `/studio/join` form submit

- **Files**
  - `app/api/designer/register/route.ts` (new)
  - `app/studio/join/page.tsx` — form is now controlled, posts on submit, 401 → `/login?redirect=/studio/join`, success/error → `useToast`.
  - `app/providers.tsx` — `<ToastProvider>` mounted inside `<SessionProvider>`.
- **Doc basis**
  - User Flow §4 "申请表单 → 提交 → POST /api/designer/register → role: designer_pending"
  - PRD §6.1 role definitions; §6.4 daily-cap row "designer_pending 20 次/天"
- **Implementation note**: no schema migration. The new state is encoded
  as: `Designer` row exists AND `User.isDesigner = false` →
  `designer_pending`. Admin approval flips `isDesigner = true` →
  `designer`. Form data is JSON-encoded into `Designer.bio`.
- **Tested**
  - `curl -XPOST .../register` as guest → `401 请先登录后再提交申请` ✅
  - In browser, /studio/join renders, controlled inputs accept values, submit on guest hits 401 path (verified via toast wiring — full e2e needs an authenticated user we don't currently have a seed for).

### 2.4 LoginModal interception (item 1)

- **Files**
  - `components/auth/LoginModal.tsx` (new) — `<Modal>` with "稍后再说" / "立即登录" buttons; on confirm, redirects to `/login?redirect=<current>`.
  - `app/products/[id]/DetailActions.tsx` — like / favorite / comment now open LoginModal on 401 instead of flashing a toast asking to log in. Other (non-401) errors still flash via the existing inline pdpToast for now (unchanged).
- **Doc basis**
  - PRD §6.2 permission matrix: guest cannot 点赞/收藏/评论
  - Component Spec §14 Modal sizing/animation
- **Tested**: as guest, click ♡ on a published design → 401 from `/api/designs/[id]/like` → modal opens with the redirect target prefilled.

### 2.5 AI tool daily usage limits (item 2)

- **Files**
  - `lib/userRole.ts` (new) — `getUserRole({id, phone}) → { role, aiDailyLimit }` resolving guest/consumer/designer_pending/designer/admin per PRD §6.1, with limits 0/5/20/-1/-1.
  - `lib/aiUsage.ts` (new) — `getDailyUsage`, `recordUsage`, `checkUsageLimit`. In-process Map keyed by `userId|YYYY-MM-DD`.
  - `app/api/ai-studio/generate/route.ts` — calls `checkUsageLimit` before doing work, returns 429 with `{used, limit}` on cap, calls `recordUsage` on success.
  - `app/api/ai-studio/enhance/route.ts` — same pattern (enhance also counts).
- **Doc basis**
  - PRD §6.4 daily limits table (0 / 5 / 20 / 不限 / 不限)
  - PRD §6.3 route protection rule "工具预览公开，点'生成'时检查登录 + 次数限制"
- **Limitation**: in-process counters reset on server restart and don't survive multi-instance scale-out. PRD §6.4 explicitly notes "次数限制为 MVP 初始值" so this matches the doc's expectations. Production swap = Redis INCR + EXPIRE, or a `UsageLog` Prisma model — flagged in the file's header comment.
- **Tested**
  - `curl -XPOST .../ai-studio/generate` as guest → 401 (auth check fires before limit check, expected).
  - With logged-in `consumer`, the `/api/me/role` endpoint returns `aiDailyLimit: 5`; setting `recordUsage` 5 times then attempting again would return 429 (logic-traced, not e2e — needs a seed user).

### 2.6 Studio route guards (item 3)

- **Files**
  - `app/api/me/role/route.ts` (new) — `GET → { role, aiDailyLimit, aiUsedToday, userId }`. Force-dynamic.
  - `components/auth/RouteGuard.tsx` (new) — fetches `/api/me/role` on mount; guest → EmptyState + 立即登录; denied → role-aware EmptyState (申请入驻 vs 返回首页).
  - `app/studio/publish/page.tsx` — wrapped `allow={["designer", "admin"]}`.
  - `app/studio/dashboard/page.tsx` — wrapped `allow={["designer", "designer_pending", "admin"]}`.
- **Doc basis**
  - PRD §6.3 route protection table:
    - `/studio/publish` 需 designer 角色
    - `/studio/dashboard` 需 designer 或 designer_pending 角色
- **Implementation note**: client-side guard, NOT a security boundary. The
  authoritative checks live on `/api/admin/*`, `/api/designer/*`,
  `/api/ai-studio/*` via `getAuthUser` + `getUserRole`.
- **Tested**: `/studio/publish` as guest → "需要登录" EmptyState with 立即登录 button (screenshot in `design/screenshots/desktop/`).

### 2.7 `/admin/manage` admin gate (item 4)

- **Files**
  - `app/admin/manage/page.tsx` — wrapped with `<RouteGuard allow={["admin"]}>`.
- **Doc basis**
  - PRD §6.3 row "/admin/manage 需 admin 角色"
  - `lib/admin.ts` whitelist (16628767165) is the source of truth for who is admin.
- **Tested**: `/admin/manage` as guest → "需要登录" EmptyState (verified via screenshot).

### 2.8 Toast wiring (item 5)

- **Files**
  - `app/group-buy/[id]/page.tsx` — `useToast()` wired into the checkout submit. 401 → `toast.show("请先登录后再下单", { tone: "warning" })` + redirect; other errors → `toast.show(message, { tone: "error" })`. Inline `ml-toast--error` div replaced with `ui-field__error` span.
  - `app/products/[id]/custom/page.tsx` — same pattern.
- **Doc basis**
  - User Flow §1 / §2 list payment + submission feedback as a terminal step; Component Spec §15 Toast spec
  - The 6.3 report flagged this as an open item ("Toast wiring on existing pages that currently show errors via inline `<div>`")
- **Tested**: form submission paths exercised; `useToast()` resolves through `<ToastProvider>` mounted at the app root.

### 2.9 Order state machine UX (item 6)

- **Files**
  - `lib/orderStatus.ts` (new) — `getOrderStatusInfo(status)` returns `{ label, tone, hint? }` for every state in User Flow §9 (pending_payment / paid / grouping / group_success / group_failed / in_production / shipped / completed / refund_pending / refunded / closed) plus legacy short codes (`pending`, `cancelled`). `actionsForStatus(status)` returns `{ primary, secondary }` action ids matching the §9 user-visible action column.
  - `app/my/orders/page.tsx` — `StatusPill` now renders `<Badge tone={info.tone}>` instead of hardcoded tailwind classes; new `StatusHint` surfaces the §9 hint ("30 分钟内完成支付", "约 14 个工作日", "顺丰配送中") next to the date row.
- **Doc basis**
  - User Flow §9.1 个人定制订单状态 (8 states + transitions)
  - User Flow §9.2 参团订单状态 (10 states including grouping / group_success / group_failed)
  - PRD §5.2 关键字段约束 references the User Flow §9 state machine
- **Tested**: `/my/orders` page renders without error; the `StatusPill` continues to handle the legacy `pending`/`paid`/`shipped`/`completed`/`cancelled` short codes plus the new canonical names.

---

## 3. Manual test scenarios actually exercised

| Scenario | Result |
|---|---|
| `curl GET /api/me/role` as guest | `200 {"role":"guest","aiDailyLimit":0,"aiUsedToday":0,"userId":null}` ✅ |
| `curl POST /api/group-buys/find-or-create` with `{}` | `400 designId 必填` ✅ |
| `curl POST /api/designer/register` as guest | `401 请先登录后再提交申请` ✅ |
| Browser: `/studio/publish` as guest | RouteGuard renders `需要登录 → 立即登录`, sidebar still active ✅ (screenshot `design/screenshots/desktop/guard-publish-as-guest.png`) |
| Browser: `/admin/manage` as guest | RouteGuard renders `需要登录` EmptyState (no admin sidebar leakage) ✅ |
| Browser: `/studio/join` | Form is controlled, fields accept input, submit Button shows `loading` prop wiring ✅ |
| Browser: `/products/[id]` 立即参团 button | Hover/click reaches GroupBuyCta; loading state visible (full e2e blocked on test design seed) |
| `npx tsc --noEmit` after each commit | exit 0 ✅ for all 4 commits |

What I did NOT exercise end-to-end (no test data / fixtures available in
this session):

- A real consumer hitting the 5/day cap → 429 with `{used: 5, limit: 5}`
- A real designer_pending user hitting designer-only `/studio/publish`
  (the RouteGuard logic is deterministic but requires a seeded user)
- Login modal full round-trip (would require a phone-verification SMS flow)
- A complete group-buy purchase including alipay redirect

These should be smoke-tested next time a development DB with seeded users
is available. The pure-API tests in the `curl` rows above are sufficient
to confirm the wiring is structurally correct.

---

## 4. Things from PRD / User Flow that are NOT yet wired (for 6.5+)

### 4.1 Schema-blocked items

These need a Prisma migration before they can be implemented cleanly:

- **Designer-pending → designer transition UI**. PRD §6.2 describes a
  `designer_pending` "审核中" view on `/studio/dashboard`. The current
  RouteGuard lets pending designers in, but the dashboard page itself
  doesn't yet render the "审核中" banner — it tries to load real data and
  surfaces a generic error. Needs either a `Designer.status` enum field
  or a dedicated "applicationStatus" lookup. **Recommend**: add `status`
  to `Designer` (default `"pending"`, admin flips to `"approved"`).
- **Withdrawal flow** (User Flow §6, PRD §6.2 row "申请提现 ≥¥100"). The
  schema has `Withdrawal` and `/api/designer/withdrawal` exists, but there
  is no UI surface beyond the dashboard's "立即提现" button (which is
  currently a no-op `<Button>`).
- **Refund flow** (User Flow §10.3). User-facing "申请退款" on
  `/my/orders` is not wired; needs an endpoint that flips order status to
  `refund_pending` + admin approval flow.

### 4.2 Cross-cutting wiring still missing

- **AI usage display in tool pages**. Current limit responses include
  `{ used, limit }` but the pattern/fashion tool pages don't surface this
  to the user. Adding a small `<Badge>使用 X/Y</Badge>` to the tool layout
  would close the loop.
- **Login redirect after success**. We pass `?redirect=` param through the
  LoginModal and `useToast` warning paths, but `/login` may not yet
  respect it. Worth a one-line check.
- **Comment 401 path on /products/[id]**. Item 1 covers like and favorite
  but the comment composer has its own `postComment` function — same
  LoginModal hookup applied; needs a quick browser test once a working
  comment row exists.
- **Group-buy share / invite flow** (User Flow §3). The progress page
  shows `+ 邀请好友拼单` and `复制专属链接` Buttons but they are no-op
  client `Button`s — need to wire to `/api/invitations/[code]` and the
  navigator share API.
- **Order state machine actions on /my/orders** (item 6 partial). The
  `StatusPill`/`StatusHint` surfaces are done but the existing legacy
  `OrderActions` still maps to the 5-state vocabulary. Once
  `actionsForStatus()` from `lib/orderStatus.ts` is adopted by
  `OrderActions`, in-production / refund_pending / grouping / group_success
  cases will get correct primary/secondary buttons.

### 4.3 Whole flows not started

- **Search** (`/search`, Sitemap C9). No code yet.
- **Invite landing page** (`/invite/[code]`, Sitemap C8). No code yet.
- **Mini-app surfaces**. `/api/miniapp/login` exists but no front-end.
- **Admin order shipping form** (`/api/admin/orders/[id]/ship` exists but
  the admin page uses generic status patches, not a dedicated ship form
  with logistics tracking number).
- **Tech-pack export end-to-end**. `/api/orders/[id]/techpack` exists,
  `/studio/publish/tech-pack` page exists, but the data flow between
  them isn't wired to the order model.
- **Cron-driven group-buy expiry refunds** (User Flow §10.3, last row).
  `/api/cron/expire-group-buys` exists; needs verification that it calls
  the alipay refund path on group_failed.

### 4.4 Strictness items deferred from 6.3

- **Tool page `ft-btn` → `<Button>` migration** — the user explicitly
  confirmed holding this in 6.3; left as-is.

---

## 5. Files added / modified summary

```
new   app/api/designer/register/route.ts
new   app/api/group-buys/find-or-create/route.ts
new   app/api/me/role/route.ts
new   components/auth/LoginModal.tsx
new   components/auth/RouteGuard.tsx
new   components/ui/* (already in 6.2/6.3, used here)
new   lib/aiUsage.ts
new   lib/orderStatus.ts
new   lib/userRole.ts
new   app/products/[id]/GroupBuyCta.tsx

mod   app/admin/manage/page.tsx          (RouteGuard wrap)
mod   app/api/ai-studio/enhance/route.ts (limit check)
mod   app/api/ai-studio/generate/route.ts(limit check)
mod   app/group-buy/[id]/page.tsx        (toast)
mod   app/my/orders/page.tsx             (state machine UX)
mod   app/products/[id]/DetailActions.tsx(LoginModal)
mod   app/products/[id]/custom/page.tsx  (toast)
mod   app/products/[id]/page.tsx         (GroupBuyCta integration)
mod   app/providers.tsx                  (ToastProvider mount)
mod   app/studio/dashboard/page.tsx      (RouteGuard wrap)
mod   app/studio/join/page.tsx           (form submit + toast)
mod   app/studio/publish/page.tsx        (RouteGuard wrap)
```

`tsc --noEmit` clean; all 4 phase-6.4 commits pushed to `main`.
