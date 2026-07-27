import { NextResponse } from "next/server";
import { readNewsIndex } from "../../lib/blogDb";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const lang = (searchParams.get("lang") || "vi") as "vi" | "en";
    const category = searchParams.get("category");
    const featured = searchParams.get("featured");
    const search = searchParams.get("search")?.toLowerCase().trim();

    let items = readNewsIndex();

    // Filter published only for public user route
    items = items.filter((item) => item.status === "published");

    if (featured === "true") {
      items = items.filter((item) => item.featured);
    }

    if (category) {
      items = items.filter((item) => item.category === category);
    }

    if (search) {
      items = items.filter((item) => {
        const titleText = (item.title[lang] || item.title.vi || "").toLowerCase();
        const excerptText = (item.excerpt[lang] || item.excerpt.vi || "").toLowerCase();
        return titleText.includes(search) || excerptText.includes(search);
      });
    }

    // Sort by publishedAt descending
    items.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    return NextResponse.json({
      success: true,
      total: items.length,
      data: items,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
