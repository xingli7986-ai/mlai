import type {
  GarmentImageAsset,
  ModelBaseAsset,
  StudioAsset,
  StudioBodyProfile,
  StudioGarmentTemplate,
} from "@/lib/my-studio/types";

const DEFAULT_MODEL_BASE_IMAGE = "/assets/my-studio/05_try_on_results/tryon-floral-fullbody-front-1080x1440.png";

export function prepareGarmentImageAsset(input: {
  selectedPattern: Pick<StudioAsset, "id" | "imageUrl">;
  garmentTemplate?: StudioGarmentTemplate | Record<string, unknown>;
  existing?: GarmentImageAsset[];
}): { asset: GarmentImageAsset; warnings: string[] } {
  const garmentTemplateId = readString(input.garmentTemplate, "id");
  const existing = input.existing?.find(
    (asset) =>
      asset.sourcePatternAssetId === input.selectedPattern.id &&
      (!garmentTemplateId || asset.garmentTemplateId === garmentTemplateId),
  );
  if (existing) return { asset: existing, warnings: [] };

  const now = new Date().toISOString();
  return {
    asset: {
      id: `garment-image-${input.selectedPattern.id}-${garmentTemplateId || "template"}`,
      imageUrl: input.selectedPattern.imageUrl,
      sourcePatternAssetId: input.selectedPattern.id,
      garmentTemplateId,
      garmentImageSource: "placeholder_template",
      fidelityReady: Boolean(input.selectedPattern.imageUrl),
      createdAt: now,
    },
    warnings: ["当前服装图为印花参考占位，后续需替换为真实版型服装图。"],
  };
}

export function selectModelBaseAsset(
  bodyProfile?: StudioBodyProfile | Record<string, unknown>,
): { asset: ModelBaseAsset; warnings: string[] } {
  const height = readNumber(bodyProfile, "heightCm");
  const weight = readNumber(bodyProfile, "weightKg");
  const usualSize = readString(bodyProfile, "usualSize");
  const now = new Date().toISOString();
  const bodyShapeCategory = inferBodyShape(height, weight);

  return {
    asset: {
      id: `standard-model-${bodyShapeCategory}-${usualSize || "M"}`,
      bodyProfileSnapshot: {
        ...(bodyProfile as StudioBodyProfile | undefined),
        heightCm: height,
        weightKg: weight,
        usualSize,
        bodyShape: readString(bodyProfile, "bodyShape") || bodyShapeCategory,
      },
      pose: "front_full_body",
      fullBodyImageUrl: DEFAULT_MODEL_BASE_IMAGE,
      bodyShapeCategory,
      modelBaseSource: "standard_model_library",
      fidelityReady: true,
      createdAt: now,
    },
    warnings: ["当前使用标准模特底图，非本人照片。"],
  };
}

function readString(value: unknown, key: string): string | undefined {
  if (!value || typeof value !== "object") return undefined;
  const result = (value as Record<string, unknown>)[key];
  return typeof result === "string" && result.trim() ? result : undefined;
}

function readNumber(value: unknown, key: string): number | undefined {
  if (!value || typeof value !== "object") return undefined;
  const result = (value as Record<string, unknown>)[key];
  return typeof result === "number" && Number.isFinite(result) ? result : undefined;
}

function inferBodyShape(heightCm?: number, weightKg?: number): string {
  if (!heightCm || !weightKg) return "regular";
  const bmi = weightKg / Math.pow(heightCm / 100, 2);
  if (!Number.isFinite(bmi)) return "regular";
  if (bmi < 18.5) return "slim";
  if (bmi < 24) return "regular";
  return "curvy";
}
