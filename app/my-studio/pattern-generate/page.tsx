"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ConsumerNav from "@/components/ConsumerNav";
import { useToast } from "@/components/ui/Toast";
import "./pattern-generate.css";

/* ----------------------------------------------------------------
   spec/11 §1 + 设计稿 08_my-studio-pattern-generate.png
   消费者版 /my-studio/pattern-generate(花型设计) — Step 2:
   - 接入 POST /api/ai-studio/generate(tool=pattern-generate)
   - 4 阶段状态机:idle / loading / result / error
   - 空 prompt warn,选中切换,假保存 toast,下一步跳转 seamless
   - 接口失败/未登录(401) → 退回 mock 占位图,info toast,UI 流程仍可走
   ---------------------------------------------------------------- */

const A_WORK = "/assets/my-studio/04_work_thumbnails";

/* mock fallback v2-fix:仅用纯花型 / 印花图,严禁模特图 / 上身图 / 款式线稿 / moodboard
   ※ 之前误把 home/04-prints/ 下的 ink-floral-print 等当花型,实际是 try-on / 设计板,已弃用
   ※ 6 张全部为人工核验过的纯花卉印花图案,适合 pattern-generate 输出语义 */
const PATTERN_ROSE_VINE       = `${A_WORK}/maxlulu-my-studio-work-rose-vine-print-1080x1440.png`;
const PATTERN_BLUE_FLORAL     = `${A_WORK}/maxlulu-my-studio-work-blue-floral-print-1080x1440.png`;
const PATTERN_TEAL_PEONY      = `${A_WORK}/maxlulu-pattern-teal-peony-1080x1440.png`;
const PATTERN_SOFT_PINK_PEONY = `${A_WORK}/maxlulu-pattern-soft-pink-peony-1080x1440.png`;
const PATTERN_CORAL_SPRING    = `${A_WORK}/maxlulu-pattern-coral-spring-1080x1440.png`;
const PATTERN_WATERCOLOR_PINK = `${A_WORK}/maxlulu-pattern-watercolor-pink-1080x1440.png`;

const PLACEHOLDER_RESULTS = [
  PATTERN_ROSE_VINE,
  PATTERN_TEAL_PEONY,
  PATTERN_BLUE_FLORAL,
  PATTERN_CORAL_SPRING,
];

const STYLE_TAGS = ["法式浪漫", "水彩花卉", "优雅通勤", "复古花园"] as const;
type StyleTag = (typeof STYLE_TAGS)[number];

type PrintType = "focal" | "allover";
/* 用户 Step 2 §一 映射:focal → placement / allover → allover(后端 buildPatternGeneratePrompt 的 arrangement 字段) */
const PRINT_TYPE_TO_ARRANGEMENT: Record<PrintType, "placement" | "allover"> = {
  focal: "placement",
  allover: "allover",
};

const PRINT_TYPES: { id: PrintType; title: string; desc: string }[] = [
  { id: "focal",   title: "重点花型", desc: "一处主视觉,适合裙摆 / 胸前点缀" },
  { id: "allover", title: "满印花型", desc: "四方连续,可铺成整匹面料" },
];

interface ResultItem { id: string; url: string }
interface HistoryItem { id: string; title: string; time: string; thumb: string }

/* 5 条占位历史(初始填充,生成成功后会 prepend 真实结果)
   v2-fix:历史缩略图全部为纯花卉印花 */
const SEED_HISTORY: HistoryItem[] = [
  { id: "h1", title: "玫瑰藤蔓", time: "今天 14:32", thumb: PATTERN_ROSE_VINE       },
  { id: "h2", title: "粉调牡丹", time: "昨天 20:18", thumb: PATTERN_SOFT_PINK_PEONY },
  { id: "h3", title: "蓝韵繁花", time: "4 月 28 日", thumb: PATTERN_BLUE_FLORAL     },
  { id: "h4", title: "珊瑚春日", time: "4 月 24 日", thumb: PATTERN_CORAL_SPRING    },
  { id: "h5", title: "粉色水彩", time: "4 月 20 日", thumb: PATTERN_WATERCOLOR_PINK },
];

type Phase = "idle" | "loading" | "result" | "error" | "auth-required";

/* 工艺建议(Step 2 §六 — 后端目前没返 recommendation,先 mock) */
const CRAFT_ADVICE = "这个花型色彩丰富,建议使用";
const CRAFT_HIGHLIGHT = "数码印花";
const CRAFT_TAIL = "工艺效果更好";

function nowLabel(): string {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `今天 ${hh}:${mm}`;
}

export default function PatternGeneratePage() {
  const router = useRouter();
  const toast = useToast();

  const [prompt, setPrompt] = useState("");
  const [tags, setTags] = useState<StyleTag[]>(["法式浪漫"]);
  const [printType, setPrintType] = useState<PrintType>("focal");
  const [phase, setPhase] = useState<Phase>("idle");
  const [results, setResults] = useState<ResultItem[]>([]);
  const [selected, setSelected] = useState(0);
  const [history, setHistory] = useState<HistoryItem[]>(SEED_HISTORY);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [promptError, setPromptError] = useState(false);

  const abortRef = useRef<AbortController | null>(null);

  // cleanup on unmount
  useEffect(() => () => {
    abortRef.current?.abort();
  }, []);

  function toggleTag(t: StyleTag) {
    setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  }

  async function runGenerate() {
    // 空 prompt warn(Step 2 §三)
    const trimmed = prompt.trim();
    if (!trimmed) {
      setPromptError(true);
      toast.show("先描述一下你想要的花型灵感", { tone: "warning" });
      return;
    }
    setPromptError(false);

    // 取消上一次未完成的请求
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setPhase("loading");
    setErrorMsg("");
    setSelected(0);

    /* 接入 POST /api/ai-studio/generate
       后端 schema(实际):tool / params(buildPatternGeneratePrompt) / count / size
       - 不再传顶层 prompt(避免与 params.userPrompt 重复)
       - patternType 固定 "floral"(后续可扩;风格标签拼到 userPrompt 里) */
    const styleNote = tags.length > 0 ? `风格:${tags.join("、")}。` : "";
    const enrichedUserPrompt = (styleNote + trimmed).trim();
    const requestBody = {
      tool: "pattern-generate" as const,
      params: {
        patternType: "floral",
        arrangement: PRINT_TYPE_TO_ARRANGEMENT[printType],
        colorPalette: "soft and elegant, brand palette",
        userPrompt: enrichedUserPrompt,
      },
      count: 4,
      size: "1:1",
    };

    try {
      const res = await fetch("/api/ai-studio/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
        signal: ac.signal,
      });

      // 401 未登录 → 显式登录引导,不再静默 mock fallback
      if (res.status === 401) {
        setPhase("auth-required");
        toast.show("请先登录,即可使用 AI 创作工具", { tone: "warning" });
        return;
      }
      // 503 服务不可用 → mock fallback 保留 UI 流程
      if (res.status === 503) {
        useMockResults("接口暂不可用,展示示例结果");
        return;
      }

      const data = (await res.json()) as
        | { success: true; images: { url: string }[] }
        | { success: false; error: string };

      if (!res.ok || !("success" in data) || !data.success) {
        const msg = "error" in data ? data.error : "生成失败";
        // 真实生成失败 → error 阶段
        setPhase("error");
        setErrorMsg("生成失败了,可以换一种描述再试一次");
        toast.show(msg || "生成失败了,可以换一种描述再试一次", { tone: "error" });
        return;
      }

      const urls = data.images.map((img) => img.url).filter(Boolean);
      if (urls.length === 0) {
        setPhase("error");
        setErrorMsg("生成失败了,可以换一种描述再试一次");
        toast.show("生成失败了,可以换一种描述再试一次", { tone: "error" });
        return;
      }

      finishWithResults(urls.map((url, i) => ({ id: `r-${Date.now()}-${i}`, url })));
    } catch (err) {
      if ((err as Error).name === "AbortError") return; // 主动取消,不报错
      console.error("[pattern-generate] api error, falling back to mock:", err);
      useMockResults("接口暂不可用,展示示例结果");
    }
  }

  function useMockResults(toastMsg: string) {
    const items: ResultItem[] = PLACEHOLDER_RESULTS.map((url, i) => ({
      id: `mock-${Date.now()}-${i}`,
      url,
    }));
    finishWithResults(items, toastMsg);
  }

  function finishWithResults(items: ResultItem[], fallbackToast?: string) {
    setResults(items);
    setSelected(0);
    setPhase("result");
    if (fallbackToast) {
      toast.show(fallbackToast, { tone: "warning" });
    } else {
      toast.show(`已为你生成 ${items.length} 个花型方向`, { tone: "info" });
    }
    // prepend 到最近历史(最多 5 条)
    const title = prompt.trim().slice(0, 10) || "未命名花型";
    setHistory((prev) =>
      [
        { id: items[0].id, title, time: nowLabel(), thumb: items[0].url },
        ...prev,
      ].slice(0, 5)
    );
  }

  function handleSave() {
    if (!hasResult) return;
    const sel = results[selected];
    if (!sel) return;
    /* TODO step 3:接入真实 POST /api/designs/save,提交 sel.url + prompt + params */
    toast.show("已保存到我的作品", { tone: "success" });
  }

  function handleNext() {
    if (!hasResult) return;
    const sel = results[selected];
    if (!sel) return;
    /* TODO step 3:用真实 saved workId 替代临时 sel.id */
    router.push(`/my-studio/seamless?from=pattern-generate&workId=${encodeURIComponent(sel.id)}`);
  }

  function handleRetry() {
    runGenerate();
  }

  const promptCount = prompt.length;
  const isLoading = phase === "loading";
  const hasResult = phase === "result";
  const hasError = phase === "error";
  const needsAuth = phase === "auth-required";

  return (
    <div className="pgPage">
      <ConsumerNav variant="solid" />

      <div className="pgContainer">
        {/* 页面级标题区(品牌行 + 中英标题 + 副标题)*/}
        <header className="pgHeader">
          <p className="pgHeader__brand">MaxLuLu AI</p>
          <h1 className="pgHeader__title">
            花型设计
            <span className="pgHeader__route"> / pattern-generate</span>
          </h1>
          <p className="pgHeader__sub">用一句话描述你的花卉印花,AI 为你生成专属花型</p>
        </header>

        {/* 面包屑 */}
        <nav className="pgCrumb" aria-label="面包屑">
          <Link href="/my-studio">我的设计工作室</Link>
          <span className="pgCrumb__sep" aria-hidden>/</span>
          <span className="pgCrumb__cur">花型设计</span>
        </nav>

        {/* 外层大工作台壳 — 包住三栏 */}
        <div className="pgStudioShell">
        <div className="pgWorkspace">
          {/* ========== 左:输入面板 ========== */}
          <section className="pgPanel pgInputPanel" aria-label="创意输入">
            <header className="pgPanel__head">
              <span className="pgStep">1</span>
              <h2 className="pgPanel__title">描述你的花型灵感</h2>
            </header>

            <div className="pgField">
              <textarea
                className={`pgPrompt${promptError ? " is-error" : ""}`}
                value={prompt}
                onChange={(e) => {
                  setPrompt(e.target.value.slice(0, 200));
                  if (promptError) setPromptError(false);
                }}
                placeholder="例如:法式手绘玫瑰花卉,柔粉与米白渐染,带轻盈藤蔓"
                maxLength={200}
                rows={5}
              />
              <span className="pgPrompt__count">{promptCount}/200</span>
            </div>

            <div className="pgField">
              <p className="pgField__label">风格</p>
              <div className="pgChips" role="group" aria-label="风格标签">
                {STYLE_TAGS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={`pgChip${tags.includes(t) ? " is-selected" : ""}`}
                    onClick={() => toggleTag(t)}
                    aria-pressed={tags.includes(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="pgField">
              <p className="pgField__label">印花类型</p>
              <div className="pgPrintTypes" role="radiogroup" aria-label="印花类型">
                {PRINT_TYPES.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    role="radio"
                    aria-checked={printType === p.id}
                    className={`pgPrintType${printType === p.id ? " is-selected" : ""}`}
                    onClick={() => setPrintType(p.id)}
                  >
                    <span className="pgPrintType__title">{p.title}</span>
                    <span className="pgPrintType__desc">{p.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <aside className="pgTip pgTip--gold" role="note">
              <span className="pgTip__icon" aria-hidden>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 1.5l1.6 4.4 4.4 1.6-4.4 1.6L8 13.5l-1.6-4.4L2 7.5l4.4-1.6z" />
                </svg>
              </span>
              <span>
                <b>首次使用小贴士</b>:描述越具体,生成的花型越接近你想要的样子。可加入颜色、花种与质感。
              </span>
            </aside>

            <button
              type="button"
              className="pgPrimary"
              onClick={runGenerate}
              disabled={isLoading || needsAuth}
            >
              {isLoading ? "设计中…" : "开始设计"}
            </button>

            <p className="pgQuota">今日剩余额度:<b>8</b> 次</p>
          </section>

          {/* ========== 中:结果预览面板 ========== */}
          <section className="pgPanel pgResultPanel" aria-label="生成结果">
            {hasResult && (
              <div className="pgAdvice" role="status">
                <span className="pgAdvice__dot" aria-hidden />
                <span>
                  {CRAFT_ADVICE}<b>{CRAFT_HIGHLIGHT}</b>{CRAFT_TAIL}
                </span>
              </div>
            )}

            {hasError && (
              <div className="pgAdvice pgAdvice--error" role="alert">
                <span className="pgAdvice__dot pgAdvice__dot--error" aria-hidden />
                <span>{errorMsg || "生成失败了,可以换一种描述再试一次"}</span>
                <button type="button" className="pgGhost pgGhost--error" onClick={handleRetry}>
                  重试
                </button>
              </div>
            )}

            <header className="pgResultHead">
              <h2 className="pgPanel__title">AI 生成结果</h2>
              {hasResult && (
                <button type="button" className="pgGhost" onClick={runGenerate}>
                  <span aria-hidden>↻</span> 换一组
                </button>
              )}
            </header>

            {needsAuth && (
              <div className="pgEmpty">
                <div className="pgEmpty__art" aria-hidden>
                  <svg viewBox="0 0 64 64" fill="none">
                    <g stroke="#234A58" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.78">
                      <rect x="18" y="28" width="28" height="22" rx="3" />
                      <path d="M24 28v-6a8 8 0 0 1 16 0v6" />
                      <circle cx="32" cy="38" r="2" fill="#234A58" stroke="none" opacity="0.95" />
                      <path d="M32 40v4" />
                    </g>
                  </svg>
                </div>
                <h3 className="pgEmpty__title">请先登录,即可使用 AI 创作工具</h3>
                <p className="pgEmpty__desc">登录后可保存作品、参与定制下单。</p>
                <Link href="/login" className="pgPrimary">去登录</Link>
              </div>
            )}

            {phase === "idle" && (
              <div className="pgEmpty">
                {/* 2×2 软占位卡:暗示 AI 会在这 4 个位置生成 */}
                <div className="pgEmpty__slots" aria-hidden>
                  <span className="pgEmpty__slot" />
                  <span className="pgEmpty__slot" />
                  <span className="pgEmpty__slot" />
                  <span className="pgEmpty__slot" />
                </div>
                {/* 中心花卉徽章:品牌感,非技术坐标 */}
                <div className="pgEmpty__art" aria-hidden>
                  <svg viewBox="0 0 64 64" fill="none">
                    <g stroke="#C06A73" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M32 12c4.5 0 8 3.6 8 8 0 2.4-1 4.6-2.6 6.1" opacity="0.55" />
                      <path d="M52 32c0 4.5-3.6 8-8 8-2.4 0-4.6-1-6.1-2.6" opacity="0.55" />
                      <path d="M32 52c-4.5 0-8-3.6-8-8 0-2.4 1-4.6 2.6-6.1" opacity="0.55" />
                      <path d="M12 32c0-4.5 3.6-8 8-8 2.4 0 4.6 1 6.1 2.6" opacity="0.55" />
                      <circle cx="32" cy="32" r="6" opacity="0.85" />
                      <circle cx="32" cy="32" r="2" fill="#C06A73" stroke="none" opacity="0.9" />
                      <path d="M16 48c4-3 8-3 12 0" opacity="0.35" strokeDasharray="2 3" />
                      <path d="M36 16c4-3 8-3 12 0" opacity="0.35" strokeDasharray="2 3" />
                    </g>
                  </svg>
                </div>
                <h3 className="pgEmpty__title">描述你的第一朵花型灵感</h3>
                <p className="pgEmpty__desc">
                  写下花卉、颜色与风格,AI 会为你生成 4 个方向。
                </p>
              </div>
            )}

            {isLoading && (
              <div className="pgLoading" role="status" aria-live="polite">
                <div className="pgPetals" aria-hidden>
                  <span /><span /><span /><span /><span /><span />
                </div>
                <p className="pgLoading__text">AI 正在为你描绘花型…</p>
              </div>
            )}

            {hasError && (
              <div className="pgEmpty">
                <div className="pgEmpty__slots" aria-hidden>
                  <span className="pgEmpty__slot" />
                  <span className="pgEmpty__slot" />
                  <span className="pgEmpty__slot" />
                  <span className="pgEmpty__slot" />
                </div>
                <div className="pgEmpty__art" aria-hidden>
                  <svg viewBox="0 0 64 64" fill="none">
                    <g stroke="#C06A73" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="32" cy="32" r="14" opacity="0.5" />
                      <path d="M32 24v10" opacity="0.85" />
                      <circle cx="32" cy="40" r="1.4" fill="#C06A73" stroke="none" />
                    </g>
                  </svg>
                </div>
                <h3 className="pgEmpty__title">这次没能描绘出来</h3>
                <p className="pgEmpty__desc">换一种花型描述再试一次,或调整风格标签。</p>
              </div>
            )}

            {hasResult && (
              <div className="pgResultGrid" role="list">
                {results.map((r, i) => {
                  const isSel = selected === i;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      role="listitem"
                      className={`pgResultItem${isSel ? " is-selected" : ""}`}
                      onClick={() => setSelected(i)}
                      aria-pressed={isSel}
                    >
                      <img src={r.url} alt={`生成结果 ${i + 1}`} />
                      {isSel && (
                        <span className="pgResultItem__badge" aria-hidden>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12l4 4 10-10" />
                          </svg>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {/* ========== 右:操作面板 ========== */}
          <aside className="pgPanel pgActionPanel" aria-label="下一步操作">
            <h2 className="pgPanel__title">下一步操作</h2>

            <div className="pgActions">
              <button
                type="button"
                className="pgPrimary pgPrimary--full"
                disabled={!hasResult}
                onClick={handleSave}
              >
                保存到作品
              </button>
              <button
                type="button"
                className="pgSecondary pgSecondary--full"
                disabled={!hasResult}
                onClick={handleNext}
              >
                下一步:面料铺排
              </button>
            </div>

            <div className="pgDivider" aria-hidden />

            <h3 className="pgActionPanel__sub">最近生成</h3>
            <ul className="pgHistory" role="list">
              {history.map((h) => (
                <li key={h.id} className="pgHistoryItem">
                  <span className="pgHistoryItem__thumb">
                    <img src={h.thumb} alt="" />
                  </span>
                  <span className="pgHistoryItem__meta">
                    <span className="pgHistoryItem__title">{h.title}</span>
                    <span className="pgHistoryItem__time">{h.time}</span>
                  </span>
                </li>
              ))}
            </ul>
          </aside>
        </div>
        </div>{/* /.pgStudioShell */}

        {/* 底部串联 banner */}
        <section className="pgNextBanner" aria-label="下一步:面料铺排">
          <span className="pgNextBanner__icon" aria-hidden>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" />
            </svg>
          </span>
          <div className="pgNextBanner__copy">
            <h3 className="pgNextBanner__title">下一步:把花型铺成面料</h3>
            <p className="pgNextBanner__desc">
              选择底色、调整缩放、查看面料效果,让你的花型跃然成布。
            </p>
          </div>
          <button
            type="button"
            className="pgPrimary pgPrimary--banner"
            disabled={!hasResult}
            onClick={handleNext}
          >
            去面料铺排 →
          </button>
        </section>
      </div>
    </div>
  );
}
