import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAuthorized } from "../admin/_lib/adminAuth";
import { supabase } from "../../lib/supabase";

export const dynamic = "force-dynamic";

function getLang(url: URL): string {
  return url.searchParams.get("lang") ?? "vi";
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const lang = getLang(url);
  const { data: rows } = await supabase.from("vehicles").select("*").eq("lang", lang).order("id", { ascending: true });
  
  const items = (rows || []).map((r) => ({
    id: r.id,
    name: r.name,
    badge: r.badge || "",
    price: r.price || "",
    image: r.image || "",
    specs: r.specs || []
  }));

  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ success: false, error: "401 Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const lang = getLang(url);

  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
  }

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

  await supabase.from("vehicles").upsert(newItem);
  try { revalidatePath("/"); } catch {}

  return NextResponse.json({ success: true, item: newItem }, { status: 201 });
}

export async function PUT(req: Request) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ success: false, error: "401 Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const lang = getLang(url);
  const id = url.searchParams.get("id")?.trim();

  if (!id) {
    return NextResponse.json({ success: false, error: "Missing id parameter" }, { status: 400 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const updatedItem = {
    id,
    lang,
    name: String(payload.name || ""),
    badge: String(payload.badge || ""),
    price: String(payload.price || ""),
    image: String(payload.image || ""),
    specs: payload.specs || []
  };

  await supabase.from("vehicles").upsert(updatedItem);
  try { revalidatePath("/"); } catch {}

  return NextResponse.json({ success: true, item: updatedItem });
}

export async function DELETE(req: Request) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ success: false, error: "401 Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const lang = getLang(url);
  const id = url.searchParams.get("id")?.trim();

  if (!id) {
    return NextResponse.json({ success: false, error: "Missing id parameter" }, { status: 400 });
  }

  await supabase.from("vehicles").delete().eq("id", id).eq("lang", lang);
  try { revalidatePath("/"); } catch {}

  return NextResponse.json({ success: true });
}
