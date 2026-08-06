"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import BlockRenderer from "../../components/blog/BlockRenderer";
import { BlogBlock } from "../../components/blog/types";

type ArticleDetail = {
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

type PostSummary = {
  id: string;
  slug: string;
  title: { vi: string; en: string };
  excerpt?: { vi: string; en: string };
  thumbnail: string;
  category: string;
  viewCount?: number;
  publishedAt: string;
};

export default function ArticleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const [lang] = useState<"vi" | "en">("vi");
  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [latestPosts, setLatestPosts] = useState<PostSummary[]>([]);
  const [trendingPosts, setTrendingPosts] = useState<PostSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [nowMs, setNowMs] = useState<number>(0);

  useEffect(() => {
    Promise.resolve().then(() => setNowMs(Date.now()));
  }, []);

  const fetchEndArticleRecommendations = useCallback(async (currentSlug: string) => {
    try {
      const res = await fetch(`/api/blog?lang=${lang}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const allPosts: PostSummary[] = json.data.filter((item: PostSummary) => item.slug !== currentSlug);

        // 1. Latest Articles (First 3)
        setLatestPosts(allPosts.slice(0, 3));

        // 2. Top Trending Ranked Articles (Sorted by viewCount descending)
        const sortedTrending = [...allPosts].sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
        setTrendingPosts(sortedTrending.slice(0, 3));
      }
    } catch (err) {
      console.error("Error fetching recommendations:", err);
    }
  }, [lang]);

  const fetchArticle = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/blog/${slug}`);
      const json = await res.json();
      if (json.success) {
        setArticle(json.data);
        fetchEndArticleRecommendations(slug);
      } else {
        setError(json.error || "Không thể tải bài viết.");
      }
    } catch (err) {
      console.error("Error fetching article:", err);
      setError("Đã xảy ra lỗi khi kết nối máy chủ.");
    } finally {
      setLoading(false);
    }
  }, [slug, fetchEndArticleRecommendations]);

  useEffect(() => {
    Promise.resolve().then(fetchArticle);
  }, [fetchArticle]);

  function getTimeAgo(dateString?: string) {
    if (!dateString) return "Mới đăng";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "Mới đăng";
    const diffHours = Math.max(1, Math.floor((nowMs - d.getTime()) / (1000 * 60 * 60)));
    if (diffHours < 24) return `${diffHours} giờ trước`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} ngày trước`;
  }

  if (loading) {
    return (
      <main className="blog-reader-container">
        <div className="blog-reader-empty">
          <p>{lang === "vi" ? "Đang tải bài viết..." : "Loading article..."}</p>
        </div>
      </main>
    );
  }

  if (error || !article) {
    return (
      <main className="blog-reader-container">
        <div className="blog-reader-empty">
          <p>{error || (lang === "vi" ? "Bài viết không tồn tại." : "Article not found.")}</p>
          <Link href="/blog" className="blog-reader-back-btn" style={{ marginTop: 20 }}>
            ← {lang === "vi" ? "Quay lại danh sách bài viết" : "Back to all articles"}
          </Link>
        </div>
      </main>
    );
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

  // Structured JSON-LD Schema
  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description: excerpt,
    image: article.thumbnail ? [article.thumbnail] : [],
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    author: [
      {
        "@type": "Person",
        name: authorName,
      },
    ],
    publisher: {
      "@type": "Organization",
      name: "Khánh Linh Trans",
      logo: {
        "@type": "ImageObject",
        url: "https://khanhlinhtrans.vn/images/logoKhanhLinh.png",
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
      />

      {/* Pure White & Clean Book Reading Container */}
      <main className="blog-reader-container" style={{ background: "#FFFFFF", minHeight: "100vh" }}>
        <article className="blog-reader-article-wrap">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <span className="sn-section-badge">{article.category}</span>
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

        {/* END OF ARTICLE RECOMMENDATIONS (BÀI VIẾT MỚI & ĐƯỢC QUAN TÂM NHIỀU) */}
        <div className="blog-reader-article-wrap" style={{ marginTop: 60, paddingTop: 40, borderTop: "2px solid #F1F5F9" }}>

          {/* 1. GỢI Ý BÀI VIẾT MỚI NHẤT */}
          {latestPosts.length > 0 && (
            <section style={{ marginBottom: 48 }}>
              <div className="sn-section-title-wrap">
                <h3 className="sn-section-title" style={{ fontSize: "1.2rem" }}>
                  Bài Viết Mới Nhất
                </h3>
                <Link href="/blog" className="sn-section-arrow">
                  Xem tất cả ›
                </Link>
              </div>

              <div className="sn-latest-grid">
                {latestPosts.map((post) => (
                  <Link key={`lat-${post.id}`} href={`/blog/${post.slug}`} className="sn-latest-card">
                    <div className="sn-latest-thumb-wrap" style={{ height: 140 }}>
                      <img src={post.thumbnail || "/images/news/default.jpg"} alt="" />
                    </div>
                    <div className="sn-latest-info" style={{ padding: 14 }}>
                      <h4 className="sn-latest-title" style={{ fontSize: "0.95rem" }}>
                        {post.title[lang] || post.title.vi}
                      </h4>
                      <div className="sn-portal-meta" style={{ fontSize: "0.78rem" }}>
                        <span>{getTimeAgo(post.publishedAt)}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* 2. GỢI Ý ĐƯỢC QUAN TÂM NHIỀU */}
          {trendingPosts.length > 0 && (
            <section>
              <div className="sn-section-title-wrap">
                <h3 className="sn-section-title" style={{ fontSize: "1.2rem" }}>
                  Được Quan Tâm Nhiều
                </h3>
                <span className="sn-section-badge">HOT</span>
              </div>

              <div className="sn-trending-grid">
                {trendingPosts.map((post, idx) => (
                  <Link key={`tr-${post.id}`} href={`/blog/${post.slug}`} className="sn-trending-card">
                    <div className="sn-source-badge">
                      <img src="/images/logoKhanhLinh.png" alt="" />
                      <span>{post.category}</span>
                    </div>

                    <div className="sn-trending-body">
                      <div className="sn-trending-content">
                        <span className="sn-trending-rank">
                          {idx + 1}
                        </span>
                        <h4 className="sn-trending-title">
                          {post.title[lang] || post.title.vi}
                        </h4>
                      </div>
                      <div className="sn-trending-thumb-wrap">
                        <img src={post.thumbnail || "/images/news/default.jpg"} alt="" className="sn-trending-thumb" />
                      </div>
                    </div>

                    <div className="sn-portal-meta">
                      <span>👁 {post.viewCount || 1} lượt xem</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </>
  );
}
