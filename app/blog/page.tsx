"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

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

export default function BlogListPage() {
  const [lang] = useState<"vi" | "en">("vi");
  const [posts, setPosts] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [nowMs, setNowMs] = useState<number>(0);

  useEffect(() => {
    Promise.resolve().then(() => setNowMs(Date.now()));
  }, []);

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

  const categories = ["all", ...Array.from(new Set(posts.map((p) => p.category).filter(Boolean)))];

  function getTimeAgo(dateString?: string) {
    if (!dateString) return "Mới đăng";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "Mới đăng";
    const diffHours = Math.max(1, Math.floor((nowMs - d.getTime()) / (1000 * 60 * 60)));
    if (diffHours < 24) return `${diffHours} giờ trước`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} ngày trước`;
  }

  const [showMoreTrending, setShowMoreTrending] = useState(false);

  // Data Partitioning for Samsung News Layout Architecture
  const featuredPosts = posts.filter((p) => p.featured).slice(0, 5);
  const recommendedPosts = posts.slice(0, 4);
  const trendingList = [...posts].sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
  const trendingPosts = showMoreTrending ? trendingList : trendingList.slice(0, 5);
  const latestPosts = posts.slice(0, 6);

  // Group by category for per-category feeds
  const postsByCategory: Record<string, NewsItem[]> = {};
  posts.forEach((p) => {
    const cat = p.category || "Khác";
    if (!postsByCategory[cat]) postsByCategory[cat] = [];
    postsByCategory[cat].push(p);
  });

  return (
    <main className="sn-portal-container">
      {/* Category Pills & Search Filter Bar */}
      <div className="blog-reader-filter-bar">
        <div className="blog-reader-categories">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`blog-reader-cat-pill ${selectedCategory === cat ? "blog-reader-cat-pill--active" : ""}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat === "all" ? (lang === "vi" ? "Tất cả" : "All") : cat}
            </button>
          ))}
        </div>

        <div className="blog-reader-search">
          <svg
            className="blog-reader-search-icon"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            className="blog-reader-search-input"
            placeholder={lang === "vi" ? "Tìm kiếm bài viết..." : "Search articles..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="blog-reader-empty">
          <p>{lang === "vi" ? "Đang tải bài viết..." : "Loading articles..."}</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="blog-reader-empty">
          <p>{lang === "vi" ? "Chưa có bài viết nào phù hợp." : "No articles found."}</p>
        </div>
      ) : (
        <div className="sn-portal-body">
          {/* BÀI VIẾT NỔI BẬT (FEATURED POSTS SECTION) */}
          {featuredPosts.length > 0 && (
            <section className="sn-featured-section" style={{ marginBottom: 36 }}>
              <div className="sn-section-title-wrap">
                <h2 className="sn-section-title">Bài viết nổi bật</h2>
                <span className="sn-section-badge">FEATURED</span>
              </div>

              <div className="sn-trending-grid">
                {featuredPosts.map((post) => (
                  <Link key={`feat-${post.id}`} href={`/blog/${post.slug}`} className="sn-trending-card">
                    <div className="sn-source-badge">
                      <img src="/images/logoKhanhLinh.png" alt="" />
                      <span>{post.category}</span>
                    </div>

                    <div className="sn-trending-body">
                      <div className="sn-trending-content">
                        <h3 className="sn-trending-title">
                          {post.title[lang] || post.title.vi}
                        </h3>
                      </div>

                      <div className="sn-trending-thumb-wrap">
                        <img
                          src={post.thumbnail || "/images/news/default.jpg"}
                          alt=""
                          className="sn-trending-thumb"
                        />
                      </div>
                    </div>

                    <div className="sn-portal-meta">
                      <span>👁 {post.viewCount || 1} lượt xem</span>
                      <span>•</span>
                      <span>{getTimeAgo(post.publishedAt)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* 1. DÀNH CHO BẠN (RECOMMENDED) */}
          <section className="sn-recommended-section">
            <div className="sn-section-title-wrap">
              <h2 className="sn-section-title">Dành Cho Bạn</h2>
              <span className="sn-section-arrow">Xem thêm ›</span>
            </div>

            <div className="sn-recommended-grid">
              {recommendedPosts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`} className="sn-recommended-card">
                  {/* Source Badge */}
                  <div className="sn-source-badge">
                    <img src="/images/logoKhanhLinh.png" alt="" />
                    <span>{post.category}</span>
                  </div>

                  {/* Main Content Body */}
                  <div className="sn-recommended-body">
                    <div className="sn-recommended-content">
                      <h3 className="sn-recommended-title">
                        {post.title[lang] || post.title.vi}
                      </h3>
                    </div>

                    <div className="sn-recommended-thumb-wrap">
                      <img
                        src={post.thumbnail || "/images/news/default.jpg"}
                        alt=""
                        className="sn-recommended-thumb"
                      />
                    </div>
                  </div>

                  {/* Footer Meta Row */}
                  <div className="sn-portal-meta">
                    <span>👁 {post.viewCount || 1} lượt xem</span>
                    <span>•</span>
                    <span>{getTimeAgo(post.publishedAt)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* 3. ĐƯỢC QUAN TÂM (RANKED 1, 2, 3, 4 - EXACT MATCH WITH IMAGE 3 LAYOUT) */}
          <section className="sn-trending-section">
            <div className="sn-section-title-wrap">
              <h2 className="sn-section-title">Được Quan Tâm</h2>
              <span className="sn-section-badge">TOP TRENDING</span>
            </div>

            <div className="sn-trending-grid">
              {trendingPosts.map((post, idx) => (
                <Link key={`tr-${post.id}`} href={`/blog/${post.slug}`} className="sn-trending-card">
                  {/* Source Badge */}
                  <div className="sn-source-badge">
                    <img src="/images/logoKhanhLinh.png" alt="" />
                    <span>{post.category}</span>
                  </div>

                  {/* Main Content Body */}
                  <div className="sn-trending-body">
                    <div className="sn-trending-content">
                      <span className="sn-trending-rank">{idx + 1}</span>
                      <h3 className="sn-trending-title">
                        {post.title[lang] || post.title.vi}
                      </h3>
                    </div>

                    <div className="sn-trending-thumb-wrap">
                      <img
                        src={post.thumbnail || "/images/news/default.jpg"}
                        alt=""
                        className="sn-trending-thumb"
                      />
                    </div>
                  </div>

                  {/* Footer Meta Row */}
                  <div className="sn-portal-meta">
                    <span>👁 {post.viewCount || 1} lượt xem</span>
                    <span>•</span>
                    <span>{getTimeAgo(post.publishedAt)}</span>
                  </div>
                </Link>
              ))}
            </div>

            {trendingList.length > 5 && (
              <div style={{ textAlign: "center", marginTop: 16 }}>
                <button
                  type="button"
                  className="sn-section-arrow"
                  style={{
                    background: "#F3F4F6",
                    border: "1px solid #E5E7EB",
                    padding: "6px 20px",
                    borderRadius: 99,
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    color: "#0E5CAB",
                    cursor: "pointer",
                  }}
                  onClick={() => setShowMoreTrending(!showMoreTrending)}
                >
                  {showMoreTrending
                    ? (lang === "vi" ? "Thu gọn ▴" : "Show less ▴")
                    : (lang === "vi" ? "Xem thêm ›" : "Show more ›")}
                </button>
              </div>
            )}
          </section>

          {/* 4. MỚI ĐĂNG (LATEST ARTICLES GRID) */}
          <section className="sn-latest-section">
            <div className="sn-section-title-wrap">
              <h2 className="sn-section-title">Mới Đăng</h2>
            </div>

            <div className="sn-latest-grid">
              {latestPosts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`} className="sn-latest-card">
                  {/* Source Badge */}
                  <div className="sn-source-badge">
                    <img src="/images/logoKhanhLinh.png" alt="" />
                    <span>{post.category}</span>
                  </div>

                  {/* Main Content Body */}
                  <div className="sn-latest-body">
                    <div className="sn-latest-content">
                      <h3 className="sn-latest-title">
                        {post.title[lang] || post.title.vi}
                      </h3>
                    </div>

                    <div className="sn-latest-thumb-wrap">
                      <img
                        src={post.thumbnail || "/images/news/default.jpg"}
                        alt=""
                        className="sn-latest-thumb"
                      />
                    </div>
                  </div>

                  {/* Footer Meta Row */}
                  <div className="sn-portal-meta">
                    <span>👁 {post.viewCount || 1} lượt xem</span>
                    <span>•</span>
                    <span>{getTimeAgo(post.publishedAt)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* 5. PER CATEGORY FEEDS */}
          {Object.entries(postsByCategory).map(([categoryName, catPosts]) => {
            if (catPosts.length === 0) return null;
            return (
              <section key={categoryName} className="sn-category-feed-section">
                <div className="sn-section-title-wrap">
                  <h2 className="sn-section-title">{categoryName}</h2>
                  <span className="sn-section-arrow">Xem tất cả ›</span>
                </div>

                <div className="sn-category-feed-grid">
                  {catPosts.slice(0, 3).map((post) => (
                    <Link key={post.id} href={`/blog/${post.slug}`} className="sn-latest-card">
                      <div className="sn-latest-thumb-wrap">
                        <img src={post.thumbnail || "/images/news/default.jpg"} alt="" />
                      </div>
                      <div className="sn-latest-info">
                        <h3 className="sn-latest-title">
                          {post.title[lang] || post.title.vi}
                        </h3>
                        <div className="sn-portal-meta">
                          <span>👁 {post.viewCount || 1} lượt xem</span>
                          <span>•</span>
                          <span>{getTimeAgo(post.publishedAt)}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </main>
  );
}
