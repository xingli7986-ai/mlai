"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import "./ui.css";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  // Custom width override; default 520px.
  width?: number;
  // Lock scroll while open. Default true.
  lockScroll?: boolean;
  // Allow ESC to close. Default true.
  closeOnEsc?: boolean;
  // Allow scrim click to close. Default true.
  closeOnScrim?: boolean;
}

export default function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  width = 520,
  lockScroll = true,
  closeOnEsc = true,
  closeOnScrim = true,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    if (lockScroll) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open, lockScroll]);

  useEffect(() => {
    if (!open || !closeOnEsc) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, closeOnEsc, onClose]);

  if (!open) return null;

  return (
    <div
      className="ui-modal-scrim"
      role="dialog"
      aria-modal="true"
      onClick={closeOnScrim ? onClose : undefined}
    >
      <div
        className="ui-modal-panel"
        style={{ width }}
        onClick={(e) => e.stopPropagation()}
      >
        {title ? <div className="ui-modal__header">{title}</div> : null}
        <div className="ui-modal__body">{children}</div>
        {footer ? <div className="ui-modal__footer">{footer}</div> : null}
      </div>
    </div>
  );
}
