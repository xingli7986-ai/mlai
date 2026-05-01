import type { HTMLAttributes, ReactNode } from "react";
import "./ui.css";

export interface StepDef {
  title: ReactNode;
  description?: ReactNode;
  // Optional override label for the node (e.g. "01"); defaults to 1-based index.
  label?: ReactNode;
}

interface StepperProps extends Omit<HTMLAttributes<HTMLOListElement>, "children"> {
  steps: StepDef[];
  current?: number; // 0-based current step index
  layout?: "horizontal" | "vertical";
}

export default function Stepper({
  steps,
  current = 0,
  layout = "horizontal",
  className,
  ...rest
}: StepperProps) {
  const cls = [
    "ui-stepper",
    layout === "vertical" ? "ui-stepper--vertical" : "ui-stepper--horizontal",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <ol className={cls} {...rest}>
      {steps.map((s, i) => {
        const state = i < current ? "done" : i === current ? "current" : "upcoming";
        return (
          <li key={i} className={`ui-step ui-step--${state}`} aria-current={state === "current" ? "step" : undefined}>
            <div className="ui-step__node">
              {state === "done" ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M5 12l5 5 9-11" />
                </svg>
              ) : (
                <span>{s.label ?? String(i + 1).padStart(2, "0")}</span>
              )}
            </div>
            <div className="ui-step__body">
              <div className="ui-step__title">{s.title}</div>
              {s.description ? <div className="ui-step__desc">{s.description}</div> : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
