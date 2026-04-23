/**
 * 阿里云视觉智能 — 图像超分辨率。
 * 替代 Replicate Real-ESRGAN。定价约 ¥0.02/次，每月 100 次免费。
 *
 * 输入限制：公网可访问 URL，长边 ≤ 1920px，≤ 5MB。
 * 输出：阿里云返回的临时 URL（需及时转存 R2）。
 */

import Client, {
  MakeSuperResolutionImageRequest,
} from "@alicloud/imageenhan20190930";
import { Config } from "@alicloud/openapi-client";

let client: Client | null = null;

function getClient(): Client {
  if (!client) {
    const config = new Config({
      accessKeyId: process.env.ALIYUN_AK_ID!,
      accessKeySecret: process.env.ALIYUN_AK_SECRET!,
      endpoint: "imageenhan.cn-shanghai.aliyuncs.com",
    });
    // The imageenhan SDK v3 expects an openapi-core Config, but the runtime
    // shape is identical to openapi-client's Config — both extend tea/dara
    // Model and carry the same fields.
    client = new Client(config as unknown as ConstructorParameters<typeof Client>[0]);
  }
  return client;
}

/**
 * @param imageUrl 公网可访问图片URL（长边≤1920px，≤5MB）
 * @param upscaleFactor 1=增强画质, 2=2K, 3=3K, 4=4K
 * @returns 超分后的图片URL（临时，需尽快下载转存）
 */
export async function makeSuperResolution(
  imageUrl: string,
  upscaleFactor: number = 2
): Promise<string> {
  const c = getClient();
  const request = new MakeSuperResolutionImageRequest({
    url: imageUrl,
    upscaleFactor,
    outputFormat: "png",
  });

  const response = await c.makeSuperResolutionImage(request);

  const resultUrl = response.body?.data?.url;
  if (!resultUrl) {
    throw new Error("阿里云超分返回为空");
  }

  return resultUrl;
}
