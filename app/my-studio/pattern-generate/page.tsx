"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import ConsumerNav from "@/components/ConsumerNav";
import "./pattern-generate.css";

const PRINTS = [
  {
    id: "rose",
    title: "法式玫瑰藤蔓",
    source: "官方精选",
    image: "/assets/my-studio/04_work_thumbnails/maxlulu-my-studio-work-rose-vine-print-1080x1440.png",
    tags: ["浪漫", "通勤", "柔粉"],
  },
  {
    id: "blue",
    title: "蓝白水彩花卉",
    source: "社区印花",
    image: "/assets/my-studio/04_work_thumbnails/maxlulu-my-studio-work-blue-floral-print-1080x1440.png",
    tags: ["清爽", "日常", "蓝白"],
  },
  {
    id: "peony",
    title: "东方牡丹",
    source: "平台精选",
    image: "/assets/my-studio/04_work_thumbnails/maxlulu-pattern-soft-pink-peony-1080x1440.png",
    tags: ["优雅", "晚宴", "粉白"],
  },
  {
    id: "garden",
    title: "复古小花园",
    source: "社区印花",
    image: "/assets/my-studio/04_work_thumbnails/maxlulu-my-studio-work-summer-garden-dress-1080x1440.png",
    tags: ["复古", "度假", "多彩"],
  },
  {
    id: "teal",
    title: "青绿色牡丹",
    source: "官方精选",
    image: "/assets/my-studio/04_work_thumbnails/maxlulu-pattern-teal-peony-1080x1440.png",
    tags: ["克制", "高级", "青绿"],
  },
  {
    id: "coral",
    title: "珊瑚春日花",
    source: "平台精选",
    image: "/assets/my-studio/04_work_thumbnails/maxlulu-pattern-coral-spring-1080x1440.png",
    tags: ["明亮", "约会", "珊瑚"],
  },
];

const HISTORY = [
  {
    id: "h1",
    title: "AI 根据灵感生成",
    time: "05/12 14:20",
    images: PRINTS.slice(0, 4),
  },
];

export default function PatternGeneratePage() {
  const searchParams = useSearchParams();
  const workId = searchParams.get("workId") || "";
  const [tab, setTab] = useState<"official" | "community" | "history">("official");
  const [board, setBoard] = useState<string[]>(["rose", "blue"]);
  const [selectedId, setSelectedId] = useState<string>("rose");
  const selectedPrint = PRINTS.find((item) => item.id === selectedId) || PRINTS[0];
  const nextHref = workId
    ? `/my-studio/try-on?workId=${encodeURIComponent(workId)}`
    : "/my-studio/try-on";

  const visiblePrints = useMemo(() => {
    if (tab === "history") return [];
    if (tab === "community") return PRINTS.filter((item) => item.source === "社区印花");
    return PRINTS.filter((item) => item.source !== "社区印花");
  }, [tab]);

  function toggleBoard(id: string) {
    setBoard((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : current.length >= 6
          ? current
          : [...current, id],
    );
  }

  return (
    <main className="pgPage">
      <ConsumerNav variant="solid" />
      <div className="pgContainer">
        <header className="pgHeader">
          <nav className="pgCrumb">
            <Link href="/my-studio">我的设计工作室</Link>
            <span>/</span>
            <span>印花创作中心</span>
          </nav>
          <div className="pgTitle">
            <p>Print Studio</p>
            <h1>印花创作中心</h1>
            <span>选择一张印花直接试穿，或参考 2-5 张灵感生成新方案。</span>
          </div>
          <div className="pgSteps">
            {["印花创作", "虚拟试穿", "开始定制", "生产资料草案"].map((step, index) => (
              <b key={step} className={index === 0 ? "is-active" : ""}>
                {index + 1} {step}
              </b>
            ))}
          </div>
        </header>

        <div className="pgShell">
          <section className="pgMain">
            <div className="pgTabs">
              <button className={tab === "official" ? "is-active" : ""} onClick={() => setTab("official")}>
                官方印花
              </button>
              <button className={tab === "community" ? "is-active" : ""} onClick={() => setTab("community")}>
                社区印花
              </button>
              <button className={tab === "history" ? "is-active" : ""} onClick={() => setTab("history")}>
                已保存方案
              </button>
            </div>

            {tab === "history" ? (
              <div className="pgHistory">
                {HISTORY.map((group) => (
                  <article key={group.id}>
                    <div>
                      <strong>{group.title}</strong>
                      <span>{group.time}</span>
                    </div>
                    <div className="pgHistory__grid">
                      {group.images.map((item) => (
                        <button key={item.id} onClick={() => setSelectedId(item.id)}>
                          <img src={item.image} alt={item.title} />
                        </button>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="pgPrintGrid">
                {visiblePrints.map((item) => (
                  <article key={item.id} className={selectedId === item.id ? "is-selected" : ""}>
                    <img src={item.image} alt={item.title} />
                    <div>
                      <span>{item.source}</span>
                      <h2>{item.title}</h2>
                      <p>{item.tags.join(" / ")}</p>
                      <div className="pgCardActions">
                        <button onClick={() => setSelectedId(item.id)}>使用此印花试穿</button>
                        <button onClick={() => toggleBoard(item.id)}>
                          {board.includes(item.id) ? "移出灵感板" : "加入灵感板"}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <aside className="pgSide">
            <section className="pgDecision">
              <p>下一步</p>
              <h2>当前印花将用于虚拟试穿</h2>
              <img src={selectedPrint.image} alt={selectedPrint.title} />
              <strong>{selectedPrint.title}</strong>
              <span>{selectedPrint.source}</span>
              <Link href={nextHref}>下一步：虚拟试穿</Link>
            </section>

            <section className="pgBoard">
              <div>
                <strong>灵感板</strong>
                <span>{board.length} / 6</span>
              </div>
              <div className="pgBoard__thumbs">
                {board.map((id) => {
                  const item = PRINTS.find((print) => print.id === id);
                  return item ? <img key={id} src={item.image} alt={item.title} /> : null;
                })}
              </div>
              <button disabled={board.length < 2}>参考生成新印花并试穿</button>
              {board.length < 2 && <small>再选择至少 {2 - board.length} 张，即可生成新方案。</small>}
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
