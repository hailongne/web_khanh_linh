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

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
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
    } catch (err) {
      console.error("FormData parse error:", err);
      return NextResponse.json({ success: false, error: "Dung lượng tệp quá lớn hoặc dữ liệu tải lên không hợp lệ." }, { status: 400 });
    }

    const file = formData.get("file");
    const oldPath = formData.get("oldPath")?.toString() ?? "";

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ success: false, error: "Chưa chọn tệp ảnh để tải lên." }, { status: 400 });
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

    // 1. Try Cloudinary upload if configured in Environment Variables
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET || process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (cloudName && uploadPreset) {
      try {
        const cloudFormData = new FormData();
        cloudFormData.append("file", file);
        cloudFormData.append("upload_preset", uploadPreset);

        const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: "POST",
          body: cloudFormData,
        });

        const cloudData = await cloudRes.json();
        if (cloudRes.ok && cloudData.secure_url) {
          return NextResponse.json({ success: true, path: cloudData.secure_url });
        }
      } catch (err) {
        console.error("Cloudinary upload error, falling back:", err);
      }
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

    // 2. Try writing file to local disk (works on VPS / Local)
    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      await fs.writeFile(targetPath, buffer);

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
    } catch {
      // 3. Fallback for Read-Only Filesystem (Vercel): Convert to Base64 Data URI
      try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const base64Data = buffer.toString("base64");
        const mimeType = file.type || "image/jpeg";
        const dataUrl = `data:${mimeType};base64,${base64Data}`;
        return NextResponse.json({ success: true, path: dataUrl });
      } catch (err) {
        console.error("Base64 conversion error:", err);
        return NextResponse.json({ success: false, error: "Không thể xử lý tệp ảnh này." }, { status: 500 });
      }
    }
  } catch (error: unknown) {
    console.error("Critical error in upload POST:", error);
    const errorMsg = error instanceof Error ? error.message : "Lỗi hệ thống khi tải ảnh lên.";
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    if (!(await isAuthorized(req))) {
      return unauthorizedResponse();
    }

    const url = new URL(req.url);
    const imagePath = url.searchParams.get("path")?.trim() ?? "";

    if (!imagePath) {
      return NextResponse.json({ success: false, error: "Missing image path" }, { status: 400 });
    }

    // Base64 Data URIs or external Cloudinary URLs do not need file deletion
    if (imagePath.startsWith("data:") || imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return NextResponse.json({ success: true });
    }

    const normalized = imagePath.replace(/\\/g, "/").replace(/^\/+/, "");
    if (!normalized.startsWith("images/") || normalized.includes("..")) {
      return NextResponse.json({ success: false, error: "Invalid image path" }, { status: 400 });
    }

    const publicRoot = path.resolve(process.cwd(), "public");
    const absolutePath = path.resolve(publicRoot, normalized);

    if (absolutePath.startsWith(path.join(publicRoot, "images"))) {
      try {
        await fs.unlink(absolutePath);
      } catch (error: unknown) {
        // Silently catch EROFS (read-only filesystem) or ENOENT (file missing)
        console.warn("Notice: File unlink skipped on serverless/read-only filesystem:", error);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Error in upload DELETE route:", error);
    return NextResponse.json({ success: true });
  }
}
