import type { HTMLAttributes, ReactNode } from "react";
import "./ui.css";

export type BadgeTone = "gold" | "neutral" | "dark" | "success";

interface BadgeProps extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  tone?: BadgeTone;
  children: ReactNode;
}

export default function Badge({ tone = "neutral", className, children, ...rest }: BadgeProps) {
  const cls = ["ui-badge", `ui-badge--${tone}`, className ?? ""].filter(Boolean).join(" ");
  return (
    <span className={cls} {...rest}>
      {children}
    </span>
  );
}
