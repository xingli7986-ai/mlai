# MaxLuLu AI · Progress Log

> 倒序记录仓库重要进展。最新在顶。本文件为 Atlas 治理入口进度页;更细的开发日志见 `docs/DEVELOPMENT_LOG.md`。

## 2026-07-09 · 纳入 Atlas 治理

补齐治理文档(**不改业务代码**),让 Atlas 靠 GitHub App 自动同步时可识别为规范/透明的受治理仓:

- 新增 `docs/PRD.md`(产品定位 / 系统构成 / 三主线 / 鉴权 / 非目标 / pendingHumanAction,全部据当前 `main` 真实代码)。
- 新增 `docs/ROADMAP.md`(已完成 / 进行中 / 计划 / 暂缓)。
- 新增本文件 `docs/progress.md`。
- 新增 `docs/decisions/` 下 **5 条 ADR**:0001 Next.js App Router 结构、0002 Prisma+PostgreSQL 数据模型、0003 消费/专业 Studio 双体系隔离、0004 双端鉴权(next-auth + 小程序 JWT)、0005 支付宝支付、0006 AI 多 provider 生图与试穿、0007 Vercel 部署与体积约束。
- 新增 `.atlas.json`(previewUrl + pendingHumanAction)。

治理前状态:0 ADR、无 `docs/PRD.md` / `ROADMAP.md` / `progress.md`、健康分 26。仓较大(TS,~576 文件,Next.js `app/` + `components/` + `miniprogram/` + `prisma/`),已有 `CLAUDE.md` / `AGENTS.md` / `README.md` 与 `docs/`(D001–D018 决策 + 事故复盘)、`design/`(PRD/IA/Sitemap/UserFlow 多版)。

> 治理注记:`docs/`(事故态,2026-05-12)与 `main` 当前代码存在时间差——文档多处称功能"已回滚",但 `main` 经 `868d829 restore my-studio homepage`、`4155a80 restore backup code with build fixes` 等提交已恢复 `lib/my-studio/*`、`confirm-design`、works API 等。运营态"live/回滚"结论需产品负责人对齐生产实际后更新;本次治理只如实标注差异,未擅改运营态结论,未改业务代码。

### git log 回溯(HEAD → 早,浅历史 40 提交节选)

- `f25edc1` fix: exclude static assets and design mocks from serverless bundle
- `3ab90c4` fix: keep rhel-openssl-3.0.x prisma engine in serverless bundle
- `868d829` feat: restore my-studio homepage to 937eb30 design with missing components
- `4155a80` feat: restore backup code with build fixes
- `54d9f34` rollback to 5/5 baseline + add serverExternalPackages
- `9728075` docs: post-incident review - add deployment verification rules
- `937eb30…6a0965c`(5/7–5/12)· 事故:5 天静默构建失败 + 21 提交回滚(详见 `docs/DEVELOPMENT_LOG.md`)
- `75767d8 / 84b9c72 / 8f87ece` feat(my-studio): sketch / try-on / seamless 工具页
- `edb8e6f` feat: /inspiration 灵感广场链路上线
- `ba5f847` feat: 用 v2 真版规范校对 token + 认证设计师视觉数据落地(浅历史最早)

## 历史里程碑(据 `docs/PROJECT_STATUS.md` / `DEVELOPMENT_LOG.md`)

- **2026-05-12** · 事故复盘:5 天静默构建红、21 提交空转、回滚到 5/5 基线;沉淀部署验证门、止损规则、体积预算、环境变量清单(→ ADR-0007、`docs/DECISIONS.md` D014–D018)。
- **2026-05-05** · 5/5 基线:4 个消费端 My Studio 工具页上线(`435e494`)。
- **更早** · 灵感广场、专业 Studio 工具、拼团/邀请返利、小程序端陆续落地。
