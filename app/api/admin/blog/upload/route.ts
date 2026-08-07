import { NextResponse } from "next/server";
import { isAuthorized } from "../../_lib/adminAuth";
import fs from "node:fs";
import path from "node:path";

const IMAGES_DIR = path.join(process.cwd(), "public", "images", "news");

export async function POST(req: Request) {
  const authorized = await isAuthorized(req);
  if (!authorized) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: "Không có file ảnh nào được chọn." }, { status: 400 });
    }

    const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];
    const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit

    const ext = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext) || !ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
      return NextResponse.json(
        { success: false, error: "Định dạng file không được hỗ trợ. Chỉ chấp nhận JPG, JPEG, PNG, WEBP." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: "Dung lượng file vượt quá giới hạn 10MB." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    try {
      if (!fs.existsSync(IMAGES_DIR)) {
        fs.mkdirSync(IMAGES_DIR, { recursive: true });
      }
    } catch {
      // Safe fallback on read-only filesystem
    }

    const cleanName = path
      .basename(file.name, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-");

    const fileName = `news-${Date.now()}-${cleanName}${ext}`;
    const filePath = path.resolve(IMAGES_DIR, fileName);

    // Path traversal check
    if (!filePath.startsWith(path.resolve(IMAGES_DIR))) {
      return NextResponse.json({ success: false, error: "Đường dẫn file không an toàn." }, { status: 400 });
    }

    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/images/news/${fileName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
