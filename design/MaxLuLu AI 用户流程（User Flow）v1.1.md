# MaxLuLu AI 用户流程（User Flow）

> 版本：v1.1 | 日期：2026-05-01 v1.1 变更：补订单状态机；补拼团状态机；补支付异常处理；group-buy find-or-create 改为 POST；统一 [id]

---

## 一、消费者 — 参团购买流程（核心路径，占收入 70%）

```
┌─────────────┐
│  用户访问首页  │  页面: /
│  浏览热拼/热门  │  API: GET /api/home
└──────┬──────┘
       │ 点击商品卡片
       ▼
┌─────────────┐
│  印花衣橱    │  页面: /products
│  筛选/排序/翻页│  API: GET /api/designs?sort=&category=&page=
└──────┬──────┘
       │ 点击设计卡片
       ▼
┌─────────────┐
│  设计详情页   │  页面: /products/[id]
│  查看图片/描述 │  API: GET /api/designs/[id]
│  点赞/收藏/评论│  API: POST .../like|favorite|comments
└──────┬──────┘
       │ 点击"参团购买"
       ▼
┌─────────────┐
│  查找或创建拼团│  API: POST /api/group-buys/find-or-create { designId }
│  返回 groupBuyId│  ⚠️ 必须用 POST，不是 GET
└──────┬──────┘
       │ 前端跳转
       ▼
┌─────────────┐
│  参团购买页   │  页面: /group-buy/[id]
│  显示拼团详情  │  API: GET /api/group-buys/[id]（只读）
│  选尺码/填地址 │
│  有邀请码可抵扣 │
└──────┬──────┘
       │ 点击"立即支付"
       ▼
┌─────────────┐         ┌─────────────┐
│  未登录？     │── 是 ──→│  弹出登录框   │
└──────┬──────┘         └──────┬──────┘
       │ 已登录                 │ 登录成功
       ▼                       ▼
┌─────────────┐
│  创建参团订单  │  API: POST /api/group-buys/[id]/orders
│  订单状态:     │  → pending_payment
│  事务内操作:   │  → currentCount++
│              │  → 校验邀请码有效性
│              │  → 计算折扣金额
└──────┬──────┘
       ▼
┌─────────────┐
│  发起支付    │  API: POST /api/payment/create {orderId, kind:"group-buy"}
│  后端查库算金额│  ⚠️ 不接受前端传金额
│  返回支付宝表单│
└──────┬──────┘
       │ 表单自动提交
       ▼
┌─────────────┐
│  支付宝收银台  │  外部页面
└──────┬──────┘
       │
       ├─── 支付成功 ──→ 异步回调 + 同步跳转（见下方）
       ├─── 用户取消 ──→ 订单保持 pending_payment，等待超时关闭
       └─── 支付失败 ──→ 订单保持 pending_payment，用户可重新支付
```

### 支付成功后的回调处理

```
支付宝异步回调（POST /api/payment/alipay/notify）:
├── 解析 form-urlencoded 请求体
├── 验证签名（checkNotifySign）
├── 幂等检查：订单已是 paid → 直接返回 "success"，不重复处理
├── 金额校验：回调金额 vs 数据库订单金额，不一致则记录告警
├── 更新订单：status → paid, paymentId → trade_no
├── 触发 processForProduction（幂等守卫）
└── 返回纯文本 "success"（Content-Type: text/plain）

支付宝同步回调（GET /api/payment/alipay/return）:
├── 从 URL 取 out_trade_no
└── 重定向到 /group-buy/[id]/progress

⚠️ 同步回调不做业务处理，仅重定向。以异步回调为准。
```

---

## 二、消费者 — 个人定制流程（占收入 20%）

```
┌─────────────┐
│  设计详情页   │  页面: /products/[id]
└──────┬──────┘
       │ 点击"定制此款"
       ▼
┌─────────────┐
│  个人定制页   │  页面: /products/[id]/custom
│  选择:        │
│  - 裙型       │
│  - 面料       │  → 联动定价（基础/中端/高端 × 定制价）
│  - 尺码       │  → 标准码或自定义量体
│  - 领型/袖型/裙长│
│  填写收货信息  │
└──────┬──────┘
       │ 点击"立即定制"
       ▼
┌─────────────┐
│  创建订单    │  API: POST /api/designs/[id]/custom-order
│  订单状态:     │  → pending_payment
│  totalAmount: │  → 定制价（分）
└──────┬──────┘
       ▼
┌─────────────┐
│  发起支付    │  API: POST /api/payment/create {orderId, kind:"order"}
│  → 支付宝收银台│
│  → 支付成功   │  异步回调更新 status → paid
│  → 跳回个人中心│  /my（订单 Tab）
└─────────────┘
```

---

## 三、消费者 — 邀约裂变流程

```
┌─────────────┐
│  已参团用户   │  页面: /group-buy/[id]/progress 或 /my
│  获得邀请码   │
│  分享链接/码   │
└──────┬──────┘
       │ 分享给朋友
       ▼
┌─────────────┐
│  朋友打开链接  │  页面: /invite/[code]
│  展示:        │
│  - 邀请人信息  │  API: GET /api/invitations/[code]
│  - 设计详情   │
│  - ¥30 优惠提示│
│  - "立即参团"按钮│
└──────┬──────┘
       │ 点击"立即参团"
       ▼
│  参团购买页   │  自动填入邀请码，后续同参团流程
```

---

## 四、设计师 — 入驻流程

```
┌─────────────┐
│  消费者导航   │  点击"设计师入驻"
│  或直接访问   │  → /studio/join（公开布局，无侧边栏）
└──────┬──────┘
       ▼
┌─────────────┐
│  入驻页       │  了解平台/分润/工具/流程/案例
└──────┬──────┘
       │ 点击"立即申请入驻"
       ▼
┌─────────────┐
│  申请表单     │  姓名/手机号/设计经验/作品链接/自我介绍
└──────┬──────┘
       │ 提交
       ▼
┌─────────────┐
│  等待审核     │  API: POST /api/designer/register
│  role: designer_pending│
└──────┬──────┘
       │ 管理员审核通过
       ▼
┌─────────────┐
│  role → designer│  可使用全部工具 + 保存 + 发布
│  引导进入 /studio│
└─────────────┘
```

---

## 五、设计师 — 创作与发布流程

（与 v1.0 相同，略）

---

## 六、设计师 — 收入与提现流程

（与 v1.0 相同，略）

---

## 七、管理员 — 日常运营流程

（与 v1.0 相同，略）

---

## 八、登录流程

（与 v1.0 相同，略）

---

## 九、订单状态机

### 9.1 个人定制订单状态

```
pending_payment ──支付成功──→ paid ──进入生产──→ in_production ──发货──→ shipped ──确认收货──→ completed
      │                        │
      │                        └──用户申请退款──→ refund_pending ──退款完成──→ refunded
      │
      └──30分钟超时──→ closed
```

|状态|中文|触发条件|用户可见|
|---|---|---|---|
|pending_payment|待支付|创建订单时|显示"去支付"按钮|
|paid|已支付|支付宝异步回调确认|显示"等待生产"|
|in_production|生产中|管理员标记|显示"生产中"|
|shipped|已发货|管理员填写物流单号|显示物流信息|
|completed|已完成|用户确认收货 或 发货后15天自动确认|显示"已完成"|
|refund_pending|退款中|用户申请退款（paid 状态下）|显示"退款处理中"|
|refunded|已退款|管理员确认退款|显示"已退款"|
|closed|已关闭|30分钟未支付自动关闭|显示"订单已关闭"|

### 9.2 参团订单状态

```
pending_payment ──支付成功──→ paid ──进入拼团──→ grouping
      │                                          │
      │                              ┌────────────┤
      │                              │            │
      │                       满30人成团      72h未满
      │                              │            │
      │                              ▼            ▼
      │                        group_success  group_failed
      │                              │            │
      │                        进入生产        自动退款
      │                              │            │
      │                              ▼            ▼
      │                      in_production    refunded
      │                              │
      │                        发货→完成（同定制）
      │
      └──30分钟超时──→ closed
```

|状态|中文|触发条件|
|---|---|---|
|pending_payment|待支付|创建参团订单时|
|paid|已支付|支付宝回调确认|
|grouping|拼团中|支付成功后自动|
|group_success|拼团成功|满 30 人|
|group_failed|拼团失败|72h 超时未满|
|in_production|生产中|拼团成功后进入生产|
|shipped|已发货|管理员操作|
|completed|已完成|确认收货|
|refunded|已退款|拼团失败自动退款|
|closed|已关闭|30分钟未支付|

### 9.3 拼团状态（GroupBuy 维度，非订单维度）

|状态|中文|触发条件|
|---|---|---|
|active|进行中|创建拼团时|
|fulfilled|已满团|currentCount 达到 30|
|expired|已过期|72h 未满，Cron 标记|
|cancelled|已取消|管理员手动取消|

---

## 十、支付规则与异常处理

### 10.1 核心规则

|规则|说明|
|---|---|
|金额来源|后端从数据库订单读取 totalAmount，不接受前端传金额|
|金额单位|存储用分（Int），传给支付宝时 /100 转元 toFixed(2)|
|支付超时|timeout_express: 30m，30 分钟未支付自动关闭|
|订单关闭|closed 状态的订单不可再支付|

### 10.2 异步回调（notify）规则

|规则|说明|
|---|---|
|幂等处理|同一个 out_trade_no，如果订单已是 paid/后续状态，直接返回 "success"，不重复入账|
|签名验证|必须调用 sdk.checkNotifySign(params)，验签失败返回 "fail"|
|金额校验|回调中的 total_amount 与数据库 order.totalAmount/100 对比，不一致记录告警日志|
|返回格式|纯文本 "success"，Content-Type: text/plain，不是 JSON|
|重复推送|支付宝最多推送 24 小时，必须每次都返回 "success" 才停止|

### 10.3 异常场景处理

|异常场景|处理方式|
|---|---|
|用户打开支付宝后取消|订单保持 pending_payment，不做任何处理|
|支付成功但同步回调失败|以异步回调为准，同步回调仅做重定向|
|支付宝重复发送 notify|幂等处理，已 paid 直接返回 "success"|
|30 分钟超时未支付|支付宝自动关闭交易，订单状态 → closed|
|前端传入篡改金额|后端不读前端金额，只从数据库取|
|拼团失败需退款|Cron 触发，调用支付宝退款 API，订单状态 → refunded|