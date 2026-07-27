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

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (!fs.existsSync(IMAGES_DIR)) {
      fs.mkdirSync(IMAGES_DIR, { recursive: true });
    }

    const ext = path.extname(file.name).toLowerCase() || ".png";
    const cleanName = path
      .basename(file.name, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-");

    const fileName = `news-${Date.now()}-${cleanName}${ext}`;
    const filePath = path.join(IMAGES_DIR, fileName);

    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/images/news/${fileName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
