export type StudioResultKind = "pattern" | "seamless" | "tryOn" | "sketch";

export type StudioAssetKind = "pattern" | "application" | "tryOn" | "sketch";

export type StudioCurrentStep =
  | "draft"
  | "created"
  | "pattern_done"
  | "seamless_done"
  | "application_done"
  | "tryon_done"
  | "sketch_done"
  | "confirmed"
  | "production_draft"
  | "pending_review"
  | "approved_for_production"
  | "production_sheet_done";

export type ProductionSheetStatus =
  | "draft"
  | "pending_review"
  | "approved_for_production"
  | "approved_for_factory"
  | "sent_to_factory"
  | "rejected";

export interface StudioAsset {
  id: string;
  resultType: StudioAssetKind;
  toolKey: string;
  imageUrl: string;
  images: string[];
  prompt?: string;
  provider?: string;
  model?: string;
  isFallback: boolean;
  generatedAt: string;
  inputAssetId?: string;
  inputWorkId?: string;
  params?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  source?: StudioPatternAssetSource;
  groupId?: string;
  patternAssetId?: string;
  bodyProfileSnapshot?: StudioBodyProfile;
  garmentTemplateSnapshot?: StudioGarmentTemplate;
  fitPreference?: StudioFitPreference;
  tryOnStatus?: StudioTryOnStatus;
  revisionReason?: string;
  tryOnSource?: StudioTryOnSource;
  fidelityMode?: TryOnFidelityMode;
  referenceMode?: TryOnReferenceMode;
  patternReferenceUsed?: boolean;
  maskUsed?: boolean;
  isProductionReady?: boolean;
  fidelityWarnings?: string[];
  qualityScores?: TryOnQualityScores;
  sourcePatternTileId?: string;
  sourceGarmentTemplateId?: string;
  sourceModelBaseId?: string;
}

export type StudioFitPreference = "slim" | "regular" | "relaxed";

export interface StudioBodyProfile {
  heightCm?: number;
  weightKg?: number;
  shoulderCm?: number;
  bustCm?: number;
  waistCm?: number;
  hipCm?: number;
  usualSize?: string;
  bodyShape?: string;
  fitPreference?: StudioFitPreference;
  measurementMode?: "quick" | "detailed";
  updatedAt?: string;
}

export interface StudioGarmentTemplate {
  id: string;
  name: string;
  silhouette: string;
  neckline?: string;
  sleeve?: string;
  skirtLength?: string;
  waistline?: string;
  closure?: string;
}

export type StudioTryOnStatus = "generated" | "selected" | "fallback";

export type StudioTryOnSource =
  | "direct-pattern-try-on"
  | "remix-pattern-try-on"
  | "regenerate-fit";

export type TryOnFidelityMode = "approximate" | "reference_image" | "masked_garment_tryon";

export type TryOnReferenceMode = "prompt_url_only" | "true_image_reference" | "masked_tryon";

export type TryOnProviderCapability = {
  provider: string;
  model?: string;
  supportsTextToImage: boolean;
  supportsImageReference: boolean;
  supportsImageEdit: boolean;
  supportsMask: boolean;
  supportsGarmentTryOn: boolean;
  supportsPoseControl: boolean;
  supportsMultiImageInput: boolean;
  notes?: string[];
};

export type PatternTileAsset = {
  id: string;
  sourcePatternAssetId: string;
  imageUrl: string;
  tileUrl?: string;
  thumbnailUrl?: string;
  repeatMode: "seamless" | "block" | "placement" | "unknown";
  scale?: "small" | "medium" | "large";
  density?: "sparse" | "medium" | "dense";
  colorProfile?: {
    palette?: string[];
    backgroundTone?: string;
    contrast?: "low" | "medium" | "high";
  };
  fidelityReady: boolean;
  createdAt: string;
};

export type GarmentTemplateAsset = {
  id: string;
  name: string;
  garmentType: "dress" | "top" | "skirt" | "set";
  silhouette: "wrap" | "a-line" | "sheath" | "straight" | "fit-and-flare" | "unknown";
  neckline?: string;
  sleeveLength?: string;
  dressLength?: string;
  waistline?: string;
  closure?: "wrap-front" | "zipper" | "buttons" | "pullover" | "unknown";
  templateImageUrl?: string;
  flatSketchUrl?: string;
  frontTemplateUrl?: string;
  backTemplateUrl?: string;
  garmentRegionMaskUrl?: string;
  controlImageUrl?: string;
  poseCompatibility?: string[];
  fidelityReady: boolean;
  createdAt: string;
};

export type ModelBaseAsset = {
  id: string;
  bodyProfileSnapshot: StudioBodyProfile;
  pose: "front_full_body" | "slight_angle_full_body" | "side" | "back";
  fullBodyImageUrl?: string;
  segmentationMaskUrl?: string;
  poseControlUrl?: string;
  bodyShapeCategory?: string;
  fidelityReady: boolean;
  createdAt: string;
};

export type HighFidelityTryOnJob = {
  id: string;
  workId: string;
  status: "draft" | "queued" | "processing" | "succeeded" | "failed" | "degraded";
  patternTileAssetId?: string;
  garmentTemplateAssetId?: string;
  modelBaseAssetId?: string;
  bodyProfileSnapshot: StudioBodyProfile;
  fidelityMode: TryOnFidelityMode;
  referenceMode: TryOnReferenceMode;
  provider?: string;
  model?: string;
  prompt?: string;
  negativePrompt?: string;
  controlInputs?: {
    patternImageUrl?: string;
    garmentTemplateUrl?: string;
    garmentRegionMaskUrl?: string;
    modelBaseImageUrl?: string;
    poseControlUrl?: string;
  };
  warnings: string[];
  createdAt: string;
  updatedAt: string;
};

export type TryOnQualityScores = {
  printFidelity?: number;
  silhouetteFidelity?: number;
  fullBody?: number;
  realism?: number;
  bodyProportion?: number;
  scoreMethod?: "rule_placeholder" | "model_assessment";
};

export type HighFidelityTryOnAsset = {
  id: string;
  imageUrl: string;
  sourcePatternTileId?: string;
  sourcePatternAssetId?: string;
  sourceGarmentTemplateId?: string;
  sourceModelBaseId?: string;
  bodyProfileSnapshot: StudioBodyProfile;
  garmentTemplateSnapshot?: GarmentTemplateAsset;
  fidelityMode: TryOnFidelityMode;
  referenceMode: TryOnReferenceMode;
  patternReferenceUsed: boolean;
  maskUsed: boolean;
  isProductionReady: boolean;
  scores?: TryOnQualityScores;
  warnings: string[];
  createdAt: string;
};

export type StudioPatternSourceType =
  | "ai_generated"
  | "official_direct_use"
  | "community_direct_use"
  | "community_remix"
  | "official_remix"
  | "remix_from_references";

export interface StudioPatternAssetSource {
  type: StudioPatternSourceType;
  refId?: string;
  refIds?: string[];
  publicAssetId?: string;
  ownerUserId?: string;
  ownerName?: string;
  sourceType?: string;
}

export interface StudioPatternReference {
  refId: string;
  sourceType: "official_library" | "official_seed" | "community_public" | "community_seed" | "favorites";
  imageUrl: string;
  title?: string;
  tags?: string[];
  ownerUserId?: string;
  ownerName?: string;
  usageMode?: "direct_use" | "remix_only";
}

export interface StudioPatternGenerationGroup {
  groupId: string;
  generatedAt: string;
  sourceMode: "remix_from_references" | "manual_prompt" | "direct_use";
  refIds: string[];
  preferenceSnapshot?: Record<string, unknown>;
  resultIds: string[];
}

export interface StudioApplicationGenerationGroup {
  groupId: string;
  generatedAt: string;
  sourcePatternResultId?: string;
  preferenceSnapshot?: Record<string, unknown>;
  resultIds: string[];
}

export interface StudioTryOnGenerationGroup {
  groupId: string;
  generatedAt: string;
  sourceApplicationResultId?: string;
  sourcePatternResultId?: string;
  preferenceSnapshot?: Record<string, unknown>;
  resultIds: string[];
}

export interface StudioApplicationPreviewPreference {
  expression: "accent" | "balanced" | "full";
  scale: "small" | "medium" | "large";
  mood: "daily" | "elegant" | "bold";
}

export interface StudioTryOnPreviewPreference {
  modelStyle: "commute" | "resort" | "evening";
  atmosphere: "studio" | "natural-light" | "city";
  framing: "front" | "side" | "full-body";
}

export interface StudioPatternPreferenceMemory {
  selectedStyles: string[];
  selectedColorFamilies: string[];
  selectedDensity: string;
  selectedScale: string;
  selectedMoodTags: string[];
  freeTextNote: string;
  applicationPreview?: StudioApplicationPreviewPreference;
  tryOnPreview?: StudioTryOnPreviewPreference;
}

export interface StudioSelectedAssets {
  patternResultId?: string;
  applicationResultId?: string;
  tryOnResultId?: string;
  sketchResultId?: string;
  garmentTemplateId?: string;
  downstreamMayNeedRefresh?: boolean;
  staleWarning?: string;
}

export interface StudioProductionDraft {
  status: "draft" | "pending_review" | "approved_for_production" | "rejected";
  selectedPatternResultId?: string;
  selectedApplicationResultId?: string;
  selectedTryOnResultId?: string;
  selectedSketchResultId?: string;
  bodyProfileSnapshot?: StudioBodyProfile;
  garmentTemplateSnapshot?: StudioGarmentTemplate;
  quantity?: number;
  size?: string;
  neckline?: string;
  sleeveLength?: string;
  dressLength?: string;
  customerNote?: string;
  sourcePatternTileId?: string;
  sourceGarmentTemplateId?: string;
  sourceModelBaseId?: string;
  fidelityMode?: TryOnFidelityMode;
  isProductionReady?: boolean;
  fidelityWarnings?: string[];
  sketchStatus: "pending_auto_generation" | "generated_fallback" | "generated" | "not_started";
  techPackStatus: "draft" | "not_started";
  factoryStatus: "not_sent" | "sent";
  createdAt?: string;
  updatedAt: string;
  note?: string;
}

export type StudioOrderMode = "single" | "group";
export type StudioCustomOrderStatus = "draft" | "submitted";
export type StudioFabricOption = "default" | "premium";

export interface StudioCustomizationOptions {
  size: string;
  quantity: number;
  fabricOption: StudioFabricOption;
  sleeve: string;
  skirtLength: string;
  neckline: string;
  fitPreference: StudioFitPreference;
  note?: string;
}

export interface StudioPriceEstimate {
  itemPrice: number;
  customServiceFee: number;
  depositAmount: number;
  finalPaymentEstimate: number;
  groupPrice: number;
  currency: "CNY";
  productionCycleDays?: number;
}

export interface StudioAddressDraft {
  receiverName?: string;
  phone?: string;
  region?: string;
  detail?: string;
  isDefault?: boolean;
}

export interface StudioGroupOrderDraft {
  targetCount: 3 | 5 | 10;
  currentCount: number;
  expiresInDays: number;
  status: "pending";
  failPolicy: "refund_deposit_if_not_filled";
}

export interface StudioPublishOption {
  publishToMarketplace: boolean;
  commissionRate: number;
}

export interface StudioCustomOrderDraft {
  orderMode: StudioOrderMode;
  selectedPatternId?: string;
  selectedTryOnId?: string;
  bodyProfileSnapshot?: StudioBodyProfile;
  garmentTemplateSnapshot?: StudioGarmentTemplate;
  customizationOptions: StudioCustomizationOptions;
  priceEstimate: StudioPriceEstimate;
  addressDraft: StudioAddressDraft;
  groupOrder?: StudioGroupOrderDraft;
  publishOption?: StudioPublishOption;
  status: StudioCustomOrderStatus;
  createdAt?: string;
  updatedAt: string;
}

export interface StudioResult {
  id: string;
  kind: StudioResultKind;
  tool: string;
  resultType: string;
  imageUrl: string;
  images: string[];
  isFallback: boolean;
  createdAt: string;
  prompt?: string;
  provider?: string;
  model?: string;
  params?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface StudioWorkConfig {
  category: string;
  garmentType: string;
  silhouette: string;
  occasion: string;
  neckline: string;
  sleeveType: string;
  skirtLength: string;
  waistline: string;
  size: string;
  quantity: number;
  fabric: string;
  printMethod: string;
  printPlacement: string;
  customerNote: string;
  craftNote: string;
}

export interface StudioWorkAssets {
  patterns: StudioAsset[];
  applications: StudioAsset[];
  tryOns: StudioAsset[];
  sketches: StudioAsset[];
}

export interface StudioFidelityAssets {
  patternTiles: PatternTileAsset[];
  garmentTemplates: GarmentTemplateAsset[];
  modelBases: ModelBaseAsset[];
  tryOnJobs: HighFidelityTryOnJob[];
}

export interface StudioWorkMetadata {
  schema: "studio-work-v1";
  title: string;
  currentStep: StudioCurrentStep;
  status: "draft" | "saved" | "ready_for_sheet" | "confirmed";
  isFallback: boolean;
  createdFrom?: string;
  isFallbackAllowed?: boolean;
  config: StudioWorkConfig;
  bodyProfile: StudioBodyProfile;
  garmentTemplates: StudioGarmentTemplate[];
  assets: StudioWorkAssets;
  selectedAssets: StudioSelectedAssets;
  publicPatternFeedSnapshot?: StudioPatternReference[];
  inspirationBoard: StudioPatternReference[];
  patternGenerationGroups: StudioPatternGenerationGroup[];
  applicationGenerationGroups: StudioApplicationGenerationGroup[];
  tryOnGenerationGroups: StudioTryOnGenerationGroup[];
  preferenceMemory: StudioPatternPreferenceMemory;
  fidelityAssets?: StudioFidelityAssets;
  providerCapabilities?: TryOnProviderCapability[];
  customOrderDraft?: StudioCustomOrderDraft;
  productionDraft?: StudioProductionDraft;
  results: Partial<Record<StudioResultKind, StudioResult>>;
  productionSheet: {
    status: ProductionSheetStatus;
    updatedAt: string;
  };
  updatedAt: string;
}

export interface StudioAssetCounts {
  patterns: number;
  applications: number;
  tryOns: number;
  sketches: number;
}

export interface StudioWorkDTO {
  id: string;
  title: string;
  currentStep: StudioCurrentStep;
  status: StudioWorkMetadata["status"];
  createdAt: string;
  updatedAt: string;
  previewImage: string;
  isFallback: boolean;
  results: Partial<Record<StudioResultKind, StudioResult>>;
  assets: StudioWorkAssets;
  selectedAssets: StudioSelectedAssets;
  publicPatternFeedSnapshot?: StudioPatternReference[];
  inspirationBoard: StudioPatternReference[];
  patternGenerationGroups: StudioPatternGenerationGroup[];
  applicationGenerationGroups: StudioApplicationGenerationGroup[];
  tryOnGenerationGroups: StudioTryOnGenerationGroup[];
  preferenceMemory: StudioPatternPreferenceMemory;
  fidelityAssets?: StudioFidelityAssets;
  providerCapabilities?: TryOnProviderCapability[];
  assetCounts: StudioAssetCounts;
  config: StudioWorkConfig;
  bodyProfile: StudioBodyProfile;
  garmentTemplates: StudioGarmentTemplate[];
  customOrderDraft?: StudioCustomOrderDraft;
  productionDraft?: StudioProductionDraft;
  productionSheetStatus: ProductionSheetStatus;
  continueHref: string;
  nextHref: string;
  productionSheetHref: string;
}

export interface StudioGenerateImageObject {
  id?: string;
  url: string;
}

export type StudioGenerateImage = string | StudioGenerateImageObject;

export interface StudioGenerateResponse {
  success: boolean;
  ok?: boolean;
  code?: string;
  canDegrade?: boolean;
  tool?: string;
  imageUrl?: string;
  images?: StudioGenerateImage[];
  resultType?: string;
  provider?: string;
  model?: string;
  metadata?: Record<string, unknown>;
  isFallback?: boolean;
  fidelityMode?: TryOnFidelityMode;
  referenceMode?: TryOnReferenceMode;
  patternReferenceUsed?: boolean;
  maskUsed?: boolean;
  isProductionReady?: boolean;
  warnings?: string[];
  providerCapability?: TryOnProviderCapability;
  jobId?: string;
  message?: string;
  error?: string;
  used?: number;
  limit?: number;
}
