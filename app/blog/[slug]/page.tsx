"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { SiteHeader } from "../../site-header";
import { SiteFooter } from "../../site-footer";
import FloatingContactWidget from "../../FloatingContactWidget";
import BlockRenderer from "../../components/blog/BlockRenderer";
import { BlogBlock } from "../../components/blog/types";
import { translations } from "../../translations";
import "../../user.css";
import "../blog.css";

type ArticleDetail = {
  id: string;
  slug: string;
  title: { vi: string; en: string };
  excerpt: { vi: string; en: string };
  blocks: { vi: BlogBlock[]; en: BlogBlock[] };
  content?: { vi: string; en: string }; // legacy fallback
  thumbnail: string;
  category: string;
  status: "draft" | "published";
  featured: boolean;
  publishedAt: string;
  updatedAt: string;
};

export default function ArticleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const [lang, setLang] = useState<"vi" | "en">("vi");
  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchArticle();
  }, [slug]);

  async function fetchArticle() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/blog/${slug}`);
      const json = await res.json();
      if (json.success) {
        setArticle(json.data);
      } else {
        setError(json.error || "Không thể tải bài viết.");
      }
    } catch (err) {
      console.error("Error fetching article:", err);
      setError("Đã xảy ra lỗi khi kết nối máy chủ.");
    } finally {
      setLoading(false);
    }
  }

  const headerLinks = translations[lang]?.header?.links || [];
  const renderHeader = () => (
    <SiteHeader
      links={headerLinks}
      lang={lang}
      onToggleLang={() => setLang((prev) => (prev === "vi" ? "en" : "vi"))}
    />
  );

  if (loading) {
    return (
      <div className="article-page">
        {renderHeader()}
        <div className="article-body-container">
          <div className="blog-empty">
            <p>{lang === "vi" ? "Đang tải bài viết..." : "Loading article..."}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="article-page">
        {renderHeader()}
        <div className="article-body-container">
          <div className="blog-empty">
            <p>{error || (lang === "vi" ? "Bài viết không tồn tại." : "Article not found.")}</p>
            <Link href="/blog" className="article-back-link" style={{ marginTop: 20 }}>
              ← {lang === "vi" ? "Quay lại danh sách bài viết" : "Back to all articles"}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const title = article.title[lang] || article.title.vi || "Untitled";
  const excerpt = article.excerpt[lang] || article.excerpt.vi || "";
  const blocks = article.blocks?.[lang] || article.blocks?.vi || [];
  const dateStr = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString(lang === "vi" ? "vi-VN" : "en-US", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "";

  return (
    <div className="article-page">
      {renderHeader()}

      <main className="article-main-container">
        <article className="article-paper-card">
          <Link href="/blog" className="article-back-link">
            ← {lang === "vi" ? "Tất cả bài viết" : "All Articles"}
          </Link>

          <div className="article-meta">
            <span className="blog-card__category">{article.category}</span>
            <span>•</span>
            <span>{dateStr}</span>
          </div>

          <h1 className="article-title">{title}</h1>
          {excerpt && <p className="article-excerpt">{excerpt}</p>}

          {article.thumbnail && (
            <img
              src={article.thumbnail}
              alt={title}
              className="article-hero-img"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          )}

          <div className="article-divider-line" />

          <div className="article-body">
            <BlockRenderer blocks={blocks} />
          </div>
        </article>
      </main>

      <SiteFooter lang={lang} />
      <FloatingContactWidget />
    </div>
  );
}
