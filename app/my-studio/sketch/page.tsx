"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ConsumerNav from "@/components/ConsumerNav";
import { useToast } from "@/components/ui/Toast";
import "./sketch.css";

/* ----------------------------------------------------------------
   spec/11 §4 + 设计稿 11_my-studio-sketch.png
   消费者版 /my-studio/sketch(款式线稿) — Step 2:
   - 接入 POST /api/ai-studio/generate(tool=sketch-generate)
   - 4 阶段状态机:idle / loading / result / error
   - useToast + useRouter:save/attach/home/switchVariant
   - 401/503/网络异常 → mock fallback(仍用内联 SVG,无外部图)
   线稿全部用内联 SVG(#9B7A68),零外部图依赖,
   严禁模特图 / 花型图 / 试穿图
   ---------------------------------------------------------------- */

/* ===== 参数选项 + API 映射(Step 2 §三) ===== */
type Neckline = "v" | "round" | "square" | "boat" | "halter";
const NECKLINE_TO_API: Record<Neckline, "v-neck" | "round" | "square" | "boat" | "halter"> = {
  v:      "v-neck",
  round:  "round",
  square: "square",
  boat:   "boat",
  halter: "halter",
};
const NECKLINES: { id: Neckline; label: string }[] = [
  { id: "v",      label: "V 领"   },
  { id: "round",  label: "圆领"   },
  { id: "square", label: "方领"   },
  { id: "boat",   label: "一字领" },
  { id: "halter", label: "挂脖领" },
];

type Sleeve = "none" | "short" | "mid" | "long" | "puff";
const SLEEVE_TO_API: Record<Sleeve, "sleeveless" | "short" | "mid" | "long" | "puff"> = {
  none:  "sleeveless",
  short: "short",
  mid:   "mid",
  long:  "long",
  puff:  "puff",
};
const SLEEVES: { id: Sleeve; label: string }[] = [
  { id: "none",  label: "无袖"   },
  { id: "short", label: "短袖"   },
  { id: "mid",   label: "中袖"   },
  { id: "long",  label: "长袖"   },
  { id: "puff",  label: "泡泡袖" },
];

type SkirtLen = "mini" | "above-knee" | "knee" | "midi" | "long";
const SKIRT_LENS: { id: SkirtLen; label: string }[] = [
  { id: "mini",       label: "迷你裙" },
  { id: "above-knee", label: "膝上裙" },
  { id: "knee",       label: "及膝裙" },
  { id: "midi",       label: "中长裙" },
  { id: "long",       label: "长裙"   },
];

type Waist = "high" | "natural" | "low";
const WAISTS: { id: Waist; label: string }[] = [
  { id: "high",    label: "高腰"   },
  { id: "natural", label: "自然腰" },
  { id: "low",     label: "低腰"   },
];

type Phase = "idle" | "loading" | "result" | "error" | "auth-required";

interface HistoryItem { id: string; title: string; time: string }
const SEED_HISTORY: HistoryItem[] = [
  { id: "h1", title: "圆领·短袖·及膝·高腰",   time: "今天 11:32"  },
  { id: "h2", title: "V 领·中袖·中长·自然腰", time: "昨天 18:08"  },
  { id: "h3", title: "方领·无袖·迷你·高腰",   time: "4 月 28 日"  },
  { id: "h4", title: "一字领·泡泡袖·膝上·自然腰", time: "4 月 24 日" },
  { id: "h5", title: "挂脖领·无袖·长款·低腰", time: "4 月 20 日"  },
];

function nowLabel(): string {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `今天 ${hh}:${mm}`;
}

/* ===== 内联线稿 SVG(#9B7A68 warm taupe) =====
   variant 0/1/2:Step 2 切换方案的轻量差异(腰部 / 下摆细节)*/
function DressSketch({
  view, size = "lg", variant = 0,
}: { view: "front" | "back"; size?: "lg" | "sm"; variant?: 0 | 1 | 2 }) {
  const stroke = view === "front" ? "#9B7A68" : "#879397";
  const w = size === "lg" ? 200 : 56;
  return (
    <svg
      width={w}
      viewBox="0 0 200 280"
      fill="none"
      stroke={stroke}
      strokeWidth={size === "lg" ? 1.4 : 1.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {/* 头/颈轮廓 */}
      <ellipse cx="100" cy="22" rx="14" ry="16" />
      <path d="M88 36c2 4 6 7 12 7s10-3 12-7" />
      {/* 颈线 / 领口 */}
      {view === "front" ? (
        <path d="M84 50c4 6 11 10 16 10s12-4 16-10" />
      ) : (
        <path d="M82 48c4 4 11 6 18 6s14-2 18-6" />
      )}
      {/* 肩与短袖 */}
      <path d="M70 56c8-6 18-8 30-8s22 2 30 8l4 16-10 4" />
      <path d="M70 56l-4 16 10 4" />
      {/* 上身 */}
      <path d="M76 76c4 8 14 14 24 14s20-6 24-14" />
      <path d="M76 76v32M124 76v32" />
      {/* 高腰收腰线 */}
      <path d="M76 108c4 4 14 7 24 7s20-3 24-7" opacity="0.7" />
      {/* 裙摆 A 字 */}
      <path d="M76 108L48 248" />
      <path d="M124 108l28 140" />
      <path d="M48 248c12-4 26-6 52-6s40 2 52 6" />
      {/* variant 差异 */}
      {view === "back" && (
        <>
          <path d="M100 76v172" strokeDasharray="2 4" opacity="0.5" />
          <path d="M82 60c4 3 11 4 18 4s14-1 18-4" opacity="0.4" />
        </>
      )}
      {view === "front" && variant === 0 && (
        <>
          <path d="M84 110h32" opacity="0.4" />
          <path d="M100 92c-4 4-4 14 0 18" opacity="0.3" />
        </>
      )}
      {view === "front" && variant === 1 && (
        <>
          {/* 双层腰带 */}
          <path d="M82 108h36 M82 114h36" opacity="0.45" />
          {/* 前襟开衩 */}
          <path d="M100 92v36" opacity="0.3" />
        </>
      )}
      {view === "front" && variant === 2 && (
        <>
          {/* 蝴蝶结腰饰 */}
          <path d="M86 110c-4-2-8 0-8 4s4 6 8 4 14-2 28-2 24 0 28 2 8 0 8-4-4-6-8-4-14 2-28 2-24 0-28-2z" opacity="0.4" />
          {/* 中央褶皱 */}
          <path d="M100 116v124" opacity="0.18" strokeDasharray="3 5" />
        </>
      )}
      {/* 下摆细线 */}
      <path d="M58 240c8 4 28 6 42 6s34-2 42-6" opacity="0.4" />
    </svg>
  );
}

/* 历史卡用更小的线稿(svg 56) */
function HistorySketch() {
  return (
    <svg viewBox="0 0 56 80" fill="none" stroke="#9B7A68" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <ellipse cx="28" cy="10" rx="5" ry="6" />
      <path d="M22 18c0 2 3 4 6 4s6-2 6-4" />
      <path d="M16 22c4-2 8-3 12-3s8 1 12 3l2 6-4 2" />
      <path d="M16 22l-2 6 4 2" />
      <path d="M18 30v8M38 30v8" />
      <path d="M18 38L8 72" />
      <path d="M38 38l10 34" />
      <path d="M8 72c4-1 10-2 20-2s16 1 20 2" />
    </svg>
  );
}

export default function SketchPage() {
  const router = useRouter();
  const toast  = useToast();

  const [neckline, setNeckline] = useState<Neckline>("round");
  const [sleeve, setSleeve]     = useState<Sleeve>("short");
  const [skirt, setSkirt]       = useState<SkirtLen>("knee");
  const [waist, setWaist]       = useState<Waist>("high");
  const [desc, setDesc]         = useState("");
  const [phase, setPhase]       = useState<Phase>("idle");
  const [variant, setVariant]   = useState<0 | 1 | 2>(0);
  const [resultId, setResultId] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [history, setHistory]   = useState<HistoryItem[]>(SEED_HISTORY);

  const abortRef = useRef<AbortController | null>(null);
  useEffect(() => () => { abortRef.current?.abort(); }, []);

  async function runGenerate() {
    if (phase === "loading") return;
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setPhase("loading");
    setErrorMsg("");

    /* 接入 POST /api/ai-studio/generate
       后端 tool="sketch-generate";lib/ai-studio-prompts.ts §08 字段:
       garmentType / neckline / sleeveType / skirtLength / userPrompt / view */
    const trimmed = desc.trim().slice(0, 200);
    const body = {
      tool: "sketch-generate" as const,
      prompt: `Fashion technical flat sketch — front + back view of a dress.`,
      params: {
        /* 用户 §一 schema 字段 */
        neckline:    NECKLINE_TO_API[neckline],
        sleeve:      SLEEVE_TO_API[sleeve],
        length:      skirt,
        waist,
        description: trimmed || undefined,
        /* 后端 buildSketchGeneratePrompt 字段 */
        garmentType: "dress",
        sleeveType:  SLEEVE_TO_API[sleeve],
        skirtLength: skirt,
        userPrompt:  trimmed || undefined,
        view:        "both",
      },
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
        useMockFallback("接口暂不可用,展示示例线稿");
        return;
      }

      const data = (await res.json()) as
        | { success: true; images: { url: string }[] }
        | { success: false; error: string };

      if (!res.ok || !("success" in data) || !data.success) {
        setPhase("error");
        setErrorMsg("线稿生成失败,请减少参数或换一种描述");
        toast.show("线稿生成失败,请减少参数或换一种描述", { tone: "error" });
        return;
      }

      /* 真接口返图片 URL,但 sketch 页面坚持用内联 SVG 保证零外部依赖
         + 视觉一致(spec §4.5 线稿色 #9B7A68)。Step 3 起按需切换 */
      finishWithResult(false);
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      console.error("[sketch] api error, fallback to mock SVG:", err);
      useMockFallback("接口暂不可用,展示示例线稿");
    }
  }

  function useMockFallback(toastMsg: string) {
    finishWithResult(true, toastMsg);
  }

  function finishWithResult(isMock: boolean, mockMsg?: string) {
    const id = `r-${Date.now()}`;
    setResultId(id);
    setVariant(0);
    setPhase("result");

    if (isMock && mockMsg) {
      toast.show(mockMsg, { tone: "warning" });
    }

    const nLabel = NECKLINES.find((n) => n.id === neckline)?.label ?? "";
    const sLabel = SLEEVES.find((s) => s.id === sleeve)?.label ?? "";
    const kLabel = SKIRT_LENS.find((s) => s.id === skirt)?.label ?? "";
    const wLabel = WAISTS.find((w) => w.id === waist)?.label ?? "";
    setHistory((prev) =>
      [
        { id, title: `${nLabel}·${sLabel}·${kLabel}·${wLabel}`, time: nowLabel() },
        ...prev,
      ].slice(0, 5)
    );
  }

  function handleSave() {
    if (phase !== "result") return;
    /* TODO step 3:接入真实 POST /api/designs/save */
    toast.show("已保存到我的作品", { tone: "success" });
  }
  function handleAttach() {
    if (phase !== "result") return;
    /* TODO step 3:从 query 拿 currentWorkId,POST /api/designs/[id]/attach */
    toast.show("已附加到当前作品", { tone: "success" });
  }
  function handleHome() {
    /* /my-studio/works 暂未建,先去 /my-studio 主页(更稳),不跳坏页面 */
    router.push("/my-studio");
  }
  function handleSwitchVariant() {
    if (phase !== "result") return;
    setVariant((v) => ((v + 1) % 3) as 0 | 1 | 2);
    toast.show("已切换线稿方案", { tone: "info" });
  }
  function handleRetry() {
    runGenerate();
  }

  const isLoading  = phase === "loading";
  const hasResult  = phase === "result";
  const hasError   = phase === "error";
  const needsAuth  = phase === "auth-required";
  const descCount  = desc.length;

  return (
    <div className="skPage">
      <ConsumerNav variant="solid" />

      <div className="skContainer">
        {/* 页面标题区 */}
        <header className="skHeader">
          <p className="skHeader__brand">MAXLULU AI</p>
          <h1 className="skHeader__title">
            款式线稿
            <span className="skHeader__route"> / sketch</span>
          </h1>
          <p className="skHeader__sub">
            自定义领型、袖长、裙长与腰线,一键生成正反面线稿,轻松实现你的设计想法。
          </p>
        </header>

        {/* 面包屑 */}
        <nav className="skCrumb" aria-label="面包屑">
          <Link href="/my-studio">我的设计工作室</Link>
          <span className="skCrumb__sep" aria-hidden>/</span>
          <span className="skCrumb__cur">款式线稿</span>
        </nav>

        {/* 外层大工作台壳 */}
        <div className="skStudioShell">
        <div className="skWorkspace">

          {/* ========== 左:控制面板 ========== */}
          <section className="skPanel skControlPanel" aria-label="款式参数">
            <header className="skControl__head">
              <h2 className="skControl__title">设定款式参数</h2>
              <p className="skControl__hint">选择或自定义参数,生成专属线稿</p>
            </header>

            <ParamGroup label="领型">
              {NECKLINES.map((n) => (
                <button key={n.id} type="button" role="radio" aria-checked={neckline === n.id}
                  className={`skChip${neckline === n.id ? " is-selected" : ""}`}
                  onClick={() => setNeckline(n.id)}>{n.label}</button>
              ))}
            </ParamGroup>

            <ParamGroup label="袖长">
              {SLEEVES.map((s) => (
                <button key={s.id} type="button" role="radio" aria-checked={sleeve === s.id}
                  className={`skChip${sleeve === s.id ? " is-selected" : ""}`}
                  onClick={() => setSleeve(s.id)}>{s.label}</button>
              ))}
            </ParamGroup>

            <ParamGroup label="裙长">
              {SKIRT_LENS.map((s) => (
                <button key={s.id} type="button" role="radio" aria-checked={skirt === s.id}
                  className={`skChip${skirt === s.id ? " is-selected" : ""}`}
                  onClick={() => setSkirt(s.id)}>{s.label}</button>
              ))}
            </ParamGroup>

            <ParamGroup label="腰线">
              {WAISTS.map((w) => (
                <button key={w.id} type="button" role="radio" aria-checked={waist === w.id}
                  className={`skChip${waist === w.id ? " is-selected" : ""}`}
                  onClick={() => setWaist(w.id)}>{w.label}</button>
              ))}
            </ParamGroup>

            <div className="skParamGroup">
              <p className="skParamGroup__label">文字描述<span className="skParamGroup__opt">(可选)</span></p>
              <textarea
                className="skDescriptionInput"
                value={desc}
                onChange={(e) => setDesc(e.target.value.slice(0, 200))}
                placeholder="例如:A 字裙摆,收腰设计,后背拉链开合"
                maxLength={200}
                rows={3}
              />
              <span className="skDescriptionInput__count">{descCount}/200</span>
            </div>

            <button
              type="button"
              className="skPrimary skPrimary--full"
              onClick={runGenerate}
              disabled={isLoading || needsAuth}
            >
              {isLoading ? "生成中…" : "生成线稿"}
            </button>
            <p className="skQuota">今日剩余次数:<b>8</b> 次</p>
          </section>

          {/* ========== 中:预览面板 ========== */}
          <section className="skPanel skPreviewPanel" aria-label="线稿预览">
            <header className="skPreviewHead">
              <h2 className="skPanel__title">线稿预览</h2>
              {hasResult && (
                <button type="button" className="skGhost skGhost--sm" onClick={handleSwitchVariant}>
                  <span aria-hidden>↻</span> 切换方案
                </button>
              )}
            </header>

            <div className="skPreviewStage">
              {needsAuth && (
                <div className="skEmpty">
                  <div className="skEmpty__art" aria-hidden style={{ display: "inline-flex", justifyContent: "center", opacity: 0.85 }}>
                    <svg viewBox="0 0 64 64" fill="none" width="64" height="64">
                      <g stroke="#234A58" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.78">
                        <rect x="18" y="28" width="28" height="22" rx="3" />
                        <path d="M24 28v-6a8 8 0 0 1 16 0v6" />
                        <circle cx="32" cy="38" r="2" fill="#234A58" stroke="none" opacity="0.95" />
                        <path d="M32 40v4" />
                      </g>
                    </svg>
                  </div>
                  <h3 className="skEmpty__title">请先登录,即可使用 AI 创作工具</h3>
                  <p className="skEmpty__desc">登录后可保存作品、参与定制下单。</p>
                  <Link href="/login" className="skPrimary" style={{ marginTop: 14 }}>去登录</Link>
                </div>
              )}
              {phase === "idle" && (
                <div className="skEmpty">
                  <div className="skEmpty__art" aria-hidden>
                    {/* 浅色双图占位:正反面线稿轮廓,半透明 */}
                    <span className="skEmpty__sketch"><DressSketch view="front" /></span>
                    <span className="skEmpty__sketch"><DressSketch view="back" /></span>
                  </div>
                  <h3 className="skEmpty__title">选择款式参数,生成你的第一张正反面线稿</h3>
                  <p className="skEmpty__desc">
                    左侧选择领型、袖长、裙长与腰线,点击"生成线稿"。
                  </p>
                </div>
              )}

              {isLoading && (
                <div className="skLoading" role="status" aria-live="polite">
                  {/* 线条逐渐绘制动画(spec §4.6 loading)*/}
                  <div className="skDrawing" aria-hidden>
                    <svg viewBox="0 0 200 280" fill="none" stroke="#9B7A68" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M88 36c2 4 6 7 12 7s10-3 12-7" className="skDrawing__line" style={{ animationDelay: "0s"   }} />
                      <path d="M70 56c8-6 18-8 30-8s22 2 30 8l4 16-10 4M70 56l-4 16 10 4" className="skDrawing__line" style={{ animationDelay: "0.3s" }} />
                      <path d="M76 76c4 8 14 14 24 14s20-6 24-14M76 76v32M124 76v32" className="skDrawing__line" style={{ animationDelay: "0.6s" }} />
                      <path d="M76 108L48 248M124 108l28 140M48 248c12-4 26-6 52-6s40 2 52 6" className="skDrawing__line" style={{ animationDelay: "1s" }} />
                    </svg>
                  </div>
                  <p className="skLoading__text">线条正在落笔…</p>
                </div>
              )}

              {hasResult && (
                <div className="skResult">
                  <figure className="skSketchFront">
                    <div className="skSketch__canvas">
                      <DressSketch view="front" variant={variant} />
                    </div>
                    <figcaption className="skSketch__caption">正面 / Front</figcaption>
                  </figure>
                  <figure className="skSketchBack">
                    <div className="skSketch__canvas">
                      <DressSketch view="back" variant={variant} />
                    </div>
                    <figcaption className="skSketch__caption">背面 / Back</figcaption>
                  </figure>
                </div>
              )}

              {hasError && (
                <div className="skEmpty">
                  <div className="skEmpty__art" aria-hidden>
                    <svg viewBox="0 0 80 80" fill="none">
                      <g stroke="#C06A73" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" opacity="0.65">
                        <circle cx="40" cy="40" r="20" />
                        <path d="M40 30v14" />
                        <circle cx="40" cy="52" r="1.5" fill="#C06A73" stroke="none" />
                      </g>
                    </svg>
                  </div>
                  <h3 className="skEmpty__title">这次没能画出来</h3>
                  <p className="skEmpty__desc">{errorMsg || "请减少参数或换一种描述再试一次。"}</p>
                </div>
              )}
            </div>

            {hasResult && (
              <>
                {/* 方案切换缩略图(3 个 variant 联动) */}
                <div className="skVariants" role="tablist" aria-label="切换方案">
                  {([0, 1, 2] as const).map((i) => (
                    <button
                      key={i}
                      type="button"
                      role="tab"
                      aria-selected={variant === i}
                      className={`skVariant${variant === i ? " is-active" : ""}`}
                      onClick={() => setVariant(i)}
                    >
                      <span className="skVariant__thumb" aria-hidden>
                        <HistorySketch />
                      </span>
                    </button>
                  ))}
                </div>

                {/* 底部金提示条 */}
                <div className="skAdvice" role="status">
                  <span className="skAdvice__dot" aria-hidden />
                  <span>线稿可作为<b>定制参考</b>,也可以附加到你的作品里</span>
                </div>
              </>
            )}

            {hasError && (
              <div className="skAdvice skAdvice--error" role="alert">
                <span className="skAdvice__dot skAdvice__dot--error" aria-hidden />
                <span>{errorMsg || "线稿生成失败,请减少参数或换一种描述"}</span>
                <button type="button" className="skGhost skGhost--error" onClick={handleRetry}>
                  重试
                </button>
              </div>
            )}
          </section>

          {/* ========== 右:操作面板 ========== */}
          <aside className="skPanel skActionPanel" aria-label="保存与操作">
            <h2 className="skPanel__title">保存与操作</h2>

            <div className="skActions">
              <button
                type="button"
                className="skPrimary skPrimary--full"
                disabled={!hasResult}
                onClick={handleSave}
              >
                保存到作品
              </button>
              <button
                type="button"
                className="skSecondary skSecondary--full"
                disabled={!hasResult}
                onClick={handleAttach}
              >
                附加到当前作品
              </button>
            </div>

            <div className="skDivider" aria-hidden />

            <h3 className="skActionPanel__sub">最近生成</h3>
            <ul className="skHistory" role="list">
              {history.map((h) => (
                <li key={h.id} className="skHistoryItem">
                  <span className="skHistoryItem__thumb" aria-hidden>
                    <HistorySketch />
                  </span>
                  <span className="skHistoryItem__meta">
                    <span className="skHistoryItem__title">{h.title}</span>
                    <span className="skHistoryItem__time">{h.time}</span>
                  </span>
                </li>
              ))}
            </ul>
          </aside>
        </div>
        </div>{/* /.skStudioShell */}

        {/* 底部完成 banner(spec §4.2 完成提示背景 #FCF7F3) */}
        <section className="skNextBanner" aria-label="完成创作">
          <span className="skNextBanner__icon" aria-hidden>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12l4 4 10-10" />
            </svg>
          </span>
          <div className="skNextBanner__copy">
            <h3 className="skNextBanner__title">已完成创作链路,可返回作品中心管理</h3>
            <p className="skNextBanner__desc">
              线稿已保存到你的设计工作室,可在「我的作品」中查看、编辑或发布。
            </p>
          </div>
          <button
            type="button"
            className="skPrimary skPrimary--banner"
            onClick={handleHome}
          >
            前往作品中心 →
          </button>
        </section>
      </div>
    </div>
  );
}

/* 参数组(label + chips 行)*/
function ParamGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="skParamGroup" role="radiogroup" aria-label={label}>
      <p className="skParamGroup__label">{label}</p>
      <div className="skChips">{children}</div>
    </div>
  );
}
