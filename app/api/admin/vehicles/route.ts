import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { isAuthorized } from "../_lib/adminAuth";

const DB_PATH = path.join(process.cwd(), "db.json");

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

type DbShape = {
  vehicles?: Record<string, Vehicle[]>;
};

function readDb(): DbShape {
  const raw = fs.readFileSync(DB_PATH, "utf-8");
  return JSON.parse(raw) as DbShape;
}

function writeDb(data: DbShape): void {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
}

function getLang(url: URL): string {
  return url.searchParams.get("lang")?.trim() || "vi";
}

function generateId(items: Vehicle[]): string {
  const maxId = items.reduce((max, item) => {
    const numericId = Number.parseInt(item.id, 10);
    return Number.isFinite(numericId) ? Math.max(max, numericId) : max;
  }, 0);

  return String(maxId + 1);
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
  const db = readDb();
  const items = db.vehicles?.[lang] ?? [];

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
  const db = readDb();
  const items = db.vehicles?.[lang] ?? [];
  const newItem: Vehicle = { id: generateId(items), ...validated.data };

  db.vehicles = db.vehicles ?? {};
  db.vehicles[lang] = [...items, newItem];
  writeDb(db);

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

  const db = readDb();
  const items = db.vehicles?.[lang] ?? [];
  const index = items.findIndex((item) => item.id === id);

  if (index === -1) {
    return NextResponse.json({ success: false, error: "Vehicle not found" }, { status: 404 });
  }

  const updatedItem: Vehicle = { id, ...validated.data };
  items[index] = updatedItem;
  db.vehicles = db.vehicles ?? {};
  db.vehicles[lang] = items;
  writeDb(db);

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

  const db = readDb();
  const items = db.vehicles?.[lang] ?? [];

  if (!items.some((item) => item.id === id)) {
    return NextResponse.json({ success: false, error: "Vehicle not found" }, { status: 404 });
  }

  db.vehicles = db.vehicles ?? {};
  db.vehicles[lang] = items.filter((item) => item.id !== id);
  writeDb(db);

  return NextResponse.json({ success: true });
}