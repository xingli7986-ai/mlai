"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import ConsumerNav from "@/components/ConsumerNav";
import StudioStepGate from "@/components/my-studio/StudioStepGate";
import { useToast } from "@/components/ui/Toast";
import { generatedImageUrl } from "@/lib/my-studio/generate-response";
import { DEFAULT_BODY_PROFILE, DEFAULT_GARMENT_TEMPLATES } from "@/lib/my-studio/work";
import type {
  StudioBodyProfile,
  StudioAsset,
  StudioGenerateResponse,
  StudioGarmentTemplate,
  StudioTryOnGenerationGroup,
  StudioTryOnPreviewPreference,
  StudioWorkDTO,
} from "@/lib/my-studio/types";
import "./try-on.css";

type ModelStyle = StudioTryOnPreviewPreference["modelStyle"];
type Atmosphere = StudioTryOnPreviewPreference["atmosphere"];
type Framing = StudioTryOnPreviewPreference["framing"];

const FLOW_STEPS = ["印花创作", "虚拟试穿", "开始定制"];
const WORK_NOT_FOUND_MESSAGE = "当前作品不存在或无权访问，请回到我的设计工作室重新选择作品。";
const TRY_ON_PLACEHOLDER = "/assets/my-studio/try-on/try-on-preview-placeholder.svg";
const EMPTY_HISTORY_IMAGE = "/assets/my-studio/empty/empty-try-on-history.svg";
const DIGITAL_ASSETS_ICON = "/assets/my-studio/icons/icon-digital-assets.svg";
const SELECTED_ICON = "/assets/my-studio/icons/icon-tryon-selected.svg";

const MODEL_STYLE_OPTIONS: { id: ModelStyle; label: string; desc: string }[] = [
  { id: "commute", label: "通勤自然", desc: "干净、日常，适合判断真实穿着感。" },
  { id: "resort", label: "度假轻松", desc: "舒展明亮，适合轻松场景。" },
  { id: "evening", label: "晚宴精致", desc: "更有仪式感，突出优雅线条。" },
];

const ATMOSPHERE_OPTIONS: { id: Atmosphere; label: string }[] = [
  { id: "studio", label: "棚拍干净" },
  { id: "natural-light", label: "自然光" },
  { id: "city", label: "城市街拍" },
];

const FRAMING_OPTIONS: { id: Framing; label: string }[] = [
  { id: "front", label: "正面展示" },
  { id: "side", label: "侧身展示" },
  { id: "full-body", label: "全身展示" },
];

const FIT_OPTIONS: { id: NonNullable<StudioBodyProfile["fitPreference"]>; label: string }[] = [
  { id: "slim", label: "修身" },
  { id: "regular", label: "合身" },
  { id: "relaxed", label: "微宽松" },
];

const REVISION_REASONS = [
  "印花不准确",
  "版型不喜欢",
  "裙长不合适",
  "腰线不合适",
  "袖长不合适",
  "身材比例不像我",
  "想换模特姿态",
  "想换拍摄风格",
];

const DEFAULT_TRY_ON_PREFERENCE: StudioTryOnPreviewPreference = {
  modelStyle: "commute",
  atmosphere: "studio",
  framing: "full-body",
};

export default function TryOnPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const workId = searchParams.get("workId") || "";

  const [work, setWork] = useState<StudioWorkDTO | null>(null);
  const [loadingWork, setLoadingWork] = useState(Boolean(workId));
  const [workLoadError, setWorkLoadError] = useState("");
  const [modelStyle, setModelStyle] = useState<ModelStyle>(DEFAULT_TRY_ON_PREFERENCE.modelStyle);
  const [atmosphere, setAtmosphere] = useState<Atmosphere>(DEFAULT_TRY_ON_PREFERENCE.atmosphere);
  const [framing, setFraming] = useState<Framing>(DEFAULT_TRY_ON_PREFERENCE.framing);
  const [bodyProfile, setBodyProfile] = useState<StudioBodyProfile>({ ...DEFAULT_BODY_PROFILE });
  const [selectedTemplateId, setSelectedTemplateId] = useState(DEFAULT_GARMENT_TEMPLATES[0]?.id || "");
  const [showRevision, setShowRevision] = useState(false);
  const [revisionReason, setRevisionReason] = useState("");
  const [generating, setGenerating] = useState(false);
  const [selectingId, setSelectingId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!workId) return;
    let alive = true;
    setLoadingWork(true);
    setWorkLoadError("");
    fetch(`/api/my-studio/works/${encodeURIComponent(workId)}`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { work?: StudioWorkDTO } | null) => {
        if (!alive) return;
        if (!data?.work) {
          setWork(null);
          setWorkLoadError(WORK_NOT_FOUND_MESSAGE);
          return;
        }
        setWork(data.work);
        const savedPreference = data.work.preferenceMemory.tryOnPreview;
        if (savedPreference) {
          setModelStyle(savedPreference.modelStyle);
          setAtmosphere(savedPreference.atmosphere);
          setFraming(savedPreference.framing);
        }
        setBodyProfile({
          ...DEFAULT_BODY_PROFILE,
          ...(data.work.bodyProfile || {}),
          usualSize: data.work.bodyProfile?.usualSize || data.work.config.size || "M",
        });
        setSelectedTemplateId(
          data.work.selectedAssets.garmentTemplateId ||
            data.work.garmentTemplates[0]?.id ||
            DEFAULT_GARMENT_TEMPLATES[0]?.id ||
            "",
        );
      })
      .catch(() => {
        if (alive) setWorkLoadError(WORK_NOT_FOUND_MESSAGE);
      })
      .finally(() => {
        if (alive) setLoadingWork(false);
      });
    return () => {
      alive = false;
    };
  }, [workId]);

  const selectedPattern = useMemo(() => {
    const selectedId = work?.selectedAssets.patternResultId;
    if (!selectedId) return undefined;
    return work?.assets.patterns.find((asset) => asset.id === selectedId);
  }, [work]);
  const garmentTemplates = useMemo(
    () => (work?.garmentTemplates?.length ? work.garmentTemplates : DEFAULT_GARMENT_TEMPLATES),
    [work?.garmentTemplates],
  );
  const selectedTemplate = useMemo(
    () => garmentTemplates.find((item) => item.id === selectedTemplateId) || garmentTemplates[0],
    [garmentTemplates, selectedTemplateId],
  );

  const tryOnAssets = work?.assets.tryOns ?? [];
  const selectedTryOn = useMemo(() => {
    const selectedId = work?.selectedAssets.tryOnResultId;
    if (!selectedId) return undefined;
    return tryOnAssets.find((asset) => asset.id === selectedId);
  }, [tryOnAssets, work?.selectedAssets.tryOnResultId]);

  const historyGroups = useMemo(
    () => buildTryOnGroups(tryOnAssets, work?.tryOnGenerationGroups ?? []),
    [tryOnAssets, work?.tryOnGenerationGroups],
  );

  const historyThumbs = useMemo(
    () =>
      [...tryOnAssets].sort(
        (a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime(),
      ),
    [tryOnAssets],
  );

  const currentPreference: StudioTryOnPreviewPreference = { modelStyle, atmosphere, framing };
  const previewAsset = selectedTryOn ?? historyThumbs[0];
  const previewImage = previewAsset?.imageUrl ?? TRY_ON_PLACEHOLDER;
  const hasSelectedTryOn = Boolean(selectedTryOn);
  const bodyReady = Boolean(bodyProfile.heightCm && bodyProfile.weightKg);
  const canGenerate = Boolean(selectedPattern && selectedTemplate && bodyReady);
  const nextHref = `/my-studio/confirm-design?workId=${encodeURIComponent(workId)}`;
  const digitalAssetsHref = "/my-studio#my-design-works";

  function updateBodyProfile<K extends keyof StudioBodyProfile>(key: K, value: StudioBodyProfile[K]) {
    setBodyProfile((current) => ({ ...current, [key]: value }));
  }

  async function patchWorkSettings(nextBodyProfile: StudioBodyProfile, template: StudioGarmentTemplate) {
    const res = await fetch(`/api/my-studio/works/${encodeURIComponent(workId)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bodyProfile: nextBodyProfile,
        selectedGarmentTemplateId: template.id,
        config: {
          size: nextBodyProfile.usualSize || work?.config.size,
          silhouette: template.silhouette,
          neckline: template.neckline,
          sleeveType: template.sleeve,
          skirtLength: template.skirtLength,
          waistline: template.waistline,
        },
      }),
    });
    const data = (await res.json().catch(() => ({}))) as { work?: StudioWorkDTO; error?: string };
    if (!res.ok || !data.work) throw new Error(data.error || "身材和版型保存失败，请稍后重试。");
    setWork(data.work);
    return data.work;
  }

  async function generateTryOn(nextRevisionReason?: string) {
    if (!workId || !work || !selectedPattern || !selectedTemplate) return;
    if (!bodyReady) {
      setError("请先填写身高和体重，再生成我的上身效果图。");
      return;
    }
    setGenerating(true);
    setError("");
    const groupId = `tryon-${Date.now()}`;
    const profileForGeneration: StudioBodyProfile = {
      ...bodyProfile,
      bodyShape: bodyProfile.bodyShape || inferBodyShape(bodyProfile.heightCm, bodyProfile.weightKg),
      measurementMode: bodyProfile.measurementMode || "quick",
      updatedAt: new Date().toISOString(),
    };
    setBodyProfile(profileForGeneration);

    try {
      const persistedWork = await patchWorkSettings(profileForGeneration, selectedTemplate);
      const prompt = buildTryOnPrompt(persistedWork, selectedPattern, currentPreference, profileForGeneration, selectedTemplate, nextRevisionReason);
      const tryOnSource: "direct-pattern-try-on" | "remix-pattern-try-on" | "regenerate-fit" = nextRevisionReason
        ? "regenerate-fit"
        : selectedPattern.source?.type?.includes("remix")
          ? "remix-pattern-try-on"
          : "direct-pattern-try-on";
      const res = await fetch("/api/ai-studio/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool: "try-on",
          workId,
          patternAssetId: selectedPattern.id,
          patternImageUrl: selectedPattern.imageUrl,
          bodyProfile: profileForGeneration,
          garmentTemplate: selectedTemplate,
          fitPreference: profileForGeneration.fitPreference,
          revisionReason: nextRevisionReason,
          prompt,
          sourceWorkId: workId,
          sourceImageUrl: selectedPattern.imageUrl,
          sourceImageUrls: [selectedPattern.imageUrl],
          params: {
            workId,
            patternAssetId: selectedPattern.id,
            patternImageUrl: selectedPattern.imageUrl,
            bodyProfile: profileForGeneration,
            garmentTemplate: selectedTemplate,
            fitPreference: profileForGeneration.fitPreference,
            revisionReason: nextRevisionReason,
            sourcePatternResultId: selectedPattern.id,
            garmentType: persistedWork.config.garmentType,
            silhouette: selectedTemplate.silhouette,
            occasion: persistedWork.config.occasion,
            size: profileForGeneration.usualSize || persistedWork.config.size,
            tryOnPreview: currentPreference,
          },
          count: 4,
          size: "3:4",
        }),
      });
      const data = (await res.json()) as StudioGenerateResponse;
      const urls = (data.images || [])
        .map(generatedImageUrl)
        .filter((url): url is string => Boolean(url));
      const images = urls.length > 0 ? urls : data.imageUrl ? [data.imageUrl] : [];
      if (!res.ok || !data.success || images.length === 0) {
        throw new Error("虚拟试穿生成失败，请稍后重试。");
      }

      const nextPreferenceMemory = {
        ...work.preferenceMemory,
        tryOnPreview: currentPreference,
      };
      const displayLabels = tryOnLabelParts(currentPreference);
      const saveRes = await fetch(`/api/my-studio/works/${encodeURIComponent(workId)}/results`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "tryOn",
          tool: "try-on",
          resultType: "tryOn",
          prompt: "生成我的上身效果图",
          provider: data.provider,
          model: data.model,
          isFallback: Boolean(data.isFallback),
          inputAssetId: selectedPattern.id,
          patternAssetId: selectedPattern.id,
          bodyProfile: profileForGeneration,
          garmentTemplate: selectedTemplate,
          fitPreference: profileForGeneration.fitPreference,
          revisionReason: nextRevisionReason,
          tryOnSource,
          sourcePatternResultId: selectedPattern.id,
          groupId,
          selectFirst: true,
          preferenceMemory: nextPreferenceMemory,
          preferenceSnapshot: {
            tryOnPreview: currentPreference,
            sourcePatternResultId: selectedPattern.id,
            bodyProfile: profileForGeneration,
            garmentTemplate: selectedTemplate,
            revisionReason: nextRevisionReason,
          },
          params: {
            sourcePatternResultId: selectedPattern.id,
            patternAssetId: selectedPattern.id,
            bodyProfile: profileForGeneration,
            garmentTemplate: selectedTemplate,
            fitPreference: profileForGeneration.fitPreference,
            revisionReason: nextRevisionReason,
            tryOnPreview: currentPreference,
          },
          metadata: {
            ...data.metadata,
            displayLabels,
            bodyProfileSnapshot: profileForGeneration,
            garmentTemplateSnapshot: selectedTemplate,
            revisionReason: nextRevisionReason,
          },
          assets: images.map((imageUrl, index) => ({
            imageUrl,
            images: [imageUrl],
            prompt: "生成我的上身效果图",
            provider: data.provider,
            model: data.model,
            isFallback: Boolean(data.isFallback),
            inputAssetId: selectedPattern.id,
            patternAssetId: selectedPattern.id,
            bodyProfileSnapshot: profileForGeneration,
            garmentTemplateSnapshot: selectedTemplate,
            fitPreference: profileForGeneration.fitPreference,
            revisionReason: nextRevisionReason,
            tryOnSource,
            tryOnStatus: data.isFallback ? "fallback" : "generated",
            groupId,
            params: {
              sourcePatternResultId: selectedPattern.id,
              patternAssetId: selectedPattern.id,
              bodyProfile: profileForGeneration,
              garmentTemplate: selectedTemplate,
              fitPreference: profileForGeneration.fitPreference,
              revisionReason: nextRevisionReason,
              tryOnPreview: currentPreference,
              resultIndex: index,
            },
            metadata: {
              ...data.metadata,
              displayLabels,
              bodyProfileSnapshot: profileForGeneration,
              garmentTemplateSnapshot: selectedTemplate,
              revisionReason: nextRevisionReason,
            },
          })),
        }),
      });
      const saved = (await saveRes.json().catch(() => ({}))) as { work?: StudioWorkDTO; error?: string };
      if (!saveRes.ok || !saved.work) throw new Error("虚拟试穿生成失败，请稍后重试。");
      setWork(saved.work);
      setShowRevision(false);
      setRevisionReason("");
      toast.show(data.isFallback ? "示例预览已保存为当前上身效果。" : "上身效果图已保存。", {
        tone: data.isFallback ? "warning" : "success",
      });
    } catch (err) {
      console.error("[my-studio] try-on generation failed", err);
      const message = "虚拟试穿生成失败，请稍后重试。";
      setError(message);
      toast.show(message, { tone: "error" });
    } finally {
      setGenerating(false);
    }
  }

  async function selectTryOn(assetId: string) {
    if (!workId || selectingId) return;
    setSelectingId(assetId);
    try {
      const res = await fetch(`/api/my-studio/works/${encodeURIComponent(workId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectAsset: { kind: "tryOn", assetId } }),
      });
      const data = (await res.json().catch(() => ({}))) as { work?: StudioWorkDTO; error?: string };
      if (!res.ok || !data.work) throw new Error("选择当前上身效果失败，请稍后重试。");
      setWork(data.work);
      toast.show("已设为当前上身效果。", { tone: "success" });
    } catch (err) {
      toast.show(err instanceof Error ? err.message : "选择当前上身效果失败，请稍后重试。", {
        tone: "warning",
      });
    } finally {
      setSelectingId("");
    }
  }

  if (!workId) {
    return (
      <StudioStepGate
        title="请先从“我的设计工作室”选择一件作品。"
        description="虚拟试穿需要读取同一件作品里的当前印花。"
        actionHref="/my-studio"
        actionLabel="返回我的设计工作室"
      />
    );
  }

  if (!loadingWork && workLoadError) {
    return (
      <StudioStepGate
        title={WORK_NOT_FOUND_MESSAGE}
        description="你仍然可以回到工作室重新选择作品。"
        actionHref="/my-studio"
        actionLabel="返回我的设计工作室"
      />
    );
  }

  if (!loadingWork && work && !selectedPattern) {
    return (
      <StudioStepGate
        title="你还没有为这件衣服选定印花。"
        description="请先回到印花创作中心，选择一张当前印花，再进入虚拟试穿。"
        actionHref={`/my-studio/pattern-generate?workId=${encodeURIComponent(workId)}`}
        actionLabel="返回印花创作中心"
      />
    );
  }

  return (
    <div className="toPage">
      <ConsumerNav variant="solid" />
      <div className="toContainer">
        {loadingWork && <div className="toNotice">正在读取作品和当前印花...</div>}

        {work && selectedPattern && (
          <div className="toStudioFrame">
            <aside className="toWorkbench" aria-label="工作台参数区">
              <section className="toPanel toWorkCard">
                <nav className="toCrumb" aria-label="面包屑">
                  <Link href="/my-studio">我的设计工作室</Link>
                  <span aria-hidden>/</span>
                  <span>虚拟试穿</span>
                </nav>
                <div className="toWorkbenchTitle">
                  <h1>虚拟试穿</h1>
                  <p>查看印花穿在衣服上的效果，确认后开始定制。</p>
                </div>
                <div className="toProgress" aria-label="设计流程进度">
                  {FLOW_STEPS.map((step, index) => (
                    <span key={step} className={index === 1 ? "is-active" : index < 1 ? "is-done" : ""}>
                      <b>{index + 1}</b>
                      {step}
                    </span>
                  ))}
                </div>
                <div className="toSectionTitle">
                  <span>当前设计</span>
                  <strong>{work.title}</strong>
                </div>
                <h2>款式与版型</h2>
                <div className="toMetaGrid">
                  <span>{work.config.garmentType || "连衣裙"}</span>
                  <span>{work.config.silhouette || "A 字裙"}</span>
                  <span>{work.config.occasion || "通勤"}</span>
                  <span>{work.config.size || "M"}</span>
                </div>
                <div className="toAssetCounts" aria-label="作品资产统计">
                  <span>印花 {work.assetCounts.patterns}</span>
                  <span>试穿 {work.assetCounts.tryOns}</span>
                </div>
              </section>

              <section className="toPanel toApplicationCard">
                <div className="toPanelHead">
                  <div>
                    <p className="toEyebrow">当前印花</p>
                    <h2>用于上身效果的印花</h2>
                  </div>
                  <Link className="toTextLink" href={`/my-studio/pattern-generate?workId=${encodeURIComponent(workId)}`}>
                    更换
                  </Link>
                </div>
                <div className="toSourceCard">
                  <img src={selectedPattern.imageUrl} alt="当前印花" />
                  <div>
                    <strong>用于本次试穿的印花</strong>
                    <span>{patternSummary(selectedPattern)}</span>
                    <small>
                      {selectedPattern.generatedAt
                        ? `保存于 ${formatDateTime(selectedPattern.generatedAt)}`
                        : "已保存到当前作品"}
                    </small>
                  </div>
                </div>
              </section>

              <section className="toPanel toBodyPanel">
                <div className="toPanelHead">
                  <div>
                    <p className="toEyebrow">我的身材比例</p>
                    <h2>身高体重与尺码</h2>
                    <p>用于让上身效果更贴近你的比例。</p>
                  </div>
                </div>
                <div className="toBodyGrid">
                  <BodyInput label="身高 cm" value={bodyProfile.heightCm} onChange={(value) => updateBodyProfile("heightCm", value)} />
                  <BodyInput label="体重 kg" value={bodyProfile.weightKg} onChange={(value) => updateBodyProfile("weightKg", value)} />
                  <BodyInput label="肩宽 cm" value={bodyProfile.shoulderCm} onChange={(value) => updateBodyProfile("shoulderCm", value)} />
                  <BodyInput label="胸围 cm" value={bodyProfile.bustCm} onChange={(value) => updateBodyProfile("bustCm", value)} />
                  <BodyInput label="腰围 cm" value={bodyProfile.waistCm} onChange={(value) => updateBodyProfile("waistCm", value)} />
                  <BodyInput label="臀围 cm" value={bodyProfile.hipCm} onChange={(value) => updateBodyProfile("hipCm", value)} />
                </div>
                <div className="toBodyInline">
                  <label>
                    常穿尺码
                    <select
                      value={bodyProfile.usualSize || "M"}
                      onChange={(event) => updateBodyProfile("usualSize", event.target.value)}
                    >
                      {["S", "M", "L", "XL"].map((size) => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                  </label>
                  <div>
                    <span>穿着松量</span>
                    <div className="toFitGroup">
                      {FIT_OPTIONS.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          className={bodyProfile.fitPreference === item.id ? "is-selected" : ""}
                          onClick={() => updateBodyProfile("fitPreference", item.id)}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <section className="toPanel toTemplatePanel">
                <div className="toPanelHead">
                  <div>
                    <p className="toEyebrow">选择版型</p>
                    <h2>这件衣服的轮廓</h2>
                  </div>
                </div>
                <div className="toTemplateList">
                  {garmentTemplates.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={selectedTemplate?.id === item.id ? "is-selected" : ""}
                      onClick={() => setSelectedTemplateId(item.id)}
                    >
                      <b>{item.name}</b>
                      <span>{[item.neckline, item.sleeve, item.skirtLength, item.waistline].filter(Boolean).join(" / ")}</span>
                    </button>
                  ))}
                </div>
              </section>

              <section className="toPanel toControlPanel" id="generate-try-on">
                <div className="toPanelHead">
                  <div>
                    <h2>试穿参数</h2>
                    <p>选择希望看到的呈现方式，生成我的上身效果图。</p>
                  </div>
                </div>

                <div className="toControlGroup">
                  <h3>试穿呈现风格</h3>
                  <div className="toOptionList">
                    {MODEL_STYLE_OPTIONS.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className={modelStyle === item.id ? "is-selected" : ""}
                        onClick={() => setModelStyle(item.id)}
                      >
                        <b>{item.label}</b>
                        <span>{item.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <OptionGroup
                  title="拍摄氛围"
                  options={ATMOSPHERE_OPTIONS}
                  value={atmosphere}
                  onChange={(value) => setAtmosphere(value as Atmosphere)}
                />
                <OptionGroup
                  title="服装展示"
                  options={FRAMING_OPTIONS}
                  value={framing}
                  onChange={(value) => setFraming(value as Framing)}
                />

                {error && <p className="toError">{error}</p>}
              </section>

              <section className="toPanel toNextPanel">
                <p>
                  {hasSelectedTryOn
                    ? "当前上身效果将用于下一步定制信息填写。"
                    : bodyReady
                      ? "请先生成或选择一张上身效果图。"
                      : "请先填写身高和体重，再生成我的上身效果图。"}
                </p>
                <button
                  type="button"
                  className="toNextButton"
                  disabled={!hasSelectedTryOn}
                  onClick={() => router.push(nextHref)}
                >
                  下一步：开始定制
                </button>
                <button type="button" className="toRegenerateButton" disabled={generating || !canGenerate} onClick={() => generateTryOn()}>
                  {generating ? "正在生成..." : tryOnAssets.length > 0 ? "重新生成我的上身效果图" : "生成我的上身效果图"}
                </button>
                {hasSelectedTryOn && (
                  <button type="button" className="toRevisionToggle" onClick={() => setShowRevision((value) => !value)}>
                    不满意，调整后重试
                  </button>
                )}
                {showRevision && (
                  <div className="toRevisionPanel">
                    <p>选择一个原因，系统会保留原图并追加生成新的上身效果。</p>
                    <div className="toRevisionReasons">
                      {REVISION_REASONS.map((item) => (
                        <button
                          key={item}
                          type="button"
                          className={revisionReason === item ? "is-selected" : ""}
                          onClick={() => setRevisionReason(item)}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                    {revisionReason === "版型不喜欢" && (
                      <div className="toRevisionTemplates">
                        {garmentTemplates.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            className={selectedTemplate?.id === item.id ? "is-selected" : ""}
                            onClick={() => setSelectedTemplateId(item.id)}
                          >
                            {item.name}
                          </button>
                        ))}
                      </div>
                    )}
                    <button
                      type="button"
                      className="toRegenerateButton"
                      disabled={!revisionReason || generating || !canGenerate}
                      onClick={() => generateTryOn(revisionReason)}
                    >
                      按这个调整重新生成
                    </button>
                  </div>
                )}
              </section>
            </aside>

            <main className="toPreviewStage" aria-label="虚拟试穿">
              <div className="toPreviewToolbar">
                <div>
                  <p className="toEyebrow">虚拟试穿</p>
                  <h2>{hasSelectedTryOn ? "当前上身效果" : "等待生成上身效果"}</h2>
                </div>
                <button
                  type="button"
                  className="toZoomButton"
                  disabled={!previewAsset}
                  onClick={() => previewAsset && window.open(previewImage, "_blank", "noopener,noreferrer")}
                  aria-label="查看大图"
                >
                  放大
                </button>
              </div>

              <div className={`toPreviewCanvas${hasSelectedTryOn ? " is-selected" : ""}`}>
                <img src={previewImage} alt={hasSelectedTryOn ? "当前上身效果图" : "上身效果占位图"} />
                {hasSelectedTryOn && <span className="toSelectedFlag">当前上身效果</span>}
              </div>

              <div className="toPreviewCaption">
                <strong>{previewAsset ? tryOnSummary(previewAsset) : "生成后可在右侧选择当前上身效果"}</strong>
                <span>AI 虚拟试穿仅供设计参考，实际成衣以最终工艺和面料为准。</span>
              </div>

              <div className="toThumbStrip" aria-label="最近虚拟试穿缩略图">
                {historyThumbs.length === 0 ? (
                  <div className="toThumbEmpty">
                    <img src={EMPTY_HISTORY_IMAGE} alt="" />
                    <span>生成后的上身效果会出现在这里。</span>
                  </div>
                ) : (
                  historyThumbs.slice(0, 5).map((asset) => (
                    <button
                      key={asset.id}
                      type="button"
                      className={selectedTryOn?.id === asset.id ? "is-selected" : ""}
                      disabled={selectingId === asset.id}
                      onClick={() => selectTryOn(asset.id)}
                    >
                      <img src={asset.imageUrl} alt="上身效果缩略图" />
                    </button>
                  ))
                )}
              </div>
            </main>

            <aside className="toHistoryRail" aria-label="历史试穿缩略栏">
              <Link className="toDigitalAssetsButton" href={digitalAssetsHref}>
                <img src={DIGITAL_ASSETS_ICON} alt="" />
                数字资产
              </Link>
              <div className="toRailHeader">
                <strong>历史试穿</strong>
                <span>{historyGroups.length} 组 / {tryOnAssets.length} 张</span>
              </div>
              <div className="toRailList">
                {historyThumbs.length === 0 ? (
                  <div className="toRailEmpty">
                    <img src={EMPTY_HISTORY_IMAGE} alt="" />
                    <span>暂无历史</span>
                  </div>
                ) : (
                  historyThumbs.map((asset) => (
                    <TryOnRailThumb
                      key={asset.id}
                      asset={asset}
                      selected={selectedTryOn?.id === asset.id}
                      disabled={selectingId === asset.id}
                      pattern={work.assets.patterns.find((item) => item.id === asset.patternAssetId || item.id === asset.inputAssetId)}
                      onSelect={() => selectTryOn(asset.id)}
                    />
                  ))
                )}
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}

function OptionGroup({
  title,
  options,
  value,
  onChange,
}: {
  title: string;
  options: { id: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="toControlGroup">
      <h3>{title}</h3>
      <div className="toSegmented">
        {options.map((item) => (
          <button
            key={item.id}
            type="button"
            className={value === item.id ? "is-selected" : ""}
            onClick={() => onChange(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function BodyInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: number;
  onChange: (value: number | undefined) => void;
}) {
  return (
    <label className="toBodyInput">
      {label}
      <input
        type="number"
        min={0}
        value={value ?? ""}
        onChange={(event) => {
          const next = event.target.value ? Number(event.target.value) : undefined;
          onChange(Number.isFinite(next) ? next : undefined);
        }}
      />
    </label>
  );
}

function TryOnRailThumb({
  asset,
  pattern,
  selected,
  disabled,
  onSelect,
}: {
  asset: StudioAsset;
  pattern?: StudioAsset;
  selected: boolean;
  disabled: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      className={`toRailThumb${selected ? " is-selected" : ""}`}
      disabled={disabled}
      onClick={onSelect}
      title={selected ? "当前上身效果" : "设为当前上身效果"}
    >
      <img src={asset.imageUrl} alt="历史上身效果缩略图" />
      {pattern && <img className="toRailPattern" src={pattern.imageUrl} alt="对应印花缩略图" />}
      {selected && (
        <span>
          <img src={SELECTED_ICON} alt="" />
          当前
        </span>
      )}
      {asset.isFallback && <em>示例</em>}
      <small>
        {asset.garmentTemplateSnapshot?.name || "已保存版型"}
        <br />
        {formatDateTime(asset.generatedAt)}
      </small>
    </button>
  );
}

function buildTryOnPrompt(
  work: StudioWorkDTO,
  pattern: StudioAsset,
  preference: StudioTryOnPreviewPreference,
  bodyProfile: StudioBodyProfile,
  garmentTemplate: StudioGarmentTemplate,
  revisionReason?: string,
): string {
  return [
    "Create refined premium womenswear virtual fitting preview images for MaxLuLu AI.",
    `Use the selected print as the exact fabric pattern. Pattern asset id for reference only: ${pattern.id}.`,
    "Preserve the print color palette and motif distribution. Do not invent a different print.",
    `Apply the print to the selected dress silhouette: ${garmentTemplate.name}, ${garmentTemplate.silhouette}. Neckline: ${garmentTemplate.neckline || "follow template"}; sleeve: ${garmentTemplate.sleeve || "follow template"}; skirt length: ${garmentTemplate.skirtLength || "follow template"}; waistline: ${garmentTemplate.waistline || "follow template"}.`,
    `Garment context: ${work.config.garmentType || "dress"}; occasion: ${work.config.occasion || "daily"}; size: ${bodyProfile.usualSize || work.config.size || "M"}; fit preference: ${fitLabel(bodyProfile.fitPreference)}.`,
    `Body proportion should match: height ${bodyProfile.heightCm || "unknown"}cm, weight ${bodyProfile.weightKg || "unknown"}kg, shoulder ${bodyProfile.shoulderCm || "unknown"}cm, bust ${bodyProfile.bustCm || "unknown"}cm, waist ${bodyProfile.waistCm || "unknown"}cm, hip ${bodyProfile.hipCm || "unknown"}cm.`,
    `Virtual fitting style: ${tryOnLabelParts(preference).join(" / ")}.`,
    revisionReason ? `Regenerate because the user said: ${revisionReason}. Keep the same selected print unless the garment template changed.` : "",
    "Show a wearable garment preview for a consumer to judge overall style, proportion and mood.",
    "Generate a model wearing the garment. Do not change the selected dress silhouette unless garmentTemplate changed.",
    "No text, no logo, no watermark, no technical sheet, no line sketch.",
  ].filter(Boolean).join("\n");
}

function tryOnLabelParts(preference: StudioTryOnPreviewPreference): string[] {
  return [
    MODEL_STYLE_OPTIONS.find((item) => item.id === preference.modelStyle)?.label || "通勤自然",
    ATMOSPHERE_OPTIONS.find((item) => item.id === preference.atmosphere)?.label || "棚拍干净",
    FRAMING_OPTIONS.find((item) => item.id === preference.framing)?.label || "全身展示",
  ];
}

function fitLabel(value: StudioBodyProfile["fitPreference"]): string {
  return FIT_OPTIONS.find((item) => item.id === value)?.label || "合身";
}

function inferBodyShape(heightCm?: number, weightKg?: number): string {
  if (!heightCm || !weightKg) return "未设定";
  const bmi = weightKg / Math.pow(heightCm / 100, 2);
  if (!Number.isFinite(bmi)) return "未设定";
  if (bmi < 18.5) return "纤细";
  if (bmi < 24) return "标准";
  return "丰满";
}

function tryOnSummary(asset: StudioAsset): string {
  const preference = readTryOnPreference(asset);
  const template = asset.garmentTemplateSnapshot?.name;
  if (preference) return [template, ...tryOnLabelParts(preference)].filter(Boolean).join(" / ");
  if (asset.isFallback) return "示例预览";
  return "上身效果";
}

function readTryOnPreference(asset: StudioAsset): StudioTryOnPreviewPreference | null {
  const params = asset.params;
  const value = params && typeof params === "object" ? params.tryOnPreview : undefined;
  if (!value || typeof value !== "object") return null;
  const record = value as Partial<StudioTryOnPreviewPreference>;
  if (!record.modelStyle || !record.atmosphere || !record.framing) return null;
  return {
    modelStyle: record.modelStyle,
    atmosphere: record.atmosphere,
    framing: record.framing,
  };
}

function patternSummary(asset: StudioAsset): string {
  const labels = asset.metadata?.displayLabels;
  if (Array.isArray(labels)) {
    const summary = labels.filter((item): item is string => typeof item === "string").join(" / ");
    if (summary) return summary;
  }
  if (asset.isFallback) return "示例预览";
  return "已选为这件衣服的当前印花";
}

function buildTryOnGroups(
  assets: StudioAsset[],
  groups: StudioTryOnGenerationGroup[],
): { id: string; title: string; time: string; assets: StudioAsset[] }[] {
  const output = groups
    .map((group) => {
      const groupAssets = assets.filter((asset) => group.resultIds.includes(asset.id));
      if (groupAssets.length === 0) return null;
      return {
        id: group.groupId,
        title: "虚拟试穿",
        time: formatDateTime(group.generatedAt),
        assets: groupAssets,
      };
    })
    .filter((item): item is { id: string; title: string; time: string; assets: StudioAsset[] } => Boolean(item));

  const groupedIds = new Set(output.flatMap((group) => group.assets.map((asset) => asset.id)));
  const rest = assets.filter((asset) => !groupedIds.has(asset.id));
  if (rest.length > 0) {
    output.push({
      id: "ungrouped-tryons",
      title: "早期保存的虚拟试穿",
      time: "已保存",
      assets: rest,
    });
  }
  return output;
}

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
