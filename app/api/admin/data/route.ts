import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { isAuthorized } from "../_lib/adminAuth";

const DB_PATH = path.join(process.cwd(), "db.json");

type DbShape = Record<string, any>;

const VALID_TYPES = ["vehicles", "pricing", "sales", "testimonials", "faq"] as const;
type DataType = (typeof VALID_TYPES)[number];

function readDb(): DbShape {
  const raw = fs.readFileSync(DB_PATH, "utf-8");
  return JSON.parse(raw) as DbShape;
}

function writeDb(data: DbShape): void {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
}

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

function generateId(items: any[]): string {
  const maxId = items.reduce((max, item) => {
    const numericId = Number.parseInt(item?.id, 10);
    return Number.isFinite(numericId) ? Math.max(max, numericId) : max;
  }, 0);
  return String(maxId + 1);
}

function getArraySection(db: DbShape, type: DataType, lang?: string): any[] | null {
  if (type === "sales") {
    return Array.isArray(db.sales) ? db.sales : null;
  }
  if (type === "vehicles") {
    return db.vehicles?.[lang || "vi"];
  }
  return null;
}

function setArraySection(db: DbShape, type: DataType, items: any[], lang?: string): void {
  if (type === "sales") {
    db.sales = items;
  } else if (type === "vehicles") {
    db.vehicles = db.vehicles ?? {};
    db.vehicles[lang || "vi"] = items;
  }
}

function getObjectSection(db: DbShape, type: DataType, lang: string): any | null {
  if (type === "pricing" || type === "testimonials" || type === "faq") {
    return db[type]?.[lang];
  }
  return null;
}

function setObjectSection(db: DbShape, type: DataType, lang: string, value: any): void {
  if (type === "pricing" || type === "testimonials" || type === "faq") {
    db[type] = db[type] ?? {};
    db[type][lang] = value;
  }
}

export async function GET(req: Request) {
  if (!(await isAuthorized(req))) {
    return unauthorizedResponse();
  }

  const url = new URL(req.url);
  const type = getType(url);
  if (!type) {
    return NextResponse.json({ success: false, error: "Invalid or missing type" }, { status: 400 });
  }

  const db = readDb();

  if (type === "sales") {
    return NextResponse.json({ success: true, items: db.sales ?? [] });
  }

  if (type === "vehicles") {
    const lang = getLang(url);
    return NextResponse.json({ success: true, items: db.vehicles?.[lang] ?? [] });
  }

  const lang = getLang(url);
  return NextResponse.json({ success: true, data: db[type]?.[lang] ?? null });
}

export async function POST(req: Request) {
  if (!(await isAuthorized(req))) {
    return unauthorizedResponse();
  }

  const url = new URL(req.url);
  const type = getType(url);
  if (!type) {
    return NextResponse.json({ success: false, error: "Invalid or missing type" }, { status: 400 });
  }

  let payload: any;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const db = readDb();

  if (type === "sales" || type === "vehicles") {
    const lang = type === "vehicles" ? getLang(url) : undefined;
    const items = getArraySection(db, type, lang) ?? [];
    const newItem = { ...payload, id: payload?.id ?? generateId(items) };
    setArraySection(db, type, [...items, newItem], lang);
    writeDb(db);
    return NextResponse.json({ success: true, item: newItem }, { status: 201 });
  }

  return NextResponse.json({ success: false, error: "POST not supported for this type" }, { status: 400 });
}

export async function PUT(req: Request) {
  if (!(await isAuthorized(req))) {
    return unauthorizedResponse();
  }

  const url = new URL(req.url);
  const type = getType(url);
  if (!type) {
    return NextResponse.json({ success: false, error: "Invalid or missing type" }, { status: 400 });
  }

  let payload: any;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const db = readDb();

  if (type === "sales" || type === "vehicles") {
    const lang = type === "vehicles" ? getLang(url) : undefined;
    const id = url.searchParams.get("id")?.trim();
    if (!id) {
      return NextResponse.json({ success: false, error: "Missing id" }, { status: 400 });
    }
    const items = getArraySection(db, type, lang) ?? [];
    const index = items.findIndex((item) => String(item?.id) === id);
    if (index === -1) {
      return NextResponse.json({ success: false, error: "Item not found" }, { status: 404 });
    }
    items[index] = { ...payload, id };
    setArraySection(db, type, items, lang);
    writeDb(db);
    return NextResponse.json({ success: true, item: items[index] });
  }

  if (type === "pricing" || type === "testimonials" || type === "faq") {
    const lang = getLang(url);
    setObjectSection(db, type, lang, payload);
    writeDb(db);
    return NextResponse.json({ success: true, data: payload });
  }

  return NextResponse.json({ success: false, error: "Unsupported type" }, { status: 400 });
}

export async function DELETE(req: Request) {
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

  const db = readDb();
  const lang = type === "vehicles" ? getLang(url) : undefined;
  const items = getArraySection(db, type, lang) ?? [];
  const filtered = items.filter((item) => String(item?.id) !== id);
  setArraySection(db, type, filtered, lang);
  writeDb(db);
  return NextResponse.json({ success: true });
}
