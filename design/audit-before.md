# Studio UI 自查 - Before

## 通用问题（全站）
- **整体配色严重偏离规范**：当前是奶白/米色（#f5efe5、#faf7f3、#fffaf2），而规范要求深色模式（背景 #0C0C0F，卡片 #1E1E1E）。仅顶栏为深色，侧边栏与主内容均为浅色。
- **侧边栏全英文**：Workspace / Discover / Tools / Account / Dashboard / My Projects / My Designs / Favorites / Inspiration / Brand Library / Settings / Designer Plan。
- **顶栏品牌副标题英文**：AI Design Studio。
- **顶栏 CTA 英文**："+ New Project"。
- **侧边栏与主内容并排无遮挡**（sticky + flex:1，OK），但侧边栏背景与主区色调不统一。

## studio (/studio) 桌面 + 手机
1. 主背景奶白 ❌（应深色）
2. Hero "下午好, Lulu 👋" 标题字号 OK，但右侧描述文字偏小（11px-12px）
3. Section eyebrow 英文："PATTERN STUDIO"、"GARMENT LAB"
4. Section 标题数字解析疑似错（"个图案工具" 应是 "7 个图案工具"）—— 实际是 ServerSide 文案没渲染数字 prefix
5. 工具卡 14px 小字 OK，但卡片小标 11px 太小
6. 手机端侧边栏正确隐藏 ✓

## studio/join (/studio/join)
1. 背景在此页是深色 ✓（个别区段），但侧边栏依旧浅色 → 视觉割裂
2. "12%" 应改成 10%（设计师分润）
3. "成为 MaxLuLu AI 设计师" 中混英 ✓ 视觉可接受
4. 入驻流程小字 11-12px 偏小
5. 手机端 hero 上下堆叠 OK

## studio/dashboard (/studio/dashboard)
1. 主背景奶白 ❌
2. 大数字"¥28,765.30" 大字号 OK，但小字"较上月" 11px 太小
3. 表格 sidebar "已发布作品" 文字 11-12px 偏小
4. 手机端 ✓ 但卡片堆叠太长，没有响应式 padding 下调

## studio/publish (/studio/publish)
1. 主背景奶白 ❌
2. 表单字段 label 字号正常，但 helper text 11px 偏小
3. 颜色 swatch 区无空白回退 → OK
4. "已发布作品" sidebar 缩略图小，文字 12px 边界

## studio/pattern/generate (/studio/pattern/generate)
1. 主背景奶白 ❌
2. 标题 "图案生成 · Pattern Generate" 中英混杂（应保留中文）
3. 左侧 form label "输入风格 (a /g)" 形参很奇怪（typo? 应是中文标签）
4. 右栏宽 OK，结果区 4 张 placeholder 图 OK
5. 手机端 form/result 上下堆叠 OK

## 9 项检查清单逐条
1. 侧边栏遮挡：✓ 无遮挡（sticky + flex 布局正常）
2. 顶栏对齐：✓
3. 字体过小：❌ 多处 11px-12px 文案需提至 13-14px
4. 畸形/截断：未发现
5. 英文标签：❌ 侧边栏 + 顶栏 + 部分 eyebrow
6. 移动端 375px 自适应：✓ 大体可用
7. 设计师分润 10%：❌ 当前是 12% 需改
8. 卡片/按钮间距：✓ 大体和谐
9. 深色模式统一：❌ **最严重问题** —— 整站应为深色，目前主区是浅米色

## 优先级（按用户指定）
1. ~~侧边栏遮挡~~ → 实际是浅色侧边栏 vs 期望深色侧边栏
2. 响应式 → 基本 OK
3. 字体 → 多处偏小
4. 英文翻译 → 侧边栏 + 顶栏 + 个别 eyebrow
5. 配色 → **深色模式重做主背景与卡片**

## 最严重 3 个页面（生成参考图用）
1. /studio (Studio Home) — 米色与深色彻底冲突
2. /studio/dashboard — 数据可视化页深色诉求最强
3. /studio/pattern/generate — 工具页交互密度高，深色更稳
