import { NextResponse } from "next/server";
import { supabase } from "../../lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { data: row } = await supabase.from("site_settings").select("value").eq("key", "sales").single();
    const items = Array.isArray(row?.value) ? row.value : [];
    return NextResponse.json({ items });
  } catch (error) {
    console.error("Error reading sales data:", error);
    return NextResponse.json({ items: [] });
  }
}
