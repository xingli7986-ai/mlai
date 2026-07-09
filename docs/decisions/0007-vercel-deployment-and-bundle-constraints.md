# ADR-0007:部署 Vercel(Hobby)+ R2 存储 + Cron,受 250MB Serverless 体积上限约束

- 状态:Accepted(已实施,含事故后强制约束)
- 日期:2026-07-09(据 `next.config.ts`、`vercel.json`、`lib/r2.ts`、`AGENTS.md`、`docs/DECISIONS.md` D014–D018 归纳补录)
- 关联:`next.config.ts`、`vercel.json`、`lib/r2.ts`、`lib/upload.ts`、`app/api/cron/expire-group-buys/route.ts`、`AGENTS.md`、`docs/DECISIONS.md`(D014–D018)、`docs/DEVELOPMENT_LOG.md`(5/12 事故)

## 背景

平台部署在 **Vercel Hobby**,Serverless Function 解压后有 **250MB** 硬上限。项目引入了 `sharp`、`@prisma/client`、`@react-pdf/renderer`、`potrace` 等重包与多平台原生二进制。2026-05-12 曾发生 5 天静默构建失败 + 函数超 250MB + 环境变量丢失叠加的重大事故,21 提交空转后回滚。

## 决策

- **托管**:Vercel(Next.js 原生),生成图/上传持久化到 **Cloudflare R2**(`@aws-sdk/client-s3`,region `auto`,bucket `maxlulu-ai`)。
- **定时任务**:`vercel.json` 配 Cron `/api/cron/expire-group-buys`(每日 `0 0 * * *`),用 `CRON_SECRET`(Bearer 或 `?key=`)鉴权,`maxDuration=300`。
- **体积控制**(`next.config.ts`):
  - `serverExternalPackages: ['sharp','@prisma/client','@react-pdf/renderer','potrace']` —— 这几个**必须**保留在外部包,移除会构建/部署失败。
  - `outputFileTracingExcludes` 剔除非 Linux 的 sharp 二进制、多余 prisma 引擎、`@react-pdf`/`potrace` 运行时冗余,以及 `public/assets/*`、`design/**` 等静态资源。
  - Prisma 生成器保留 `rhel-openssl-3.0.x` 引擎(Vercel Linux 需要)。
- **图片域白名单**(`next/image`):R2 的 `*.r2.dev` / `*.r2.cloudflarestorage.com`。
- **事故后强制门(MANDATORY,见 `AGENTS.md`)**:
  - 每次 push 后 5 分钟内必须核验 Vercel 构建状态;红则停止一切开发只做恢复(D014)。
  - 止损:同一 bug 修 3+ 次 / 同一文件 48h 改 5+ 次 / 连续 2 次构建失败 → 停手升级人工(D015)。
  - 体积预算 ≤200MB(留 50MB 余量);新增 >5MB 依赖需先讨论(D016)。
  - 生产环境变量清单固定(DATABASE_URL / NEXTAUTH_* / YXAI_* / R2_* / CRON_SECRET 等),疑似缺失按环境问题上报而非静默补 fallback(D017)。
  - 未经生产 URL 一小时内实测,禁用"上线/已发布/done"字样(D018)。

## 后果

- 正面:重包外置 + tracing 排除把函数体积压在上限内;R2 解决生成图长期存储;Cron 自动处理拼团过期退款。事故沉淀的验证门/止损/体积/环境四类规则显著降低复发风险。
- 负面/约束:Hobby 250MB 上限是持续约束,任何重依赖都要先评估体积;`serverExternalPackages` 与 tracing 排除是易踩的隐性依赖,误删即坏构建;环境变量是单点故障源,需人工审计。
