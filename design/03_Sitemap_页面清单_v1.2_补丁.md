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
