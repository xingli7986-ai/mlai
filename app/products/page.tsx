"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useMemo } from "react";
import AssetImage from "@/components/AssetImage";
import {
  getProductsBySeries,
  productFilters,
  type ProductFilter,
} from "@/lib/product-detail-data";
import "../product-pages.css";

function resolveFilter(raw: string | null): ProductFilter["id"] {
  return productFilters.some((f) => f.id === raw)
    ? (raw as ProductFilter["id"])
    : "all";
}

function CollectionBody() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const active = resolveFilter(searchParams.get("filter"));
  const items = useMemo(() => getProductsBySeries(active), [active]);

  function setFilter(id: ProductFilter["id"]) {
    const query = id === "all" ? "" : `?filter=${id}`;
    router.replace(`/products${query}`, { scroll: false });
  }

  return (
    <main className="productPage collectionPage">
      <header className="productTopbar">
        <Link className="productBrand" href="/">
          <span>MaxLuLu AI</span>
          <small>PRINTED KNIT DRESS</small>
        </Link>
        <nav>
          <Link href="/">首页</Link>
          <Link href="/products">夏季新品</Link>
          <Link href="/products?filter=classic">经典裹身</Link>
        </nav>
      </header>

      <section className="collectionHero">
        <p className="eyebrow">SUMMER COLLECTION</p>
        <h1>夏季针织印花连衣裙</h1>
        <p>
          以柔软针织、标志性印花与高腰剪裁，为 30+
          都市女性提供通勤、约会、旅行与聚会都能穿的夏季连衣裙。
        </p>
      </section>

      <section className="filterRail" aria-label="产品系列筛选">
        {productFilters.map((filter) => (
          <button
            key={filter.id}
            type="button"
            className={active === filter.id ? "is-active" : ""}
            onClick={() => setFilter(filter.id)}
          >
            <strong>{filter.label}</strong>
            <span>{filter.desc}</span>
          </button>
        ))}
      </section>

      <section className="collectionGrid">
        {items.map(({ product, seriesLabel }, index) => {
          const progress = Math.min(
            100,
            Math.round((product.joined / product.target) * 100)
          );
          return (
            <Link
              className="collectionCard"
              href={`/products/${product.id}`}
              key={product.id}
            >
              <div className="collectionCard__media">
                <AssetImage
                  src={product.image}
                  alt={product.name}
                  tone={product.tone}
                  label={product.name.slice(0, 4)}
                  className="collectionCard__image"
                />
                <span className="collectionCard__series">{seriesLabel}</span>
              </div>
              <div className="collectionCard__body">
                <div className="collectionCard__index">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <h2>{product.name}</h2>
                <p>{product.subtitle}</p>
                <div className="collectionCard__tags">
                  {product.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
                <div className="collectionCard__meta">
                  <strong>{product.price}</strong>
                  <span>{product.delivery}</span>
                </div>
                <div className="collectionProgress">
                  <span>
                    {product.joined} / {product.target} 人已参与
                  </span>
                  <b>{progress}%</b>
                  <i>
                    <em style={{ width: `${progress}%` }} />
                  </i>
                </div>
              </div>
            </Link>
          );
        })}
      </section>
    </main>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<main className="productPage" />}>
      <CollectionBody />
    </Suspense>
  );
}
