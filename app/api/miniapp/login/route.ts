import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signMiniAppToken } from "@/lib/jwt";

export const runtime = "nodejs";

const MVP_CODE = "1234";

export async function POST(req: Request) {
  let body: { phone?: unknown; code?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const code = typeof body.code === "string" ? body.code.trim() : "";

  if (!phone) {
    return NextResponse.json({ error: "phone is required" }, { status: 400 });
  }
  if (code !== MVP_CODE) {
    return NextResponse.json(
      { error: "验证码错误（MVP 阶段固定为 1234）" },
      { status: 401 }
    );
  }

  try {
    const user = await prisma.user.upsert({
      where: { phone },
      update: {},
      create: { phone },
    });
    const token = signMiniAppToken({ id: user.id, phone: user.phone });
    return NextResponse.json({
      success: true,
      token,
      user: { id: user.id, phone: user.phone },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Login failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
