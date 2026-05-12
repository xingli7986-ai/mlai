import type { StudioCurrentStep, StudioWorkDTO } from "@/lib/my-studio/types";

const STEP_LABELS: Record<StudioCurrentStep, string> = {
  draft: "草案",
  created: "已创建",
  pattern_done: "印花已选择",
  seamless_done: "可进入虚拟试穿",
  application_done: "可进入虚拟试穿",
  tryon_done: "虚拟试穿已生成",
  sketch_done: "生产资料草案",
  confirmed: "设计已确认",
  production_draft: "生产资料草案",
  pending_review: "等待后台审核",
  approved_for_production: "可生产",
  production_sheet_done: "生产资料草案",
};

export default function StudioWorkSummary({ work }: { work: StudioWorkDTO }) {
  return (
    <section className="studioWorkSummary" aria-label="作品摘要">
      <div className="studioWorkSummary__head">
        <div>
          <p className="studioWorkSummary__eyebrow">Current Garment Work</p>
          <h2>{work.title}</h2>
        </div>
        <span className="studioWorkSummary__step">{STEP_LABELS[work.currentStep]}</span>
      </div>
      <dl className="studioWorkSummary__grid">
        <div>
          <dt>品类</dt>
          <dd>{work.config.garmentType || work.config.category}</dd>
        </div>
        <div>
          <dt>版型</dt>
          <dd>{work.config.silhouette}</dd>
        </div>
        <div>
          <dt>场景</dt>
          <dd>{work.config.occasion}</dd>
        </div>
        <div>
          <dt>尺码</dt>
          <dd>{work.config.size}</dd>
        </div>
        <div>
          <dt>资产</dt>
          <dd>
            印花 {work.assetCounts.patterns} · 试穿 {work.assetCounts.tryOns}
          </dd>
        </div>
        <div>
          <dt>更新</dt>
          <dd>{formatStudioDate(work.updatedAt)}</dd>
        </div>
      </dl>
      {work.selectedAssets.downstreamMayNeedRefresh && (
        <p className="studioFlowBadge">你已更换当前印花，建议重新生成虚拟试穿预览。</p>
      )}
    </section>
  );
}

function formatStudioDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "刚刚更新";
  return date.toLocaleDateString("zh-CN", { month: "2-digit", day: "2-digit" });
}
