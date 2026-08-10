import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { readCategories, readNewsIndex, BlogCategory, NewsIndexItem } from "../../lib/blogDb";

export const metadata: Metadata = {
  title: "Bài viết mới nhất | Khánh Linh Trans Blog",
  description: "Danh sách tất cả bài viết mới nhất từ Khánh Linh Trans Blog.",
  alternates: {
    canonical: "/blog/latest",
  },
};

function formatPublishDate(dateString?: string) {
  if (!dateString) return "";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "";
  const day = d.getDate();
  const month = d.getMonth() + 1;
  const monthStr = month < 10 ? `0${month}` : `${month}`;
  const year = d.getFullYear();
  return `${day}/Th${monthStr}/${year}`;
}

export default async function LatestPostsPage() {
  const categories = readCategories();
  const hiddenCategoryNames = new Set(
    categories.filter((c: BlogCategory) => c.visible === false).map((c: BlogCategory) => c.name)
  );

  // Filter published posts, excluding hidden categories
  const allPosts = readNewsIndex();
  const posts = allPosts.filter(
    (item: NewsIndexItem) => item.status === "published" && !hiddenCategoryNames.has(item.category)
  );

  // Sort by publishedAt descending
  posts.sort((a: NewsIndexItem, b: NewsIndexItem) => {
    const timeA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const timeB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return timeB - timeA;
  });

  return (
    <main className="sn-portal-container">
      <div className="sn-portal-body">
        <section className="blog-featured-section" style={{ marginBottom: 48 }}>
          <div className="blog-section-header" style={{ marginBottom: 28 }}>
            <h1 className="blog-section-title-text" style={{ fontSize: "1.6rem" }}>
              Bài viết mới nhất
            </h1>
            <Link href="/blog" className="blog-action-btn-sm" style={{ padding: "6px 16px", fontSize: "0.8rem" }}>
              ← Tất cả bài viết
            </Link>
          </div>

          {posts.length === 0 ? (
            <div className="blog-reader-empty" style={{ padding: "60px 20px", textAlign: "center" }}>
              <p style={{ fontSize: "1.1rem", color: "#64748b", marginBottom: 20 }}>
                Chưa có bài viết nào.
              </p>
              <Link href="/blog" className="blog-action-btn-sm">
                Về trang Blog
              </Link>
            </div>
          ) : (
            <div className="blog-featured-grid">
              {posts.map((post: NewsIndexItem) => {
                const postTitle = post.title.vi || "Untitled";
                const postExcerpt = post.excerpt?.vi || "";
                return (
                  <Link key={`lat-${post.id}`} href={`/blog/${post.slug}`} className="related-post-card">
                    <div className="related-post-thumb-wrap">
                      <img
                        src={post.thumbnail || "/images/news/default.jpg"}
                        alt={postTitle}
                        loading="lazy"
                      />
                    </div>
                    <span className="related-post-cat">{post.category}</span>
                    <h3 className="related-post-title">{postTitle}</h3>
                    {postExcerpt && <p className="related-post-excerpt">{postExcerpt}</p>}
                    <div className="related-post-date">{formatPublishDate(post.publishedAt)}</div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
