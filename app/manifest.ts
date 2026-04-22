import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MaxLuLu AI - Fashion For You",
    short_name: "MaxLuLu AI",
    description: "AI印花设计×用户共创×私人定制平台",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#C084FC",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
