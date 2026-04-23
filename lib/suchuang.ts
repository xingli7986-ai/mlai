/**
 * 速创API（物印科技）— GPT-Image-2 生图
 * 异步模式：提交任务 → 轮询结果
 */

const API_KEY = process.env.SUCHUANG_API_KEY!;
const BASE_URL = process.env.SUCHUANG_BASE_URL || "https://api.wuyinkeji.com";

interface SubmitResponse {
  code: number;
  msg: string;
  data: { id: string };
}

interface DetailResponse {
  code: number;
  data: {
    task_id: string;
    status: number; // 0=排队, 1=处理中, 2=完成, 3=失败
    result?: string[];
    created_at: string;
    updated_at: string;
  };
}

export async function submitImageTask(
  prompt: string,
  options?: {
    size?: string;
    urls?: string[];
  }
): Promise<string> {
  const body: Record<string, unknown> = {
    prompt,
    size: options?.size || "1:1",
  };
  if (options?.urls && options.urls.length > 0) {
    body.urls = options.urls;
  }

  const res = await fetch(`${BASE_URL}/api/async/image_gpt`, {
    method: "POST",
    headers: {
      Authorization: API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`速创API提交失败: HTTP ${res.status}`);
  }

  const data: SubmitResponse = await res.json();
  if (data.code !== 200) {
    throw new Error(`速创API提交失败: ${data.msg}`);
  }

  return data.data.id;
}

export async function queryTaskResult(
  taskId: string
): Promise<DetailResponse["data"]> {
  const res = await fetch(
    `${BASE_URL}/api/async/detail?key=${API_KEY}&id=${taskId}`
  );

  if (!res.ok) {
    throw new Error(`速创API查询失败: HTTP ${res.status}`);
  }

  const data: DetailResponse = await res.json();
  if (data.code !== 200) {
    throw new Error(`速创API查询失败: code ${data.code}`);
  }

  return data.data;
}

/**
 * 提交任务并轮询等待结果。每 3 秒一次，最多 120 秒。
 */
export async function generateWithGPTImage2(
  prompt: string,
  options?: {
    size?: string;
    urls?: string[];
  }
): Promise<string[]> {
  const taskId = await submitImageTask(prompt, options);

  const maxAttempts = 40;
  const intervalMs = 3000;

  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((resolve) => setTimeout(resolve, intervalMs));

    const result = await queryTaskResult(taskId);

    if (result.status === 2 && result.result && result.result.length > 0) {
      return result.result;
    }

    if (result.status === 3) {
      throw new Error("GPT-Image-2 生图失败");
    }
  }

  throw new Error("GPT-Image-2 生图超时（120秒）");
}
