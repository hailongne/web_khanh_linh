import { NextResponse } from "next/server";
import { getAuthenticatedAccount } from "../../_lib/adminAuth";
import {
  readNewsIndex,
  writeNewsIndex,
  readNewsDetail,
  writeNewsDetail,
  deleteNewsDetail,
  deleteOrphanImage,
  generateUniqueSlug,
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
    const items = readNewsIndex();
    const meta = items.find((item) => item.slug === slug);

    if (!meta) {
      return NextResponse.json({ success: false, error: "Không tìm thấy bài viết." }, { status: 404 });
    }

    const detail = readNewsDetail(slug);
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

    const items = readNewsIndex();
    const indexIdx = items.findIndex((item) => item.slug === targetSlug);

    if (indexIdx === -1) {
      return NextResponse.json({ success: false, error: "Không tìm thấy bài viết để cập nhật." }, { status: 404 });
    }

    const now = new Date().toISOString();
    const currentMeta = items[indexIdx];
    const oldThumbnail = currentMeta.thumbnail;

    // Check if slug needs update if title changed
    let newSlug = targetSlug;
    if (title?.vi || title?.en) {
      const newTitleStr = title.vi || title.en;
      newSlug = generateUniqueSlug(newTitleStr, targetSlug);
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

    items[indexIdx] = updatedIndexItem;
    writeNewsIndex(items);

    const existingDetail = readNewsDetail(targetSlug);
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
      deleteNewsDetail(targetSlug);
    }
    writeNewsDetail(newSlug, updatedDetail);

    if (oldThumbnail && oldThumbnail !== updatedIndexItem.thumbnail) {
      deleteOrphanImage(oldThumbnail);
    }

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
    const items = readNewsIndex();
    const indexIdx = items.findIndex((item) => item.slug === slug);

    if (indexIdx === -1) {
      return NextResponse.json({ success: false, error: "Không tìm thấy bài viết để xóa." }, { status: 404 });
    }

    const targetItem = items[indexIdx];
    items.splice(indexIdx, 1);
    writeNewsIndex(items);

    deleteNewsDetail(slug);
    if (targetItem.thumbnail) {
      deleteOrphanImage(targetItem.thumbnail);
    }

    return NextResponse.json({
      success: true,
      message: "Đã xóa bài viết thành công.",
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
