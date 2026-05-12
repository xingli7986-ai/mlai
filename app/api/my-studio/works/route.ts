import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/getAuthUser";
import { prisma } from "@/lib/prisma";
import {
  addStudioResult,
  createEmptyStudioMetadata,
  normalizeBodyProfile,
  resultFromInput,
  serializeStudioMetadata,
  studioWorkToDTO,
  uniqueImages,
  STUDIO_WORK_SCHEMA,
} from "@/lib/my-studio/work";
import type { StudioCurrentStep, StudioResultKind, StudioWorkConfig } from "@/lib/my-studio/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WORK_SERVICE_ERROR = "当前无法连接作品服务，请稍后重试或联系管理员。";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function getString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function getKind(value: unknown): StudioResultKind | null {
  if (value === "pattern" || value === "seamless" || value === "tryOn" || value === "sketch") {
    return value;
  }
  return null;
}

export async function GET(req: Request) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ success: false, error: "请先登录后再查看作品。" }, { status: 401 });
  }

  try {
    const designs = await prisma.design.findMany({
      where: {
        userId: user.id,
        OR: [
          { status: "studio_work" },
          { colorAnalysis: { contains: STUDIO_WORK_SCHEMA } },
        ],
      },
      orderBy: { updatedAt: "desc" },
      take: 40,
    });

    return NextResponse.json({
      success: true,
      works: designs.map(studioWorkToDTO),
    });
  } catch (err) {
    console.error("[my-studio/works] list failed", err);
    return NextResponse.json({ success: false, error: WORK_SERVICE_ERROR }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ success: false, error: "请先登录后再保存作品。" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    const parsed = await req.json();
    body = isRecord(parsed) ? parsed : {};
  } catch {
    return NextResponse.json({ success: false, error: "请求内容格式不正确。" }, { status: 400 });
  }

  const title = getString(body.title) || "我的第一件 AI 连衣裙";
  const prompt = getString(body.prompt) || title;
  const config = isRecord(body.config) ? (body.config as Partial<StudioWorkConfig>) : {};
  let metadata = createEmptyStudioMetadata(title);
  metadata = {
    ...metadata,
    currentStep: rawCurrentStep(body.currentStep),
    createdFrom: getString(body.createdFrom) || metadata.createdFrom,
    isFallbackAllowed:
      typeof body.isFallbackAllowed === "boolean"
        ? body.isFallbackAllowed
        : metadata.isFallbackAllowed,
    config: {
      ...metadata.config,
      ...config,
      garmentType: getString(body.garmentType) || config.garmentType || metadata.config.garmentType,
      category: getString(body.garmentType) || config.category || config.garmentType || metadata.config.category,
      silhouette: getString(body.silhouette) || config.silhouette || metadata.config.silhouette,
      occasion: getString(body.occasion) || config.occasion || metadata.config.occasion,
      size: getString(body.size) || config.size || metadata.config.size,
    },
  };
  if (isRecord(body.bodyProfile)) {
    metadata.bodyProfile = normalizeBodyProfile({
      ...body.bodyProfile,
      updatedAt: getString((body.bodyProfile as Record<string, unknown>).updatedAt) || new Date().toISOString(),
    });
    metadata.config.size = metadata.bodyProfile.usualSize || metadata.config.size;
  }

  const rawResult = isRecord(body.result) ? body.result : null;
  if (rawResult) {
    const kind = getKind(rawResult.kind);
    const imageUrl = getString(rawResult.imageUrl);
    const tool = getString(rawResult.tool) || "pattern-generate";
    const resultType = getString(rawResult.resultType) || "floral_print_pattern";
    const images = Array.isArray(rawResult.images)
      ? rawResult.images.filter((item): item is string => typeof item === "string")
      : imageUrl
        ? [imageUrl]
        : [];
    if (!kind || !imageUrl) {
      return NextResponse.json({ success: false, error: "保存作品缺少结果图片。" }, { status: 400 });
    }
    metadata = addStudioResult(
      metadata,
      resultFromInput({
        kind,
        tool,
        resultType,
        imageUrl,
        images,
        isFallback: Boolean(rawResult.isFallback),
        params: isRecord(rawResult.params) ? rawResult.params : undefined,
        metadata: isRecord(rawResult.metadata) ? rawResult.metadata : undefined,
      }),
    );
  }

  const allImages = uniqueImages(
    Object.values(metadata.results)
      .flatMap((result) => result?.images ?? [])
      .filter(Boolean),
  );
  const selectedImage =
    metadata.results.sketch?.imageUrl ||
    metadata.results.tryOn?.imageUrl ||
    metadata.results.seamless?.imageUrl ||
    metadata.results.pattern?.imageUrl ||
    allImages[0] ||
    null;

  try {
    const design = await prisma.design.create({
      data: {
        userId: user.id,
        prompt,
        images: allImages,
        selectedImage,
        skirtType: metadata.config.category,
        fabric: metadata.config.fabric,
        neckline: metadata.config.neckline,
        sleeveType: metadata.config.sleeveType,
        skirtLength: metadata.config.skirtLength,
        productionImageUrl: metadata.results.tryOn?.imageUrl ?? null,
        vectorImageUrl: metadata.results.sketch?.imageUrl ?? null,
        processingStatus: metadata.currentStep,
        status: "studio_work",
        colorAnalysis: serializeStudioMetadata(metadata),
      },
    });

    return NextResponse.json({
      success: true,
      work: studioWorkToDTO(design),
      workId: design.id,
    });
  } catch (err) {
    console.error("[my-studio/works] create failed", err);
    return NextResponse.json({ success: false, error: WORK_SERVICE_ERROR }, { status: 500 });
  }
}

function rawCurrentStep(value: unknown): StudioCurrentStep {
  return value === "created" ? "created" : "created";
}
