import type { HTMLAttributes, ReactNode } from "react";
import "./ui.css";

interface StatsCardProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  value: ReactNode;
  label: ReactNode;
  trend?: ReactNode;
  variant?: "card" | "plain";
}

export default function StatsCard({
  value,
  label,
  trend,
  variant = "card",
  className,
  ...rest
}: StatsCardProps) {
  const cls = [
    "ui-stats-card",
    variant === "plain" ? "ui-stats-card--plain" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <div className={cls} {...rest}>
      <div className="ui-stats-card__value">{value}</div>
      <div className="ui-stats-card__label">{label}</div>
      {trend ? <div className="ui-stats-card__trend">{trend}</div> : null}
    </div>
  );
}
