/**
 * Seed: 14 条 InspirationWork 数据。
 * - 一半归属 Luna / Reine(认证设计师)
 * - 一半归属 Yuki / Mei / 2 个假装的普通消费者
 * - prompt 公开:50% free / 30% paid(¥9-¥39)/ 20% private
 *
 * 幂等:再跑一次会跳过已存在的(按 title+userId 唯一性弱判定)。
 *
 * Usage: npx tsx scripts/seed-inspiration.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 假装的普通消费者(还没认证设计师身份)— 用于演示"普通用户作品无金描边"
const CONSUMER_USERS = [
  {
    phone: "13900000001",
    name: "桃子小姐",
    avatar: "https://maxlulu-assets.r2.dev/users/peach.png",
  },
  {
    phone: "13900000002",
    name: "栗子",
    avatar: "https://maxlulu-assets.r2.dev/users/chestnut.png",
  },
];

const TOOLS = ["print", "repeat", "tryon", "fitting"] as const;
const STYLE_TAGS = [
  "水墨晕染",
  "工笔花卉",
  "几何拼接",
  "扎染",
  "复古花鸟",
  "热带印花",
  "Art Deco",
  "新中式",
  "法式浪漫",
  "极简",
];

// 占位 URL —— 不要把 public/assets/images/home/ 的图当作品封面用,那是首页占位图,
// 不是创作者作品。等 GPT(或真实创作者)提供作品图后再替换。
// 当前 URL 在测试环境不可达,前端 <img> 走 onError 路径,呈现纯色 / 渐变占位。
const SAMPLE_COVERS = [
  "https://maxlulu-assets.r2.dev/inspiration/work-01.jpg",
  "https://maxlulu-assets.r2.dev/inspiration/work-02.jpg",
  "https://maxlulu-assets.r2.dev/inspiration/work-03.jpg",
  "https://maxlulu-assets.r2.dev/inspiration/work-04.jpg",
  "https://maxlulu-assets.r2.dev/inspiration/work-05.jpg",
  "https://maxlulu-assets.r2.dev/inspiration/work-06.jpg",
  "https://maxlulu-assets.r2.dev/inspiration/work-07.jpg",
  "https://maxlulu-assets.r2.dev/inspiration/work-08.jpg",
];

interface Spec {
  title: string;
  description: string;
  // 创作者匹配:designer name 或 consumer phone
  creatorKey: string;
  creatorType: "designer" | "user";
  toolType: (typeof TOOLS)[number];
  promptVisibility: "free" | "paid" | "private";
  unlockPrice: number; // 分
  prompt: string;
  styleTags: string[];
  likeBoost: number;
  favBoost: number;
  viewBoost: number;
}

// 14 条;一半 Luna/Reine,一半 Yuki/Mei/普通
const WORKS: Spec[] = [
  // === Luna 4 条(认证)===
  { title: "墨韵山茶 · 灵感线稿", description: "以山茶花瓣为单位,用水墨晕染做不规则平铺。", creatorKey: "Luna", creatorType: "designer", toolType: "print", promptVisibility: "free", unlockPrice: 0, prompt: "watercolor camellia blossom on warm ivory background, soft ink halo, 200dpi tile pattern", styleTags: ["水墨晕染", "工笔花卉"], likeBoost: 320, favBoost: 145, viewBoost: 1820 },
  { title: "海风蓝调 · 几何瓷青", description: "瓷青菱形拼接,留白做透气感。", creatorKey: "Luna", creatorType: "designer", toolType: "repeat", promptVisibility: "paid", unlockPrice: 1900, prompt: "porcelain cyan rhombus tessellation, hand-drawn lines, 1.2x repeat tile", styleTags: ["几何拼接", "极简"], likeBoost: 245, favBoost: 88, viewBoost: 1240 },
  { title: "鎏金落日 · 法式中长", description: "AI 试衣样 — 落日金色与橄榄绿对撞。", creatorKey: "Luna", creatorType: "designer", toolType: "tryon", promptVisibility: "free", unlockPrice: 0, prompt: "french midi dress on model, sunset gold + olive print, studio lighting", styleTags: ["法式浪漫", "Art Deco"], likeBoost: 412, favBoost: 198, viewBoost: 2210 },
  { title: "工笔牡丹 · 不公开私稿", description: "正在开发中的私人创作,暂不对外。", creatorKey: "Luna", creatorType: "designer", toolType: "print", promptVisibility: "private", unlockPrice: 0, prompt: "(私稿不公开)", styleTags: ["工笔花卉", "新中式"], likeBoost: 56, favBoost: 22, viewBoost: 380 },

  // === Reine 3 条(认证)===
  { title: "鸢尾蓝 · 法式中袖灵感", description: "用单一鸢尾花瓣做密铺,灵感来自 Atelier Reine 春夏季。", creatorKey: "Reine", creatorType: "designer", toolType: "print", promptVisibility: "free", unlockPrice: 0, prompt: "single iris petal seamless tile, gradient cobalt to lavender, intricate ink line", styleTags: ["法式浪漫", "工笔花卉"], likeBoost: 388, favBoost: 162, viewBoost: 2080 },
  { title: "薄荷晨露 · 四方连续", description: "晨露主题,清晨光斑做点状散布。", creatorKey: "Reine", creatorType: "designer", toolType: "repeat", promptVisibility: "paid", unlockPrice: 2900, prompt: "mint dew droplets, soft pastel scatter, square repeat 30cm", styleTags: ["极简", "新中式"], likeBoost: 167, favBoost: 71, viewBoost: 1080 },
  { title: "Art Deco 黄金分割", description: "几何金色拼接,主打廓形定制。", creatorKey: "Reine", creatorType: "designer", toolType: "fitting", promptVisibility: "private", unlockPrice: 0, prompt: "(私稿不公开)", styleTags: ["Art Deco", "几何拼接"], likeBoost: 92, favBoost: 36, viewBoost: 540 },

  // === Yuki 2 条(非认证设计师)===
  { title: "极简白噪 · 几何拼接稿", description: "纯白底 + 单一几何线条,主打通勤极简风。", creatorKey: "Yuki", creatorType: "designer", toolType: "repeat", promptVisibility: "free", unlockPrice: 0, prompt: "minimalist geometric line on warm ivory, no fill, repeat 20cm", styleTags: ["几何拼接", "极简"], likeBoost: 134, favBoost: 56, viewBoost: 920 },
  { title: "雾紫扎染 · A 字试衣", description: "雾紫渐变扎染,A 字裙试衣。", creatorKey: "Yuki", creatorType: "designer", toolType: "tryon", promptVisibility: "paid", unlockPrice: 1500, prompt: "misty purple shibori dye on a-line dress, model on warm ivory backdrop", styleTags: ["扎染"], likeBoost: 89, favBoost: 41, viewBoost: 720 },

  // === Mei 2 条(非认证设计师)===
  { title: "热带花鸟 · 印花生成", description: "工笔花鸟 + 热带配色。", creatorKey: "Mei", creatorType: "designer", toolType: "print", promptVisibility: "free", unlockPrice: 0, prompt: "tropical botanical with hand-drawn birds, warm coral + jade green palette", styleTags: ["热带印花", "复古花鸟"], likeBoost: 256, favBoost: 122, viewBoost: 1450 },
  { title: "扎染晚霞", description: "晚霞主题扎染单稿。", creatorKey: "Mei", creatorType: "designer", toolType: "print", promptVisibility: "paid", unlockPrice: 900, prompt: "sunset shibori, soft red to amber gradient, hand-tied pattern", styleTags: ["扎染"], likeBoost: 78, favBoost: 32, viewBoost: 612 },

  // === 普通消费者 3 条(模拟用户作品)===
  { title: "桃子的第一件创作", description: "用 AI 试衣体验拼了一件玫粉色裹身。", creatorKey: "13900000001", creatorType: "user", toolType: "tryon", promptVisibility: "free", unlockPrice: 0, prompt: "pink wrap dress on me, soft daylight", styleTags: ["法式浪漫", "极简"], likeBoost: 32, favBoost: 14, viewBoost: 280 },
  { title: "栗子的几何小试", description: "想做一件办公室小搭。", creatorKey: "13900000002", creatorType: "user", toolType: "repeat", promptVisibility: "paid", unlockPrice: 900, prompt: "small geometric tile, office friendly, beige + brown palette", styleTags: ["几何拼接", "极简"], likeBoost: 21, favBoost: 8, viewBoost: 175 },
  { title: "桃子的扎染私稿", description: "还在调,先不公开 prompt。", creatorKey: "13900000001", creatorType: "user", toolType: "print", promptVisibility: "private", unlockPrice: 0, prompt: "(私稿不公开)", styleTags: ["扎染"], likeBoost: 8, favBoost: 3, viewBoost: 65 },
];

async function ensureConsumerUser(spec: typeof CONSUMER_USERS[number]) {
  return prisma.user.upsert({
    where: { phone: spec.phone },
    update: { name: spec.name, avatar: spec.avatar },
    create: { phone: spec.phone, name: spec.name, avatar: spec.avatar, isDesigner: false },
  });
}

function pickCover(i: number): string {
  return SAMPLE_COVERS[i % SAMPLE_COVERS.length];
}

async function main() {
  console.log("Seeding 14 InspirationWork…");

  // 1. 确保 2 个普通消费者存在
  for (const u of CONSUMER_USERS) {
    await ensureConsumerUser(u);
  }

  // 2. 索引 designer userId by name
  const designers = await prisma.designer.findMany({ include: { user: true } });
  const designerByName = new Map<string, { userId: string }>();
  for (const d of designers) {
    const key = d.displayName.split(" ")[0]; // "Luna · MaxLuLu Studio" → "Luna"
    designerByName.set(key, { userId: d.userId });
  }

  // 3. 索引 consumer userId by phone
  const consumers = await prisma.user.findMany({ where: { phone: { in: CONSUMER_USERS.map((u) => u.phone) } } });
  const consumerByPhone = new Map<string, string>();
  for (const c of consumers) consumerByPhone.set(c.phone, c.id);

  // 4. upsert by title — 既能首次插入,也能在 cover 路径变化时更新
  let created = 0;
  let updated = 0;
  for (let i = 0; i < WORKS.length; i++) {
    const spec = WORKS[i];

    let userId: string | undefined;
    if (spec.creatorType === "designer") {
      userId = designerByName.get(spec.creatorKey)?.userId;
    } else {
      userId = consumerByPhone.get(spec.creatorKey);
    }
    if (!userId) {
      console.warn(`  skip "${spec.title}" — creator ${spec.creatorKey} not found`);
      continue;
    }

    const cover = pickCover(i);
    const second = pickCover(i + 2);

    const existing = await prisma.inspirationWork.findFirst({
      where: { title: spec.title },
      select: { id: true },
    });

    if (existing) {
      await prisma.inspirationWork.update({
        where: { id: existing.id },
        data: { coverImage: cover, images: [cover, second] },
      });
      updated++;
      continue;
    }

    await prisma.inspirationWork.create({
      data: {
        userId,
        creatorType: spec.creatorType,
        title: spec.title,
        description: spec.description,
        coverImage: cover,
        images: [cover, second],
        prompt: spec.promptVisibility === "private" ? null : spec.prompt,
        params: { fabric: "knit", colors: ["#2F5A5D", "#BA5E70"] },
        promptVisibility: spec.promptVisibility,
        unlockPrice: spec.unlockPrice,
        toolType: spec.toolType,
        styleTags: spec.styleTags,
        likeCount: spec.likeBoost,
        favoriteCount: spec.favBoost,
        viewCount: spec.viewBoost,
        commentCount: 0,
        unlockCount: spec.promptVisibility === "paid" ? Math.floor(spec.likeBoost * 0.08) : 0,
        status: "approved",
        createdAt: new Date(Date.now() - i * 6 * 3600 * 1000),
      },
    });
    created++;
  }

  console.log(`  created ${created} new, updated ${updated} existing InspirationWorks.`);
  console.log("Done.");
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error("Seed failed:", err);
  await prisma.$disconnect();
  process.exit(1);
});
