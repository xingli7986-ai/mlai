import type { HTMLAttributes, ReactNode } from "react";
import "./ui.css";

export type CardVariant = "default" | "soft" | "flat";

interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  variant?: CardVariant;
  hover?: boolean;
  children: ReactNode;
}

export default function Card({
  variant = "default",
  hover = false,
  className,
  children,
  ...rest
}: CardProps) {
  const cls = [
    "ui-card",
    variant === "soft" ? "ui-card--soft" : "",
    variant === "flat" ? "ui-card--flat" : "",
    hover ? "ui-card--hover" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cls} {...rest}>
      {children}
    </div>
  );
}
