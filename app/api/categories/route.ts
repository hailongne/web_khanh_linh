import { NextResponse } from "next/server";
import { readCategories, createCategory, updateCategoryVisibility } from "../../lib/blogDb";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const includeHidden = searchParams.get("includeHidden") === "true";

    const allCategories = readCategories();
    const data = includeHidden
      ? allCategories
      : allCategories.filter((c) => c.visible !== false);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, description } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "Tên danh mục không được để trống." },
        { status: 400 }
      );
    }

    const result = createCategory(name, description);
    return NextResponse.json({
      success: true,
      isDuplicate: Boolean(result.isDuplicate),
      message: result.message || (result.isDuplicate ? "Danh mục này đã tồn tại." : "Tạo danh mục mới thành công."),
      data: result.data,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, slug, name, visible } = body;
    const target = id || slug || name;

    if (!target) {
      return NextResponse.json(
        { success: false, error: "Thiếu danh mục cần cập nhật." },
        { status: 400 }
      );
    }

    if (typeof visible !== "boolean") {
      return NextResponse.json(
        { success: false, error: "Trạng thái hiển thị không hợp lệ." },
        { status: 400 }
      );
    }

    const result = updateCategoryVisibility(target, visible);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.message }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  return PATCH(req);
}
