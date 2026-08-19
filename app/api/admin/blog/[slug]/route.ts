import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAuthenticatedAccount } from "../../_lib/adminAuth";
import {
  readNewsIndexAsync,
  readNewsDetailAsync,
  writeNewsDetailAsync,
  deleteNewsDetailAsync,
  generateUniqueSlugAsync,
  NewsDetail,
} from "../../../../lib/blogDb";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const account = await getAuthenticatedAccount(req);
  if (!account || !account.active) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { slug } = await params;
    const items = await readNewsIndexAsync();
    const meta = items.find((item) => item.slug === slug);

    if (!meta) {
      return NextResponse.json({ success: false, error: "Không tìm thấy bài viết." }, { status: 404 });
    }

    const detail = await readNewsDetailAsync(slug);
    return NextResponse.json({
      success: true,
      data: {
        ...meta,
        blocks: detail?.blocks || { vi: [], en: [] },
        seo: detail?.seo || {},
        authorId: detail?.authorId || meta.authorId || account.id,
        createdAt: detail?.createdAt || meta.publishedAt,
      },
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const account = await getAuthenticatedAccount(req);
  if (!account || !account.active) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { slug: targetSlug } = await params;
    const body = await req.json();
    const { title, excerpt, blocks, thumbnail, category, status, featured, seo } = body;

    const items = await readNewsIndexAsync();
    const currentMeta = items.find((item) => item.slug === targetSlug);

    if (!currentMeta) {
      return NextResponse.json({ success: false, error: "Không tìm thấy bài viết để cập nhật." }, { status: 404 });
    }

    const now = new Date().toISOString();
    let newSlug = targetSlug;
    if (title?.vi || title?.en) {
      const newTitleStr = title.vi || title.en;
      newSlug = await generateUniqueSlugAsync(newTitleStr, targetSlug);
    }

    const authorId = currentMeta.authorId || account.id;

    const updatedIndexItem = {
      ...currentMeta,
      slug: newSlug,
      title: title ? { vi: title.vi || "", en: title.en || "" } : currentMeta.title,
      excerpt: excerpt ? { vi: excerpt.vi || "", en: excerpt.en || "" } : currentMeta.excerpt,
      thumbnail: thumbnail !== undefined ? thumbnail : currentMeta.thumbnail,
      category: category !== undefined ? category : currentMeta.category,
      status: status !== undefined ? status : currentMeta.status,
      featured: featured !== undefined ? Boolean(featured) : currentMeta.featured,
      authorId,
      updatedAt: now,
    };

    const existingDetail = await readNewsDetailAsync(targetSlug);
    const updatedDetail: NewsDetail = {
      slug: newSlug,
      blocks: blocks
        ? { vi: blocks.vi || [], en: blocks.en || [] }
        : existingDetail?.blocks || { vi: [], en: [] },
      seo: seo !== undefined ? seo : existingDetail?.seo,
      authorId,
      createdAt: existingDetail?.createdAt || currentMeta.publishedAt,
      updatedAt: now,
    };

    if (newSlug !== targetSlug) {
      await deleteNewsDetailAsync(targetSlug);
    }
    await writeNewsDetailAsync(updatedIndexItem, updatedDetail);

    try {
      revalidatePath("/blog");
      revalidatePath(`/blog/${newSlug}`);
      if (newSlug !== targetSlug) revalidatePath(`/blog/${targetSlug}`);
    } catch {}

    return NextResponse.json({
      success: true,
      message: "Cập nhật bài viết thành công.",
      data: { ...updatedIndexItem, ...updatedDetail },
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const account = await getAuthenticatedAccount(req);
  if (!account || !account.active) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { slug } = await params;
    const items = await readNewsIndexAsync();
    const targetItem = items.find((item) => item.slug === slug);

    if (!targetItem) {
      return NextResponse.json({ success: false, error: "Không tìm thấy bài viết để xóa." }, { status: 404 });
    }

    await deleteNewsDetailAsync(slug);

    try {
      revalidatePath("/blog");
      revalidatePath(`/blog/${slug}`);
    } catch {}

    return NextResponse.json({
      success: true,
      message: "Đã xóa bài viết thành công.",
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
