import { NextRequest, NextResponse, after } from "next/server";
import { verifyAlipayNotification } from "@/lib/alipay";
import { prisma } from "@/lib/prisma";
import { processForProduction } from "@/lib/print-processing";

export const runtime = "nodejs";
// `after()` runs the production print pipeline post-response (seamless → R2 →
// Replicate upscale → R2 ≈ 30–120s). Only triggered after payment succeeds.
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const params: Record<string, string> = {};
    new URLSearchParams(body).forEach((value, key) => {
      params[key] = value;
    });

    const isValid = verifyAlipayNotification(params);
    if (!isValid) {
      console.error("Alipay notify signature verification failed");
      return new NextResponse("fail", {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      });
    }

    const outTradeNo = params.out_trade_no;
    const tradeStatus = params.trade_status;
    const tradeNo = params.trade_no;

    if (
      outTradeNo &&
      (tradeStatus === "TRADE_SUCCESS" || tradeStatus === "TRADE_FINISHED")
    ) {
      const updated = await prisma.order.update({
        where: { id: outTradeNo },
        data: {
          status: "paid",
          paymentId: tradeNo,
        },
        select: { designId: true },
      });
      console.log(`Order ${outTradeNo} paid, alipay trade: ${tradeNo}`);

      const designId = updated.designId;
      after(async () => {
        try {
          await processForProduction(designId);
        } catch (err) {
          console.error(
            `Print processing failed for design ${designId}:`,
            err
          );
        }
      });
    }

    return new NextResponse("success", {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  } catch (error) {
    console.error("Alipay notify error:", error);
    return new NextResponse("fail", {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }
}
