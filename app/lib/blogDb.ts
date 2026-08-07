import fs from "node:fs";
import path from "node:path";
import { BlogBlock, LocalizedBlocks } from "../components/blog/types";

const DATA_DIR = path.join(process.cwd(), "data");
const INDEX_PATH = path.join(DATA_DIR, "news-index.json");
const NEWS_DIR = path.join(DATA_DIR, "news");
const IMAGES_DIR = path.join(process.cwd(), "public", "images", "news");

export type LocalizedText = {
  vi: string;
  en: string;
};

export type NewsStatus = "draft" | "published";

export type NewsIndexItem = {
  id: string;
  slug: string;
  title: LocalizedText;
  excerpt: LocalizedText;
  thumbnail: string;
  category: string;
  status: NewsStatus;
  featured: boolean;
  viewCount?: number;
  authorId?: string;
  publishedAt: string;
  updatedAt: string;
};

export type NewsSeo = {
  metaTitle?: LocalizedText;
  metaDescription?: LocalizedText;
  keywords?: string[];
};

export type NewsDetail = {
  slug: string;
  blocks: LocalizedBlocks;
  content?: LocalizedText; // legacy support
  seo?: NewsSeo;
  authorId?: string;
  createdAt: string;
  updatedAt: string;
};

function ensureDirs() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(NEWS_DIR)) {
    fs.mkdirSync(NEWS_DIR, { recursive: true });
  }
  if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
  }
}

export function slugify(str: string): string {
  if (!str) return "bai-viet";
  let slug = str.toLowerCase().trim();

  // Remove Vietnamese diacritics
  slug = slug
    .replace(/[àáảãạâầấẩẫậăằắẳẵặ]/g, "a")
    .replace(/[èéẻẽẹêềếểễệ]/g, "e")
    .replace(/[ìíỉĩị]/g, "i")
    .replace(/[òóỏõọôồốổỗộơờớởỡợ]/g, "o")
    .replace(/[ùúủũụưừứửữự]/g, "u")
    .replace(/[ỳýỷỹỵ]/g, "y")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "bai-viet";
}

/**
 * Migration helper: Converts legacy HTML / plain text strings to structured Block Editor blocks
 */
export function migrateLegacyHtmlToBlocks(htmlStr: string): BlogBlock[] {
  if (!htmlStr || typeof htmlStr !== "string") return [];

  const blocks: BlogBlock[] = [];
  const cleanStr = htmlStr.trim();
  if (!cleanStr) return blocks;

  // Simple regex-based HTML chunk parsing for migration
  const tagRegex = /<(h[1-4]|p|blockquote|hr|img)[^>]*>([\s\S]*?)<\/\1>|<(hr|img)[^>]*\/?>/gi;
  let match;

  while ((match = tagRegex.exec(cleanStr)) !== null) {
    const fullTag = match[0];
    const tagName = (match[1] || match[3] || "").toLowerCase();
    const innerContent = (match[2] || "").trim();

    if (tagName.startsWith("h")) {
      const level = (parseInt(tagName.replace("h", ""), 10) || 2) as 1 | 2 | 3 | 4;
      const text = innerContent.replace(/<[^>]+>/g, "").trim();
      if (text) {
        blocks.push({
          id: `h_${Math.random().toString(36).substring(2, 9)}`,
          type: "heading",
          level,
          text,
        });
      }
    } else if (tagName === "p") {
      const text = innerContent.replace(/<[^>]+>/g, "").trim();
      if (text) {
        blocks.push({
          id: `p_${Math.random().toString(36).substring(2, 9)}`,
          type: "paragraph",
          text,
        });
      }
    } else if (tagName === "blockquote") {
      const text = innerContent.replace(/<[^>]+>/g, "").trim();
      if (text) {
        blocks.push({
          id: `q_${Math.random().toString(36).substring(2, 9)}`,
          type: "quote",
          text,
          author: "",
        });
      }
    } else if (tagName === "hr") {
      blocks.push({
        id: `d_${Math.random().toString(36).substring(2, 9)}`,
        type: "divider",
      });
    } else if (tagName === "img") {
      const srcMatch = fullTag.match(/src=["']([^"']+)["']/i);
      const altMatch = fullTag.match(/alt=["']([^"']+)["']/i);
      if (srcMatch && srcMatch[1]) {
        blocks.push({
          id: `img_${Math.random().toString(36).substring(2, 9)}`,
          type: "image",
          src: srcMatch[1],
          alt: altMatch ? altMatch[1] : "",
          caption: "",
          align: "center",
        });
      }
    }
  }

  // If no HTML tags matched, treat the whole text as a paragraph block
  if (blocks.length === 0 && cleanStr) {
    const textWithoutTags = cleanStr.replace(/<[^>]+>/g, "").trim();
    if (textWithoutTags) {
      blocks.push({
        id: `p_${Math.random().toString(36).substring(2, 9)}`,
        type: "paragraph",
        text: textWithoutTags,
      });
    }
  }

  return blocks;
}

export function readNewsIndex(): NewsIndexItem[] {
  ensureDirs();
  if (!fs.existsSync(INDEX_PATH)) {
    return [];
  }
  try {
    const raw = fs.readFileSync(INDEX_PATH, "utf-8");
    return JSON.parse(raw) as NewsIndexItem[];
  } catch (err) {
    console.error("Error reading news-index.json:", err);
    return [];
  }
}

export function writeNewsIndex(items: NewsIndexItem[]): void {
  ensureDirs();
  try {
    fs.writeFileSync(INDEX_PATH, JSON.stringify(items, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing news-index.json:", err);
  }
}

export function incrementNewsViews(slug: string): number {
  const items = readNewsIndex();
  const indexIdx = items.findIndex((item) => item.slug === slug);
  if (indexIdx === -1) return 0;

  const currentCount = typeof items[indexIdx].viewCount === "number" ? items[indexIdx].viewCount : 0;
  const newCount = currentCount + 1;
  items[indexIdx].viewCount = newCount;
  writeNewsIndex(items);
  return newCount;
}

export function readNewsDetail(slug: string): NewsDetail | null {
  ensureDirs();
  const filePath = path.join(NEWS_DIR, `${slug}.json`);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const detail = JSON.parse(raw);

    // Automatic Backward Compatibility Migration
    if (!detail.blocks) {
      const legacyVi = detail.content?.vi || "";
      const legacyEn = detail.content?.en || "";
      detail.blocks = {
        vi: migrateLegacyHtmlToBlocks(legacyVi),
        en: migrateLegacyHtmlToBlocks(legacyEn),
      };
    }

    return detail as NewsDetail;
  } catch (err) {
    console.error(`Error reading news detail file for ${slug}:`, err);
    return null;
  }
}

export function writeNewsDetail(slug: string, detail: NewsDetail): void {
  ensureDirs();
  const filePath = path.join(NEWS_DIR, `${slug}.json`);

  // Clean up legacy `content` field when saving new block structure
  const dataToSave = {
    slug: detail.slug,
    blocks: detail.blocks,
    seo: detail.seo,
    createdAt: detail.createdAt,
    updatedAt: detail.updatedAt,
  };

  fs.writeFileSync(filePath, JSON.stringify(dataToSave, null, 2), "utf-8");
}

export function deleteNewsDetail(slug: string): void {
  ensureDirs();
  const filePath = path.join(NEWS_DIR, `${slug}.json`);
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch (err) {
      console.error(`Error deleting news file ${slug}:`, err);
    }
  }
}

export function generateUniqueSlug(titleStr: string, currentSlug?: string): string {
  const baseSlug = slugify(titleStr);
  const index = readNewsIndex();

  let candidate = baseSlug;
  let counter = 1;

  while (index.some((item) => item.slug === candidate && item.slug !== currentSlug)) {
    candidate = `${baseSlug}-${counter}`;
    counter++;
  }

  return candidate;
}

export function deleteOrphanImage(imagePath: string): void {
  if (!imagePath || !imagePath.startsWith("/images/news/")) return;
  const fileName = path.basename(imagePath);
  const fullPath = path.join(IMAGES_DIR, fileName);

  const index = readNewsIndex();
  const isUsed = index.some((item) => item.thumbnail === imagePath);
  if (!isUsed && fs.existsSync(fullPath)) {
    try {
      fs.unlinkSync(fullPath);
    } catch (err) {
      console.error(`Error unlinking orphan image ${fileName}:`, err);
    }
  }
}
