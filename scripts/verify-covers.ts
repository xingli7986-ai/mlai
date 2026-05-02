import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
(async () => {
  const rows = await p.inspirationWork.findMany({
    orderBy: { createdAt: "desc" },
    select: { title: true, coverImage: true, images: true },
  });
  for (const r of rows) {
    const cov = r.coverImage.split("/").pop()?.replace("ChatGPT Image May 2, 2026, ", "") || "";
    console.log(r.title.padEnd(28), "→", cov, " (+", r.images.length - 1, "thumbs)");
  }
  await p.$disconnect();
})();
