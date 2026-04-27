"use client";

export type StudioModel = "gpt-image-2" | "gemini";

export interface StudioRequest {
  tool: string;
  model?: StudioModel;
  prompt?: string;
  params?: Record<string, unknown>;
  images?: string[];
  count?: number;
  size?: string;
}

export interface StudioImage {
  url: string;
  width?: number;
  height?: number;
}

export interface StudioResponse {
  success: boolean;
  images?: StudioImage[];
  error?: string;
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export async function generateImages(payload: StudioRequest): Promise<StudioResponse> {
  try {
    const res = await fetch("/api/ai-studio/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await res.json()) as StudioResponse;
    if (!res.ok && data.success !== false) {
      return { success: false, error: `HTTP ${res.status}` };
    }
    return data;
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "网络错误",
    };
  }
}

export function downloadImage(url: string) {
  if (typeof window === "undefined") return;
  window.open(url, "_blank", "noopener,noreferrer");
}
