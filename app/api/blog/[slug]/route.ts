import { NextResponse } from "next/server";
import { readNewsDetail, readNewsIndex } from "../../../lib/blogDb";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const index = readNewsIndex();
    const meta = index.find((item) => item.slug === slug && item.status === "published");

    if (!meta) {
      return NextResponse.json({ success: false, error: "Bài viết không tồn tại hoặc chưa xuất bản." }, { status: 404 });
    }

    const detail = readNewsDetail(slug);
    if (!detail) {
      return NextResponse.json({ success: false, error: "Nội dung bài viết không tìm thấy." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...meta,
        blocks: detail.blocks || { vi: [], en: [] },
        content: detail.content,
        seo: detail.seo,
        createdAt: detail.createdAt,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
