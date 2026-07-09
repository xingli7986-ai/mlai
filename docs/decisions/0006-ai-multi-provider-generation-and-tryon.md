# ADR-0006:AI 生图多 provider(永鑫 GPT-Image-2 / Gemini / FASHN),试穿分档保真 + 诚实降级

- 状态:Accepted(已实施,部分档位为占位/未接)
- 日期:2026-07-09(据 `app/api/ai-studio/generate/route.ts`、`lib/suchuang.ts`、`lib/my-studio/*` 归纳补录)
- 关联:`app/api/ai-studio/generate/route.ts`、`lib/suchuang.ts`、`lib/my-studio/tryon-provider.ts`、`lib/my-studio/fallbacks.ts`、`lib/my-studio/types.ts`、`lib/ai-studio-prompts.ts`、`lib/aiUsage.ts`、`lib/print-processing.ts`、`lib/vectorize.ts`、`lib/aliyun-sr.ts`

## 背景

平台的印花创作、四方连续、线稿、虚拟试穿都依赖图像生成/编辑,不同工具与不同保真需求适配不同后端;同时必须避免把"示例/降级图"冒充为真实 AI 或生产可用结果(`docs/DECISIONS.md` D012)。此外生产印花还需超分与矢量化管线。

## 决策

- **统一入口** `/api/ai-studio/generate`(`runtime=nodejs`,`maxDuration=120`):按 `tool`/`toolType` 归一化 + `TOOL_PROMPT_MAP` 构造 prompt,鉴权 + 按角色每日限额(`lib/aiUsage.ts`)。
- **文/图生图双模型**:
  - 永鑫科技 **GPT-Image-2**(OpenAI 兼容 `/images/generations` 与 `/images/edits`,`lib/suchuang.ts`,文件名保留 `suchuang` 仅兼容历史 import)。edits 前用 `sharp` 压缩到 ≤1024 边/≤1MB。
  - Google **Gemini `gemini-3-pro-image-preview`**(`@google/genai`,支持多模态 inlineData 输入)。
- **虚拟试穿分档保真**(`lib/my-studio/types.ts` 的 `TryOnFidelityMode`):`approximate`(纯文本 prompt)/`reference_image`(印花作真实参考图,走 image2 edits)/`masked_garment_tryon`(区域 mask,**当前 provider 未接,抛 `MASKED_GARMENT_TRYON_PROVIDER_NOT_CONFIGURED`)/`garment_tryon(_high_quality)`(走 **FASHN** provider)。由 `resolveTryOnExecutionMode` 依 provider capability 决策,能力不足时可 `blocked` 或降级。
- **诚实降级**:无 key/失败时返回 `isFallback:true` + 示例图 + 中文友好文案(`lib/my-studio/fallbacks.ts`),元数据记 provider/model/isFallback 但消费端默认不暴露;高保真试穿失败**不**用示例图冒充(避免与所选印花偏差),而是返回 422 让用户重试。
- **生产印花管线**:Replicate(Real-ESRGAN 4x 超分)、阿里云视觉智能超分(`lib/aliyun-sr.ts`)、potrace 矢量化(`lib/vectorize.ts`)。
- 生成结果统一持久化到 R2(`persistGeneratedImage`)。

## 后果

- 正面:按工具/保真选最合适 provider;能力矩阵 + 降级策略让"未接入"透明可控,不误导用户与生产。
- 负面/约束:多 provider + 多档位使单文件路由逻辑很重(1300+ 行),分支多、维护成本高;masked 档为占位、FASHN 与最终试穿质量待验证;`@react-pdf/renderer`/`potrace`/`sharp` 等重包与体积上限强相关(见 ADR-0007);任一 provider key 缺失即触发降级路径。
