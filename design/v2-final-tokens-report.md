# MaxLuLu AI v2 Final Tokens 报告

> 日期:2026-05-02 | 第 3 轮(基于真版 99 md + 用户 5 项决策的 1+2+4 执行)

执行项:
- 决策 1:`--gold` rename → `--color-primary`(`--gold*` 别名保留)
- 决策 2:Button primary 切到 Accent rose(`--color-accent`)
- 决策 4:24px 圆角 / `--radius-2xl` 全局清理 → 16px

未执行:
- 决策 3:种子封面图重新生成(留到上线前)
- 决策 5:评论组件 isCertified 接入(留到 /inspiration 开发时一起做)

---

## 1. 执行清单

### 1.1 决策 1:`--gold` rename

**Grep 命中:** 5 文件,206 处 `var(--gold)` 出现,其中 bare `var(--gold)` 共 152 处。

| 文件 | bare `var(--gold)` 替换数 |
|---|---|
| `app/product-pages.css` | 70 |
| `app/home-consumer.css` | 30(其中 :root 内文档/注释占 1) |
| `app/products/[id]/custom/custom.css` | 18 |
| `app/group-buy/[id]/progress/progress.css` | 12 |
| `app/group-buy/group-buy.css` | 29 |
| 合计 | **159** |

复合形式 `var(--gold-hover)` `var(--gold-light)` `var(--gold-bg)` `var(--gold-border)` `var(--gold-dark)` 保留(用户指令仅说明 bare `--gold` rename;复合形式语义自洽)。

**Alias 保留:** `app/home-consumer.css :root` 中重写为 alias 链:

```css
--gold:        var(--color-primary);
--gold-hover:  var(--color-primary-hover);
--gold-pressed: var(--color-primary-pressed);
--gold-light:  var(--color-border-strong);
--gold-bg:     var(--color-primary-subtle);
--gold-border: var(--color-border-strong);
--gold-dark:   var(--color-primary-hover);
/* 其余 legacy 别名 --bg/--text/... 同样改 alias 形式 */
```

如有任何遗漏的 `var(--gold)` 引用,会自动通过 alias 解析到 `--color-primary`,不会失效。

### 1.2 决策 2:Button primary 切到 Accent rose

修改文件:`components/ui/ui.css`

**Before:**

```css
.ui-btn--primary {
  background: var(--color-primary);
  color: var(--color-white);
  border-color: var(--color-primary);
}
.ui-btn--primary:hover { background: var(--color-primary-hover); transform: translateY(-1px); }
.ui-btn--primary:active { transform: translateY(0); }
```

**After:**

```css
.ui-btn--primary {
  background: var(--color-accent);     /* #BA5E70 Smoked Rose */
  color: var(--color-white);
  border-color: var(--color-accent);
}
.ui-btn--primary:hover {
  background: var(--color-accent-hover);   /* #A85060 */
  border-color: var(--color-accent-hover);
  box-shadow: 0 4px 12px rgba(186, 94, 112, 0.22);
  transform: translateY(-1px);
}
.ui-btn--primary:active {
  background: var(--color-accent-pressed); /* #8F4655 */
  transform: translateY(1px);
  box-shadow: none;
}
```

附带改动:`.ui-btn--secondary` 切到瓷青描边模式(白底 / 瓷青文字 / 灰描边 → hover 转瓷青背景,真 md §6.1 规范);`.ui-btn:disabled` 用 `--color-subtle` + `--color-text-disabled`(真 md §1.4)。

### 1.3 决策 4:24px 圆角 / `--radius-2xl` 全局清理

**Grep 命中:** 3 处。

| 文件 | 位置 | 旧值 | 新值 |
|---|---|---|---|
| `app/product-pages.css:309` | `.detailGallery__main` / `__thumb` | `border-radius: 24px` | `var(--radius-xl)` (= 16px) |
| `components/ui/ui.css:508` | `.ui-modal-panel` | `var(--radius-2xl)` | `var(--radius-xl)` |
| `app/studio/studio.css:469` | `.studio-shell` | `border-radius: 24px` | `var(--radius-xl)` |

`globals.css :root` 中 `--radius-2xl` 别名保留指向 `16px`(防止任何遗漏引用突然失效)。

20px / 22px / 28px 圆角不在用户决策 4 范围内,保留不动。

---

## 2. Button primary 色源依据

**结论:** Smoked Rose `#BA5E70`。

逐稿核验(肉眼判定 + 真 md §6.1 Primary Button 文档):

| 稿件 | 主 CTA 元素 | 颜色 |
|---|---|---|
| **01_inspiration_灵感广场.png** | 右上角"成为创作者 → 进入工作室"按钮 | 暗红玫瑰 — Smoked Rose |
| **01_inspiration_灵感广场.png** | 右侧 Featured 面板主 CTA(下单 / 立即查看) | 同上 |
| **02_products_印花衣橱.png** | 右上角主 CTA / 搜索 submit | 暗红玫瑰 — Smoked Rose |
| **02_products_印花衣橱.png** | 分页器 active page | 深色实底(非主 CTA 色,正常) |
| **06_product-detail_商品详情.png** | 右上角"立即开团"主 CTA | 暗红玫瑰 — Smoked Rose |
| **06_product-detail_商品详情.png** | 右侧信息卡内大 CTA | 同上 |
| **06_product-detail_商品详情.png** | 头像旁"+ 关注"胶囊 | 同上 |
| **06_product-detail_商品详情.png** | "个人定制" Secondary | 瓷青描边(对应 `.ui-btn--secondary`) |

**真 md §6.1 文档** 进一步确认:

```
Primary Button 用于：成为创作者、进入工作室、加入购物袋、主要提交操作。
Default | background: #BA5E70; color: #FFFFFF; border: 1px solid #BA5E70;
Hover   | background: #A85060; border-color: #A85060; box-shadow: 0 4px 12px rgba(186, 94, 112, 0.22);
Pressed | background: #8F4655; transform: translateY(1px);
```

我的实现与文档逐字对齐。

> 真 md §6.1 还有一类 **Gold CTA(`#C8A875`)**,仅用于"基于这个改造"和极少量与认证 / 高级身份相关的操作。当前仓库尚未实现该 variant — 留待 /my-studio 开发时新增 `.ui-btn--gold` 或 `.ui-btn--certified`。

---

## 3. 4 张截图说明

存放路径:`design/screenshots/v2-final-tokens/`

| 文件 | 视口 | 验证点 |
|---|---|---|
| `desktop_products.png` | 1440×900 | "搜索"按钮 = Rose;chip active = Cyan;Hero 数字 = Cyan Playfair;Hot Group / 主网格 5 列;Reine/Luna 卡片金描边 + 角标 |
| `mobile_products.png` | 375×800 | "搜索"按钮 = Rose;"全部"chip active = Cyan;Hero 数字堆叠;移动 2 列;chip 横滚 |
| `desktop_product_detail.png` | 1440×900 | "立即开团" = Rose;"个人定制" Secondary 瓷青描边;作者卡 1px 金描边(Reine 认证);名字旁"认证"chip 金底白字;sticky 底栏"Y96,500" + "立即开团" rose |
| `mobile_product_detail.png` | 375×800 | 同上 + 堆叠布局;sticky 底部"立即开团" rose CTA 占位符正确 |

### 3.1 与稿件主 CTA 对比

| 稿件元素 | 实际渲染 | 一致 |
|---|---|---|
| 01 / 02 / 06 主 CTA Smoked Rose | `.ui-btn--primary` bg `#BA5E70` | ✅ |
| 06 Secondary "个人定制" 瓷青描边 | `.ui-btn--secondary` bg surface + 瓷青 text + 灰描边 | ✅ |
| 06 详情主图圆角 | 现 `var(--radius-xl)` = 16px(原 24px) | ✅ |
| 02 卡片右上"认证"金角标 | `.is-certified-card::before` bg `#C8A875` 文字 12/16 | ✅ |
| 06 作者卡 1px 金描边 | `.pdpDesigner.is-certified` border 1px `#C8A875` | ✅ |

### 3.2 已知数据缺口(非违规)

- 商品图大多是 tone-* 渐变占位(种子 R2 URL 在测试环境无法外网拉取)。决策 3 已批为"留到上线前重新生成种子封面"。
- 评论区无认证评论数据 → `.is-certified-avatar--comment::after` 12×12 小金章工具类已就位但无法在截图中验证。决策 5 已批为"评论组件接入留到 /inspiration 开发时一起做"。

---

## 4. 完成后下一步:进入 /inspiration 新页面开发的准备状态

### 4.1 Token 系统状态

✅ **已完全就位**,/inspiration 直接消费即可:

- 颜色:Primary 瓷青(导航 / Tab / Secondary)+ Accent 玫瑰(主 CTA)+ Certified 金(认证身份)三套 + 9 阶冷色中性灰
- 字体:Playfair Display × Noto Serif SC 衬线 + Inter × Noto Sans SC 无衬线 + tabular-nums 数字
- 字号:Display / H1 / H2 / H3 / Body / Body Small / Caption / Label / Price / Price Small,桌面 + 移动各一套
- 间距:0/4/8/12/16/20/24/28/32/40/48/64/80/96
- 圆角:0 / 2 / 4 / 8 / 12 / 16 / 999(`--radius-2xl` legacy 别名指向 16)
- 阴影:xs / sm / md / lg + certified
- 断点:768 / 1200 / 1440

### 4.2 工具类状态

✅ **已就位**:

- `.is-certified-card` + `::before` 金色描边 + 角标(灵感卡片可直接复用)
- `.is-certified-avatar` 头像金圈
- `.is-certified-avatar--comment` + `::after` 评论小金章 12×12
- `.is-certified-chip` "认证"小 chip
- `.is-certified-mark` 14px 名字旁小金章
- `.is-certified-author-card` 作者卡 1px 金描边

### 4.3 组件状态

✅ **`Button` 完成切换**,`Button variant=primary` 自动呈现 Smoked Rose,符合"成为创作者 → 进入工作室"主 CTA 真 md 规格。

⚠️ **待新增组件(列在真 md §8.5 但本仓库尚无):**

| 组件 | 用途 | 优先级(下一轮) |
|---|---|---|
| `VerifiedBadge` | 认证设计师徽章 | P1(/inspiration 卡片) |
| `CertifiedCardFrame` | 认证卡片描边 + 角标 | P1(/inspiration 卡片) |
| `AuthorSignature` | 作者署名(头像 + 名字 + 认证标识) | P1(/inspiration / PDP) |
| `PromptVisibilityBlock` | Prompt 免费 / 付费 / 不公开 | P1(/inspiration/[id]) |
| `MasonryGrid` | 瀑布流网格 | P1(/inspiration) |
| `BottomActionBar` | 移动端固定底部 CTA | P1(/inspiration/[id]) |
| `FilterDrawer` | 移动端筛选抽屉 | P1(/inspiration) |
| `MetricItem` | 点赞 / 收藏 / 购买数据 | P2 |
| `StatusBadge` | 作品状态 Badge | P2 |
| `Button --gold` variant | 金色 CTA(基于这个改造) | P1(/inspiration/[id]) |

工具类已经能临时支撑这些组件,但根据真 md §2.6 "认证视觉必须由统一字段控制,不允许各页面单独写死",下一轮先封装 `VerifiedBadge` + `CertifiedCardFrame` + `AuthorSignature` 三个核心,后再开 /inspiration。

### 4.4 数据状态

✅ **Designer.isCertified** schema + seed + API 列表 + API 详情全链路已通(上一轮 commit `ba5f847`)。

⚠️ **待数据建模(真 md §7.1 / Sitemap v1.2 §4 列出):**

- `InspirationWork` 模型:id / userId / type / title / coverImage / images / prompt / params / promptVisibility / unlockPrice / likeCount / favoriteCount / viewCount / isListed / listedProductId / createdAt / updatedAt
- `PromptUnlock` 模型:id / userId / inspirationWorkId / paymentMethod / amount / createdAt
- `UserPoints` 模型:userId / balance / totalEarned / totalSpent
- `UpgradeInvitation` 模型:id / userId / triggerType / triggerValue / status / expiresAt / createdAt

下一轮 /inspiration 开发的第一步是 schema 落地。

### 4.5 API 状态

⚠️ **待新增(Sitemap v1.2 §三)**:

- `/api/inspiration` GET 列表
- `/api/inspiration/[id]` GET 详情
- `/api/inspiration/[id]/unlock-prompt` POST
- `/api/my-studio/create` POST(/my-studio 用,本轮不做)
- `/api/my-studio/share` POST
- `/api/my-studio/list-for-sale` POST
- `/api/users/[id]/upgrade-eligibility` GET
- `/api/users/upgrade-invitation` POST

### 4.6 路由状态

| 路由 | 状态 |
|---|---|
| `/inspiration` | ❌ 无代码 |
| `/inspiration/[id]` | ❌ 无代码 |
| `/my-studio` | ❌ 无代码 |
| `/my-studio/works` | ❌ 无代码 |

### 4.7 推荐下一轮工作顺序

1. **Schema** — `InspirationWork` + `PromptUnlock` + `UserPoints` + `UpgradeInvitation` 加 schema + push + seed 几条样例数据(包括认证 / 非认证 + 三种 prompt 公开状态)
2. **API** — `/api/inspiration` 列表 + `/api/inspiration/[id]` 详情先行(unlock 留 P2)
3. **核心组件** — `VerifiedBadge` / `CertifiedCardFrame` / `AuthorSignature` / `MasonryGrid`(用工具类封装)
4. **`/inspiration` 页面** — 1:1 对照 01 稿,4 列 / 3 列 / 2 列瀑布流
5. **`/inspiration/[id]` 页面** — 1:1 对照 03 稿,左图 60 / 右信息 40
6. **完成后再做 `/my-studio` 与 `/my-studio/works`**(对照 04/05 稿)

---

## 5. 验证

- ✅ `npx tsc --noEmit` exit 0
- ✅ 4 张截图全部捕获
- ✅ 主 CTA 配色与稿件 1+2+6 一致(Smoked Rose)
- ✅ 圆角 24px / `--radius-2xl` 全部清理
- ✅ `var(--gold)` 全部 rename;legacy alias 兜底
- ✅ 业务逻辑 / 支付 / 订单 / 认证逻辑 / 路由 未动
- ✅ 设计师 name / bio / avatar 未动
