/**
 * Seed script: creates 4 system designers + 30 approved PublishedDesigns.
 *
 * Idempotent: re-running upserts the designers (matched by phone) and
 * skips PublishedDesign creation when the designer already has 30+ approved
 * designs. To force re-seed: delete the relevant rows first.
 *
 * Usage: npx tsx scripts/seed-designs.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SYSTEM_DESIGNERS: {
  phone: string;
  name: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
}[] = [
  {
    phone: "13800000001",
    name: "Luna",
    displayName: "Luna · MaxLuLu Studio",
    bio: "巴黎驻地设计师，专注现代东方剪裁与原创印花。",
    avatarUrl: "https://maxlulu-assets.r2.dev/designers/luna.png",
  },
  {
    phone: "13800000002",
    name: "Yuki",
    displayName: "Yuki · Yuki Atelier",
    bio: "东京独立工作室，擅长几何拼接与简约廓形。",
    avatarUrl: "https://maxlulu-assets.r2.dev/designers/yuki.png",
  },
  {
    phone: "13800000003",
    name: "Reine",
    displayName: "Reine · Atelier Reine",
    bio: "高级女装制版出身，作品兼顾礼服气质与日常穿着。",
    avatarUrl: "https://maxlulu-assets.r2.dev/designers/reine.png",
  },
  {
    phone: "13800000004",
    name: "Mei",
    displayName: "Mei · Mei Botanical",
    bio: "植物题材插画师，擅长扎染和工笔花鸟在面料上的应用。",
    avatarUrl: "https://maxlulu-assets.r2.dev/designers/mei.png",
  },
];

const SKIRT_TYPES = ["wrap", "shift", "aline", "fishtail", "pencil"] as const;
const FABRICS = ["silk", "knit", "blend", "linen", "lace"] as const;
const NECKLINES = ["v", "round", "square", "off-shoulder"] as const;
const SLEEVE_TYPES = ["long", "short", "puff", "sleeveless"] as const;
const SKIRT_LENGTHS = ["mini", "midi", "maxi"] as const;

const STYLE_TAG_POOL = [
  "水墨晕染",
  "工笔花卉",
  "几何拼接",
  "扎染",
  "复古花鸟",
  "热带印花",
  "Art Deco",
  "波西米亚",
  "极简",
  "新中式",
  "法式浪漫",
  "高定混纺",
];

const TITLES = [
  "墨韵山茶 · 裹身长袖",
  "山茶绯红 · A 字中长",
  "海风蓝调 · 直筒礼服",
  "酒红玫瑰 · 鱼尾长裙",
  "咖色复古 · 铅笔通勤",
  "玫粉印象 · 真丝裹身",
  "墨绿植物 · 亚麻长裙",
  "鎏金花园 · 高定混纺",
  "奶咖几何 · 极简直筒",
  "雾紫扎染 · A 字中长",
  "橄榄印花 · 短袖连衣",
  "炭黑水墨 · 长袖鱼尾",
  "蜜桃柔光 · 真丝缎面",
  "藏蓝月夜 · 修身喇叭",
  "胭脂红梅 · 立领旗袍",
  "苔绿森林 · 长袖直筒",
  "象牙极简 · 法式裹身",
  "粉烟玫瑰 · 蕾丝鱼尾",
  "深海珊瑚 · 短袖中长",
  "蜂蜜暖阳 · 棉麻长裙",
  "雨后茉莉 · 真丝衬衫裙",
  "薄荷晨露 · 棉麻 A 字",
  "鸢尾蓝 · 法式中袖",
  "鎏金落日 · 缎面礼服",
  "苔绿苔藓 · 工艺刺绣",
  "红梅暗夜 · 真丝盘扣",
  "枫糖暖意 · 高定混纺",
  "陶土质感 · 亚麻棉",
  "月光珍珠 · 缎面长袖",
  "石榴汁红 · 短款裹身",
];

const SAMPLE_COVERS = [
  "https://maxlulu-assets.r2.dev/products/cover-01.jpg",
  "https://maxlulu-assets.r2.dev/products/cover-02.jpg",
  "https://maxlulu-assets.r2.dev/products/cover-03.jpg",
  "https://maxlulu-assets.r2.dev/products/cover-04.jpg",
  "https://maxlulu-assets.r2.dev/products/cover-05.jpg",
  "https://maxlulu-assets.r2.dev/products/cover-06.jpg",
  "https://maxlulu-assets.r2.dev/products/cover-07.jpg",
  "https://maxlulu-assets.r2.dev/products/cover-08.jpg",
];

function pick<T>(arr: readonly T[], i: number): T {
  return arr[i % arr.length];
}

function pickRandomTags(seed: number): string[] {
  const out: string[] = [];
  const count = 2 + (seed % 3);
  for (let k = 0; k < count; k++) {
    const idx = (seed * (k + 1) * 13) % STYLE_TAG_POOL.length;
    const tag = STYLE_TAG_POOL[idx];
    if (!out.includes(tag)) out.push(tag);
  }
  return out;
}

async function upsertDesigner(spec: (typeof SYSTEM_DESIGNERS)[number]) {
  const user = await prisma.user.upsert({
    where: { phone: spec.phone },
    update: { name: spec.name, avatar: spec.avatarUrl, isDesigner: true },
    create: {
      phone: spec.phone,
      name: spec.name,
      avatar: spec.avatarUrl,
      isDesigner: true,
    },
  });

  const designer = await prisma.designer.upsert({
    where: { userId: user.id },
    update: {
      displayName: spec.displayName,
      bio: spec.bio,
      avatarUrl: spec.avatarUrl,
    },
    create: {
      userId: user.id,
      displayName: spec.displayName,
      bio: spec.bio,
      avatarUrl: spec.avatarUrl,
    },
  });

  return designer;
}

async function main() {
  console.log("Seeding system designers + 30 PublishedDesigns…");

  const designers = [];
  for (const spec of SYSTEM_DESIGNERS) {
    const d = await upsertDesigner(spec);
    designers.push(d);
    console.log(`  designer: ${d.displayName} (${d.id})`);
  }

  // For each designer we'll create roughly the same number of designs,
  // distributing the 30 titles round-robin.
  const total = TITLES.length;
  const existingCount = await prisma.publishedDesign.count({
    where: { designerId: { in: designers.map((d) => d.id) }, status: "approved" },
  });
  if (existingCount >= total) {
    console.log(
      `  already has ${existingCount} approved designs across system designers — skipping create.`
    );
    console.log("Done.");
    await prisma.$disconnect();
    return;
  }

  const now = new Date();
  let created = 0;
  for (let i = 0; i < total; i++) {
    const designer = designers[i % designers.length];
    const title = TITLES[i];
    const skirtType = pick(SKIRT_TYPES, i);
    const fabric = pick(FABRICS, i);
    const neckline = pick(NECKLINES, i);
    const sleeveType = pick(SLEEVE_TYPES, i);
    const skirtLength = pick(SKIRT_LENGTHS, i);
    const cover = pick(SAMPLE_COVERS, i);
    const second = pick(SAMPLE_COVERS, i + 3);

    const groupPrice = 39900 + (i * 5300) % 60000; // 399.00–999.00
    const customPrice = groupPrice + 30000 + ((i * 7) % 4) * 10000;

    await prisma.publishedDesign.create({
      data: {
        designerId: designer.id,
        title,
        description: `${title}：${pickRandomTags(i).join(" · ")}。设计师 ${designer.displayName} 原创。`,
        coverImages: [cover, second],
        patternImage: cover,
        skirtType,
        neckline,
        sleeveType,
        skirtLength,
        fabric,
        styleTags: pickRandomTags(i),
        groupPrice,
        customPrice,
        status: "approved",
        publishedAt: new Date(now.getTime() - i * 3600 * 1000),
        likeCount: 20 + ((i * 17) % 200),
        favoriteCount: 5 + ((i * 11) % 80),
        orderCount: ((i * 5) % 30),
        viewCount: 100 + ((i * 33) % 1500),
      },
    });
    created++;
  }

  console.log(`  created ${created} PublishedDesigns.`);
  console.log("Done.");
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error("Seed failed:", err);
  await prisma.$disconnect();
  process.exit(1);
});
