import type { CSSProperties, HTMLAttributes } from "react";
import "./ui.css";

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  width?: number | string;
  height?: number | string;
  radius?: number | string;
  circle?: boolean;
}

export default function Skeleton({
  width,
  height,
  radius,
  circle,
  style,
  className,
  ...rest
}: SkeletonProps) {
  const composed: CSSProperties = {
    width,
    height,
    borderRadius: circle ? "999px" : radius,
    ...style,
  };
  return (
    <div
      className={["ui-skeleton", className ?? ""].filter(Boolean).join(" ")}
      style={composed}
      aria-hidden
      {...rest}
    />
  );
}
