/**
 * 永鑫科技 GPT-Image-2 — OpenAI 兼容 /images/generations
 * 同步返回 data[0].url 或 data[0].b64_json
 *
 * 文件名保留为 suchuang.ts 仅为兼容历史 import 路径，
 * 实际后端已切换到永鑫科技。
 */

const API_KEY = process.env.YXAI_API_KEY!;
const BASE_URL = process.env.YXAI_BASE_URL || "https://yxai.anthropic.edu.pl/v1";

interface OpenAIImageResponse {
  created?: number;
  data: Array<{
    url?: string;
    b64_json?: string;
    revised_prompt?: string;
  }>;
  error?: { message?: string; type?: string; code?: string };
}

const SIZE_MAP: Record<string, string> = {
  "1:1": "1024x1024",
  "3:4": "768x1024",
  "4:3": "1024x768",
  "9:16": "576x1024",
  "16:9": "1024x576",
  "2:3": "768x1152",
  "3:2": "1152x768",
};

function normalizeSize(input?: string): string {
  if (!input) return "1024x1024";
  if (SIZE_MAP[input]) return SIZE_MAP[input];
  if (/^\d+x\d+$/.test(input)) return input;
  return "1024x1024";
}

/**
 * 调永鑫科技 OpenAI 兼容生图接口。
 * 返回图像 URL 数组（如永鑫只回 base64，会转成 data URL）。
 */
export async function generateWithGPTImage2(
  prompt: string,
  options?: {
    size?: string;
    n?: number;
    /**
     * 兼容旧调用：可传入参考图 URL 数组，自动拼接进 prompt 文本。
     * （OpenAI 标准 /images/generations 不接受图片输入；如需图生图请用
     * /images/edits，目前永鑫接口未启用，先以文本提示形式承接。）
     */
    urls?: string[];
  }
): Promise<string[]> {
  const size = normalizeSize(options?.size);
  const n = Math.max(1, Math.min(options?.n ?? 1, 4));

  let finalPrompt = prompt;
  if (options?.urls && options.urls.length > 0) {
    const refs = options.urls.map((u, i) => `[Reference image ${i + 1}]: ${u}`).join("\n");
    finalPrompt = `${prompt}\n\nUse these as visual reference inputs:\n${refs}`;
  }

  const res = await fetch(`${BASE_URL}/images/generations`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-image-2",
      prompt: finalPrompt,
      size,
      n,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`永鑫科技生图失败: HTTP ${res.status} ${text.slice(0, 200)}`);
  }

  const data = (await res.json()) as OpenAIImageResponse;

  if (data.error) {
    throw new Error(`永鑫科技生图失败: ${data.error.message || data.error.code || "unknown"}`);
  }

  if (!Array.isArray(data.data) || data.data.length === 0) {
    throw new Error("永鑫科技生图失败: 返回为空");
  }

  return data.data
    .map((item) => {
      if (item.url) return item.url;
      if (item.b64_json) return `data:image/png;base64,${item.b64_json}`;
      return null;
    })
    .filter((u): u is string => typeof u === "string");
}
