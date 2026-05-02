# MaxLuLu AI v2 Token 修订报告

> 触发原因:`design/high-fidelity-v2/99_开发注意事项汇总.md` 已补全(1118 行,2026-05-02)。第 1 轮提取因 .md 是空文件而退化使用 v1.1 Design System 主文档,与真 md 存在系统性差异。
> 本报告记录所有差异及覆盖动作。

冲突优先级:**真 md > 第 1 轮提取**(用户指令)。

---

## 一、宏观差异(主配色完全不同)

| 维度 | 第 1 轮(已废弃) | 真 md(覆盖) | 影响范围 |
|---|---|---|---|
| 主品牌色 | 金色 #B38A56(Champagne Gold) | **瓷青蓝 #2F5A5D**(Porcelain Cyan) | 全站导航、链接、Tab、Secondary 按钮 |
| 主 CTA 色 | 金色 #B38A56 | **烟粉玫瑰 #BA5E70**(Smoked Rose) | 立即开团、加入购物袋、解锁、收藏高亮 |
| 金色定位 | 品牌主色 | **仅认证设计师身份系统专用** | 认证描边、角标、徽章、作者认证标识 |
| 整体气质 | 暖金 + 米色 | 冷青 + 烟粉,轻盈知性 | 全站底色 |
| 页面底色 | `#F6F1E8`(暖米) | `#F3F6F6`(冷灰青) | 全站 |

> 真 md §1.1 明确写:**"不使用大面积金色和米色;不使用纯黑白大反差;金色仅用于「认证设计师」身份系统,不作为品牌主色"。**

---

## 二、颜色 Token 逐条修订表

| Token 名 | 旧值(第 1 轮) | 新值(真 md) | 来源依据 |
|---|---|---|---|
| `--color-primary` | `#B38A56` | `#2F5A5D` | 真 md §1.2 |
| `--color-primary-hover` | `#9C7443` | `#234A50` | 真 md §1.2 / §6.1 |
| `--color-primary-soft` | `#EFE3D0` | `#E2EEF1`(改名 `--color-primary-subtle`) | 真 md §1.2 |
| `--color-primary-strong` | `#D8C4A4` | (改用 `--color-primary-hover`) | 真 md 无该层 |
| `--color-primary-pressed` | (无) | `#1C393D` | 真 md §6.1 Text Button 新增 |
| `--color-accent`(新引入) | (= designer-gold) | `#BA5E70` | 真 md §1.2 |
| `--color-accent-hover` | (= designer-gold-strong) | `#A85060` | 真 md §6.1 |
| `--color-accent-pressed`(新增) | — | `#8F4655` | 真 md §6.1 |
| `--color-accent-subtle`(新增) | — | `#F4E5E7` | 真 md §1.2 |
| `--color-certified-gold`(新引入) | (变量名 `--color-designer-gold`) | `#C8A875` | 真 md §2.1 |
| `--color-certified-gold-hover`(新增) | — | `#B89561` | 真 md §6.1 Gold CTA |
| `--color-certified-gold-pressed`(新增) | — | `#9F7E4F` | 真 md §6.1 |
| `--color-certified-gold-soft` | `#E8D9B8`(实色) | `rgba(200,168,117,0.16)` | 真 md §6.3 Badge "已售" |
| `--color-bg` | `#F6F1E8`(暖米) | `#F3F6F6`(冷灰) | 真 md §1.3 |
| `--color-surface` | `#FFFDF9` | `#FCFDFD` | 真 md §1.3 |
| `--color-surface-elevated`(新增) | — | `#FFFFFF` | 真 md §1.3 |
| `--color-surface-soft`/`--color-subtle` | `#FBF7F0` | `#E6ECEC` | 真 md §1.3 |
| `--color-text-primary` | `#1E1B18`(暖) | `#1E272B`(冷) | 真 md §1.4 |
| `--color-text-secondary` | `#6F665E`(暖) | `#566469`(冷) | 真 md §1.4 |
| `--color-text-tertiary` | `#A39A91` | `#879197` | 真 md §1.4 |
| `--color-text-disabled`(新增) | — | `#B7C2C8` | 真 md §1.4 |
| `--color-text-inverse`(新增) | — | `#FFFFFF` | 真 md §1.4 |
| `--color-border` | `#E7DED2` | `#D2DEDF` | 真 md §1.5 |
| `--color-border-strong` | `#D8C4A4` | `#B8C7CA` | 真 md §1.5 |
| `--color-divider` | `#EFE7DD` | `#E1E8E8` | 真 md §1.5 |
| `--color-divider-light`(新增) | — | `#ECEEEE` | 真 md §1.5 |
| `--color-error` | `#C84532` | `#E57373` | 真 md §1.2 |
| `--color-success` | `#4F8A62` | `#2F7D68` | 真 md §1.2 |
| `--color-warning` | `#C9903D` | `#E2A23A` | 真 md §1.2 |
| `--color-info` | `#3E78B2` | `#4B8FE3` | 真 md §1.2 |
| `--color-dark` | `#181512`(暖) | `#11191D`(冷) | 真 md §1.6 neutral-900 |
| `--color-dark-soft` | `#2A211B` | `#1E272B` | 真 md §1.6 neutral-800 |

### 9 阶中性灰(整体冷色化)

| Token | 旧 | 新 | 来源 |
|---|---|---|---|
| `--neutral-50` | `#FAF7F3` | `#F8FAFA` | 真 md §1.6 |
| `--neutral-100` | `#F2EEE9` | `#F1F5F6` | 真 md §1.6 |
| `--neutral-200` | `#E6E1DA` | `#E6ECEC` | 真 md §1.6 |
| `--neutral-300` | `#D1CBC2` | `#D2DEDF` | 真 md §1.6 |
| `--neutral-400` | `#B8B0A4` | `#B8C7CA` | 真 md §1.6 |
| `--neutral-500` | `#8A8278` | `#879197` | 真 md §1.6 |
| `--neutral-600` | `#6F665E` | `#566469` | 真 md §1.6 |
| `--neutral-700` | `#4D453E` | `#34484D` | 真 md §1.6 |
| `--neutral-800` | `#2A211B` | `#1E272B` | 真 md §1.6 |
| `--neutral-900` | `#1E1B18` | `#11191D` | 真 md §1.6 |

---

## 三、字体 Token 修订

整个字号体系下移一阶(真 md 是更克制的杂志感字号,不是上一轮的 Hero 大字号)。

### 3.1 桌面字号

| 层级 | 旧 | 新 | 来源 |
|---|---|---|---|
| Display | `64 / 72 / 700` | `48 / 56 / 400` | 真 md §1.8 |
| H1 | `56 / 64 / 700` | `40 / 48 / 400` | 真 md §1.8 |
| H2 | `36 / 44 / 600` | `28 / 36 / 400` | 真 md §1.8 |
| H3 | `24 / 32 / 600` | `20 / 28 / 500` | 真 md §1.8 |
| H4 | `20 / 28 / 600` | (移除,真 md 无该层) | — |
| Body | `16 / 28 / 400` | `14 / 22 / 400` | 真 md §1.8 |
| Body Small | `14 / 22 / 400` | `13 / 20 / 400` | 真 md §1.8 |
| Caption | `13 / 20 / 400` | `12 / 18 / 400` | 真 md §1.8 |
| Label | `14 / 20 / 500` | `12 / 16 / 500` | 真 md §1.8 |
| Button | `15 / 20 / 500` | `14 / 22 / 500` | 真 md §1.8 |
| Price(新引入) | — | `22 / 28 Playfair` | 真 md §1.8 / §6.6 |
| Price Small(新引入) | — | `16 / 24 Playfair` | 真 md §1.8 / §6.6 |

### 3.2 移动字号

| 层级 | 旧 | 新 | 来源 |
|---|---|---|---|
| Display | (无) | `32 / 40` | 真 md §1.8 |
| H1 | `38 / 46` | `28 / 36` | 真 md §1.8 |
| H2 | `28 / 36` | `24 / 32` | 真 md §1.8 |
| H3(新增) | — | `18 / 26` | 真 md §1.8 |
| Price(新增) | — | `20 / 28` | 真 md §1.8 |
| Price Small(新增) | — | `14 / 20` | 真 md §1.8 |

### 3.3 字重大幅下调

旧版主标题用 700/600(粗),真 md 用 400(Regular)。Playfair Regular 在大字号下已经有衬线撑满,400 是真 md 的"克制、克制再克制"原则的体现。

---

## 四、圆角阶梯修订

| Token | 旧 | 新 | 来源 |
|---|---|---|---|
| `--radius-2` | `2px`(我自命名) | `--radius-xs: 2px` | 真 md §5.3 |
| `--radius-s`(新增) | — | `4px` | 真 md §5.3 |
| `--radius-sm` | `8px` | `8px`(别名 → `--radius-m`) | 真 md §5.3 |
| `--radius-md` | `12px` | `12px`(别名 → `--radius-l`) | 真 md §5.3 |
| `--radius-lg` | `16px` | `16px`(别名 → `--radius-xl`) | 真 md §5.3 |
| `--radius-xl` | `20px` | `16px`(真 md 无 20px,降阶) | 真 md §5.3 |
| `--radius-2xl` | `24px` | `16px`(真 md 无该值,别名兜底) | 真 md §5.3 |

---

## 五、阴影修订

| Token | 旧 | 新 | 来源 |
|---|---|---|---|
| `--shadow-card` | 双层暖色 | `0 1px 2px rgba(17,25,29,0.04)`(单层冷色,= shadow-xs) | 真 md §5.4 |
| `--shadow-hover` | 双层暖色 | `0 8px 24px rgba(17,25,29,0.08)`(= shadow-md) | 真 md §5.4 |
| `--shadow-modal` | `0 24px 80px rgba(24,21,18,0.18)` | `0 16px 40px rgba(17,25,29,0.12)`(= shadow-lg) | 真 md §5.4 |
| `--shadow-designer`/`--shadow-certified` | `0 0 0 1.5px... 0 8px 24px rgba(168,136,75,0.18)` | `0 2px 6px rgba(200,168,117,0.24)` | 真 md §2.1 |

---

## 六、间距阶梯修订

补一阶 `--space-7: 28px`(真 md §5.1 Space 7)。其他保留。

---

## 七、断点修订

| Token | 旧 | 新 | 来源 |
|---|---|---|---|
| `--bp-tablet` | `1024px` | `1200px` | 真 md §4.1(平板上限到 1199) |
| `--bp-desktop` | `1280px` | `1200px` | 真 md §4.1 |
| `--bp-desktop-xl` | `1440px` | `1440px` | 真 md §4.1(一致) |

`--gutter-mobile` 由 `20px` 改为 `16px`(真 md §4.2)。

---

## 八、新增 Token(真 md 有,第 1 轮漏)

- `--color-primary-pressed: #1C393D`
- `--color-accent: #BA5E70` + 全套 hover/pressed/subtle
- `--color-text-disabled: #B7C2C8`
- `--color-text-inverse: #FFFFFF`(原叫 `--color-text-on-dark` 保留为 alias)
- `--color-divider-light: #ECEEEE`
- `--color-surface-elevated: #FFFFFF`
- `--color-subtle: #E6ECEC`
- `--color-certified-gold-hover: #B89561` + pressed
- 完整 Price / Price Small 字号体系(桌面 + 移动)
- 完整 Tabs / Badge / Card 状态规范(在认证工具类与 home-consumer.css 中落地;需要的页面级样式后续视情况引用)

---

## 九、保留(无差异)

- 字族:Playfair Display + Inter + Noto Serif/Sans SC(一致)
- 数字 tabular-nums + lnum(一致)
- /products 网格列数:桌面 5 / 平板 3 / 移动 2(一致)
- /inspiration 网格列数:桌面 4 / 平板 3 / 移动 2(一致)
- 商品图比例:`4:5`(真 md §8.1 推荐;之前 `3:4`,已记录待页面级 CSS 调整)
- 容器最大宽 1200px(一致)

---

## 十、移除项

- `--text-h4-*` 字号体系移除(真 md 无 H4 层级);保留 fallback 别名指向 H3
- `--text-body-lg-*` 移除(真 md 无更大正文);保留别名指向 body

---

## 十一、向 home-consumer.css 传导

`home-consumer.css :root` 内 legacy 别名值同步切换:

| 变量 | 旧值 | 新值 |
|---|---|---|
| `--gold` | `#B38A56`(暖金) | `#2F5A5D`(瓷青蓝)— 名沿用,值替换 |
| `--gold-hover` | `#9C7443` | `#234A50` |
| `--gold-light` | `#D8C4A4` | `#B8C7CA` |
| `--gold-bg` | `rgba(179,138,86,0.08)` | `rgba(47,90,93,0.08)` |
| `--gold-border` | `rgba(179,138,86,0.32)` | `rgba(47,90,93,0.28)` |
| `--bg` | `#F6F1E8` | `#F3F6F6` |
| `--bg-soft` | `#FBF7F0` | `#F1F5F6` |
| `--bg-deep` | `#EFE7DD` | `#E6ECEC` |
| `--card` | `#FFFDF9` | `#FCFDFD` |
| `--card-hover` | `#FBF7F0` | `#F1F5F6` |
| `--text` | `#1E1B18` | `#1E272B` |
| `--text2` | `#6F665E` | `#566469` |
| `--text3` | `#A39A91` | `#879197` |
| `--border` | `#E7DED2` | `#D2DEDF` |
| `--dark` | `#181512` | `#11191D` |
| `--red` | `#C84532` | `#BA5E70`(改语义:Smoked Rose 主 CTA) |

---

## 十二、副作用与限制

1. **变量名 `--gold` 不再代表"金色"**(值是瓷青)。这是为了避免一次大批量 rename 带来的回归风险 — 全站使用 `var(--gold)` 的元素自动切换到瓷青而无需逐文件改。命名重构列入未来一轮 cleanup PR。
2. 真正的金色 `#C8A875` 由 `--color-certified-gold` 引用,**严禁**用于普通促销 / 强调(真 md §8.8)。
3. v1.1 文档保留不动(用户硬约束)。
4. 上一轮(第 1 轮)的 `v2-update-report.md` 描述的"暖金"系是不准确的,但截图与 commit 记录可作为"基于空 .md 的退化版本"留作历史。
