import type { Design } from "@prisma/client";
import type {
  ProductionSheetStatus,
  StudioAsset,
  StudioAssetKind,
  StudioApplicationGenerationGroup,
  StudioApplicationPreviewPreference,
  StudioBodyProfile,
  StudioCurrentStep,
  StudioCustomOrderDraft,
  StudioGarmentTemplate,
  StudioPatternAssetSource,
  StudioPatternGenerationGroup,
  StudioPatternPreferenceMemory,
  StudioPatternReference,
  StudioProductionDraft,
  StudioResult,
  StudioResultKind,
  StudioSelectedAssets,
  StudioFitPreference,
  StudioTryOnSource,
  StudioTryOnStatus,
  StudioTryOnGenerationGroup,
  StudioTryOnPreviewPreference,
  StudioWorkAssets,
  StudioWorkConfig,
  StudioWorkDTO,
  StudioWorkMetadata,
} from "./types";

export const STUDIO_WORK_SCHEMA = "studio-work-v1";

export const DEFAULT_STUDIO_CONFIG: StudioWorkConfig = {
  category: "连衣裙",
  garmentType: "连衣裙",
  silhouette: "A 字裙",
  occasion: "通勤",
  neckline: "圆领",
  sleeveType: "短袖",
  skirtLength: "中长",
  waistline: "自然腰线",
  size: "M",
  quantity: 1,
  fabric: "轻盈垂感面料",
  printMethod: "数码印花",
  printPlacement: "按当前设计效果确认",
  customerNote: "",
  craftNote: "AI 生成图用于设计与生产沟通，投产前需要人工审核颜色、定位和版型细节。",
};

export const DEFAULT_BODY_PROFILE: StudioBodyProfile = {
  heightCm: undefined,
  weightKg: undefined,
  shoulderCm: undefined,
  bustCm: undefined,
  waistCm: undefined,
  hipCm: undefined,
  usualSize: "M",
  bodyShape: "未设定",
  fitPreference: "regular",
  measurementMode: "quick",
  updatedAt: undefined,
};

export const DEFAULT_GARMENT_TEMPLATES: StudioGarmentTemplate[] = [
  {
    id: "a-line-dress",
    name: "A 字连衣裙",
    silhouette: "A 字裙",
    neckline: "圆领",
    sleeve: "短袖",
    skirtLength: "中长",
    waistline: "自然腰线",
    closure: "后中隐形拉链",
  },
  {
    id: "commute-dress",
    name: "通勤连衣裙",
    silhouette: "通勤直身",
    neckline: "小 V 领",
    sleeve: "短袖",
    skirtLength: "中长",
    waistline: "微收腰",
    closure: "后中隐形拉链",
  },
  {
    id: "wrap-dress",
    name: "裹身裙",
    silhouette: "裹身",
    neckline: "V 领",
    sleeve: "七分袖",
    skirtLength: "中长",
    waistline: "收腰",
    closure: "裹身前片交叠，侧腰系带",
  },
  {
    id: "tea-dress",
    name: "茶歇裙",
    silhouette: "茶歇裙",
    neckline: "方领",
    sleeve: "短袖",
    skirtLength: "中长",
    waistline: "自然腰线",
    closure: "后中隐形拉链",
  },
  {
    id: "slim-knit-dress",
    name: "修身针织裙",
    silhouette: "修身针织",
    neckline: "圆领",
    sleeve: "长袖",
    skirtLength: "中长",
    waistline: "贴合腰线",
    closure: "套头针织结构",
  },
  {
    id: "straight-dress",
    name: "宽松直筒裙",
    silhouette: "直筒",
    neckline: "圆领",
    sleeve: "短袖",
    skirtLength: "中长",
    waistline: "宽松腰线",
    closure: "套头直筒结构",
  },
];

type StudioDesign = Pick<
  Design,
  | "id"
  | "prompt"
  | "images"
  | "selectedImage"
  | "productionImageUrl"
  | "vectorImageUrl"
  | "colorAnalysis"
  | "processingStatus"
  | "status"
  | "createdAt"
  | "updatedAt"
  | "skirtType"
  | "fabric"
  | "neckline"
  | "sleeveType"
  | "skirtLength"
>;

export type StudioAssetInput = {
  id?: string;
  resultType?: StudioAssetKind;
  toolKey?: string;
  tool?: string;
  imageUrl: string;
  images?: string[];
  prompt?: string;
  provider?: string;
  model?: string;
  isFallback?: boolean;
  generatedAt?: string;
  inputAssetId?: string;
  inputWorkId?: string;
  params?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  source?: StudioPatternAssetSource;
  groupId?: string;
  patternAssetId?: string;
  bodyProfileSnapshot?: StudioBodyProfile;
  garmentTemplateSnapshot?: StudioGarmentTemplate;
  fitPreference?: StudioBodyProfile["fitPreference"];
  tryOnStatus?: StudioTryOnStatus;
  revisionReason?: string;
  tryOnSource?: StudioTryOnSource;
};

const EMPTY_ASSETS: StudioWorkAssets = {
  patterns: [],
  applications: [],
  tryOns: [],
  sketches: [],
};

export const DEFAULT_PATTERN_PREFERENCE_MEMORY: StudioPatternPreferenceMemory = {
  selectedStyles: [],
  selectedColorFamilies: [],
  selectedDensity: "适中",
  selectedScale: "中花型",
  selectedMoodTags: [],
  freeTextNote: "",
  applicationPreview: {
    expression: "balanced",
    scale: "medium",
    mood: "elegant",
  },
  tryOnPreview: {
    modelStyle: "commute",
    atmosphere: "studio",
    framing: "full-body",
  },
};

export function createEmptyStudioMetadata(title: string): StudioWorkMetadata {
  const now = new Date().toISOString();
  return {
    schema: STUDIO_WORK_SCHEMA,
    title: title || "未命名设计作品",
    currentStep: "created",
    status: "draft",
    isFallback: false,
    createdFrom: "my-studio",
    isFallbackAllowed: true,
    config: { ...DEFAULT_STUDIO_CONFIG },
    bodyProfile: { ...DEFAULT_BODY_PROFILE },
    garmentTemplates: DEFAULT_GARMENT_TEMPLATES.map((item) => ({ ...item })),
    assets: cloneAssets(EMPTY_ASSETS),
    selectedAssets: { garmentTemplateId: DEFAULT_GARMENT_TEMPLATES[0]?.id },
    publicPatternFeedSnapshot: [],
    inspirationBoard: [],
    patternGenerationGroups: [],
    applicationGenerationGroups: [],
    tryOnGenerationGroups: [],
    preferenceMemory: { ...DEFAULT_PATTERN_PREFERENCE_MEMORY },
    customOrderDraft: undefined,
    productionDraft: undefined,
    results: {},
    productionSheet: {
      status: "draft",
      updatedAt: now,
    },
    updatedAt: now,
  };
}

export function parseStudioMetadata(
  raw: string | null,
  design?: StudioDesign,
): StudioWorkMetadata {
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Partial<StudioWorkMetadata>;
      if (parsed.schema === STUDIO_WORK_SCHEMA) {
        return normalizeMetadata(parsed, design);
      }
    } catch {
      // Existing color analysis data may not be Studio Work metadata.
    }
  }

  const fallback = createEmptyStudioMetadata(
    design?.prompt?.slice(0, 24) || "未命名设计作品",
  );
  if (!design) return fallback;

  const image = design.selectedImage || design.images[0] || "";
  if (image) {
    const asset = createStudioAsset("pattern", {
      id: `${design.id}-pattern`,
      toolKey: "legacy-design",
      imageUrl: image,
      images: design.images.length ? design.images : [image],
      isFallback: false,
      generatedAt: design.createdAt.toISOString(),
    });
    fallback.assets.patterns = [asset];
    fallback.selectedAssets.patternResultId = asset.id;
    fallback.results.pattern = assetToResult(asset, "pattern");
    fallback.currentStep = "pattern_done";
    fallback.status = "saved";
  }
  if (design.productionImageUrl) {
    const asset = createStudioAsset("tryOn", {
      id: `${design.id}-tryon`,
      toolKey: "legacy-design",
      imageUrl: design.productionImageUrl,
      images: [design.productionImageUrl],
      isFallback: false,
      generatedAt: design.createdAt.toISOString(),
    });
    fallback.assets.tryOns = [asset];
    fallback.selectedAssets.tryOnResultId = asset.id;
    fallback.results.tryOn = assetToResult(asset, "tryOn");
    fallback.currentStep = "tryon_done";
  }
  if (design.vectorImageUrl) {
    const asset = createStudioAsset("sketch", {
      id: `${design.id}-sketch`,
      toolKey: "legacy-design",
      imageUrl: design.vectorImageUrl,
      images: [design.vectorImageUrl],
      isFallback: false,
      generatedAt: design.createdAt.toISOString(),
    });
    fallback.assets.sketches = [asset];
    fallback.selectedAssets.sketchResultId = asset.id;
    fallback.results.sketch = assetToResult(asset, "sketch");
    fallback.currentStep = "sketch_done";
  }
  fallback.config = {
    ...fallback.config,
    category: design.skirtType || fallback.config.category,
    garmentType: design.skirtType || fallback.config.garmentType,
    fabric: design.fabric || fallback.config.fabric,
    neckline: design.neckline || fallback.config.neckline,
    sleeveType: design.sleeveType || fallback.config.sleeveType,
    skirtLength: design.skirtLength || fallback.config.skirtLength,
  };
  fallback.updatedAt = design.updatedAt.toISOString();
  return fallback;
}

export function serializeStudioMetadata(metadata: StudioWorkMetadata): string {
  return JSON.stringify(metadata);
}

export function appendStudioAssets(
  metadata: StudioWorkMetadata,
  kind: StudioResultKind,
  inputs: StudioAssetInput[],
  options?: {
    selectedAssetId?: string;
    selectFirst?: boolean;
  },
): { metadata: StudioWorkMetadata; assets: StudioAsset[] } {
  const bucket = bucketForKind(kind);
  const now = new Date().toISOString();
  const assets = inputs
    .filter((input) => Boolean(input.imageUrl))
    .map((input, index) => createStudioAsset(assetKindForKind(kind), {
      ...input,
      id: input.id || `${assetKindForKind(kind)}-${Date.now()}-${index}`,
      toolKey: input.toolKey || input.tool || defaultToolForKind(kind),
      inputWorkId: input.inputWorkId,
      generatedAt: input.generatedAt || now,
    }));

  if (assets.length === 0) return { metadata, assets };

  let next: StudioWorkMetadata = {
    ...metadata,
    assets: {
      ...metadata.assets,
      [bucket]: [...metadata.assets[bucket], ...assets],
    },
    isFallback: metadata.isFallback || assets.some((asset) => asset.isFallback),
    status: kind === "tryOn" ? "saved" : metadata.status === "draft" ? "saved" : metadata.status,
    updatedAt: now,
  };

  const selectedAssetId =
    options?.selectedAssetId ||
    (options?.selectFirst !== false ? assets[0].id : selectedIdForKind(next.selectedAssets, kind));

  if (selectedAssetId) {
    next = selectStudioAsset(next, kind, selectedAssetId);
  } else {
    next.currentStep = stepForKind(kind);
  }

  return { metadata: next, assets };
}

export function addStudioResult(
  metadata: StudioWorkMetadata,
  result: StudioResult,
): StudioWorkMetadata {
  return appendStudioAssets(
    metadata,
    result.kind,
    [
      {
        id: result.id,
        toolKey: result.tool,
        imageUrl: result.imageUrl,
        images: result.images,
        prompt: result.prompt,
        provider: result.provider,
        model: result.model,
        isFallback: result.isFallback,
        generatedAt: result.createdAt,
        params: result.params,
        metadata: result.metadata,
      },
    ],
    { selectedAssetId: result.id },
  ).metadata;
}

export function selectStudioAsset(
  metadata: StudioWorkMetadata,
  kind: StudioResultKind,
  assetId: string,
): StudioWorkMetadata {
  const bucket = bucketForKind(kind);
  const asset = metadata.assets[bucket].find((item) => item.id === assetId);
  if (!asset) return metadata;

  const now = new Date().toISOString();
  const selectedAssets: StudioSelectedAssets = {
    ...metadata.selectedAssets,
    [selectedKeyForKind(kind)]: asset.id,
  };
  const results = {
    ...metadata.results,
    [kind]: assetToResult(asset, kind),
  };
  let currentStep = stepForKind(kind);
  let productionDraft = metadata.productionDraft;

  if (kind === "pattern" && metadata.selectedAssets.patternResultId && metadata.selectedAssets.patternResultId !== asset.id) {
    selectedAssets.downstreamMayNeedRefresh = true;
    selectedAssets.staleWarning = "你已更换当前印花，建议重新生成虚拟试穿预览。";
    productionDraft = productionDraft
      ? {
          ...productionDraft,
          note: "上游印花已更换，生产资料草案需要重新审核。",
          updatedAt: now,
        }
      : productionDraft;
  }
  if (kind === "seamless") {
    selectedAssets.downstreamMayNeedRefresh = false;
    selectedAssets.staleWarning = undefined;
    currentStep = "application_done";
  }

  const assets = kind === "tryOn"
    ? {
        ...metadata.assets,
        tryOns: metadata.assets.tryOns.map((item) => ({
          ...item,
          tryOnStatus: (item.id === asset.id
            ? "selected"
            : item.isFallback
              ? "fallback"
              : "generated") as StudioTryOnStatus,
        })),
      }
    : metadata.assets;

  return {
    ...metadata,
    assets,
    currentStep,
    status: "saved",
    selectedAssets,
    results,
    productionDraft,
    updatedAt: now,
  };
}

export function confirmStudioDesign(
  metadata: StudioWorkMetadata,
  input?: {
    config?: Partial<StudioWorkConfig>;
    customOrderDraft?: unknown;
    note?: string;
  },
): StudioWorkMetadata {
  const now = new Date().toISOString();
  const selectedTemplate = selectedGarmentTemplate(metadata);
  const customOrderDraft = normalizeCustomOrderDraft(input?.customOrderDraft, now);
  const productionDraft: StudioProductionDraft = {
    status: "draft",
    selectedPatternResultId: metadata.selectedAssets.patternResultId,
    selectedApplicationResultId: metadata.selectedAssets.applicationResultId,
    selectedTryOnResultId: metadata.selectedAssets.tryOnResultId,
    selectedSketchResultId: metadata.selectedAssets.sketchResultId,
    bodyProfileSnapshot: { ...metadata.bodyProfile },
    garmentTemplateSnapshot: selectedTemplate ? { ...selectedTemplate } : undefined,
    quantity: input?.config?.quantity || metadata.config.quantity || 1,
    size: input?.config?.size || metadata.config.size,
    neckline: input?.config?.neckline || metadata.config.neckline,
    sleeveLength: input?.config?.sleeveType || metadata.config.sleeveType,
    dressLength: input?.config?.skirtLength || metadata.config.skirtLength,
    customerNote: input?.config?.customerNote || metadata.config.customerNote || input?.note || "",
    sketchStatus: metadata.selectedAssets.sketchResultId ? "generated" : "pending_auto_generation",
    techPackStatus: "draft",
    factoryStatus: "not_sent",
    createdAt: metadata.productionDraft?.createdAt || now,
    updatedAt: now,
    note: input?.note || "设计已确认，生产资料草案等待后台审核。",
  };

  return {
    ...metadata,
    currentStep: "production_draft",
    status: "confirmed",
    config: { ...metadata.config, ...(input?.config || {}) },
    bodyProfile: {
      ...metadata.bodyProfile,
      usualSize: input?.config?.size || metadata.bodyProfile.usualSize || metadata.config.size,
    },
    customOrderDraft,
    productionDraft,
    productionSheet: {
      status: "draft",
      updatedAt: now,
    },
    updatedAt: now,
  };
}

export function resultFromInput(input: {
  kind: StudioResultKind;
  tool: string;
  resultType: string;
  imageUrl: string;
  images?: string[];
  isFallback?: boolean;
  prompt?: string;
  provider?: string;
  model?: string;
  params?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}): StudioResult {
  const now = new Date().toISOString();
  return {
    id: `${input.kind}-${Date.now()}`,
    kind: input.kind,
    tool: input.tool,
    resultType: input.resultType,
    imageUrl: input.imageUrl,
    images: input.images?.length ? input.images : [input.imageUrl],
    isFallback: Boolean(input.isFallback),
    createdAt: now,
    prompt: input.prompt,
    provider: input.provider,
    model: input.model,
    params: input.params,
    metadata: input.metadata,
  };
}

export function studioWorkToDTO(design: StudioDesign): StudioWorkDTO {
  const metadata = parseStudioMetadata(design.colorAnalysis, design);
  const previewImage = getPreviewImage(metadata, design);
  return {
    id: design.id,
    title: metadata.title || design.prompt || "未命名设计作品",
    currentStep: metadata.currentStep,
    status: metadata.status,
    createdAt: design.createdAt.toISOString(),
    updatedAt: design.updatedAt.toISOString(),
    previewImage,
    isFallback: metadata.isFallback,
    results: metadata.results,
    assets: metadata.assets,
    selectedAssets: metadata.selectedAssets,
    publicPatternFeedSnapshot: metadata.publicPatternFeedSnapshot,
    inspirationBoard: metadata.inspirationBoard,
    patternGenerationGroups: metadata.patternGenerationGroups,
    applicationGenerationGroups: metadata.applicationGenerationGroups,
    tryOnGenerationGroups: metadata.tryOnGenerationGroups,
    preferenceMemory: metadata.preferenceMemory,
    bodyProfile: metadata.bodyProfile,
    garmentTemplates: metadata.garmentTemplates,
    assetCounts: {
      patterns: metadata.assets.patterns.length,
      applications: metadata.assets.applications.length,
      tryOns: metadata.assets.tryOns.length,
      sketches: metadata.assets.sketches.length,
    },
    config: metadata.config,
    customOrderDraft: metadata.customOrderDraft,
    productionDraft: metadata.productionDraft,
    productionSheetStatus: metadata.productionSheet?.status ?? "draft",
    continueHref: hrefForStep(metadata.currentStep, design.id, false),
    nextHref: hrefForStep(metadata.currentStep, design.id, true),
    productionSheetHref: `/my-studio/production-sheet?workId=${encodeURIComponent(design.id)}`,
  };
}

export function hrefForStep(
  step: StudioCurrentStep,
  workId: string,
  next: boolean,
): string {
  if (step === "draft" || step === "created") return `/my-studio/pattern-generate?workId=${workId}`;
  if (step === "pattern_done") {
    return next
      ? `/my-studio/try-on?workId=${workId}`
      : `/my-studio/pattern-generate?workId=${workId}`;
  }
  if (step === "seamless_done" || step === "application_done") {
    return next
      ? `/my-studio/try-on?workId=${workId}`
      : `/my-studio/try-on?workId=${workId}`;
  }
  if (step === "tryon_done") {
    return next
      ? `/my-studio/confirm-design?workId=${workId}`
      : `/my-studio/try-on?workId=${workId}`;
  }
  return `/my-studio/production-sheet?workId=${workId}`;
}

export function uniqueImages(images: string[]): string[] {
  return Array.from(new Set(images.filter(Boolean))).slice(0, 60);
}

export function productionStatusLabel(status: ProductionSheetStatus): string {
  const labels: Record<ProductionSheetStatus, string> = {
    draft: "草案",
    pending_review: "待审核",
    approved_for_production: "已审核，可生产准备",
    approved_for_factory: "可发工厂",
    sent_to_factory: "已发工厂",
    rejected: "需要修改",
  };
  return labels[status];
}

export function assetKindForKind(kind: StudioResultKind): StudioAssetKind {
  if (kind === "seamless") return "application";
  if (kind === "tryOn") return "tryOn";
  if (kind === "sketch") return "sketch";
  return "pattern";
}

export function bucketForKind(kind: StudioResultKind): keyof StudioWorkAssets {
  if (kind === "seamless") return "applications";
  if (kind === "tryOn") return "tryOns";
  if (kind === "sketch") return "sketches";
  return "patterns";
}

function normalizeMetadata(
  metadata: Partial<StudioWorkMetadata>,
  design?: StudioDesign,
): StudioWorkMetadata {
  const fallback = createEmptyStudioMetadata(
    metadata.title || design?.prompt?.slice(0, 24) || "未命名设计作品",
  );
  const assets = normalizeAssets(metadata.assets);
  const bodyProfile = normalizeBodyProfile(metadata.bodyProfile);
  const garmentTemplates = normalizeGarmentTemplates(metadata.garmentTemplates);
  const selectedAssets: StudioSelectedAssets = {
    ...(metadata.selectedAssets || {}),
  };
  if (!selectedAssets.garmentTemplateId || !garmentTemplates.some((item) => item.id === selectedAssets.garmentTemplateId)) {
    selectedAssets.garmentTemplateId = garmentTemplates[0]?.id;
  }
  let results = metadata.results || {};

  const migrated = migrateResultsToAssets(results, assets);
  results = migrated.results;

  ensureSelected("pattern", migrated.assets, selectedAssets, results);
  ensureSelected("seamless", migrated.assets, selectedAssets, results);
  ensureSelected("tryOn", migrated.assets, selectedAssets, results);
  ensureSelected("sketch", migrated.assets, selectedAssets, results);

  return {
    ...fallback,
    ...metadata,
    schema: STUDIO_WORK_SCHEMA,
    title: metadata.title || fallback.title,
    currentStep: metadata.currentStep || fallback.currentStep,
    status: metadata.status || fallback.status,
    isFallback: Boolean(metadata.isFallback || hasFallbackAsset(migrated.assets)),
    createdFrom: metadata.createdFrom || fallback.createdFrom,
    isFallbackAllowed: metadata.isFallbackAllowed ?? fallback.isFallbackAllowed,
    config: { ...DEFAULT_STUDIO_CONFIG, ...(metadata.config || {}) },
    bodyProfile,
    garmentTemplates,
    assets: migrated.assets,
    selectedAssets,
    publicPatternFeedSnapshot: normalizePatternReferences(metadata.publicPatternFeedSnapshot),
    inspirationBoard: normalizePatternReferences(metadata.inspirationBoard).slice(0, 6),
    patternGenerationGroups: normalizePatternGroups(metadata.patternGenerationGroups),
    applicationGenerationGroups: normalizeApplicationGroups(metadata.applicationGenerationGroups),
    tryOnGenerationGroups: normalizeTryOnGroups(metadata.tryOnGenerationGroups),
    preferenceMemory: normalizePatternPreferenceMemory(metadata.preferenceMemory),
    customOrderDraft: normalizeCustomOrderDraft(metadata.customOrderDraft),
    productionDraft: metadata.productionDraft,
    results,
    productionSheet: {
      status: metadata.productionSheet?.status || "draft",
      updatedAt: metadata.productionSheet?.updatedAt || fallback.productionSheet.updatedAt,
    },
    updatedAt: metadata.updatedAt || design?.updatedAt.toISOString() || fallback.updatedAt,
  };
}

function createStudioAsset(kind: StudioAssetKind, input: StudioAssetInput): StudioAsset {
  const imageUrl = input.imageUrl;
  return {
    id: input.id || `${kind}-${Date.now()}`,
    resultType: kind,
    toolKey: input.toolKey || input.tool || defaultToolForAssetKind(kind),
    imageUrl,
    images: input.images?.length ? input.images : [imageUrl],
    prompt: input.prompt,
    provider: input.provider,
    model: input.model,
    isFallback: Boolean(input.isFallback),
    generatedAt: input.generatedAt || new Date().toISOString(),
    inputAssetId: input.inputAssetId,
    inputWorkId: input.inputWorkId,
    params: input.params,
    metadata: input.metadata,
    source: input.source,
    groupId: input.groupId,
    patternAssetId: input.patternAssetId,
    bodyProfileSnapshot: input.bodyProfileSnapshot,
    garmentTemplateSnapshot: input.garmentTemplateSnapshot,
    fitPreference: input.fitPreference,
    tryOnStatus: input.tryOnStatus,
    revisionReason: input.revisionReason,
    tryOnSource: input.tryOnSource,
  };
}

function assetToResult(asset: StudioAsset, kind: StudioResultKind): StudioResult {
  return {
    id: asset.id,
    kind,
    tool: asset.toolKey,
    resultType: resultTypeLabelForKind(kind),
    imageUrl: asset.imageUrl,
    images: asset.images,
    isFallback: asset.isFallback,
    createdAt: asset.generatedAt,
    prompt: asset.prompt,
    provider: asset.provider,
    model: asset.model,
    params: asset.params,
    metadata: asset.metadata,
  };
}

function selectedKeyForKind(kind: StudioResultKind): keyof StudioSelectedAssets {
  if (kind === "seamless") return "applicationResultId";
  if (kind === "tryOn") return "tryOnResultId";
  if (kind === "sketch") return "sketchResultId";
  return "patternResultId";
}

function selectedIdForKind(selected: StudioSelectedAssets, kind: StudioResultKind): string | undefined {
  return selected[selectedKeyForKind(kind)] as string | undefined;
}

function stepForKind(kind: StudioResultKind): StudioCurrentStep {
  if (kind === "seamless") return "application_done";
  if (kind === "tryOn") return "tryon_done";
  if (kind === "sketch") return "production_draft";
  return "pattern_done";
}

function defaultToolForKind(kind: StudioResultKind): string {
  if (kind === "seamless") return "seamless-tile";
  if (kind === "tryOn") return "pattern-apply";
  if (kind === "sketch") return "sketch-generate";
  return "pattern-generate";
}

function defaultToolForAssetKind(kind: StudioAssetKind): string {
  if (kind === "application") return "seamless-tile";
  if (kind === "tryOn") return "pattern-apply";
  if (kind === "sketch") return "sketch-generate";
  return "pattern-generate";
}

function resultTypeLabelForKind(kind: StudioResultKind): string {
  if (kind === "seamless") return "application_preview";
  if (kind === "tryOn") return "try_on_preview";
  if (kind === "sketch") return "production_sketch";
  return "pattern";
}

function normalizeAssets(value: unknown): StudioWorkAssets {
  const record = isRecord(value) ? value : {};
  return {
    patterns: arrayOfAssets(record.patterns),
    applications: arrayOfAssets(record.applications),
    tryOns: arrayOfAssets(record.tryOns),
    sketches: arrayOfAssets(record.sketches),
  };
}

function migrateResultsToAssets(
  results: Partial<Record<StudioResultKind, StudioResult>>,
  assets: StudioWorkAssets,
): { results: Partial<Record<StudioResultKind, StudioResult>>; assets: StudioWorkAssets } {
  const nextAssets = cloneAssets(assets);
  const nextResults = { ...results };
  (["pattern", "seamless", "tryOn", "sketch"] as StudioResultKind[]).forEach((kind) => {
    const result = nextResults[kind];
    const bucket = bucketForKind(kind);
    if (result && !nextAssets[bucket].some((asset) => asset.id === result.id)) {
      const asset = createStudioAsset(assetKindForKind(kind), {
        id: result.id,
        toolKey: result.tool,
        imageUrl: result.imageUrl,
        images: result.images,
        isFallback: result.isFallback,
        generatedAt: result.createdAt,
        prompt: result.prompt,
        provider: result.provider,
        model: result.model,
        params: result.params,
        metadata: result.metadata,
      });
      nextAssets[bucket].push(asset);
    }
  });
  return { assets: nextAssets, results: nextResults };
}

function ensureSelected(
  kind: StudioResultKind,
  assets: StudioWorkAssets,
  selectedAssets: StudioSelectedAssets,
  results: Partial<Record<StudioResultKind, StudioResult>>,
) {
  const bucket = bucketForKind(kind);
  const key = selectedKeyForKind(kind);
  const selectedId = selectedAssets[key] as string | undefined;
  const selectedAsset = assets[bucket].find((asset) => asset.id === selectedId) || assets[bucket][0];
  if (!selectedAsset) return;
  (selectedAssets as Record<string, unknown>)[key] = selectedAsset.id;
  results[kind] = assetToResult(selectedAsset, kind);
}

function getPreviewImage(metadata: StudioWorkMetadata, design: StudioDesign): string {
  return (
    selectedAsset(metadata, "tryOn")?.imageUrl ||
    selectedAsset(metadata, "seamless")?.imageUrl ||
    selectedAsset(metadata, "pattern")?.imageUrl ||
    selectedAsset(metadata, "sketch")?.imageUrl ||
    design.productionImageUrl ||
    design.selectedImage ||
    design.images[0] ||
    design.vectorImageUrl ||
    ""
  );
}

function selectedAsset(metadata: StudioWorkMetadata, kind: StudioResultKind): StudioAsset | undefined {
  const bucket = bucketForKind(kind);
  const id = selectedIdForKind(metadata.selectedAssets, kind);
  return metadata.assets[bucket].find((asset) => asset.id === id) || metadata.assets[bucket][0];
}

export function selectedGarmentTemplate(metadata: StudioWorkMetadata): StudioGarmentTemplate | undefined {
  const selectedId = metadata.selectedAssets.garmentTemplateId;
  return (
    metadata.garmentTemplates.find((item) => item.id === selectedId) ||
    metadata.garmentTemplates[0]
  );
}

function cloneAssets(assets: StudioWorkAssets): StudioWorkAssets {
  return {
    patterns: [...assets.patterns],
    applications: [...assets.applications],
    tryOns: [...assets.tryOns],
    sketches: [...assets.sketches],
  };
}

function arrayOfAssets(value: unknown): StudioAsset[] {
  return Array.isArray(value)
    ? value.filter((item): item is StudioAsset => isRecord(item) && typeof item.id === "string" && typeof item.imageUrl === "string")
    : [];
}

function hasFallbackAsset(assets: StudioWorkAssets): boolean {
  return [...assets.patterns, ...assets.applications, ...assets.tryOns, ...assets.sketches]
    .some((asset) => asset.isFallback);
}

export function normalizePatternReferences(value: unknown): StudioPatternReference[] {
  if (!Array.isArray(value)) return [];
  const refs: StudioPatternReference[] = [];
  value.filter(isRecord).forEach((item) => {
      const refId = stringValue(item.refId);
      const imageUrl = stringValue(item.imageUrl);
      if (!refId || !imageUrl) return;
      const sourceType =
        item.sourceType === "community_public" ||
        item.sourceType === "community_seed" ||
        item.sourceType === "official_seed" ||
        item.sourceType === "favorites"
        ? item.sourceType
        : "official_library";
      const usageMode = item.usageMode === "remix_only" ? "remix_only" : "direct_use";
      refs.push({
        refId,
        sourceType,
        imageUrl,
        title: stringValue(item.title) || undefined,
        tags: arrayOfStrings(item.tags),
        ownerUserId: stringValue(item.ownerUserId) || undefined,
        ownerName: stringValue(item.ownerName) || undefined,
        usageMode,
      });
    });
  return refs;
}

export function normalizeBodyProfile(value: unknown): StudioBodyProfile {
  const record = isRecord(value) ? value : {};
  const fitPreference =
    record.fitPreference === "slim" ||
    record.fitPreference === "relaxed" ||
    record.fitPreference === "regular"
      ? record.fitPreference
      : DEFAULT_BODY_PROFILE.fitPreference;
  return {
    heightCm: numberValue(record.heightCm),
    weightKg: numberValue(record.weightKg),
    shoulderCm: numberValue(record.shoulderCm),
    bustCm: numberValue(record.bustCm),
    waistCm: numberValue(record.waistCm),
    hipCm: numberValue(record.hipCm),
    usualSize: stringValue(record.usualSize) || DEFAULT_BODY_PROFILE.usualSize,
    bodyShape: stringValue(record.bodyShape) || DEFAULT_BODY_PROFILE.bodyShape,
    fitPreference,
    measurementMode: record.measurementMode === "detailed" ? "detailed" : "quick",
    updatedAt: stringValue(record.updatedAt) || undefined,
  };
}

export function normalizeGarmentTemplates(value: unknown): StudioGarmentTemplate[] {
  const templates: StudioGarmentTemplate[] = Array.isArray(value)
    ? value.filter(isRecord).map<StudioGarmentTemplate | null>((item) => {
        const id = stringValue(item.id);
        const name = stringValue(item.name);
        const silhouette = stringValue(item.silhouette);
        if (!id || !name || !silhouette) return null;
        const template: StudioGarmentTemplate = {
          id,
          name,
          silhouette,
          neckline: stringValue(item.neckline) || undefined,
          sleeve: stringValue(item.sleeve) || undefined,
          skirtLength: stringValue(item.skirtLength) || undefined,
          waistline: stringValue(item.waistline) || undefined,
          closure: stringValue(item.closure) || undefined,
        };
        return template;
      }).filter((item): item is StudioGarmentTemplate => Boolean(item))
    : [];
  return templates.length > 0
    ? templates
    : DEFAULT_GARMENT_TEMPLATES.map((item) => ({ ...item }));
}

export function normalizePatternGroups(value: unknown): StudioPatternGenerationGroup[] {
  if (!Array.isArray(value)) return [];
  const groups: StudioPatternGenerationGroup[] = [];
  value.filter(isRecord).forEach((item) => {
      const groupId = stringValue(item.groupId);
      if (!groupId) return;
      const sourceMode =
        item.sourceMode === "manual_prompt" || item.sourceMode === "direct_use"
          ? item.sourceMode
          : "remix_from_references";
      groups.push({
        groupId,
        generatedAt: stringValue(item.generatedAt) || new Date().toISOString(),
        sourceMode,
        refIds: arrayOfStrings(item.refIds),
        preferenceSnapshot: isRecord(item.preferenceSnapshot) ? item.preferenceSnapshot : undefined,
        resultIds: arrayOfStrings(item.resultIds),
      });
    });
  return groups;
}

export function normalizeApplicationGroups(value: unknown): StudioApplicationGenerationGroup[] {
  if (!Array.isArray(value)) return [];
  const groups: StudioApplicationGenerationGroup[] = [];
  value.filter(isRecord).forEach((item) => {
      const groupId = stringValue(item.groupId);
      if (!groupId) return;
      groups.push({
        groupId,
        generatedAt: stringValue(item.generatedAt) || new Date().toISOString(),
        sourcePatternResultId: stringValue(item.sourcePatternResultId) || undefined,
        preferenceSnapshot: isRecord(item.preferenceSnapshot) ? item.preferenceSnapshot : undefined,
        resultIds: arrayOfStrings(item.resultIds),
      });
    });
  return groups;
}

export function normalizeTryOnGroups(value: unknown): StudioTryOnGenerationGroup[] {
  if (!Array.isArray(value)) return [];
  const groups: StudioTryOnGenerationGroup[] = [];
  value.filter(isRecord).forEach((item) => {
      const groupId = stringValue(item.groupId);
      if (!groupId) return;
      groups.push({
        groupId,
        generatedAt: stringValue(item.generatedAt) || new Date().toISOString(),
        sourceApplicationResultId: stringValue(item.sourceApplicationResultId) || undefined,
        sourcePatternResultId: stringValue(item.sourcePatternResultId) || undefined,
        preferenceSnapshot: isRecord(item.preferenceSnapshot) ? item.preferenceSnapshot : undefined,
        resultIds: arrayOfStrings(item.resultIds),
      });
    });
  return groups;
}

export function normalizeCustomOrderDraft(
  value: unknown,
  fallbackUpdatedAt = new Date().toISOString(),
): StudioCustomOrderDraft | undefined {
  if (!isRecord(value)) return undefined;
  const rawOptions = isRecord(value.customizationOptions) ? value.customizationOptions : {};
  const rawPrice = isRecord(value.priceEstimate) ? value.priceEstimate : {};
  const rawAddress = isRecord(value.addressDraft) ? value.addressDraft : {};
  const rawGroup = isRecord(value.groupOrder) ? value.groupOrder : undefined;
  const orderMode = value.orderMode === "group" ? "group" : "single";
  const fitPreference: StudioFitPreference =
    rawOptions.fitPreference === "slim" || rawOptions.fitPreference === "relaxed"
      ? rawOptions.fitPreference
      : "regular";
  const targetCount =
    rawGroup?.targetCount === 5 || rawGroup?.targetCount === 10 ? rawGroup.targetCount : 3;

  const draft: StudioCustomOrderDraft = {
    orderMode,
    selectedPatternId: stringValue(value.selectedPatternId) || undefined,
    selectedTryOnId: stringValue(value.selectedTryOnId) || undefined,
    bodyProfileSnapshot: normalizeBodyProfile(value.bodyProfileSnapshot),
    garmentTemplateSnapshot: isRecord(value.garmentTemplateSnapshot)
      ? normalizeGarmentTemplates([value.garmentTemplateSnapshot])[0]
      : undefined,
    customizationOptions: {
      size: stringValue(rawOptions.size) || "M",
      quantity: numberValue(rawOptions.quantity) || 1,
      fabricOption: rawOptions.fabricOption === "premium" ? "premium" : "default",
      sleeve: stringValue(rawOptions.sleeve) || "短袖",
      skirtLength: stringValue(rawOptions.skirtLength) || "中长款",
      neckline: stringValue(rawOptions.neckline) || "圆领",
      fitPreference,
      note: stringValue(rawOptions.note) || undefined,
    },
    priceEstimate: {
      itemPrice: numberValue(rawPrice.itemPrice) || 0,
      customServiceFee: numberValue(rawPrice.customServiceFee) || 0,
      depositAmount: numberValue(rawPrice.depositAmount) || 0,
      finalPaymentEstimate: numberValue(rawPrice.finalPaymentEstimate) || 0,
      groupPrice: numberValue(rawPrice.groupPrice) || 0,
      currency: "CNY",
      productionCycleDays: numberValue(rawPrice.productionCycleDays),
    },
    addressDraft: {
      receiverName: stringValue(rawAddress.receiverName) || undefined,
      phone: stringValue(rawAddress.phone) || undefined,
      region: stringValue(rawAddress.region) || undefined,
      detail: stringValue(rawAddress.detail) || undefined,
      isDefault: Boolean(rawAddress.isDefault),
    },
    groupOrder: orderMode === "group"
      ? {
          targetCount,
          currentCount: numberValue(rawGroup?.currentCount) || 1,
          expiresInDays: numberValue(rawGroup?.expiresInDays) || 7,
          status: "pending",
          failPolicy: "refund_deposit_if_not_filled",
        }
      : undefined,
    publishOption: isRecord(value.publishOption)
      ? {
          publishToMarketplace: Boolean(value.publishOption.publishToMarketplace),
          commissionRate: numberValue(value.publishOption.commissionRate) || 0.1,
        }
      : undefined,
    status: value.status === "submitted" ? "submitted" : "draft",
    createdAt: stringValue(value.createdAt) || fallbackUpdatedAt,
    updatedAt: stringValue(value.updatedAt) || fallbackUpdatedAt,
  };
  return draft;
}

export function normalizePatternPreferenceMemory(value: unknown): StudioPatternPreferenceMemory {
  const record = isRecord(value) ? value : {};
  const rawApplicationPreview = isRecord(record.applicationPreview) ? record.applicationPreview : {};
  const applicationPreview: StudioApplicationPreviewPreference = {
    expression:
      rawApplicationPreview.expression === "accent" ||
      rawApplicationPreview.expression === "balanced" ||
      rawApplicationPreview.expression === "full"
        ? rawApplicationPreview.expression
        : "balanced",
    scale:
      rawApplicationPreview.scale === "small" ||
      rawApplicationPreview.scale === "medium" ||
      rawApplicationPreview.scale === "large"
        ? rawApplicationPreview.scale
        : "medium",
    mood:
      rawApplicationPreview.mood === "daily" ||
      rawApplicationPreview.mood === "elegant" ||
      rawApplicationPreview.mood === "bold"
        ? rawApplicationPreview.mood
        : "elegant",
  };
  const rawTryOnPreview = isRecord(record.tryOnPreview) ? record.tryOnPreview : {};
  const tryOnPreview: StudioTryOnPreviewPreference = {
    modelStyle:
      rawTryOnPreview.modelStyle === "commute" ||
      rawTryOnPreview.modelStyle === "resort" ||
      rawTryOnPreview.modelStyle === "evening"
        ? rawTryOnPreview.modelStyle
        : "commute",
    atmosphere:
      rawTryOnPreview.atmosphere === "studio" ||
      rawTryOnPreview.atmosphere === "natural-light" ||
      rawTryOnPreview.atmosphere === "city"
        ? rawTryOnPreview.atmosphere
        : "studio",
    framing:
      rawTryOnPreview.framing === "front" ||
      rawTryOnPreview.framing === "side" ||
      rawTryOnPreview.framing === "full-body"
        ? rawTryOnPreview.framing
        : "full-body",
  };
  return {
    selectedStyles: arrayOfStrings(record.selectedStyles),
    selectedColorFamilies: arrayOfStrings(record.selectedColorFamilies),
    selectedDensity: stringValue(record.selectedDensity) || DEFAULT_PATTERN_PREFERENCE_MEMORY.selectedDensity,
    selectedScale: stringValue(record.selectedScale) || DEFAULT_PATTERN_PREFERENCE_MEMORY.selectedScale,
    selectedMoodTags: arrayOfStrings(record.selectedMoodTags),
    freeTextNote: stringValue(record.freeTextNote),
    applicationPreview,
    tryOnPreview,
  };
}

function stringValue(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function numberValue(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  return undefined;
}

function arrayOfStrings(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0).map((item) => item.trim())
    : [];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}
