import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAuthenticatedAccount } from "../_lib/adminAuth";
import {
  readNewsIndexAsync,
  writeNewsDetailAsync,
  generateUniqueSlugAsync,
  NewsIndexItem,
  NewsDetail,
} from "../../../lib/blogDb";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const account = await getAuthenticatedAccount(req);
  if (!account || !account.active) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const items = await readNewsIndexAsync();
    items.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    return NextResponse.json({ success: true, data: items });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const account = await getAuthenticatedAccount(req);
  if (!account || !account.active) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, excerpt, blocks, thumbnail, category, status, featured, seo } = body;

    if (!title || (!title.vi && !title.en)) {
      return NextResponse.json(
        { success: false, error: "Tiêu đề không được để trống." },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const slug = await generateUniqueSlugAsync(title.vi || title.en || "bai-viet");

    const newIndexItem: NewsIndexItem = {
      id: `news_${Date.now()}`,
      slug,
      title: {
        vi: title.vi || "",
        en: title.en || "",
      },
      excerpt: {
        vi: excerpt?.vi || "",
        en: excerpt?.en || "",
      },
      thumbnail: thumbnail || "",
      category: category || "Tin tức",
      status: status === "published" ? "published" : "draft",
      featured: Boolean(featured),
      authorId: account.id,
      publishedAt: now,
      updatedAt: now,
    };

    const newDetail: NewsDetail = {
      slug,
      blocks: {
        vi: blocks?.vi || [],
        en: blocks?.en || [],
      },
      seo: seo || {
        metaTitle: title,
        metaDescription: excerpt,
        keywords: [],
      },
      authorId: account.id,
      createdAt: now,
      updatedAt: now,
    };

    await writeNewsDetailAsync(newIndexItem, newDetail);

    // Instant revalidation for public blog pages
    try {
      revalidatePath("/blog");
      revalidatePath(`/blog/${slug}`);
    } catch {}

    return NextResponse.json({
      success: true,
      message: "Tạo bài viết mới thành công.",
      data: { ...newIndexItem, ...newDetail },
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
