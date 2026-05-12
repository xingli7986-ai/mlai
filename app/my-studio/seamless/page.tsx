import Link from "next/link";
import ConsumerNav from "@/components/ConsumerNav";
import "./seamless.css";

export default function SeamlessCompatPage() {
  return (
    <main className="slCompatPage">
      <ConsumerNav variant="solid" />
      <section className="slCompatCard">
        <p>Compatibility Page</p>
        <h1>印花应用效果已合并到虚拟试穿</h1>
        <span>
          现在你可以直接在虚拟试穿中查看印花穿在衣服上的效果。这个页面仅保留为旧链接和内部技术能力兼容入口，
          不再作为消费者创作流程的下一步。
        </span>
        <div className="slCompatActions">
          <Link href="/my-studio/try-on">进入虚拟试穿</Link>
          <Link href="/my-studio/pattern-generate">返回印花创作中心</Link>
        </div>
      </section>
    </main>
  );
}
