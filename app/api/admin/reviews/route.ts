import { NextResponse } from "next/server";
import { isAuthorized } from "../_lib/adminAuth";
import { pool } from "../../../lib/dbPool";

export const dynamic = "force-dynamic";

export type Review = {
  id: string;
  displayName: string;
  rating: number;
  content: string;
  approved: boolean;
  createdAt: string;
};

import { supabaseAdmin } from "../../../lib/supabase";

function unauthorizedResponse() {
  return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
}

async function getReviewsFromSupabase(): Promise<Review[]> {
  try {
    const { rows } = await pool.query("SELECT value FROM public.site_settings WHERE key = 'reviews' LIMIT 1");
    if (rows && rows[0]?.value) {
      return Array.isArray(rows[0].value) ? rows[0].value : [];
    }
  } catch (err) {
    console.error("PostgreSQL pool.query admin reviews error:", err);
  }

  try {
    const { data } = await supabaseAdmin.from("site_settings").select("value").eq("key", "reviews").limit(1);
    if (data && data[0]?.value) {
      return Array.isArray(data[0].value) ? data[0].value : [];
    }
  } catch (err) {
    console.error("SupabaseAdmin admin reviews query error:", err);
  }

  return [];
}

async function saveReviewsToSupabase(reviews: Review[]): Promise<void> {
  let saved = false;

  try {
    await pool.query(
      `INSERT INTO public.site_settings (key, value, updated_at)
       VALUES ('reviews', $1, NOW())
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
      [JSON.stringify(reviews)]
    );
    saved = true;
  } catch (err) {
    console.error("PostgreSQL pool.query admin save reviews error:", err);
  }

  if (!saved) {
    try {
      const { error } = await supabaseAdmin.from("site_settings").upsert({
        key: "reviews",
        value: reviews,
        updated_at: new Date().toISOString()
      });
      if (!error) saved = true;
    } catch (err) {
      console.error("SupabaseAdmin admin save reviews error:", err);
    }
  }

  if (!saved) {
    throw new Error("DATABASE_SAVE_REVIEWS_FAILED");
  }
}

export async function GET(req: Request) {
  try {
    if (!(await isAuthorized(req))) {
      return unauthorizedResponse();
    }

    const reviews = await getReviewsFromSupabase();
    reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({
      success: true,
      reviews
    });
  } catch (error: unknown) {
    console.error("Error in GET admin reviews:", error);
    return NextResponse.json({ success: false, error: "Lỗi tải danh sách đánh giá" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    if (!(await isAuthorized(req))) {
      return unauthorizedResponse();
    }

    let body: Record<string, unknown>;
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

    const reviews = await getReviewsFromSupabase();
    const index = reviews.findIndex((r) => r.id === id);

    if (index === -1) {
      return NextResponse.json({ success: false, error: "Không tìm thấy đánh giá" }, { status: 404 });
    }

    if (approved !== undefined) {
      reviews[index].approved = approved;
    } else {
      reviews[index].approved = !reviews[index].approved;
    }

    await saveReviewsToSupabase(reviews);

    return NextResponse.json({
      success: true,
      review: reviews[index]
    });
  } catch (error: unknown) {
    console.error("Error in PUT admin reviews:", error);
    return NextResponse.json({ success: false, error: "Lỗi cập nhật đánh giá" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
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

    const reviews = await getReviewsFromSupabase();
    const initialLength = reviews.length;
    const filtered = reviews.filter((r) => r.id !== id);

    if (filtered.length === initialLength) {
      return NextResponse.json({ success: false, error: "Không tìm thấy đánh giá cần xóa" }, { status: 404 });
    }

    await saveReviewsToSupabase(filtered);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Error in DELETE admin reviews:", error);
    return NextResponse.json({ success: false, error: "Lỗi xóa đánh giá" }, { status: 500 });
  }
}
