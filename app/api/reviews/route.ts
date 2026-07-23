import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";

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

export async function GET() {
  const db = readDb();
  const allReviews: Review[] = Array.isArray(db.reviews) ? db.reviews : [];

  // Filter approved reviews only
  const approvedReviews = allReviews.filter((r) => r.approved === true);

  // Sort newest first
  approvedReviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Calculate statistics
  const totalReviews = approvedReviews.length;
  const ratingBreakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let sumRating = 0;

  approvedReviews.forEach((r) => {
    const num = Math.min(5, Math.max(1, Math.round(r.rating)));
    ratingBreakdown[num as 1 | 2 | 3 | 4 | 5] = (ratingBreakdown[num as 1 | 2 | 3 | 4 | 5] || 0) + 1;
    sumRating += r.rating;
  });

  const averageRating = totalReviews > 0 ? Number((sumRating / totalReviews).toFixed(1)) : 0;

  return NextResponse.json({
    success: true,
    reviews: approvedReviews,
    stats: {
      totalReviews,
      averageRating,
      ratingBreakdown
    }
  });
}

export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Dữ liệu gửi lên không hợp lệ" }, { status: 400 });
  }

  const displayName = typeof body?.displayName === "string" ? body.displayName.trim() : "";
  const content = typeof body?.content === "string" ? body.content.trim() : "";
  const rating = Number.parseInt(body?.rating, 10);

  if (!displayName) {
    return NextResponse.json({ success: false, error: "Vui lòng nhập tên hiển thị" }, { status: 400 });
  }

  if (!content) {
    return NextResponse.json({ success: false, error: "Vui lòng nhập nội dung đánh giá" }, { status: 400 });
  }

  if (Number.isNaN(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ success: false, error: "Số sao đánh giá phải từ 1 đến 5 sao" }, { status: 400 });
  }

  const db = readDb();
  if (!Array.isArray(db.reviews)) {
    db.reviews = [];
  }

  const newReview: Review = {
    id: crypto.randomUUID(),
    displayName,
    rating,
    content,
    approved: false,
    createdAt: new Date().toISOString()
  };

  db.reviews.push(newReview);
  writeDb(db);

  return NextResponse.json(
    {
      success: true,
      message: "Cảm ơn bạn. Đánh giá sẽ được kiểm duyệt trước khi hiển thị.",
      review: newReview
    },
    { status: 201 }
  );
}
