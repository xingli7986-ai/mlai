import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin/", "/my/"],
    },
    sitemap: "https://maxlulu-ai-iota.vercel.app/sitemap.xml",
  };
}
