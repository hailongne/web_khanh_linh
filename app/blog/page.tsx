"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { SiteHeader } from "../site-header";
import { SiteFooter } from "../site-footer";
import FloatingContactWidget from "../FloatingContactWidget";
import { translations } from "../translations";
import "../user.css";
import "./blog.css";

type NewsItem = {
  id: string;
  slug: string;
  title: { vi: string; en: string };
  excerpt: { vi: string; en: string };
  thumbnail: string;
  category: string;
  status: "draft" | "published";
  featured: boolean;
  publishedAt: string;
  updatedAt: string;
};

export default function BlogListPage() {
  const [lang, setLang] = useState<"vi" | "en">("vi");
  const [posts, setPosts] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    fetchPosts();
  }, [lang, selectedCategory, searchQuery]);

  async function fetchPosts() {
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
  }

  const categories = ["all", ...Array.from(new Set(posts.map((p) => p.category).filter(Boolean)))];
  const headerLinks = translations[lang]?.header?.links || [];

  return (
    <div className="blog-page">
      <SiteHeader
        links={headerLinks}
        lang={lang}
        onToggleLang={() => setLang((prev) => (prev === "vi" ? "en" : "vi"))}
      />

      <section className="blog-hero">
        <div className="blog-hero__content">
          <h1 className="blog-hero__title">
            {lang === "vi" ? "Tin Tức & Cẩm Nang Du Lịch" : "News & Travel Guide"}
          </h1>
          <p className="blog-hero__subtitle">
            {lang === "vi"
              ? "Cập nhật kinh nghiệm thuê xe, điểm đến hấp dẫn và thông tin ưu đãi mới nhất từ Khánh Linh Trans."
              : "Discover car rental tips, attractive destinations, and latest offers from Khanh Linh Trans."}
          </p>
        </div>
      </section>

      <main className="blog-container">
        <div className="blog-filters">
          <div className="blog-categories">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`blog-cat-btn ${selectedCategory === cat ? "blog-cat-btn--active" : ""}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat === "all" ? (lang === "vi" ? "Tất cả" : "All") : cat}
              </button>
            ))}
          </div>

          <div className="blog-search-box">
            <svg
              className="blog-search-icon"
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
              className="blog-search-input"
              placeholder={lang === "vi" ? "Tìm kiếm bài viết..." : "Search articles..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="blog-empty">
            <p>{lang === "vi" ? "Đang tải bài viết..." : "Loading articles..."}</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="blog-empty">
            <p>{lang === "vi" ? "Chưa có bài viết nào phù hợp." : "No articles found."}</p>
          </div>
        ) : (
          <div className="blog-grid">
            {posts.map((post) => {
              const title = post.title[lang] || post.title.vi || "Untitled";
              const excerpt = post.excerpt[lang] || post.excerpt.vi || "";
              const dateStr = post.publishedAt
                ? new Date(post.publishedAt).toLocaleDateString(lang === "vi" ? "vi-VN" : "en-US", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })
                : "";

              return (
                <Link key={post.id} href={`/blog/${post.slug}`} className="blog-card">
                  <div className="blog-card__thumb-wrap">
                    <img
                      src={post.thumbnail || "/images/news/default.jpg"}
                      alt={title}
                      className="blog-card__thumb"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80";
                      }}
                    />
                    {post.featured && (
                      <span className="blog-card__badge-featured">
                        {lang === "vi" ? "Nổi bật" : "Featured"}
                      </span>
                    )}
                  </div>
                  <div className="blog-card__body">
                    <div className="blog-card__meta">
                      <span className="blog-card__category">{post.category}</span>
                      <span>•</span>
                      <span>{dateStr}</span>
                    </div>
                    <h2 className="blog-card__title">{title}</h2>
                    <p className="blog-card__excerpt">{excerpt}</p>
                    <div className="blog-card__footer">
                      <span>{lang === "vi" ? "Đọc tiếp" : "Read more"}</span>
                      <span>→</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      <SiteFooter lang={lang} />
      <FloatingContactWidget />
    </div>
  );
}
