import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const outTradeNo = searchParams.get("out_trade_no");

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://maxlulu-ai-iota.vercel.app";
  const redirectUrl = outTradeNo
    ? `${baseUrl}/my/orders/${outTradeNo}`
    : `${baseUrl}/my/orders`;

  return NextResponse.redirect(redirectUrl);
}
