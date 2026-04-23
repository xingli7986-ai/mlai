"use client";

import { useEffect, useState } from "react";

interface ResultImage {
  url: string;
  width?: number;
  height?: number;
}

interface ResultGalleryProps {
  images: ResultImage[];
  loading?: boolean;
  onDownload?: (url: string) => void;
  onSelect?: (url: string) => void;
  selectedUrl?: string;
}

const LOADING_MESSAGES = [
  "AI 正在构思画面...",
  "调整色彩与构图...",
  "添加细节与纹理...",
  "渲染中，马上好...",
];

export default function ResultGallery({
  images,
  loading,
  onDownload,
  onSelect,
  selectedUrl,
}: ResultGalleryProps) {
  const [msgIdx, setMsgIdx] = useState(0);
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    if (!loading) return;
    const id = setInterval(
      () => setMsgIdx((i) => (i + 1) % LOADING_MESSAGES.length),
      2200
    );
    return () => clearInterval(id);
  }, [loading]);

  if (loading) {
    return (
      <div className="space-y-4">
        <p
          className="text-sm"
          style={{ color: "#C8A875" }}
        >
          {LOADING_MESSAGES[msgIdx]}
        </p>
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="aspect-square animate-pulse rounded-xl"
              style={{
                backgroundColor: "#44283A",
                animationDelay: `${i * 150}ms`,
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (images.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {images.map((img) => {
          const selected = selectedUrl === img.url;
          return (
            <div
              key={img.url}
              className="group relative aspect-square overflow-hidden rounded-xl border-2"
              style={{
                backgroundColor: "#44283A",
                borderColor: selected ? "#C8A875" : "transparent",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt="result"
                className="h-full w-full cursor-zoom-in object-cover transition"
                onClick={() => setLightbox(img.url)}
              />
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-end gap-1.5 p-2 opacity-0 transition group-hover:pointer-events-auto group-hover:opacity-100"
                style={{
                  background:
                    "linear-gradient(to top, rgba(45,27,38,0.85), transparent)",
                }}
              >
                {onSelect && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(img.url);
                    }}
                    className="rounded-full px-2.5 py-1 text-xs font-medium transition"
                    style={{
                      backgroundColor: selected ? "#C8A875" : "#2D1B26",
                      color: selected ? "#2D1B26" : "#F4EFE6",
                    }}
                  >
                    {selected ? "已选" : "选中"}
                  </button>
                )}
                {onDownload && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDownload(img.url);
                    }}
                    className="rounded-full px-2.5 py-1 text-xs font-medium transition"
                    style={{ backgroundColor: "#2D1B26", color: "#F4EFE6" }}
                  >
                    下载
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ backgroundColor: "rgba(0,0,0,0.85)" }}
          onClick={() => setLightbox(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightbox}
            alt="preview"
            className="max-h-full max-w-full object-contain"
          />
          <button
            type="button"
            onClick={() => setLightbox(null)}
            className="absolute right-4 top-4 rounded-full px-3 py-1 text-sm"
            style={{ backgroundColor: "#44283A", color: "#F4EFE6" }}
          >
            关闭
          </button>
        </div>
      )}
    </>
  );
}
