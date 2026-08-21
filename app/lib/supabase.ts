import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ryfpohhakwpoimxcvvvi.supabase.co";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_WD0z_4S7EIDU7mGhFyy8XA_bIELh7w-";

// Public client for client-side data queries (subject to RLS)
export const supabase = createClient(supabaseUrl, anonKey, {
  auth: {
    persistSession: false
  }
});

// Server-side admin client with Service Role Key (bypasses RLS for server-side operations)
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || anonKey;
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false
  }
});

