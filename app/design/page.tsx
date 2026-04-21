"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

type Step = 1 | 2 | 3 | 4;

const STEPS: { id: Step; title: string; subtitle: string }[] = [
  { id: 1, title: "描述印花", subtitle: "告诉 AI 你想要的图案" },
  { id: 2, title: "选择方案", subtitle: "从 4 款设计中挑选" },
  { id: 3, title: "裙型面料", subtitle: "定制你的专属款式" },
  { id: 4, title: "确认下单", subtitle: "核对信息，生成订单" },
];

const SKIRT_TYPES = [
  { id: "a-line", name: "A 字裙", desc: "经典显瘦" },
  { id: "straight", name: "直筒裙", desc: "利落简约" },
  { id: "half", name: "半身裙", desc: "灵动百搭" },
];

const FABRICS = [
  { id: "cotton", name: "棉麻", desc: "亲肤透气" },
  { id: "silk", name: "真丝", desc: "顺滑高级（+¥100）" },
];

const STYLE_PRESETS: { label: string; text: string }[] = [
  { label: "花卉", text: "盛开的花朵印花，花瓣飘落" },
  { label: "几何", text: "现代几何图形，线条交错" },
  { label: "水彩", text: "水彩晕染效果，色彩渐变流动" },
  { label: "波普", text: "波普艺术风格，大胆撞色" },
  { label: "民族风", text: "民族风图腾纹样，异域风情" },
  { label: "极简", text: "极简线条，黑白灰调" },
];

const SIZES = ["S", "M", "L", "XL"] as const;
type SizeOption = (typeof SIZES)[number];

const BASE_PRICE = 299;
const SILK_SURCHARGE = 100;

function calcPrice(fabricId: string | null): number {
  return fabricId === "silk" ? BASE_PRICE + SILK_SURCHARGE : BASE_PRICE;
}

export default function DesignPage() {
  const { status } = useSession();
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [prompt, setPrompt] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [skirtType, setSkirtType] = useState<string | null>(null);
  const [fabric, setFabric] = useState<string | null>(null);
  const [size, setSize] = useState<SizeOption | null>(null);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedDesignId, setSavedDesignId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState("");
  const [toast, setToast] = useState("");

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  }

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  async function handleGenerate() {
    const trimmed = prompt.trim();
    if (!trimmed || generating) return;
    setGenError("");
    setGenerating(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: trimmed }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof data?.error === "string" ? data.error : "生成失败，请稍后再试"
        );
      }
      if (!Array.isArray(data.images) || data.images.length === 0) {
        throw new Error("生成结果为空，请重试");
      }
      setImages(data.images);
      setSelectedImage(null);
      setSavedDesignId(null);
      setSaveError("");
      setStep(2);
    } catch (err) {
      setGenError(err instanceof Error ? err.message : "生成失败，请稍后再试");
    } finally {
      setGenerating(false);
    }
  }

  function handlePickImage(i: number) {
    setSelectedImage(i);
    setSavedDesignId(null);
    setSaveError("");
  }

  async function handleSaveDesign() {
    if (saving || selectedImage === null) return;
    const url = images[selectedImage];
    if (!url || !prompt.trim()) return;
    setSaveError("");
    setSaving(true);
    try {
      const res = await fetch("/api/designs/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          selectedImage: url,
          images,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) {
        throw new Error(
          typeof data?.error === "string" ? data.error : "保存失败，请稍后再试"
        );
      }
      setSavedDesignId(data.designId as string);
      showToast("设计已保存 ✨");
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }

  function handlePickSkirt(id: string) {
    setSkirtType(id);
  }

  function handlePickFabric(id: string) {
    setFabric(id);
  }

  async function handleSubmitOrder() {
    if (
      submitting ||
      selectedImage === null ||
      !skirtType ||
      !fabric ||
      !size ||
      !prompt.trim()
    )
      return;
    const selectedUrl = images[selectedImage];
    if (!selectedUrl) {
      setSubmitError("选中方案丢失，请返回第二步重新选择");
      return;
    }
    setSubmitError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          selectedImage: selectedUrl,
          skirtType,
          fabric,
          size,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) {
        throw new Error(
          typeof data?.error === "string" ? data.error : "下单失败，请稍后再试"
        );
      }
      router.push("/my?toast=ordered");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "下单失败");
      setSubmitting(false);
    }
  }

  if (status !== "authenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-sm text-gray-400">
        加载中...
      </div>
    );
  }

  const canNext =
    (step === 1 && prompt.trim().length > 0) ||
    (step === 2 && selectedImage !== null) ||
    (step === 3 && skirtType !== null && fabric !== null) ||
    step === 4;

  return (
    <div className="relative flex min-h-screen flex-col bg-white">
      {toast && (
        <div className="pointer-events-none fixed left-1/2 top-6 z-50 -translate-x-1/2">
          <div className="rounded-full bg-gradient-to-r from-[#FF6B9D] to-[#C084FC] px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-[#C084FC]/40">
            {toast}
          </div>
        </div>
      )}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-black/5 bg-white/80 px-6 py-4 backdrop-blur">
        <Link href="/" className="flex items-center gap-2">
          <span className="h-8 w-8 rounded-xl bg-gradient-to-br from-[#FF6B9D] to-[#C084FC]" />
          <span className="text-lg font-semibold tracking-tight">
            MaxLuLu <span className="text-[#C084FC]">AI</span>
          </span>
        </Link>
        <Link
          href="/my"
          className="rounded-full px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
        >
          我的
        </Link>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
        <ol className="mb-10 flex items-center gap-2">
          {STEPS.map((s, i) => {
            const active = s.id === step;
            const done = s.id < step;
            return (
              <li key={s.id} className="flex flex-1 items-center gap-2">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition ${
                    active
                      ? "bg-gradient-to-br from-[#FF6B9D] to-[#C084FC] text-white shadow-md shadow-[#C084FC]/30"
                      : done
                        ? "bg-[#C084FC]/15 text-[#C084FC]"
                        : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {done ? "✓" : s.id}
                </div>
                <div className="hidden min-w-0 flex-1 sm:block">
                  <div
                    className={`truncate text-sm font-medium ${
                      active ? "text-gray-900" : "text-gray-500"
                    }`}
                  >
                    {s.title}
                  </div>
                  <div className="truncate text-xs text-gray-400">
                    {s.subtitle}
                  </div>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`mx-1 h-px flex-1 ${done ? "bg-[#C084FC]/40" : "bg-gray-200"}`}
                  />
                )}
              </li>
            );
          })}
        </ol>

        <section className="rounded-3xl border border-gray-100 bg-white p-8 shadow-[0_20px_60px_-30px_rgba(192,132,252,0.25)]">
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                描述你想要的印花
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                比如：「深蓝底上散落的白色雏菊，带水彩晕染」
              </p>
              <div className="mt-5">
                <div className="mb-2 text-xs font-medium text-gray-500">
                  快速选风格
                </div>
                <div className="flex flex-wrap gap-2">
                  {STYLE_PRESETS.map((p) => {
                    const active = prompt === p.text;
                    return (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => setPrompt(p.text)}
                        className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                          active
                            ? "bg-gradient-to-r from-[#FF6B9D] to-[#C084FC] text-white shadow-md shadow-[#C084FC]/30"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={6}
                maxLength={300}
                placeholder="尽量具体：颜色、图案、风格、情绪..."
                className="mt-4 w-full resize-none rounded-2xl border border-gray-200 bg-white p-4 text-base outline-none transition focus:border-[#C084FC] focus:ring-2 focus:ring-[#C084FC]/25"
              />
              <div className="mt-1 text-right text-xs text-gray-400">
                {prompt.length}/300
              </div>
              {genError && (
                <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">
                  {genError}
                </p>
              )}
              <button
                type="button"
                onClick={handleGenerate}
                disabled={!prompt.trim() || generating}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#FF6B9D] to-[#C084FC] py-3 text-sm font-semibold text-white shadow-md shadow-[#C084FC]/30 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {generating && (
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white" />
                )}
                {generating ? "AI 正在绘制 4 款方案..." : "生成方案 ✨"}
              </button>
              <p className="mt-3 text-center text-xs text-gray-400">
                生成约需 10–30 秒
              </p>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                选择喜欢的方案
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                点选其中一张作为你的设计
              </p>
              {images.length === 0 ? (
                <p className="mt-6 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  还没有生成结果，请返回上一步生成方案。
                </p>
              ) : (
                <>
                  <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {images.map((url, i) => {
                      const picked = selectedImage === i;
                      return (
                        <button
                          key={url}
                          type="button"
                          onClick={() => handlePickImage(i)}
                          className={`group relative aspect-[3/4] overflow-hidden rounded-2xl ring-2 transition ${
                            picked
                              ? "ring-[#C084FC] shadow-lg shadow-[#C084FC]/30"
                              : "ring-transparent hover:ring-gray-200"
                          }`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={url}
                            alt={`方案 ${i + 1}`}
                            className="h-full w-full object-cover"
                          />
                          {picked && (
                            <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[#FF6B9D] to-[#C084FC] text-xs text-white">
                              ✓
                            </div>
                          )}
                          <div className="absolute bottom-2 left-2 rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
                            方案 {i + 1}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {selectedImage !== null && images[selectedImage] && (
                    <div className="mt-6">
                      <div className="mb-2 flex items-center justify-between">
                        <div className="text-sm font-medium text-gray-700">
                          平铺预览
                        </div>
                        <div className="text-xs text-gray-400">
                          作为面料的整体效果
                        </div>
                      </div>
                      <div
                        className="h-[200px] overflow-hidden rounded-2xl border border-gray-100 shadow-inner"
                        style={{
                          backgroundImage: `url(${images[selectedImage]})`,
                          backgroundRepeat: "repeat",
                          backgroundSize: "25%",
                        }}
                        aria-label="印花平铺预览"
                      />
                    </div>
                  )}

                  {saveError && (
                    <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">
                      {saveError}
                    </p>
                  )}

                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={handleSaveDesign}
                      disabled={
                        selectedImage === null || saving || !!savedDesignId
                      }
                      className={`rounded-full border px-6 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed ${
                        savedDesignId
                          ? "border-[#C084FC]/40 bg-[#C084FC]/10 text-[#C084FC]"
                          : "border-gray-200 bg-white text-gray-700 hover:border-[#C084FC] hover:text-[#C084FC] disabled:opacity-40"
                      }`}
                    >
                      {saving
                        ? "保存中..."
                        : savedDesignId
                          ? "已保存 ✓"
                          : "保存设计"}
                    </button>
                    <span className="text-xs text-gray-400">
                      保存后可在「我的」里查看
                    </span>
                  </div>
                </>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">
                  选择裙型
                </h2>
                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {SKIRT_TYPES.map((s) => {
                    const picked = skirtType === s.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => handlePickSkirt(s.id)}
                        className={`rounded-2xl border p-5 text-left transition ${
                          picked
                            ? "border-[#C084FC] bg-gradient-to-br from-[#FF6B9D]/5 to-[#C084FC]/5 shadow-md shadow-[#C084FC]/20"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="mb-3 flex aspect-square items-center justify-center rounded-xl bg-gradient-to-br from-[#FF6B9D]/5 to-[#C084FC]/5">
                          <SkirtIcon type={s.id} />
                        </div>
                        <div className="text-sm font-semibold">{s.name}</div>
                        <div className="mt-0.5 text-xs text-gray-500">
                          {s.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">
                  选择面料
                </h2>
                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {FABRICS.map((f) => {
                    const picked = fabric === f.id;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => handlePickFabric(f.id)}
                        className={`flex items-center gap-4 rounded-2xl border p-5 text-left transition ${
                          picked
                            ? "border-[#C084FC] bg-gradient-to-br from-[#FF6B9D]/5 to-[#C084FC]/5 shadow-md shadow-[#C084FC]/20"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-[#FF6B9D]/20 to-[#C084FC]/20" />
                        <div>
                          <div className="text-sm font-semibold">{f.name}</div>
                          <div className="mt-0.5 text-xs text-gray-500">
                            {f.desc}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                确认订单
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                选择尺码，核对信息后提交
              </p>

              <div className="mt-6 flex flex-col gap-6 sm:flex-row">
                <div className="shrink-0">
                  {selectedImage !== null && images[selectedImage] ? (
                    <div className="aspect-[3/4] w-40 overflow-hidden rounded-2xl ring-2 ring-[#C084FC]/40 shadow-md shadow-[#C084FC]/20">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={images[selectedImage]}
                        alt="选中印花"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex aspect-[3/4] w-40 items-center justify-center rounded-2xl bg-gray-100 text-xs text-gray-400">
                      未选择
                    </div>
                  )}
                </div>
                <dl className="flex-1 divide-y divide-gray-100 rounded-2xl border border-gray-100">
                  <Row label="印花描述" value={prompt || "—"} />
                  <Row
                    label="裙型"
                    value={
                      SKIRT_TYPES.find((s) => s.id === skirtType)?.name ?? "—"
                    }
                  />
                  <Row
                    label="面料"
                    value={FABRICS.find((f) => f.id === fabric)?.name ?? "—"}
                  />
                  <Row label="尺码" value={size ?? "未选择"} />
                  <Row label="金额" value={`¥ ${calcPrice(fabric)}`} />
                </dl>
              </div>

              <div className="mt-8">
                <div className="mb-3 text-sm font-medium text-gray-700">
                  选择尺码
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {SIZES.map((s) => {
                    const picked = size === s;
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSize(s)}
                        className={`rounded-2xl border py-3 text-sm font-semibold transition ${
                          picked
                            ? "border-[#C084FC] bg-gradient-to-br from-[#FF6B9D]/10 to-[#C084FC]/10 text-[#C084FC] shadow-md shadow-[#C084FC]/20"
                            : "border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between rounded-2xl bg-gradient-to-r from-[#FF6B9D]/5 to-[#C084FC]/10 p-5">
                <div>
                  <div className="text-xs text-gray-500">应付金额</div>
                  <div className="mt-1 bg-gradient-to-r from-[#FF6B9D] to-[#C084FC] bg-clip-text text-3xl font-bold text-transparent">
                    ¥ {calcPrice(fabric)}
                  </div>
                </div>
                <div className="text-right text-xs text-gray-500">
                  基础价 ¥{BASE_PRICE}
                  {fabric === "silk" && (
                    <>
                      <br />
                      真丝 +¥{SILK_SURCHARGE}
                    </>
                  )}
                </div>
              </div>

              {submitError && (
                <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">
                  {submitError}
                </p>
              )}

              <button
                type="button"
                onClick={handleSubmitOrder}
                disabled={!size || submitting}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#FF6B9D] to-[#C084FC] py-3.5 text-base font-semibold text-white shadow-lg shadow-[#C084FC]/30 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {submitting && (
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white" />
                )}
                {submitting ? "下单中..." : "确认下单"}
              </button>
              <p className="mt-3 text-center text-xs text-gray-400">
                MVP 测试阶段，下单即模拟支付成功
              </p>
            </div>
          )}

          <div className="mt-10 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep((s) => (s > 1 ? ((s - 1) as Step) : s))}
              disabled={step === 1}
              className="rounded-full border border-gray-200 px-6 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              上一步
            </button>
            {step === 2 || step === 3 ? (
              <button
                type="button"
                onClick={() =>
                  setStep((s) => (s === 2 ? 3 : 4) as Step)
                }
                disabled={!canNext}
                className="rounded-full bg-gradient-to-r from-[#FF6B9D] to-[#C084FC] px-8 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#C084FC]/30 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-40"
              >
                下一步 →
              </button>
            ) : step === 4 ? (
              <span className="text-xs text-gray-400">最后一步</span>
            ) : (
              <span />
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-5 py-3.5 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="max-w-[60%] truncate text-right font-medium text-gray-900">
        {value}
      </span>
    </div>
  );
}

function SkirtIcon({ type }: { type: string }) {
  const common = {
    height: 120,
    viewBox: "0 0 120 120",
    fill: "none",
    stroke: "#111827",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  if (type === "a-line") {
    return (
      <svg {...common}>
        <path d="M46 24 L74 24 L76 34 L44 34 Z" />
        <path d="M44 34 L22 104 L98 104 L76 34" />
        <path d="M22 104 Q60 112 98 104" />
        <line x1="60" y1="34" x2="60" y2="104" strokeDasharray="3 4" opacity="0.35" />
      </svg>
    );
  }
  if (type === "straight") {
    return (
      <svg {...common}>
        <path d="M42 24 L78 24 L80 34 L40 34 Z" />
        <path d="M40 34 L38 104 L82 104 L80 34" />
        <path d="M38 104 Q60 108 82 104" />
        <line x1="60" y1="34" x2="60" y2="104" strokeDasharray="3 4" opacity="0.35" />
      </svg>
    );
  }
  if (type === "half") {
    return (
      <svg {...common}>
        <path d="M38 28 L82 28 L82 38 L38 38 Z" />
        <circle cx="60" cy="33" r="2" fill="#111827" stroke="none" />
        <path d="M38 38 L30 94 L90 94 L82 38" />
        <line x1="48" y1="38" x2="45" y2="94" />
        <line x1="60" y1="38" x2="60" y2="94" />
        <line x1="72" y1="38" x2="75" y2="94" />
        <path d="M30 94 Q60 100 90 94" />
      </svg>
    );
  }
  return null;
}
