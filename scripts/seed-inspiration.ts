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

// 真实素材 — public/seed-images/inspiration/ 8 张模特卡图。
// 文件名保留原样(含空格 / 括号),Next.js 静态资源会自动 URL-encode。
const CARD_IMAGES = [
  "/seed-images/inspiration/ChatGPT Image May 2, 2026, 06_17_37 PM (1).png", // 0
  "/seed-images/inspiration/ChatGPT Image May 2, 2026, 06_17_38 PM (2).png", // 1
  "/seed-images/inspiration/ChatGPT Image May 2, 2026, 06_17_38 PM (3).png", // 2
  "/seed-images/inspiration/ChatGPT Image May 2, 2026, 06_17_39 PM (4).png", // 3
  "/seed-images/inspiration/ChatGPT Image May 2, 2026, 06_17_40 PM (5).png", // 4
  "/seed-images/inspiration/ChatGPT Image May 2, 2026, 06_17_41 PM (6).png", // 5
  "/seed-images/inspiration/ChatGPT Image May 2, 2026, 06_17_42 PM (7).png", // 6
  "/seed-images/inspiration/ChatGPT Image May 2, 2026, 06_17_43 PM (8).png", // 7
];

// 14 条作品 → 8 张图配对(主图 + 详情页缩略 1-2 张,允许复用)。
// 配图基于 title.colors 的视觉协调判断:
//   深色调(墨/工笔/扎染晚霞):2 / 7  — 06_17_38 (3) 和 06_17_43 (8) 偏暗
//   浅瓷青(瓷/海风/鸢尾/薄荷/极简):4 / 6 — 06_17_40 (5) 和 06_17_42 (7) 偏浅
//   暖金(鎏金/Art Deco):3   — 06_17_39 (4) 阳光暖调
//   雾紫/烟粉(雾紫扎染/普通用户):5  — 06_17_41 (6) 雾紫粉调最重
//   深绿+鎏金(热带花鸟):0    — 06_17_37 (1) 深底花卉最饱满
//   栗子单独取 1            — 06_17_38 (2) 中性较浅
const COVER_MAP: Record<string, { primary: number; thumbs: number[] }> = {
  "墨韵山茶 · 灵感线稿":     { primary: 2, thumbs: [7, 0] },
  "海风蓝调 · 几何瓷青":     { primary: 4, thumbs: [6, 1] },
  "鎏金落日 · 法式中长":     { primary: 3, thumbs: [0, 5] },
  "工笔牡丹 · 不公开私稿":   { primary: 7, thumbs: [2] },
  "鸢尾蓝 · 法式中袖灵感":   { primary: 6, thumbs: [4, 5] },
  "薄荷晨露 · 四方连续":     { primary: 4, thumbs: [6] },
  "Art Deco 黄金分割":     { primary: 3, thumbs: [0] },
  "极简白噪 · 几何拼接稿":   { primary: 6, thumbs: [4] },
  "雾紫扎染 · A 字试衣":     { primary: 5, thumbs: [1, 4] },
  "热带花鸟 · 印花生成":     { primary: 0, thumbs: [3, 7] },
  "扎染晚霞":               { primary: 7, thumbs: [2] },
  "桃子的第一件创作":         { primary: 5, thumbs: [1] },
  "栗子的几何小试":           { primary: 1, thumbs: [4] },
  "桃子的扎染私稿":           { primary: 5, thumbs: [2] },
};

function coverFor(title: string): { primary: string; images: string[] } {
  const m = COVER_MAP[title];
  if (!m) {
    // 未定义 → fallback 到 CARD_IMAGES[0]
    return { primary: CARD_IMAGES[0], images: [CARD_IMAGES[0]] };
  }
  const primary = CARD_IMAGES[m.primary];
  const thumbs = m.thumbs.map((i) => CARD_IMAGES[i]);
  return { primary, images: [primary, ...thumbs] };
}

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

/**
 * 根据 title + prompt + creatorType 推导 params。规则:
 *   - 普通用户(桃子/栗子):colors = ["#C06A73", "#6B767D"]
 *   - 标题含"墨" / "工笔" / "扎染晚霞":colors = ["#2B2F33", "#C06A73"]
 *   - 标题含"瓷" / "海风" / "蓝调" / "鸢尾" / "瓷青":colors = ["#234A58", "#FFFFFF"]
 *   - 标题含"鎏金" / "Art Deco" / "金":colors = ["#C8A875", "#2B2F33"]
 *   - 标题含"薄荷" / "白噪" / "极简":colors = ["#A3CACE", "#F8F3EC"]
 *   - 标题含"雾紫" / "扎染"(且非"扎染晚霞"):colors = ["#7D5B6E", "#C06A73"]
 *   - 标题含"热带花鸟":colors = ["#234A58", "#C8A875"]
 *
 *   fabric:prompt 含 silk / 真丝 → silk;含 linen / 亚麻 → linen;否则 knit
 */
function derivedParams(spec: Spec): { colors: string[]; fabric: "silk" | "knit" | "linen" } {
  const t = spec.title;
  const p = spec.prompt.toLowerCase();
  const lower = t.toLowerCase();

  // fabric 推断
  let fabric: "silk" | "knit" | "linen" = "knit";
  if (/silk|真丝/.test(p) || /silk|真丝/.test(t)) fabric = "silk";
  else if (/linen|亚麻/.test(p) || /linen|亚麻/.test(t)) fabric = "linen";

  // 普通用户优先级最高
  if (spec.creatorType === "user") {
    return { colors: ["#C06A73", "#6B767D"], fabric };
  }

  // 1. 墨 / 工笔 / 扎染晚霞 — 注意"扎染晚霞"是字面量整体匹配,优先于纯"扎染"
  if (t.includes("墨") || t.includes("工笔") || t.includes("扎染晚霞")) {
    return { colors: ["#2B2F33", "#C06A73"], fabric };
  }

  // 2. 瓷 / 海风 / 蓝调 / 鸢尾 / 瓷青
  if (t.includes("瓷") || t.includes("海风") || t.includes("蓝调") || t.includes("鸢尾")) {
    return { colors: ["#234A58", "#FFFFFF"], fabric };
  }

  // 3. 鎏金 / Art Deco / 金 (注意:Art Deco 不区分大小写)
  if (t.includes("鎏金") || lower.includes("art deco") || t.includes("金")) {
    return { colors: ["#C8A875", "#2B2F33"], fabric };
  }

  // 4. 薄荷 / 白噪 / 极简
  if (t.includes("薄荷") || t.includes("白噪") || t.includes("极简")) {
    return { colors: ["#A3CACE", "#F8F3EC"], fabric };
  }

  // 5. 热带花鸟(放在"扎染"前,虽然不冲突,但语义优先)
  if (t.includes("热带花鸟")) {
    return { colors: ["#234A58", "#C8A875"], fabric };
  }

  // 6. 雾紫 / 扎染(此时已经过滤掉"扎染晚霞")
  if (t.includes("雾紫") || t.includes("扎染")) {
    return { colors: ["#7D5B6E", "#C06A73"], fabric };
  }

  // fallback:维持旧默认(理论上 14 条全覆盖,这条不会命中)
  return { colors: ["#234A58", "#C06A73"], fabric };
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

    const cover = coverFor(spec.title);

    const existing = await prisma.inspirationWork.findFirst({
      where: { title: spec.title },
      select: { id: true },
    });

    const params = derivedParams(spec);

    if (existing) {
      await prisma.inspirationWork.update({
        where: { id: existing.id },
        data: { coverImage: cover.primary, images: cover.images, params },
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
        coverImage: cover.primary,
        images: cover.images,
        prompt: spec.promptVisibility === "private" ? null : spec.prompt,
        params,
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
