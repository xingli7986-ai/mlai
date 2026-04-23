import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendSmsCode } from "@/lib/sms";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();

    if (!phone || typeof phone !== "string" || !/^1\d{10}$/.test(phone)) {
      return NextResponse.json(
        { error: "手机号格式不正确" },
        { status: 400 }
      );
    }

    const recentCode = await prisma.verificationCode.findFirst({
      where: {
        phone,
        createdAt: { gt: new Date(Date.now() - 60 * 1000) },
      },
      orderBy: { createdAt: "desc" },
    });

    if (recentCode) {
      return NextResponse.json(
        { error: "发送太频繁，请60秒后再试" },
        { status: 429 }
      );
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    await prisma.verificationCode.create({
      data: {
        phone,
        code,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    });

    const result = await sendSmsCode(phone, code);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message || "验证码发送失败" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: "验证码已发送" });
  } catch (error) {
    console.error("Send code error:", error);
    return NextResponse.json({ error: "发送失败" }, { status: 500 });
  }
}
