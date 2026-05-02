/**
 * Read-only:从 Neon 查 14 条 InspirationWork,产出 markdown 清单。
 * 输出到 design/seed-inspiration-list.md + 同时打印到终端。
 * 不修改数据库,不修改代码,仅读 + 写本地 md 文件。
 */
import { PrismaClient } from "@prisma/client";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const prisma = new PrismaClient();

async function main() {
  const rows = await prisma.inspirationWork.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          name: true,
          designer: { select: { displayName: true, isCertified: true } },
        },
      },
    },
  });

  const lines: string[] = [];
  lines.push("# /inspiration 种子作品清单(14 条)");
  lines.push("");
  lines.push("> 来源:Neon Postgres `InspirationWork` 表实时查询(本文件由 `scripts/export-inspiration-list.ts` 生成)。");
  lines.push("> 仅记录创作侧元数据,不含数据库 ID / 时间戳 / 运行时计数。");
  lines.push("");
  lines.push("---");
  lines.push("");

  rows.forEach((w, i) => {
    const designer = w.user.designer;
    const creatorName = designer?.displayName ?? w.user.name ?? "匿名创作者";
    let creatorType: string;
    if (w.creatorType === "designer") {
      creatorType = designer?.isCertified ? "认证设计师" : "设计师";
    } else {
      creatorType = "普通用户";
    }
    const paramsStr =
      w.params && typeof w.params === "object"
        ? JSON.stringify(w.params)
        : "(无)";
    const promptStatus =
      w.promptVisibility +
      (w.unlockPrice > 0 ? ` · ¥${(w.unlockPrice / 100).toFixed(0)} 解锁` : "");
    const promptText = w.prompt ?? "(私稿不公开)";

    lines.push(`### 作品 ${i + 1}:${w.title}`);
    lines.push("");
    lines.push(`- 创作者:${creatorName}`);
    lines.push(`- 类型:${creatorType}`);
    lines.push(`- 工具:${w.toolType}`);
    lines.push(`- 风格:${w.styleTags.join(" / ") || "(无标签)"};params=${paramsStr}`);
    lines.push(`- prompt 公开方式:${promptStatus}`);
    lines.push(`- prompt:${promptText}`);
    lines.push(`- 描述:${w.description ?? "(无)"}`);
    lines.push("");
  });

  const md = lines.join("\n");
  const out = resolve("design/seed-inspiration-list.md");
  writeFileSync(out, md);
  console.log(md);
  console.log(`\n— 已写入 ${out}`);
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
