"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import ConsumerNav from "@/components/ConsumerNav";
import "./try-on.css";

const PATTERN = {
  title: "法式玫瑰藤蔓印花",
  image: "/assets/my-studio/04_work_thumbnails/maxlulu-my-studio-work-rose-vine-print-1080x1440.png",
};

const TRY_ON_RESULTS = [
  "/assets/my-studio/05_try_on_results/tryon-floral-wrap-front-1080x1440.png",
  "/assets/my-studio/05_try_on_results/tryon-floral-fullbody-front-1080x1440.png",
  "/assets/my-studio/05_try_on_results/tryon-floral-portrait-side-1080x1440.png",
];

const STAGES = ["读取当前印花", "匹配版型模板", "贴合服装区域", "渲染上身效果"];

export default function TryOnPage() {
  const searchParams = useSearchParams();
  const workId = searchParams.get("workId");
  const [bodyOpen, setBodyOpen] = useState(false);
  const [template, setTemplate] = useState("裹身裙");
  const [size, setSize] = useState("M");
  const [style, setStyle] = useState("通勤自然");
  const [scene, setScene] = useState("棚拍干净");
  const [angle, setAngle] = useState("全身展示");
  const [generating, setGenerating] = useState(false);
  const [selected, setSelected] = useState(0);
  const [history, setHistory] = useState(TRY_ON_RESULTS);
  const [message, setMessage] = useState("");

  function generatePreview() {
    setGenerating(true);
    setMessage("");
    window.setTimeout(() => {
      const nextImage = TRY_ON_RESULTS[(history.length + 1) % TRY_ON_RESULTS.length];
      setHistory((current) => [nextImage, ...current]);
      setSelected(0);
      setGenerating(false);
      setMessage("新的上身效果已生成，并已加入历史试穿。");
    }, 1600);
  }

  return (
    <main className="toPage">
      <ConsumerNav variant="solid" />
      <div className="toShell">
        <aside className="toWorkbench">
          <nav className="toCrumb">
            <Link href="/my-studio">我的设计工作室</Link>
            <span>/</span>
            <span>虚拟试穿</span>
          </nav>
          <header>
            <p>Virtual Fitting</p>
            <h1>虚拟试穿</h1>
            <span>使用当前印花、版型和身材参数生成上身效果。</span>
          </header>

          {!workId && (
            <div className="toNotice">
              还没有连接到具体作品。你可以先查看页面结构；要保存试穿历史，请从我的设计工作室创建作品并选择印花。
              <Link href="/my-studio">返回我的设计工作室</Link>
            </div>
          )}

          <section className="toPanel">
            <h2>当前设计</h2>
            <dl className="toMeta">
              <div><dt>款式</dt><dd>连衣裙</dd></div>
              <div><dt>版型</dt><dd>{template}</dd></div>
              <div><dt>尺码</dt><dd>{size}</dd></div>
              <div><dt>场景</dt><dd>通勤 / 日常</dd></div>
            </dl>
          </section>

          <section className="toPanel">
            <h2>当前印花</h2>
            <p>用于本次上身效果生成。</p>
            <div className="toPattern">
              <img src={PATTERN.image} alt={PATTERN.title} />
              <div>
                <strong>{PATTERN.title}</strong>
                <span>系统会以这张印花作为真实参考图。</span>
                <Link href={workId ? `/my-studio/pattern-generate?workId=${workId}` : "/my-studio/pattern-generate"}>
                  更换印花
                </Link>
              </div>
            </div>
          </section>

          <section className="toPanel">
            <h2>试穿模式</h2>
            <div className="toMode is-selected">
              <strong>高保真参考试穿</strong>
              <span>使用当前印花作为真实参考图，生成更接近所选印花的上身效果。</span>
            </div>
            <small className="toReady">已准备：印花、版型、身材参数；服装区域已根据版型模板准备。</small>
          </section>

          <section className="toPanel">
            <h2>款式与尺码</h2>
            <label>
              版型
              <select value={template} onChange={(event) => setTemplate(event.target.value)}>
                {["A 字裙", "裹身裙", "直筒裙", "收腰裙"].map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <label>
              尺码
              <select value={size} onChange={(event) => setSize(event.target.value)}>
                {["S", "M", "L", "XL"].map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
          </section>

          <section className="toPanel">
            <button className="toCollapse" type="button" onClick={() => setBodyOpen((value) => !value)}>
              <span>
                <strong>我的身材</strong>
                <small>身高 165cm / 体重 52kg / 常穿 M / 合身</small>
              </span>
              {bodyOpen ? "收起" : "编辑身材"}
            </button>
            {bodyOpen && (
              <div className="toBodyGrid">
                {["身高 cm", "体重 kg", "肩宽 cm", "胸围 cm", "腰围 cm", "臀围 cm"].map((label) => (
                  <label key={label}>{label}<input type="number" placeholder="-" /></label>
                ))}
              </div>
            )}
          </section>

          <section className="toPanel">
            <h2>呈现效果</h2>
            <SelectRow label="风格" value={style} onChange={setStyle} options={["通勤自然", "度假轻松", "晚宴精致"]} />
            <SelectRow label="画面" value={scene} onChange={setScene} options={["棚拍干净", "自然光", "城市街拍"]} />
            <SelectRow label="角度" value={angle} onChange={setAngle} options={["正面展示", "侧身展示", "全身展示"]} />
          </section>

          <button className="toPrimary" disabled={generating} onClick={generatePreview}>
            {generating ? "正在生成..." : "生成高保真参考试穿"}
          </button>
          <Link className="toNext" href={workId ? `/my-studio/confirm-design?workId=${workId}` : "/my-studio/confirm-design"}>
            下一步：开始定制
          </Link>
        </aside>

        <section className="toPreview">
          {generating ? (
            <div className="toLoading">
              <img src="/assets/my-studio/try-on/try-on-loading-elegant.png" alt="" />
              <div>
                <h2>正在生成你的上身效果图</h2>
                <p>AI 正在根据印花、版型与身材参数生成试穿预览。</p>
                <ul>{STAGES.map((stage) => <li key={stage}>{stage}</li>)}</ul>
              </div>
            </div>
          ) : (
            <img className="toPreviewImage" src={history[selected]} alt="当前上身效果" />
          )}
          {message && <p className="toMessage">{message}</p>}
          <div className="toThumbStrip">
            {history.slice(0, 4).map((image, index) => (
              <button key={`${image}-${index}`} className={selected === index ? "is-selected" : ""} onClick={() => setSelected(index)}>
                <img src={image} alt="上身效果缩略图" />
              </button>
            ))}
          </div>
        </section>

        <aside className="toRail">
          <Link href="/my-studio#my-design-works">数字资产</Link>
          <h2>历史试穿</h2>
          {generating && <div className="toRailGenerating">生成中<br />即将出现在这里</div>}
          {history.map((image, index) => (
            <button key={`${image}-rail-${index}`} className={selected === index ? "is-selected" : ""} onClick={() => setSelected(index)}>
              <img src={image} alt="历史试穿" />
            </button>
          ))}
        </aside>
      </div>
    </main>
  );
}

function SelectRow({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label>
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </label>
  );
}
