# /inspiration 真实素材接入报告

> 日期:2026-05-03
> 范围:8 张模特卡图 + 1 张 hero banner + 1 张金角标 → 接入 /inspiration 链路

---

## 1. 14 条作品 cover 映射表

8 张模特卡图(`public/seed-images/inspiration/`)按 title 派生的 colors 风格分配。允许复用,共用 8 张图覆盖 14 条作品。

| # | title | colors 风格 | 主图(coverImage)| 详情缩略数(images[].length) |
|---|---|---|---|---|
| 1 | 墨韵山茶 · 灵感线稿 | 墨+烟粉(深) | 06_17_38 PM (3).png 深墨大理石背景 | 3(主+2) |
| 2 | 海风蓝调 · 几何瓷青 | 瓷青+白(浅) | 06_17_40 PM (5).png 短袖明亮 | 3(主+2) |
| 3 | 鎏金落日 · 法式中长 | 暖金+墨 | 06_17_39 PM (4).png 阳光暖调 V 领 | 3(主+2) |
| 4 | 工笔牡丹 · 不公开私稿 | 墨+烟粉(深) | 06_17_43 PM (8).png 半身灰底 | 2(主+1) |
| 5 | 鸢尾蓝 · 法式中袖灵感 | 瓷青+白(浅) | 06_17_42 PM (7).png 米色腰带式 | 3(主+2) |
| 6 | 薄荷晨露 · 四方连续 | 浅瓷青+奶白 | 06_17_40 PM (5).png 复用 | 2(主+1) |
| 7 | Art Deco 黄金分割 | 暖金+墨 | 06_17_39 PM (4).png 复用 | 2(主+1) |
| 8 | 极简白噪 · 几何拼接稿 | 浅瓷青+奶白 | 06_17_42 PM (7).png 复用 | 2(主+1) |
| 9 | 雾紫扎染 · A 字试衣 | 雾紫+烟粉 | 06_17_41 PM (6).png 雾紫粉调最重 | 3(主+2) |
| 10 | 热带花鸟 · 印花生成 | 深绿+鎏金 | 06_17_37 PM (1).png 长袖深底花卉 | 3(主+2) |
| 11 | 扎染晚霞 | 墨+烟粉(深) | 06_17_43 PM (8).png 复用 | 2(主+1) |
| 12 | 桃子的第一件创作 | 烟粉+灰(普通用户)| 06_17_41 PM (6).png 复用 | 2(主+1) |
| 13 | 栗子的几何小试 | 烟粉+灰(普通用户)| 06_17_38 PM (2).png 中性较浅 | 2(主+1) |
| 14 | 桃子的扎染私稿 | 烟粉+灰(普通用户)| 06_17_41 PM (6).png 复用 | 2(主+1) |

### 1.1 8 张图复用频次

| 图 | 主图次数 | 缩略次数 | 总用量 |
|---|---|---|---|
| (1) 06_17_37 长袖深底花卉 | 1(热带花鸟)| 2(鎏金落日 / Art Deco)| 3 |
| (2) 06_17_38 中性较浅 | 1(栗子)| 2(海风 / 雾紫)| 3 |
| (3) 06_17_38 深墨大理石 | 1(墨韵山茶)| 2(工笔 / 扎染晚霞)| 3 |
| (4) 06_17_39 阳光暖调 | 2(鎏金 / Art Deco)| 1(海风)| 3 |
| (5) 06_17_40 短袖明亮 | 2(海风 / 薄荷)| 3(鸢尾 / 雾紫 / 极简)| 5 |
| (6) 06_17_41 雾紫粉 | 3(雾紫 / 桃子第一件 / 桃子扎染)| 1(鎏金)| 4 |
| (7) 06_17_42 米色腰带 | 2(鸢尾 / 极简)| 1(海风)| 3 |
| (8) 06_17_43 半身灰底 | 2(工笔 / 扎染晚霞)| 1(墨韵)| 3 |

8 张全部使用,使用频次 3-5 次,覆盖均衡。

### 1.2 落库验证

```
$ npx tsx scripts/verify-covers.ts
墨韵山茶 · 灵感线稿                  → 06_17_38 PM (3).png  (+ 2 thumbs)
海风蓝调 · 几何瓷青                  → 06_17_40 PM (5).png  (+ 2 thumbs)
鎏金落日 · 法式中长                  → 06_17_39 PM (4).png  (+ 2 thumbs)
工笔牡丹 · 不公开私稿                 → 06_17_43 PM (8).png  (+ 1 thumbs)
鸢尾蓝 · 法式中袖灵感                 → 06_17_42 PM (7).png  (+ 2 thumbs)
薄荷晨露 · 四方连续                  → 06_17_40 PM (5).png  (+ 1 thumbs)
Art Deco 黄金分割                → 06_17_39 PM (4).png  (+ 1 thumbs)
极简白噪 · 几何拼接稿                 → 06_17_42 PM (7).png  (+ 1 thumbs)
雾紫扎染 · A 字试衣                 → 06_17_41 PM (6).png  (+ 2 thumbs)
热带花鸟 · 印花生成                  → 06_17_37 PM (1).png  (+ 2 thumbs)
扎染晚霞                         → 06_17_43 PM (8).png  (+ 1 thumbs)
桃子的第一件创作                     → 06_17_41 PM (6).png  (+ 1 thumbs)
栗子的几何小试                      → 06_17_38 PM (2).png  (+ 1 thumbs)
桃子的扎染私稿                      → 06_17_41 PM (6).png  (+ 1 thumbs)
```

---

## 2. Hero banner 路径

文件:`public/seed-images/inspiration/ChatGPT Image May 2, 2026, 06_17_43 PM (9).png`

应用:`app/inspiration/inspiration.css` 内 `.inspHero__bg--placeholder`

```css
.inspHero__bg--placeholder {
  background-image: url('/seed-images/inspiration/ChatGPT Image May 2, 2026, 06_17_43 PM (9).png');
  background-size: cover;
  background-position: center right;
  background-repeat: no-repeat;
}
```

`.inspHero__overlay` 米色渐变蒙版保留(桌面 90deg 左→右淡出,移动 180deg 上→下淡出),让左侧文字可读、右侧模特清晰。

---

## 3. Certified badge 路径

文件:`public/seed-images/inspiration/ChatGPT Image May 2, 2026, 05_57_48 PM (10).png`(三角金丝带,内嵌"认证"二字)

应用:`components/ui/ui.css` 内 `.ui-certified-frame.is-certified[data-ribbon]::before`

替换前:CSS 伪角标(content="认证" + 金底白字)
替换后:`background-image` 真图,尺寸 56×56(桌面)/ 44×44(移动);`border-bottom-left-radius` / `border-top-right-radius` 全部删除(三角形不需要圆角)。

```css
.ui-certified-frame.is-certified[data-ribbon]::before {
  content: "";
  position: absolute; top: 0; right: 0;
  width: 56px; height: 56px;
  background-image: url('/seed-images/inspiration/ChatGPT Image May 2, 2026, 05_57_48 PM (10).png');
  background-size: contain;
  background-position: top right;
  background-repeat: no-repeat;
  z-index: 2;
  pointer-events: none;
}
@media (max-width: 767px) {
  .ui-certified-frame.is-certified[data-ribbon]::before {
    width: 44px; height: 44px;
  }
}
```

> 注:此改动只影响新组件 `<CertifiedCardFrame>`(`/inspiration` 卡片用)。`/products` 卡片用的 legacy `.galleryCard.is-certified.is-certified-card`(全局工具类 `globals.css`)未动 — 仍是 CSS 文字角标。下一轮可统一,或保持不动让 /products 用 legacy 视觉。

---

## 4. 4 张截图说明

存放:`design/screenshots/v2-real-images/`

| 文件 | 视口 | 验证点 |
|---|---|---|
| `desktop_inspiration.png` | 1440×900 | hero 模特半身横幅 + 14×4 列卡片真图 + Luna/Reine 7 张金三角角标 + Smoked Rose CTA + Stats 14/6/14 瓷青 Playfair |
| `mobile_inspiration.png` | 375×800 | hero 自适应 + 14×2 列网格 + 卡片金角标(44×44)+ 移动竖排堆叠 |
| `desktop_inspiration_detail.png` | 1440×900 | 鎏金落日 06_17_39 (4) 主图 + 3 缩略缩图 + 右 info 卡瓷青描边(实为认证 = 金 1px)+ Luna 认证 chip + PROMPT 直接显示 + 基于这个改造 rose CTA + 相似作品 2 张真图 |
| `mobile_inspiration_detail.png` | 375×800 | 移动堆叠 + sticky CTA |

---

## 5. 与稿件对比

### 5.1 已对齐(本轮成果)

| 模块 | 稿 01 | 实际 | 状态 |
|---|---|---|---|
| Hero 模特大图 | 480px 含模特图 | 480 + 06_17_43 (9) 模特半身横幅 | ✅ |
| Hero 文字层 | 标题+副+CTA+Stats | 同 | ✅ |
| 卡片图 | 真模特穿印花裙 | 8 张 GPT 提供的真模特图 | ✅ |
| 认证设计师角标 | 右上角金角标 | 56×56(桌面)三角金图 | ✅ 真图 |
| 卡片底"by + 名字" | + 认证 chip | 同 | ✅ |
| 4/3/2 列响应式网格 | 4 列(桌面)| MasonryGrid 4/3/2 | ✅ |
| /inspiration/[id] 60/40 | 左大图右信息 | 同 | ✅ |
| 详情页相似作品 | 横滚 + 真图 | 同 | ✅ |

### 5.2 还有差距

| 模块 | 稿 01 | 实际 | 差异类型 |
|---|---|---|---|
| 顶栏导航项数 | 稿 01 显示 4 项("工作室/设计师/趋势/定价") | IA v1.2 4 项("印花衣橱/灵感广场/我的设计工作室/热拼专区") | 产品架构(以 IA v1.2 为准,见 CLAUDE.md §3) |
| 卡片署名认证标 | 稿用 14px 圆形小金章 | 当前用文字 chip"认证" | T1 待用户决策 |
| 卡片 hover 浮动操作(快捷) | 稿无;真 md §7.4 my-studio 才有 | 当前无 | 不在 /inspiration 范围 |
| 评论区认证小金章 | 头像右下 12×12 | 工具类已就位,无认证评论数据 | 等数据 |
| 顶栏右上"搜索 / + 关注" | 稿 01 含搜索图标 | 当前 nav-right 只 会员/我的衣橱 | T2 不在本轮 |
| 印花库素材 9 张 | — | 本轮不接(留印花库)| 留下一轮 |

---

## 6. 改动文件清单

| 文件 | 改动 |
|---|---|
| `scripts/seed-inspiration.ts` | SAMPLE_COVERS → CARD_IMAGES 数组(8 张本地路径)+ COVER_MAP 字典(14 条 title → primary/thumbs 索引)+ coverFor() helper;upsert 时同步写入 |
| `app/inspiration/inspiration.css` | `.inspHero__bg--placeholder` 改 background-image 真图 hero banner |
| `components/ui/ui.css` | `.ui-certified-frame.is-certified[data-ribbon]::before` 改 background-image 三角金角标 PNG;尺寸 56×56(桌面)/ 44×44(移动) |
| `scripts/verify-covers.ts` | 新增,只读核对 covers 工具 |
| `scripts/v2-real-images-capture.mjs` | 新增,4 截图脚本 |

未动:
- Schema、API 端点、5 个 React 组件、ConsumerNav、其他 .css、业务逻辑、支付、订单、认证

---

## 7. 验证

- ✅ `npx tsc --noEmit` exit 0
- ✅ `npx tsx scripts/seed-inspiration.ts` → 14 条 updated
- ✅ Prisma 查询:14 条 InspirationWork.coverImage 全部更新到本地路径
- ✅ /inspiration 桌面 + 移动:hero 真图 + 14 卡片真图 + 7 金角标 + Stats / CTA / 边栏正常
- ✅ /inspiration/[id] 桌面 + 移动:鎏金落日主图 + 缩略 + 信息卡 + 相似作品 + 评论
- ✅ Schema / API / 组件未动
- ✅ 9 张印花花型图未动(留下一轮印花库)
