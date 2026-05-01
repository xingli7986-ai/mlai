import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/getAuthUser";
import { uploadBufferToR2 } from "@/lib/upload";
import { makeSuperResolution } from "@/lib/aliyun-sr";
import { getUserRole } from "@/lib/userRole";
import { checkUsageLimit, recordUsage, getDailyUsage } from "@/lib/aiUsage";

export const runtime = "nodejs";
export const maxDuration = 120;

interface EnhanceRequest {
  imageUrl?: string;
  upscaleFactor?: 2 | 3 | 4;
}

export async function POST(req: Request) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json(
      { success: false, error: "未登录" },
      { status: 401 }
    );
  }

  // PRD §6.4: enhance also counts as an AI generation against the daily cap.
  const { role, aiDailyLimit } = await getUserRole(user);
  const limitCheck = checkUsageLimit(user.id, aiDailyLimit);
  if (!limitCheck.ok) {
    return NextResponse.json(
      {
        success: false,
        error: limitCheck.error,
        role,
        used: getDailyUsage(user.id),
        limit: aiDailyLimit,
      },
      { status: limitCheck.status },
    );
  }

  let body: EnhanceRequest;
  try {
    body = (await req.json()) as EnhanceRequest;
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const imageUrl = typeof body.imageUrl === "string" ? body.imageUrl : "";
  if (!imageUrl) {
    return NextResponse.json(
      { success: false, error: "缺少 imageUrl" },
      { status: 400 }
    );
  }
  const upscaleFactor = [2, 3, 4].includes(Number(body.upscaleFactor))
    ? Number(body.upscaleFactor)
    : 2;

  try {
    const resultUrl = await makeSuperResolution(imageUrl, upscaleFactor);

    // Aliyun returns a short-lived OSS URL, transfer to R2 immediately.
    const imgRes = await fetch(resultUrl);
    if (!imgRes.ok) {
      throw new Error(`Failed to fetch enhanced image: ${imgRes.status}`);
    }
    const buffer = Buffer.from(await imgRes.arrayBuffer());
    const key = `studio/enhanced/${Date.now()}_${upscaleFactor}x.png`;
    const finalUrl = await uploadBufferToR2(buffer, key, "image/png");

    const used = recordUsage(user.id);
    return NextResponse.json({
      success: true,
      images: [{ url: finalUrl }],
      used,
      limit: aiDailyLimit,
    });
  } catch (err) {
    console.error("AI Studio enhance error:", err);
    const message = err instanceof Error ? err.message : "超分失败";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
