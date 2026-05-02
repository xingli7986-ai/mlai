<!-- 本文档 v1.2 = v1.1 主文档(保留不动) + v1.2 补丁合并;v1.2 增量内容已用 "v1.2 增量(基于 v1.1 + 补丁合并)" 标注。日期 2026-05-02 -->

> ⚠️ 本文档为 v1.2 合并版,由 `MaxLuLu AI 页面清单（Sitemap）v1.1.md` 与 `03_Sitemap_页面清单_v1.2_补丁.md` 自动合并产出。原 v1.1 文件保留不动,补丁文件保留作为变更追溯。
> 当前合并策略:v1.1 全文在前 → v1.2 补丁在后;补丁中标注 "替换 v1.1 §X" 的章节以补丁为准。

---

# 第一部分:v1.1 主文档(原文保留)

# MaxLuLu AI 页面清单（Sitemap）

> 版本：v1.1 | 日期：2026-05-01 v1.1 变更：[slug] 统一为 [id]；补 S21-S23 三个 Studio 页面；标注 /studio/join 使用公开布局

---

## 一、消费者前台（9 个页面）

|#|页面名称|路由|优先级|代码状态|线上状态|依赖|
|---|---|---|---|---|---|---|
|C1|首页|`/`|P0|✅ 有代码|⚠️ 待验证|/api/home|
|C2|印花衣橱|`/products`|P0|✅ 有代码|⚠️ 待验证|/api/designs|
|C3|设计详情|`/products/[id]`|P0|✅ 有代码|⚠️ 待验证|/api/designs/[id]|
|C4|个人定制|`/products/[id]/custom`|P0|✅ 有代码|⚠️ 支付宝缺密钥|/api/designs/[id]/custom-order + 支付宝|
|C5|参团购买|`/group-buy/[id]`|P0|✅ 有代码|⚠️ 支付宝缺密钥|/api/group-buys/[id] + 支付宝|
|C6|参团进度|`/group-buy/[id]/progress`|P0|✅ 有代码|⚠️ 待验证|/api/group-buys/[id]|
|C7|个人中心|`/my`|P0|✅ 有代码|⚠️ 待验证|/api/my/*|
|C8|邀约落地页|`/invite/[code]`|P1|❌ 无代码|❌|/api/invitations/[code]|
|C9|搜索|`/search`|P2|❌ 无代码|❌|/api/designs?search=|

---

## 二、设计师工作台 Studio（23 个页面）

|#|页面名称|路由|优先级|代码状态|线上状态|布局|依赖|
|---|---|---|---|---|---|---|---|
|S1|工具首页|`/studio`|P0|✅ 有代码|⚠️ 待验证|Studio Layout|无|
|S2|设计师入驻|`/studio/join`|P1|✅ 有代码|⚠️ API 未接|**公开布局（无侧边栏）**|需接 POST /api/designer/register|
|S3|设计师中心|`/studio/dashboard`|P1|✅ 有代码|⚠️ 待验证|Studio Layout|/api/designer/dashboard|
|S4|发布设计|`/studio/publish`|P1|🔌 UI 有|⚠️ API 未接|Studio Layout|需接 POST /api/designs/publish|
|S5|图案生成|`/studio/pattern/generate`|P0|✅ UI+API|⚠️ 待验证|Studio Layout|/api/ai-studio/generate|
|S6|四方连续|`/studio/pattern/seamless`|P0|✅ UI+API|⚠️ 待验证|Studio Layout|/api/ai-studio/generate|
|S7|画风复刻|`/studio/pattern/style-clone`|P2|❌ 占位|❌|Studio Layout||
|S8|图案融合|`/studio/pattern/fusion`|P2|❌ 占位|❌|Studio Layout||
|S9|工艺融合|`/studio/pattern/craft`|P2|❌ 占位|❌|Studio Layout||
|S10|图案涂改|`/studio/pattern/edit`|P2|❌ 占位|❌|Studio Layout|需画笔 Canvas|
|S11|图案变清晰|`/studio/pattern/enhance`|P2|❌ 占位|❌|Studio Layout|需接阿里云超分|
|S12|线稿生成|`/studio/fashion/sketch`|P0|✅ UI+API|⚠️ 待验证|Studio Layout|/api/ai-studio/generate|
|S13|线稿成款|`/studio/fashion/render`|P0|✅ UI+API|⚠️ 待验证|Studio Layout|/api/ai-studio/generate|
|S14|局部改款|`/studio/fashion/modify`|P1|🎨 UI 有|⚠️ API 未接|Studio Layout||
|S15|款式创新|`/studio/fashion/innovate`|P2|❌ 占位|❌|Studio Layout||
|S16|风格融合|`/studio/fashion/style-fusion`|P2|❌ 占位|❌|Studio Layout||
|S17|系列配色|`/studio/fashion/color`|P2|❌ 占位|❌|Studio Layout||
|S18|定向换色|`/studio/fashion/recolor`|P2|❌ 占位|❌|Studio Layout||
|S19|面料上身|`/studio/fashion/fabric`|P0|✅ UI+API|⚠️ 待验证|Studio Layout|/api/ai-studio/generate|
|S20|图案上身|`/studio/fashion/pattern`|P1|🎨 UI 有|⚠️ API 未接|Studio Layout||
|S21|我的项目|`/studio/projects`|P1|❌ 无代码|❌|Studio Layout|需新建|
|S22|我的设计|`/studio/designs`|P1|❌ 无代码|❌|Studio Layout|需新建|
|S23|设置|`/studio/settings`|P1|❌ 无代码|❌|Studio Layout|需新建|

---

## 三、管理后台（1 个页面）

|#|页面名称|路由|优先级|代码状态|线上状态|依赖|
|---|---|---|---|---|---|---|
|A1|管理中心|`/admin/manage`|P1|✅ 有代码|⚠️ 待验证|/api/admin/*|

---

## 四、统计

|分类|总数|✅ 有代码|🔌/🎨 部分完成|❌ 缺失|
|---|---|---|---|---|
|消费者前台|9|7|0|2|
|Studio|23|10|4|9|
|管理后台|1|1|0|0|
|**合计**|**33**|**18**|**4**|**11**|

---

## 五、MVP 范围冻结规则

| 规则      | 说明                       |
| ------- | ------------------------ |
| 已完成的 P0 | 保留并验证，不砍掉                |
| 未完成的新功能 | 不再加入 P0                  |
| P2 占位页  | 保持占位状态，不投入开发             |
| 新页面需求   | 必须先讨论优先级，写入 Sitemap 后才开发 |

---

# 第二部分:v1.2 增量(基于 v1.1 + 补丁合并)

# MaxLuLu AI 页面清单 Sitemap v1.2 补丁

> 基于 v1.1 增量补充。
> 版本:v1.2 | 日期:2026-05-02

---

## 一、新增页面

| 编号 | 路由 | 名称 | 状态 | 优先级 | 依赖 | 布局 |
|---|---|---|---|---|---|---|
| C10 | /inspiration | 灵感广场 | ❌ 无代码,需新建 | P1 | ConsumerNav, /api/inspiration | 消费者主布局 |
| C11 | /inspiration/[id] | 灵感作品详情 | ❌ 无代码,需新建 | P1 | C10 | 消费者主布局 |
| C12 | /my-studio | 我的设计工作室 | ❌ 无代码,需新建 | P1 | 4 个 AI 工具 API | 工作室专用布局 |
| C13 | /my-studio/works | 我的作品列表 | ❌ 无代码,需新建 | P1 | C12 | 工作室专用布局 |

---

## 二、修改页面

| 编号 | 路由 | 变化 |
|---|---|---|
| C2 | /products | 数据源仅显示"已上架商品",过滤掉未上架的灵感作品 |
| C3 | /products/[id] | 作者署名根据角色显示(认证设计师角标) |
| 顶栏组件 | ConsumerNav | 导航项更新(新增灵感广场 + 我的设计工作室,移除"个性定制") |

---

## 三、新增 API 接口

| 路径 | 方法 | 鉴权 | 用途 |
|---|---|---|---|
| /api/inspiration | GET | 公开 | 灵感广场列表(分页、筛选、排序) |
| /api/inspiration/[id] | GET | 公开 | 灵感作品详情 |
| /api/inspiration/[id]/unlock-prompt | POST | 必需 | 付费/积分解锁 prompt |
| /api/my-studio/create | POST | 必需 | 创作生成 |
| /api/my-studio/share | POST | 必需 | 分享到灵感广场 |
| /api/my-studio/list-for-sale | POST | 必需 | 申请上架成商品 |
| /api/users/[id]/upgrade-eligibility | GET | 必需 | 查询升级资格 |
| /api/users/upgrade-invitation | POST | 必需 | 接受/拒绝升级邀请 |

---

## 四、数据库 Schema 新增

### InspirationWork(灵感广场作品)

```
id, userId, type (用户/设计师作品), title, coverImage, images[], 
prompt, params (JSON), promptVisibility (free/paid/private),
unlockPrice, likeCount, favoriteCount, viewCount, 
isListed (是否已上架), listedProductId,
createdAt, updatedAt
```

### PromptUnlock(prompt 解锁记录)

```
id, userId, inspirationWorkId, paymentMethod (cash/points), 
amount, createdAt
```

### UserPoints(用户积分)

```
userId, balance, totalEarned, totalSpent
```

### UpgradeInvitation(升级邀请)

```
id, userId, triggerType (likes/favorites/sales), 
triggerValue, status (pending/accepted/rejected/expired),
expiresAt, createdAt
```

---

## 五、MVP 冻结规则更新

- 新增页面 C10-C13 进入 P1
- 新增 API 进入 P1
- prompt 解锁的积分体系列入 P2(MVP 阶段先用现金支付)
- 阶梯分润逻辑列入 P1
