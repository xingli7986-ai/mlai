import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/getAuthUser";

export const runtime = "nodejs";

interface RegisterBody {
  name?: unknown;
  studio?: unknown;
  phone?: unknown;
  email?: unknown;
  style?: unknown;
  experience?: unknown;
  intro?: unknown;
}

function asTrimmedString(v: unknown, max = 200): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

/**
 * POST /api/designer/register
 * Body: { name, studio, phone, email?, style?, experience?, intro? }
 *
 * Per User Flow §4: submitting the /studio/join form transitions a logged-in
 * user from `consumer` to `designer_pending`.
 *
 * Implementation (no schema change): we create the `Designer` row but leave
 * `User.isDesigner = false` until admin approval flips it. The presence of the
 * Designer row + isDesigner=false denotes the `designer_pending` state.
 *
 * The submitted application metadata is stored as a JSON string in
 * `Designer.bio` — this keeps the API self-contained until a dedicated
 * DesignerApplication model is introduced.
 */
export async function POST(req: Request) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json(
      { error: "请先登录后再提交申请" },
      { status: 401 },
    );
  }

  let body: RegisterBody;
  try {
    body = (await req.json()) as RegisterBody;
  } catch {
    return NextResponse.json({ error: "请求体不是合法 JSON" }, { status: 400 });
  }

  const name = asTrimmedString(body.name, 64);
  const studio = asTrimmedString(body.studio, 128);
  const phone = asTrimmedString(body.phone, 32);
  const email = asTrimmedString(body.email, 128);
  const style = asTrimmedString(body.style, 64);
  const experience = asTrimmedString(body.experience, 64);
  const intro = asTrimmedString(body.intro, 1000);

  if (!name) {
    return NextResponse.json({ error: "姓名必填" }, { status: 400 });
  }
  if (!studio) {
    return NextResponse.json({ error: "设计工作室必填" }, { status: 400 });
  }
  if (!phone) {
    return NextResponse.json({ error: "手机号必填" }, { status: 400 });
  }
  if (!/^\+?\d[\d\s\-()]{6,30}$/.test(phone)) {
    return NextResponse.json({ error: "手机号格式有误" }, { status: 400 });
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "邮箱格式有误" }, { status: 400 });
  }

  try {
    const existing = await prisma.designer.findUnique({
      where: { userId: user.id },
    });
    const account = await prisma.user.findUnique({
      where: { id: user.id },
      select: { isDesigner: true },
    });

    if (existing && account?.isDesigner) {
      return NextResponse.json(
        { error: "你已经是签约设计师" },
        { status: 409 },
      );
    }

    const application = JSON.stringify({
      submittedAt: new Date().toISOString(),
      studio,
      phone,
      email,
      style,
      experience,
      intro,
    });

    if (existing) {
      const updated = await prisma.designer.update({
        where: { id: existing.id },
        data: {
          displayName: name,
          bio: application,
        },
      });
      return NextResponse.json({
        designerId: updated.id,
        status: "pending",
        message: "申请已更新，平台将在 3 个工作日内审核",
      });
    }

    const created = await prisma.designer.create({
      data: {
        userId: user.id,
        displayName: name,
        bio: application,
      },
    });
    return NextResponse.json({
      designerId: created.id,
      status: "pending",
      message: "申请已提交，平台将在 3 个工作日内审核",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "服务器错误";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
