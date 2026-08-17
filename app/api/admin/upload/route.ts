import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { isAuthorized } from "../_lib/adminAuth";
import { checkRateLimit, getClientIp } from "../../../lib/rateLimit";

function unauthorizedResponse() {
  return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
}

function sanitizeFileName(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
}

async function ensureDirectoryExists(dirPath: string) {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch {
    // ignore
  }
}

export async function POST(req: Request) {
  if (!(await isAuthorized(req))) {
    return unauthorizedResponse();
  }

  // Rate limiting (max 10 uploads per minute per IP)
  const clientIp = getClientIp(req);
  const rateLimit = checkRateLimit(`upload:${clientIp}`, 10, 60000);
  if (!rateLimit.success) {
    return NextResponse.json(
      { success: false, error: `Tải tệp quá nhanh. Vui lòng thử lại sau ${rateLimit.resetInSeconds} giây.` },
      { status: 429 }
    );
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file");
  const oldPath = formData.get("oldPath")?.toString() ?? "";

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ success: false, error: "No image file uploaded" }, { status: 400 });
  }

  const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];
  const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit

  const extensionMatch = file.name.match(/\.[a-zA-Z0-9]+$/);
  const extension = extensionMatch ? extensionMatch[0].toLowerCase() : "";

  if (!ALLOWED_EXTENSIONS.includes(extension) || !ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
    return NextResponse.json(
      { success: false, error: "Định dạng tệp không hợp lệ. Chỉ chấp nhận JPG, JPEG, PNG, WEBP." },
      { status: 400 }
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { success: false, error: "Dung lượng tệp không được vượt quá 10MB." },
      { status: 400 }
    );
  }

  const safeBaseName = sanitizeFileName(file.name.replace(/\.[a-zA-Z0-9]+$/, "")) || "image";
  const fileName = `${safeBaseName}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${extension}`;
  const imagesFolder = path.resolve(process.cwd(), "public", "images");
  const targetPath = path.resolve(imagesFolder, fileName);

  // Path Traversal Protection
  if (!targetPath.startsWith(imagesFolder)) {
    return NextResponse.json({ success: false, error: "Đường dẫn tệp không an toàn." }, { status: 400 });
  }

  await ensureDirectoryExists(imagesFolder);

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(targetPath, buffer);
  } catch {
    return NextResponse.json({ success: false, error: "Unable to save uploaded file" }, { status: 500 });
  }

  if (oldPath) {
    const normalizedOld = oldPath.replace(/\\/g, "/").replace(/^\/+/, "");
    if (normalizedOld.startsWith("images/")) {
      const publicRoot = path.resolve(process.cwd(), "public");
      const oldFilePath = path.resolve(publicRoot, normalizedOld);
      if (oldFilePath.startsWith(path.join(publicRoot, "images"))) {
        try {
          await fs.unlink(oldFilePath);
        } catch {
          // ignore deletion errors
        }
      }
    }
  }

  return NextResponse.json({ success: true, path: `/images/${fileName}` });
}

export async function DELETE(req: Request) {
  if (!(await isAuthorized(req))) {
    return unauthorizedResponse();
  }

  const url = new URL(req.url);
  const imagePath = url.searchParams.get("path")?.trim() ?? "";

  if (!imagePath) {
    return NextResponse.json({ success: false, error: "Missing image path" }, { status: 400 });
  }

  const normalized = imagePath.replace(/\\/g, "/").replace(/^\/+/, "");
  if (!normalized.startsWith("images/") || normalized.includes("..")) {
    return NextResponse.json({ success: false, error: "Invalid image path" }, { status: 400 });
  }

  const publicRoot = path.resolve(process.cwd(), "public");
  const absolutePath = path.resolve(publicRoot, normalized);

  if (!absolutePath.startsWith(path.join(publicRoot, "images"))) {
    return NextResponse.json({ success: false, error: "Đường dẫn xóa tệp không hợp lệ." }, { status: 400 });
  }

  try {
    await fs.unlink(absolutePath);
  } catch (error: unknown) {
    const errCode = (error as { code?: string })?.code;
    if (errCode !== "ENOENT") {
      return NextResponse.json({ success: false, error: "Unable to delete image file" }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}
