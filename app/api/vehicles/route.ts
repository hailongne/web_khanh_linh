import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";

const DB_PATH = path.join(process.cwd(), "db.json");

type DbShape = {
  vehicles?: Record<string, any[]>;
};

type ItemWithId = { id: string };

function readDb(): DbShape {
  const raw = fs.readFileSync(DB_PATH, "utf-8");
  return JSON.parse(raw) as DbShape;
}

function writeDb(data: DbShape): void {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
}

function generateId(items: ItemWithId[]): string {
  if (items.length === 0) return "v1";
  const nums = items
    .map((v) => parseInt(v.id.replace(/^v/i, ""), 10))
    .filter(Boolean);
  return `v${Math.max(...nums) + 1}`;
}

function getLang(url: URL): string {
  return url.searchParams.get("lang") ?? "vi";
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const lang = getLang(url);
  const db = readDb();
  const items = db.vehicles?.[lang] ?? [];
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const url = new URL(req.url);
  const lang = getLang(url);

  let payload: Record<string, any>;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
  }

  if (!payload || typeof payload !== "object") {
    return NextResponse.json({ success: false, error: "Request body must be an object" }, { status: 400 });
  }

  const db = readDb();
  db.vehicles = db.vehicles ?? {};
  db.vehicles[lang] = db.vehicles[lang] ?? [];

  const newItem = { ...payload, id: generateId(db.vehicles[lang]) };
  db.vehicles[lang].push(newItem);
  writeDb(db);

  return NextResponse.json({ success: true, item: newItem }, { status: 201 });
}

export async function PUT(req: Request) {
  const url = new URL(req.url);
  const lang = getLang(url);
  const id = url.searchParams.get("id")?.trim();

  if (!id) {
    return NextResponse.json({ success: false, error: "Missing id parameter" }, { status: 400 });
  }

  let payload: Record<string, any>;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
  }

  if (!payload || typeof payload !== "object") {
    return NextResponse.json({ success: false, error: "Request body must be an object" }, { status: 400 });
  }

  const db = readDb();
  const vehicles = db.vehicles?.[lang] ?? [];
  const index = vehicles.findIndex((item) => item.id === id);

  if (index === -1) {
    return NextResponse.json({ success: false, error: "Vehicle not found" }, { status: 404 });
  }

  const updatedItem = { ...vehicles[index], ...payload, id };
  vehicles[index] = updatedItem;
  db.vehicles![lang] = vehicles;
  writeDb(db);

  return NextResponse.json({ success: true, item: updatedItem });
}

export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const lang = getLang(url);
  const id = url.searchParams.get("id")?.trim();

  if (!id) {
    return NextResponse.json({ success: false, error: "Missing id parameter" }, { status: 400 });
  }

  const db = readDb();
  const vehicles = db.vehicles?.[lang] ?? [];
  const index = vehicles.findIndex((item) => item.id === id);

  if (index === -1) {
    return NextResponse.json({ success: false, error: "Vehicle not found" }, { status: 404 });
  }

  db.vehicles![lang] = vehicles.filter((item) => item.id !== id);
  writeDb(db);

  return NextResponse.json({ success: true });
}
