"use client";

import { useState } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import "./ui.css";

export interface FAQItem {
  q: ReactNode;
  a: ReactNode;
}

interface FAQAccordionProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  items: FAQItem[];
  // If true, only one item can be open at a time (default).
  singleOpen?: boolean;
  // Index of the item to default-open (e.g. 0 to open the first).
  defaultOpen?: number;
}

export default function FAQAccordion({
  items,
  singleOpen = true,
  defaultOpen,
  className,
  ...rest
}: FAQAccordionProps) {
  const [openSet, setOpenSet] = useState<Set<number>>(
    new Set(defaultOpen !== undefined ? [defaultOpen] : []),
  );

  const toggle = (i: number) => {
    setOpenSet((prev) => {
      const next = new Set(prev);
      if (next.has(i)) {
        next.delete(i);
      } else {
        if (singleOpen) next.clear();
        next.add(i);
      }
      return next;
    });
  };

  return (
    <div className={["ui-faq", className ?? ""].filter(Boolean).join(" ")} {...rest}>
      {items.map((it, i) => {
        const open = openSet.has(i);
        return (
          <div key={i} className={`ui-faq__item${open ? " is-open" : ""}`}>
            <button
              type="button"
              className="ui-faq__q"
              aria-expanded={open}
              onClick={() => toggle(i)}
            >
              <span>{it.q}</span>
              <svg
                className="ui-faq__chevron"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            {open ? <div className="ui-faq__a">{it.a}</div> : null}
          </div>
        );
      })}
    </div>
  );
}
