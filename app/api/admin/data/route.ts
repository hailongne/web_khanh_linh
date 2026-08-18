import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { isAuthorized } from "../_lib/adminAuth";

const DB_PATH = path.join(process.cwd(), "db.json");

type DbShape = Record<string, unknown>;

const VALID_TYPES = ["vehicles", "pricing", "sales", "testimonials", "faq"] as const;
type DataType = (typeof VALID_TYPES)[number];

export const dynamic = "force-dynamic";

function readDb(): DbShape {
  try {
    if (!fs.existsSync(DB_PATH)) return {};
    const raw = fs.readFileSync(DB_PATH, "utf-8");
    return JSON.parse(raw) as DbShape;
  } catch (err) {
    console.warn("Notice: Cannot read db.json:", err);
    return {};
  }
}

function writeDb(data: DbShape): void {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.warn("Notice: Cannot write db.json on read-only filesystem:", err);
  }
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

function generateId(items: Record<string, unknown>[]): string {
  const maxId = items.reduce((max, item) => {
    const numericId = Number.parseInt(String(item?.id ?? ""), 10);
    return Number.isFinite(numericId) ? Math.max(max, numericId) : max;
  }, 0);
  return String(maxId + 1);
}

function getArraySection(db: DbShape, type: DataType, lang?: string): Record<string, unknown>[] | null {
  if (type === "sales") {
    if (Array.isArray(db.sales)) {
      let modified = false;
      (db.sales as Record<string, unknown>[]).forEach((item: Record<string, unknown>) => {
        if (!item.id) {
          item.id = crypto.randomUUID();
          modified = true;
        }
      });
      if (modified) writeDb(db);
      return db.sales as Record<string, unknown>[];
    }
    return null;
  }
  if (type === "vehicles") {
    const vehicles = db.vehicles as Record<string, Record<string, unknown>[]> | undefined;
    return vehicles?.[lang || "vi"] || null;
  }
  return null;
}

function setArraySection(db: DbShape, type: DataType, items: Record<string, unknown>[], lang?: string): void {
  if (type === "sales") {
    db.sales = items;
  } else if (type === "vehicles") {
    const vehicles = (db.vehicles ?? {}) as Record<string, Record<string, unknown>[]>;
    vehicles[lang || "vi"] = items;
    db.vehicles = vehicles;
  }
}

function setObjectSection(db: DbShape, type: DataType, lang: string, value: unknown): void {
  if (type === "pricing" || type === "testimonials" || type === "faq") {
    const section = (db[type] ?? {}) as Record<string, unknown>;
    section[lang] = value;
    db[type] = section;
  }
}

export async function GET(req: Request) {
  try {
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
      const items = getArraySection(db, "sales") ?? [];
      return NextResponse.json({ success: true, items });
    }

    if (type === "vehicles") {
      const lang = getLang(url);
      const vehicles = db.vehicles as Record<string, unknown[]> | undefined;
      return NextResponse.json({ success: true, items: vehicles?.[lang] ?? [] });
    }

    const lang = getLang(url);
    const section = db[type] as Record<string, unknown> | undefined;
    return NextResponse.json({ success: true, data: section?.[lang] ?? null });
  } catch (error: unknown) {
    console.error("GET admin data error:", error);
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

    const db = readDb();

    if (type === "sales" || type === "vehicles") {
      const lang = type === "vehicles" ? getLang(url) : undefined;
      const items = getArraySection(db, type, lang) ?? [];
      const newItem = { ...payload, id: (payload?.id as string) ?? (type === "sales" ? crypto.randomUUID() : generateId(items)) };
      setArraySection(db, type, [...items, newItem], lang);
      writeDb(db);
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
        // If editing item created dynamically in memory, append or return success
        const updatedItem = { ...payload, id };
        items.push(updatedItem);
        setArraySection(db, type, items, lang);
        writeDb(db);
        return NextResponse.json({ success: true, item: updatedItem });
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

    const db = readDb();
    const lang = type === "vehicles" ? getLang(url) : undefined;
    const items = getArraySection(db, type, lang) ?? [];
    const targetItem = items.find((item) => String(item?.id) === id);

    if (targetItem) {
      const imagePath = targetItem.avatar || targetItem.image;
      if (typeof imagePath === "string" && imagePath.startsWith("/images/")) {
        const normalized = imagePath.slice(1);
        if (normalized.startsWith("images/") && !normalized.includes("..")) {
          const absolutePath = path.join(process.cwd(), "public", normalized);
          try {
            fs.unlinkSync(absolutePath);
          } catch {
            // ignore if file does not exist
          }
        }
      }
    }

    const filtered = items.filter((item) => String(item?.id) !== id);
    setArraySection(db, type, filtered, lang);
    writeDb(db);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("DELETE admin data error:", error);
    return NextResponse.json({ success: false, error: "Lỗi xóa dữ liệu" }, { status: 500 });
  }
}
