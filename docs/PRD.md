# MaxLuLu AI · PRD(产品需求 / 系统定位文档)

> 本文件是 mlai 仓库纳入 Atlas 治理后的**产品定位与系统真源说明**,内容全部据当前 `main`(HEAD `f25edc1`)真实代码归纳,非从历史记忆推断。
> 仓内另有 `design/` 下更早的产品文档(PRD v1.1 / v1.2、IA、Sitemap、UserFlow),以及 `docs/` 下运营态文档(`CONTEXT_BRIEF`、`PROJECT_STATUS`、`DECISIONS` D001–D018、`DEVELOPMENT_LOG`、`TASK_BACKLOG`)。本 PRD 是纳管入口,不替代它们。

## 一、产品是什么

**MaxLuLu AI** 是一个「高端女装电商 + AI 印花创作」双引擎平台,由 **Next.js Web 端**与**微信小程序端**共用同一套后端 API 组成。

品牌定位(据 `CLAUDE.md` / `AGENTS.md` / `docs/CONTEXT_BRIEF.md`):
- 高端女装,克制、现代、上海都市优雅,印花驱动的女性力量;对标 DVF / Toteme / NET-A-PORTER / Mytheresa。
- 核心品类:针织印花连衣裙、A 字裙、深 V 裹身裙、中长印花裙。
- Slogan:`Fashion For You — 每一朵印花,都由你绽放`。
- 明确**反**样式:SaaS 后台风、淘宝促销页、批发女装页、重 AI 科技风、廉价渐变/过度粉。

## 二、三条产品主线(据 `AGENTS.md` / `docs/PROJECT_STATUS.md`)

| 主线 | 流程 | 现状 |
|---|---|---|
| A. 消费者购买 | products → 拼团/定制下单 → 支付 → 履约 | UI 就绪;支付走支付宝(见 ADR-0005),受支付宝密钥配置约束 |
| B. 消费者创作 | 创建作品 → 印花创作 → 虚拟试穿 → 开始定制 → 生产资料草案 → 后台审核 | 当前重点;4 个 My Studio 工具页已上线,试穿多档保真在 `main` 恢复(见 ADR-0006) |
| C. 设计师生态 | 设计师入驻 → 专业 Studio → 发布 → 收益分成 | 部分上线;专业 Studio 工具较全,发布/分成待完善 |

## 三、系统构成(据真实目录与代码)

### Web 端(Next.js App Router)
- `app/` 下按路由组织:消费端(`/`、`/products`、`/inspiration`、`/my-studio/*`、`/group-buy`、`/my`)、设计师专业端(`/studio/*`)、后台(`/admin/*`)、`/api/*` 路由处理器。
- 详见 ADR-0001(App Router 结构)。

### 小程序端(`miniprogram/`)
- 微信原生小程序,AppID `wx42469815c1f5ee09`,`utils/api.js` 硬编码后端 `https://maxlulu-ai-iota.vercel.app`。
- 4 页:首页 / 登录 / 设计 / 我的。与 Web 共用后端,鉴权用 Bearer JWT(见 ADR-0004、`miniprogram/README.md`)。

### 数据层(Prisma + PostgreSQL)
- `prisma/schema.prisma`:20+ 模型。核心域:
  - 用户与鉴权:`User`(手机号唯一)、`VerificationCode`、`Designer`。
  - 设计与作品:`Design`、`PublishedDesign`、`InspirationWork`(灵感广场)。
  - 交易:`Order`、`GroupBuy` / `GroupBuyOrder`(拼团)、`Invitation`(邀请返利)、`Withdrawal`(设计师提现)。
  - 社交与商业化:`Like` / `Favorite` / `Comment`,`InspirationLike/Favorite/Comment`,`PromptUnlock`(提示词付费解锁,平台 30% / 创作者 70%)、`UserPoints`(积分)。
- 详见 ADR-0002(数据模型)。

### AI 能力
- 消费端 My Studio 与专业 Studio 生图统一走 `/api/ai-studio/generate`。
- 双模型:**永鑫科技 GPT-Image-2**(OpenAI 兼容 `/images/generations` 与 `/images/edits`,`lib/suchuang.ts`)与 **Google Gemini `gemini-3-pro-image-preview`**(`@google/genai`)。
- 试穿另可走 FASHN provider(`lib/my-studio/tryon-provider.ts`),多档保真度(approximate / reference_image / masked / garment_tryon)。
- 生产印花管线另有 Replicate(Real-ESRGAN 超分)、阿里云视觉智能超分、potrace 矢量化。详见 ADR-0006。

### 存储与部署
- 生成图持久化到 **Cloudflare R2**(`@aws-sdk/client-s3`,`lib/r2.ts`)。
- 部署 **Vercel**(Hobby),`vercel.json` 配 1 个 Cron(每日过期拼团处理)。受 250MB Serverless 体积上限约束(见 ADR-0007)。

## 四、鉴权

- Web:next-auth v5 beta,Credentials(手机号 + 验证码),JWT session(`lib/auth.ts`)。
- 小程序:HS256 Bearer JWT(`POST /api/miniapp/login`,`lib/jwt.ts`)。
- 统一解析:`lib/getAuthUser.ts` 先 next-auth session,再 fallback Bearer。详见 ADR-0004。

## 五、非目标 / 边界(据 `CLAUDE.md`、`docs/DECISIONS.md` D008)

- 不在本仓做:支付宝支付完整落地、定制配置页、生产工艺单 PDF 终版、工厂集成、物流通知、设计师分成结算——除非明确要求。
- 消费端 My Studio(`/my-studio/*`)与专业 OPC/设计师 Studio(`/studio/*`)严格分离,消费端入口不得指向专业 Studio 页(ADR-0003)。
- 密钥永不进仓(`.env.example` 仅占位;见 ADR-0004 后果段)。

## 六、pendingHumanAction(需人工处理,不阻断治理)

- 本次治理为**本地提交、未 push**;需人工推送到 `origin/main` 后 Atlas GitHub App 才会同步(见 `.atlas.json`)。
- `docs/`(2026-05-12 事故态)与 `main` 当前代码存在时间差:文档称多项功能"已回滚",但 `main` 经 `4155a80 restore backup code` 等提交已恢复试穿/confirm-design 等代码。运营态文档的"live/回滚"结论需产品负责人对齐生产实际后更新,本治理文档只如实标注差异,不擅改运营态结论。
