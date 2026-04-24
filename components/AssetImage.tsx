"use client";

import { useState } from "react";

type AssetImageProps = {
  src: string;
  alt: string;
  className?: string;
  tone?: string;
  label?: string;
};

export default function AssetImage({
  src,
  alt,
  className = "",
  tone = "ink",
  label,
}: AssetImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`${className} asset-fallback pattern-${tone}`}
        aria-label={alt}
        role="img"
      >
        <span>{label ?? "MaxLuLu"}</span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
