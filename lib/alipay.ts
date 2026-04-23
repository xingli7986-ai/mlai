import { AlipaySdk } from "alipay-sdk";

let alipayClient: AlipaySdk | null = null;

export function getAlipayClient(): AlipaySdk {
  if (!alipayClient) {
    const appId = process.env.ALIPAY_APP_ID;
    const privateKey = process.env.ALIPAY_PRIVATE_KEY;
    const alipayPublicKey = process.env.ALIPAY_PUBLIC_KEY;

    if (!appId || !privateKey || !alipayPublicKey) {
      throw new Error("Missing Alipay environment variables");
    }

    alipayClient = new AlipaySdk({
      appId,
      privateKey,
      alipayPublicKey,
      keyType: "PKCS8",
      signType: "RSA2",
    });
  }
  return alipayClient;
}

export async function createAlipayOrder(
  orderId: string,
  totalAmountCents: number,
  subject: string,
  isMobile: boolean
): Promise<string> {
  const sdk = getAlipayClient();
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://maxlulu-ai-iota.vercel.app";

  const totalAmount = (totalAmountCents / 100).toFixed(2);

  const method = isMobile ? "alipay.trade.wap.pay" : "alipay.trade.page.pay";
  const productCode = isMobile ? "QUICK_WAP_WAY" : "FAST_INSTANT_TRADE_PAY";

  const formHtml = sdk.pageExecute(method, "POST", {
    notifyUrl: `${baseUrl}/api/payment/alipay/notify`,
    returnUrl: `${baseUrl}/api/payment/alipay/return`,
    bizContent: {
      out_trade_no: orderId,
      total_amount: totalAmount,
      subject,
      product_code: productCode,
      timeout_express: "30m",
    },
  });

  return formHtml as string;
}

export function verifyAlipayNotification(
  params: Record<string, string>
): boolean {
  const sdk = getAlipayClient();
  return sdk.checkNotifySign(params);
}

export async function queryAlipayOrder(orderId: string) {
  const sdk = getAlipayClient();
  const result = await sdk.curl("POST", "/v3/alipay/trade/query", {
    body: {
      out_trade_no: orderId,
    },
  });
  return result;
}
