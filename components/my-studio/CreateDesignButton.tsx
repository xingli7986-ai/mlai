"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { readLocalBodyProfile } from "./BodyProfileGate";

const GARMENT_TYPES = ["连衣裙", "半裙", "上衣"] as const;
const SILHOUETTES = ["A 字裙", "裹身裙", "直筒", "收腰"] as const;
const OCCASIONS = ["通勤", "度假", "晚宴", "日常"] as const;
const SIZES = ["S", "M", "L", "XL"] as const;
const CREATE_WORK_SERVICE_ERROR = "当前无法连接作品服务，请稍后重试或联系管理员。";

type CreateDesignButtonProps = {
  className?: string;
  label?: string;
  notice?: string;
  children?: ReactNode;
};

export default function CreateDesignButton({
  className = "msCreateButton",
  label = "创建服装设计",
  notice,
  children,
}: CreateDesignButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("我的第一件 AI 连衣裙");
  const [garmentType, setGarmentType] = useState<(typeof GARMENT_TYPES)[number]>("连衣裙");
  const [silhouette, setSilhouette] = useState<(typeof SILHOUETTES)[number]>("A 字裙");
  const [occasion, setOccasion] = useState<(typeof OCCASIONS)[number]>("通勤");
  const [size, setSize] = useState<(typeof SIZES)[number]>("M");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  async function createWork(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const safeTitle = title.trim() || "我的第一件 AI 连衣裙";
    setSubmitting(true);
    try {
      const res = await fetch("/api/my-studio/works", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: safeTitle,
          prompt: safeTitle,
          garmentType,
          silhouette,
          occasion,
          size,
          currentStep: "created",
          createdFrom: "my-studio",
          isFallbackAllowed: true,
          bodyProfile: readLocalBodyProfile() || undefined,
          config: {
            category: garmentType,
            garmentType,
            silhouette,
            occasion,
            size,
            quantity: 1,
          },
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        workId?: string;
        error?: string;
      };
      if (!res.ok || !data.success || !data.workId) {
        throw new Error(normalizeCreateError(res.status, data.error));
      }
      router.push(`/my-studio/pattern-generate?workId=${encodeURIComponent(data.workId)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : CREATE_WORK_SERVICE_ERROR);
    } finally {
      setSubmitting(false);
    }
  }

  const modal = open ? (
    <div className="msCreateModal" role="dialog" aria-modal="true" aria-labelledby="ms-create-title">
      <button
        type="button"
        className="msCreateModal__backdrop"
        aria-label="关闭创建作品弹窗"
        onClick={() => setOpen(false)}
      />
      <form className="msCreateModal__panel" onSubmit={createWork}>
        <header className="msCreateModal__head">
          <div>
            <p>New Garment Work</p>
            <h2 id="ms-create-title">创建新的服装设计</h2>
          </div>
          <button type="button" onClick={() => setOpen(false)} aria-label="关闭">
            ×
          </button>
        </header>

        {notice && <p className="msCreateModal__notice">{notice}</p>}

        <label className="msCreateField">
          <span>设计名称</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={32}
            placeholder="我的第一件 AI 连衣裙"
          />
        </label>

        <ChoiceGroup label="服装品类">
          {GARMENT_TYPES.map((item) => (
            <ChoiceButton key={item} selected={garmentType === item} onClick={() => setGarmentType(item)}>
              {item}
            </ChoiceButton>
          ))}
        </ChoiceGroup>

        <ChoiceGroup label="版型">
          {SILHOUETTES.map((item) => (
            <ChoiceButton key={item} selected={silhouette === item} onClick={() => setSilhouette(item)}>
              {item}
            </ChoiceButton>
          ))}
        </ChoiceGroup>

        <ChoiceGroup label="场景">
          {OCCASIONS.map((item) => (
            <ChoiceButton key={item} selected={occasion === item} onClick={() => setOccasion(item)}>
              {item}
            </ChoiceButton>
          ))}
        </ChoiceGroup>

        <ChoiceGroup label="尺码">
          {SIZES.map((item) => (
            <ChoiceButton key={item} selected={size === item} onClick={() => setSize(item)}>
              {item}
            </ChoiceButton>
          ))}
        </ChoiceGroup>

        {error && <p className="msCreateModal__error">{error}</p>}

        <div className="msCreateModal__actions">
          <button type="button" className="msCreateGhost" onClick={() => setOpen(false)}>
            取消
          </button>
          <button type="submit" className="msCreatePrimary" disabled={submitting}>
            {submitting ? "创建中..." : "确认并进入印花创作"}
          </button>
        </div>
      </form>
    </div>
  ) : null;

  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)}>
        {children ?? label}
      </button>

      {modal && createPortal(modal, document.body)}
    </>
  );
}

function normalizeCreateError(status: number, rawError?: string): string {
  if (status === 401) return "请先登录后再创建作品。";
  if (status >= 500 || !rawError) return CREATE_WORK_SERVICE_ERROR;
  if (/Prisma|database|Can't reach|Neon|postgres|DATABASE_URL/i.test(rawError)) {
    return CREATE_WORK_SERVICE_ERROR;
  }
  return rawError;
}

function ChoiceGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="msCreateChoices">
      <p>{label}</p>
      <div>{children}</div>
    </div>
  );
}

function ChoiceButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className={selected ? "is-selected" : ""}
      aria-pressed={selected}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
