import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://khanhlinhtrans.vn",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0
    }
  ];
}

