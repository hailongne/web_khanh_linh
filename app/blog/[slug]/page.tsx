import { notFound } from "next/navigation";
import { Metadata } from "next";
import { readNewsIndexAsync, readNewsDetailAsync, readCategoriesAsync } from "../../lib/blogDb";
import ArticleClientView, { ArticleDetail } from "./ArticleClientView";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const index = await readNewsIndexAsync();
  const meta = index.find((item) => item.slug === slug && item.status === "published");

  if (!meta) {
    return {
      title: "Bài viết không tồn tại | Khánh Linh Trans",
      robots: { index: false, follow: false },
    };
  }

  const categories = await readCategoriesAsync();
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

  const index = await readNewsIndexAsync();
  const meta = index.find((item) => item.slug === slug && item.status === "published");

  if (!meta) {
    notFound();
  }

  const categories = await readCategoriesAsync();
  const targetCategory = categories.find((c) => c.name === meta.category);
  if (targetCategory && targetCategory.visible === false) {
    notFound();
  }

  const detail = await readNewsDetailAsync(slug);
  if (!detail) {
    notFound();
  }

  const initialArticle: ArticleDetail = {
    ...meta,
    blocks: detail.blocks || { vi: [], en: [] },
    readingTime: "3 phút đọc",
    author: { name: "Khánh Linh Trans Editorial", avatar: "/images/logoKhanhLinh.png" },
  };

  return <ArticleClientView initialArticle={initialArticle} slug={slug} />;
}
