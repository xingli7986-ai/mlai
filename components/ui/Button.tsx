"use client";

import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import "./ui.css";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "md" | "sm" | "lg";

interface CommonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  loading?: boolean;
  loadingLabel?: string;
  className?: string;
  children: ReactNode;
}

type ButtonAsButton = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> & {
    as?: "button";
    href?: undefined;
  };

type ButtonAsLink = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "children" | "href"> & {
    as?: "a";
    href: string;
  };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

function classes({
  variant = "primary",
  size = "md",
  block,
  className,
}: Pick<CommonProps, "variant" | "size" | "block" | "className">) {
  return [
    "ui-btn",
    `ui-btn--${variant}`,
    size === "sm" ? "ui-btn--sm" : "",
    size === "lg" ? "ui-btn--lg" : "",
    block ? "ui-btn--block" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");
}

export default function Button(props: ButtonProps) {
  const {
    variant = "primary",
    size = "md",
    block,
    loading = false,
    loadingLabel,
    className,
    children,
    ...rest
  } = props as CommonProps & { href?: string };

  const cls = classes({ variant, size, block, className });
  const content = loading ? (
    <>
      <span className="ui-btn__spinner" aria-hidden />
      <span>{loadingLabel ?? children}</span>
    </>
  ) : (
    children
  );

  if ("href" in rest && rest.href) {
    const { href, ...anchorRest } = rest as AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };
    return (
      <Link
        href={href}
        className={cls}
        data-loading={loading || undefined}
        aria-disabled={loading || undefined}
        {...anchorRest}
      >
        {content}
      </Link>
    );
  }

  const { disabled, ...buttonRest } = rest as ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button
      type="button"
      className={cls}
      disabled={disabled || loading}
      data-loading={loading || undefined}
      {...buttonRest}
    >
      {content}
    </button>
  );
}
