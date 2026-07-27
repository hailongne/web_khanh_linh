import { NextResponse } from "next/server";
import { isAuthorized } from "../_lib/adminAuth";
import {
  readNewsIndex,
  writeNewsIndex,
  writeNewsDetail,
  generateUniqueSlug,
  NewsIndexItem,
  NewsDetail,
} from "../../../lib/blogDb";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const authorized = await isAuthorized(req);
  if (!authorized) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const items = readNewsIndex();
    // Sort by updatedAt descending for admin list
    items.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    return NextResponse.json({ success: true, data: items });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const authorized = await isAuthorized(req);
  if (!authorized) {
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
    const slug = generateUniqueSlug(title.vi || title.en || "bai-viet");

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
      createdAt: now,
      updatedAt: now,
    };

    const items = readNewsIndex();
    items.unshift(newIndexItem);
    writeNewsIndex(items);

    writeNewsDetail(slug, newDetail);

    return NextResponse.json({
      success: true,
      message: "Tạo bài viết mới thành công.",
      data: { ...newIndexItem, ...newDetail },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
