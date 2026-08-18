import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
const DB_PATH = path.join(process.cwd(), "db.json");

export async function GET() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      return NextResponse.json({ items: [] });
    }
    const raw = fs.readFileSync(DB_PATH, "utf-8");
    const db = JSON.parse(raw);
    return NextResponse.json({ items: db.sales || [] });
  } catch (error) {
    console.error("Error reading sales data:", error);
    return NextResponse.json({ items: [] });
  }
}
