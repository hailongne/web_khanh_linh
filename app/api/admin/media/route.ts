import { NextResponse } from "next/server";
import path from "node:path";
import { getAuthenticatedAccount } from "../_lib/adminAuth";
import { supabase } from "../../../lib/supabase";

export const dynamic = "force-dynamic";

export type MediaFile = {
  name: string;
  url: string;
  size: number;
  folder: string;
  createdAt: string;
};

const SYSTEM_STATIC_FILES = [
  "logoKhanhLinh.png",
  "logoKhanhLinhFull.png",
  "logo3D.png",
  "phone.png",
  "zalo.png",
  "banner.png",
  "banner+.png",
  "mobile.png",
  "_mobile.png"
];

function classifyFile(fileName: string, rawFolder: string): string {
  if (SYSTEM_STATIC_FILES.includes(fileName) || fileName.startsWith("no-avt")) {
    return "system";
  }

  const lower = fileName.toLowerCase();
  if (lower.includes("avt") || lower.includes("avatar") || lower.startsWith("hieu-") || lower.startsWith("2-1787")) {
    return "avatar";
  }

  if (
    lower.startsWith("kia_") ||
    lower.startsWith("toyota_") ||
    lower.startsWith("ford_") ||
    lower.startsWith("hyundai_") ||
    lower.startsWith("thaco_") ||
    lower.startsWith("tracomeco_") ||
    lower.startsWith("haeco_")
  ) {
    return "fleet";
  }

  if (rawFolder === "uploads/blog") return "blog";
  if (rawFolder === "images/news") return "news";
  if (rawFolder === "images") return "images";
  return "uploads";
}

export async function GET(req: Request) {
  const account = await getAuthenticatedAccount(req);
  if (!account || !account.active) {
    return NextResponse.json({ success: false, error: "401 Unauthorized" }, { status: 401 });
  }

  try {
    const folders = ["uploads", "uploads/blog", "images", "images/news"];
    const mediaList: MediaFile[] = [];

    for (const folder of folders) {
      const { data: files, error } = await supabase.storage.from("media").list(folder, {
        limit: 100,
        sortBy: { column: "created_at", order: "desc" }
      });

      if (!error && files) {
        for (const file of files) {
          // Ignore system hidden files like .gitkeep or .DS_Store
          if (file.id && file.name && !file.name.startsWith(".")) {
            const filePath = `${folder}/${file.name}`;
            const { data: publicUrlData } = supabase.storage.from("media").getPublicUrl(filePath);
            const folderCategory = classifyFile(file.name, folder);
            
            mediaList.push({
              name: file.name,
              url: publicUrlData.publicUrl,
              size: file.metadata?.size || 0,
              folder: folderCategory,
              createdAt: file.created_at || new Date().toISOString()
            });
          }
        }
      }
    }

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
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const category = (formData.get("category") as string) || "blog";

    if (!file) {
      return NextResponse.json({ success: false, error: "Vui lòng chọn tệp hình ảnh." }, { status: 400 });
    }

    const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".svg", ".gif"];
    const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/svg+xml", "image/gif"];
    const MAX_FILE_SIZE = 10 * 1024 * 1024;

    const ext = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext) || !ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
      return NextResponse.json(
        { success: false, error: "Định dạng tệp không được hỗ trợ. Chỉ chấp nhận JPG, JPEG, PNG, WEBP, SVG, GIF." },
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

    const baseName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, "_");
    const uniqueFileName = `${baseName}_${Date.now()}${ext}`;
    const sanitizedCategory = category.replace(/[^a-zA-Z0-9_-]/g, "");
    
    let folderPrefix = `uploads/${sanitizedCategory}`;
    if (sanitizedCategory === "news") folderPrefix = "images/news";
    else if (sanitizedCategory === "fleet" || sanitizedCategory === "avatar") folderPrefix = "images";

    const storagePath = `${folderPrefix}/${uniqueFileName}`;

    const { error } = await supabase.storage.from("media").upload(storagePath, buffer, {
      contentType: file.type || "image/jpeg",
      upsert: true
    });

    if (error) {
      console.error("Supabase Storage upload error:", error);
      return NextResponse.json({ success: false, error: `Upload thất bại: ${error.message}` }, { status: 500 });
    }

    const { data: publicUrlData } = supabase.storage.from("media").getPublicUrl(storagePath);

    return NextResponse.json({
      success: true,
      message: "Tải ảnh lên Supabase Storage thành công.",
      url: publicUrlData.publicUrl,
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

    let relativePath = urlPath;
    if (urlPath.includes("/storage/v1/object/public/media/")) {
      relativePath = urlPath.split("/storage/v1/object/public/media/")[1];
    } else {
      relativePath = urlPath.replace(/^\/+/, "");
    }

    if (relativePath) {
      await supabase.storage.from("media").remove([relativePath]);
    }

    return NextResponse.json({ success: true, message: "Đã xóa tệp media thành công." });
  } catch (error: unknown) {
    console.error("Error in media DELETE:", error);
    return NextResponse.json({ success: true, message: "Đã xóa tệp media thành công." });
  }
}
