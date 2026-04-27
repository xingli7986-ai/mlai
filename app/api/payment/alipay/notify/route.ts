import { NextRequest, NextResponse, after } from "next/server";
import { verifyAlipayNotification } from "@/lib/alipay";
import { prisma } from "@/lib/prisma";
import { processForProduction } from "@/lib/print-processing";
import { sendSmsNotification } from "@/lib/sms";

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
      // Try GroupBuyOrder first — if it matches, mark paid and activate
      // any pending invitation reward.
      const gbOrder = await prisma.groupBuyOrder.findUnique({
        where: { id: outTradeNo },
        select: {
          id: true,
          userId: true,
          totalAmount: true,
          recipientPhone: true,
          groupBuyId: true,
          invitedByUserId: true,
        },
      });
      if (gbOrder) {
        await prisma.groupBuyOrder.update({
          where: { id: outTradeNo },
          data: {
            status: "paid",
            paidAmount: gbOrder.totalAmount,
            paymentId: tradeNo,
          },
        });

        if (gbOrder.invitedByUserId) {
          await prisma.invitation.updateMany({
            where: {
              groupBuyId: gbOrder.groupBuyId,
              inviterUserId: gbOrder.invitedByUserId,
              inviteeUserId: gbOrder.userId,
              status: "pending",
            },
            data: { status: "fulfilled" },
          });
        }

        console.log(`GroupBuyOrder ${outTradeNo} paid, alipay trade: ${tradeNo}`);

        const recipientPhone = gbOrder.recipientPhone;
        const totalAmount = gbOrder.totalAmount;
        const notifyTemplateCode = process.env.SMS_ORDER_PAID_TEMPLATE || "";
        after(async () => {
          if (notifyTemplateCode && recipientPhone) {
            const amountYuan = (totalAmount / 100).toFixed(0);
            try {
              await sendSmsNotification(recipientPhone, notifyTemplateCode, {
                amount: amountYuan,
              });
            } catch (err) {
              console.error("GroupBuyOrder paid SMS failed:", err);
            }
          }
        });

        return new NextResponse("success", {
          status: 200,
          headers: { "Content-Type": "text/plain" },
        });
      }

      const updated = await prisma.order.update({
        where: { id: outTradeNo },
        data: {
          status: "paid",
          paymentId: tradeNo,
        },
        select: {
          designId: true,
          recipientPhone: true,
          totalAmount: true,
        },
      });
      console.log(`Order ${outTradeNo} paid, alipay trade: ${tradeNo}`);

      const designId = updated.designId;
      const recipientPhone = updated.recipientPhone;
      const totalAmount = updated.totalAmount;
      const notifyTemplateCode = process.env.SMS_ORDER_PAID_TEMPLATE || "";
      after(async () => {
        try {
          await processForProduction(designId);
        } catch (err) {
          console.error(
            `Print processing failed for design ${designId}:`,
            err
          );
        }

        if (notifyTemplateCode && recipientPhone) {
          const amountYuan = (totalAmount / 100).toFixed(0);
          try {
            await sendSmsNotification(recipientPhone, notifyTemplateCode, {
              amount: amountYuan,
            });
          } catch (err) {
            console.error("Order paid SMS notification failed:", err);
          }
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
