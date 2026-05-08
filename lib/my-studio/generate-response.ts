import type { StudioGenerateImage } from "./types";

export function generatedImageUrl(image: StudioGenerateImage | undefined): string {
  return typeof image === "string" ? image : image?.url ?? "";
}
