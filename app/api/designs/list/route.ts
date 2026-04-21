import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const designs = await prisma.design.findMany({
    where: { userId, status: "saved" },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ designs });
}
