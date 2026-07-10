"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import ConsumerNav from "@/components/ConsumerNav";
import "./confirm-design.css";

export default function ConfirmDesignPage() {
  const searchParams = useSearchParams();
  const workId = searchParams.get("workId");
  const [mode, setMode] = useState<"single" | "group">("single");
  const [submitted, setSubmitted] = useState(false);

  return (
    <main className="cdPage">
      <ConsumerNav variant="solid" />
      <div className="cdContainer">
        <header className="cdHeader">
          <nav>
            <Link href="/my-studio">我的设计工作室</Link>
            <span>/</span>
            <span>开始定制</span>
          </nav>
          <p>Customization</p>
          <h1>确认你的专属设计</h1>
          <span>确认当前印花、上身效果、尺码和收货信息。本轮不会发起真实支付。</span>
          <div className="cdSteps">
            {["印花创作", "虚拟试穿", "开始定制", "生产资料草案"].map((step, index) => (
              <b key={step} className={index === 2 ? "is-active" : index < 2 ? "is-done" : ""}>
                {index + 1} {step}
              </b>
            ))}
          </div>
        </header>

        {!workId && (
          <div className="cdNotice">
            还没有连接到具体作品。你可以先查看定制确认结构；要保存定制申请，请从工作室创建作品并完成虚拟试穿。
            <Link href="/my-studio">返回我的设计工作室</Link>
          </div>
        )}

        <div className="cdShell">
          <main className="cdMain">
            <section className="cdPanel">
              <h2>当前设计</h2>
              <div className="cdAssetGrid">
                <Asset title="当前印花" image="/assets/my-studio/04_work_thumbnails/maxlulu-my-studio-work-rose-vine-print-1080x1440.png" />
                <Asset title="当前上身效果" image="/assets/my-studio/05_try_on_results/tryon-floral-wrap-front-1080x1440.png" />
              </div>
              <dl className="cdMeta">
                <div><dt>款式 / 版型</dt><dd>连衣裙 / 裹身裙</dd></div>
                <div><dt>身材摘要</dt><dd>身高 165cm / 体重 52kg / 常穿 M / 合身</dd></div>
                <div><dt>尺码</dt><dd>M</dd></div>
                <div><dt>数量</dt><dd>1 件</dd></div>
              </dl>
            </section>

            <section className="cdPanel">
              <h2>定制选配</h2>
              <div className="cdFormGrid">
                <Field label="尺码" options={["XS", "S", "M", "L", "XL", "XXL"]} />
                <label>数量<input type="number" min={1} defaultValue={1} /></label>
                <Field label="面料选项" options={["默认面料", "高级面料"]} />
                <Field label="袖长" options={["短袖", "中袖", "长袖"]} />
                <Field label="裙长" options={["短款", "中长款", "长款"]} />
                <Field label="领型" options={["圆领", "V 领", "方领"]} />
                <Field label="穿着偏好" options={["修身", "合身", "微宽松"]} />
                <label className="cdWide">备注<textarea rows={4} placeholder="例如：希望更适合通勤，整体不要太夸张。" /></label>
              </div>
            </section>

            <section className="cdPanel">
              <h2>收货地址草稿</h2>
              <div className="cdFormGrid">
                <label>收货人<input placeholder="请输入收货人" /></label>
                <label>手机号<input placeholder="请输入手机号" /></label>
                <label>省市区<input placeholder="例如：上海市 静安区" /></label>
                <label className="cdWide">详细地址<input placeholder="街道、门牌号等" /></label>
              </div>
            </section>
          </main>

          <aside className="cdSide">
            <section className="cdPanel">
              <h2>价格预估</h2>
              <Price label="商品定制价" value="¥1,299" />
              <Price label="定制服务费" value="¥199" />
              <Price label="定金" value="¥299" />
              <Price label="拼团价" value="¥1,188" />
              <Price label="预计尾款" value="¥1,199" strong />
              <small>预计制作周期：14-18 天</small>
            </section>

            <section className="cdPanel">
              <h2>选择定制方式</h2>
              <button className={mode === "single" ? "is-selected" : ""} onClick={() => setMode("single")}>
                <strong>个人定制</strong>
                <span>我想自己定制这一件，确认后进入地址和支付。</span>
              </button>
              <button className={mode === "group" ? "is-selected" : ""} onClick={() => setMode("group")}>
                <strong>发起拼团</strong>
                <span>发起 7 天拼团，达到成团人数后开始制作。</span>
              </button>
              {mode === "group" && (
                <div className="cdGroup">
                  <Field label="成团人数" options={["3", "5", "10"]} />
                  <p>7 天内人数未满，拼团失败并退回定金。</p>
                </div>
              )}
              <button className="cdPrimary" onClick={() => setSubmitted(true)}>
                {mode === "group" ? "发起拼团并支付定金" : "确认定制，进入下单"}
              </button>
              {submitted && (
                <div className="cdSuccess">
                  定制申请已提交，后续将进入制作确认。
                  <Link href={workId ? `/my-studio/production-sheet?workId=${workId}` : "/my-studio/production-sheet"}>
                    查看生产资料草案
                  </Link>
                </div>
              )}
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

function Asset({ title, image }: { title: string; image: string }) {
  return (
    <div className="cdAsset">
      <img src={image} alt={title} />
      <strong>{title}</strong>
      <span>已选择</span>
    </div>
  );
}

function Field({ label, options }: { label: string; options: string[] }) {
  return (
    <label>
      {label}
      <select>{options.map((option) => <option key={option}>{option}</option>)}</select>
    </label>
  );
}

function Price({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={strong ? "cdPrice is-strong" : "cdPrice"}>
      <span>{label}</span>
      <b>{value}</b>
    </div>
  );
}
