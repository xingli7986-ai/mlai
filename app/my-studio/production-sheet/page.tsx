import Link from "next/link";
import ConsumerNav from "@/components/ConsumerNav";
import "./production-sheet.css";

export default function ProductionSheetPage() {
  return (
    <main className="psPage">
      <ConsumerNav variant="solid" />
      <div className="psContainer">
        <header className="psHeader">
          <nav>
            <Link href="/my-studio">我的设计工作室</Link>
            <span>/</span>
            <span>生产资料草案</span>
          </nav>
          <p>Production Draft</p>
          <h1>生产资料草案</h1>
          <span>
            这里展示用户确认后的设计资产和定制配置，用于后台审核和后续工厂沟通。没有草案时也会给出清晰入口，不会 404。
          </span>
        </header>

        <section className="psStatus">
          <strong>草案状态：待确认</strong>
          <p>当前页面为草案视图。正式下单、支付、PDF 和工厂接口将在后续阶段接入。</p>
          <div>
            <Link href="/my-studio/confirm-design">返回开始定制</Link>
            <Link href="/my-studio">返回我的设计工作室</Link>
          </div>
        </section>

        <div className="psGrid">
          <section className="psPanel">
            <h2>设计资产</h2>
            <div className="psAssets">
              <Asset title="当前印花" image="/assets/my-studio/04_work_thumbnails/maxlulu-my-studio-work-rose-vine-print-1080x1440.png" />
              <Asset title="当前上身效果" image="/assets/my-studio/05_try_on_results/tryon-floral-wrap-front-1080x1440.png" />
            </div>
          </section>

          <section className="psPanel">
            <h2>服装配置</h2>
            <dl className="psList">
              <div><dt>品类</dt><dd>连衣裙</dd></div>
              <div><dt>版型</dt><dd>裹身裙</dd></div>
              <div><dt>场景</dt><dd>通勤 / 日常</dd></div>
              <div><dt>尺码</dt><dd>M</dd></div>
              <div><dt>数量</dt><dd>1 件</dd></div>
              <div><dt>面料</dt><dd>默认面料（待后台确认）</dd></div>
            </dl>
          </section>

          <section className="psPanel">
            <h2>身材与版型快照</h2>
            <dl className="psList">
              <div><dt>身高 / 体重</dt><dd>165cm / 52kg</dd></div>
              <div><dt>常穿尺码</dt><dd>M</dd></div>
              <div><dt>穿着偏好</dt><dd>合身</dd></div>
              <div><dt>版型结构</dt><dd>V 领 / 腰部系带 / 中长款</dd></div>
            </dl>
          </section>

          <section className="psPanel">
            <h2>工艺字段 TODO</h2>
            <ul className="psTodo">
              <li>面料编号 TODO</li>
              <li>面料成分 TODO</li>
              <li>克重 TODO</li>
              <li>幅宽 TODO</li>
              <li>印花方式 TODO</li>
              <li>色牢度标准 TODO</li>
              <li>工艺备注 TODO</li>
              <li>工厂备注 TODO</li>
            </ul>
          </section>
        </div>
      </div>
    </main>
  );
}

function Asset({ title, image }: { title: string; image: string }) {
  return (
    <article>
      <img src={image} alt={title} />
      <strong>{title}</strong>
      <span>已保存</span>
    </article>
  );
}
