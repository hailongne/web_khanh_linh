export type BlockType =
  | "paragraph"
  | "heading"
  | "image"
  | "gallery"
  | "quote"
  | "divider"
  | "youtube";

export type BaseBlock = {
  id: string;
  type: BlockType;
};

export type ParagraphBlockData = BaseBlock & {
  type: "paragraph";
  text?: string;
  content?: string;
};

export type HeadingBlockData = BaseBlock & {
  type: "heading";
  level?: 1 | 2 | 3 | 4;
  text?: string;
  content?: string;
};

export type ImageAlign = "left" | "center" | "right" | "full";
export type ImageWidth = "40%" | "60%" | "100%" | "normal" | "full";

export type ImageBlockData = BaseBlock & {
  type: "image";
  url?: string;
  src?: string;
  alt?: string;
  caption?: string;
  align?: ImageAlign;
  width?: ImageWidth;
};

export type GalleryItem = {
  url?: string;
  src?: string;
  alt?: string;
  caption?: string;
};

export type GalleryBlockData = BaseBlock & {
  type: "gallery";
  images: GalleryItem[];
  columns?: 1 | 2 | 3 | 4;
};

export type QuoteBlockData = BaseBlock & {
  type: "quote";
  text?: string;
  content?: string;
  author?: string;
};

export type DividerBlockData = BaseBlock & {
  type: "divider";
};

export type YoutubeBlockData = BaseBlock & {
  type: "youtube";
  url?: string;
  src?: string;
};

export type BlogBlock =
  | ParagraphBlockData
  | HeadingBlockData
  | ImageBlockData
  | GalleryBlockData
  | QuoteBlockData
  | DividerBlockData
  | YoutubeBlockData;

export type LocalizedBlocks = {
  vi: BlogBlock[];
  en: BlogBlock[];
};

export type ArticleDetailData = {
  id: string;
  slug: string;
  title: { vi: string; en: string };
  excerpt: { vi: string; en: string };
  blocks: LocalizedBlocks;
  thumbnail: string;
  category: string;
  status: "draft" | "published";
  featured: boolean;
  publishedAt: string;
  updatedAt: string;
  seo?: {
    metaTitle?: { vi: string; en: string };
    metaDescription?: { vi: string; en: string };
    keywords?: string[];
  };
};
