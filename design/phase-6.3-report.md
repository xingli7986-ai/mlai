# Phase 6.3 — Page Refactor Report

> Phase: 6.3 页面开发 (UI 设计系统落地)
> Date: 2026-05-01
> Commits: `f0de1e4`, `dc484d1`
> Status: ✅ Completed

---

## 1. Goal

Substitute inline UI primitives (buttons, form controls, badges, empty
states, skeletons, accordions, steppers) on existing pages with the
canonical `components/ui/*` library built in 6.2, so that every visible
control on user-facing pages is governed by the design system tokens.

Page-specific layouts (hero grids, hot grids, dashboard splits, tool
workspaces) are preserved — this pass is component-level, not a redesign.

## 2. What was built first (6.2 prerequisites)

The component library in `components/ui/` had to be complete before 6.3
could land. The library now covers Component Spec §6–§14:

| Component | File | Spec section |
|---|---|---|
| `Button` (primary / secondary / ghost, sm/md/lg, block, loading, link mode) | `Button.tsx` | §3, §4 |
| `Card` (default / soft / flat, hover lift) | `Card.tsx` | §5 |
| `Input` / `Textarea` (label, required, error, hint, focus glow) | `Input.tsx` | §7.3–§7.6 |
| `Select` (chevron, focus / error states) | `Select.tsx` | §7.7 |
| `IconButton` (default / dark tones, 36×36 round) | `IconButton.tsx` | §3.4 |
| `SectionHeader` (eyebrow + title + description, left / center) | `SectionHeader.tsx` | §6 |
| `Badge` (gold / neutral / dark / success) | `Badge.tsx` | §13 |
| `StatsCard` (gold value + secondary label, card / plain) | `StatsCard.tsx` | §10 |
| `Stepper` (44×44 nodes, current / done / upcoming, h / v) | `Stepper.tsx` | §11 |
| `FAQAccordion` (interactive, single-open, chevron 180°) | `FAQAccordion.tsx` | §8 |
| `Modal` (520px panel + scrim, ESC, animation) | `Modal.tsx` | §14 |
| `Toast` + `ToastProvider` + `useToast()` (info / success / error / warning) | `Toast.tsx` | §15 |
| `EmptyState` (icon + title + desc + action) | `EmptyState.tsx` | Visual Samples §13 |
| `Skeleton` (shimmer animation) | `Skeleton.tsx` | Visual Samples §14 |

All styles live in `components/ui/ui.css`. The only hardcoded hex values
that survived audit are the 3 spec-mandated literals: `#D8D0C6` (button
disabled bg), `#F2EEE8` (Badge--neutral bg), `#EFE8DD` / `#F8F3EC`
(Skeleton shimmer endpoints). All other colors / radii / shadows /
spacing pull from the `:root` design tokens added in 6.1.

## 3. Page-level changes (Sitemap order)

| # | Route | Substitutions applied | File |
|---|---|---|---|
| C1 | `/` | hero CTAs ×2, hot card 去拼团 ×4, 立即定制, bottom CTAs ×2 → `<Button>`; hot card status tag → `<Badge>` (gold/neutral/dark by state) | `app/page.tsx` |
| C2 | `/products` | grid loading → `<Skeleton>`; grid error / empty → `<EmptyState>` + `<Button>` retry | `app/products/page.tsx` |
| C3 | `/products/[id]` | 众定中 tag → `<Badge>`; 立即参团 / 个人定制 CTA row → `<Button block size="lg">` | `app/products/[id]/page.tsx` |
| C4 | `/products/[id]/custom` | skeleton / not-found → `<Skeleton>` + `<EmptyState>`; 收货人 / 地址 / 备注 form fields → `<Input>` / `<Textarea>`; pay button → `<Button loading>` | `app/products/[id]/custom/page.tsx` |
| C5 | `/group-buy/[id]` | skeleton / not-found → `<Skeleton>` + `<EmptyState>`; 收货人 / 地址 form → `<Input>` / `<Textarea>`; pay button → `<Button loading>` | `app/group-buy/[id]/page.tsx` |
| C6 | `/group-buy/[id]/progress` | not-found → `<EmptyState>`; 众定中 tag → `<Badge>`; 邀请好友拼单 / 复制专属链接 → `<Button block>` | `app/group-buy/[id]/progress/page.tsx` |
| C7 | `/my` | _no changes_ — page already uses token-aligned `.ml-*` classes from `app/design-system.css` | — |
| S1 | `/studio` | hero CTAs ×3 → `<Button>`; tool tile SOON marker → `<Badge tone="dark">` | `app/studio/page.tsx` |
| S2 | `/studio/join` | already refactored at 6.3 entry: hero buttons / stats / process / cases / form / FAQ all use `ui/*`; layout-level `dl-*` classes retained | `app/studio/join/page.tsx` (commit `f0de1e4`) |
| S3 | `/studio/dashboard` | header actions ×3 + withdraw card buttons ×2 → `<Button>`; work card tag → `<Badge>` | `app/studio/dashboard/page.tsx` |
| S4 | `/studio/publish` | header actions ×3 + final-step CTAs ×2 → `<Button>`; cover badge → `<Badge>`; 基本信息 + 价格 form (5 fields) → `<Input>` / `<Select>` / `<Textarea>` | `app/studio/publish/page.tsx` |
| S5–S20 | tool pages (`/studio/pattern/*`, `/studio/fashion/*`) | _no changes by design_ — see §5 below | — |

## 4. What got deleted from page sources

- `app/studio/join/page.tsx`: the in-page `.st-tabs` block (工具页 / 我的设计 / 灵感 / 发布设计 / 设计师中心 / 入驻申请) was already removed in commit `39ca8c7` per IA §2.4. 6.3 only continued by replacing the form / FAQ / stats / process implementations with `ui/*`.
- Loose `<input>` / `<select>` / `<textarea>` markup with `.ml-input` / `.dl-field` styling on join, custom, group-buy, publish — replaced with field-wrapped components that bring focus glow, error/hint slots, and required-asterisk handling for free.
- Inline `.ml-skeleton` div trios — replaced with `<Skeleton>` instances.
- `.ml-toast.ml-toast--error / ml-toast` empty-grid div placeholders on /products and not-found cases — replaced with `<EmptyState>` + `<Button>` action.

## 5. Decisions and deferrals

### 5.1 Tool pages were left alone (S5–S20)

`app/studio/pattern/*` and `app/studio/fashion/*` use `ft-btn`,
`ft-btn is-primary`, and `ft-actionBtn` classes defined in
`app/studio/fashion/fashion-tool.css`. Reading that CSS confirms the
buttons already pull from the design tokens (gold primary, secondary
border, soft surface). The Component Spec rule "禁止重复定义按钮样式"
is technically violated by the existence of `ft-btn`, but the visual
result is design-system-aligned.

Forcing each `ft-btn` through `<Button>` would change toolbar rhythm
and button proportions across 11 tool pages without improving
consistency. Deferred to a future strictness pass; the user
explicitly confirmed this trade-off.

### 5.2 /my was left alone (C7)

`app/my/my-center.css` and `app/design-system.css` together already
make /my use `.ml-card`, `.ml-tabs`, `.ml-badge--vip`, `.ml-input`,
`.ml-chip` etc., and these resolve to the token palette via the same
`:root` variables. Replacing them with `<Card>` / `<Badge>` would not
change pixels and would introduce churn.

### 5.3 Centered SectionHeader on join uses `align="center"`

Earlier inline `.dl-section__head` markup was rebuilt as
`<SectionHeader align="center" eyebrow=... title=... description=...>`.
The component now formally encodes the eyebrow / title / description
spec; `dl-section__head--center` lingers as a defensive className but
is a no-op on the new structure.

## 6. Self-check (UI delivery doc §7, 10 items)

| # | Item | Result |
|---|---|---|
| 1 | All colors via CSS variables | ✅ — only 3 spec-mandated literals remain (`#D8D0C6`, `#F2EEE8`, `#EFE8DD`/`#F8F3EC`) |
| 2 | Type sizes match design system | ✅ — buttons 15px, inputs 14px, eyebrow 13px, etc. per Spec §3 / §4 / §6 |
| 3 | Spacing on 8pt grid | ✅ — `--space-1`…`--space-28` tokens used in `ui.css` |
| 4 | ConsumerNav / Studio Layout reused | ✅ — no fresh layouts introduced |
| 5 | Button / Card / Input follow design system | ✅ — built directly off Component Spec §3–§7 |
| 6 | 375px responsive | ✅ — verified on /studio/join hero, /studio, /studio/dashboard |
| 7 | Image fallback | ✅ — AssetImage component preserved on every refactored page |
| 8 | tsc passes | ✅ — `npx tsc --noEmit` exit 0 |
| 9 | No regression on adjacent pages | ✅ — /studio sidebar still renders correctly with EAD8BC active state + gold 3px left bar after token + page changes |
| 10 | Compared against spec | ✅ — every substitution maps to a Component Spec section number; deferrals (§5 above) explicitly justified |

## 7. Verification artifacts

- 35 desktop (1440×900) + 35 mobile (375×800) screenshots in
  `design/screenshots/{desktop,mobile}/` (gitignored, kept local).
- Live spot-check of `/studio/dashboard`, `/products/[id]/custom`,
  `/studio/join`, `/studio` post-refactor — all render cleanly.

## 8. Hand-off to 6.4

The UI surface is now homogeneous enough that 6.4 (interactions /
data-binding per PRD + User Flow) can be added without mixing
behaviour and styling concerns:

- All form fields surface `value` / `onChange` cleanly via the new
  `<Input>` / `<Textarea>` / `<Select>` props.
- `<Button>` accepts a `loading` prop, so submission states are
  trivial to wire.
- `<ToastProvider>` + `useToast()` is ready to mount at the root
  layout for app-wide success / error feedback.
- `<Modal>` is ready for the LoginModal interception that User Flow
  §1 calls for on guest checkout / favorite / participate flows.

Open items handed forward to 6.4:

1. `/studio/join` form `onSubmit` currently calls `e.preventDefault()`
   only — needs to POST `/api/designer/register` per User Flow §4.
2. `/products/[id]` 立即参团 currently links straight to
   `/group-buy/[id]` — User Flow §1 requires
   `POST /api/group-buys/find-or-create` first to resolve / create
   the group buy before navigation.
3. Auth-gated actions (favorite, like, custom, group-buy) should
   surface `<LoginModal>` instead of silently redirecting.
4. AI tool usage limit enforcement per PRD §6.4 (5/20/unlimited per
   role) is not yet wired into the tool pages.
5. `<ToastProvider>` is not yet mounted at the app root.
