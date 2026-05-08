import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/getAuthUser";
import { prisma } from "@/lib/prisma";
import {
  appendStudioAssets,
  normalizeBodyProfile,
  normalizeGarmentTemplates,
  normalizeApplicationGroups,
  normalizePatternGroups,
  normalizePatternPreferenceMemory,
  normalizePatternReferences,
  normalizeTryOnGroups,
  parseStudioMetadata,
  selectStudioAsset,
  serializeStudioMetadata,
  studioWorkToDTO,
  uniqueImages,
} from "@/lib/my-studio/work";
import type {
  StudioAsset,
  StudioPatternAssetSource,
  StudioResultKind,
  StudioTryOnSource,
  StudioTryOnStatus,
  TryOnFidelityMode,
  TryOnQualityScores,
  TryOnReferenceMode,
  StudioWorkConfig,
} from "@/lib/my-studio/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

function getRecordArray(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? value.filter(isRecord) : [];
}

function arrayOfStrings(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0).map((item) => item.trim())
    : [];
}

function getTryOnStatus(value: unknown, isFallback: boolean): StudioTryOnStatus {
  if (value === "selected" || value === "generated" || value === "fallback") return value;
  return isFallback ? "fallback" : "generated";
}

function getTryOnSource(value: unknown): StudioTryOnSource | undefined {
  if (
    value === "direct-pattern-try-on" ||
    value === "remix-pattern-try-on" ||
    value === "regenerate-fit"
  ) {
    return value;
  }
  return undefined;
}

function getFidelityMode(value: unknown): TryOnFidelityMode | undefined {
  if (value === "approximate" || value === "reference_image" || value === "masked_garment_tryon") {
    return value;
  }
  return undefined;
}

function getReferenceMode(value: unknown): TryOnReferenceMode | undefined {
  if (value === "prompt_url_only" || value === "true_image_reference" || value === "masked_tryon") {
    return value;
  }
  return undefined;
}

function getBoolean(value: unknown): boolean | undefined {
  if (typeof value === "boolean") return value;
  if (value === "true" || value === "1") return true;
  if (value === "false" || value === "0") return false;
  return undefined;
}

function getQualityScores(value: unknown): TryOnQualityScores | undefined {
  return isRecord(value) ? (value as TryOnQualityScores) : undefined;
}

function saveFailureResponse(status = 500) {
  return NextResponse.json(
    { success: false, message: "印花保存失败，请稍后重试。", error: "印花保存失败，请稍后重试。" },
    { status },
  );
}

function findExistingDirectPattern(
  metadata: ReturnType<typeof parseStudioMetadata>,
  publicAssetId: string,
): StudioAsset | undefined {
  return metadata.assets.patterns.find((asset) => {
    const source = asset.source;
    return (
      source?.publicAssetId === publicAssetId ||
      source?.refId === publicAssetId ||
      source?.refIds?.includes(publicAssetId)
    );
  });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ workId: string }> },
) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ success: false, error: "请先登录后再保存结果。" }, { status: 401 });
  }

  const { workId } = await params;
  let design;
  try {
    design = await prisma.design.findUnique({ where: { id: workId } });
  } catch (err) {
    console.error("[my-studio] result save lookup failed", err instanceof Error ? err.message : err);
    return saveFailureResponse(503);
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

  const kind = getKind(body.kind);
  const imageUrl = getString(body.imageUrl);
  const tool = getString(body.tool);
  const resultType = getString(body.resultType);
  const images = Array.isArray(body.images)
    ? body.images.filter((item): item is string => typeof item === "string")
    : imageUrl
      ? [imageUrl]
      : [];
  const rawAssets = getRecordArray(body.assets);

  if (!kind || ((!imageUrl || !tool || !resultType) && rawAssets.length === 0)) {
    return saveFailureResponse(400);
  }

  let metadata = parseStudioMetadata(design.colorAnalysis, design);
  if (typeof body.title === "string" && body.title.trim()) {
    metadata.title = body.title.trim();
  }
  if (isRecord(body.config)) {
    metadata.config = {
      ...metadata.config,
      ...(body.config as Partial<StudioWorkConfig>),
    };
  }
  const bodyProfileSnapshot = isRecord(body.bodyProfile)
    ? normalizeBodyProfile(body.bodyProfile)
    : metadata.bodyProfile;
  const bodyGarmentTemplate = isRecord(body.garmentTemplate)
    ? normalizeGarmentTemplates([body.garmentTemplate])[0]
    : undefined;
  if (isRecord(body.bodyProfile)) {
    metadata.bodyProfile = bodyProfileSnapshot;
    metadata.config.size = bodyProfileSnapshot.usualSize || metadata.config.size;
  }
  if (bodyGarmentTemplate) {
    const existingTemplates = normalizeGarmentTemplates(metadata.garmentTemplates);
    metadata.garmentTemplates = existingTemplates.some((item) => item.id === bodyGarmentTemplate.id)
      ? existingTemplates.map((item) => item.id === bodyGarmentTemplate.id ? bodyGarmentTemplate : item)
      : [...existingTemplates, bodyGarmentTemplate];
    metadata.selectedAssets = {
      ...metadata.selectedAssets,
      garmentTemplateId: bodyGarmentTemplate.id,
    };
    metadata.config = {
      ...metadata.config,
      silhouette: bodyGarmentTemplate.silhouette || metadata.config.silhouette,
      neckline: bodyGarmentTemplate.neckline || metadata.config.neckline,
      sleeveType: bodyGarmentTemplate.sleeve || metadata.config.sleeveType,
      skirtLength: bodyGarmentTemplate.skirtLength || metadata.config.skirtLength,
      waistline: bodyGarmentTemplate.waistline || metadata.config.waistline,
    };
  }
  const bodyMetadata = isRecord(body.metadata) ? body.metadata : undefined;
  const bodyParams = isRecord(body.params) ? body.params : undefined;
  const bodySource = isRecord(body.source) ? body.source : undefined;
  const provider = getString(body.provider) || getString(bodyMetadata?.provider);
  const model = getString(body.model) || getString(bodyMetadata?.model);
  const prompt = getString(body.prompt) || getString(bodyParams?.prompt);
  const inputAssetId = getString(body.inputAssetId);
  const patternAssetId = getString(body.patternAssetId) || getString(body.sourcePatternResultId) || inputAssetId;
  const fitPreference = bodyProfileSnapshot.fitPreference;
  const revisionReason = getString(body.revisionReason) || undefined;
  const tryOnSource = getTryOnSource(body.tryOnSource);
  const fidelityMode = getFidelityMode(body.fidelityMode) || getFidelityMode(bodyMetadata?.fidelityMode);
  const referenceMode = getReferenceMode(body.referenceMode) || getReferenceMode(bodyMetadata?.referenceMode);
  const patternReferenceUsed = getBoolean(body.patternReferenceUsed) ?? getBoolean(bodyMetadata?.patternReferenceUsed);
  const maskUsed = getBoolean(body.maskUsed) ?? getBoolean(bodyMetadata?.maskUsed);
  const isProductionReady = getBoolean(body.isProductionReady) ?? getBoolean(bodyMetadata?.isProductionReady);
  const fidelityWarnings = arrayOfStrings(body.fidelityWarnings).length
    ? arrayOfStrings(body.fidelityWarnings)
    : arrayOfStrings(body.warnings).length
      ? arrayOfStrings(body.warnings)
      : arrayOfStrings(bodyMetadata?.warnings);
  const qualityScores = getQualityScores(body.qualityScores) || getQualityScores(bodyMetadata?.qualityScores);
  const sourcePatternTileId = getString(body.sourcePatternTileId) || getString(bodyMetadata?.sourcePatternTileId);
  const sourceGarmentTemplateId = getString(body.sourceGarmentTemplateId) || getString(bodyMetadata?.sourceGarmentTemplateId);
  const sourceModelBaseId = getString(body.sourceModelBaseId) || getString(bodyMetadata?.sourceModelBaseId);
  const groupId = getString(body.groupId) || undefined;
  const sourcePublicAssetId =
    getString(bodySource?.publicAssetId) ||
    getString(bodySource?.refId) ||
    arrayOfStrings(bodySource?.refIds)[0] ||
    arrayOfStrings(body.refIds)[0] ||
    "";
  const existingDirectPattern =
    kind === "pattern" && body.sourceMode === "direct_use" && sourcePublicAssetId
      ? findExistingDirectPattern(metadata, sourcePublicAssetId)
      : undefined;
  const assetInputs = rawAssets.length > 0
    ? rawAssets.map((asset) => ({
        id: getString(asset.id) || undefined,
        toolKey: getString(asset.toolKey) || tool,
        imageUrl: getString(asset.imageUrl),
        images: Array.isArray(asset.images)
          ? asset.images.filter((item): item is string => typeof item === "string")
          : undefined,
        prompt: getString(asset.prompt) || prompt,
        provider: getString(asset.provider) || provider,
        model: getString(asset.model) || model,
        isFallback: typeof asset.isFallback === "boolean" ? asset.isFallback : Boolean(body.isFallback),
        inputAssetId: getString(asset.inputAssetId) || inputAssetId || undefined,
        inputWorkId: workId,
        params: isRecord(asset.params) ? asset.params : bodyParams,
        metadata: isRecord(asset.metadata) ? asset.metadata : bodyMetadata,
        source: (isRecord(asset.source) ? asset.source : bodySource) as StudioPatternAssetSource | undefined,
        groupId: getString(asset.groupId) || groupId,
        patternAssetId: getString(asset.patternAssetId) || patternAssetId || undefined,
        bodyProfileSnapshot: isRecord(asset.bodyProfileSnapshot)
          ? normalizeBodyProfile(asset.bodyProfileSnapshot)
          : bodyProfileSnapshot,
        garmentTemplateSnapshot: isRecord(asset.garmentTemplateSnapshot)
          ? normalizeGarmentTemplates([asset.garmentTemplateSnapshot])[0]
          : bodyGarmentTemplate,
        fitPreference,
        tryOnStatus: getTryOnStatus(asset.tryOnStatus, Boolean(asset.isFallback ?? body.isFallback)),
        revisionReason,
        tryOnSource,
        fidelityMode: getFidelityMode(asset.fidelityMode) || fidelityMode,
        referenceMode: getReferenceMode(asset.referenceMode) || referenceMode,
        patternReferenceUsed: getBoolean(asset.patternReferenceUsed) ?? patternReferenceUsed,
        maskUsed: getBoolean(asset.maskUsed) ?? maskUsed,
        isProductionReady: getBoolean(asset.isProductionReady) ?? isProductionReady,
        fidelityWarnings: arrayOfStrings(asset.fidelityWarnings).length
          ? arrayOfStrings(asset.fidelityWarnings)
          : fidelityWarnings,
        qualityScores: getQualityScores(asset.qualityScores) || qualityScores,
        sourcePatternTileId: getString(asset.sourcePatternTileId) || sourcePatternTileId || undefined,
        sourceGarmentTemplateId: getString(asset.sourceGarmentTemplateId) || sourceGarmentTemplateId || undefined,
        sourceModelBaseId: getString(asset.sourceModelBaseId) || sourceModelBaseId || undefined,
      }))
    : images.map((url, index) => ({
        toolKey: tool,
        imageUrl: url,
        images: [url],
        prompt,
        provider,
        model,
        isFallback: Boolean(body.isFallback),
        inputAssetId: inputAssetId || undefined,
        inputWorkId: workId,
        params: bodyParams ? { ...bodyParams, resultIndex: index } : { resultIndex: index },
        metadata: bodyMetadata,
        source: bodySource as StudioPatternAssetSource | undefined,
        groupId,
        patternAssetId: patternAssetId || undefined,
        bodyProfileSnapshot,
        garmentTemplateSnapshot: bodyGarmentTemplate,
        fitPreference,
        tryOnStatus: getTryOnStatus(body.tryOnStatus, Boolean(body.isFallback)),
        revisionReason,
        tryOnSource,
        fidelityMode,
        referenceMode,
        patternReferenceUsed,
        maskUsed,
        isProductionReady,
        fidelityWarnings,
        qualityScores,
        sourcePatternTileId: sourcePatternTileId || undefined,
        sourceGarmentTemplateId: sourceGarmentTemplateId || undefined,
        sourceModelBaseId: sourceModelBaseId || undefined,
      }));
  const appended = existingDirectPattern
    ? {
        metadata: selectStudioAsset(metadata, "pattern", existingDirectPattern.id),
        assets: [existingDirectPattern],
      }
    : appendStudioAssets(metadata, kind, assetInputs, {
        selectedAssetId: getString(body.selectedAssetId) || undefined,
        selectFirst: body.selectFirst !== false,
      });
  metadata = appended.metadata;

  if (Array.isArray(body.publicPatternFeedSnapshot)) {
    metadata.publicPatternFeedSnapshot = normalizePatternReferences(body.publicPatternFeedSnapshot);
  }
  if (Array.isArray(body.inspirationBoard)) {
    metadata.inspirationBoard = normalizePatternReferences(body.inspirationBoard).slice(0, 6);
  }
  if (isRecord(body.preferenceMemory)) {
    metadata.preferenceMemory = normalizePatternPreferenceMemory(body.preferenceMemory);
  }
  if (kind === "pattern" && groupId && appended.assets.length > 0 && !existingDirectPattern) {
    const sourceMode =
      body.sourceMode === "direct_use" || body.sourceMode === "manual_prompt"
        ? body.sourceMode
        : "remix_from_references";
    const groups = normalizePatternGroups(metadata.patternGenerationGroups)
      .filter((group) => group.groupId !== groupId);
    metadata.patternGenerationGroups = [
      ...groups,
      {
        groupId,
        generatedAt: getString(body.generatedAt) || new Date().toISOString(),
        sourceMode,
        refIds: arrayOfStrings(body.refIds),
        preferenceSnapshot: isRecord(body.preferenceSnapshot) ? body.preferenceSnapshot : undefined,
        resultIds: appended.assets.map((asset) => asset.id),
      },
    ];
  }
  if (kind === "seamless" && groupId && appended.assets.length > 0) {
    const groups = normalizeApplicationGroups(metadata.applicationGenerationGroups)
      .filter((group) => group.groupId !== groupId);
    metadata.applicationGenerationGroups = [
      ...groups,
      {
        groupId,
        generatedAt: getString(body.generatedAt) || new Date().toISOString(),
        sourcePatternResultId: getString(body.sourcePatternResultId) || getString(bodyParams?.sourcePatternResultId) || inputAssetId || undefined,
        preferenceSnapshot: isRecord(body.preferenceSnapshot) ? body.preferenceSnapshot : undefined,
        resultIds: appended.assets.map((asset) => asset.id),
      },
    ];
  }
  if (kind === "tryOn" && groupId && appended.assets.length > 0) {
    const groups = normalizeTryOnGroups(metadata.tryOnGenerationGroups)
      .filter((group) => group.groupId !== groupId);
    metadata.tryOnGenerationGroups = [
      ...groups,
      {
        groupId,
        generatedAt: getString(body.generatedAt) || new Date().toISOString(),
        sourceApplicationResultId: getString(body.sourceApplicationResultId) || getString(bodyParams?.sourceApplicationResultId) || undefined,
        sourcePatternResultId: getString(body.sourcePatternResultId) || getString(bodyParams?.sourcePatternResultId) || inputAssetId || undefined,
        preferenceSnapshot: isRecord(body.preferenceSnapshot) ? body.preferenceSnapshot : undefined,
        resultIds: appended.assets.map((asset) => asset.id),
      },
    ];
  }

  const allImages = uniqueImages([
    ...design.images,
    ...metadata.assets.patterns.flatMap((asset) => asset.images),
    ...metadata.assets.applications.flatMap((asset) => asset.images),
    ...metadata.assets.tryOns.flatMap((asset) => asset.images),
    ...metadata.assets.sketches.flatMap((asset) => asset.images),
  ]);
  const selectedImage =
    metadata.results.tryOn?.imageUrl ||
    metadata.results.seamless?.imageUrl ||
    metadata.results.pattern?.imageUrl ||
    metadata.results.sketch?.imageUrl ||
    design.selectedImage ||
    allImages[0] ||
    null;

  let updated;
  try {
    updated = await prisma.design.update({
      where: { id: workId },
      data: {
        prompt: metadata.title,
        images: allImages,
        selectedImage,
        skirtType: metadata.config.category,
        fabric: metadata.config.fabric,
        neckline: metadata.config.neckline,
        sleeveType: metadata.config.sleeveType,
        skirtLength: metadata.config.skirtLength,
        productionImageUrl: metadata.results.tryOn?.imageUrl ?? design.productionImageUrl,
        vectorImageUrl: metadata.results.sketch?.imageUrl ?? design.vectorImageUrl,
        processingStatus: metadata.currentStep,
        status: "studio_work",
        colorAnalysis: serializeStudioMetadata(metadata),
      },
    });
  } catch (err) {
    console.error("[my-studio] result save update failed", err instanceof Error ? err.message : err);
    return saveFailureResponse(503);
  }

  return NextResponse.json({
    success: true,
    work: studioWorkToDTO(updated),
    workId: updated.id,
    resultId: metadata.results[kind]?.id ?? null,
    asset: appended.assets[0] ?? null,
    assets: appended.assets,
    selectedAssets: metadata.selectedAssets,
  });
}
