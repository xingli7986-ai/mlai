# ADR-0001:Web 端采用 Next.js App Router,按消费/专业/后台三域组织路由

- 状态:Accepted(已实施)
- 日期:2026-07-09(据现有代码归纳补录;决策发生在建站早期)
- 关联:`app/`、`app/layout.tsx`、`app/studio/layout.tsx`、`package.json`(next 16.2.4 / react 19.2.4)、`next.config.ts`

## 背景

MaxLuLu AI 是「高端女装电商 + AI 印花创作」平台,需同时承载:面向消费者的品牌/购买/创作页、面向设计师的专业创作工作台、面向运营的后台,以及大量 `/api/*` 服务端逻辑(鉴权、支付、AI 生图、拼团、Cron)。要求 SSR/RSC、服务端路由与前端同仓,且能部署到 Vercel。

## 决策

- 前端锁定 **Next.js 16(App Router)+ React 19 + TypeScript + Tailwind CSS v4**。
- `app/` 目录按三域组织路由:
  - 消费端:`/`、`/products/*`、`/inspiration/*`、`/my-studio/*`、`/group-buy/*`、`/my/*`、`/login`、`/design`、`/share`、法务页。
  - 专业设计师端:`/studio/*`(独立 `app/studio/layout.tsx`,含图案工作室与服装实验室多工具)。
  - 后台:`/admin/*`。
- 所有后端逻辑用 App Router 的 Route Handlers(`app/api/**/route.ts`),AI/PDF 等重路由显式声明 `export const runtime = "nodejs"` 与 `maxDuration`。
- 组件分层:`components/ui`(基础)、`components/my-studio`、`components/studio`、`components/auth`、共享 `ConsumerNav` / `AssetImage`。

## 后果

- 正面:前后端同仓、RSC 减少客户端体积、Vercel 一键部署;三域清晰便于按 ADR-0003 隔离消费/专业 Studio。
- 负面/约束:Next 16 + React 19 属较新版本,升级需谨慎;`app/api` 重路由(AI 生图 120s、Cron 300s)对 Serverless 冷启动与超时敏感;客户端/服务端组件边界易踩坑。
- 该栈为锁定约束,更换需先改本 ADR 与 `AGENTS.md`。
