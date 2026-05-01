"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import "./ui.css";

export type ToastTone = "info" | "success" | "error" | "warning";

interface ToastItem {
  id: number;
  tone: ToastTone;
  message: ReactNode;
  duration: number;
}

interface ToastContextValue {
  show: (message: ReactNode, opts?: { tone?: ToastTone; duration?: number }) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const remove = useCallback((id: number) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  }, []);

  const show = useCallback<ToastContextValue["show"]>((message, opts) => {
    const id = ++idRef.current;
    const tone = opts?.tone ?? "info";
    const duration = opts?.duration ?? 3200;
    setItems((prev) => [...prev, { id, tone, message, duration }]);
    if (duration > 0) {
      setTimeout(() => remove(id), duration);
    }
  }, [remove]);

  const value = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="ui-toast-stack" role="region" aria-live="polite" aria-atomic="false">
        {items.map((it) => (
          <div key={it.id} className={`ui-toast ui-toast--${it.tone}`}>
            <span>{it.message}</span>
            <button
              type="button"
              className="ui-toast__close"
              aria-label="关闭提示"
              onClick={() => remove(it.id)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Allow calling outside provider — falls back to console log.
    return {
      show: (m) => {
        if (typeof window !== "undefined") {
          // eslint-disable-next-line no-console
          console.log("[toast]", m);
        }
      },
    };
  }
  return ctx;
}

// One-off, non-context Toast component for static use.
interface ToastProps {
  tone?: ToastTone;
  message: ReactNode;
  onClose?: () => void;
}

export default function Toast({ tone = "info", message, onClose }: ToastProps) {
  // Keep parity with ESLint hooks rule: if there's no onClose, no effect runs.
  useEffect(() => {
    if (!onClose) return;
  }, [onClose]);
  return (
    <div className={`ui-toast ui-toast--${tone}`}>
      <span>{message}</span>
      {onClose ? (
        <button type="button" className="ui-toast__close" aria-label="关闭提示" onClick={onClose}>
          ×
        </button>
      ) : null}
    </div>
  );
}
