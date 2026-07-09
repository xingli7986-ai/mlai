# ADR-0005:支付走支付宝(网页/手机网站),服务端建单 + 异步回调核销

- 状态:Accepted(代码就绪,受商户密钥配置约束)
- 日期:2026-07-09(据 `lib/alipay.ts`、`app/api/payment/*` 归纳补录)
- 关联:`lib/alipay.ts`、`app/api/payment/create/route.ts`、`app/api/payment/alipay/notify/route.ts`、`app/api/payment/alipay/return/route.ts`、`.env.example`

## 背景

主线 A(消费者购买:拼团/定制下单 → 支付 → 履约)需要真实支付能力。目标市场为中国大陆女装消费者,支付宝为首选渠道;同时需兼顾 PC 网页与移动端网页两种下单场景。

## 决策

- 支付渠道选**支付宝**,SDK 用 `alipay-sdk` ^4,`keyType: "PKCS8"`、`signType: "RSA2"`(`lib/alipay.ts`,单例懒加载 `getAlipayClient()`)。
- 按端选接口:移动端 `alipay.trade.wap.pay`(`QUICK_WAP_WAY`),PC 端 `alipay.trade.page.pay`(`FAST_INSTANT_TRADE_PAY`);`pageExecute` 生成表单跳转。
- 金额从整数分换算为元两位小数(`(cents/100).toFixed(2)`),`out_trade_no` = 订单 ID,`timeout_express: "30m"`。
- 回调分离:`notifyUrl` → `/api/payment/alipay/notify`(服务端异步核销,权威),`returnUrl` → `/api/payment/alipay/return`(用户浏览器跳回)。
- 缺任一密钥(`ALIPAY_APP_ID` / `ALIPAY_PRIVATE_KEY` / `ALIPAY_PUBLIC_KEY`)时 `getAlipayClient()` 直接抛错,不静默降级。

## 后果

- 正面:标准商户支付闭环,异步 notify 保证到账核销的可靠性;整数分贯穿避免金额误差。
- 负面/约束:签名验签依赖正确配置的商户私钥与支付宝平台公钥(非应用公钥),密钥/签名不匹配是典型故障(见 `docs/DECISIONS.md` D017);当前受商户密钥落地进度约束,支付端到端联调待完成(`docs/PROJECT_STATUS.md` 列为 blocker)。
- 密钥红线:支付宝密钥只进 Vercel 环境变量,绝不进仓。
