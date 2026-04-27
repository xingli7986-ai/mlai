import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/getAuthUser";
import { prisma } from "@/lib/prisma";
import { createAlipayOrder } from "@/lib/alipay";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const { orderId, kind } = (await req.json()) as {
      orderId?: string;
      kind?: "order" | "group-buy";
    };
    if (!orderId || typeof orderId !== "string") {
      return NextResponse.json({ error: "缺少 orderId" }, { status: 400 });
    }

    let totalAmountCents = 0;
    let subject = "MaxLuLu AI 订单";

    if (kind === "group-buy") {
      const gbOrder = await prisma.groupBuyOrder.findUnique({
        where: { id: orderId },
        select: {
          userId: true,
          totalAmount: true,
          status: true,
          groupBuy: {
            select: { publishedDesign: { select: { title: true } } },
          },
        },
      });
      if (!gbOrder || gbOrder.userId !== user.id) {
        return NextResponse.json({ error: "订单不存在" }, { status: 404 });
      }
      if (gbOrder.status !== "pending") {
        return NextResponse.json({ error: "订单状态不允许支付" }, { status: 400 });
      }
      totalAmountCents = gbOrder.totalAmount;
      subject = `MaxLuLu 拼团 - ${gbOrder.groupBuy.publishedDesign.title}`;
    } else {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { design: true },
      });
      if (!order || order.userId !== user.id) {
        return NextResponse.json({ error: "订单不存在" }, { status: 404 });
      }
      if (order.status !== "pending") {
        return NextResponse.json({ error: "订单状态不允许支付" }, { status: 400 });
      }
      totalAmountCents = order.totalAmount;
      subject = `MaxLuLu AI 定制 - ${order.skirtType}`;
    }

    if (!totalAmountCents || totalAmountCents <= 0) {
      return NextResponse.json({ error: "订单金额异常" }, { status: 400 });
    }

    const ua = req.headers.get("user-agent") || "";
    const isMobile = /Mobile|Android|iPhone|iPad/i.test(ua);

    const formHtml = await createAlipayOrder(
      orderId,
      totalAmountCents,
      subject,
      isMobile
    );

    return NextResponse.json({ formHtml, isMobile });
  } catch (error) {
    console.error("Payment create error:", error);
    return NextResponse.json({ error: "创建支付失败" }, { status: 500 });
  }
}
