"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ConsumerNav from "@/components/ConsumerNav";
import { useToast } from "@/components/ui/Toast";
import "./try-on.css";

/* ----------------------------------------------------------------
   spec/11 §3 + 设计稿 10_my-studio-try-on.png
   消费者版 /my-studio/try-on(上身试穿) — Step 2:
   - 接入 POST /api/ai-studio/generate(tool=pattern-apply)
   - 4 阶段状态机:idle / loading / result / error
   - useToast + useRouter:save/order/publish/sketch
   - 401/503/网络异常 → mock 4 张模特图 fallback
   ---------------------------------------------------------------- */

const A_TRY  = "/assets/my-studio/05_try_on_results";
const A_WORK = "/assets/my-studio/04_work_thumbnails";

/* try-on 结果图(纯模特/成衣上身,Step 1 mock 用现有 3 张 + summer-garden-dress) */
const TRYON_FRONT     = `${A_TRY}/tryon-floral-fullbody-front-1080x1440.png`;
const TRYON_SIDE      = `${A_TRY}/tryon-floral-portrait-side-1080x1440.png`;
const TRYON_WRAP      = `${A_TRY}/tryon-floral-wrap-front-1080x1440.png`;
const TRYON_GARDEN    = `${A_WORK}/maxlulu-my-studio-work-summer-garden-dress-1080x1440.png`;

/* 花型来源缩略图(必须为纯花型,不能用模特图) */
const SOURCE_PATTERN_THUMB = `${A_WORK}/maxlulu-my-studio-work-rose-vine-print-1080x1440.png`;

const SOURCE_PATTERN = {
  title: "玫瑰藤蔓印花",
  param: "铺排方向:中长款 · 无袖",
  code:  "PF10232",
  thumb: SOURCE_PATTERN_THUMB,
};

/* 版型(Step 2 §三 映射:UI id 即 API silhouette) */
type TemplateId = "a-line" | "wrap" | "straight";
const TEMPLATES: { id: TemplateId; title: string; desc: string }[] = [
  { id: "a-line",   title: "A 字裙",   desc: "腰线收 / 裙摆张" },
  { id: "wrap",     title: "裹身裙",   desc: "侧系带 / 修身" },
  { id: "straight", title: "直筒裙",   desc: "通直版型 / 简约" },
];

/* 袖长 — UI id 与 API 不一致需映射:none → sleeveless,其余同字符串 */
type Sleeve = "none" | "short" | "mid" | "long";
const SLEEVE_TO_API: Record<Sleeve, "sleeveless" | "short" | "mid" | "long"> = {
  none:  "sleeveless",
  short: "short",
  mid:   "mid",
  long:  "long",
};
const SLEEVES: { id: Sleeve; label: string }[] = [
  { id: "none",  label: "无袖" },
  { id: "short", label: "短袖" },
  { id: "mid",   label: "中袖" },
  { id: "long",  label: "长袖" },
];

/* 裙长 — UI id midi 映射 API midi(spec §三 short/midi/long) */
type SkirtLen = "short" | "midi" | "long";
const SKIRT_LENS: { id: SkirtLen; label: string }[] = [
  { id: "short", label: "短款" },
  { id: "midi",  label: "中长款" },
  { id: "long",  label: "长款" },
];

interface HistoryItem { id: string; title: string; param: string; time: string; thumb: string }
const SEED_HISTORY: HistoryItem[] = [
  { id: "h1", title: "玫瑰藤蔓 · A 字裙",   param: "中长款 · 无袖", time: "今天 11:32",  thumb: TRYON_FRONT  },
  { id: "h2", title: "粉调牡丹 · 裹身裙",   param: "中长款 · 中袖", time: "昨天 18:08",  thumb: TRYON_SIDE   },
  { id: "h3", title: "夏日花园 · A 字裙",   param: "长款 · 无袖",   time: "4 月 28 日",  thumb: TRYON_GARDEN },
  { id: "h4", title: "蓝韵繁花 · 直筒裙",   param: "中长款 · 短袖", time: "4 月 24 日",  thumb: TRYON_WRAP   },
];

type Phase = "idle" | "loading" | "result" | "error" | "auth-required";

/* mock fallback:模特+花卉成衣上身图按版型挑选(严禁纯花型/线稿) */
function pickMockMain(template: TemplateId): string {
  if (template === "wrap")     return TRYON_WRAP;
  if (template === "straight") return TRYON_GARDEN;
  return TRYON_FRONT;
}
function pickMockSide(template: TemplateId): string {
  return template === "a-line" ? TRYON_SIDE : TRYON_FRONT;
}

function nowLabel(): string {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `今天 ${hh}:${mm}`;
}

/* 版型线稿 SVG icon(不用真实模特图,符合 spec 要求)*/
function TemplateIcon({ id }: { id: TemplateId }) {
  if (id === "a-line") {
    return (
      <svg viewBox="0 0 48 64" fill="none">
        <g stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 6h16l3 8-3 4v6l8 36H8l8-36v-6l-3-4z" />
          <path d="M19 6c1 2 3 3 5 3s4-1 5-3" />
        </g>
      </svg>
    );
  }
  if (id === "wrap") {
    return (
      <svg viewBox="0 0 48 64" fill="none">
        <g stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 6h16l3 6-7 6 7 4-2 38H10l-2-38 7-4-7-6z" />
          <path d="M21 24l-3 14M27 24l3 14" opacity="0.6" />
          <circle cx="33" cy="22" r="1.4" fill="currentColor" stroke="none" />
        </g>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 48 64" fill="none">
      <g stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 6h16l2 6-2 4v44H14V16l-2-4z" />
        <path d="M19 6c1 2 3 3 5 3s4-1 5-3" />
      </g>
    </svg>
  );
}

export default function TryOnPage() {
  const router = useRouter();
  const toast  = useToast();

  const [template, setTemplate] = useState<TemplateId>("a-line");
  const [sleeve, setSleeve]     = useState<Sleeve>("none");
  const [skirt, setSkirt]       = useState<SkirtLen>("midi");
  const [phase, setPhase]       = useState<Phase>("idle");
  const [mainImg, setMainImg]   = useState<string>(TRYON_FRONT);
  const [sideImg, setSideImg]   = useState<string>(TRYON_SIDE);
  const [history, setHistory]   = useState<HistoryItem[]>(SEED_HISTORY);
  const [carousel, setCarousel] = useState(0);
  const [resultId, setResultId] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");

  const abortRef = useRef<AbortController | null>(null);
  useEffect(() => () => { abortRef.current?.abort(); }, []);

  async function runTryOn() {
    if (phase === "loading") return;
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setPhase("loading");
    setErrorMsg("");

    /* 接入 POST /api/ai-studio/generate
       后端 schema(实际):tool / prompt / params / images / count / size
       try-on 对应 tool="pattern-apply"(spec lib/ai-studio-prompts.ts §16)
       params 同时携带用户字段(silhouette/sleeve/length)+ 后端 prompt builder 字段(skirtType/placement/scale)*/
    const sleeveApi = SLEEVE_TO_API[sleeve];
    const body = {
      tool: "pattern-apply" as const,
      prompt: `Apply the source floral print to a ${template} dress with ${sleeveApi} sleeves and ${skirt} length.`,
      params: {
        /* 用户 §一 schema 字段 */
        silhouette: template,
        sleeve: sleeveApi,
        length: skirt,
        /* 后端 buildPatternApplyPrompt 字段 */
        skirtType: template,
        placement: "full",
        scale: "natural",
      },
      /* sourceImageUrl 占位:Step 3 接 sourceWorkId → 拉 base64 → images[0] */
      count: 1,
      size: "3:4",
    };

    try {
      const res = await fetch("/api/ai-studio/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: ac.signal,
      });

      // 401 未登录 → 显式登录引导
      if (res.status === 401) {
        setPhase("auth-required");
        toast.show("请先登录,即可使用 AI 创作工具", { tone: "warning" });
        return;
      }
      // 503 服务不可用 → mock fallback
      if (res.status === 503) {
        useMockFallback("接口暂不可用,展示示例试穿");
        return;
      }

      const data = (await res.json()) as
        | { success: true; images: { url: string }[] }
        | { success: false; error: string };

      if (!res.ok || !("success" in data) || !data.success) {
        setPhase("error");
        setErrorMsg("试穿生成失败,可以换一个版型再试一次");
        toast.show("试穿生成失败,可以换一个版型再试一次", { tone: "error" });
        return;
      }

      const url = data.images[0]?.url;
      if (!url) {
        setPhase("error");
        setErrorMsg("试穿生成失败,可以换一个版型再试一次");
        toast.show("试穿生成失败,可以换一个版型再试一次", { tone: "error" });
        return;
      }

      /* 真实接口仅返主图;侧图沿用 mock 池里同版型的 side(等 step 3 接多 angle 接口再调) */
      finishWithResult(url, pickMockSide(template), false);
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      console.error("[try-on] api error, fallback to mock:", err);
      useMockFallback("接口暂不可用,展示示例试穿");
    }
  }

  function useMockFallback(toastMsg: string) {
    finishWithResult(pickMockMain(template), pickMockSide(template), true, toastMsg);
  }

  function finishWithResult(main: string, side: string, isMock: boolean, mockMsg?: string) {
    const id = `r-${Date.now()}`;
    setMainImg(main);
    setSideImg(side);
    setResultId(id);
    setCarousel(0);
    setPhase("result");

    if (isMock && mockMsg) {
      toast.show(mockMsg, { tone: "warning" });
    } else {
      toast.show("已为你生成上身效果预览", { tone: "info" });
    }

    const sleeveLabel = SLEEVES.find((s) => s.id === sleeve)?.label ?? "";
    const skirtLabel  = SKIRT_LENS.find((s) => s.id === skirt)?.label  ?? "";
    const tplLabel    = TEMPLATES.find((t) => t.id === template)?.title ?? "";
    setHistory((prev) =>
      [
        {
          id,
          title: `${SOURCE_PATTERN.title} · ${tplLabel}`,
          param: `${skirtLabel} · ${sleeveLabel}`,
          time: nowLabel(),
          thumb: main,
        },
        ...prev,
      ].slice(0, 5)
    );
  }

  function handleSave() {
    if (phase !== "result") return;
    /* TODO step 3:接入真实 POST /api/designs/save 提交 mainImg + 来源 workId + params */
    toast.show("已保存到我的作品", { tone: "success" });
  }
  function handleOrder() {
    if (phase !== "result") return;
    /* TODO step 3:跳 /products/[id]/custom?fromTryOn=... */
    toast.show("定制下单功能即将接入", { tone: "info" });
  }
  function handlePublish() {
    if (phase !== "result") return;
    /* TODO step 3:POST /api/inspiration with mainImg + tags */
    toast.show("已准备发布到灵感广场", { tone: "info" });
  }
  function handleSketch() {
    if (phase !== "result") return;
    /* TODO step 3:用真实 saved workId 替代临时 resultId */
    const id = resultId || `r-${Date.now()}`;
    router.push(`/my-studio/sketch?from=try-on&workId=${encodeURIComponent(id)}`);
  }
  function handleReplaceSource() {
    /* TODO step 3:打开作品选择 modal */
    toast.show("选择花型功能将在下一步接入", { tone: "info" });
  }
  function handleRetry() {
    runTryOn();
  }

  const isLoading = phase === "loading";
  const hasResult = phase === "result";
  const hasError  = phase === "error";
  const needsAuth = phase === "auth-required";

  return (
    <div className="toPage">
      <ConsumerNav variant="solid" />

      <div className="toContainer">
        {/* 页面标题区 */}
        <header className="toHeader">
          <p className="toHeader__brand">MAXLULU AI</p>
          <h1 className="toHeader__title">
            上身试穿
            <span className="toHeader__route"> / try-on</span>
          </h1>
          <p className="toHeader__sub">
            将你的花型印花预览在服装版型上,直观看看上身效果
          </p>
        </header>

        {/* 面包屑 */}
        <nav className="toCrumb" aria-label="面包屑">
          <Link href="/my-studio">我的设计工作室</Link>
          <span className="toCrumb__sep" aria-hidden>/</span>
          <span className="toCrumb__cur">上身试穿</span>
        </nav>

        {/* 外层大工作台壳 */}
        <div className="toStudioShell">
        <div className="toWorkspace">

          {/* ========== 左:控制面板 ========== */}
          <section className="toPanel toControlPanel" aria-label="试穿参数">

            {/* A. 选择版型 */}
            <section className="toSection">
              <header className="toSection__head">
                <h2 className="toSection__title">选择版型</h2>
                <button type="button" className="toSection__more">更多版型 →</button>
              </header>
              <div className="toTemplates" role="radiogroup" aria-label="版型">
                {TEMPLATES.map((t) => {
                  const sel = template === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      role="radio"
                      aria-checked={sel}
                      className={`toTemplateCard${sel ? " is-selected" : ""}`}
                      onClick={() => setTemplate(t.id)}
                    >
                      <span className="toTemplateCard__icon" aria-hidden>
                        <TemplateIcon id={t.id} />
                      </span>
                      <span className="toTemplateCard__title">{t.title}</span>
                      {sel && (
                        <span className="toTemplateCard__badge" aria-hidden>
                          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 10l4 4 7-7" />
                          </svg>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* B. 袖长 */}
            <section className="toSection">
              <h2 className="toSection__title">袖长</h2>
              <div className="toChips" role="radiogroup" aria-label="袖长">
                {SLEEVES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    role="radio"
                    aria-checked={sleeve === s.id}
                    className={`toChip${sleeve === s.id ? " is-selected" : ""}`}
                    onClick={() => setSleeve(s.id)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </section>

            {/* C. 裙长 */}
            <section className="toSection">
              <h2 className="toSection__title">裙长</h2>
              <div className="toChips" role="radiogroup" aria-label="裙长">
                {SKIRT_LENS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    role="radio"
                    aria-checked={skirt === s.id}
                    className={`toChip${skirt === s.id ? " is-selected" : ""}`}
                    onClick={() => setSkirt(s.id)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </section>

            {/* D. 花型来源 */}
            <section className="toSection">
              <header className="toSection__head">
                <h2 className="toSection__title">花型来源</h2>
                <button type="button" className="toSection__more" onClick={handleReplaceSource}>更换花型 →</button>
              </header>
              <div className="toSourceCard">
                <span className="toSourceCard__thumb">
                  <img src={SOURCE_PATTERN.thumb} alt="" />
                </span>
                <div className="toSourceCard__meta">
                  <p className="toSourceCard__title">{SOURCE_PATTERN.title}</p>
                  <p className="toSourceCard__param">{SOURCE_PATTERN.param}</p>
                  <p className="toSourceCard__code">花型编号 {SOURCE_PATTERN.code}</p>
                </div>
              </div>
            </section>

            {/* E. 主按钮 */}
            <button
              type="button"
              className="toPrimary toPrimary--full"
              onClick={runTryOn}
              disabled={isLoading || needsAuth}
            >
              {isLoading ? "试穿中…" : "开始试穿"}
            </button>
            <p className="toQuota">今日剩余次数:<b>8</b> 次</p>
          </section>

          {/* ========== 中:预览面板 ========== */}
          <section className="toPanel toPreviewPanel" aria-label="试穿效果">
            <header className="toPreviewHead">
              <h2 className="toPanel__title">AI 上身效果预览</h2>
            </header>

            {hasResult && (
              <div className="toAdvice" role="status">
                <span className="toAdvice__dot" aria-hidden />
                <span>已为你<b>自动贴合</b>花型与版型,效果可直接用于定制参考</span>
              </div>
            )}
            {hasError && (
              <div className="toAdvice toAdvice--error" role="alert">
                <span className="toAdvice__dot toAdvice__dot--error" aria-hidden />
                <span>{errorMsg || "试穿生成失败,可以换一个版型再试一次"}</span>
                <button type="button" className="toGhost toGhost--error" onClick={handleRetry}>
                  重试
                </button>
              </div>
            )}

            <div className="toPreviewStage">
              {needsAuth && (
                <div className="toEmpty">
                  <div className="toEmpty__art" aria-hidden>
                    <svg viewBox="0 0 64 64" fill="none">
                      <g stroke="#234A58" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.78">
                        <rect x="18" y="28" width="28" height="22" rx="3" />
                        <path d="M24 28v-6a8 8 0 0 1 16 0v6" />
                        <circle cx="32" cy="38" r="2" fill="#234A58" stroke="none" opacity="0.95" />
                        <path d="M32 40v4" />
                      </g>
                    </svg>
                  </div>
                  <h3 className="toEmpty__title">请先登录,即可使用 AI 创作工具</h3>
                  <p className="toEmpty__desc">登录后可保存作品、参与定制下单。</p>
                  <Link href="/login" className="toPrimary" style={{ marginTop: 12 }}>去登录</Link>
                </div>
              )}
              {phase === "idle" && (
                <div className="toEmpty">
                  <div className="toEmpty__art" aria-hidden>
                    <svg viewBox="0 0 96 128" fill="none">
                      <g stroke="#C06A73" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" opacity="0.65">
                        {/* 简化裙装 + 头部轮廓占位,纯线稿不模特图 */}
                        <circle cx="48" cy="22" r="10" />
                        <path d="M38 32h20l4 8-3 6v8l8 64H29l8-64v-8l-3-6z" />
                        <path d="M40 32c2 3 5 4 8 4s6-1 8-4" opacity="0.55" />
                      </g>
                    </svg>
                  </div>
                  <h3 className="toEmpty__title">选择版型和花型,预览你的第一张上身效果</h3>
                  <p className="toEmpty__desc">
                    左侧选择版型与花型来源,点击"开始试穿"。
                  </p>
                </div>
              )}

              {isLoading && (
                <div className="toLoading" role="status" aria-live="polite">
                  <div className="toPetals" aria-hidden>
                    <span /><span /><span /><span /><span /><span />
                  </div>
                  <p className="toLoading__text">正在把花型贴合到版型上…</p>
                </div>
              )}

              {hasResult && (
                <div className="toResult">
                  <div className="toResult__main">
                    <img src={mainImg} alt="试穿主视图" />
                  </div>
                  <div className="toResult__side">
                    <img src={sideImg} alt="试穿侧视图" />
                  </div>
                </div>
              )}

              {hasError && (
                <div className="toEmpty">
                  <div className="toEmpty__art" aria-hidden>
                    <svg viewBox="0 0 96 128" fill="none">
                      <g stroke="#C06A73" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" opacity="0.6">
                        <circle cx="48" cy="48" r="20" />
                        <path d="M48 38v14" />
                        <circle cx="48" cy="60" r="2" fill="#C06A73" stroke="none" />
                      </g>
                    </svg>
                  </div>
                  <h3 className="toEmpty__title">这次没能贴合上身</h3>
                  <p className="toEmpty__desc">换一个版型,或调整袖长 / 裙长再试一次。</p>
                </div>
              )}
            </div>

            {/* 轮播点占位 */}
            {hasResult && (
              <div className="toCarousel" role="tablist" aria-label="试穿视图切换">
                {[0, 1, 2].map((i) => (
                  <button
                    key={i}
                    type="button"
                    role="tab"
                    aria-selected={carousel === i}
                    className={`toCarousel__dot${carousel === i ? " is-active" : ""}`}
                    onClick={() => setCarousel(i)}
                  />
                ))}
              </div>
            )}
          </section>

          {/* ========== 右:操作面板 ========== */}
          <aside className="toPanel toActionPanel" aria-label="下一步操作">
            <h2 className="toPanel__title">下一步操作</h2>

            <div className="toActions">
              <button
                type="button"
                className="toPrimary toPrimary--full"
                disabled={!hasResult}
                onClick={handleSave}
              >
                保存到作品
              </button>
              <button
                type="button"
                className="toSecondary toSecondary--accent toSecondary--full"
                disabled={!hasResult}
                onClick={handleOrder}
              >
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M2 4h12l-1.2 8.4a1.5 1.5 0 0 1-1.5 1.3H4.7a1.5 1.5 0 0 1-1.5-1.3L2 4z" />
                  <path d="M5.5 4V3a2.5 2.5 0 0 1 5 0v1" />
                </svg>
                定制下单
              </button>
              <button
                type="button"
                className="toSecondary toSecondary--full"
                disabled={!hasResult}
                onClick={handlePublish}
              >
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M8 2v8M5 5l3-3 3 3" />
                  <path d="M2 11v3h12v-3" />
                </svg>
                发布到灵感广场
              </button>
            </div>

            <div className="toDivider" aria-hidden />

            <h3 className="toActionPanel__sub">最近试穿</h3>
            <ul className="toHistory" role="list">
              {history.map((h) => (
                <li key={h.id} className="toHistoryItem">
                  <span className="toHistoryItem__thumb">
                    <img src={h.thumb} alt="" />
                  </span>
                  <span className="toHistoryItem__meta">
                    <span className="toHistoryItem__title">{h.title}</span>
                    <span className="toHistoryItem__param">{h.param}</span>
                    <span className="toHistoryItem__time">{h.time}</span>
                  </span>
                </li>
              ))}
            </ul>
          </aside>

        </div>
        </div>{/* /.toStudioShell */}

        {/* 底部串联 banner */}
        <section className="toNextBanner" aria-label="下一步:补充款式线稿">
          <span className="toNextBanner__icon" aria-hidden>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 3l7 7-9 9H5v-7z" />
              <path d="M14 3l3 3" />
            </svg>
          </span>
          <div className="toNextBanner__copy">
            <h3 className="toNextBanner__title">下一步:补充款式线稿(可选)</h3>
            <p className="toNextBanner__desc">
              补充裙装线稿,AI 将帮你生成更完整的设计方案。
            </p>
          </div>
          <button
            type="button"
            className="toPrimary toPrimary--banner"
            disabled={!hasResult}
            onClick={handleSketch}
            /* TODO step 3:跳 /my-studio/sketch?from=try-on&workId={resultId} */
          >
            去补充线稿 →
          </button>
        </section>
      </div>
    </div>
  );
}
