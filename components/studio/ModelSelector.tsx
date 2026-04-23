"use client";

export type StudioModel = "gpt-image-2" | "gemini";

interface ModelSelectorProps {
  value: StudioModel;
  onChange: (model: StudioModel) => void;
}

const OPTIONS: {
  id: StudioModel;
  icon: string;
  title: string;
  subtitle: string;
}[] = [
  {
    id: "gpt-image-2",
    icon: "⚡",
    title: "极速模式",
    subtitle: "推荐 · 出图快",
  },
  {
    id: "gemini",
    icon: "✨",
    title: "精细模式",
    subtitle: "高质 · 更精致",
  },
];

export default function ModelSelector({ value, onChange }: ModelSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {OPTIONS.map((m) => {
        const active = value === m.id;
        return (
          <button
            key={m.id}
            type="button"
            onClick={() => onChange(m.id)}
            className="rounded-2xl border px-4 py-3 text-left transition"
            style={{
              backgroundColor: active ? "rgba(200,168,117,0.08)" : "#44283A",
              borderColor: active ? "#C8A875" : "#5C3A4F",
              color: "#F4EFE6",
            }}
          >
            <div className="text-base font-semibold">
              <span className="mr-1">{m.icon}</span>
              {m.title}
            </div>
            <div className="mt-0.5 text-xs" style={{ color: "#987283" }}>
              {m.subtitle}
            </div>
          </button>
        );
      })}
    </div>
  );
}
