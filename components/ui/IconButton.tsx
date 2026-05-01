"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import "./ui.css";

export type IconButtonTone = "default" | "dark";

interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  tone?: IconButtonTone;
  label: string; // accessible label, becomes aria-label
  children: ReactNode; // the icon
}

export default function IconButton({
  tone = "default",
  label,
  className,
  children,
  ...rest
}: IconButtonProps) {
  const cls = [
    "ui-icon-btn",
    tone === "dark" ? "ui-icon-btn--dark" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <button type="button" aria-label={label} className={cls} {...rest}>
      {children}
    </button>
  );
}
