import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { getAuthenticatedAccount } from "../_lib/adminAuth";

export const dynamic = "force-dynamic";

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");
const NEWS_IMAGES_DIR = path.join(process.cwd(), "public", "images", "news");

function ensureMediaDirs() {
  try {
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }
    const blogUploads = path.join(UPLOADS_DIR, "blog");
    if (!fs.existsSync(blogUploads)) {
      fs.mkdirSync(blogUploads, { recursive: true });
    }
    if (!fs.existsSync(NEWS_IMAGES_DIR)) {
      fs.mkdirSync(NEWS_IMAGES_DIR, { recursive: true });
    }
  } catch (err) {
    console.warn("Notice: Cannot create media dirs on read-only filesystem:", err);
  }
}

export type MediaFile = {
  name: string;
  url: string;
  size: number;
  folder: string;
  createdAt: string;
};

function scanFolder(dirPath: string, folderName: string, urlPrefix: string): MediaFile[] {
  if (!fs.existsSync(dirPath)) return [];
  try {
    const files = fs.readdirSync(dirPath);
    return files
      .filter((file) => !file.startsWith("."))
      .map((file) => {
        const fullPath = path.join(dirPath, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) return null;
        return {
          name: file,
          url: `${urlPrefix}/${file}`,
          size: stat.size,
          folder: folderName,
          createdAt: stat.birthtime ? stat.birthtime.toISOString() : stat.mtime.toISOString()
        };
      })
      .filter(Boolean) as MediaFile[];
  } catch (err) {
    console.error(`Error scanning folder ${dirPath}:`, err);
    return [];
  }
}

export async function GET(req: Request) {
  const account = await getAuthenticatedAccount(req);
  if (!account || !account.active) {
    return NextResponse.json({ success: false, error: "401 Unauthorized" }, { status: 401 });
  }

  try {
    ensureMediaDirs();
    const blogUploads = path.join(UPLOADS_DIR, "blog");

    const mediaList: MediaFile[] = [
      ...scanFolder(blogUploads, "blog", "/uploads/blog"),
      ...scanFolder(NEWS_IMAGES_DIR, "news", "/images/news"),
      ...scanFolder(UPLOADS_DIR, "uploads", "/uploads")
    ];

    // Sort newest first
    mediaList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ success: true, data: mediaList });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const account = await getAuthenticatedAccount(req);
  if (!account || !account.active) {
    return NextResponse.json({ success: false, error: "401 Unauthorized" }, { status: 401 });
  }

  try {
    ensureMediaDirs();
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const category = (formData.get("category") as string) || "blog";

    if (!file) {
      return NextResponse.json({ success: false, error: "Vui lòng chọn tệp hình ảnh." }, { status: 400 });
    }

    const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];
    const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit

    const ext = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext) || !ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
      return NextResponse.json(
        { success: false, error: "Định dạng tệp không được hỗ trợ. Chỉ chấp nhận JPG, JPEG, PNG, WEBP." },
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

    // Clean file name
    const baseName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, "_");
    const uniqueFileName = `${baseName}_${Date.now()}${ext}`;

    const sanitizedCategory = category.replace(/[^a-zA-Z0-9_-]/g, "");
    const targetDir = sanitizedCategory === "news" ? NEWS_IMAGES_DIR : path.join(UPLOADS_DIR, sanitizedCategory);
    
    try {
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
    } catch {
      // Safe fallback for read-only filesystem
    }

    const savePath = path.resolve(targetDir, uniqueFileName);

    // Path Traversal Security Check
    const publicRoot = path.resolve(process.cwd(), "public");
    if (!savePath.startsWith(publicRoot)) {
      return NextResponse.json({ success: false, error: "Đường dẫn lưu file không an toàn." }, { status: 400 });
    }

    fs.writeFileSync(savePath, buffer);

    const publicUrl = sanitizedCategory === "news" ? `/images/news/${uniqueFileName}` : `/uploads/${sanitizedCategory}/${uniqueFileName}`;

    return NextResponse.json({
      success: true,
      message: "Tải ảnh lên thành công.",
      url: publicUrl,
      fileName: uniqueFileName
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const account = await getAuthenticatedAccount(req);
  if (!account || !account.active) {
    return NextResponse.json({ success: false, error: "401 Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const urlPath = searchParams.get("url");

    if (!urlPath) {
      return NextResponse.json({ success: false, error: "Thiếu đường dẫn tệp ảnh (url)." }, { status: 400 });
    }

    // Safety check path traversal
    const cleanUrlPath = urlPath.replace(/\\/g, "/").replace(/^\/+/, "");
    const publicRoot = path.resolve(process.cwd(), "public");
    const fullPath = path.resolve(publicRoot, cleanUrlPath);

    if (!fullPath.startsWith(publicRoot)) {
      return NextResponse.json({ success: false, error: "Đường dẫn tệp không hợp lệ." }, { status: 400 });
    }

    const relativePath = path.relative(publicRoot, fullPath).replace(/\\/g, "/");
    if (!relativePath.startsWith("uploads/") && !relativePath.startsWith("images/news/")) {
      return NextResponse.json({ success: false, error: "Chỉ được phép xóa file trong thư mục media." }, { status: 400 });
    }

    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      return NextResponse.json({ success: true, message: "Đã xóa tệp media thành công." });
    } else {
      return NextResponse.json({ success: false, error: "Tệp không tồn tại." }, { status: 404 });
    }
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
