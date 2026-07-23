import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { isAuthorized } from "../_lib/adminAuth";

const DB_PATH = path.join(process.cwd(), "db.json");

export type Review = {
  id: string;
  displayName: string;
  rating: number;
  content: string;
  approved: boolean;
  createdAt: string;
};

type DbShape = Record<string, any> & {
  reviews?: Review[];
};

function readDb(): DbShape {
  try {
    const raw = fs.readFileSync(DB_PATH, "utf-8");
    return JSON.parse(raw) as DbShape;
  } catch {
    return { reviews: [] };
  }
}

function writeDb(data: DbShape): void {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
}

function unauthorizedResponse() {
  return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
}

export async function GET(req: Request) {
  if (!(await isAuthorized(req))) {
    return unauthorizedResponse();
  }

  const db = readDb();
  const reviews: Review[] = Array.isArray(db.reviews) ? db.reviews : [];

  // Sort newest first
  reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return NextResponse.json({
    success: true,
    reviews
  });
}

export async function PUT(req: Request) {
  if (!(await isAuthorized(req))) {
    return unauthorizedResponse();
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON payload" }, { status: 400 });
  }

  const url = new URL(req.url);
  const id = (body?.id || url.searchParams.get("id"))?.toString().trim();
  const approved = typeof body?.approved === "boolean" ? body.approved : undefined;

  if (!id) {
    return NextResponse.json({ success: false, error: "Thiếu ID đánh giá" }, { status: 400 });
  }

  const db = readDb();
  const reviews = Array.isArray(db.reviews) ? db.reviews : [];
  const index = reviews.findIndex((r) => r.id === id);

  if (index === -1) {
    return NextResponse.json({ success: false, error: "Không tìm thấy đánh giá" }, { status: 404 });
  }

  if (approved !== undefined) {
    reviews[index].approved = approved;
  } else {
    reviews[index].approved = !reviews[index].approved;
  }

  db.reviews = reviews;
  writeDb(db);

  return NextResponse.json({
    success: true,
    review: reviews[index]
  });
}

export async function DELETE(req: Request) {
  if (!(await isAuthorized(req))) {
    return unauthorizedResponse();
  }

  const url = new URL(req.url);
  let id = url.searchParams.get("id")?.trim();

  if (!id) {
    try {
      const body = await req.json();
      id = body?.id?.toString().trim();
    } catch {
      // noop
    }
  }

  if (!id) {
    return NextResponse.json({ success: false, error: "Thiếu ID đánh giá" }, { status: 400 });
  }

  const db = readDb();
  const reviews = Array.isArray(db.reviews) ? db.reviews : [];
  const initialLength = reviews.length;
  const filtered = reviews.filter((r) => r.id !== id);

  if (filtered.length === initialLength) {
    return NextResponse.json({ success: false, error: "Không tìm thấy đánh giá cần xóa" }, { status: 404 });
  }

  db.reviews = filtered;
  writeDb(db);

  return NextResponse.json({ success: true });
}
