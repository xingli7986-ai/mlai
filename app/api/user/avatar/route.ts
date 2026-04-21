import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getAuthUser } from "@/lib/getAuthUser";
import { prisma } from "@/lib/prisma";
import { r2Client, R2_BUCKET, R2_PUBLIC_URL } from "@/lib/r2";

export const runtime = "nodejs";

const MAX_SIZE = 2 * 1024 * 1024; // 2MB

export async function POST(req: Request) {
  try {
    const user = await getAuthUser(req);
    const userId = user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let form: FormData;
    try {
      form = await req.formData();
    } catch {
      return NextResponse.json(
        { error: "Invalid form data" },
        { status: 400 }
      );
    }

    const file = form.get("file");
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "file is required" },
        { status: 400 }
      );
    }
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "file must be an image" },
        { status: 400 }
      );
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "file exceeds 2MB limit" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const key = `avatars/${userId}_${Date.now()}.webp`;

    await r2Client.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: file.type,
      })
    );

    const avatarUrl = `${R2_PUBLIC_URL}/${key}`;

    await prisma.user.update({
      where: { id: userId },
      data: { avatar: avatarUrl },
    });

    return NextResponse.json({ success: true, avatar: avatarUrl });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Avatar upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
