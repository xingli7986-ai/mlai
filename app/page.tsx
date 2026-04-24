import Link from "next/link";
import AssetImage from "@/components/AssetImage";
import {
  brandStoryImages,
  consumerSteps,
  hero,
  knitBenefits,
  navItems,
  printStyles,
  products,
  qualityItems,
  scenes,
  stats,
  type HomeProduct,
} from "@/lib/home-consumer-data";
import "./home-consumer.css";

function IconMark({
  type,
}: {
  type: "dress" | "group" | "factory" | "quality" | "delivery" | "spark";
}) {
  const icons = {
    dress: (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M18 8h12l4 6-7 6 8 23H13l8-23-7-6 4-6Z" />
        <path d="M20 9c1.6 3 6.4 3 8 0M21 20h10M18 31h16" />
      </svg>
    ),
    group: (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M16 22a7 7 0 1 0 0-14 7 7 0 0 0 0 14ZM32 22a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z" />
        <path d="M7 39c1.8-8 7.1-12 13-12 2 0 3.8.4 5.3 1.2M24 39c1.8-8 7.1-12 13-12 2.4 0 4.6.6 6.4 1.8" />
      </svg>
    ),
    factory: (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M7 38h34V18l-10 6v-6l-10 6v-9H7v23Z" />
        <path d="M12 15V8h6v7M13 30h5M23 30h5M33 30h5" />
      </svg>
    ),
    quality: (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M24 6 39 12v10c0 10-6 17-15 22C15 39 9 32 9 22V12l15-6Z" />
        <path d="m17 24 5 5 10-12" />
      </svg>
    ),
    delivery: (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M6 15h25v22H6V15Zm31 8h5l4 7v7h-9V23Z" />
        <path d="M14 40a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM38 40a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
      </svg>
    ),
    spark: (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M24 5c3 9 6 12 15 15-9 3-12 6-15 15-3-9-6-12-15-15 9-3 12-6 15-15Z" />
        <path d="M38 4c1 4 3 6 7 7-4 1-6 3-7 7-1-4-3-6-7-7 4-1 6-3 7-7ZM11 33c1 3 2 4 5 5-3 1-4 2-5 5-1-3-2-4-5-5 3-1 4-2 5-5Z" />
      </svg>
    ),
  } as const;

  return <span className="iconMark">{icons[type]}</span>;
}

function ProductCard({
  product,
  index,
}: {
  product: HomeProduct;
  index: number;
}) {
  const progress = Math.min(
    100,
    Math.round((product.joined / product.target) * 100)
  );

  return (
    <Link href={`/products/${product.id}`} className="productCard">
      <div className="productCard__media">
        <AssetImage
          src={product.image}
          alt={product.name}
          tone={product.tone}
          label={product.name.slice(0, 4)}
          className="productCard__image"
        />
        <div className="productCard__badges">
          <span>{product.status}</span>
          <span>{product.tags[0]}</span>
        </div>
        <span className="productCard__number">0{index + 1}</span>
      </div>
      <div className="productCard__body">
        <h3>{product.name}</h3>
        <p>{product.subtitle}</p>
        <div className="productCard__tags">
          {product.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
        <div className="productCard__meta">
          <strong>{product.price}</strong>
          <span>{product.delivery}</span>
        </div>
        <div
          className="groupLine"
          aria-label={`${product.joined} / ${product.target} 人已参与`}
        >
          <div className="groupLine__top">
            <span>
              {product.joined} / {product.target} 人已参与
            </span>
            <b>{progress}%</b>
          </div>
          <div className="groupLine__track">
            <i style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function HomeConsumer() {
  const featured = products.slice(0, 8);
  const moreProducts = products.slice(8, 18);

  return (
    <main className="maxluluHome" id="home">
      <div className="topRibbon">
        <span>✦ 15年印花连衣裙经验</span>
        <span>针织印花 · 高腰剪裁</span>
        <span>上海原创 · 小批量众定</span>
        <span>舒适 · 优雅 · 知性</span>
      </div>

      <header className="siteHeader">
        <a className="brand" href="#home" aria-label="MaxLuLu AI 首页">
          <span>MaxLuLu AI</span>
          <small>FASHION FOR YOU</small>
        </a>
        <nav className="siteNav" aria-label="主导航">
          {navItems.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
        <div className="headerActions">
          <button className="searchBtn" aria-label="搜索" type="button">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="m21 21-4.8-4.8M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14Z" />
            </svg>
          </button>
          <a className="partnerBtn" href="#partner">
            设计师合作
          </a>
        </div>
      </header>

      <section className="heroSection">
        <div className="heroSection__copy">
          <p className="eyebrow">{hero.eyebrow}</p>
          <h1>{hero.title}</h1>
          <p className="heroText">{hero.subtitle}</p>
          <div className="heroCtas">
            <a className="btn btnPrimary" href="#new-arrivals">
              {hero.primaryCta}
            </a>
            <a className="btn btnGhost" href="#group-buy">
              {hero.secondaryCta}
            </a>
          </div>
          <div className="heroStats">
            {stats.map((item) => (
              <div key={item.label}>
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="heroSection__visual">
          <div className="heroFrame">
            <AssetImage
              src={hero.image}
              alt="夏季针织印花裹身裙主视觉"
              className="heroImage"
              label="Summer Dress"
              tone="ink"
            />
            <div className="heroCard">
              <b>MaxLuLu</b>
              <span>SINCE 2009</span>
              <span>PRINTED KNIT DRESS</span>
              <span>SHANGHAI ORIGINAL</span>
            </div>
          </div>
        </div>
      </section>

      <section className="consumerFlow" aria-label="购买流程">
        {consumerSteps.map((step, index) => (
          <div className="flowItem" key={step.title}>
            <span className="flowItem__circle">{step.index}</span>
            <div>
              <strong>{step.title}</strong>
              <p>{step.desc}</p>
            </div>
            {index < consumerSteps.length - 1 && (
              <i className="flowArrow">→</i>
            )}
          </div>
        ))}
      </section>

      <section className="sectionBlock featuredBlock" id="new-arrivals">
        <div className="sectionTitleRow">
          <div>
            <p className="eyebrow">FEATURED DESIGNS</p>
            <h2>夏季新品 / 正在众定的针织印花裙</h2>
          </div>
          <a href="#group-buy" className="linkPill">
            查看全部设计 →
          </a>
        </div>
        <div className="productGrid productGrid--featured">
          {featured.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </section>

      <section className="sectionBlock scenesBlock" id="scenes">
        <div className="sectionIntro">
          <p className="eyebrow">OCCASION</p>
          <h2>按场景选裙</h2>
          <p>
            通勤、约会、晚餐与旅行，不同夏日场景都有一条舒服显腰的针织印花裙。
          </p>
        </div>
        <div className="sceneGrid">
          {scenes.map((scene) => (
            <article className="sceneCard" key={scene.title}>
              <AssetImage
                src={scene.image}
                alt={`${scene.title}场景针织印花裙`}
                tone={scene.tone}
                label={scene.title}
                className="sceneCard__image"
              />
              <div className="sceneCard__content">
                <h3>{scene.title}</h3>
                <p>{scene.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="sectionBlock printsBlock" id="prints">
        <div className="sectionTitleRow">
          <div>
            <p className="eyebrow">PRINT STORIES</p>
            <h2>按印花选风格</h2>
          </div>
          <p className="sectionSideText">
            标志性印花是 MaxLuLu 的品牌识别：远看有气质，近看有细节。
          </p>
        </div>
        <div className="printGrid">
          {printStyles.map((style) => (
            <article className="printCard" key={style.name}>
              <AssetImage
                src={style.image}
                alt={style.name}
                tone={style.tone}
                label={style.name}
                className="printCard__image"
              />
              <div>
                <h3>{style.name}</h3>
                <p>{style.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="sectionBlock knitBlock">
        <div className="knitBlock__visual">
          <div className="fabricOrb fabricOrb--one" />
          <div className="fabricOrb fabricOrb--two" />
          <div className="dressSketch" aria-hidden="true">
            <svg viewBox="0 0 260 360">
              <path d="M95 20h70l24 38-45 35 57 260H59l57-260-45-35 24-38Z" />
              <path d="M106 24c12 20 48 20 60 0M118 93l55 0M99 164c32 20 58 17 91 0M88 235c45 26 83 24 126 0" />
            </svg>
          </div>
        </div>
        <div className="knitBlock__copy">
          <p className="eyebrow">WHY PRINTED KNIT</p>
          <h2>为什么选择针织印花</h2>
          <p>
            夏季连衣裙不只要好看，也要坐下舒服、走路自在、上身有线条。针织印花让版型和印花同时服务身体。
          </p>
          <div className="benefitList">
            {knitBenefits.map((item) => (
              <div className="benefitItem" key={item.title}>
                <IconMark type="spark" />
                <div>
                  <strong>{item.title}</strong>
                  <span>{item.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sectionBlock groupBuyBlock" id="group-buy">
        <div className="sectionIntro sectionIntro--center">
          <p className="eyebrow">GROUP BUY</p>
          <h2>喜欢就参与，满员即生产</h2>
          <p>小批量制作，减少库存，也让你以更好的价格买到原创印花裙。</p>
        </div>
        <div className="productGrid productGrid--compact">
          {moreProducts.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              index={index + featured.length}
            />
          ))}
        </div>
      </section>

      <section className="sectionBlock qualityBlock">
        <div className="qualityBlock__copy">
          <p className="eyebrow">QUALITY & DELIVERY</p>
          <h2>好面料、好版型、安心交付</h2>
          <p>
            把原来的工艺单、打样、工厂对接逻辑，转化为消费者能理解的品质保障。
          </p>
          <a href="#new-arrivals" className="btn btnPrimary">
            查看正在众定
          </a>
        </div>
        <div className="qualityGrid">
          {qualityItems.map((item, index) => {
            const iconType = (
              ["dress", "group", "factory", "quality"] as const
            )[index];
            return (
              <article className="qualityCard" key={item.title}>
                <IconMark type={iconType} />
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="brandStory" id="brand-story">
        <div className="brandStory__content">
          <p className="eyebrow">BRAND STORY</p>
          <h2>巴黎灵感，上海原创</h2>
          <p>
            MaxLuLu
            从印花连衣裙出发，以舒适、优雅、知性的品牌气质服务成熟自信的都市女性。这个夏天，我们把经典印花与针织版型重新组织成更适合日常穿着的夏季系列。
          </p>
          <div className="brandChips">
            <span>Since 2009</span>
            <span>Printed Knit Dress</span>
            <span>Shanghai Original</span>
          </div>
        </div>
        <div className="brandStory__gallery">
          {brandStoryImages.map((src, index) => (
            <AssetImage
              key={src}
              src={src}
              alt={`MaxLuLu 品牌故事素材 ${index + 1}`}
              tone={index === 0 ? "coffee" : index === 1 ? "ink" : "rose"}
              label={
                index === 0 ? "Atelier" : index === 1 ? "Fabric" : "Design"
              }
              className="brandStory__image"
            />
          ))}
        </div>
      </section>

      <section className="partnerSection" id="partner">
        <div>
          <p className="eyebrow">CO-CREATION</p>
          <h2>设计师与 OPC 合作入口</h2>
          <p>
            前台首页以消费者选购为主，设计师共创、AI Studio 与工厂生产能力放在底部，作为供给侧合作入口。
          </p>
        </div>
        <a className="btn btnGhost" href="/studio">
          进入 AI Studio
        </a>
      </section>

      <footer className="siteFooter">
        <div className="footerBrand">
          <strong>MaxLuLu AI</strong>
          <span>Fashion For You</span>
          <p>夏季针织印花连衣裙 · 众定生产 · 上海原创</p>
        </div>
        <div className="footerLinks">
          <a href="#new-arrivals">夏季新品</a>
          <a href="#group-buy">正在众定</a>
          <a href="#prints">印花风格</a>
          <a href="#brand-story">品牌故事</a>
        </div>
      </footer>
    </main>
  );
}
