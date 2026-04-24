import Link from "next/link";
import AssetImage from "@/components/AssetImage";
import { getProductDetail } from "@/lib/product-detail-data";
import "../../product-pages.css";

type Props = {
  params: Promise<{ slug: string }>;
};

function DetailProgress({ joined, target }: { joined: number; target: number }) {
  const progress = Math.min(100, Math.round((joined / target) * 100));
  return (
    <div className="detailProgress">
      <div>
        <span>众定进度</span>
        <strong>
          {joined} / {target} 人
        </strong>
      </div>
      <b>{progress}%</b>
      <i>
        <em style={{ width: `${progress}%` }} />
      </i>
    </div>
  );
}

function TopBar() {
  return (
    <header className="productTopbar">
      <Link className="productBrand" href="/">
        <span>MaxLuLu AI</span>
        <small>PRINTED KNIT DRESS</small>
      </Link>
      <nav>
        <Link href="/">首页</Link>
        <Link href="/products">夏季新品</Link>
        <Link href="/products">正在众定</Link>
      </nav>
    </header>
  );
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const detail = getProductDetail(slug);

  if (!detail) {
    return (
      <main className="productPage productNotFound">
        <TopBar />
        <Link className="productBack" href="/products">
          ← 返回夏季新品
        </Link>
        <h1>没有找到这条连衣裙</h1>
        <p>可以先回到夏季新品列表，查看正在众定的针织印花裙。</p>
      </main>
    );
  }

  const { product } = detail;

  return (
    <main className="productPage detailPage">
      <TopBar />

      <Link className="productBack" href="/products">
        ← 返回夏季新品
      </Link>

      <section className="detailHero">
        <div className="detailGallery">
          <AssetImage
            src={detail.gallery[0]}
            alt={product.name}
            tone={product.tone}
            label={product.name.slice(0, 4)}
            className="detailGallery__main"
          />
          <div className="detailGallery__thumbs">
            {detail.gallery.slice(1).map((src, index) => (
              <AssetImage
                key={src}
                src={src}
                alt={`${product.name}细节图 ${index + 1}`}
                tone={product.tone}
                label={["版型", "印花", "细节"][index]}
                className="detailGallery__thumb"
              />
            ))}
          </div>
        </div>

        <div className="detailInfo">
          <p className="eyebrow">{detail.seriesLabel}</p>
          <h1>{product.name}</h1>
          <p className="detailLead">{detail.heroNote}</p>
          <div className="detailTags">
            {product.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
          <div className="detailPriceRow">
            <strong>{product.price}</strong>
            <span>{product.status}</span>
          </div>
          <DetailProgress joined={product.joined} target={product.target} />
          <div className="detailCtas">
            <a className="btn btnPrimary" href="#checkout-preview">
              参与众定
            </a>
            <a className="btn btnGhost" href="#size-section">
              查看尺码
            </a>
          </div>
          <div className="detailOccasions">
            <span>适合场景</span>
            <div>
              {detail.occasion.map((item) => (
                <b key={item}>{item}</b>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="detailSection detailBenefits">
        <div className="detailSection__title">
          <p className="eyebrow">WEARING BENEFITS</p>
          <h2>上身效果</h2>
        </div>
        <div className="benefitCards">
          {detail.bodyBenefits.map((item) => (
            <article key={item}>
              <span>✦</span>
              <strong>{item}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="detailTwoCol">
        <article className="storyPanel">
          <p className="eyebrow">PRINT STORY</p>
          <h2>印花说明</h2>
          <p>{detail.printStory}</p>
        </article>
        <article className="storyPanel">
          <p className="eyebrow">FABRIC</p>
          <h2>针织面料</h2>
          <p>{detail.fabricStory}</p>
        </article>
      </section>

      <section className="detailTwoCol detailFit">
        <article className="storyPanel">
          <p className="eyebrow">FIT NOTES</p>
          <h2>版型细节</h2>
          <ul>
            {detail.fitNotes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
        <article className="storyPanel">
          <p className="eyebrow">SAFETY V-NECK</p>
          <h2>领口安全建议</h2>
          <ul>
            {detail.safetyNotes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className="detailSection detailSpecs">
        <div className="detailSection__title">
          <p className="eyebrow">PRODUCT SPEC</p>
          <h2>商品信息</h2>
        </div>
        <div className="specGrid">
          {detail.specs.map((item) => (
            <div key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="detailSection sizeSection" id="size-section">
        <div className="detailSection__title">
          <p className="eyebrow">SIZE GUIDE</p>
          <h2>尺码建议</h2>
          <p>以下为首版建议尺码，实际生产前可根据打样微调。单位：cm。</p>
        </div>
        <div className="sizeTableWrap">
          <table className="sizeTable">
            <thead>
              <tr>
                <th>尺码</th>
                <th>衣长</th>
                <th>胸围</th>
                <th>腰围</th>
                <th>肩宽</th>
                <th>袖长</th>
              </tr>
            </thead>
            <tbody>
              {detail.sizes.map((row) => (
                <tr key={row.size}>
                  <td>{row.size}</td>
                  <td>{row.length}</td>
                  <td>{row.bust}</td>
                  <td>{row.waist}</td>
                  <td>{row.shoulder}</td>
                  <td>{row.sleeve}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="detailSection productionTimeline">
        <div className="detailSection__title">
          <p className="eyebrow">GROUP PRODUCTION</p>
          <h2>众定生产流程</h2>
        </div>
        <div className="timelineGrid">
          {detail.timeline.map((item, index) => (
            <article key={item.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{item.title}</strong>
              <p>{item.desc}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
