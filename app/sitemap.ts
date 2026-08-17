import type { MetadataRoute } from "next";
import { readNewsIndex, readCategories } from "./lib/blogDb";

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
    // 1. Visible Public Categories
    const categories = readCategories();
    const visibleCategories = categories.filter((c) => c.visible !== false);
    const hiddenCategoryNames = new Set(
      categories.filter((c) => c.visible === false).map((c) => c.name)
    );

    visibleCategories.forEach((cat) => {
      routes.push({
        url: `${baseUrl}/blog/category/${cat.slug}`,
        lastModified: cat.updatedAt ? new Date(cat.updatedAt) : now,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    });

    // 2. Published Posts (excluding posts in hidden categories)
    const posts = readNewsIndex();
    const publishedPosts = posts.filter(
      (item) => item.status === "published" && !hiddenCategoryNames.has(item.category)
    );

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
    console.error("Error generating sitemap:", error);
  }

  return routes;
}

