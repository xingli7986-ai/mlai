# MaxLuLu AI 微信小程序

## 项目结构

```
miniprogram/
├── app.js / app.json / app.wxss
├── project.config.json       # AppID 配置
├── sitemap.json
├── utils/
│   ├── api.js                # 封装 wx.request，自动带 Bearer token
│   └── auth.js               # token + user storage
├── pages/
│   ├── index/                # 首页（品牌展示）
│   ├── login/                # 登录（手机号 + 验证码 1234）
│   ├── design/                # 设计（风格预设 + 生成 + 选图 + 下单）
│   └── my/                   # 个人中心（设计 + 订单 + 退出）
└── README.md
```

## 环境要求

- 微信开发者工具 v1.06+
- 基础库版本: 2.32+（需支持 `aspect-ratio` CSS 属性、`enhanced` scroll-view）

## 配置说明

**API 地址**：已硬编码到 `utils/api.js`：
```js
const BASE_URL = 'https://maxlulu-ai-iota.vercel.app'
```

**AppID**：`wx42469815c1f5ee09`，在 `project.config.json` 中。

## 首次运行

1. 打开「微信开发者工具」，选择「导入项目」
2. 项目目录选择 `D:\maxlulu-ai\miniprogram`
3. AppID 自动读取：`wx42469815c1f5ee09`
4. 开发阶段 `project.config.json` 中 `urlCheck: false`，可直连 Vercel API。**发布前**必须到微信公众平台的「开发管理 → 开发设置 → 服务器域名」白名单里加入：
   ```
   request 合法域名：https://maxlulu-ai-iota.vercel.app
   ```

## 鉴权方案

小程序与 Web 端共用同一套后端 API，但鉴权凭证不同：

| 端 | 凭证 | 下发接口 |
|----|------|----------|
| Web | next-auth session cookie (JWT 策略) | `/api/auth/callback/credentials` |
| 小程序 | Bearer HS256 JWT | `POST /api/miniapp/login` |

后端所有受保护路由都改用 `lib/getAuthUser.ts` 统一解析，先尝试 next-auth session，再 fallback 检查 `Authorization: Bearer <token>`。两端并存、互不影响。

登录接口返回结构：
```json
{
  "success": true,
  "token": "xxx.yyy.zzz",
  "user": { "id": "clx...", "phone": "13800138000" }
}
```

Token 30 天有效，存在 `wx.storage` 里。401 时 `utils/api.js` 自动清 token 并 `wx.reLaunch` 到登录页。

## TabBar 图标（可选）

`app.json` 的 `tabBar.list` 暂未指定 `iconPath` / `selectedIconPath`，WeChat 会渲染为纯文字 tab。

如需图标，准备 6 个 PNG（建议 81×81，≤40KB）放到 `images/` 目录并更新 `app.json`：

```
images/
├── tab-home.png / tab-home-active.png
├── tab-edit.png / tab-edit-active.png
└── tab-user.png / tab-user-active.png
```

然后在 `app.json` 每个 tab 项加上：
```json
"iconPath": "images/tab-home.png",
"selectedIconPath": "images/tab-home-active.png"
```

## 页面流程

- **首页** → 品牌展示 + 「开始设计」按钮（跳 tabBar）+ 3 步说明 + 作品展示横滑
- **登录** → 手机号 → 验证码（MVP 固定 `1234`） → 存 token → 跳「我的」tab
- **设计** → 风格预设快速填入 → prompt → 生成 4 张 → 选图 → 保存/重新生成 → 选裙型 → 选面料 → 选尺码 → 确认下单 → 跳「我的」+ toast
- **我的** → 用户信息卡 + 订单统计（待付款/待发货/已完成）+ 我的设计网格 + 最近 3 笔订单 + 退出登录

## 与 Web 端功能对齐情况

| 功能 | Web | 小程序 |
|------|-----|--------|
| 手机号登录 | ✓ (next-auth cookie) | ✓ (JWT) |
| 风格预设 | ✓ 6 种 | ✓ 6 种 |
| AI 生成 4 图 | ✓ | ✓ |
| 印花平铺预览 | ✓ CSS background | ✗ 留作后续 |
| Canvas 裙型贴图 | ✓ | ✗ 留作后续（需 wx-canvas 2D） |
| 保存设计 | ✓ | ✓ |
| 重新生成 | ✓ | ✓ |
| 6 种裙型 | ✓ SVG 剪影 | ✓ 纯文字卡片 |
| 2 种面料 | ✓ SVG 纹理 | ✓ 纯文字卡片 |
| 4 种尺码 | ✓ | ✓ |
| 下单 mock 支付 | ✓ | ✓ |
| 订单列表 | ✓ + Tab 切换 | ✓ 仅最近 3 |
| 订单详情 | ✓ 独立页 + 放大图 | ✗ 留作后续 |
| 订单状态流转 | ✓ API 就绪 | ✗ 留作后续 |
| 首页作品展示 | ✓ 6 卡横滑 | ✓ 6 卡横滑 |

## 后续可补的功能

1. `pages/orders/orders` —— Tab 切换全部订单列表
2. `pages/orders/detail?id=` —— 订单详情 + 放大图 + 状态操作按钮
3. Canvas 裙型贴图预览（小程序用 `canvas type="2d"`）
4. 图片上传/存储（当前由 Gemini 生成后上传至 Cloudflare R2 长期保存）
