import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

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
    <html lang="zh-CN" className={`${inter.variable} h-full antialiased`}>
      <body
        className="min-h-full flex flex-col font-sans bg-white text-gray-900"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
