import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { readCategories, readNewsIndex, BlogCategory, NewsIndexItem } from "../../../lib/blogDb";

type Props = {
  params: Promise<{ slug: string }>;
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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const categories = readCategories();
  const cat = categories.find((c: BlogCategory) => c.slug === slug || c.name.toLowerCase() === slug.toLowerCase());

  if (!cat || cat.visible === false) {
    return {
      title: "Danh mục không tồn tại | Khánh Linh Trans",
      robots: { index: false, follow: false },
    };
  }

  const categoryName = cat.name;
  const canonicalUrl = `https://khanhlinhtrans.vn/blog/category/${slug}`;
  const description = cat.description || `Tổng hợp các bài viết kinh nghiệm thuê xe và cẩm nang du lịch thuộc chủ đề ${categoryName} từ Khánh Linh Trans.`;

  return {
    title: `${categoryName} | Khánh Linh Trans Blog`,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${categoryName} | Khánh Linh Trans Blog`,
      description,
      url: canonicalUrl,
      siteName: "Khánh Linh Trans",
      locale: "vi_VN",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${categoryName} | Khánh Linh Trans Blog`,
      description,
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const categories = readCategories();
  const currentCat = categories.find((c: BlogCategory) => c.slug === slug || c.name.toLowerCase() === slug.toLowerCase());

  // Category hidden or not found -> 404
  if (!currentCat || currentCat.visible === false) {
    notFound();
  }

  const catName = currentCat.name;

  // Filter published posts for this category
  const allPosts = readNewsIndex();
  const posts = allPosts.filter((item: NewsIndexItem) => {
    if (item.status !== "published") return false;
    return item.category === currentCat.name;
  });

  // Sort by publishedAt descending
  posts.sort((a: NewsIndexItem, b: NewsIndexItem) => {
    const timeA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const timeB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return timeB - timeA;
  });

  const jsonLdBreadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Trang chủ",
        item: "https://khanhlinhtrans.vn",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: "https://khanhlinhtrans.vn/blog",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: catName,
        item: `https://khanhlinhtrans.vn/blog/category/${slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }}
      />
      <main className="sn-portal-container">
        <div className="sn-portal-body">
          <section className="blog-featured-section" style={{ marginBottom: 48 }}>
            <div className="blog-section-header" style={{ marginBottom: 28 }}>
              <h1 className="blog-section-title-text" style={{ fontSize: "1.6rem" }}>
                {catName}
              </h1>
              <Link href="/blog" className="blog-action-btn-sm" style={{ padding: "6px 16px", fontSize: "0.8rem" }}>
                ← Tất cả bài viết
              </Link>
            </div>

            {posts.length === 0 ? (
              <div className="blog-reader-empty" style={{ padding: "60px 20px", textAlign: "center" }}>
                <p style={{ fontSize: "1.1rem", color: "#64748b", marginBottom: 20 }}>
                  Chưa có bài viết trong danh mục này.
                </p>
                <Link href="/blog" className="blog-action-btn-sm">
                  Xem tất cả bài viết
                </Link>
              </div>
            ) : (
              <div className="blog-featured-grid">
                {posts.map((post: NewsIndexItem) => {
                  const postTitle = post.title.vi || "Untitled";
                  const postExcerpt = post.excerpt?.vi || "";
                  return (
                    <Link key={`cat-${post.id}`} href={`/blog/${post.slug}`} className="related-post-card">
                      <div className="related-post-thumb-wrap">
                        <img
                          src={post.thumbnail || "/images/news/default.jpg"}
                          alt={postTitle}
                          loading="lazy"
                        />
                      </div>
                      <span className="related-post-cat">{post.category}</span>
                      <h2 className="related-post-title" style={{ fontSize: "1.1rem" }}>{postTitle}</h2>
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
    </>
  );
}
