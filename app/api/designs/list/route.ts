import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/getAuthUser";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const user = await getAuthUser(req);
  const userId = user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const designs = await prisma.design.findMany({
      where: { userId, status: "saved" },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ designs });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to load designs";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
