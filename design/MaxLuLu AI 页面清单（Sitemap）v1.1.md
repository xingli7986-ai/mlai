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

|规则|说明|
|---|---|
|已完成的 P0|保留并验证，不砍掉|
|未完成的新功能|不再加入 P0|
|P2 占位页|保持占位状态，不投入开发|
|新页面需求|必须先讨论优先级，写入 Sitemap 后才开发|