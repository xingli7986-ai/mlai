"use client";

import Link from "next/link";
import NextImage from "next/image";
import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  BASE_PRICE_BY_LEVEL,
  FABRICS,
  SIZE_OPTIONS,
  SKIRT_TYPES,
  calculatePrice,
  type SizeOption,
} from "@/lib/constants";

type Step = 1 | 2 | 3 | 4;

const STEPS: { id: Step; title: string; subtitle: string }[] = [
  { id: 1, title: "描述印花", subtitle: "告诉 AI 你想要的图案" },
  { id: 2, title: "选择方案", subtitle: "从 4 款设计中挑选" },
  { id: 3, title: "裙型面料", subtitle: "定制你的专属款式" },
  { id: 4, title: "确认下单", subtitle: "核对信息，生成订单" },
];

const STYLE_PRESETS: { label: string; text: string }[] = [
  { label: "花卉", text: "盛开的花朵印花，花瓣飘落" },
  { label: "几何", text: "现代几何图形，线条交错" },
  { label: "水彩", text: "水彩晕染效果，色彩渐变流动" },
  { label: "民族风", text: "民族风图腾纹样，异域风情" },
  {
    label: "日式和风",
    text: "Japanese ukiyo-e style floral pattern, cherry blossom and waves, gold and indigo",
  },
  {
    label: "中国水墨",
    text: "Chinese ink wash painting, lotus and bamboo, elegant black and white with red accents",
  },
  {
    label: "热带雨林",
    text: "Tropical rainforest pattern, monstera leaves and exotic birds, vibrant green and teal",
  },
  {
    label: "星空梦境",
    text: "Dreamy starry night galaxy pattern, deep purple nebula with golden star dust",
  },
  {
    label: "波普艺术",
    text: "Pop art style bold pattern, bright colors, comic book dots and geometric shapes",
  },
  {
    label: "法式浪漫",
    text: "French romantic toile pattern, delicate roses and ribbons, soft blush pink and cream",
  },
  {
    label: "扎染渐变",
    text: "Tie-dye gradient pattern, ocean blue to sunset orange, organic flowing shapes",
  },
  {
    label: "极简线条",
    text: "Minimalist line art pattern, continuous single line botanical drawings, black on white",
  },
  {
    label: "动物纹理",
    text: "Luxury animal print pattern, abstract leopard spots, gold and black sophisticated",
  },
  {
    label: "莫兰迪色",
    text: "Morandi color palette abstract pattern, muted dusty pink sage green and warm gray, soft elegant",
  },
];

const LOADING_MESSAGES = [
  "AI 正在调色...",
  "灵感碰撞中...",
  "花纹编织中...",
  "色彩晕染中...",
  "即将绽放...",
];

const BASE_PRICE = BASE_PRICE_BY_LEVEL[1];

function calcPrice(
  fabricId: string | null,
  skirtId: string | null
): number {
  if (!fabricId || !skirtId) {
    const f = FABRICS.find((x) => x.id === fabricId);
    return f ? BASE_PRICE_BY_LEVEL[f.priceLevel] : BASE_PRICE;
  }
  return calculatePrice(fabricId, skirtId);
}

export default function DesignPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white text-sm text-gray-400">
          加载中...
        </div>
      }
    >
      <DesignPageInner />
    </Suspense>
  );
}

function DesignPageInner() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const designIdParam = searchParams.get("designId");
  const [loadingDesign, setLoadingDesign] = useState(false);
  const [loadDesignError, setLoadDesignError] = useState("");
  const [step, setStep] = useState<Step>(1);
  const [prompt, setPrompt] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [skirtType, setSkirtType] = useState<string | null>(null);
  const [fabric, setFabric] = useState<string | null>(null);
  const [size, setSize] = useState<SizeOption | null>(null);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState("");
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
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

  useEffect(() => {
    if (!generating) return;
    const t = window.setInterval(() => {
      setLoadingMsgIdx((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 2000);
    return () => window.clearInterval(t);
  }, [generating]);

  useEffect(() => {
    if (!designIdParam || status !== "authenticated") return;
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loading state for data fetch
    setLoadingDesign(true);
    setLoadDesignError("");
    (async () => {
      try {
        const res = await fetch(
          `/api/designs/${encodeURIComponent(designIdParam)}`,
          { cache: "no-store" }
        );
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(
            typeof data?.error === "string" ? data.error : "加载设计失败"
          );
        }
        const d = data?.design;
        if (cancelled || !d) return;
        const imgs: string[] = Array.isArray(d.images) ? d.images : [];
        const selIdx =
          typeof d.selectedImage === "string"
            ? imgs.indexOf(d.selectedImage)
            : -1;
        setPrompt(typeof d.prompt === "string" ? d.prompt : "");
        setImages(imgs);
        setSelectedImage(selIdx >= 0 ? selIdx : imgs.length > 0 ? 0 : null);
        setSavedDesignId(typeof d.id === "string" ? d.id : null);
        setSaveError("");
        setGenError("");
        if (imgs.length > 0) setStep(2);
      } catch (err) {
        if (!cancelled) {
          setLoadDesignError(
            err instanceof Error ? err.message : "加载设计失败"
          );
        }
      } finally {
        if (!cancelled) setLoadingDesign(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [designIdParam, status]);

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
      setLoadedImages(new Set());
      setSavedDesignId(null);
      setSaveError("");
      setLoadingMsgIdx(0);
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

  function handleRegenerate() {
    setImages([]);
    setSelectedImage(null);
    setSavedDesignId(null);
    setSaveError("");
    setGenError("");
    setStep(1);
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

  async function handleShareDesign() {
    if (!savedDesignId) return;
    const url = `${window.location.origin}/share/${savedDesignId}`;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        throw new Error("Clipboard API not available");
      }
      showToast("分享链接已复制");
    } catch {
      // fallback: show the URL in a prompt so user can copy manually
      window.prompt("复制这个分享链接：", url);
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
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-black/5 bg-white/80 px-4 py-3 backdrop-blur sm:px-6 sm:py-4">
        <Link
          href="/"
          title="返回首页"
          className="flex items-center gap-1.5 sm:gap-2"
        >
          <span
            aria-hidden
            className="text-gray-400 transition group-hover:text-[#C084FC]"
          >
            ←
          </span>
          <span className="h-7 w-7 rounded-xl bg-gradient-to-br from-[#FF6B9D] to-[#C084FC] sm:h-8 sm:w-8" />
          <span className="text-base font-semibold tracking-tight sm:text-lg">
            MaxLuLu <span className="text-[#C084FC]">AI</span>
          </span>
        </Link>
        <Link
          href="/my"
          className="rounded-full px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 sm:px-4 sm:py-2"
        >
          我的
        </Link>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6 sm:px-6 sm:py-10">
        {loadingDesign && (
          <div className="mb-4 rounded-xl border border-[#C084FC]/30 bg-gradient-to-r from-[#FF6B9D]/5 to-[#C084FC]/5 px-4 py-3 text-sm text-[#C084FC]">
            正在载入历史设计...
          </div>
        )}
        {loadDesignError && (
          <div className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">
            {loadDesignError}
          </div>
        )}
        <div className="mb-6 flex items-center gap-3 sm:hidden">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#FF6B9D] to-[#C084FC] text-sm font-semibold text-white shadow-md shadow-[#C084FC]/30">
            {step}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-gray-900">
              {STEPS[step - 1].title}
            </div>
            <div className="truncate text-xs text-gray-400">
              第 {step}/4 步 · {STEPS[step - 1].subtitle}
            </div>
          </div>
        </div>
        <ol className="mb-10 hidden items-center gap-2 sm:flex">
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

        <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-[0_20px_60px_-30px_rgba(192,132,252,0.25)] sm:p-8">
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
                {generating ? (
                  <>
                    <SpinningFlower />
                    <span>{LOADING_MESSAGES[loadingMsgIdx]}</span>
                  </>
                ) : (
                  <>生成方案 ✨</>
                )}
              </button>
              <p className="mt-3 text-center text-xs text-gray-400">
                生成约需 10–30 秒
              </p>
              {generating && (
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="aspect-[3/4] animate-pulse rounded-2xl bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100"
                      style={{ animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </div>
              )}
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
                          <NextImage
                            src={url}
                            alt={`方案 ${i + 1}`}
                            width={512}
                            height={512}
                            loading="lazy"
                            onLoad={() =>
                              setLoadedImages((prev) => {
                                if (prev.has(url)) return prev;
                                const next = new Set(prev);
                                next.add(url);
                                return next;
                              })
                            }
                            className={`h-full w-full object-cover transition-opacity duration-300 ${
                              loadedImages.has(url)
                                ? "opacity-100"
                                : "opacity-0"
                            }`}
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
                    <button
                      type="button"
                      onClick={handleRegenerate}
                      className="rounded-full border border-gray-200 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 transition hover:border-[#C084FC] hover:text-[#C084FC]"
                    >
                      ↻ 重新生成
                    </button>
                    {savedDesignId && (
                      <button
                        type="button"
                        onClick={handleShareDesign}
                        className="rounded-full border border-[#C084FC] bg-white px-6 py-2.5 text-sm font-medium text-[#C084FC] transition hover:bg-[#C084FC]/5"
                      >
                        🔗 分享设计
                      </button>
                    )}
                    <span className="text-xs text-gray-400">
                      不满意可以保留描述重新出图
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
                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
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

              {selectedImage !== null &&
                skirtType &&
                images[selectedImage] && (
                  <SkirtPreview
                    patternUrl={images[selectedImage]}
                    skirtType={skirtType}
                  />
                )}

              <div>
                <h2 className="text-2xl font-semibold tracking-tight">
                  选择面料
                </h2>
                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
                  {FABRICS.map((f) => {
                    const picked = fabric === f.id;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => handlePickFabric(f.id)}
                        className={`flex flex-col gap-3 rounded-2xl border p-4 text-left transition ${
                          picked
                            ? "border-[#C084FC] bg-gradient-to-br from-[#FF6B9D]/5 to-[#C084FC]/5 shadow-md shadow-[#C084FC]/20"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex h-14 w-full items-center justify-center rounded-xl bg-gradient-to-br from-[#FF6B9D]/5 to-[#C084FC]/5">
                          <FabricIcon type={f.id} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="truncate text-sm font-semibold">
                              {f.name}
                            </span>
                            <span className="shrink-0 bg-gradient-to-r from-[#FF6B9D] to-[#C084FC] bg-clip-text text-xs font-bold text-transparent">
                              ¥{BASE_PRICE_BY_LEVEL[f.priceLevel]} 起
                            </span>
                          </div>
                          <div className="mt-0.5 line-clamp-2 text-xs text-gray-500">
                            {f.composition} · {f.gsm}
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
                <div className="shrink-0 sm:w-40">
                  {selectedImage !== null && images[selectedImage] ? (
                    <div className="mx-auto aspect-[3/4] w-48 overflow-hidden rounded-2xl ring-2 ring-[#C084FC]/40 shadow-md shadow-[#C084FC]/20 sm:w-40">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={images[selectedImage]}
                        alt="选中印花"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="mx-auto flex aspect-[3/4] w-48 items-center justify-center rounded-2xl bg-gray-100 text-xs text-gray-400 sm:w-40">
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
                  <Row label="金额" value={`¥ ${calcPrice(fabric, skirtType)}`} />
                </dl>
              </div>

              <div className="mt-8">
                <div className="mb-3 flex items-center justify-between">
                  <div className="text-sm font-medium text-gray-700">
                    选择尺码
                  </div>
                  <a
                    href="/size-guide"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium text-[#C084FC] hover:underline"
                  >
                    不确定尺码？查看尺码指南 →
                  </a>
                </div>
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                  {SIZE_OPTIONS.map((s) => {
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
                    ¥ {calcPrice(fabric, skirtType)}
                  </div>
                </div>
                <div className="text-right text-xs text-gray-500">
                  基础价 ¥{BASE_PRICE}
                  {(() => {
                    const f = FABRICS.find((x) => x.id === fabric);
                    const fabricBase = f ? BASE_PRICE_BY_LEVEL[f.priceLevel] : BASE_PRICE;
                    const fabricSurcharge = fabricBase - BASE_PRICE;
                    const total = fabric && skirtType ? calculatePrice(fabric, skirtType) : fabricBase;
                    const skirtSurcharge = total - fabricBase;
                    if (fabricSurcharge === 0 && skirtSurcharge === 0) return null;
                    return (
                      <>
                        {fabricSurcharge > 0 && f && (
                          <>
                            <br />
                            {f.name} +¥{fabricSurcharge}
                          </>
                        )}
                        {skirtSurcharge > 0 && (
                          <>
                            <br />
                            工艺 +¥{skirtSurcharge}
                          </>
                        )}
                      </>
                    );
                  })()}
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

function SpinningFlower() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="currentColor"
      className="h-4 w-4 shrink-0 animate-spin"
      aria-hidden
    >
      <circle cx="12" cy="4.5" r="2.2" />
      <circle cx="18.5" cy="9.5" r="2.2" />
      <circle cx="16" cy="18" r="2.2" />
      <circle cx="8" cy="18" r="2.2" />
      <circle cx="5.5" cy="9.5" r="2.2" />
      <circle cx="12" cy="12" r="1.8" fillOpacity="0.45" />
    </svg>
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
  if (type === "pleated") {
    return (
      <svg {...common}>
        <path d="M44 24 L76 24 L78 34 L42 34 Z" />
        <path d="M42 34 L24 106 L96 106 L78 34" />
        <line x1="49" y1="34" x2="40" y2="106" />
        <line x1="55" y1="34" x2="52" y2="106" />
        <line x1="60" y1="34" x2="60" y2="106" />
        <line x1="65" y1="34" x2="68" y2="106" />
        <line x1="71" y1="34" x2="80" y2="106" />
        <path d="M24 106 Q60 114 96 106" />
      </svg>
    );
  }
  if (type === "flared") {
    return (
      <svg {...common}>
        <path d="M46 24 L74 24 L76 32 L44 32 Z" />
        <path d="M44 32 L48 74 Q30 92 22 108" />
        <path d="M76 32 L72 74 Q90 92 98 108" />
        <line
          x1="48"
          y1="74"
          x2="72"
          y2="74"
          strokeDasharray="2 3"
          opacity="0.35"
        />
        <path d="M22 108 Q60 116 98 108" />
      </svg>
    );
  }
  if (type === "wrap") {
    return (
      <svg {...common}>
        <path d="M42 26 L78 26 L80 34 L40 34 Z" />
        <path d="M40 34 L28 104 L92 104 L80 34" />
        <path d="M80 34 Q66 70 44 104" />
        <path d="M78 28 Q90 24 94 30" />
        <path d="M90 24 L94 34" />
        <path d="M28 104 Q60 110 92 104" />
      </svg>
    );
  }
  return null;
}

function FabricIcon({ type }: { type: string }) {
  const common = {
    height: 48,
    viewBox: "0 0 64 48",
    fill: "none",
    stroke: "#111827",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  if (type === "cotton") {
    return (
      <svg {...common}>
        <rect
          x="4"
          y="4"
          width="56"
          height="40"
          rx="4"
          stroke="#111827"
          strokeWidth="1.5"
        />
        <line x1="4" y1="16" x2="60" y2="16" />
        <line x1="4" y1="28" x2="60" y2="28" />
        <line x1="4" y1="40" x2="60" y2="40" opacity="0" />
        <line x1="18" y1="4" x2="18" y2="44" />
        <line x1="32" y1="4" x2="32" y2="44" />
        <line x1="46" y1="4" x2="46" y2="44" />
      </svg>
    );
  }
  if (type === "silk") {
    return (
      <svg {...common}>
        <rect
          x="4"
          y="4"
          width="56"
          height="40"
          rx="4"
          stroke="#111827"
          strokeWidth="1.5"
        />
        <path d="M6 14 Q18 8 30 14 T54 14 Q58 14 58 14" />
        <path d="M6 24 Q18 18 30 24 T54 24 Q58 24 58 24" />
        <path d="M6 34 Q18 28 30 34 T54 34 Q58 34 58 34" />
      </svg>
    );
  }
  if (type === "chiffon") {
    return (
      <svg {...common}>
        <rect
          x="4"
          y="4"
          width="56"
          height="40"
          rx="4"
          stroke="#111827"
          strokeWidth="1.5"
        />
        <path d="M8 14 Q20 20 32 14 T56 14" opacity="0.55" />
        <path d="M8 24 Q20 30 32 24 T56 24" opacity="0.55" />
        <path d="M8 34 Q20 40 32 34 T56 34" opacity="0.55" />
        <circle cx="16" cy="19" r="0.8" fill="#111827" stroke="none" />
        <circle cx="40" cy="29" r="0.8" fill="#111827" stroke="none" />
        <circle cx="48" cy="10" r="0.8" fill="#111827" stroke="none" />
        <circle cx="24" cy="39" r="0.8" fill="#111827" stroke="none" />
      </svg>
    );
  }
  if (type === "denim") {
    return (
      <svg {...common}>
        <rect
          x="4"
          y="4"
          width="56"
          height="40"
          rx="4"
          stroke="#111827"
          strokeWidth="1.5"
        />
        <line x1="8" y1="24" x2="24" y2="8" opacity="0.6" />
        <line x1="8" y1="36" x2="36" y2="8" opacity="0.6" />
        <line x1="16" y1="40" x2="48" y2="8" opacity="0.6" />
        <line x1="28" y1="40" x2="56" y2="12" opacity="0.6" />
        <line x1="40" y1="40" x2="56" y2="24" opacity="0.6" />
        <line x1="52" y1="40" x2="56" y2="36" opacity="0.6" />
      </svg>
    );
  }
  if (type === "velvet") {
    return (
      <svg {...common}>
        <rect
          x="4"
          y="4"
          width="56"
          height="40"
          rx="4"
          stroke="#111827"
          strokeWidth="1.5"
        />
        <line x1="10" y1="10" x2="10" y2="38" opacity="0.3" strokeWidth="2" />
        <line x1="16" y1="10" x2="16" y2="38" opacity="0.6" strokeWidth="2" />
        <line x1="22" y1="10" x2="22" y2="38" opacity="0.4" strokeWidth="2" />
        <line x1="28" y1="10" x2="28" y2="38" opacity="0.7" strokeWidth="2" />
        <line x1="34" y1="10" x2="34" y2="38" opacity="0.35" strokeWidth="2" />
        <line x1="40" y1="10" x2="40" y2="38" opacity="0.6" strokeWidth="2" />
        <line x1="46" y1="10" x2="46" y2="38" opacity="0.45" strokeWidth="2" />
        <line x1="52" y1="10" x2="52" y2="38" opacity="0.7" strokeWidth="2" />
      </svg>
    );
  }
  return null;
}

function buildSkirtPath(type: string): Path2D {
  const p = new Path2D();
  switch (type) {
    case "a-line":
      p.moveTo(150, 40);
      p.lineTo(250, 40);
      p.lineTo(345, 460);
      p.quadraticCurveTo(200, 490, 55, 460);
      p.closePath();
      break;
    case "straight":
      p.moveTo(155, 40);
      p.lineTo(245, 40);
      p.lineTo(260, 468);
      p.quadraticCurveTo(200, 482, 140, 468);
      p.closePath();
      break;
    case "half":
      p.moveTo(145, 40);
      p.lineTo(255, 40);
      p.lineTo(325, 345);
      p.quadraticCurveTo(200, 368, 75, 345);
      p.closePath();
      break;
    case "pleated":
      p.moveTo(150, 40);
      p.lineTo(250, 40);
      p.lineTo(345, 460);
      p.bezierCurveTo(315, 485, 290, 462, 260, 488);
      p.bezierCurveTo(230, 462, 200, 490, 170, 462);
      p.bezierCurveTo(140, 488, 110, 462, 80, 486);
      p.quadraticCurveTo(65, 470, 55, 460);
      p.closePath();
      break;
    case "flared":
      p.moveTo(160, 40);
      p.lineTo(240, 40);
      p.quadraticCurveTo(232, 220, 230, 290);
      p.quadraticCurveTo(260, 360, 340, 470);
      p.quadraticCurveTo(200, 492, 60, 470);
      p.quadraticCurveTo(140, 360, 170, 290);
      p.quadraticCurveTo(168, 220, 160, 40);
      p.closePath();
      break;
    case "wrap":
      p.moveTo(150, 40);
      p.lineTo(250, 40);
      p.lineTo(340, 460);
      p.quadraticCurveTo(200, 490, 60, 460);
      p.closePath();
      break;
    default:
      p.rect(60, 40, 280, 420);
  }
  return p;
}

function drawSkirtDetails(
  ctx: CanvasRenderingContext2D,
  type: string,
  path: Path2D
) {
  if (type === "pleated") {
    ctx.save();
    ctx.clip(path);
    ctx.strokeStyle = "rgba(31,41,55,0.35)";
    ctx.lineWidth = 1.2;
    const topXs = [170, 185, 200, 215, 230];
    const botXs = [110, 155, 200, 245, 290];
    for (let i = 0; i < topXs.length; i++) {
      ctx.beginPath();
      ctx.moveTo(topXs[i], 40);
      ctx.lineTo(botXs[i], 480);
      ctx.stroke();
    }
    ctx.restore();
  }
  if (type === "wrap") {
    ctx.save();
    ctx.clip(path);
    ctx.strokeStyle = "rgba(31,41,55,0.55)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(250, 40);
    ctx.bezierCurveTo(230, 160, 170, 300, 120, 470);
    ctx.stroke();
    // small tie knot outside the skirt, at waist
    ctx.restore();
    ctx.save();
    ctx.strokeStyle = "#374151";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(252, 46);
    ctx.bezierCurveTo(275, 40, 290, 60, 278, 72);
    ctx.stroke();
    ctx.restore();
  }
  if (type === "flared") {
    ctx.save();
    ctx.clip(path);
    ctx.strokeStyle = "rgba(31,41,55,0.25)";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 5]);
    ctx.beginPath();
    ctx.moveTo(170, 290);
    ctx.lineTo(230, 290);
    ctx.stroke();
    ctx.restore();
  }
}

function SkirtPreview({
  patternUrl,
  skirtType,
}: {
  patternUrl: string;
  skirtType: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setError(false);
    setReady(false);

    let cancelled = false;
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      if (cancelled) return;
      try {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const tileSize = 110;
        const tile = document.createElement("canvas");
        tile.width = tileSize;
        tile.height = tileSize;
        const tctx = tile.getContext("2d");
        if (!tctx) throw new Error("no tile ctx");
        tctx.drawImage(img, 0, 0, tileSize, tileSize);

        const pattern = ctx.createPattern(tile, "repeat");
        if (!pattern) throw new Error("no pattern");

        const path = buildSkirtPath(skirtType);

        ctx.save();
        ctx.fillStyle = pattern;
        ctx.fill(path);
        ctx.restore();

        drawSkirtDetails(ctx, skirtType, path);

        ctx.save();
        ctx.strokeStyle = "#374151";
        ctx.lineWidth = 2.5;
        ctx.lineJoin = "round";
        ctx.stroke(path);
        ctx.restore();

        setReady(true);
      } catch {
        setError(true);
      }
    };

    img.onerror = () => {
      if (!cancelled) setError(true);
    };

    img.src = patternUrl;

    return () => {
      cancelled = true;
    };
  }, [patternUrl, skirtType]);

  return (
    <div className="rounded-3xl border border-gray-100 bg-gradient-to-br from-[#FF6B9D]/5 to-[#C084FC]/5 p-6">
      <h3 className="text-center text-sm font-semibold tracking-wide text-gray-800">
        效果预览
      </h3>
      <div className="mt-4 flex min-h-[320px] items-center justify-center">
        {error ? (
          <div className="text-sm text-gray-400">预览暂时不可用</div>
        ) : (
          <canvas
            ref={canvasRef}
            width={400}
            height={500}
            className={`h-auto max-w-full transition-opacity duration-300 ${
              ready ? "opacity-100" : "opacity-0"
            }`}
          />
        )}
      </div>
      <div className="mt-3 text-center text-[11px] text-gray-400">
        实际效果以收到实物为准
      </div>
    </div>
  );
}
