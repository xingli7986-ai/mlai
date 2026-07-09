# ADR-0004:双端鉴权——Web 走 next-auth,小程序走 Bearer JWT,后端统一解析

- 状态:Accepted(已实施)
- 日期:2026-07-09(据 `lib/auth.ts`、`lib/getAuthUser.ts`、`lib/jwt.ts`、`miniprogram/README.md` 归纳补录)
- 关联:`lib/auth.ts`、`lib/getAuthUser.ts`、`lib/jwt.ts`、`app/api/auth/[...nextauth]/route.ts`、`app/api/auth/send-code/route.ts`、`app/api/miniapp/login/route.ts`、`miniprogram/utils/api.js`

## 背景

同一套后端 API 要同时服务 Next.js Web 端与微信原生小程序。Web 天然用 cookie session,小程序则不便用 cookie、需 Bearer token 存 `wx.storage`。两端登录都基于**手机号 + 短信验证码**(`User.phone @unique`,`VerificationCode`)。

## 决策

- Web:**next-auth v5(beta.31)**,`Credentials`(phone + code)provider,`session.strategy = "jwt"`,`trustHost: true`,登录页 `/login`,secret 走 `NEXTAUTH_SECRET`。验证码校验后 `prisma.user.upsert({ where: { phone } })` 自动注册。
- 小程序:`POST /api/miniapp/login` 下发 **HS256 Bearer JWT**(30 天),存 `wx.storage`;`utils/api.js` 自动带 `Authorization: Bearer`,401 时清 token 并 `wx.reLaunch` 登录页。
- **统一解析**:所有受保护路由用 `lib/getAuthUser(req)` —— 先尝试 next-auth session,再 fallback 校验 `Authorization: Bearer <jwt>`(`verifyMiniAppToken`)。两端并存、互不影响。
- 验证码 MVP 阶段小程序侧固定 `1234`(见 `miniprogram/README.md`),生产需接真实短信(阿里云 SMS,`lib/sms.ts`)。

## 后果

- 正面:一套后端服务两端,鉴权差异被 `getAuthUser` 收敛为单一入口,业务路由无需关心来源。
- 负面/约束:两套凭证生命周期不同(cookie vs 30 天 JWT),登出/失效语义需分别处理;`NEXTAUTH_SECRET` / JWT secret / `NEXTAUTH_URL` 缺失会导致鉴权全线故障(见 `docs/DECISIONS.md` D017)。
- 密钥红线:所有密钥只在各端本地/Vercel 环境变量,`.env.example` 仅占位,**绝不进仓、不进 Atlas**。
