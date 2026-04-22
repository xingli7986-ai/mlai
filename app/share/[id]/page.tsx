import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

async function loadDesign(id: string) {
  try {
    return await prisma.design.findUnique({
      where: { id },
      select: {
        id: true,
        prompt: true,
        images: true,
        selectedImage: true,
        createdAt: true,
      },
    });
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const design = await loadDesign(id);
  if (!design) {
    return {
      title: "设计不存在 · MaxLuLu AI",
    };
  }
  const excerpt =
    design.prompt.length > 28
      ? `${design.prompt.slice(0, 28)}...`
      : design.prompt;
  const title = `${excerpt} · MaxLuLu AI`;
  const description = `${design.prompt}。来自 MaxLuLu AI 用户分享的 AI 印花设计，Fashion For You。`;
  const ogImage = design.selectedImage || design.images[0] || "";
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: "MaxLuLu AI",
      type: "article",
      locale: "zh_CN",
      images: ogImage
        ? [{ url: ogImage, width: 512, height: 512, alt: excerpt }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

function formatDate(iso: Date | string) {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default async function SharePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const design = await loadDesign(id);
  if (!design) notFound();

  const images = design.images.filter(
    (u): u is string => typeof u === "string" && u.length > 0
  );
  const selectedIdx = design.selectedImage
    ? images.indexOf(design.selectedImage)
    : -1;

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-black/5 bg-white/80 px-4 py-3 backdrop-blur sm:px-6 sm:py-4">
        <Link href="/" className="flex items-center gap-1.5 sm:gap-2">
          <span className="h-7 w-7 rounded-xl bg-gradient-to-br from-[#FF6B9D] to-[#C084FC] sm:h-8 sm:w-8" />
          <span className="text-base font-semibold tracking-tight sm:text-lg">
            MaxLuLu <span className="text-[#C084FC]">AI</span>
          </span>
        </Link>
        <Link
          href="/design"
          className="rounded-full bg-gradient-to-r from-[#FF6B9D] to-[#C084FC] px-4 py-1.5 text-sm font-medium text-white shadow-md shadow-[#C084FC]/30 transition hover:opacity-95 sm:px-5 sm:py-2"
        >
          开始设计
        </Link>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-8 sm:px-6 sm:py-12">
        <section className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#FF6B9D]/10 to-[#C084FC]/10 px-4 py-1.5 text-xs font-medium text-[#C084FC]">
            ✨ 分享设计
          </span>
          <h1 className="mt-4 bg-gradient-to-r from-[#FF6B9D] to-[#C084FC] bg-clip-text text-2xl font-bold tracking-tight text-transparent sm:text-3xl">
            AI 印花作品
          </h1>
          <p className="mt-3 text-xs text-gray-400 sm:text-sm">
            创建于 {formatDate(design.createdAt)}
          </p>
        </section>

        {images.length > 0 && (
          <section className="mt-10">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
              {images.map((url, i) => {
                const picked = i === selectedIdx;
                return (
                  <div
                    key={url}
                    className={`relative aspect-[3/4] overflow-hidden rounded-2xl ring-2 transition ${
                      picked
                        ? "ring-[#C084FC] shadow-lg shadow-[#C084FC]/30"
                        : "ring-transparent"
                    }`}
                  >
                    <Image
                      src={url}
                      alt={`方案 ${i + 1}`}
                      fill
                      sizes="(min-width: 640px) 200px, 45vw"
                      className="object-cover"
                    />
                    {picked && (
                      <div className="absolute right-2 top-2 rounded-full bg-gradient-to-br from-[#FF6B9D] to-[#C084FC] px-2 py-0.5 text-[10px] font-medium text-white shadow">
                        已选
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <section className="mt-10">
          <h2 className="mb-3 text-sm font-semibold tracking-wide text-gray-700">
            印花描述
          </h2>
          <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-[#FF6B9D]/5 to-[#C084FC]/5 p-5 text-sm leading-relaxed text-gray-700 sm:text-[15px]">
            {design.prompt || "—"}
          </div>
        </section>

        <section className="mt-14 text-center">
          <h2 className="bg-gradient-to-r from-[#FF6B9D] to-[#C084FC] bg-clip-text text-xl font-semibold text-transparent sm:text-2xl">
            喜欢这种风格？
          </h2>
          <p className="mt-2 text-xs text-gray-500 sm:text-sm">
            描述你的想法，让 AI 为你生成独一无二的印花
          </p>
          <Link
            href="/design"
            className="mt-6 inline-block rounded-full bg-gradient-to-r from-[#FF6B9D] to-[#C084FC] px-8 py-3.5 text-base font-semibold text-white shadow-xl shadow-[#C084FC]/40 transition hover:-translate-y-0.5 hover:opacity-95"
          >
            我也要设计 →
          </Link>
        </section>
      </main>

      <footer className="py-10 text-center">
        <p className="bg-gradient-to-r from-[#FF6B9D] to-[#C084FC] bg-clip-text text-sm font-medium text-transparent">
          Fashion For You — 每一朵印花，都由你绽放
        </p>
      </footer>
    </div>
  );
}
