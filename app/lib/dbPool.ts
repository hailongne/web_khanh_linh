import { Pool } from "pg";

const connectionString =
  process.env.DATABASE_URL ||
  "postgres://postgres.ryfpohhakwpoimxcvvvi:KhanhLinh2026!@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres";

// Global singleton for Next.js hot-reloading in dev
const globalForPg = globalThis as unknown as { pgPool: Pool | undefined };

export const pool =
  globalForPg.pgPool ??
  new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000
  });

if (process.env.NODE_ENV !== "production") {
  globalForPg.pgPool = pool;
}
