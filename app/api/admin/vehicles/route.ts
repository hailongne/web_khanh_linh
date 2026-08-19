import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAuthorized } from "../_lib/adminAuth";
import { supabase } from "../../../lib/supabase";

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

export async function GET(req: Request) {
  if (!(await isAuthorized(req))) {
    return unauthorizedResponse();
  }

  const url = new URL(req.url);
  const lang = getLang(url);
  const { data: rows } = await supabase.from("vehicles").select("*").eq("lang", lang).order("id", { ascending: true });

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

  await supabase.from("vehicles").upsert({
    id: newId,
    lang,
    name: newItem.name,
    badge: newItem.badge,
    price: newItem.price,
    image: newItem.image,
    specs: newItem.specs
  });

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

  await supabase.from("vehicles").upsert({
    id,
    lang,
    name: updatedItem.name,
    badge: updatedItem.badge,
    price: updatedItem.price,
    image: updatedItem.image,
    specs: updatedItem.specs
  });

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

  await supabase.from("vehicles").delete().eq("id", id).eq("lang", lang);
  try { revalidatePath("/"); } catch {}

  return NextResponse.json({ success: true });
}