"use client";

import { useEffect, useMemo, useState } from "react";
import type { StudioBodyProfile, StudioWorkDTO } from "@/lib/my-studio/types";

const STORAGE_KEY = "maxlulu.myStudio.bodyProfile.v1";
const WORK_SERVICE_ERROR = "身材档案暂时无法同步到作品服务，但已保存在本机。";

type ProfileForm = Required<Pick<StudioBodyProfile, "heightCm" | "weightKg" | "usualSize" | "fitPreference">>;

const DEFAULT_FORM: ProfileForm = {
  heightCm: 165,
  weightKg: 52,
  usualSize: "M",
  fitPreference: "regular",
};

export default function BodyProfileGate() {
  const [open, setOpen] = useState(false);
  const [works, setWorks] = useState<StudioWorkDTO[]>([]);
  const [form, setForm] = useState<ProfileForm>(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let alive = true;
    const localProfile = readLocalProfile();
    queueMicrotask(() => {
      if (alive && localProfile) setForm(formFromProfile(localProfile));
    });

    fetch("/api/my-studio/works", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { works?: StudioWorkDTO[] } | null) => {
        if (!alive) return;
        const nextWorks = Array.isArray(data?.works) ? data.works : [];
        setWorks(nextWorks);
        const savedProfile = nextWorks.map((work) => work.bodyProfile).find(isUsableProfile);
        if (savedProfile) {
          setForm(formFromProfile(savedProfile));
          writeLocalProfile(savedProfile);
          setOpen(false);
          return;
        }
        setOpen(!isUsableProfile(localProfile));
      })
      .catch(() => {
        if (alive) setOpen(!isUsableProfile(localProfile));
      });

    return () => {
      alive = false;
    };
  }, []);

  const fitLabel = useMemo(() => {
    if (form.fitPreference === "slim") return "修身";
    if (form.fitPreference === "relaxed") return "微宽松";
    return "合身";
  }, [form.fitPreference]);

  if (!open) return null;

  async function saveProfile() {
    setSaving(true);
    setMessage("");
    const profile: StudioBodyProfile = {
      heightCm: form.heightCm,
      weightKg: form.weightKg,
      usualSize: form.usualSize,
      fitPreference: form.fitPreference,
      bodyShape: inferBodyShape(form.heightCm, form.weightKg),
      measurementMode: "quick",
      updatedAt: new Date().toISOString(),
    };
    writeLocalProfile(profile);

    try {
      await Promise.all(
        works
          .filter((work) => !isUsableProfile(work.bodyProfile))
          .slice(0, 12)
          .map((work) =>
            fetch(`/api/my-studio/works/${encodeURIComponent(work.id)}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ bodyProfile: profile }),
            }),
          ),
      );
      setOpen(false);
    } catch {
      setMessage(WORK_SERVICE_ERROR);
      window.setTimeout(() => setOpen(false), 1200);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="msBodyGate" role="dialog" aria-modal="true" aria-labelledby="ms-body-title">
      <div className="msBodyGate__backdrop" />
      <section className="msBodyGate__panel">
        <p className="msBodyGate__eyebrow">Body Profile</p>
        <h2 id="ms-body-title">先建立你的身材档案</h2>
        <p>
          MaxLuLu AI 会用这份档案生成更接近你身高体重和穿着松量的上身效果图。
        </p>

        <div className="msBodyGate__grid">
          <BodyNumber label="身高 cm" value={form.heightCm} onChange={(value) => setForm((current) => ({ ...current, heightCm: value }))} />
          <BodyNumber label="体重 kg" value={form.weightKg} onChange={(value) => setForm((current) => ({ ...current, weightKg: value }))} />
          <label>
            常穿尺码
            <select value={form.usualSize} onChange={(event) => setForm((current) => ({ ...current, usualSize: event.target.value }))}>
              {["S", "M", "L", "XL"].map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="msBodyGate__fit">
          <span>穿着松量：{fitLabel}</span>
          <div>
            {[
              ["slim", "修身"],
              ["regular", "合身"],
              ["relaxed", "微宽松"],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                className={form.fitPreference === id ? "is-selected" : ""}
                onClick={() => setForm((current) => ({ ...current, fitPreference: id as ProfileForm["fitPreference"] }))}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {message && <p className="msBodyGate__message">{message}</p>}

        <div className="msBodyGate__actions">
          <button type="button" className="msCreatePrimary" disabled={saving} onClick={saveProfile}>
            {saving ? "保存中..." : "保存并进入工作室"}
          </button>
        </div>
      </section>
    </div>
  );
}

function BodyNumber({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label>
      {label}
      <input
        type="number"
        min={0}
        value={value}
        onChange={(event) => onChange(Number(event.target.value) || 0)}
      />
    </label>
  );
}

export function readLocalBodyProfile(): StudioBodyProfile | null {
  return readLocalProfile();
}

function readLocalProfile(): StudioBodyProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StudioBodyProfile;
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function writeLocalProfile(profile: StudioBodyProfile) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

function isUsableProfile(profile?: StudioBodyProfile | null): profile is StudioBodyProfile {
  return Boolean(profile?.heightCm && profile?.weightKg && profile?.usualSize);
}

function formFromProfile(profile: StudioBodyProfile): ProfileForm {
  return {
    heightCm: Number(profile.heightCm) || DEFAULT_FORM.heightCm,
    weightKg: Number(profile.weightKg) || DEFAULT_FORM.weightKg,
    usualSize: profile.usualSize || DEFAULT_FORM.usualSize,
    fitPreference: profile.fitPreference || DEFAULT_FORM.fitPreference,
  };
}

function inferBodyShape(heightCm: number, weightKg: number): string {
  const bmi = weightKg / Math.pow(heightCm / 100, 2);
  if (!Number.isFinite(bmi)) return "未设定";
  if (bmi < 18.5) return "纤细";
  if (bmi < 24) return "标准";
  return "丰满";
}
