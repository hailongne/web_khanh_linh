import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

const DEFAULT_ADMIN_USERNAME = "adminKhanhLinhTrans";
const DEFAULT_ADMIN_PASSWORD = "KhanhLinh2026!";

function isAuthorized(req: Request): boolean {
  const username = req.headers.get("x-admin-username")?.trim();
  const password = req.headers.get("x-admin-password")?.trim();
  const expectedUsername = process.env.ADMIN_USERNAME?.trim() || DEFAULT_ADMIN_USERNAME;
  const expectedPassword = process.env.ADMIN_PASSWORD?.trim() || DEFAULT_ADMIN_PASSWORD;
  return Boolean(username) && username === expectedUsername && Boolean(password) && password === expectedPassword;
}

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
  if (!isAuthorized(req)) {
    return unauthorizedResponse();
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

  const originalName = sanitizeFileName(file.name || "upload.png");
  const extensionMatch = originalName.match(/\.[a-zA-Z0-9]+$/);
  const extension = extensionMatch ? extensionMatch[0] : ".png";
  const safeBaseName = sanitizeFileName(originalName.replace(/\.[a-zA-Z0-9]+$/, "")) || "vehicle-image";
  const fileName = `${safeBaseName}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${extension}`;
  const imagesFolder = path.join(process.cwd(), "public", "images");
  const targetPath = path.join(imagesFolder, fileName);

  await ensureDirectoryExists(imagesFolder);

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(targetPath, buffer);
  } catch (error) {
    return NextResponse.json({ success: false, error: "Unable to save uploaded file" }, { status: 500 });
  }

  if (oldPath) {
    const normalizedOld = oldPath.startsWith("/") ? oldPath.slice(1) : oldPath;
    if (normalizedOld.startsWith("images/")) {
      const oldFilePath = path.join(process.cwd(), "public", normalizedOld);
      try {
        await fs.unlink(oldFilePath);
      } catch {
        // ignore deletion errors
      }
    }
  }

  return NextResponse.json({ success: true, path: `/images/${fileName}` });
}
