"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ConsumerNav from "@/components/ConsumerNav";
import { useToast } from "@/components/ui/Toast";
import "./seamless.css";

/* ----------------------------------------------------------------
   spec/11 §2 + 设计稿 09_my-studio-seamless.png
   消费者版 /my-studio/seamless(面料铺排) — Step 2:
   - 接入 POST /api/ai-studio/generate(tool=seamless-tile)
   - 4 阶段状态机:idle / loading / result / error
   - Toast(useToast)+ router.push 到 /my-studio/try-on
   - 接口失败/未登录(401/503) → mock fallback 保留 UI 流程
   ---------------------------------------------------------------- */

const A_WORK = "/assets/my-studio/04_work_thumbnails";

/* mock fallback:面料铺排结果图(必须为纯花卉印花,严禁模特/上身图) */
const PATTERN_ROSE_VINE       = `${A_WORK}/maxlulu-my-studio-work-rose-vine-print-1080x1440.png`;
const PATTERN_BLUE_FLORAL     = `${A_WORK}/maxlulu-my-studio-work-blue-floral-print-1080x1440.png`;
const PATTERN_TEAL_PEONY      = `${A_WORK}/maxlulu-pattern-teal-peony-1080x1440.png`;
const PATTERN_SOFT_PINK_PEONY = `${A_WORK}/maxlulu-pattern-soft-pink-peony-1080x1440.png`;
const PATTERN_CORAL_SPRING    = `${A_WORK}/maxlulu-pattern-coral-spring-1080x1440.png`;
const PATTERN_WATERCOLOR_PINK = `${A_WORK}/maxlulu-pattern-watercolor-pink-1080x1440.png`;

/* 当前来源花型(从 pattern-generate 流转过来,Step 1 写死) */
const SOURCE_PATTERN = {
  title: "玫瑰簇舞印花",
  createdAt: "2026-05-03 14:32",
  thumb: PATTERN_ROSE_VINE,
};

/* 铺排模式(Step 2 §三 映射:focal→placement / allover→allover) */
type LayoutMode = "allover" | "focal";
const LAYOUT_MODE_TO_API: Record<LayoutMode, "placement" | "allover"> = {
  allover: "allover",
  focal:   "placement",
};
const LAYOUT_MODES: { id: LayoutMode; title: string; desc: string }[] = [
  { id: "allover", title: "满印花型", desc: "整布连续铺排" },
  { id: "focal",   title: "重点花型", desc: "局部突出展示" },
];

/* 背景色板(spec §2.5 + 用户指令)*/
type BgColorId = "transparent" | "ivory" | "smokedRose" | "sage" | "blueGray";
const BG_COLORS: { id: BgColorId; label: string; preview: string }[] = [
  { id: "transparent", label: "透明",       preview: "transparent"        },
  { id: "ivory",       label: "象牙白",     preview: "#F8F4EC"            },
  { id: "smokedRose",  label: "烟粉",       preview: "#F4E5E7"            },
  { id: "sage",        label: "鼠尾草绿",   preview: "#D6DDD3"            },
  { id: "blueGray",    label: "浅蓝灰",     preview: "#DDE3E5"            },
];

interface HistoryItem { id: string; title: string; time: string; thumb: string }
const SEED_HISTORY: HistoryItem[] = [
  { id: "h1", title: "玫瑰簇舞·满印", time: "今天 14:32", thumb: PATTERN_ROSE_VINE       },
  { id: "h2", title: "粉调牡丹·满印", time: "昨天 20:18", thumb: PATTERN_SOFT_PINK_PEONY },
  { id: "h3", title: "蓝韵繁花·满印", time: "4 月 28 日", thumb: PATTERN_BLUE_FLORAL     },
  { id: "h4", title: "珊瑚春日·满印", time: "4 月 24 日", thumb: PATTERN_CORAL_SPRING    },
  { id: "h5", title: "粉色水彩·满印", time: "4 月 20 日", thumb: PATTERN_WATERCOLOR_PINK },
];

type Phase = "idle" | "loading" | "result" | "error" | "auth-required";
type ResultTab = "fabric" | "placement";

/* mock fallback 池(只用纯花型,严禁模特/上身图)*/
const MOCK_RESULTS = [
  PATTERN_WATERCOLOR_PINK,
  PATTERN_TEAL_PEONY,
  PATTERN_SOFT_PINK_PEONY,
  PATTERN_CORAL_SPRING,
  PATTERN_BLUE_FLORAL,
  PATTERN_ROSE_VINE,
];

function nowLabel(): string {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `今天 ${hh}:${mm}`;
}

export default function SeamlessPage() {
  const router = useRouter();
  const toast  = useToast();

  const [layoutMode, setLayoutMode] = useState<LayoutMode>("allover");
  const [bgColor, setBgColor]       = useState<BgColorId>("ivory");
  const [size, setSize]             = useState(80);
  const [density, setDensity]       = useState(65);
  const [phase, setPhase]           = useState<Phase>("idle");
  const [tab, setTab]               = useState<ResultTab>("fabric");
  const [resultImage, setResultImage] = useState<string>(PATTERN_WATERCOLOR_PINK);
  const [resultId, setResultId]     = useState<string>("");
  const [history, setHistory]       = useState<HistoryItem[]>(SEED_HISTORY);
  const [errorMsg, setErrorMsg]     = useState<string>("");

  const abortRef = useRef<AbortController | null>(null);
  useEffect(() => () => { abortRef.current?.abort(); }, []);

  function pickMock(): string {
    /* 取 layoutMode + density 决定基础图,再轻量轮换避免重复 */
    const base = layoutMode === "focal" ? 0 : 2;
    const idx = (base + Math.floor(Date.now() / 1000) % 4) % MOCK_RESULTS.length;
    return MOCK_RESULTS[idx];
  }

  /* §六 友好引导:参数密度过高时给柔提示(非错误)*/
  function craftAdviceMsg(): string {
    if (density >= 85) {
      return "当前花型较密,成衣上可能显得拥挤,建议降低疏密";
    }
    return "已为你自动生成适合面料印花的铺排效果";
  }
  const [adviceMsg, setAdviceMsg] = useState<string>("");

  async function runGenerate() {
    if (phase === "loading") return;
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setPhase("loading");
    setErrorMsg("");

    /* 接入 POST /api/ai-studio/generate
       后端 schema(实际):tool / prompt / params / images / count / size
       用户字段(toolType/sourceWorkId/sourceImageUrl/printType/params)→ 映射后端 */
    const body = {
      tool: "seamless-tile" as const,
      prompt: `Make a seamless ${LAYOUT_MODE_TO_API[layoutMode]} fabric tile from the source pattern. ` +
              `Background: ${bgColor}. Scale ${size}%, density ${density}%.`,
      params: {
        layoutMode: LAYOUT_MODE_TO_API[layoutMode],
        scale: size,
        density,
        backgroundColor: bgColor,
      },
      /* sourceImageUrl 占位:Step 3 接入真实 sourceWorkId → 拉 base64 → images[0] */
      count: 1,
      size: "1:1",
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
        useMockFallback("接口暂不可用,展示示例铺排");
        return;
      }

      const data = (await res.json()) as
        | { success: true; images: { url: string }[] }
        | { success: false; error: string };

      if (!res.ok || !("success" in data) || !data.success) {
        setPhase("error");
        setErrorMsg("铺排失败,请换一个花型或降低密度");
        toast.show("铺排失败,请换一个花型或降低密度", { tone: "error" });
        return;
      }

      const url = data.images[0]?.url;
      if (!url) {
        setPhase("error");
        setErrorMsg("铺排失败,请换一个花型或降低密度");
        toast.show("铺排失败,请换一个花型或降低密度", { tone: "error" });
        return;
      }

      finishWithResult(url, false);
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      console.error("[seamless] api error, fallback to mock:", err);
      useMockFallback("接口暂不可用,展示示例铺排");
    }
  }

  function useMockFallback(msg: string) {
    finishWithResult(pickMock(), true, msg);
  }

  function finishWithResult(url: string, isMock: boolean, fallbackMsg?: string) {
    const id = `r-${Date.now()}`;
    setResultImage(url);
    setResultId(id);
    setPhase("result");
    setTab("fabric");
    setAdviceMsg(craftAdviceMsg());
    if (isMock && fallbackMsg) {
      toast.show(fallbackMsg, { tone: "warning" });
    } else {
      toast.show("已为你生成面料铺排效果", { tone: "info" });
    }
    setHistory((prev) =>
      [
        {
          id,
          title: `${SOURCE_PATTERN.title}·${layoutMode === "focal" ? "重点" : "满印"}`,
          time: nowLabel(),
          thumb: url,
        },
        ...prev,
      ].slice(0, 5)
    );
  }

  function handleSave() {
    if (phase !== "result") return;
    /* TODO step 3:接入真实 POST /api/designs/save 提交 resultImage + 来源 workId + params */
    toast.show("已保存到我的作品", { tone: "success" });
  }
  function handleNext() {
    if (phase !== "result") return;
    /* TODO step 3:用真实 saved workId 替代临时 resultId */
    const id = resultId || `r-${Date.now()}`;
    router.push(`/my-studio/try-on?from=seamless&workId=${encodeURIComponent(id)}`);
  }
  function handleReplaceSource() {
    /* TODO step 3:打开作品选择 modal */
    toast.show("选择作品功能将在下一步接入", { tone: "info" });
  }
  function handleMoreColors() {
    /* TODO step 3:打开颜色选择 modal */
    toast.show("更多背景色将在下一步接入", { tone: "info" });
  }
  function handleRetry() {
    runGenerate();
  }

  const isLoading = phase === "loading";
  const hasResult = phase === "result";
  const hasError  = phase === "error";
  const needsAuth = phase === "auth-required";

  return (
    <div className="smPage">
      <ConsumerNav variant="solid" />

      <div className="smContainer">
        {/* 页面标题区 */}
        <header className="smHeader">
          <p className="smHeader__brand">MAXLULU AI</p>
          <h1 className="smHeader__title">
            面料铺排
            <span className="smHeader__route"> / seamless</span>
          </h1>
          <p className="smHeader__sub">
            将你的花型设计转化为面料铺排或满印效果,轻松预览印花在面料上的呈现。
          </p>
        </header>

        {/* 面包屑 */}
        <nav className="smCrumb" aria-label="面包屑">
          <Link href="/my-studio">我的设计工作室</Link>
          <span className="smCrumb__sep" aria-hidden>/</span>
          <span className="smCrumb__cur">面料铺排</span>
        </nav>

        {/* 外层大工作台壳 */}
        <div className="smStudioShell">
        <div className="smWorkspace">

          {/* ========== 左:控制面板 ========== */}
          <section className="smPanel smControlPanel" aria-label="铺排参数">

            {/* A. 选择源花型 */}
            <section className="smSection">
              <h2 className="smSection__title">选择源花型</h2>
              <div className="smSourceCard">
                <span className="smSourceCard__thumb">
                  <img src={SOURCE_PATTERN.thumb} alt="" />
                </span>
                <div className="smSourceCard__meta">
                  <p className="smSourceCard__title">{SOURCE_PATTERN.title}</p>
                  <p className="smSourceCard__time">{SOURCE_PATTERN.createdAt}</p>
                </div>
                <button type="button" className="smSourceCard__cta" onClick={handleReplaceSource}>
                  更换花型
                </button>
              </div>
            </section>

            {/* B. 铺排模式 */}
            <section className="smSection">
              <h2 className="smSection__title">铺排模式</h2>
              <div className="smModes" role="radiogroup" aria-label="铺排模式">
                {LAYOUT_MODES.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    role="radio"
                    aria-checked={layoutMode === m.id}
                    className={`smModeCard${layoutMode === m.id ? " is-selected" : ""}`}
                    onClick={() => setLayoutMode(m.id)}
                  >
                    <span className="smModeCard__title">{m.title}</span>
                    <span className="smModeCard__desc">{m.desc}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* C. 调整参数 */}
            <section className="smSection">
              <h2 className="smSection__title">调整参数</h2>
              <div className="smSliderGroup">
                <div className="smSliderRow">
                  <label className="smSliderRow__label" htmlFor="sm-size">花型大小</label>
                  <span className="smSliderRow__value">{size}%</span>
                </div>
                <input
                  id="sm-size"
                  type="range"
                  min={20}
                  max={140}
                  value={size}
                  onChange={(e) => setSize(Number(e.target.value))}
                  className="smSlider"
                  style={{ "--sm-progress": `${((size - 20) / 120) * 100}%` } as React.CSSProperties}
                />
              </div>
              <div className="smSliderGroup">
                <div className="smSliderRow">
                  <label className="smSliderRow__label" htmlFor="sm-density">花型疏密</label>
                  <span className="smSliderRow__value">{density}%</span>
                </div>
                <input
                  id="sm-density"
                  type="range"
                  min={0}
                  max={100}
                  value={density}
                  onChange={(e) => setDensity(Number(e.target.value))}
                  className="smSlider"
                  style={{ "--sm-progress": `${density}%` } as React.CSSProperties}
                />
              </div>
              <p className="smSliderGroup__hint">拖动调整花型大小与疏密</p>
            </section>

            {/* D. 背景颜色("更多颜色"内联到色板行尾,省一行)*/}
            <section className="smSection">
              <h2 className="smSection__title">背景颜色</h2>
              <div className="smSwatchRow" role="radiogroup" aria-label="背景颜色">
                {BG_COLORS.map((c) => {
                  const sel = bgColor === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      role="radio"
                      aria-checked={sel}
                      aria-label={c.label}
                      title={c.label}
                      className={`smColorSwatch${sel ? " is-selected" : ""}${c.id === "transparent" ? " smColorSwatch--transparent" : ""}`}
                      onClick={() => setBgColor(c.id)}
                      style={c.id === "transparent" ? undefined : { background: c.preview }}
                    />
                  );
                })}
                <button type="button" className="smSwatchMore" aria-label="更多颜色" onClick={handleMoreColors}>+</button>
              </div>
            </section>

            {/* E. 主按钮 */}
            <button
              type="button"
              className="smPrimary smPrimary--full"
              onClick={runGenerate}
              disabled={isLoading || needsAuth}
            >
              {isLoading ? "生成中…" : "生成铺排"}
            </button>
            <p className="smQuota">今日剩余生成:<b>8</b> 次</p>
          </section>

          {/* ========== 中:预览面板 ========== */}
          <section className="smPanel smPreviewPanel" aria-label="面料预览">

            {hasResult && adviceMsg && (
              <div className="smAdvice" role="status">
                <span className="smAdvice__dot" aria-hidden />
                <span>{adviceMsg}</span>
              </div>
            )}

            {hasError && (
              <div className="smAdvice smAdvice--error" role="alert">
                <span className="smAdvice__dot smAdvice__dot--error" aria-hidden />
                <span>{errorMsg || "铺排失败,请换一个花型或降低密度"}</span>
                <button type="button" className="smGhost smGhost--error" onClick={handleRetry}>
                  重试
                </button>
              </div>
            )}

            <div className="smTabs" role="tablist" aria-label="结果视图">
              <button
                type="button"
                role="tab"
                aria-selected={tab === "fabric"}
                className={`smTab${tab === "fabric" ? " is-active" : ""}`}
                onClick={() => setTab("fabric")}
              >
                面料预览
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={tab === "placement"}
                className={`smTab${tab === "placement" ? " is-active" : ""}`}
                onClick={() => setTab("placement")}
              >
                位置示意
              </button>
            </div>

            <div className="smPreviewCanvas" data-bg={bgColor}>
              {needsAuth && (
                <div className="smEmpty">
                  <div className="smEmpty__center">
                    <div className="smEmpty__art" aria-hidden>
                      <svg viewBox="0 0 64 64" fill="none">
                        <g stroke="#234A58" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.78">
                          <rect x="18" y="28" width="28" height="22" rx="3" />
                          <path d="M24 28v-6a8 8 0 0 1 16 0v6" />
                          <circle cx="32" cy="38" r="2" fill="#234A58" stroke="none" opacity="0.95" />
                          <path d="M32 40v4" />
                        </g>
                      </svg>
                    </div>
                    <h3 className="smEmpty__title">请先登录,即可使用 AI 创作工具</h3>
                    <p className="smEmpty__desc">登录后可保存作品、参与定制下单。</p>
                    <Link href="/login" className="smPrimary smPrimary--full" style={{ marginTop: 12, maxWidth: 200 }}>去登录</Link>
                  </div>
                </div>
              )}
              {phase === "idle" && (
                <div className="smEmpty">
                  {/* 2×2 柔和花瓣 skeleton tile,暗示"即将铺成面料"
                      不用真实生成图,不用模特图,不用技术坐标线 */}
                  <div className="smEmpty__tiles" aria-hidden>
                    <span className="smEmpty__tile">
                      <svg viewBox="0 0 60 60" fill="none">
                        <g stroke="#C06A73" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5">
                          <circle cx="30" cy="30" r="8" />
                          <path d="M30 18c3 0 5 2 5 5M30 42c-3 0-5-2-5-5M18 30c0-3 2-5 5-5M42 30c0 3-2 5-5 5" />
                        </g>
                      </svg>
                    </span>
                    <span className="smEmpty__tile">
                      <svg viewBox="0 0 60 60" fill="none">
                        <g stroke="#C06A73" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.4">
                          <path d="M22 22c4-4 12-4 16 0M38 38c-4 4-12 4-16 0M22 38c-4-4-4-12 0-16M38 22c4 4 4 12 0 16" />
                          <circle cx="30" cy="30" r="3" fill="#C06A73" stroke="none" opacity="0.6" />
                        </g>
                      </svg>
                    </span>
                    <span className="smEmpty__tile">
                      <svg viewBox="0 0 60 60" fill="none">
                        <g stroke="#C06A73" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.4">
                          <path d="M30 14v32M14 30h32" strokeDasharray="3 4" />
                          <circle cx="30" cy="30" r="6" />
                        </g>
                      </svg>
                    </span>
                    <span className="smEmpty__tile">
                      <svg viewBox="0 0 60 60" fill="none">
                        <g stroke="#C06A73" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5">
                          <circle cx="22" cy="22" r="5" />
                          <circle cx="38" cy="38" r="5" />
                          <path d="M27 27l6 6" />
                        </g>
                      </svg>
                    </span>
                  </div>
                  <div className="smEmpty__center">
                    <div className="smEmpty__art" aria-hidden>
                      <svg viewBox="0 0 56 56" fill="none">
                        <g stroke="#C06A73" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M28 10c4 0 7 3 7 7 0 2-1 4-2 5" opacity="0.55" />
                          <path d="M46 28c0 4-3 7-7 7-2 0-4-1-5-2" opacity="0.55" />
                          <path d="M28 46c-4 0-7-3-7-7 0-2 1-4 2-5" opacity="0.55" />
                          <path d="M10 28c0-4 3-7 7-7 2 0 4 1 5 2" opacity="0.55" />
                          <circle cx="28" cy="28" r="5" opacity="0.85" />
                          <circle cx="28" cy="28" r="2" fill="#C06A73" stroke="none" opacity="0.9" />
                        </g>
                      </svg>
                    </div>
                    <h3 className="smEmpty__title">选择一个花型,生成你的第一块面料</h3>
                    <p className="smEmpty__desc">
                      左侧调整大小、疏密与底色,点击"生成铺排"。
                    </p>
                  </div>
                </div>
              )}

              {isLoading && (
                <div className="smLoading" role="status" aria-live="polite">
                  <div className="smPetals" aria-hidden>
                    <span /><span /><span /><span /><span /><span />
                  </div>
                  <p className="smLoading__text">正在把花型铺成面料…</p>
                </div>
              )}

              {hasResult && (
                <>
                  <img
                    className="smPreviewCanvas__img"
                    src={resultImage}
                    alt="面料铺排预览"
                  />
                  {tab === "placement" && (
                    /* 位置示意:Step 2 用同图 + 4 个定位点占位,
                       不放模特图。Step 3 真接 placement 模式时用真实定位 */
                    <div className="smPlacementOverlay" aria-hidden>
                      <span style={{ left: "26%", top: "30%" }} />
                      <span style={{ left: "70%", top: "32%" }} />
                      <span style={{ left: "32%", top: "70%" }} />
                      <span style={{ left: "68%", top: "68%" }} />
                    </div>
                  )}
                </>
              )}

              {hasError && (
                <div className="smEmpty">
                  <div className="smEmpty__center">
                    <div className="smEmpty__art" aria-hidden>
                      <svg viewBox="0 0 56 56" fill="none">
                        <g stroke="#C06A73" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="28" cy="28" r="14" opacity="0.5" />
                          <path d="M28 20v10" opacity="0.85" />
                          <circle cx="28" cy="36" r="1.4" fill="#C06A73" stroke="none" />
                        </g>
                      </svg>
                    </div>
                    <h3 className="smEmpty__title">这次没能铺成面料</h3>
                    <p className="smEmpty__desc">换一个花型,或降低疏密再试一次。</p>
                  </div>
                </div>
              )}
            </div>

            {/* 结果下方控制栏 */}
            <div className="smPreviewBar">
              <button
                type="button"
                className="smGhost smGhost--sm"
                onClick={runGenerate}
                disabled={!hasResult}
              >
                <span aria-hidden>↻</span> 换一换铺排
              </button>
              <span className="smPreviewBar__zoom">缩放 100%</span>
              <button
                type="button"
                className="smIconBtn"
                aria-label="全屏预览"
                disabled={!hasResult}
              >
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 6V2h4M14 6V2h-4M2 10v4h4M14 10v4h-4" />
                </svg>
              </button>
            </div>
          </section>

          {/* ========== 右:操作面板 ========== */}
          <aside className="smPanel smActionPanel" aria-label="下一步操作">
            <h2 className="smPanel__title">下一步操作</h2>

            <div className="smActions">
              <button
                type="button"
                className="smPrimary smPrimary--full"
                disabled={!hasResult}
                onClick={handleSave}
              >
                保存到作品
              </button>
              <button
                type="button"
                className="smSecondary smSecondary--full"
                disabled={!hasResult}
                onClick={handleNext}
              >
                下一步:上身试穿
              </button>
            </div>

            <div className="smDivider" aria-hidden />

            <h3 className="smActionPanel__sub">最近生成</h3>
            <ul className="smHistory" role="list">
              {history.map((h) => (
                <li key={h.id} className="smHistoryItem">
                  <span className="smHistoryItem__thumb">
                    <img src={h.thumb} alt="" />
                  </span>
                  <span className="smHistoryItem__meta">
                    <span className="smHistoryItem__title">{h.title}</span>
                    <span className="smHistoryItem__time">{h.time}</span>
                  </span>
                </li>
              ))}
            </ul>
          </aside>

        </div>
        </div>{/* /.smStudioShell */}

        {/* 底部串联 banner */}
        <section className="smNextBanner" aria-label="下一步:上身试穿">
          <span className="smNextBanner__icon" aria-hidden>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 7l4-3h6l4 3-3 3v10H8V10z" />
              <path d="M9 4v3h6V4" />
            </svg>
          </span>
          <div className="smNextBanner__copy">
            <h3 className="smNextBanner__title">下一步:看穿在身上的效果</h3>
            <p className="smNextBanner__desc">
              将铺排好的面料效果应用到服装上,体验真实穿着效果。
            </p>
          </div>
          <button
            type="button"
            className="smPrimary smPrimary--banner"
            disabled={!hasResult}
            onClick={handleNext}
          >
            去上身试穿 →
          </button>
        </section>
      </div>
    </div>
  );
}
