"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface ImageUploaderProps {
  onUpload: (file: File) => void;
  label?: string;
  accept?: string;
  maxSizeMB?: number;
  currentImage?: string;
  onClear?: () => void;
}

export default function ImageUploader({
  onUpload,
  label = "上传参考图",
  accept = "image/*",
  maxSizeMB = 5,
  currentImage,
  onClear,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");

  const validate = useCallback(
    (file: File): boolean => {
      if (!file.type.startsWith("image/")) {
        setError("请选择图片文件");
        return false;
      }
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`图片需小于 ${maxSizeMB}MB`);
        return false;
      }
      setError("");
      return true;
    },
    [maxSizeMB]
  );

  const handleFile = useCallback(
    (file: File) => {
      if (validate(file)) onUpload(file);
    },
    [onUpload, validate]
  );

  useEffect(() => {
    function onPaste(e: ClipboardEvent) {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of Array.from(items)) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            e.preventDefault();
            handleFile(file);
            return;
          }
        }
      }
    }
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [handleFile]);

  if (currentImage) {
    return (
      <div
        className="relative overflow-hidden rounded-2xl border"
        style={{ borderColor: "#5C3A4F", backgroundColor: "#44283A" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={currentImage}
          alt="uploaded"
          className="block h-auto w-full object-contain"
          style={{ maxHeight: 320 }}
        />
        {onClear && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-2 top-2 rounded-full px-2.5 py-1 text-xs font-medium transition hover:opacity-80"
            style={{ backgroundColor: "rgba(45,27,38,0.85)", color: "#F4EFE6" }}
          >
            移除
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const file = e.dataTransfer.files?.[0];
          if (file) handleFile(file);
        }}
        className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-10 text-center transition"
        style={{
          borderColor: dragging ? "#C8A875" : "#5C3A4F",
          backgroundColor: "#44283A",
          color: "#F4EFE6",
        }}
      >
        <svg
          viewBox="0 0 24 24"
          width="28"
          height="28"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ color: "#C8A875" }}
          aria-hidden
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs" style={{ color: "#987283" }}>
          拖拽图片到此处，或点击上传，也可 Ctrl+V 粘贴 · ≤ {maxSizeMB}MB
        </div>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
      {error && (
        <p className="mt-2 text-xs" style={{ color: "#B65A4A" }}>
          {error}
        </p>
      )}
    </div>
  );
}
