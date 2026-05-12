"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import ConsumerNav from "@/components/ConsumerNav";
import StudioStepGate from "@/components/my-studio/StudioStepGate";
import StudioWorkSummary from "@/components/my-studio/StudioWorkSummary";
import { useToast } from "@/components/ui/Toast";
import type {
  StudioAsset,
  StudioBodyProfile,
  StudioCustomOrderDraft,
  StudioFabricOption,
  StudioFitPreference,
  StudioGarmentTemplate,
  StudioOrderMode,
  StudioWorkDTO,
} from "@/lib/my-studio/types";
import "./confirm-design.css";

type Neckline = "圆领" | "V 领" | "方领";
type Sleeve = "短袖" | "中袖" | "长袖";
type Length = "短款" | "中长款" | "长款";

const WORK_NOT_FOUND_MESSAGE =
  "当前作品不存在或无权访问，请回到我的设计工作室重新选择作品。";
const BASE_ITEM_PRICE = 1299;
const PREMIUM_FABRIC_FEE = 260;
const CUSTOM_SERVICE_FEE = 199;
const DEPOSIT_AMOUNT = 299;
const GROUP_DISCOUNT = 180;

export default function ConfirmDesignPage() {
  const searchParams = useSearchParams();
  const toast = useToast();
  const workId = searchParams.get("workId") || "";

  const [work, setWork] = useState<StudioWorkDTO | null>(null);
  const [loadingWork, setLoadingWork] = useState(Boolean(workId));
  const [workLoadError, setWorkLoadError] = useState("");
  const [orderMode, setOrderMode] = useState<StudioOrderMode>("single");
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState("M");
  const [fabricOption, setFabricOption] = useState<StudioFabricOption>("default");
  const [neckline, setNeckline] = useState<Neckline>("圆领");
  const [sleeve, setSleeve] = useState<Sleeve>("短袖");
  const [length, setLength] = useState<Length>("中长款");
  const [fitPreference, setFitPreference] = useState<StudioFitPreference>("regular");
  const [note, setNote] = useState("");
  const [targetCount, setTargetCount] = useState<3 | 5 | 10>(3);
  const [receiverName, setReceiverName] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [region, setRegion] = useState("");
  const [detail, setDetail] = useState("");
  const [isDefaultAddress, setIsDefaultAddress] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!workId) return;
    let alive = true;
    queueMicrotask(() => {
      if (alive) {
        setLoadingWork(true);
        setWorkLoadError("");
      }
    });
    fetch(`/api/my-studio/works/${encodeURIComponent(workId)}`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { work?: StudioWorkDTO } | null) => {
        if (!alive) return;
        if (!data?.work) {
          setWorkLoadError(WORK_NOT_FOUND_MESSAGE);
          return;
        }
        setWork(data.work);
        hydrateDraft(data.work);
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

  const selectedPattern = useMemo(
    () => findSelected(work?.assets.patterns, work?.selectedAssets.patternResultId),
    [work],
  );
  const selectedTryOn = useMemo(
    () => findSelected(work?.assets.tryOns, work?.selectedAssets.tryOnResultId),
    [work],
  );
  const selectedTemplate = useMemo(
    () =>
      selectedTryOn?.garmentTemplateSnapshot ||
      work?.garmentTemplates.find((item) => item.id === work.selectedAssets.garmentTemplateId) ||
      work?.garmentTemplates[0],
    [selectedTryOn, work],
  );
  const bodyProfile = selectedTryOn?.bodyProfileSnapshot || work?.bodyProfile;
  const priceEstimate = useMemo(
    () => buildPriceEstimate({ orderMode, fabricOption, quantity, targetCount }),
    [fabricOption, orderMode, quantity, targetCount],
  );

  function hydrateDraft(nextWork: StudioWorkDTO) {
    const draft = nextWork.customOrderDraft;
    const profile = nextWork.bodyProfile;
    setQuantity(draft?.customizationOptions.quantity || nextWork.config.quantity || 1);
    setSize(draft?.customizationOptions.size || nextWork.config.size || profile.usualSize || "M");
    setFabricOption(draft?.customizationOptions.fabricOption || "default");
    setNeckline((draft?.customizationOptions.neckline as Neckline) || (nextWork.config.neckline as Neckline) || "圆领");
    setSleeve((draft?.customizationOptions.sleeve as Sleeve) || (nextWork.config.sleeveType as Sleeve) || "短袖");
    setLength((draft?.customizationOptions.skirtLength as Length) || (nextWork.config.skirtLength as Length) || "中长款");
    setFitPreference(draft?.customizationOptions.fitPreference || profile.fitPreference || "regular");
    setNote(draft?.customizationOptions.note || nextWork.config.customerNote || "");
    setOrderMode(draft?.orderMode || "single");
    setTargetCount((draft?.groupOrder?.targetCount as 3 | 5 | 10) || 3);
    setReceiverName(draft?.addressDraft.receiverName || "");
    setReceiverPhone(draft?.addressDraft.phone || "");
    setRegion(draft?.addressDraft.region || "");
    setDetail(draft?.addressDraft.detail || "");
    setIsDefaultAddress(Boolean(draft?.addressDraft.isDefault));
    setSubmitted(draft?.status === "submitted");
  }

  async function submitCustomization() {
    if (!workId || !selectedPattern || !selectedTryOn) {
      toast.show("请先完成印花选择和虚拟试穿。", { tone: "warning" });
      return;
    }
    setSubmitting(true);
    try {
      const customOrderDraft = buildCustomOrderDraft({
        orderMode,
        selectedPattern,
        selectedTryOn,
        bodyProfile,
        selectedTemplate,
        quantity,
        size,
        fabricOption,
        neckline,
        sleeve,
        length,
        fitPreference,
        note,
        targetCount,
        receiverName,
        receiverPhone,
        region,
        detail,
        isDefaultAddress,
        priceEstimate,
      });
      const res = await fetch(`/api/my-studio/works/${encodeURIComponent(workId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          confirmDesign: true,
          confirmConfig: {
            size,
            neckline,
            sleeveType: sleeve,
            skirtLength: length,
            quantity,
            fabric: fabricOption === "premium" ? "高级面料" : "默认面料",
            customerNote: note,
          },
          customOrderDraft,
          note: "用户已提交定制申请，等待后续制作确认。",
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        work?: StudioWorkDTO;
        error?: string;
      };
      if (!res.ok || !data.work) throw new Error(data.error || "定制申请提交失败，请稍后重试。");
      setWork(data.work);
      setSubmitted(true);
      toast.show("定制申请已提交，后续将进入制作确认。", { tone: "success" });
    } catch (err) {
      toast.show(err instanceof Error ? err.message : "定制申请提交失败，请稍后重试。", { tone: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  if (!workId) {
    return (
      <StudioStepGate
        title="请先从我的设计工作室选择一件作品。"
        description="定制确认需要读取同一个作品里的当前印花和当前上身效果。"
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

  if (!loadingWork && work && (!selectedPattern || !selectedTryOn)) {
    return (
      <StudioStepGate
        title="请先完成虚拟试穿。"
        description="开始定制需要当前印花和当前上身效果，请返回上一步补齐。"
        actionHref={selectedPattern ? `/my-studio/try-on?workId=${encodeURIComponent(workId)}` : `/my-studio/pattern-generate?workId=${encodeURIComponent(workId)}`}
        actionLabel={selectedPattern ? "返回虚拟试穿" : "返回印花创作中心"}
      />
    );
  }

  return (
    <div className="cdPage">
      <ConsumerNav variant="solid" />
      <div className="cdContainer">
        <header className="cdTop">
          <nav className="cdCrumb" aria-label="面包屑">
            <Link href="/my-studio">我的设计工作室</Link>
            <span aria-hidden>/</span>
            <span>定制确认</span>
          </nav>
          <div className="cdProgress" aria-label="设计流程进度">
            {["印花创作", "虚拟试穿", "开始定制"].map((step, index) => (
              <span key={step} className={index === 2 ? "is-active" : "is-done"}>
                <b>{index + 1}</b>
                {step}
              </span>
            ))}
          </div>
        </header>

        <section className="cdHero">
          <p className="cdEyebrow">Customization Check</p>
          <h1>定制确认</h1>
          <p>确认你的专属设计，选择定制方式、尺码、面料和收货信息。当前版本只保存申请信息，不会发起真实支付。</p>
        </section>

        {loadingWork && <div className="cdNotice">正在读取设计作品...</div>}
        {work && <StudioWorkSummary work={work} />}

        <div className="cdShell">
          <main className="cdMain">
            <section className="cdPanel">
              <div className="cdPanelHead">
                <div>
                  <p className="cdEyebrow">Current Design</p>
                  <h2>当前设计</h2>
                  <p>这两张图会作为本次定制申请的核心参考。</p>
                </div>
              </div>
              <div className="cdAssetGrid cdAssetGrid--two">
                <AssetCard title="当前印花" asset={selectedPattern} emptyHref={`/my-studio/pattern-generate?workId=${encodeURIComponent(workId)}`} />
                <AssetCard title="当前上身效果图" asset={selectedTryOn} emptyHref={`/my-studio/try-on?workId=${encodeURIComponent(workId)}`} />
              </div>
              <div className="cdSnapshotGrid">
                <div>
                  <span>款式 / 版型</span>
                  <b>{selectedTemplate ? templateSummary(selectedTemplate) : "未选择版型"}</b>
                </div>
                <div>
                  <span>身材摘要</span>
                  <b>{bodyProfileSummary(bodyProfile)}</b>
                </div>
                <div>
                  <span>尺码</span>
                  <b>{size}</b>
                </div>
                <div>
                  <span>数量</span>
                  <b>{quantity} 件</b>
                </div>
              </div>
            </section>

            <section className="cdPanel">
              <div className="cdPanelHead">
                <div>
                  <p className="cdEyebrow">Options</p>
                  <h2>定制选配</h2>
                  <p>先记录用户可理解的选配信息，后续制作确认时再细化。</p>
                </div>
              </div>
              <div className="cdFormGrid">
                <SelectField label="尺码" value={size} onChange={setSize} options={["XS", "S", "M", "L", "XL", "XXL"]} />
                <label>
                  数量
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={quantity}
                    onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))}
                  />
                </label>
                <SelectField
                  label="面料选项"
                  value={fabricOption}
                  onChange={(value) => setFabricOption(value as StudioFabricOption)}
                  options={[
                    { value: "default", label: "默认面料" },
                    { value: "premium", label: "高级面料" },
                  ]}
                />
                <SelectField label="袖长" value={sleeve} onChange={(value) => setSleeve(value as Sleeve)} options={["短袖", "中袖", "长袖"]} />
                <SelectField label="裙长" value={length} onChange={(value) => setLength(value as Length)} options={["短款", "中长款", "长款"]} />
                <SelectField label="领型" value={neckline} onChange={(value) => setNeckline(value as Neckline)} options={["圆领", "V 领", "方领"]} />
                <SelectField
                  label="穿着偏好"
                  value={fitPreference}
                  onChange={(value) => setFitPreference(value as StudioFitPreference)}
                  options={[
                    { value: "slim", label: "修身" },
                    { value: "regular", label: "合身" },
                    { value: "relaxed", label: "微宽松" },
                  ]}
                />
                <label className="cdFormGrid__wide">
                  备注
                  <textarea
                    value={note}
                    rows={4}
                    onChange={(event) => setNote(event.target.value.slice(0, 180))}
                    placeholder="例如：希望更适合通勤，整体不要太夸张。"
                  />
                </label>
              </div>
            </section>

            <section className="cdPanel">
              <div className="cdPanelHead">
                <div>
                  <p className="cdEyebrow">Address</p>
                  <h2>收货地址入口</h2>
                  <p>这里先保存地址草稿，正式下单前仍可修改。</p>
                </div>
              </div>
              <div className="cdFormGrid">
                <TextField label="收货人" value={receiverName} onChange={setReceiverName} placeholder="请输入收货人" />
                <TextField label="手机号" value={receiverPhone} onChange={setReceiverPhone} placeholder="请输入手机号" />
                <TextField label="省市区" value={region} onChange={setRegion} placeholder="例如：上海市 静安区" />
                <TextField label="详细地址" value={detail} onChange={setDetail} placeholder="街道、门牌号等" wide />
                <label className="cdCheckRow">
                  <input
                    type="checkbox"
                    checked={isDefaultAddress}
                    onChange={(event) => setIsDefaultAddress(event.target.checked)}
                  />
                  设为默认地址
                </label>
              </div>
            </section>
          </main>

          <aside className="cdSide">
            <section className="cdPanel cdStickyPanel">
              <p className="cdEyebrow">Price Estimate</p>
              <h2>价格预估</h2>
              <PriceRow label="商品定制价" value={priceEstimate.itemPrice} />
              <PriceRow label="定制服务费" value={priceEstimate.customServiceFee} />
              <PriceRow label="定金" value={priceEstimate.depositAmount} />
              <PriceRow label="拼团价" value={priceEstimate.groupPrice} />
              <PriceRow label="预计尾款" value={priceEstimate.finalPaymentEstimate} strong />
              <div className="cdCycle">预计制作周期：{priceEstimate.productionCycleDays} 天</div>
            </section>

            <section className="cdPanel cdStickyPanel">
              <p className="cdEyebrow">Order Mode</p>
              <h2>选择定制方式</h2>
              <div className="cdModeList">
                <button
                  type="button"
                  className={orderMode === "single" ? "is-selected" : ""}
                  onClick={() => setOrderMode("single")}
                >
                  <strong>个人定制</strong>
                  <span>我想自己定制这一件，确认后进入地址和支付。</span>
                </button>
                <button
                  type="button"
                  className={orderMode === "group" ? "is-selected" : ""}
                  onClick={() => setOrderMode("group")}
                >
                  <strong>发起拼团</strong>
                  <span>发起 7 天拼团，达到成团人数后开始制作；未成团则退回定金。</span>
                </button>
              </div>
              {orderMode === "group" && (
                <div className="cdGroupBox">
                  <SelectField
                    label="成团人数"
                    value={String(targetCount)}
                    onChange={(value) => setTargetCount(Number(value) as 3 | 5 | 10)}
                    options={["3", "5", "10"]}
                  />
                  <p>拼团有效期：7 天</p>
                  <p>未成团规则：7 天内人数未满，拼团失败并退回定金。</p>
                </div>
              )}
              <button
                type="button"
                className="cdPrimary"
                disabled={submitting || !selectedPattern || !selectedTryOn}
                onClick={submitCustomization}
              >
                {submitting
                  ? "正在提交..."
                  : orderMode === "group"
                  ? "发起拼团并支付定金"
                  : "确认定制，进入下单"}
              </button>
              {submitted && (
                <div className="cdSuccess">
                  定制申请已提交，后续将进入制作确认。
                </div>
              )}
              <Link className="cdSecondaryLink" href="/my-studio">
                返回我的设计工作室
              </Link>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

function AssetCard({
  title,
  asset,
  emptyHref,
}: {
  title: string;
  asset?: StudioAsset;
  emptyHref: string;
}) {
  if (!asset) {
    return (
      <div className="cdAssetCard cdAssetCard--empty">
        <strong>{title}</strong>
        <p>尚未选择，请返回对应步骤补齐。</p>
        <Link href={emptyHref}>去补齐</Link>
      </div>
    );
  }

  return (
    <div className="cdAssetCard">
      <img src={asset.imageUrl} alt={title} />
      <strong>{title}</strong>
      <span>{asset.isFallback ? "示例预览" : "已保存"}</span>
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<string | { value: string; label: string }>;
}) {
  return (
    <label>
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => {
          const value = typeof option === "string" ? option : option.value;
          const label = typeof option === "string" ? option : option.label;
          return <option key={value} value={value}>{label}</option>;
        })}
      </select>
    </label>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  wide,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  wide?: boolean;
}) {
  return (
    <label className={wide ? "cdFormGrid__wide" : undefined}>
      {label}
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </label>
  );
}

function PriceRow({ label, value, strong }: { label: string; value: number; strong?: boolean }) {
  return (
    <div className={strong ? "cdPriceRow cdPriceRow--strong" : "cdPriceRow"}>
      <span>{label}</span>
      <b>¥{value.toLocaleString("zh-CN")}</b>
    </div>
  );
}

function buildPriceEstimate({
  orderMode,
  fabricOption,
  quantity,
  targetCount,
}: {
  orderMode: StudioOrderMode;
  fabricOption: StudioFabricOption;
  quantity: number;
  targetCount: number;
}) {
  const itemPrice = BASE_ITEM_PRICE + (fabricOption === "premium" ? PREMIUM_FABRIC_FEE : 0);
  const customServiceFee = CUSTOM_SERVICE_FEE;
  const groupDiscount = orderMode === "group" ? GROUP_DISCOUNT + Math.max(0, targetCount - 3) * 20 : 0;
  const groupPrice = Math.max(899, itemPrice + customServiceFee - groupDiscount);
  const total = orderMode === "group" ? groupPrice * quantity : (itemPrice + customServiceFee) * quantity;
  const depositAmount = DEPOSIT_AMOUNT * quantity;
  return {
    itemPrice: itemPrice * quantity,
    customServiceFee: customServiceFee * quantity,
    depositAmount,
    finalPaymentEstimate: Math.max(0, total - depositAmount),
    groupPrice,
    currency: "CNY" as const,
    productionCycleDays: fabricOption === "premium" ? 18 : 14,
  };
}

function buildCustomOrderDraft(input: {
  orderMode: StudioOrderMode;
  selectedPattern: StudioAsset;
  selectedTryOn: StudioAsset;
  bodyProfile?: StudioBodyProfile;
  selectedTemplate?: StudioGarmentTemplate;
  quantity: number;
  size: string;
  fabricOption: StudioFabricOption;
  neckline: Neckline;
  sleeve: Sleeve;
  length: Length;
  fitPreference: StudioFitPreference;
  note: string;
  targetCount: 3 | 5 | 10;
  receiverName: string;
  receiverPhone: string;
  region: string;
  detail: string;
  isDefaultAddress: boolean;
  priceEstimate: ReturnType<typeof buildPriceEstimate>;
}): StudioCustomOrderDraft {
  const now = new Date().toISOString();
  return {
    orderMode: input.orderMode,
    selectedPatternId: input.selectedPattern.id,
    selectedTryOnId: input.selectedTryOn.id,
    bodyProfileSnapshot: input.bodyProfile,
    garmentTemplateSnapshot: input.selectedTemplate,
    customizationOptions: {
      size: input.size,
      quantity: input.quantity,
      fabricOption: input.fabricOption,
      sleeve: input.sleeve,
      skirtLength: input.length,
      neckline: input.neckline,
      fitPreference: input.fitPreference,
      note: input.note,
    },
    priceEstimate: input.priceEstimate,
    addressDraft: {
      receiverName: input.receiverName,
      phone: input.receiverPhone,
      region: input.region,
      detail: input.detail,
      isDefault: input.isDefaultAddress,
    },
    groupOrder: input.orderMode === "group"
      ? {
          targetCount: input.targetCount,
          currentCount: 1,
          expiresInDays: 7,
          status: "pending",
          failPolicy: "refund_deposit_if_not_filled",
        }
      : undefined,
    publishOption: {
      publishToMarketplace: false,
      commissionRate: 0.1,
    },
    status: "submitted",
    createdAt: now,
    updatedAt: now,
  };
}

function findSelected(assets?: StudioAsset[], selectedId?: string): StudioAsset | undefined {
  if (!assets?.length) return undefined;
  return assets.find((asset) => asset.id === selectedId);
}

function bodyProfileSummary(profile?: StudioBodyProfile): string {
  if (!profile) return "未填写身材比例";
  const parts = [
    profile.heightCm ? `身高 ${profile.heightCm}cm` : "",
    profile.weightKg ? `体重 ${profile.weightKg}kg` : "",
    profile.usualSize ? `常穿 ${profile.usualSize}` : "",
    fitLabel(profile.fitPreference),
  ].filter(Boolean);
  return parts.length ? parts.join(" / ") : "未填写身材比例";
}

function templateSummary(template: StudioGarmentTemplate): string {
  return [
    template.name,
    template.silhouette,
    template.neckline,
    template.sleeve,
    template.skirtLength,
  ].filter(Boolean).join(" / ");
}

function fitLabel(value: StudioBodyProfile["fitPreference"]): string {
  if (value === "slim") return "修身";
  if (value === "relaxed") return "微宽松";
  return "合身";
}
