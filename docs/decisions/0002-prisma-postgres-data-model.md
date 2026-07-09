# ADR-0002:数据层用 Prisma + PostgreSQL,金额用整数分,计数字段冗余在主表

- 状态:Accepted(已实施)
- 日期:2026-07-09(据 `prisma/schema.prisma` 归纳补录)
- 关联:`prisma/schema.prisma`、`prisma.config.ts`、`lib/prisma.ts`、`package.json`(`@prisma/client` ^6 / `prisma` ^6)

## 背景

平台横跨电商交易、UGC 社交、AI 作品与设计师商业化多域,关系复杂(用户↔设计↔发布↔拼团↔订单↔邀请↔提现;作品↔点赞/收藏/评论/解锁↔积分),需要强关系约束、事务与索引,且要能部署在 Neon/Supabase 等托管 Postgres 上、被 Web 与小程序两端共享。

## 决策

- ORM 选 **Prisma 6**,数据库 **PostgreSQL**(`datasource db { provider = "postgresql" url = env("DATABASE_URL") }`)。
- Client 生成器 `binaryTargets = ["native", "rhel-openssl-3.0.x"]`,以适配 Vercel Serverless(Linux)运行时。
- 核心模型分域:
  - 用户/鉴权:`User`(`phone @unique`)、`VerificationCode`、`Designer`(`isCertified` 决定认证金视觉)。
  - 设计/作品:`Design`、`PublishedDesign`(冗余 `viewCount/likeCount/favoriteCount/orderCount`,按 `status/fabric/skirtType` 建索引)、`InspirationWork`(灵感广场,`promptVisibility` free/paid/private、`toolType`、`unlockPrice`)。
  - 交易:`Order`、`GroupBuy`/`GroupBuyOrder`、`Invitation`(邀请返利)、`Withdrawal`(设计师提现)。
  - 社交/商业化:`Like`/`Favorite`/`Comment` 与灵感域同构表、`PromptUnlock`(平台 30% `platformFee` / 创作者 70% `creatorEarning`)、`UserPoints`(积分余额)。
- **金额一律用整数「分」**(`Int`,如 `unlockPrice`、`amount`、`totalAmount`),避免浮点误差。
- 高频社交计数**冗余在主表**(而非每次 count 关联表),配合唯一约束 `@@unique([userId, publishedDesignId])` 防重复点赞/收藏/解锁。

## 后果

- 正面:类型安全、迁移可控、索引与唯一约束贴合查询;整数分与冗余计数适配电商与信息流读多写少场景。
- 负面/约束:冗余计数需在写路径手动维护一致性,存在漂移风险;`rhel-openssl-3.0.x` 引擎必须保留在 Serverless bundle(见 ADR-0007,曾因剔除引擎导致构建/运行故障);`DATABASE_URL` 缺失会直接 500(见 `docs/DECISIONS.md` D017)。
