import { NextResponse } from "next/server";
import { incrementNewsViewsAsync, readNewsDetailAsync, readNewsIndexAsync, readCategoriesAsync } from "../../../lib/blogDb";
import { readAccountsAsync } from "../../admin/_lib/adminAuth";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const index = await readNewsIndexAsync();
    const meta = index.find((item) => item.slug === slug && item.status === "published");

    if (!meta) {
      return NextResponse.json({ success: false, error: "Bài viết không tồn tại hoặc chưa xuất bản." }, { status: 404 });
    }

    const categories = await readCategoriesAsync();
    const targetCategory = categories.find((c) => c.name === meta.category);
    if (targetCategory && targetCategory.visible === false) {
      return NextResponse.json({ success: false, error: "Bài viết thuộc danh mục đã bị ẩn." }, { status: 404 });
    }

    const detail = await readNewsDetailAsync(slug);
    if (!detail) {
      return NextResponse.json({ success: false, error: "Nội dung bài viết không tìm thấy." }, { status: 404 });
    }

    const updatedViewCount = await incrementNewsViewsAsync(slug);

    let authorInfo = { displayName: "Khánh Linh Trans", avatar: "" };
    const authorId = detail.authorId || meta.authorId;
    if (authorId) {
      try {
        const accounts = await readAccountsAsync();
        const authorAcc = accounts.find((a) => a.id === authorId);
        if (authorAcc) {
          authorInfo = {
            displayName: authorAcc.displayName || authorAcc.username,
            avatar: authorAcc.avatar || ""
          };
        }
      } catch {
        // Fallback silently
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        ...meta,
        viewCount: updatedViewCount,
        blocks: detail.blocks || { vi: [], en: [] },
        content: detail.content,
        seo: detail.seo,
        author: authorInfo,
        createdAt: detail.createdAt,
      },
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
