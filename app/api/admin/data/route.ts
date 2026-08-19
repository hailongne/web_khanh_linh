import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAuthorized } from "../_lib/adminAuth";
import { pool } from "../../../lib/dbPool";

const VALID_TYPES = ["vehicles", "pricing", "sales", "testimonials", "faq"] as const;
type DataType = (typeof VALID_TYPES)[number];

export const dynamic = "force-dynamic";

function unauthorizedResponse() {
  return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
}

function getType(url: URL): DataType | null {
  const type = url.searchParams.get("type")?.trim() as DataType;
  return VALID_TYPES.includes(type) ? type : null;
}

function getLang(url: URL): string {
  return url.searchParams.get("lang")?.trim() || "vi";
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const type = getType(url);
    if (!type) {
      return NextResponse.json({ success: false, error: "Invalid or missing type" }, { status: 400 });
    }

    if (type === "sales") {
      const { rows } = await pool.query("SELECT value FROM public.site_settings WHERE key = 'sales' LIMIT 1");
      const items = Array.isArray(rows[0]?.value) ? rows[0].value : [];
      return NextResponse.json({ success: true, items });
    }

    if (type === "vehicles") {
      const lang = getLang(url);
      const { rows } = await pool.query("SELECT * FROM public.vehicles WHERE lang = $1 ORDER BY id ASC", [lang]);
      const items = (rows || []).map((r) => ({
        id: r.id,
        name: r.name,
        badge: r.badge || "",
        price: r.price || "",
        image: r.image || "",
        specs: r.specs || []
      }));
      return NextResponse.json({ success: true, items });
    }

    const lang = getLang(url);
    const { rows } = await pool.query("SELECT value FROM public.site_settings WHERE key = $1 LIMIT 1", [type]);
    const valObj = (rows[0]?.value || {}) as Record<string, unknown>;
    return NextResponse.json({ success: true, data: valObj[lang] ?? null });
  } catch (error: unknown) {
    console.error("GET data error:", error);
    return NextResponse.json({ success: false, error: "Lỗi tải dữ liệu" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    if (!(await isAuthorized(req))) {
      return unauthorizedResponse();
    }

    const url = new URL(req.url);
    const type = getType(url);
    if (!type) {
      return NextResponse.json({ success: false, error: "Invalid or missing type" }, { status: 400 });
    }

    let payload: Record<string, unknown>;
    try {
      payload = (await req.json()) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
    }

    if (type === "sales") {
      const { rows } = await pool.query("SELECT value FROM public.site_settings WHERE key = 'sales' LIMIT 1");
      const items = Array.isArray(rows[0]?.value) ? rows[0].value : [];
      const newItem = { ...payload, id: (payload?.id as string) || crypto.randomUUID() };
      const updated = [...items, newItem];

      await pool.query(
        `INSERT INTO public.site_settings (key, value, updated_at)
         VALUES ('sales', $1, NOW())
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
        [JSON.stringify(updated)]
      );

      try { revalidatePath("/"); } catch {}
      return NextResponse.json({ success: true, item: newItem }, { status: 201 });
    }

    if (type === "vehicles") {
      const lang = getLang(url);
      const newId = (payload?.id as string) || String(Date.now());
      const newItem = {
        id: newId,
        lang,
        name: String(payload.name || ""),
        badge: String(payload.badge || ""),
        price: String(payload.price || ""),
        image: String(payload.image || ""),
        specs: payload.specs || []
      };

      await pool.query(
        `INSERT INTO public.vehicles (id, lang, name, badge, price, image, specs, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
         ON CONFLICT (id, lang) DO UPDATE SET
           name = EXCLUDED.name,
           badge = EXCLUDED.badge,
           price = EXCLUDED.price,
           image = EXCLUDED.image,
           specs = EXCLUDED.specs`,
        [newItem.id, newItem.lang, newItem.name, newItem.badge, newItem.price, newItem.image, JSON.stringify(newItem.specs)]
      );

      try { revalidatePath("/"); } catch {}
      return NextResponse.json({ success: true, item: newItem }, { status: 201 });
    }

    return NextResponse.json({ success: false, error: "POST not supported for this type" }, { status: 400 });
  } catch (error: unknown) {
    console.error("POST admin data error:", error);
    return NextResponse.json({ success: false, error: "Lỗi thêm dữ liệu" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    if (!(await isAuthorized(req))) {
      return unauthorizedResponse();
    }

    const url = new URL(req.url);
    const type = getType(url);
    if (!type) {
      return NextResponse.json({ success: false, error: "Invalid or missing type" }, { status: 400 });
    }

    let payload: Record<string, unknown>;
    try {
      payload = (await req.json()) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
    }

    if (type === "sales") {
      const id = url.searchParams.get("id")?.trim();
      const { rows } = await pool.query("SELECT value FROM public.site_settings WHERE key = 'sales' LIMIT 1");
      let items = Array.isArray(rows[0]?.value) ? rows[0].value : [];
      const updatedItem = { ...payload, id: id || (payload.id as string) || crypto.randomUUID() };
      
      const idx = items.findIndex((i: any) => String(i.id) === String(updatedItem.id));
      if (idx !== -1) {
        items[idx] = updatedItem;
      } else {
        items.push(updatedItem);
      }

      await pool.query(
        `INSERT INTO public.site_settings (key, value, updated_at)
         VALUES ('sales', $1, NOW())
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
        [JSON.stringify(items)]
      );

      try { revalidatePath("/"); } catch {}
      return NextResponse.json({ success: true, item: updatedItem });
    }

    if (type === "vehicles") {
      const lang = getLang(url);
      const id = url.searchParams.get("id")?.trim() || String(payload.id);
      const updatedItem = {
        id,
        lang,
        name: String(payload.name || ""),
        badge: String(payload.badge || ""),
        price: String(payload.price || ""),
        image: String(payload.image || ""),
        specs: payload.specs || []
      };

      await pool.query(
        `INSERT INTO public.vehicles (id, lang, name, badge, price, image, specs, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
         ON CONFLICT (id, lang) DO UPDATE SET
           name = EXCLUDED.name,
           badge = EXCLUDED.badge,
           price = EXCLUDED.price,
           image = EXCLUDED.image,
           specs = EXCLUDED.specs`,
        [updatedItem.id, updatedItem.lang, updatedItem.name, updatedItem.badge, updatedItem.price, updatedItem.image, JSON.stringify(updatedItem.specs)]
      );

      try { revalidatePath("/"); } catch {}
      return NextResponse.json({ success: true, item: updatedItem });
    }

    if (type === "pricing" || type === "testimonials" || type === "faq") {
      const lang = getLang(url);
      const { rows } = await pool.query("SELECT value FROM public.site_settings WHERE key = $1 LIMIT 1", [type]);
      const valObj = (rows[0]?.value || {}) as Record<string, unknown>;

      if (lang === "all" && typeof payload === "object" && payload !== null) {
        Object.assign(valObj, payload);
      } else {
        valObj[lang] = payload;
      }

      await pool.query(
        `INSERT INTO public.site_settings (key, value, updated_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
        [type, JSON.stringify(valObj)]
      );

      try { revalidatePath("/"); } catch {}
      return NextResponse.json({ success: true, data: payload });
    }

    return NextResponse.json({ success: false, error: "Unsupported type" }, { status: 400 });
  } catch (error: unknown) {
    console.error("PUT admin data error:", error);
    return NextResponse.json({ success: false, error: "Lỗi cập nhật dữ liệu" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    if (!(await isAuthorized(req))) {
      return unauthorizedResponse();
    }

    const url = new URL(req.url);
    const type = getType(url);
    if (!type) {
      return NextResponse.json({ success: false, error: "Invalid or missing type" }, { status: 400 });
    }

    if (type !== "sales" && type !== "vehicles") {
      return NextResponse.json({ success: false, error: "DELETE only supported for sales and vehicles" }, { status: 400 });
    }

    const id = url.searchParams.get("id")?.trim();
    if (!id) {
      return NextResponse.json({ success: false, error: "Missing id" }, { status: 400 });
    }

    if (type === "sales") {
      const { rows } = await pool.query("SELECT value FROM public.site_settings WHERE key = 'sales' LIMIT 1");
      let items = Array.isArray(rows[0]?.value) ? rows[0].value : [];
      items = items.filter((i: any) => String(i.id) !== id);

      await pool.query(
        `INSERT INTO public.site_settings (key, value, updated_at)
         VALUES ('sales', $1, NOW())
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
        [JSON.stringify(items)]
      );
    } else if (type === "vehicles") {
      const lang = getLang(url);
      await pool.query("DELETE FROM public.vehicles WHERE id = $1 AND lang = $2", [id, lang]);
    }

    try { revalidatePath("/"); } catch {}
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("DELETE admin data error:", error);
    return NextResponse.json({ success: false, error: "Lỗi xóa dữ liệu" }, { status: 500 });
  }
}
