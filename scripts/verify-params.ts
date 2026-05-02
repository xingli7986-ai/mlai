import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
(async () => {
  const rows = await p.inspirationWork.findMany({
    orderBy: { createdAt: "desc" },
    select: { title: true, params: true },
  });
  for (const r of rows) {
    console.log(r.title.padEnd(30), JSON.stringify(r.params));
  }
  await p.$disconnect();
})();
