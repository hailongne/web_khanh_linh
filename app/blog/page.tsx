"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

type NewsItem = {
  id: string;
  slug: string;
  title: { vi: string; en: string };
  excerpt: { vi: string; en: string };
  thumbnail: string;
  category: string;
  status: "draft" | "published";
  featured: boolean;
  viewCount?: number;
  readingTime?: string;
  publishedAt: string;
  updatedAt: string;
};

function BlogListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedCategory = searchParams?.get("category") || "all";
  const searchQuery = searchParams?.get("search") || "";

  const [lang] = useState<"vi" | "en">("vi");
  const [posts, setPosts] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination states
  const [showAllFeatured, setShowAllFeatured] = useState(false);
  const [visibleLatestCount, setVisibleLatestCount] = useState(10);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("lang", lang);
      if (selectedCategory !== "all") {
        params.set("category", selectedCategory);
      }
      if (searchQuery.trim()) {
        params.set("search", searchQuery.trim());
      }

      const res = await fetch(`/api/blog?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setPosts(json.data || []);
      }
    } catch (err) {
      console.error("Error fetching blog posts:", err);
    } finally {
      setLoading(false);
    }
  }, [lang, selectedCategory, searchQuery]);

  useEffect(() => {
    Promise.resolve().then(fetchPosts);
  }, [fetchPosts]);

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

  // 1. Featured Posts (ONLY featured === true, preserved order)
  const allFeaturedPosts = posts.filter((p) => p.featured === true);
  const displayedFeaturedPosts = showAllFeatured ? allFeaturedPosts : allFeaturedPosts.slice(0, 9);

  // 2. Latest Posts - Kinh nghiệm du lịch (Sorted by publishedAt descending)
  const latestPosts = [...posts].sort((a, b) => {
    const timeA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const timeB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return timeB - timeA;
  });
  const displayedLatestPosts = latestPosts.slice(0, visibleLatestCount);

  // 3. Popular Posts - Phổ biến nhất (Top 5 viewCount descending, tie breaker: newest date)
  const popularPosts = [...posts]
    .sort((a, b) => {
      const viewA = a.viewCount || 0;
      const viewB = b.viewCount || 0;
      if (viewB !== viewA) return viewB - viewA;
      const timeA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const timeB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return timeB - timeA;
    })
    .slice(0, 5);

  const isFiltered = selectedCategory !== "all" || searchQuery.trim() !== "";
  const filterTitle = searchQuery
    ? `Kết quả tìm kiếm: "${searchQuery}"`
    : selectedCategory !== "all"
    ? selectedCategory
    : "Tất cả bài viết";

  return (
    <main className="sn-portal-container">
      {/* Active Filter Indicator Bar */}
      {isFiltered && (
        <div className="blog-reader-filter-bar" style={{ marginBottom: 24 }}>
          <div className="blog-reader-filter-status">
            <span>
              {searchQuery ? `Tìm kiếm: "${searchQuery}"` : ""}
              {searchQuery && selectedCategory !== "all" ? " • " : ""}
              {selectedCategory !== "all" ? `Chủ đề: ${selectedCategory}` : ""}
            </span>
            <button
              type="button"
              className="blog-reader-clear-filter-btn"
              onClick={() => router.push("/blog")}
            >
              Xóa bộ lọc ✕
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="blog-reader-empty">
          <p>{lang === "vi" ? "Đang tải bài viết..." : "Loading articles..."}</p>
        </div>
      ) : isFiltered ? (
        <div className="sn-portal-body">
          <section className="blog-featured-section" style={{ marginBottom: 48 }}>
            <div className="blog-section-header" style={{ marginBottom: 28 }}>
              <h1 className="blog-section-title-text" style={{ fontSize: "1.6rem" }}>
                {filterTitle}
              </h1>
              <button
                type="button"
                className="blog-action-btn-sm"
                style={{ padding: "6px 16px", fontSize: "0.8rem" }}
                onClick={() => router.push("/blog")}
              >
                ← Tất cả bài viết
              </button>
            </div>

            {posts.length === 0 ? (
              <div className="blog-reader-empty" style={{ padding: "60px 20px", textAlign: "center" }}>
                <p style={{ fontSize: "1.1rem", color: "#64748b", marginBottom: 20 }}>
                  Chưa có bài viết trong danh mục này.
                </p>
                <button
                  type="button"
                  className="blog-action-btn-sm"
                  onClick={() => router.push("/blog")}
                >
                  Xem tất cả bài viết
                </button>
              </div>
            ) : (
              <div className="blog-featured-grid">
                {posts.map((post) => {
                  const postTitle = post.title[lang] || post.title.vi || "";
                  const postExcerpt = post.excerpt?.[lang] || post.excerpt?.vi || "";
                  return (
                    <Link key={`filtered-${post.id}`} href={`/blog/${post.slug}`} className="related-post-card">
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
      ) : posts.length === 0 ? (
        <div className="blog-reader-empty">
          <p>{lang === "vi" ? "Chưa có bài viết nào phù hợp." : "No articles found."}</p>
        </div>
      ) : (
        <div className="sn-portal-body">

          {/* 1. KHU VỰC "NỘI DUNG NỔI BẬT" */}
          {allFeaturedPosts.length > 0 && (
            <section className="blog-featured-section" style={{ marginBottom: 48 }}>
              <div className="blog-section-header">
                <h2 className="blog-section-title-text">Nội dung nổi bật</h2>
              </div>

              <div className="blog-featured-grid">
                {displayedFeaturedPosts.map((post) => {
                  const postTitle = post.title[lang] || post.title.vi || "";
                  const postExcerpt = post.excerpt?.[lang] || post.excerpt?.vi || "";
                  return (
                    <Link key={`feat-${post.id}`} href={`/blog/${post.slug}`} className="related-post-card">
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

              {/* Nút "Xem tất cả" / "Ẩn bớt" khi có nhiều hơn 9 bài nổi bật */}
              {allFeaturedPosts.length > 9 && (
                <div className="blog-view-all-wrap">
                  {!showAllFeatured ? (
                    <button
                      type="button"
                      className="blog-action-btn-sm"
                      onClick={() => setShowAllFeatured(true)}
                    >
                      Xem tất cả ({allFeaturedPosts.length} bài nổi bật)
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="blog-action-btn-sm"
                      onClick={() => setShowAllFeatured(false)}
                    >
                      Ẩn bớt ▲
                    </button>
                  )}
                </div>
              )}
            </section>
          )}

          {/* DUAL LAYOUT: KINH NGHIỆM DU LỊCH (LEFT) + PHỔ BIẾN NHẤT (RIGHT SIDEBAR) */}
          <div className="blog-dual-layout">

            {/* 2. KHU VỰC "KINH NGHIỆM DU LỊCH" (BÀI VIẾT MỚI NHẤT) */}
            <div className="blog-content-left">
              <div className="blog-section-header">
                <h2 className="blog-section-title-text">Kinh nghiệm du lịch</h2>
              </div>

              <div className="travel-exp-list">
                {displayedLatestPosts.map((post) => {
                  const postTitle = post.title[lang] || post.title.vi || "";
                  const postExcerpt = post.excerpt?.[lang] || post.excerpt?.vi || "";
                  return (
                    <Link key={`latest-${post.id}`} href={`/blog/${post.slug}`} className="travel-exp-item">
                      <div className="travel-exp-thumb-wrap">
                        <img
                          src={post.thumbnail || "/images/news/default.jpg"}
                          alt={postTitle}
                          loading="lazy"
                        />
                      </div>
                      <div className="travel-exp-info">
                        <span className="travel-exp-cat">{post.category}</span>
                        <h3 className="travel-exp-title">{postTitle}</h3>
                        {postExcerpt && <p className="travel-exp-excerpt">{postExcerpt}</p>}
                        <div className="travel-exp-date">{formatPublishDate(post.publishedAt)}</div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Nút "Xem thêm" / "Ẩn bớt" cho Kinh nghiệm du lịch */}
              {(visibleLatestCount < latestPosts.length || visibleLatestCount > 10) && (
                <div className="blog-view-all-wrap" style={{ marginTop: 24, textAlign: "left", display: "flex", gap: 12 }}>
                  {visibleLatestCount < latestPosts.length && (
                    <button
                      type="button"
                      className="blog-action-btn-sm"
                      onClick={() => setVisibleLatestCount((prev) => prev + 10)}
                    >
                      Xem thêm kinh nghiệm du lịch...
                    </button>
                  )}
                  {visibleLatestCount > 10 && (
                    <button
                      type="button"
                      className="blog-action-btn-sm"
                      onClick={() => setVisibleLatestCount(10)}
                    >
                      Ẩn bớt ▲
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* 3. KHU VỰC "PHỔ BIẾN NHẤT" (SIDEBAR PHẢI TOP 5 LƯỢT XEM) */}
            <div className="blog-sidebar-right">
              <div className="blog-section-header">
                <h2 className="blog-section-title-text">Phổ biến nhất</h2>
              </div>

              <div className="popular-posts-list">
                {popularPosts.map((post, idx) => {
                  const postTitle = post.title[lang] || post.title.vi || "";
                  return (
                    <Link key={`pop-${post.id}`} href={`/blog/${post.slug}`} className="popular-post-item">
                      <span className={`popular-rank-num popular-rank-top${idx + 1}`}>
                        {idx + 1}
                      </span>
                      <div className="popular-post-info">
                        <h4 className="popular-post-title">{postTitle}</h4>
                        <div className="popular-post-meta">
                          <span>{post.category}</span>
                          <span>•</span>
                          <span>{formatPublishDate(post.publishedAt)}</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

          </div>

        </div>
      )}
    </main>
  );
}

export default function BlogListPage() {
  return (
    <Suspense fallback={
      <div className="blog-reader-empty">
        <p>Đang tải trang blog...</p>
      </div>
    }>
      <BlogListContent />
    </Suspense>
  );
}
