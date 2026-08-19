import { NextResponse } from "next/server";
import { readNewsIndexAsync, readCategoriesAsync } from "../../lib/blogDb";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const lang = (searchParams.get("lang") || "vi") as "vi" | "en";
    const category = searchParams.get("category");
    const featured = searchParams.get("featured");
    const search = searchParams.get("search")?.toLowerCase().trim();

    let items = await readNewsIndexAsync();
    const categories = await readCategoriesAsync();

    const hiddenCategoryNames = new Set(
      categories.filter((c) => c.visible === false).map((c) => c.name)
    );

    items = items.filter(
      (item) => item.status === "published" && !hiddenCategoryNames.has(item.category)
    );

    if (featured === "true") {
      items = items.filter((item) => item.featured);
    }

    if (category) {
      const matchedCat = categories.find(
        (c) => c.name === category || c.slug === category
      );
      const targetCatName = matchedCat ? matchedCat.name : category;
      items = items.filter(
        (item) => item.category === targetCatName || item.category === category
      );
    }

    if (search) {
      items = items.filter((item) => {
        const titleText = (item.title?.[lang] || item.title?.vi || "").toLowerCase();
        const excerptText = (item.excerpt?.[lang] || item.excerpt?.vi || "").toLowerCase();
        return titleText.includes(search) || excerptText.includes(search);
      });
    }

    items.sort((a, b) => {
      const timeA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const timeB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return timeB - timeA;
    });

    return NextResponse.json({
      success: true,
      total: items.length,
      data: items,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
