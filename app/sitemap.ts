import type { MetadataRoute } from "next";
import { readNewsIndex } from "./lib/blogDb";

export const dynamic = "force-dynamic";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://khanhlinhtrans.vn";
  const now = new Date();

  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
  ];

  try {
    const posts = readNewsIndex();
    const publishedPosts = posts.filter((item) => item.status === "published");

    publishedPosts.forEach((post) => {
      const postDate = post.updatedAt || post.publishedAt;
      routes.push({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: postDate ? new Date(postDate) : now,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    });
  } catch (error) {
    console.error("Error generating sitemap for blog posts:", error);
  }

  return routes;
}
