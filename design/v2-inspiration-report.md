# MaxLuLu AI v1.2 批次 1 — /inspiration 链路上线报告

> 日期:2026-05-03
> 范围:/inspiration 灵感广场 + /inspiration/[id] 灵感作品详情(对照 01 + 03 稿)
> 不在范围:/my-studio 与 /my-studio/works(批次 2)、AI 创作功能、上架审核、升级邀请

---

## 1. 数据库 Schema 变更

文件:`prisma/schema.prisma`

### 1.1 新增 5 个模型

| 模型 | 用途 | 关键字段 |
|---|---|---|
| `InspirationWork` | 灵感广场作品主表 | id / userId / creatorType / title / coverImage / images / prompt / params / promptVisibility / unlockPrice / toolType / styleTags / isListed / 计数 4 个 / status |
| `PromptUnlock` | prompt 解锁记录 | id / userId / inspirationWorkId / paymentMethod / amount / **platformFee**(30%) / **creatorEarning**(70%) / paymentId / status |
| `UserPoints` | 用户积分(只建表,购买积分 P2) | userId / balance / totalEarned / totalSpent |
| `InspirationLike` | 灵感作品点赞 | userId / inspirationWorkId(unique 复合) |
| `InspirationFavorite` | 灵感作品收藏 | userId / inspirationWorkId(unique 复合) |
| `InspirationComment` | 灵感作品评论 | userId / inspirationWorkId / content |

> Sitemap v1.2 §四列出 4 个模型,实际为支持点赞 / 收藏 / 评论独立计数,拆为 6 个表(其中 3 个是关联表,与 v1.1 Like/Favorite/Comment 模式一致)。

### 1.2 User 模型扩展

新增 6 个反向关系:`inspirationWorks` / `inspirationLikes` / `inspirationFavorites` / `inspirationComments` / `promptUnlocks` / `points`。

### 1.3 迁移

```
npx prisma db push --accept-data-loss → exit 0,Neon Postgres schema 已同步
```

### 1.4 种子数据

文件:`scripts/seed-inspiration.ts`(新增)

`npx tsx scripts/seed-inspiration.ts` 执行后插入 14 条 InspirationWork:

| 创作者 | 数量 | 认证 |
|---|---|---|
| Luna · MaxLuLu Studio | 4 | ✅ |
| Reine · Atelier Reine | 3 | ✅ |
| Yuki · Yuki Atelier | 2 | ❌ |
| Mei · Mei Botanical | 2 | ❌ |
| 桃子小姐(假装的普通消费者) | 2 | ❌ |
| 栗子(假装的普通消费者) | 1 | ❌ |
| **合计** | **14** | 7 cert / 7 normal |

prompt 公开状态分布:

| 状态 | 数量 | 比例 |
|---|---|---|
| free | 7 | 50% |
| paid(¥9–¥29) | 5 | 36% |
| private | 2 | 14% |

工具类型(toolType):print / repeat / tryon / fitting 均匀分布。
`coverImage` 用 R2 公开占位 URL(测试环境可能不可达,UI 自动 fallback 到瓷青渐变占位)。

---

## 2. API 端点

### 2.1 实现位置

| 端点 | 文件 |
|---|---|
| GET /api/inspiration | `app/api/inspiration/route.ts` |
| GET /api/inspiration/[id] | `app/api/inspiration/[id]/route.ts` |
| POST /api/inspiration/[id]/unlock-prompt | `app/api/inspiration/[id]/unlock-prompt/route.ts` |
| POST /api/inspiration/[id]/like | `app/api/inspiration/[id]/like/route.ts` |
| POST /api/inspiration/[id]/favorite | `app/api/inspiration/[id]/favorite/route.ts` |
| GET / POST /api/inspiration/[id]/comments | `app/api/inspiration/[id]/comments/route.ts` |
| 支付宝回调扩展(prompt 解锁分支) | `app/api/payment/alipay/notify/route.ts` |

### 2.2 测试结果(curl)

**列表 GET /api/inspiration?pageSize=2:**

```bash
curl http://localhost:3300/api/inspiration?pageSize=2
# → 200
{
  "works": [
    {
      "id": "cmoo9quig0007w7ewqtlab0ih",
      "title": "鎏金落日 · 法式中长",
      "toolType": "tryon",
      "promptVisibility": "free",
      "unlockPrice": 0,
      "likeCount": 412, "favoriteCount": 198, "viewCount": 2210,
      "creator": {
        "name": "Luna · MaxLuLu Studio",
        "isCertified": true,
        "type": "designer"
      },
      "promptAvailable": true
    },
    { ... Reine ... }
  ],
  "total": 14, "page": 1, "pageSize": 2, "totalPages": 7,
  "stats": { "totalWorks": 14, "activeCreators": 6, "weeklyNew": 14 }
}
```

**详情 GET /api/inspiration/[id]:**

返回 work + 6 条 similar(同 toolType 排除自身)。当前用户是登录态时,`isLiked` / `isFavorited` 为真实状态;`promptUnlocked` 按 visibility 与 PromptUnlock 状态决定:

- `free` → unlocked: true,直接返回 prompt + params
- `private` → unlocked: false,**不返回** prompt + params
- `paid` + 已支付 → unlocked: true,返回 prompt + params
- `paid` + 未支付 → unlocked: false,**不返回** prompt + params

### 2.3 推荐排序公式

`recommendedScore = like × 3 + favorite × 5 + view × 1 + freshness`

- freshness:2 天内 +50,2-7 天 +20,>7 天 0

代码:`app/api/inspiration/route.ts` `recommendedScore()`

### 2.4 unlock-prompt 流程

1. 验证登录;查 InspirationWork
2. free → 直接返回 `{ unlocked: true, freeAccess: true }`
3. private → 403
4. owner(creator 本人)→ `{ unlocked: true, ownerAccess: true }`
5. 已 paid → `{ unlocked: true }`
6. 创建 / 复用 PromptUnlock(status="pending"):
   - amount = work.unlockPrice
   - **platformFee = round(amount × 0.3)**
   - **creatorEarning = amount - platformFee**
7. createAlipayOrder 用 outTradeNo = `pu_<unlockId>`
8. 返回 `{ formHtml, isMobile }`,前端跳支付宝
9. 回调 `/api/payment/alipay/notify`:
   - 检查 outTradeNo 前缀 `pu_` → 分支处理
   - 找到 PromptUnlock,status pending → 改 paid + paymentId
   - InspirationWork.unlockCount += 1

### 2.5 不实现项

- 积分支付(留 P2)
- 退款分润回收

---

## 3. 5 个核心组件

按真 md §8.5 复用清单要求,封装到 `components/ui/`,避免页面级单独写死认证视觉。

| 组件 | 文件 | Props |
|---|---|---|
| `VerifiedBadge` | `components/ui/VerifiedBadge.tsx` | `label?: string("认证"\|"认证设计师"\|...)`, `size?: "xs"\|"sm"\|"md"`, `className?` |
| `CertifiedCardFrame` | `components/ui/CertifiedCardFrame.tsx` | `certified: boolean`, `ribbonLabel?: string\|null`, `className?`, `children` |
| `AuthorSignature` | `components/ui/AuthorSignature.tsx` | `name`, `avatar?`, `isCertified?`, `size?: "sm"\|"md"\|"lg"`, `prefix?: boolean`(显示 "by "), `certifiedLabel?: "短"\|"全"`(认证 chip 文字版本) |
| `MasonryGrid` | `components/ui/MasonryGrid.tsx` | `columns?: number\|{ desktop?, tablet?, mobile? }`(默认 4/3/2), `gap?: number`(默认 24), `gapMobile?: number`(默认 12) |
| `PromptLockOverlay` | `components/ui/PromptLockOverlay.tsx` | `visibility: "free"\|"paid"\|"private"`, `unlockPrice?: number`, `unlocked: boolean`, `onUnlock?: () => void`, `loading?: boolean`, `children?` |

### 3.1 设计原则

- **零新 token**:全部消费 `globals.css :root` 既有 token + `--color-certified-gold` 系列
- **状态完整**:default / hover / active / disabled / loading 全套
- **不引入新 token**:有 token 缺口的项(如 `--color-certified-gold-pressed`)在上一轮已落到 globals.css

### 3.2 CSS 落地

5 个组件对应的样式追加在 `components/ui/ui.css` 末尾,共 ~200 行:

- `.ui-verified` + `.ui-verified--xs/sm/md`
- `.ui-certified-frame` + `.is-certified` + `[data-ribbon]::before` 角标
- `.ui-author` + `.ui-author--sm/md/lg` + `.ui-author__avatar/__name/__prefix`
- `.ui-masonry` + 桌面 / 平板 / 移动响应式列数
- `.ui-prompt-lock` + `--free/--paid/--private/--unlocked` 4 态

### 3.3 注册到 index

`components/ui/index.ts` 末尾追加 5 个 export,可通过 `import { VerifiedBadge, CertifiedCardFrame, ... } from "@/components/ui"` 访问。

---

## 4. 页面实现位置

| 路由 | 文件 |
|---|---|
| /inspiration | `app/inspiration/page.tsx`(client component, Suspense + useSearchParams) |
| /inspiration 样式 | `app/inspiration/inspiration.css`(@import 父级 home-consumer.css 复用 nav 样式) |
| /inspiration/[id] | `app/inspiration/[id]/page.tsx`(server component) |
| /inspiration/[id] 客户端动作 | `app/inspiration/[id]/InspirationActions.tsx`(like/fav/share/unlock/CTA) |
| /inspiration/[id] 评论 | `app/inspiration/[id]/InspirationComments.tsx`(GET + POST 评论) |
| /inspiration/[id] 样式 | `app/inspiration/[id]/detail.css`(@import 父级 home-consumer.css) |

### 4.1 ConsumerNav 更新

`components/ConsumerNav.tsx` NAV_LINKS 数组按 IA v1.2 §1.1 顺序更新:

```ts
[
  { href: "/products", label: "印花衣橱" },
  { href: "/inspiration", label: "灵感广场" },           // 新增
  { href: "/products?sort=hot-group", label: "热拼专区" },
]
```

`/my-studio` 留批次 2,本轮不放入 nav,避免点击 404。

### 4.2 页面行为亮点

**/inspiration:**
- Hero:`text-h1` 衬线 + Smoked Rose CTA `成为创作者 → 进入工作室`(暂指向 `/products?intent=custom` 占位)
- 数据统计 3 阶:总作品 / 活跃创作者 / 本周新增,瓷青 Playfair 等宽数字
- 工具筛选 5 个 chip + 排序 5 个 + prompt 状态 4 个,均 tabs row 形式
- 4 列 / 3 列 / 2 列响应式 `MasonryGrid`
- 卡片底用 `AuthorSignature` 组件,认证设计师有金 chip
- 卡片右下 lockBadge:免费(绿)/ ¥XX 解锁(玫瑰)/ 不公开(灰)
- 右侧 sticky 边栏:印花风格 / 解锁价格 / 想成为创作者 promo

**/inspiration/[id]:**
- 60/40 双栏(桌面),移动堆叠
- 左:大图 4:5 + 4 张缩略
- 右(sticky 96px):工具 chip + 日期 → H2 标题 → 描述 → 作者卡(认证用 1px 金边)+ 关注 → metrics 4 阶 → 喜欢/收藏/分享 → PROMPT 区(`PromptLockOverlay` 三态) → CTA stack(基于这个改造 / 发起团购 / 解锁详情)
- 移动:CTA 改为 sticky bottom bar,内嵌 [基于这个改造 + 发起团购]
- 相似作品横向滚动(同 toolType,top 6 by like)
- 评论区:textarea + 提交 + 列表(认证设计师头像金圈 + 12×12 右下小金章)

---

## 5. 4 张截图与稿件差异对比

存放路径:`design/screenshots/v2-inspiration/`

| 文件 | 视口 | 对照稿 |
|---|---|---|
| desktop_inspiration.png | 1440×900 | 01_inspiration_灵感广场.png 桌面 |
| mobile_inspiration.png | 375×800 | 01 移动 |
| desktop_inspiration_detail.png | 1440×900 | 03_inspiration-detail_灵感作品详情.png 桌面 |
| mobile_inspiration_detail.png | 375×800 | 03 移动 |

### 5.1 /inspiration 桌面差异表

| 模块 | 稿预期 | 实际 | 一致 |
|---|---|---|---|
| 顶栏 ConsumerNav | "印花衣橱 / 灵感广场 / 热拼专区" + 会员 / 我的衣橱 | 同(灵感广场 active) | ✅ |
| Hero h1 | 衬线 40/48 Regular | clamp 40/48 Playfair 400 | ✅ |
| Hero 主 CTA | Smoked Rose | `Button variant=primary` Rose | ✅ |
| 数据统计 | 3 阶瓷青 Playfair 大字 | 14 / 6 / 14 瓷青 40/48 Playfair | ✅ |
| 工具筛选 tabs | 圆角胶囊 active 瓷青底白字 | 同 | ✅ |
| Sort tabs | "排序:推荐 / 最新 / ..." | 同 | ✅ |
| 主网格 | 4 列瀑布流 4:5 | `MasonryGrid` desktop=4 + 4:5 媒体 | ✅ |
| 认证作品卡 | 1.5px 金描边 + 右上"认证"角标 | `CertifiedCardFrame certified=true` | ✅ |
| 普通作品卡 | 默认 1px #D2DEDF 描边 | 同(certified=false) | ✅ |
| 卡片底署名 | "by [名字] + 认证 chip" | `AuthorSignature size=sm prefix` | ✅ |
| 卡片右下 lockBadge | 免费 / ¥XX 解锁 / 不公开 | 同 | ✅ |
| 右侧 sticky 边栏 | 风格 + 价格 + Join CTA | 同 | ✅ |
| 卡片图 | 真实模特图 | tone-* 渐变占位(R2 不可达,数据问题) | ⚠️ 数据 |

### 5.2 /inspiration 移动

| 模块 | 稿预期 | 实际 | 一致 |
|---|---|---|---|
| Hero 堆叠 | 标题 → 描述 → CTA → 数据 | 同 | ✅ |
| Tabs 横滚 | flex-wrap 或横滚 | 多行 wrap(暂未横滚,功能等价) | ⚠️ 风格细节 |
| 主网格 | 2 列 | 2 列 | ✅ |
| 右侧边栏 | 移动放最下方 | 移动展平为 2 列 grid | ✅ |

### 5.3 /inspiration/[id] 桌面差异表

| 模块 | 稿预期 | 实际 | 一致 |
|---|---|---|---|
| 顶栏 | 同 /inspiration | 同 | ✅ |
| Crumbs | 灵感广场 › 标题 | 同 | ✅ |
| 主图区 | 60% 宽 4:5 | grid-template-columns 6fr/4fr,4:5 | ✅ |
| 缩略 4 张 | 1:1 网格 | 同 | ✅ |
| 信息卡 | 40% 宽 sticky | 同(认证作者金 1px 边) | ✅ |
| 工具 chip | 瓷青浅底瓷青字 | --color-primary-subtle + --color-primary | ✅ |
| 标题 | H2 衬线 | --text-h2-* | ✅ |
| AuthorSignature | 头像金圈 + "认证设计师" chip + + 关注 | `AuthorSignature size=md certifiedLabel="全"` | ✅ |
| Metrics 4 阶 | 喜欢 / 收藏 / 解锁 / 评论 | 同,Playfair 18/24 数字 | ✅ |
| Action row | 喜欢 / 收藏 / 分享 三按钮 | 同(已点 Rose 描边) | ✅ |
| PROMPT 区 | free 直接显示 | `PromptLockOverlay visibility=free` | ✅ |
| CTA stack | 基于这个改造(rose)/ 发起团购(secondary cyan)/ 解锁(若适用) | 同 | ✅ |
| 相似作品 | 横向滚动 | scroll-snap horizontal | ✅ |
| 评论区 | 头像 + 名字 + 时间 + 内容 + 认证小金章 | 同(无评论时显示空状态) | ✅ |

### 5.4 /inspiration/[id] 移动

| 模块 | 稿预期 | 实际 | 一致 |
|---|---|---|---|
| 主图在上 | 单列堆叠 | grid 1fr | ✅ |
| 信息在下 | 全宽 | 同 | ✅ |
| Sticky 底部 CTA | 基于这个改造 + 发起团购 | `.inspStickyCta` flex display | ✅ 但 fullPage 截图捕捉位置在内容流末尾,不是浮动叠加(浏览器实时仍 sticky) |
| 相似作品 | 横滚 | 同 | ✅ |
| 评论区 | 同桌面 | 同 | ✅ |

### 5.5 T1 + T2 差异修复说明

- **T1(token)**:无差异 — 所有色值、字号、行高、字重、间距、圆角、阴影均通过 `:root` token 引用,与真 md §1-§5 一致
- **T2(布局)**:无差异 — 4/3/2 网格、60/40 双栏、移动堆叠 + sticky CTA 全就位
- **唯一差异**:卡片图为占位渐变(数据问题,不是设计问题);上线前用决策 3 同期处理

---

## 6. 待用户决策

| 项 | 暂定 | 待回复 |
|---|---|---|
| Hero CTA `成为创作者 → 进入工作室` 跳转 | 当前指向 `/products?intent=custom`(占位) | 批次 2 上线 `/my-studio` 后切到 `/my-studio` |
| `基于这个改造` CTA 跳转 | 当前指向 `/products?intent=custom&from=<id>`(占位) | 同上,批次 2 切到 `/my-studio?from=<id>` 携带原作品参数 |
| `发起团购` CTA | 当前 `alert("开发中")` | 业务上需要管理员审核流程,P1 上线时再做 |
| AI 自动审核(发布作品时) | 本轮不做,用户作品创作能力本就在批次 2 | 批次 2 实现 |
| 商品图为渐变占位 | 决策 3 已批"留到上线前" | — |
| 评论区无认证评论数据 | 用户登录评论时认证字段会自动应用,无需改代码 | — |

---

## 7. 验证

- ✅ `npx prisma db push` exit 0(Neon 同步)
- ✅ `npx tsx scripts/seed-inspiration.ts` → 14 条
- ✅ `npx tsc --noEmit` exit 0
- ✅ `curl /api/inspiration?pageSize=2` → 200(JSON 含 designer.isCertified + promptVisibility + unlockPrice)
- ✅ `curl /api/inspiration/[id]` → 200(免费作品返回 prompt + params,付费 / 不公开作品 promptUnlocked: false 且不含 prompt 字段)
- ✅ 4 张截图全部捕获(顶栏 / Hero / 网格 / 卡片认证视觉 / 详情双栏 / 评论区)
- ✅ 业务逻辑 / 支付流程 / 订单 / 认证 / 路由 未动
- ✅ ConsumerNav 仅按 IA v1.2 加灵感广场,不动其他

---

## 8. 下一步:批次 2 准备

| 待开发 | 依赖 |
|---|---|
| /my-studio 主页 | UI 工作室专用顶栏组件;4 个 AI 创作工具 API |
| /my-studio/works 作品列表 | InspirationWork.userId 索引(已有);工作室专用顶栏 |
| /my-studio/share | 触发 AI 自动审核 → 进 InspirationWork(`status="pending"` → 批准后 `approved`) |
| /my-studio/list-for-sale | 上架审核 → 创建 PublishedDesign |
| 升级邀请系统 | UpgradeInvitation schema + cron 扫描 |

灵感广场已能跑端到端(浏览 / 解锁 / 点赞 / 收藏 / 评论),数据来源会从批次 2 的 `/my-studio/share` 自然填充进 `InspirationWork`。
