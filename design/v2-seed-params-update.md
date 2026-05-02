# /inspiration 14 条种子 params 差异化报告

> 日期:2026-05-03
> 触发:用户要求按 title 派生 params(colors / fabric),消除 14 条同 params 的占位
> 修改文件:仅 `scripts/seed-inspiration.ts`(加 `derivedParams()` 函数 + 在 upsert 调用点应用)

---

## 1. 规则映射

| 规则 | 触发条件(title 含)| colors | fabric(prompt 推断) |
|---|---|---|---|
| R0 普通用户优先 | creatorType="user" | `["#BA5E70", "#6B767D"]` | 默认 knit;含 silk/真丝→silk;含 linen/亚麻→linen |
| R1 | "墨" / "工笔" / "扎染晚霞" | `["#2B2F33", "#BA5E70"]` | 同上 |
| R2 | "瓷" / "海风" / "蓝调" / "鸢尾" | `["#2F5A5D", "#FFFFFF"]` | 同上 |
| R3 | "鎏金" / "Art Deco" / "金" | `["#C8A875", "#2B2F33"]` | 同上 |
| R4 | "薄荷" / "白噪" / "极简" | `["#A3CACE", "#F8F3EC"]` | 同上 |
| R5 | "热带花鸟" | `["#2F5A5D", "#C8A875"]` | 同上(放在 R6 前以避免被"扎染"误捕)|
| R6 | "雾紫" / "扎染"(已过滤"扎染晚霞")| `["#7D5B6E", "#BA5E70"]` | 同上 |

**优先级:** R0(普通用户)→ R1 → R2 → R3 → R4 → R5 → R6
"扎染晚霞"作为字面量整体匹配进 R1,优先于 R6 的纯"扎染"。
14 条 prompt 没有出现 silk/真丝 或 linen/亚麻 关键词,fabric 全部命中默认 knit。

---

## 2. 14 条旧 / 新 params 对照

旧 params 全部相同:`{"colors":["#2F5A5D","#BA5E70"],"fabric":"knit"}`

| # | title | 旧 params | 新 params | 命中规则 |
|---|---|---|---|---|
| 1 | 墨韵山茶 · 灵感线稿 | `{"colors":["#2F5A5D","#BA5E70"],"fabric":"knit"}` | `{"colors":["#2B2F33","#BA5E70"],"fabric":"knit"}` | R1(墨)|
| 2 | 海风蓝调 · 几何瓷青 | 同上 | `{"colors":["#2F5A5D","#FFFFFF"],"fabric":"knit"}` | R2(海风/蓝调/瓷青)|
| 3 | 鎏金落日 · 法式中长 | 同上 | `{"colors":["#C8A875","#2B2F33"],"fabric":"knit"}` | R3(鎏金 / 金)|
| 4 | 工笔牡丹 · 不公开私稿 | 同上 | `{"colors":["#2B2F33","#BA5E70"],"fabric":"knit"}` | R1(工笔)|
| 5 | 鸢尾蓝 · 法式中袖灵感 | 同上 | `{"colors":["#2F5A5D","#FFFFFF"],"fabric":"knit"}` | R2(鸢尾)|
| 6 | 薄荷晨露 · 四方连续 | 同上 | `{"colors":["#A3CACE","#F8F3EC"],"fabric":"knit"}` | R4(薄荷)|
| 7 | Art Deco 黄金分割 | 同上 | `{"colors":["#C8A875","#2B2F33"],"fabric":"knit"}` | R3(Art Deco / 金)|
| 8 | 极简白噪 · 几何拼接稿 | 同上 | `{"colors":["#A3CACE","#F8F3EC"],"fabric":"knit"}` | R4(白噪 / 极简)|
| 9 | 雾紫扎染 · A 字试衣 | 同上 | `{"colors":["#7D5B6E","#BA5E70"],"fabric":"knit"}` | R6(雾紫 / 扎染)|
| 10 | 热带花鸟 · 印花生成 | 同上 | `{"colors":["#2F5A5D","#C8A875"],"fabric":"knit"}` | R5(热带花鸟)|
| 11 | 扎染晚霞 | 同上 | `{"colors":["#2B2F33","#BA5E70"],"fabric":"knit"}` | R1(扎染晚霞 — 字面量)|
| 12 | 桃子的第一件创作 | 同上 | `{"colors":["#BA5E70","#6B767D"],"fabric":"knit"}` | R0(普通用户)|
| 13 | 栗子的几何小试 | 同上 | `{"colors":["#BA5E70","#6B767D"],"fabric":"knit"}` | R0 |
| 14 | 桃子的扎染私稿 | 同上 | `{"colors":["#BA5E70","#6B767D"],"fabric":"knit"}` | R0(普通用户优先于"扎染")|

---

## 3. 验证

```
$ npx tsx scripts/verify-params.ts
墨韵山茶 · 灵感线稿            {"colors":["#2B2F33","#BA5E70"],"fabric":"knit"}
海风蓝调 · 几何瓷青            {"colors":["#2F5A5D","#FFFFFF"],"fabric":"knit"}
鎏金落日 · 法式中长            {"colors":["#C8A875","#2B2F33"],"fabric":"knit"}
工笔牡丹 · 不公开私稿           {"colors":["#2B2F33","#BA5E70"],"fabric":"knit"}
鸢尾蓝 · 法式中袖灵感           {"colors":["#2F5A5D","#FFFFFF"],"fabric":"knit"}
薄荷晨露 · 四方连续            {"colors":["#A3CACE","#F8F3EC"],"fabric":"knit"}
Art Deco 黄金分割          {"colors":["#C8A875","#2B2F33"],"fabric":"knit"}
极简白噪 · 几何拼接稿           {"colors":["#A3CACE","#F8F3EC"],"fabric":"knit"}
雾紫扎染 · A 字试衣           {"colors":["#7D5B6E","#BA5E70"],"fabric":"knit"}
热带花鸟 · 印花生成            {"colors":["#2F5A5D","#C8A875"],"fabric":"knit"}
扎染晚霞                   {"colors":["#2B2F33","#BA5E70"],"fabric":"knit"}
桃子的第一件创作               {"colors":["#BA5E70","#6B767D"],"fabric":"knit"}
栗子的几何小试                {"colors":["#BA5E70","#6B767D"],"fabric":"knit"}
桃子的扎染私稿                {"colors":["#BA5E70","#6B767D"],"fabric":"knit"}
```

- ✅ 14 条 params 已差异化(7 个不同 colors 组合 + fabric 全 knit)
- ✅ 普通用户 3 条统一为 R0(玫粉 + 中性灰)
- ✅ 没有任何旧值 `["#2F5A5D","#BA5E70"]` 残留
- ✅ npx tsc --noEmit exit 0
- ✅ 数据库:14 条 InspirationWork 的 `params` 字段已更新;coverImage / images / 其他字段未动
- ✅ Schema 未动;只 seed 脚本一个文件改动(+ 新增一个只读 verify 脚本)
