# 顶栏导航审计 —— `/products` "个性定制" 无响应

> Date: 2026-05-01
> Trigger: 用户反馈 `/products` 顶栏 "个性定制" 链接点击无反应
> Status: 🔍 仅审计，未改任何代码，等用户确认

---

## 1. 现场还原

`/products` 页面顶部 nav 中的三个链接，点击 "个性定制" 后页面无变化（URL 也不变）。原因是它的 href 与当前页一致 (`/products`)，Next.js 客户端路由判定为同 URL，短路了导航。

## 2. 实现 vs 文档

### 2.1 当前实现（两套并存）

| 位置 | 角色 | 印花衣橱 | 个性定制 | 热拼专区 |
|---|---|---|---|---|
| `components/ConsumerNav.tsx` (line 9–13) | IA §2.1 定义的"消费者前台共用导航"组件 | `/products` | **`/products`** ⚠️ | `/products?sort=hot-group` |
| `app/products/page.tsx` (line 141–165) | 该页**内联**了一份独立 nav，没有用 ConsumerNav | `/products` | **`/products`** ⚠️ | `/products?sort=hot-group` |

`/products` 页面渲染的是 **inline nav**（第 141 行），没有引用 `ConsumerNav` 组件 —— 即使 ConsumerNav 改了，这个页面也不会受影响。

### 2.2 IA / Sitemap 文档预期

**IA §2.1 消费者顶部导航（ConsumerNav）**

| 位置 | 内容 | 链接 |
|---|---|---|
| 左侧 Logo | MaxLuLu AI | `/` |
| 导航项 1 | 印花衣橱 | `/products` |
| 导航项 2 | 热拼专区 | `/products?sort=hot-group` |
| 导航项 3 | 个性定制 | `/products`（选款后进定制） |

IA 明确写了一条规则（同节）：

> "**个性定制**" 不直接进 Studio，而是**进印花衣橱选款后再进定制页**

**Sitemap v1.1 C 类页面清单：** 没有独立的 `/custom` 落地页。最近的定制页是 C4 `/products/[id]/custom`，要求先选定一个 design id 才能进。

### 2.3 差异表

| 项 | 当前实现 | IA / Sitemap 预期 | 一致性 |
|---|---|---|---|
| 印花衣橱 → `/products` | ✓ | ✓ | ✅ 一致 |
| 热拼专区 → `/products?sort=hot-group` | ✓ | ✓ | ✅ 一致 |
| 个性定制 → `/products` | href 与 IA "字面一致"，但点击体验失败 | IA 字面值就是 `/products` | ⚠️ **字面一致、UX 失败** |
| ConsumerNav 是"消费者前台共用导航"，所有消费者前台页面应当复用 | `/products` 页**没有用 ConsumerNav**，自己内联了一份 | "**所有消费者前台页面共用**，components/ConsumerNav.tsx" | ❌ **架构违规**（违反 IA §2.1 + Component Spec Part 4 §4 "禁止每个页面写一套 Header"） |
| `/products` 页只有 印花衣橱 / 个性定制 / 热拼专区 三项导航 | ✓ | IA 规定就这三项 + 右侧"会员 / 我的衣橱 / 设计师入驻" | ⚠️ inline nav 缺失了 "设计师入驻" 入口（IA §2.1 右侧小入口） |
| 个性定制点击在 `/products` 上无视觉反馈 | 同 URL，路由短路 | IA 没规定，但用户当然期望"有事发生" | ⚠️ **UX 缺陷** |

## 3. 根因小结

故障是**两个层面叠加**的结果：

1. **架构层（红色）**：`/products` 没用 ConsumerNav，自己写了一套 nav。这是 6.3 阶段就存在的违规（参考 `phase-6.3-report.md` 已标记）。
2. **UX 层（黄色）**：IA 规定 "个性定制 → /products"，字面没问题；但 IA 没规定 "已经在 /products 上时点击应当如何"。当前 href 完全一致，路由层不会触发任何 effect，看起来"链接挂了"。

## 4. 候选修复方向（不擅自下结论，等用户确认）

### A. 仅修 UX 层（最小侵入）

**A1**：把 "个性定制" 的 href 加一个**幂等查询参数**，例如 `/products?intent=custom`，让用户在 `/products` 上点击它时 URL 真的变化、页面 useEffect 重新跑。可顺手在 hero 区显示"挑一件喜欢的款式开始定制"提示。
- 优点：零业务代码改动，IA 字面意图保留（仍是去 /products）
- 缺点：参数仅做提示，不真的影响数据

**A2**：把 "个性定制" 改成跳到 `/products#custom-guide`（或 `?guide=custom`），页面顶部显示一个"如何定制"的指引卡片或锚定到该位置。
- 优点：明确给用户"这就是定制路径"的视觉反馈
- 缺点：需要在页面里新加一个 section，超出 nav 范围

### B. 修架构层（统一到 ConsumerNav）

**B1**：删除 `app/products/page.tsx` 里的 inline `<nav>`（141–165），改成 `<ConsumerNav variant="solid" />`。同时把搜索框移到 hero 区或 FilterBar 区。
- 优点：和 IA §2.1 + Component Spec 完全对齐；ConsumerNav 改一次全站生效
- 缺点：搜索框是 `/products` 页面专有的，需要找新位置

**B2**：把 ConsumerNav 增强为支持 "页面专有右侧 slot"（`<ConsumerNav rightSlot={<Search />} />`），`/products` 通过 prop 传搜索框。
- 优点：架构统一，搜索框保留
- 缺点：ConsumerNav API 变复杂

### C. 同时修两层

**C1**：B1 + A1 —— 改用 ConsumerNav，并把 ConsumerNav 里的 "个性定制" href 改成 `/products?intent=custom`。
- 优点：架构 + UX 一次到位
- 缺点：改动面大一点

## 5. 建议（仅供参考，不替用户决定）

如果**优先级是用户体验**：先做 A1（5 分钟改完），让"个性定制"立刻有反馈，架构层留待 6.3 残留违规一起统一收拾。

如果**优先级是把 6.3 残留违规清理掉**：直接做 C1，一次解决 nav 复用 + UX 反馈两件事。

如果**正在准备一次大的页面重构**：B2 + A2 是终态形态。

## 6. 不做任何改动

按用户要求，本次仅审计，未触碰代码。`main` 仍停在 `91f7ea3`（数字字体统一）。

请在以下选项中选一个或描述你的偏好：

- [ ] A1（最小改动，只调 href 加参数）
- [ ] A2（href + 加指引卡片）
- [ ] B1（替换为 ConsumerNav，搜索框移到别处）
- [ ] B2（ConsumerNav 支持 rightSlot，搜索框传入）
- [ ] C1（B1 + A1 组合）
- [ ] 其他（请描述）
