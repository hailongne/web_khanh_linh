import fs from "node:fs";
import path from "node:path";
import { BlogBlock, LocalizedBlocks } from "../components/blog/types";

const DATA_DIR = path.join(process.cwd(), "data");
const INDEX_PATH = path.join(DATA_DIR, "news-index.json");
const CATEGORIES_PATH = path.join(DATA_DIR, "categories.json");
const NEWS_DIR = path.join(DATA_DIR, "news");
const IMAGES_DIR = path.join(process.cwd(), "public", "images", "news");

export type BlogCategory = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  visible?: boolean;
  createdAt: string;
  updatedAt: string;
};

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
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(NEWS_DIR)) {
      fs.mkdirSync(NEWS_DIR, { recursive: true });
    }
    if (!fs.existsSync(IMAGES_DIR)) {
      fs.mkdirSync(IMAGES_DIR, { recursive: true });
    }
  } catch (err) {
    console.warn("Notice: Cannot create directories on read-only filesystem:", err);
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
    console.warn("Notice: Cannot write news-index.json on read-only filesystem:", err);
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

  try {
    fs.writeFileSync(filePath, JSON.stringify(dataToSave, null, 2), "utf-8");
  } catch (err) {
    console.warn(`Notice: Cannot write news detail ${slug} on read-only filesystem:`, err);
  }
}

export function deleteNewsDetail(slug: string): void {
  ensureDirs();
  const filePath = path.join(NEWS_DIR, `${slug}.json`);
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch (err) {
      console.warn(`Notice: Cannot delete news file ${slug} on read-only filesystem:`, err);
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
      console.warn(`Notice: Cannot unlink orphan image ${fileName} on read-only filesystem:`, err);
    }
  }
}

export function readCategories(): BlogCategory[] {
  ensureDirs();
  if (!fs.existsSync(CATEGORIES_PATH)) {
    // Auto-seed from news index unique categories if file doesn't exist
    const news = readNewsIndex();
    const uniqueNames = Array.from(new Set(news.map((item) => item.category).filter(Boolean)));
    const now = new Date().toISOString();
    const initial: BlogCategory[] = uniqueNames.map((name, idx) => ({
      id: `cat_${idx + 1}`,
      name,
      slug: slugify(name),
      description: "",
      createdAt: now,
      updatedAt: now,
    }));
    try {
      fs.writeFileSync(CATEGORIES_PATH, JSON.stringify(initial, null, 2), "utf-8");
    } catch (err) {
      console.warn("Notice: Cannot create initial categories.json on read-only filesystem:", err);
    }
    return initial;
  }

  try {
    const raw = fs.readFileSync(CATEGORIES_PATH, "utf-8");
    const parsed = JSON.parse(raw) as BlogCategory[];
    return parsed.map((c) => ({
      ...c,
      visible: c.visible !== false,
    }));
  } catch (err) {
    console.error("Error reading categories.json:", err);
    return [];
  }
}

export function writeCategories(items: BlogCategory[]): void {
  ensureDirs();
  try {
    fs.writeFileSync(CATEGORIES_PATH, JSON.stringify(items, null, 2), "utf-8");
  } catch (err) {
    console.warn("Notice: Cannot write categories.json on read-only filesystem:", err);
  }
}

export function createCategory(
  nameStr: string,
  descriptionStr?: string
): { success: boolean; data: BlogCategory; isDuplicate?: boolean; message?: string } {
  const cleanName = nameStr ? nameStr.trim().replace(/\s+/g, " ") : "";
  if (!cleanName) {
    throw new Error("Tên danh mục không được để trống.");
  }

  const normalizedInput = cleanName.toLowerCase();
  const candidateSlug = slugify(cleanName);
  const categories = readCategories();

  // Case-insensitive & normalized duplicate check (Requirement 6)
  const existing = categories.find(
    (c) =>
      c.name.trim().replace(/\s+/g, " ").toLowerCase() === normalizedInput ||
      c.slug === candidateSlug
  );

  if (existing) {
    return {
      success: true,
      data: existing,
      isDuplicate: true,
      message: "Danh mục này đã tồn tại.",
    };
  }

  const now = new Date().toISOString();
  const newCat: BlogCategory = {
    id: `cat_${Date.now()}`,
    name: cleanName,
    slug: candidateSlug,
    description: descriptionStr ? descriptionStr.trim() : "",
    visible: true,
    createdAt: now,
    updatedAt: now,
  };

  categories.push(newCat);
  writeCategories(categories);

  return {
    success: true,
    data: newCat,
  };
}

export function updateCategoryVisibility(
  idOrSlug: string,
  visible: boolean
): { success: boolean; data?: BlogCategory; message?: string } {
  const categories = readCategories();
  const cat = categories.find(
    (c) => c.id === idOrSlug || c.slug === idOrSlug || c.name === idOrSlug
  );
  if (!cat) {
    return { success: false, message: "Không tìm thấy danh mục." };
  }

  cat.visible = Boolean(visible);
  cat.updatedAt = new Date().toISOString();
  writeCategories(categories);

  return {
    success: true,
    data: cat,
    message: visible ? "Đã bật hiển thị danh mục." : "Đã ẩn danh mục thành công.",
  };
}

