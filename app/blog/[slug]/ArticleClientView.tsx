"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import BlockRenderer from "../../components/blog/BlockRenderer";
import { BlogBlock } from "../../components/blog/types";

export type ArticleDetail = {
  id: string;
  slug: string;
  title: { vi: string; en: string };
  excerpt: { vi: string; en: string };
  blocks: { vi: BlogBlock[]; en: BlogBlock[] };
  thumbnail: string;
  category: string;
  status: "draft" | "published" | "scheduled";
  featured: boolean;
  viewCount?: number;
  readingTime?: string;
  author?: { name: string; avatar?: string; role?: string };
  publishedAt: string;
  updatedAt: string;
};

export type PostSummary = {
  id: string;
  slug: string;
  title: { vi: string; en: string };
  excerpt?: { vi: string; en: string };
  thumbnail: string;
  category: string;
  featured?: boolean;
  publishedAt: string;
};

type Props = {
  initialArticle: ArticleDetail;
  slug: string;
};

export default function ArticleClientView({ initialArticle, slug }: Props) {
  const [lang] = useState<"vi" | "en">("vi");
  const [article, setArticle] = useState<ArticleDetail>(initialArticle);
  const [relatedPosts, setRelatedPosts] = useState<PostSummary[]>([]);

  const fetchEndArticleRecommendations = useCallback(async (currentSlug: string) => {
    try {
      const res = await fetch(`/api/blog?lang=${lang}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const featuredPosts: PostSummary[] = json.data.filter(
          (item: PostSummary) => item.featured === true && item.slug !== currentSlug
        );
        setRelatedPosts(featuredPosts.slice(0, 6));
      }
    } catch (err) {
      console.error("Error fetching related posts:", err);
    }
  }, [lang]);

  const fetchArticleClient = useCallback(async () => {
    try {
      const res = await fetch(`/api/blog/${slug}`);
      const json = await res.json();
      if (json.success && json.data) {
        setArticle(json.data);
        fetchEndArticleRecommendations(slug);
      }
    } catch (err) {
      console.error("Error updating article view count:", err);
    }
  }, [slug, fetchEndArticleRecommendations]);

  useEffect(() => {
    Promise.resolve().then(fetchArticleClient);
  }, [fetchArticleClient]);

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

  const title = article.title[lang] || article.title.vi || "Untitled";
  const excerpt = article.excerpt[lang] || article.excerpt.vi || "";
  const blocks = article.blocks?.[lang] || article.blocks?.vi || [];
  const authorName = article.author?.name || "Khánh Linh Trans Editorial";
  const dateStr = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString(lang === "vi" ? "vi-VN" : "en-US", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "";

  return (
    <main className="blog-reader-container" style={{ background: "#FFFFFF", minHeight: "100vh" }}>
      <article className="blog-reader-article-wrap">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <Link href={`/blog/category/${article.category ? article.category.toLowerCase().replace(/\s+/g, "-") : "tin-tuc"}`} className="sn-section-badge" style={{ textDecoration: "none" }}>
            {article.category}
          </Link>
          <Link href="/blog" className="blog-reader-back-btn" style={{ marginBottom: 0 }}>
            ← {lang === "vi" ? "Tất cả bài viết" : "All Articles"}
          </Link>
        </div>

        <h1 className="blog-reader-article-title">{title}</h1>

        {excerpt && <p className="blog-reader-article-sapo">{excerpt}</p>}

        <div className="blog-reader-meta-bar">
          <div className="blog-reader-author-info">
            <img
              src={article.author?.avatar || "/images/logoKhanhLinh.png"}
              alt={authorName}
              className="blog-reader-author-avatar"
            />
            <div>
              <span className="blog-reader-author-name">{authorName}</span>
              <span style={{ display: "block", fontSize: "0.75rem", color: "#6B7280" }}>
                {dateStr} • {article.readingTime || "3 phút đọc"}
              </span>
            </div>
          </div>
          <div>
            <span>👁 {article.viewCount || 1} lượt xem</span>
          </div>
        </div>

        {article.thumbnail && (
          <img src={article.thumbnail} alt={title} className="blog-reader-cover-photo" />
        )}

        <div className="blog-reader-body">
          <BlockRenderer blocks={blocks} />
        </div>
      </article>

      {/* NỘI DUNG LIÊN QUAN SECTION (Only featured === true posts, max 6, 3 columns desktop) */}
      {relatedPosts.length > 0 && (
        <div className="blog-reader-article-wrap">
          <section className="related-posts-section">
            <div className="related-posts-header">
              <h3 className="related-posts-title">Nội dung liên quan</h3>
            </div>

            <div className="related-posts-grid">
              {relatedPosts.map((post) => {
                const postTitle = post.title[lang] || post.title.vi || "";
                const postExcerpt = post.excerpt?.[lang] || post.excerpt?.vi || "";
                return (
                  <Link key={`rel-${post.id}`} href={`/blog/${post.slug}`} className="related-post-card">
                    <div className="related-post-thumb-wrap">
                      <img
                        src={post.thumbnail || "/images/news/default.jpg"}
                        alt={postTitle}
                        loading="lazy"
                      />
                    </div>
                    <span className="related-post-cat">{post.category}</span>
                    <h4 className="related-post-title">{postTitle}</h4>
                    {postExcerpt && <p className="related-post-excerpt">{postExcerpt}</p>}
                    <div className="related-post-date">{formatPublishDate(post.publishedAt)}</div>
                  </Link>
                );
              })}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
