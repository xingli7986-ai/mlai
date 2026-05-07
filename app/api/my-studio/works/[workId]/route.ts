import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/getAuthUser";
import { prisma } from "@/lib/prisma";
import {
  confirmStudioDesign,
  normalizeBodyProfile,
  normalizeGarmentTemplates,
  normalizePatternGroups,
  normalizePatternPreferenceMemory,
  normalizePatternReferences,
  parseStudioMetadata,
  selectStudioAsset,
  serializeStudioMetadata,
  studioWorkToDTO,
  uniqueImages,
} from "@/lib/my-studio/work";
import type { ProductionSheetStatus, StudioResultKind, StudioWorkConfig } from "@/lib/my-studio/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WORK_SERVICE_ERROR = "当前无法连接作品服务，请稍后重试或联系管理员。";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function getString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function getStatus(value: unknown): ProductionSheetStatus | null {
  if (
    value === "draft" ||
    value === "pending_review" ||
    value === "approved_for_factory" ||
    value === "sent_to_factory"
  ) {
    return value;
  }
  return null;
}

function getKind(value: unknown): StudioResultKind | null {
  if (value === "pattern" || value === "seamless" || value === "tryOn" || value === "sketch") {
    return value;
  }
  return null;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ workId: string }> },
) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ success: false, error: "请先登录后再查看作品。" }, { status: 401 });
  }

  const { workId } = await params;
  let design;
  try {
    design = await prisma.design.findUnique({ where: { id: workId } });
  } catch (err) {
    console.error("[my-studio/work] read failed", err instanceof Error ? err.message : err);
    return NextResponse.json({ success: false, error: WORK_SERVICE_ERROR }, { status: 503 });
  }
  if (!design || design.userId !== user.id) {
    return NextResponse.json({ success: false, error: "作品不存在或无权访问。" }, { status: 404 });
  }

  return NextResponse.json({ success: true, work: studioWorkToDTO(design) });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ workId: string }> },
) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ success: false, error: "请先登录后再更新作品。" }, { status: 401 });
  }

  const { workId } = await params;
  let design;
  try {
    design = await prisma.design.findUnique({ where: { id: workId } });
  } catch (err) {
    console.error("[my-studio/work] update lookup failed", err instanceof Error ? err.message : err);
    return NextResponse.json({ success: false, error: WORK_SERVICE_ERROR }, { status: 503 });
  }
  if (!design || design.userId !== user.id) {
    return NextResponse.json({ success: false, error: "作品不存在或无权访问。" }, { status: 404 });
  }

  let body: Record<string, unknown>;
  try {
    const parsed = await req.json();
    body = isRecord(parsed) ? parsed : {};
  } catch {
    return NextResponse.json({ success: false, error: "请求内容格式不正确。" }, { status: 400 });
  }

  const metadata = parseStudioMetadata(design.colorAnalysis, design);
  const nextMetadata = { ...metadata };
  if (typeof body.title === "string" && body.title.trim()) {
    nextMetadata.title = body.title.trim();
  }
  if (isRecord(body.config)) {
    nextMetadata.config = {
      ...nextMetadata.config,
      ...(body.config as Partial<StudioWorkConfig>),
    };
  }
  nextMetadata.config = {
    ...nextMetadata.config,
    garmentType: getString(body.garmentType) || nextMetadata.config.garmentType,
    category: getString(body.garmentType) || nextMetadata.config.category,
    silhouette: getString(body.silhouette) || nextMetadata.config.silhouette,
    occasion: getString(body.occasion) || nextMetadata.config.occasion,
    size: getString(body.size) || nextMetadata.config.size,
  };
  if (Array.isArray(body.publicPatternFeedSnapshot)) {
    nextMetadata.publicPatternFeedSnapshot = normalizePatternReferences(body.publicPatternFeedSnapshot);
  }
  if (Array.isArray(body.inspirationBoard)) {
    nextMetadata.inspirationBoard = normalizePatternReferences(body.inspirationBoard).slice(0, 6);
  }
  if (isRecord(body.preferenceMemory)) {
    nextMetadata.preferenceMemory = normalizePatternPreferenceMemory(body.preferenceMemory);
  }
  if (isRecord(body.bodyProfile)) {
    nextMetadata.bodyProfile = normalizeBodyProfile(body.bodyProfile);
    nextMetadata.config.size = nextMetadata.bodyProfile.usualSize || nextMetadata.config.size;
  }
  if (Array.isArray(body.garmentTemplates)) {
    nextMetadata.garmentTemplates = normalizeGarmentTemplates(body.garmentTemplates);
  }
  const selectedGarmentTemplateId =
    getString(body.selectedGarmentTemplateId) ||
    getString(body.garmentTemplateId);
  if (selectedGarmentTemplateId && nextMetadata.garmentTemplates.some((item) => item.id === selectedGarmentTemplateId)) {
    nextMetadata.selectedAssets = {
      ...nextMetadata.selectedAssets,
      garmentTemplateId: selectedGarmentTemplateId,
    };
    const selectedTemplate = nextMetadata.garmentTemplates.find((item) => item.id === selectedGarmentTemplateId);
    if (selectedTemplate) {
      nextMetadata.config = {
        ...nextMetadata.config,
        silhouette: selectedTemplate.silhouette || nextMetadata.config.silhouette,
        neckline: selectedTemplate.neckline || nextMetadata.config.neckline,
        sleeveType: selectedTemplate.sleeve || nextMetadata.config.sleeveType,
        skirtLength: selectedTemplate.skirtLength || nextMetadata.config.skirtLength,
        waistline: selectedTemplate.waistline || nextMetadata.config.waistline,
      };
    }
  }
  if (isRecord(body.patternGenerationGroup)) {
    nextMetadata.patternGenerationGroups = [
      ...normalizePatternGroups(nextMetadata.patternGenerationGroups),
      ...normalizePatternGroups([body.patternGenerationGroup]),
    ];
  }
  if (isRecord(body.selectAsset)) {
    const kind = getKind(body.selectAsset.kind);
    const assetId = getString(body.selectAsset.assetId);
    if (kind && assetId) {
      const selected = selectStudioAsset(nextMetadata, kind, assetId);
      Object.assign(nextMetadata, selected);
    }
  }
  if (body.confirmDesign === true) {
    const confirmed = confirmStudioDesign(nextMetadata, {
      config: isRecord(body.confirmConfig) ? body.confirmConfig as Partial<StudioWorkConfig> : undefined,
      customOrderDraft: body.customOrderDraft,
      note: getString(body.note) || undefined,
    });
    Object.assign(nextMetadata, confirmed);
  }
  if (isRecord(body.productionSheet)) {
    const status = getStatus(body.productionSheet.status);
    if (status) {
      nextMetadata.productionSheet = {
        status,
        updatedAt: new Date().toISOString(),
      };
    }
  }
  nextMetadata.updatedAt = new Date().toISOString();
  const allImages = uniqueImages([
    ...design.images,
    ...nextMetadata.assets.patterns.flatMap((asset) => asset.images),
    ...nextMetadata.assets.applications.flatMap((asset) => asset.images),
    ...nextMetadata.assets.tryOns.flatMap((asset) => asset.images),
    ...nextMetadata.assets.sketches.flatMap((asset) => asset.images),
  ]);
  const selectedImage =
    nextMetadata.results.tryOn?.imageUrl ||
    nextMetadata.results.seamless?.imageUrl ||
    nextMetadata.results.pattern?.imageUrl ||
    nextMetadata.results.sketch?.imageUrl ||
    design.selectedImage ||
    allImages[0] ||
    null;

  let updated;
  try {
    updated = await prisma.design.update({
      where: { id: workId },
      data: {
        prompt: nextMetadata.title,
        images: allImages,
        selectedImage,
        skirtType: nextMetadata.config.category,
        fabric: nextMetadata.config.fabric,
        neckline: nextMetadata.config.neckline,
        sleeveType: nextMetadata.config.sleeveType,
        skirtLength: nextMetadata.config.skirtLength,
        productionImageUrl: nextMetadata.results.tryOn?.imageUrl ?? design.productionImageUrl,
        vectorImageUrl: nextMetadata.results.sketch?.imageUrl ?? design.vectorImageUrl,
        status: "studio_work",
        processingStatus: nextMetadata.currentStep,
        colorAnalysis: serializeStudioMetadata(nextMetadata),
      },
    });
  } catch (err) {
    console.error("[my-studio/work] update failed", err instanceof Error ? err.message : err);
    return NextResponse.json({ success: false, error: WORK_SERVICE_ERROR }, { status: 503 });
  }

  return NextResponse.json({ success: true, work: studioWorkToDTO(updated) });
}
