# MaxLuLu AI · ROADMAP

> 分「已完成 / 进行中 / 计划 / 暂缓」四段,源于真实 git 历史(HEAD `f25edc1`,40 提交浅历史)、`prisma/schema.prisma`、`app/` 路由与 `docs/` 运营态文档。

## 已完成(据代码存在 + 运营态文档标注)

- **消费端骨架 + 品牌视觉体系**:首页、产品、`/inspiration` 灵感广场(列表+详情+解锁+点赞收藏评论)、`/my`、登录。配套设计 token(瓷青 `#234A58` / 烟玫 `#C06A73` / 认证金 `#C8A875`,见 `docs/DECISIONS.md` D001–D003)。
- **消费端 My Studio 四工具页**(5/5 基线上线):`/my-studio`、`pattern-generate`、`seamless`、`try-on`、`sketch`。
- **专业设计师 Studio**(`/studio/*`):图案工作室(生成/风格复刻/四方连续/融合/工艺/编辑/增强)、服装实验室(色彩/面料/创新/改款/图案/换色/渲染/线稿/风格融合)、发布 + 工艺单、设计师入驻/仪表盘。
- **交易域**:拼团(`GroupBuy`)+ 邀请返利(`Invitation`)+ 拼团订单;定制下单;每日 Cron 过期拼团退款(`/api/cron/expire-group-buys`)。
- **AI 生图双模型**:永鑫 GPT-Image-2 + Gemini `gemini-3-pro-image-preview`,统一 `/api/ai-studio/generate`,生成图持久化 R2,按角色每日限额(`lib/aiUsage.ts`,内存计数)。
- **微信小程序端**:首页/登录/设计/我的 4 页,Bearer JWT 鉴权,与 Web 共用后端。
- **后台**:`/admin`(设计/拼团/订单/发货/提现审核)。
- **纳入 Atlas 治理**(2026-07-09):补齐 `docs/PRD.md`、`docs/ROADMAP.md`、`docs/progress.md`、`docs/decisions/` 5 条 ADR、`.atlas.json`(不改业务代码)。

## 进行中(据 `docs/CONTEXT_BRIEF.md` / `PROJECT_STATUS.md` / 代码)

- **主线 B Batch 2**:真实 AI 生成 + 作品持久化 + 跨工具串联(workId/resultId)。5/7–5/11 首次尝试经历事故回滚,`main` 已用 `restore backup code` 恢复相关代码(`lib/my-studio/*`、`confirm-design`、works API);其"生产可用性"仍待按部署验证门(ADR-0007)确认。
- **虚拟试穿保真度**:多档模式已在代码中(reference_image 参考图试穿走 image2 edits;garment_tryon 走 FASHN;masked 未接 provider,返回未配置错误)。真实 provider 质量与最终选型待定。

## 计划

- **主线 A 支付闭环**:支付宝下单/回调代码已就绪(`lib/alipay.ts`、`/api/payment/*`),待商户密钥落地后端到端联调。
- **生产资料链路**:`confirm-design` → 生产草案 → 工艺单 PDF(`@react-pdf/renderer`、`lib/techpack-pdf.tsx`)→ 后台审核。字段标准与工厂规则待收敛。
- **生成图长期存储策略**:provider URL 时效不足,统一转存 R2/CDN 的策略需成文。
- **AI 用量计数升级**:`lib/aiUsage.ts` 现为单实例内存计数,多实例需换 Redis 或 Prisma `UsageLog` 表。
- **小程序端补齐**:订单列表 Tab、订单详情放大、Canvas 裙型贴图、图片上传。

## 暂缓 / 明确不做(据 `docs/DECISIONS.md` D008,除非明确要求)

- 定制配置页、生产工艺单 PDF 终版、工厂集成、物流通知、设计师分成结算的完整实现。
- 重启 5/7–5/11 旧 Batch 2 架构(「import 5 个组件只建 2 个」的反模式),需显式新计划方可动。
