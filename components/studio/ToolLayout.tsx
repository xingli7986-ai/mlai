import Link from "next/link";
import type { ReactNode } from "react";

interface ToolLayoutProps {
  title: string;
  description: string;
  toolNumber: string;
  section?: "pattern" | "fashion";
  children: ReactNode;
}

const SECTION_LABEL: Record<"pattern" | "fashion", string> = {
  pattern: "图案工作室",
  fashion: "服装实验室",
};

export default function ToolLayout({
  title,
  description,
  toolNumber,
  section,
  children,
}: ToolLayoutProps) {
  return (
    <div className="mx-auto max-w-6xl pb-16">
      <nav
        className="flex items-center gap-1.5 text-xs sm:text-sm"
        style={{ color: "#987283" }}
      >
        <Link href="/studio" className="transition hover:text-[#C8A875]">
          AI Studio
        </Link>
        {section && (
          <>
            <span>/</span>
            <span>{SECTION_LABEL[section]}</span>
          </>
        )}
        <span>/</span>
        <span style={{ color: "#F4EFE6" }}>{title}</span>
      </nav>

      <div className="mt-4 flex flex-wrap items-baseline gap-3">
        <span
          className="text-xs font-semibold tracking-widest"
          style={{ color: "#C8A875" }}
        >
          {toolNumber}
        </span>
        <h1
          className="text-xl font-semibold tracking-tight sm:text-2xl"
          style={{ color: "#F4EFE6" }}
        >
          {title}
        </h1>
      </div>
      <p
        className="mt-1 text-sm sm:text-base"
        style={{ color: "#987283" }}
      >
        {description}
      </p>

      <div className="mt-6">{children}</div>
    </div>
  );
}
