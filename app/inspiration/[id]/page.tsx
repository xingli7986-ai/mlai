import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import ConsumerNav from "@/components/ConsumerNav";
import { AuthorSignature } from "@/components/ui";
import InspirationActions from "./InspirationActions";
import InspirationComments from "./InspirationComments";
import "./detail.css";

type Props = {
  params: Promise<{ id: string }>;
};

interface Creator {
  id: string;
  name: string;
  avatar: string | null;
  bio: string | null;
  isCertified: boolean;
  type: string;
}

interface WorkDetail {
  id: string;
  title: string;
  description: string | null;
  coverImage: string;
  images: string[];
  toolType: string;
  promptVisibility: "free" | "paid" | "private";
  unlockPrice: number;
  styleTags: string[];
  likeCount: number;
  favoriteCount: number;
  viewCount: number;
  commentCount: number;
  unlockCount: number;
  isListed: boolean;
  listedProductId: string | null;
  createdAt: string;
  creator: Creator;
  isLiked: boolean;
  isFavorited: boolean;
  promptUnlocked: boolean;
  prompt?: string | null;
  params?: unknown;
}
interface SimilarItem {
  id: string;
  title: string;
  coverImage: string;
  likeCount: number;
  creator: { name: string; isCertified: boolean };
}

async function fetchDetail(id: string): Promise<{ work: WorkDetail; similar: SimilarItem[] } | null> {
  const h = await headers();
  const host = h.get("host") || "localhost:3000";
  const proto = h.get("x-forwarded-proto") || "http";
  const cookie = h.get("cookie") || "";
  try {
    const res = await fetch(`${proto}://${host}/api/inspiration/${id}`, {
      headers: cookie ? { cookie } : undefined,
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as { work: WorkDetail; similar: SimilarItem[] };
  } catch {
    return null;
  }
}

const TOOL_LABEL: Record<string, string> = {
  print: "印花生成",
  repeat: "四方连续",
  tryon: "图案上身",
  fitting: "AI 试衣",
};

export default async function InspirationDetailPage({ params }: Props) {
  const { id } = await params;
  const data = await fetchDetail(id);
  if (!data) notFound();

  const { work, similar } = data;
  const toolLabel = TOOL_LABEL[work.toolType] ?? "创作";

  const heroImage = work.coverImage || work.images[0] || "";
  const thumbs = (work.images.length > 0 ? work.images : [heroImage]).slice(0, 4);

  return (
    <main className="page-wrap inspDetailPage">
      <ConsumerNav variant="solid" />

      <div className="container inspCrumbs">
        <Link href="/inspiration">灵感广场</Link>
        <span className="sep">›</span>
        <span className="current">{work.title}</span>
      </div>

      <section className="container inspDetailHero">
        <div className="inspGallery">
          <div className="inspGallery__main">
            {heroImage ? (
              <img src={heroImage} alt={work.title} />
            ) : (
              <div className="inspGallery__placeholder">{work.title.slice(0, 4)}</div>
            )}
          </div>
          <div className="inspGallery__thumbs">
            {Array.from({ length: 4 }).map((_, i) => {
              const src = thumbs[i];
              const active = i === 0;
              return (
                <div key={i} className={`inspGallery__thumb${active ? " is-active" : ""}`}>
                  {src ? (
                    <img src={src} alt={`${work.title} 图${i + 1}`} />
                  ) : (
                    <span style={{ width: "100%", height: "100%", display: "block", background: "var(--color-subtle)" }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <aside className={`inspInfo${work.creator.isCertified ? " is-certified" : ""}`}>
          <div className="inspInfo__topRow">
            <span className="inspInfo__toolBadge">{toolLabel}</span>
            <span className="inspInfo__date">
              {new Date(work.createdAt).toLocaleDateString("zh-CN")}
            </span>
          </div>

          <h1 className="inspInfo__title">{work.title}</h1>
          {work.description && <p className="inspInfo__desc">{work.description}</p>}

          <div className="inspAuthorBlock">
            <AuthorSignature
              name={work.creator.name}
              avatar={work.creator.avatar}
              isCertified={work.creator.isCertified}
              size="md"
              certifiedLabel="全"
            />
            <button type="button" className="inspAuthorBlock__follow">+ 关注</button>
          </div>

          <InspirationActions
            workId={work.id}
            initialLiked={work.isLiked}
            initialFavorited={work.isFavorited}
            initialLikeCount={work.likeCount}
            initialFavoriteCount={work.favoriteCount}
            promptVisibility={work.promptVisibility}
            unlockPrice={work.unlockPrice}
            promptUnlocked={work.promptUnlocked}
            prompt={work.prompt ?? null}
            params={work.params}
          />
        </aside>
      </section>

      {similar.length > 0 && (
        <section className="container inspSimilarSection">
          <h2>相似作品</h2>
          <div className="inspSimilarRow">
            {similar.map((s) => (
              <Link key={s.id} href={`/inspiration/${s.id}`} className="inspSimilarCard">
                <div className="inspSimilarCard__media">
                  {s.coverImage ? (
                    <img src={s.coverImage} alt={s.title} />
                  ) : (
                    <span style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", color: "rgba(255,255,255,0.6)" }}>
                      {s.title.slice(0, 2)}
                    </span>
                  )}
                </div>
                <p className="inspSimilarCard__title">{s.title}</p>
                <span className="inspSimilarCard__author">
                  by {s.creator.name}
                  {s.creator.isCertified && (
                    <span style={{ color: "var(--color-certified-gold)", marginLeft: 4 }}>· 认证</span>
                  )}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <InspirationComments workId={work.id} />
    </main>
  );
}
