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
  TryOnFidelityMode,
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

const TRY_ON_GENERATION_STAGES = [
  "正在准备印花平铺图",
  "正在匹配版型模板",
  "正在生成服装区域",
  "正在合成高保真试穿图",
  "正在保存数字资产",
];

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
  const [requestedFidelityMode, setRequestedFidelityMode] = useState<TryOnFidelityMode>("masked_garment_tryon");
  const [showRevision, setShowRevision] = useState(false);
  const [revisionReason, setRevisionReason] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generationStage, setGenerationStage] = useState(0);
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

  useEffect(() => {
    if (!generating) {
      setGenerationStage(0);
      return;
    }
    setGenerationStage(0);
    const timer = window.setInterval(() => {
      setGenerationStage((stage) => Math.min(stage + 1, TRY_ON_GENERATION_STAGES.length - 1));
    }, 1800);
    return () => window.clearInterval(timer);
  }, [generating]);

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
  const readiness = useMemo(
    () => buildTryOnReadiness(Boolean(selectedPattern?.imageUrl), Boolean(selectedTemplate), bodyReady),
    [selectedPattern?.imageUrl, selectedTemplate, bodyReady],
  );
  const canRunRequestedMode =
    canGenerate && (requestedFidelityMode !== "masked_garment_tryon" || readiness.canRunMaskedTryOn);
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
    if (requestedFidelityMode === "masked_garment_tryon" && !readiness.canRunMaskedTryOn) {
      setError("高保真试穿条件未满足，请切换为快速示意试穿，或等待版型模板和服装区域素材补齐。");
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
      const garmentStructure = garmentStructureSnapshot(selectedTemplate);
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
          requestedFidelityMode,
          allowDegrade: requestedFidelityMode !== "masked_garment_tryon",
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
            requestedFidelityMode,
            allowDegrade: requestedFidelityMode !== "masked_garment_tryon",
            bodyProfile: profileForGeneration,
            garmentTemplate: selectedTemplate,
            fitPreference: profileForGeneration.fitPreference,
            revisionReason: nextRevisionReason,
            sourcePatternResultId: selectedPattern.id,
            skirtType: selectedTemplate.name,
            placement: "full",
            scale: "preserve original print scale and density",
            fabricName: "exact selected floral print fabric",
            shotType: "full-body",
            garmentStructure,
            strictPatternReference: true,
            garmentType: persistedWork.config.garmentType,
            silhouette: selectedTemplate.silhouette,
            neckline: selectedTemplate.neckline,
            waist: selectedTemplate.waistline,
            closure: selectedTemplate.closure,
            sleeveLength: selectedTemplate.sleeve,
            dressLength: selectedTemplate.skirtLength,
            occasion: persistedWork.config.occasion,
            size: profileForGeneration.usualSize || persistedWork.config.size,
            tryOnPreview: currentPreference,
          },
          count: 4,
          size: "2:3",
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
      const fidelityMode = data.fidelityMode || (data.isFallback ? "approximate" : requestedFidelityMode);
      const referenceMode = data.referenceMode || (fidelityMode === "masked_garment_tryon" ? "masked_tryon" : fidelityMode === "reference_image" ? "true_image_reference" : "prompt_url_only");
      const metadataRecord = isRecord(data.metadata) ? data.metadata : {};
      const fidelityWarnings = Array.isArray(data.warnings)
        ? data.warnings
        : Array.isArray(metadataRecord.warnings)
          ? metadataRecord.warnings.filter((item): item is string => typeof item === "string")
          : [];
      const qualityScores = isRecord(metadataRecord.qualityScores) ? metadataRecord.qualityScores : undefined;
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
          fidelityMode,
          referenceMode,
          patternReferenceUsed: Boolean(data.patternReferenceUsed),
          maskUsed: Boolean(data.maskUsed),
          isProductionReady: Boolean(data.isProductionReady),
          fidelityWarnings,
          qualityScores,
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
            fidelityMode,
            referenceMode,
            patternReferenceUsed: Boolean(data.patternReferenceUsed),
            maskUsed: Boolean(data.maskUsed),
            isProductionReady: Boolean(data.isProductionReady),
            fidelityWarnings,
            qualityScores,
          },
          params: {
            sourcePatternResultId: selectedPattern.id,
            patternAssetId: selectedPattern.id,
            bodyProfile: profileForGeneration,
            garmentTemplate: selectedTemplate,
            garmentStructure,
            fitPreference: profileForGeneration.fitPreference,
            revisionReason: nextRevisionReason,
            tryOnPreview: currentPreference,
            shotType: "full-body",
          },
          metadata: {
            ...data.metadata,
            displayLabels,
            bodyProfileSnapshot: profileForGeneration,
            garmentTemplateSnapshot: selectedTemplate,
            garmentStructure,
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
            fidelityMode,
            referenceMode,
            patternReferenceUsed: Boolean(data.patternReferenceUsed),
            maskUsed: Boolean(data.maskUsed),
            isProductionReady: Boolean(data.isProductionReady),
            fidelityWarnings,
            qualityScores,
            groupId,
            params: {
              sourcePatternResultId: selectedPattern.id,
              patternAssetId: selectedPattern.id,
              bodyProfile: profileForGeneration,
              garmentTemplate: selectedTemplate,
              garmentStructure,
              fitPreference: profileForGeneration.fitPreference,
              revisionReason: nextRevisionReason,
              tryOnPreview: currentPreference,
              resultIndex: index,
              shotType: "full-body",
            },
            metadata: {
              ...data.metadata,
              displayLabels,
              bodyProfileSnapshot: profileForGeneration,
              garmentTemplateSnapshot: selectedTemplate,
              garmentStructure,
              revisionReason: nextRevisionReason,
              fidelityMode,
              referenceMode,
              patternReferenceUsed: Boolean(data.patternReferenceUsed),
              maskUsed: Boolean(data.maskUsed),
              isProductionReady: Boolean(data.isProductionReady),
              fidelityWarnings,
              qualityScores,
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

              <section className="toPanel toFidelityPanel">
                <div className="toPanelHead">
                  <div>
                    <p className="toEyebrow">高保真试穿准备</p>
                    <h2>生成模式</h2>
                    <p>高保真需要印花、版型模板、模特体型和服装区域都准备好；条件不足时会降级为示意试穿。</p>
                  </div>
                </div>
                <div className="toReadinessGrid">
                  <ReadinessItem label="印花平铺图" ready={readiness.patternTileReady} />
                  <ReadinessItem label="版型模板" ready={readiness.garmentTemplateReady} />
                  <ReadinessItem label="模特体型" ready={readiness.modelBaseReady} />
                  <ReadinessItem label="服装区域" ready={readiness.maskReady} />
                </div>
                <div className="toModeGroup" role="radiogroup" aria-label="试穿模式">
                  <button
                    type="button"
                    className={requestedFidelityMode === "masked_garment_tryon" ? "is-selected" : ""}
                    disabled={!readiness.canRunMaskedTryOn}
                    onClick={() => setRequestedFidelityMode("masked_garment_tryon")}
                  >
                    高保真试穿
                    <span>{readiness.canRunMaskedTryOn ? "推荐" : "素材待补齐"}</span>
                  </button>
                  <button
                    type="button"
                    className={requestedFidelityMode === "approximate" ? "is-selected" : ""}
                    onClick={() => setRequestedFidelityMode("approximate")}
                  >
                    快速示意试穿
                    <span>可先预览整体感觉</span>
                  </button>
                </div>
                {!readiness.canRunMaskedTryOn && (
                  <p className="toFidelityHint">
                    当前结果用于设计预览，印花位置和细节仍可能存在偏差。
                  </p>
                )}
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
                <button type="button" className="toRegenerateButton" disabled={generating || !canRunRequestedMode} onClick={() => generateTryOn()}>
                  {generating ? TRY_ON_GENERATION_STAGES[generationStage] : tryOnAssets.length > 0 ? "重新生成我的上身效果图" : "生成我的上身效果图"}
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
                      disabled={!revisionReason || generating || !canRunRequestedMode}
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

              <div className={`toPreviewCanvas${hasSelectedTryOn ? " is-selected" : ""}${generating ? " is-generating" : ""}`}>
                <img src={previewImage} alt={hasSelectedTryOn ? "当前上身效果图" : "上身效果占位图"} />
                {hasSelectedTryOn && !generating && <span className="toSelectedFlag">当前上身效果</span>}
                {previewAsset && !generating && (
                  <span className={`toFidelityBadge is-${readTryOnFidelityMode(previewAsset)}`}>
                    {tryOnFidelityLabel(previewAsset)}
                  </span>
                )}
                {generating && (
                  <div className="toGeneratingOverlay" aria-live="polite">
                    <div className="toGeneratingFigure" aria-hidden="true">
                      <span />
                    </div>
                    <div className="toGeneratingCopy">
                      <strong>{TRY_ON_GENERATION_STAGES[generationStage]}</strong>
                      <p>系统正在锁定当前印花、身材比例和所选版型，生成全身上身效果。</p>
                      <ol>
                        {TRY_ON_GENERATION_STAGES.map((stage, index) => (
                          <li key={stage} className={index <= generationStage ? "is-active" : ""}>
                            {stage}
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                )}
              </div>

              <div className="toPreviewCaption">
                <strong>{previewAsset ? tryOnSummary(previewAsset) : "生成后可在右侧选择当前上身效果"}</strong>
                <span>{previewAsset ? tryOnFidelityNotice(previewAsset) : "AI 虚拟试穿仅供设计参考，实际成衣以最终工艺和面料为准。"}</span>
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
                {generating && (
                  <div className="toRailGenerating" aria-live="polite">
                    <span />
                    <small>生成中，即将出现在这里</small>
                  </div>
                )}
                {historyThumbs.length === 0 && !generating ? (
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

function ReadinessItem({ label, ready }: { label: string; ready: boolean }) {
  return (
    <div className={ready ? "is-ready" : "is-missing"}>
      <span>{label}</span>
      <strong>{ready ? "已准备" : "待准备"}</strong>
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
      <em>{tryOnFidelityLabel(asset)}</em>
      <small>
        {asset.garmentTemplateSnapshot?.name || "已保存版型"}
        <br />
        {formatDateTime(asset.generatedAt)}
      </small>
    </button>
  );
}

function buildTryOnReadiness(hasPattern: boolean, hasTemplate: boolean, bodyReady: boolean) {
  const maskReady = false;
  return {
    patternTileReady: hasPattern,
    garmentTemplateReady: hasTemplate,
    modelBaseReady: bodyReady,
    maskReady,
    providerReady: true,
    canRunMaskedTryOn: hasPattern && hasTemplate && bodyReady && maskReady,
  };
}

function readTryOnFidelityMode(asset: StudioAsset): TryOnFidelityMode {
  if (
    asset.fidelityMode === "masked_garment_tryon" ||
    asset.fidelityMode === "reference_image" ||
    asset.fidelityMode === "approximate"
  ) {
    return asset.fidelityMode;
  }
  return asset.isFallback ? "approximate" : "approximate";
}

function tryOnFidelityLabel(asset: StudioAsset): string {
  if (asset.isFallback) return "示例预览";
  const mode = readTryOnFidelityMode(asset);
  if (mode === "masked_garment_tryon") return "高保真试穿";
  if (mode === "reference_image") return "参考图试穿";
  return "示意试穿";
}

function tryOnFidelityNotice(asset: StudioAsset): string {
  const mode = readTryOnFidelityMode(asset);
  if (mode === "masked_garment_tryon") {
    return "已使用印花、版型和服装区域生成高保真试穿，生产前仍需后台确认工艺细节。";
  }
  return "当前结果用于设计预览，印花位置和细节仍可能存在偏差。";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function buildTryOnPrompt(
  work: StudioWorkDTO,
  pattern: StudioAsset,
  preference: StudioTryOnPreviewPreference,
  bodyProfile: StudioBodyProfile,
  garmentTemplate: StudioGarmentTemplate,
  revisionReason?: string,
): string {
  const garmentStructure = garmentStructureSnapshot(garmentTemplate);
  const isWrapDress = garmentTemplate.id === "wrap-dress" || /wrap/i.test(garmentTemplate.name) || garmentTemplate.closure?.includes("系带");
  return [
    "Create refined premium womenswear virtual fitting preview images for MaxLuLu AI.",
    `Use the selected print image URL as the exact fabric print reference: ${pattern.imageUrl}.`,
    "The selected print is not mood-board inspiration. It is the exact textile print to place on the garment.",
    "Preserve original floral layout, preserve density, preserve color balance, preserve background tone, preserve motif scale, and preserve motif distribution.",
    "Do not reinterpret the selected print into a different print. Do not invent new flowers, new colors, or a different background.",
    `Apply the print to this exact selected garment template: ${garmentTemplate.name}.`,
    `Garment structure must be followed exactly: silhouette=${garmentStructure.silhouette}; neckline=${garmentStructure.neckline}; waist=${garmentStructure.waist}; closure=${garmentStructure.closure}; sleeveLength=${garmentStructure.sleeveLength}; dressLength=${garmentStructure.dressLength}.`,
    isWrapDress
      ? "This is a wrap dress, not an A-line dress. Show wrap-front construction, overlapping front panels, visible waist tie, and a V neckline. Do not replace with an A-line silhouette."
      : "",
    `Garment context: ${work.config.garmentType || "dress"}; occasion: ${work.config.occasion || "daily"}; size: ${bodyProfile.usualSize || work.config.size || "M"}; fit preference: ${fitLabel(bodyProfile.fitPreference)}.`,
    `Body proportion should match: height ${bodyProfile.heightCm || "unknown"}cm, weight ${bodyProfile.weightKg || "unknown"}kg, shoulder ${bodyProfile.shoulderCm || "unknown"}cm, bust ${bodyProfile.bustCm || "unknown"}cm, waist ${bodyProfile.waistCm || "unknown"}cm, hip ${bodyProfile.hipCm || "unknown"}cm.`,
    `Virtual fitting style: ${tryOnLabelParts(preference).join(" / ")}.`,
    revisionReason ? `Regenerate because the user said: ${revisionReason}. Keep the same selected print unless the garment template changed.` : "",
    "Output must be full-body, head to toe, both feet visible, vertical fashion composition, 2:3 fashion editorial framing.",
    "Do not crop at the waist, knees, ankles, or shoes. Keep the entire model and full dress visible.",
    "Show a wearable garment preview for a consumer to judge overall style, proportion and mood.",
    "Generate a model wearing the garment. Do not change the selected dress silhouette unless garmentTemplate changed.",
    "No text, no logo, no watermark, no technical sheet, no line sketch.",
  ].filter(Boolean).join("\n");
}

function garmentStructureSnapshot(garmentTemplate: StudioGarmentTemplate) {
  return {
    silhouette: garmentTemplate.silhouette || "follow selected template",
    neckline: garmentTemplate.neckline || "follow selected template",
    waist: garmentTemplate.waistline || "follow selected template",
    closure: garmentTemplate.closure || (garmentTemplate.id === "wrap-dress" ? "wrap-front side waist tie closure" : "follow selected template"),
    sleeveLength: garmentTemplate.sleeve || "follow selected template",
    dressLength: garmentTemplate.skirtLength || "follow selected template",
  };
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
