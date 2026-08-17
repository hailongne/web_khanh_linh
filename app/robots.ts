import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/blog", "/blog/*", "/images/*", "/uploads/*"],
      disallow: ["/admin", "/admin/*", "/login", "/api", "/api/*"],
    },
    sitemap: "https://khanhlinhtrans.vn/sitemap.xml",
  };
}

