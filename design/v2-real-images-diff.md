# /inspiration 自检差异表(稿 vs 实际)

> 日期:2026-05-03
> 方法:6 文件同框对比 — 4 张实际截图(`design/screenshots/v2-real-images/`)+ 2 张稿(`01_inspiration_灵感广场.png` + `03_inspiration-detail_灵感作品详情.png`)
> 不依赖用户判断,Claude 自检结果。

---

## 一、差异类型定义

- **T0**:稿件预期但实际缺失元素 / 模块
- **T1**:token 偏差(色号 / 字号 / 间距 / 高度)— 数值层面
- **T2**:布局偏差(列数 / 对齐 / 模块顺序 / 位置)
- **T3**:视觉细节(圆角 / 边框 / shadow / 比例)

## 二、逐模块差异表

### /inspiration 桌面对比(`desktop_inspiration.png` vs 01 稿)

| # | 模块 | 子项 | 稿件预期 | 实际渲染 | 差异类型 | 具体偏差 |
|---|---|---|---|---|---|---|
| D-1 | 顶栏 | 双语标识 | "灵感广场 / inspiration"双语显示在 logo 旁 | 仅 logo "MaxLuLu AI",无双语标 | T0 | 稿 logo 旁多了"灵感广场"中文 + "inspiration"英文小字 2 行;实际无此双语小字 |
| D-2 | 顶栏右上 | 操作图标群 | 圆形头像 + 心形/收藏 + 搜索图标(3 个图标式)| 文字链接"会员 / 我的衣橱" | T2 | 稿是图标式(28-32px 圆形),实际是文字。属 ConsumerNav 全局组件,IA v1.2 未规定 |
| D-3 | Hero | 主标语言 | "Fashion For You"(英文衬线大标,~64-72px)+ "每一朵印花..."(中文副标)| 仅"每一朵印花,都由你绽放"中文 H1 | T0 | 稿件英文主标完全缺失;只有中文副 |
| D-4 | Hero | 高度 | ~600-680px(模特占 hero 满高)| 480px | T1 | 高度差约 120-200px |
| D-5 | Hero | 模特图区域 | 占 hero 右侧 55-65% 全高 | 占 hero 右侧 ~50% 但因 hero 较矮整体小 | T1+T2 | 比例接近,绝对尺寸偏小 |
| D-6 | Hero | 文字 max-width | ~440px(字体大但不挤模特)| 600px(在 480 高的 hero 里相对宽)| T1 | 文字区窄一些更聚焦 |
| D-7 | Hero | Eyebrow 文字 | "/inspiration"路由风格 | "INSPIRATION SQUARE · 灵感广场"两段文字 | T0/T2 | 稿用路径风格,实际用全大写 + 中文 |
| D-8 | Hero | Stats 数字位置 | hero 内右下,3 数字横排,无背景卡 | hero 右下,3 数字 + 半透明卡 | T3 | 稿无背景卡(数字浮在模特上),实际加了 rgba(252,253,253,0.85)背景卡 |
| D-9 | Hero | Stats 数字字号 | ~32-40px Playfair | 40/48 Playfair | T1 | 接近,稿可能略小 |
| D-10 | Hero | CTA 位置 | 不明显在 hero 内(可能没有) | 文字下方 Smoked Rose 圆角矩形按钮 | T0 | 稿可能 CTA 在 hero 外,实际在内 |
| D-11 | 筛选 chip 行 | 行数 | 1 行 ~5-6 chip | 2 行 = 工具 5 + prompt 4 + 排序 5 | T2 | 实际多 1 行 |
| D-12 | 主网格 | 列数 | 4 列(桌面)| 4 列 | ✅ | 一致 |
| D-13 | 卡片右上角标 | 元素 | 心形 ♡ 收藏图标(红/暗色) | 三角金"认证"PNG(56×56)+ 无收藏图标 | T0/T2 | 稿是收藏快捷键,实际是认证身份。两者语义不同 — 99 md §02 强制金角标右上,稿件强制 ♡ 右上;**位置冲突** |
| D-14 | 卡片图比例 | aspect ratio | 4:5 全身模特 | 4:5 全身模特 | ✅ | 一致 |
| D-15 | 卡片底信息 | 内容顺序 | 标题 + (价格?) + by 作者 + 心/收藏数 | 标题 + by 作者 + 喜欢/收藏/浏览数 3 阶 | T2 | 稿可能有价格行,实际无(灵感作品 prompt 解锁价在 lockBadge);稿底信息更密 |
| D-16 | 卡片底署名 | 字号 | ~12-13px | 13/20 | T1 | 接近 |
| D-17 | 右侧边栏 | 顶部主推图卡 | 大图 + 主推作品(类似 product card)| 仅 3 个 filter 卡(印花风格 / 解锁价格 / Join promo) | T0 | 稿顶部有大图主推卡,实际无 |
| D-18 | 右侧边栏 | filter 列表样式 | chip 横排 + 选项列表 | chip + range buttons | T3 | 接近 |

### /inspiration/[id] 桌面对比(`desktop_inspiration_detail.png` vs 03 稿)

| # | 模块 | 子项 | 稿件预期 | 实际渲染 | 差异类型 | 具体偏差 |
|---|---|---|---|---|---|---|
| E-1 | 顶栏 | 同 D-1 / D-2 | 双语 + 图标 | 单语 + 文字 | T0/T2 | 同上 |
| E-2 | Crumbs | 文字 | 不明显(稿可能无 crumbs)| "灵感广场 › 鎏金落日 · 法式中长" | T0/T2 | 稿件可能不需要 crumbs |
| E-3 | 缩略图 | 位置 | 左侧竖排 4 张缩略 + 主图右(总宽分 110/520 列)| 主图下方横排 4 张 | T2 | 重要布局差异 — 稿是左竖排,实际是下横排 |
| E-4 | 主图区 | 比例 | 4:5 全身模特 | 4:5 全身 | ✅ | 一致 |
| E-5 | 主图区 | 主图右下"全屏"或"放大" | 稿不可见明显放大按钮 | 实际可能也无 | — | 一致 |
| E-6 | 信息卡 | 顶部 chip + 日期 | "图案上身"或类似 chip + 销量"12 件"等小 stats | "图案上身"瓷青 chip + 日期 2026/5/2 | T0 | 稿可能含销量数字 stats,实际未显示 |
| E-7 | 信息卡 | 标题字号 | ~32-40px 衬线 | 28/36 H2 衬线 | T1 | 接近,稿可能略大 |
| E-8 | 作者卡 | 内容 | 头像 + 名字 + 认证 + 数字销量 + 关注 | 头像 + 名字 + 认证 chip + 关注 | T0 | 稿含销量数字,实际无 |
| E-9 | 作者卡边框 | 描边 | 稿描边接近无 / 1px 浅灰 | 1px 金边(认证启用时)| T3 | 稿不一定要金边整卡 |
| E-10 | 信息卡 metrics | 4 阶 metrics | 不明显 | 412/198/0/0 喜欢/收藏/解锁/评论 | T0 | 稿无此 4 阶,实际加了 |
| E-11 | Action row | 喜欢/收藏/分享按钮 | 不明显独立 row | 实际有 3 个独立按钮 | T0 | 稿不显示独立 row |
| E-12 | Prompt 区 | 标题 + 内容 | 不明显有 PROMPT 区 | "PROMPT · 创作详情" + 文字 + 参数 | T0 | 稿在右栏可能不显示 prompt 区 |
| E-13 | CTA 主按钮 | 文字 + 颜色 | 大 Smoked Rose "立即下单"或类似 | 大 Smoked Rose "基于这个改造" | T2 | 稿是商品下单 CTA,实际是创作改造 CTA(语义不同 — 灵感作品本身不下单)|
| E-14 | CTA 次按钮 | 数量 | 1 个主 CTA(粉)+ 可能有图标按钮 | "基于这个改造"(rose)+ "发起团购"(瓷青描边)2 个 | T2 | 实际多 1 个 CTA |
| E-15 | 详情参数列表 | 完整长 list | 稿右栏有 8-12 行 spec(尺码/颜色/面料/工艺/...) | 实际无 spec 列表(灵感作品没有 spec) | T0 | 稿是商品详情风格,实际是灵感作品风格(语义不同) |
| E-16 | 底部相似作品 | 稿无 / 是 design system 演示 | 稿底部是 design system 演示稿(色板 / 排版),不是实际产品要素 | 实际显示"相似作品"横滚 + 评论区 | — | 稿件 03 是 design system 演示稿,不是真实页面截图;实际超出稿件范围反而更符合产品需求 |

### Mobile 对比

稿件未提供 mobile 版本。实际 mobile_inspiration.png + mobile_inspiration_detail.png 仅检查响应式正确性,无稿可比。

| # | 模块 | 现状 | 评价 |
|---|---|---|---|
| M-1 | /inspiration mobile hero | 自适应高度 380px,渐变蒙版上→下,文字+stats 堆叠 | ✅ |
| M-2 | /inspiration mobile 网格 | 2 列 | ✅ |
| M-3 | /inspiration/[id] mobile | 单列堆叠,主图在上,信息在下,sticky CTA 底部 | ✅ |
| M-4 | mobile 金角标 44×44 | 缩放可见 | ✅ |

---

## 三、A / B / C 分级

### A 类(必修 — 影响视觉品质,稿件明确要求,可以动手)

| 编号 | 来源 | 修法 |
|---|---|---|
| A-1 | E-3 缩略图位置 | `app/inspiration/[id]/detail.css` `.inspGallery` 改为 grid-template-columns 110px 1fr,thumb 列在主图左侧竖排;移动端保留下方横排 |
| A-2 | D-3 Hero 双语主标 | `app/inspiration/page.tsx` Hero 加"Fashion For You"英文衬线 + 现有中文 H1 改为副标层 |
| A-3 | D-13 卡片右上心形收藏 | `app/inspiration/page.tsx` 卡片 media 内加 hover 出现的心形按钮 .inspCard__like(右上,但偏移以避开金角标)|
| A-4 | D-4 / D-9 Hero 高度 | `.inspHero` 480 → 560px 桌面;移动 380 → 420px |
| A-5 | D-7 Hero eyebrow | "INSPIRATION SQUARE · 灵感广场"改为更接近稿"灵感广场 / inspiration"路径感(只用斜杠隔开)|
| A-6 | D-8 Hero stats 背景 | `.inspHero__stats` 删除半透明卡背景,数字直接浮在模特图上(增加 text-shadow 提升可读性)|

### B 类(选修 — 细节偏差,影响小,等用户决定)

| 编号 | 来源 | 选修原因 |
|---|---|---|
| B-1 | D-1 / E-1 顶栏双语 | ConsumerNav 全局组件;IA v1.2 §1.1 仅定中文项,加双语需 IA v1.3 |
| B-2 | D-11 筛选 chip 行数 | 实际筛选维度(工具 + prompt + 排序)是产品真实需求,稿可能简化了;减少不合理 |
| B-3 | E-10 / E-11 信息卡 4 阶 metrics + action row | 稿件 03 实际是 my-studio-works 演示稿,不完全适用 /inspiration/[id];metrics + action 是合理的产品需求 |
| B-4 | E-15 详情 spec 列表 | 稿是商品详情风格,/inspiration/[id] 是灵感作品风格,不需要 spec |
| B-5 | E-13 CTA 文字 | 稿"立即下单"是商品视角,实际"基于这个改造"是灵感作品视角,语义不冲突 |

### C 类(暂不修 — 数据 / 素材原因)

| 编号 | 来源 | 暂不修原因 |
|---|---|---|
| C-1 | D-2 顶栏右上图标群 | ConsumerNav 全局组件,改动影响 /products + /products/[id] + 其他页;IA v1.2 未规定;需 IA v1.3 与设计师讨论 |
| C-2 | D-17 右侧大图主推卡 | 需要"主推作品"业务定义(管理员推选?自动算法?)+ 配图;无业务定义不能凭空加 |
| C-3 | D-13 收藏 + 认证角标位置冲突 | 99 md §02 强制金角标在右上,稿 01 强制 ♡ 在右上,两者位置冲突。99 md 优先(CLAUDE.md §3 已定);收藏图标在 A-3 中放到 hover 出现 + 偏左下避开金角标 |
| C-4 | E-2 Crumbs | 稿件可能没画 crumbs,但 crumbs 是产品 UX 实际需要,保留 |
| C-5 | E-6 / E-8 销量数字 stats | 稿件 03 是 my-studio-works 演示;/inspiration/[id] 不需要"销量"概念 |

---

## 四、修复计划(只修 A 类)

A-1 ~ A-6 共 6 项。预估改动:
- 1 个 .css 文件:`app/inspiration/[id]/detail.css` 缩略图位置
- 1 个 .css 文件:`app/inspiration/inspiration.css` Hero 高度 + stats 背景
- 1 个 .tsx 文件:`app/inspiration/page.tsx` Hero 双语 + eyebrow + 卡片心形按钮
- 1 个 .css 文件:`components/ui/ui.css` (?可能不需要;心形是页面内 CSS)

每修一项后,重新 view 一次该截图 + 该稿区,确认对齐再下一项。
