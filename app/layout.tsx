import type { Metadata, Viewport } from "next";
import type { CSSProperties } from "react";
import "./globals.css";
import { Providers } from "./providers";

// Temporary fallback (2026-05-04): next/font/google removed because
// fonts.gstatic.com is not reachable from this dev environment, which made
// `rm -rf .next && next dev` cold-start fail with a 500 on /my-studio.
// The four primitive CSS variables (--font-playfair / --font-inter /
// --font-noto-serif-sc / --font-noto-sans-sc) are mapped to system-font
// stacks so globals.css's --font-serif / --font-sans composition still
// resolves with no downstream CSS changes. Replace with next/font/local
// once real font files land in app/fonts/.
const fontFallbackVars: CSSProperties = {
  "--font-playfair": 'Georgia, "Times New Roman", serif',
  "--font-inter":
    'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  "--font-noto-serif-sc": '"Songti SC", "STSong", "Noto Serif SC", serif',
  "--font-noto-sans-sc":
    '"PingFang SC", "Microsoft YaHei", "Noto Sans SC", ui-sans-serif, system-ui, sans-serif',
} as CSSProperties;

export const metadata: Metadata = {
  title: "MaxLuLu AI - Fashion For You",
  description:
    "MaxLuLu AI - AI印花设计平台，描述你想要的图案，AI为你生成独一无二的印花裙。Fashion For You。",
  keywords: [
    "AI印花设计",
    "定制裙装",
    "AI生成图案",
    "个性化时尚",
    "MaxLuLu",
  ],
  openGraph: {
    title: "MaxLuLu AI - Fashion For You",
    description:
      "MaxLuLu AI - AI印花设计平台，描述你想要的图案，AI为你生成独一无二的印花裙。Fashion For You。",
    siteName: "MaxLuLu AI",
    type: "website",
    locale: "zh_CN",
    images: [
      {
        url: "https://pub-39ccb989bffa4f729bb1ae58876f3b36.r2.dev/designs/og-image.png",
        width: 1200,
        height: 630,
        alt: "MaxLuLu AI - Fashion For You",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MaxLuLu AI - Fashion For You",
    description:
      "MaxLuLu AI - AI印花设计平台，描述你想要的图案，AI为你生成独一无二的印花裙。Fashion For You。",
    images: [
      "https://pub-39ccb989bffa4f729bb1ae58876f3b36.r2.dev/designs/og-image.png",
    ],
  },
  icons: {
    icon: "/icon",
    apple: "/apple-icon",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className="h-full antialiased"
      style={fontFallbackVars}
    >
      <body
        className="min-h-full flex flex-col bg-[#F7F0E9] text-[#0C0C0F]"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
