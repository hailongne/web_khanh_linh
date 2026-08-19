import { BlogBlock, LocalizedBlocks } from "../components/blog/types";
import { supabase } from "./supabase";

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
  content?: LocalizedText;
  seo?: NewsSeo;
  authorId?: string;
  createdAt: string;
  updatedAt: string;
};

export function slugify(str: string): string {
  if (!str) return "bai-viet";
  let slug = str.toLowerCase().trim();

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

export function migrateLegacyHtmlToBlocks(htmlStr: string): BlogBlock[] {
  if (!htmlStr || typeof htmlStr !== "string") return [];

  const blocks: BlogBlock[] = [];
  const cleanStr = htmlStr.trim();
  if (!cleanStr) return blocks;

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

export function mapRowToNewsIndexItem(row: any): NewsIndexItem {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title || { vi: "", en: "" },
    excerpt: row.excerpt || { vi: "", en: "" },
    thumbnail: row.thumbnail || "",
    category: row.category || "",
    status: (row.status || "published") as NewsStatus,
    featured: row.featured ?? false,
    viewCount: row.view_count || 0,
    authorId: row.author_id || undefined,
    publishedAt: row.published_at || row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString()
  };
}

export async function readNewsIndexAsync(): Promise<NewsIndexItem[]> {
  try {
    const { data, error } = await supabase.from("posts").select("*").order("published_at", { ascending: false });
    if (error || !data) return [];
    return data.map(mapRowToNewsIndexItem);
  } catch (err) {
    console.error("Error reading news index from Supabase:", err);
    return [];
  }
}

export function readNewsIndex(): NewsIndexItem[] {
  return [];
}

export function writeNewsIndex(): void {}

export async function incrementNewsViewsAsync(slug: string): Promise<number> {
  try {
    const { data: post } = await supabase.from("posts").select("view_count").eq("slug", slug).single();
    if (!post) return 0;
    const newCount = (post.view_count || 0) + 1;
    await supabase.from("posts").update({ view_count: newCount }).eq("slug", slug);
    return newCount;
  } catch {
    return 0;
  }
}

export function incrementNewsViews(): number {
  return 0;
}

export async function readNewsDetailAsync(slug: string): Promise<NewsDetail | null> {
  try {
    const { data, error } = await supabase.from("posts").select("*").eq("slug", slug).single();
    if (error || !data) return null;

    let blocks = data.blocks;
    if (!blocks || (!blocks.vi && !blocks.en)) {
      blocks = { vi: [], en: [] };
    }

    return {
      slug: data.slug,
      blocks,
      seo: data.seo || {},
      authorId: data.author_id || undefined,
      createdAt: data.created_at || new Date().toISOString(),
      updatedAt: data.updated_at || new Date().toISOString()
    };
  } catch (err) {
    console.error(`Error reading news detail for ${slug}:`, err);
    return null;
  }
}

export function readNewsDetail(): NewsDetail | null {
  return null;
}

export async function writeNewsDetailAsync(item: NewsIndexItem, detail: NewsDetail): Promise<void> {
  try {
    await supabase.from("posts").upsert({
      id: item.id,
      slug: item.slug,
      title: item.title,
      excerpt: item.excerpt,
      thumbnail: item.thumbnail,
      category: item.category,
      status: item.status,
      featured: item.featured,
      view_count: item.viewCount || 0,
      author_id: item.authorId || null,
      blocks: detail.blocks,
      seo: detail.seo || {},
      published_at: item.publishedAt,
      updated_at: new Date().toISOString()
    });
  } catch (err) {
    console.error(`Error writing news detail ${item.slug}:`, err);
  }
}

export function writeNewsDetail(): void {}

export async function deleteNewsDetailAsync(slug: string): Promise<void> {
  try {
    await supabase.from("posts").delete().eq("slug", slug);
  } catch (err) {
    console.error(`Error deleting news detail ${slug}:`, err);
  }
}

export function deleteNewsDetail(): void {}

export async function generateUniqueSlugAsync(titleStr: string, currentSlug?: string): Promise<string> {
  const baseSlug = slugify(titleStr);
  const { data: posts } = await supabase.from("posts").select("slug");

  const slugs = (posts || []).map((p) => p.slug);
  let candidate = baseSlug;
  let counter = 1;

  while (slugs.some((s) => s === candidate && s !== currentSlug)) {
    candidate = `${baseSlug}-${counter}`;
    counter++;
  }

  return candidate;
}

export function generateUniqueSlug(titleStr: string, currentSlug?: string): string {
  return slugify(titleStr);
}

export function deleteOrphanImage(imagePath: string): void {}

export async function readCategoriesAsync(): Promise<BlogCategory[]> {
  try {
    const { data, error } = await supabase.from("categories").select("*").order("name", { ascending: true });
    if (error || !data) return [];
    return data.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description || "",
      visible: c.visible ?? true,
      createdAt: c.created_at || new Date().toISOString(),
      updatedAt: c.updated_at || new Date().toISOString()
    }));
  } catch (err) {
    console.error("Error reading categories from Supabase:", err);
    return [];
  }
}

export function readCategories(): BlogCategory[] {
  return [];
}

export function writeCategories(): void {}

export async function createCategoryAsync(
  nameStr: string,
  descriptionStr?: string
): Promise<{ success: boolean; data: BlogCategory; isDuplicate?: boolean; message?: string }> {
  const cleanName = nameStr ? nameStr.trim().replace(/\s+/g, " ") : "";
  if (!cleanName) {
    throw new Error("Tên danh mục không được để trống.");
  }

  const normalizedInput = cleanName.toLowerCase();
  const candidateSlug = slugify(cleanName);
  const categories = await readCategoriesAsync();

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

  await supabase.from("categories").insert({
    id: newCat.id,
    name: newCat.name,
    slug: newCat.slug,
    description: newCat.description,
    visible: newCat.visible,
    created_at: newCat.createdAt,
    updated_at: newCat.updatedAt
  });

  return {
    success: true,
    data: newCat,
  };
}

export async function updateCategoryVisibilityAsync(
  idOrSlug: string,
  visible: boolean
): Promise<{ success: boolean; data?: BlogCategory; message?: string }> {
  const categories = await readCategoriesAsync();
  const cat = categories.find(
    (c) => c.id === idOrSlug || c.slug === idOrSlug || c.name === idOrSlug
  );
  if (!cat) {
    return { success: false, message: "Không tìm thấy danh mục." };
  }

  const now = new Date().toISOString();
  await supabase.from("categories").update({ visible, updated_at: now }).eq("id", cat.id);

  cat.visible = Boolean(visible);
  cat.updatedAt = now;

  return {
    success: true,
    data: cat,
    message: visible ? "Đã bật hiển thị danh mục." : "Đã ẩn danh mục thành công.",
  };
}
