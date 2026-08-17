import { notFound } from "next/navigation";
import { Metadata } from "next";
import { readNewsIndex, readNewsDetail, readCategories } from "../../lib/blogDb";
import ArticleClientView, { ArticleDetail } from "./ArticleClientView";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const index = readNewsIndex();
  const meta = index.find((item) => item.slug === slug && item.status === "published");

  if (!meta) {
    return {
      title: "Bài viết không tồn tại | Khánh Linh Trans",
      robots: { index: false, follow: false },
    };
  }

  // Check if category is hidden
  const categories = readCategories();
  const targetCategory = categories.find((c) => c.name === meta.category);
  if (targetCategory && targetCategory.visible === false) {
    return {
      title: "Bài viết không tồn tại | Khánh Linh Trans",
      robots: { index: false, follow: false },
    };
  }

  const title = meta.title.vi || meta.title.en || "Bài viết";
  const description = meta.excerpt.vi || meta.excerpt.en || "Thông tin từ Khánh Linh Trans";
  const canonicalUrl = `https://khanhlinhtrans.vn/blog/${slug}`;
  const thumbnail = meta.thumbnail ? (meta.thumbnail.startsWith("http") ? meta.thumbnail : `https://khanhlinhtrans.vn${meta.thumbnail}`) : "https://khanhlinhtrans.vn/images/logoKhanhLinh.png";

  return {
    title: `${title} | Khánh Linh Trans`,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${title} | Khánh Linh Trans`,
      description,
      url: canonicalUrl,
      siteName: "Khánh Linh Trans",
      locale: "vi_VN",
      type: "article",
      publishedTime: meta.publishedAt,
      modifiedTime: meta.updatedAt || meta.publishedAt,
      authors: ["Khánh Linh Trans"],
      images: [
        {
          url: thumbnail,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Khánh Linh Trans`,
      description,
      images: [thumbnail],
    },
  };
}

export default async function ArticleDetailPage({ params }: Props) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const index = readNewsIndex();
  const meta = index.find((item) => item.slug === slug && item.status === "published");

  if (!meta) {
    notFound();
  }

  // Check if category is hidden
  const categories = readCategories();
  const targetCategory = categories.find((c) => c.name === meta.category);
  if (targetCategory && targetCategory.visible === false) {
    notFound();
  }

  const detail = readNewsDetail(slug);
  if (!detail) {
    notFound();
  }

  const initialArticle: ArticleDetail = {
    ...meta,
    blocks: detail.blocks || { vi: [], en: [] },
    readingTime: "3 phút đọc",
    author: { name: "Khánh Linh Trans Editorial", avatar: "/images/logoKhanhLinh.png" },
  };

  const title = meta.title.vi || meta.title.en || "Bài viết";
  const excerpt = meta.excerpt.vi || meta.excerpt.en || "";
  const categorySlug = targetCategory?.slug || meta.category.toLowerCase().replace(/\s+/g, "-");

  // Server-rendered JSON-LD Schemas (Article + BreadcrumbList)
  const jsonLdArticle = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description: excerpt,
    image: meta.thumbnail ? [meta.thumbnail.startsWith("http") ? meta.thumbnail : `https://khanhlinhtrans.vn${meta.thumbnail}`] : [],
    datePublished: meta.publishedAt,
    dateModified: meta.updatedAt || meta.publishedAt,
    author: [
      {
        "@type": "Person",
        name: "Khánh Linh Trans Editorial",
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
        name: meta.category,
        item: `https://khanhlinhtrans.vn/blog/category/${categorySlug}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: title,
        item: `https://khanhlinhtrans.vn/blog/${slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdArticle) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }}
      />
      <ArticleClientView initialArticle={initialArticle} slug={slug} />
    </>
  );
}
