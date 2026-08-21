import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAuthorized } from "../_lib/adminAuth";
import { pool } from "../../../lib/dbPool";

type Spec = {
  label: string;
  icon: string;
};

type Vehicle = {
  id: string;
  name: string;
  badge: string;
  price: string;
  image: string;
  specs: Spec[];
};

export const dynamic = "force-dynamic";

function getLang(url: URL): string {
  return url.searchParams.get("lang")?.trim() || "vi";
}

function normalizeSpecs(input: unknown): Spec[] {
  if (!Array.isArray(input)) {
    return [];
  }

  return input
    .map((item) => {
      if (typeof item === "string") {
        const label = item.trim();
        return label ? { label, icon: "seat" } : null;
      }

      if (!item || typeof item !== "object") {
        return null;
      }

      const label = typeof item.label === "string" ? item.label.trim() : "";
      const icon = typeof item.icon === "string" && item.icon.trim() ? item.icon.trim() : "seat";

      return label ? { label, icon } : null;
    })
    .filter((item): item is Spec => item !== null);
}

function validateVehiclePayload(payload: unknown): { ok: true; data: Omit<Vehicle, "id"> } | { ok: false; error: string } {
  if (!payload || typeof payload !== "object") {
    return { ok: false, error: "Request body must be an object" };
  }

  const record = payload as Record<string, unknown>;
  const name = typeof record.name === "string" ? record.name.trim() : "";
  const badge = typeof record.badge === "string" ? record.badge.trim() : "";
  const price = typeof record.price === "string" ? record.price.trim() : "";
  const image = typeof record.image === "string" ? record.image.trim() : "";
  const specs = normalizeSpecs(record.specs);

  if (!name || !badge || !price || !image) {
    return { ok: false, error: "name, badge, price and image are required" };
  }

  return {
    ok: true,
    data: {
      name,
      badge,
      price,
      image,
      specs
    }
  };
}

function unauthorizedResponse() {
  return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
}

import { supabaseAdmin } from "../../../lib/supabase";

export async function GET(req: Request) {
  if (!(await isAuthorized(req))) {
    return unauthorizedResponse();
  }

  const url = new URL(req.url);
  const lang = getLang(url);

  let rows: any[] = [];
  try {
    const res = await pool.query("SELECT * FROM public.vehicles WHERE lang = $1 ORDER BY id ASC", [lang]);
    rows = res.rows || [];
  } catch (err) {
    console.error("PostgreSQL pool.query admin vehicles error:", err);
    try {
      const { data } = await supabaseAdmin.from("vehicles").select("*").eq("lang", lang).order("id", { ascending: true });
      rows = data || [];
    } catch (e) {
      console.error("SupabaseAdmin vehicles GET error:", e);
    }
  }

  const items: Vehicle[] = (rows || []).map((r) => ({
    id: r.id,
    name: r.name,
    badge: r.badge || "",
    price: r.price || "",
    image: r.image || "",
    specs: r.specs || []
  }));

  return NextResponse.json({ success: true, items });
}

export async function POST(req: Request) {
  if (!(await isAuthorized(req))) {
    return unauthorizedResponse();
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const validated = validateVehiclePayload(payload);
  if (!validated.ok) {
    return NextResponse.json({ success: false, error: validated.error }, { status: 400 });
  }

  const url = new URL(req.url);
  const lang = getLang(url);
  const newId = String(Date.now());

  const newItem: Vehicle = { id: newId, ...validated.data };

  let saved = false;
  try {
    await pool.query(
      `INSERT INTO public.vehicles (id, lang, name, badge, price, image, specs, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       ON CONFLICT (id, lang) DO UPDATE SET
         name = EXCLUDED.name,
         badge = EXCLUDED.badge,
         price = EXCLUDED.price,
         image = EXCLUDED.image,
         specs = EXCLUDED.specs`,
      [newItem.id, lang, newItem.name, newItem.badge, newItem.price, newItem.image, JSON.stringify(newItem.specs)]
    );
    saved = true;
  } catch (err) {
    console.error("PostgreSQL pool.query vehicle POST error:", err);
  }

  if (!saved) {
    try {
      const { error } = await supabaseAdmin.from("vehicles").upsert({
        id: newItem.id,
        lang,
        name: newItem.name,
        badge: newItem.badge,
        price: newItem.price,
        image: newItem.image,
        specs: newItem.specs,
        created_at: new Date().toISOString()
      });
      if (!error) saved = true;
    } catch (e) {
      console.error("SupabaseAdmin vehicle POST error:", e);
    }
  }

  if (!saved) {
    return NextResponse.json({ success: false, error: "Lỗi kết nối CSDL khi lưu xe" }, { status: 503 });
  }

  try { revalidatePath("/"); } catch {}

  return NextResponse.json({ success: true, item: newItem }, { status: 201 });
}

export async function PUT(req: Request) {
  if (!(await isAuthorized(req))) {
    return unauthorizedResponse();
  }

  const url = new URL(req.url);
  const lang = getLang(url);
  const id = url.searchParams.get("id")?.trim();

  if (!id) {
    return NextResponse.json({ success: false, error: "Missing id parameter" }, { status: 400 });
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const validated = validateVehiclePayload(payload);
  if (!validated.ok) {
    return NextResponse.json({ success: false, error: validated.error }, { status: 400 });
  }

  const updatedItem: Vehicle = { id, ...validated.data };

  let saved = false;
  try {
    await pool.query(
      `INSERT INTO public.vehicles (id, lang, name, badge, price, image, specs, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       ON CONFLICT (id, lang) DO UPDATE SET
         name = EXCLUDED.name,
         badge = EXCLUDED.badge,
         price = EXCLUDED.price,
         image = EXCLUDED.image,
         specs = EXCLUDED.specs`,
      [updatedItem.id, lang, updatedItem.name, updatedItem.badge, updatedItem.price, updatedItem.image, JSON.stringify(updatedItem.specs)]
    );
    saved = true;
  } catch (err) {
    console.error("PostgreSQL pool.query vehicle PUT error:", err);
  }

  if (!saved) {
    try {
      const { error } = await supabaseAdmin.from("vehicles").upsert({
        id: updatedItem.id,
        lang,
        name: updatedItem.name,
        badge: updatedItem.badge,
        price: updatedItem.price,
        image: updatedItem.image,
        specs: updatedItem.specs,
        created_at: new Date().toISOString()
      });
      if (!error) saved = true;
    } catch (e) {
      console.error("SupabaseAdmin vehicle PUT error:", e);
    }
  }

  if (!saved) {
    return NextResponse.json({ success: false, error: "Lỗi kết nối CSDL khi cập nhật xe" }, { status: 503 });
  }

  try { revalidatePath("/"); } catch {}

  return NextResponse.json({ success: true, item: updatedItem });
}

export async function DELETE(req: Request) {
  if (!(await isAuthorized(req))) {
    return unauthorizedResponse();
  }

  const url = new URL(req.url);
  const lang = getLang(url);
  const id = url.searchParams.get("id")?.trim();

  if (!id) {
    return NextResponse.json({ success: false, error: "Missing id parameter" }, { status: 400 });
  }

  let deleted = false;
  try {
    await pool.query("DELETE FROM public.vehicles WHERE id = $1 AND lang = $2", [id, lang]);
    deleted = true;
  } catch (err) {
    console.error("PostgreSQL pool.query vehicle DELETE error:", err);
  }

  if (!deleted) {
    try {
      const { error } = await supabaseAdmin.from("vehicles").delete().eq("id", id).eq("lang", lang);
      if (!error) deleted = true;
    } catch (e) {
      console.error("SupabaseAdmin vehicle DELETE error:", e);
    }
  }

  if (!deleted) {
    return NextResponse.json({ success: false, error: "Lỗi kết nối CSDL khi xóa xe" }, { status: 503 });
  }

  try { revalidatePath("/"); } catch {}

  return NextResponse.json({ success: true });
}