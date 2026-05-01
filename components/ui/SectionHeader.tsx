import type { HTMLAttributes, ReactNode } from "react";
import "./ui.css";

interface SectionHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, "title" | "children"> {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  as?: "h1" | "h2" | "h3";
  children?: ReactNode;
}

export default function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
  as = "h2",
  className,
  children,
  ...rest
}: SectionHeaderProps) {
  const Heading = as;
  const cls = [
    "ui-section-header",
    align === "center" ? "ui-section-header--center" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cls} {...rest}>
      {eyebrow ? <p className="ui-section-header__eyebrow">{eyebrow}</p> : null}
      <Heading className="ui-section-header__title">{title}</Heading>
      {description ? <p className="ui-section-header__description">{description}</p> : null}
      {children}
    </div>
  );
}
