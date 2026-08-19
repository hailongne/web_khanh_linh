import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "../../lib/rateLimit";
import { pool } from "../../lib/dbPool";

export type Review = {
  id: string;
  displayName: string;
  rating: number;
  content: string;
  approved: boolean;
  createdAt: string;
};

export const dynamic = "force-dynamic";

function sanitizeText(str: string): string {
  if (!str) return "";
  return str
    .replace(/<[^>]*>?/gm, "")
    .replace(/[<>'"]/g, "")
    .trim();
}

async function getReviewsFromSupabase(): Promise<Review[]> {
  try {
    const { rows } = await pool.query("SELECT value FROM public.site_settings WHERE key = 'reviews' LIMIT 1");
    return Array.isArray(rows[0]?.value) ? rows[0].value : [];
  } catch {
    return [];
  }
}

async function saveReviewsToSupabase(reviews: Review[]): Promise<void> {
  try {
    await pool.query(
      `INSERT INTO public.site_settings (key, value, updated_at)
       VALUES ('reviews', $1, NOW())
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
      [JSON.stringify(reviews)]
    );
  } catch (err) {
    console.error("Error saving reviews to Supabase:", err);
  }
}

export async function GET() {
  const allReviews: Review[] = await getReviewsFromSupabase();
  const approvedReviews = allReviews.filter((r) => r.approved === true);

  approvedReviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

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
  const clientIp = getClientIp(req);
  const rateLimit = checkRateLimit(`review:${clientIp}`, 3, 60000);
  if (!rateLimit.success) {
    return NextResponse.json(
      { success: false, error: `Bạn thao tác quá nhanh. Vui lòng thử lại sau ${rateLimit.resetInSeconds} giây.` },
      { status: 429 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Dữ liệu gửi lên không hợp lệ" }, { status: 400 });
  }

  const rawName = typeof body?.displayName === "string" ? body.displayName : "";
  const rawContent = typeof body?.content === "string" ? body.content : "";
  const rating = Number.parseInt(String(body?.rating ?? ""), 10);

  const displayName = sanitizeText(rawName);
  const content = sanitizeText(rawContent);

  if (!displayName) {
    return NextResponse.json({ success: false, error: "Vui lòng nhập tên hiển thị hợp lệ" }, { status: 400 });
  }

  if (!content) {
    return NextResponse.json({ success: false, error: "Vui lòng nhập nội dung đánh giá hợp lệ" }, { status: 400 });
  }

  if (Number.isNaN(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ success: false, error: "Số sao đánh giá phải từ 1 đến 5 sao" }, { status: 400 });
  }

  const reviews = await getReviewsFromSupabase();

  const newReview: Review = {
    id: crypto.randomUUID(),
    displayName,
    rating,
    content,
    approved: false,
    createdAt: new Date().toISOString()
  };

  reviews.push(newReview);
  await saveReviewsToSupabase(reviews);

  return NextResponse.json(
    {
      success: true,
      message: "Cảm ơn bạn. Đánh giá sẽ được kiểm duyệt trước khi hiển thị.",
      review: newReview
    },
    { status: 201 }
  );
}
