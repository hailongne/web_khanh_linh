import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { Role, Account, MENU_ITEMS, getAccessibleMenuItems } from "../../../admin/adminConfig";
import { supabaseAdmin } from "../../../lib/supabase";
import { pool } from "../../../lib/dbPool";

export type { Role, Account };
export { MENU_ITEMS, getAccessibleMenuItems };

export const DEFAULT_ADMIN_USERNAME = "adminKhanhLinhTrans";
export const DEFAULT_ADMIN_PASSWORD = "KhanhLinh2026!";
export const ADMIN_MIN_PASSWORD_LENGTH = 8;
export const COOKIE_NAME = "admin_session";

const AUTH_SECRET = process.env.ADMIN_AUTH_SECRET || "khanhlinhtrans-secret-auth-key-2026";

export interface SessionEntry {
  accountId: string;
  expire: string;
}

export type SessionsMap = Record<string, SessionEntry>;

// Helper convert database row to Account interface
function mapRowToAccount(row: any): Account {
  return {
    id: row.id,
    username: row.username,
    passwordHash: row.password_hash || row.passwordHash,
    displayName: row.display_name || row.displayName || "",
    avatar: row.avatar || "",
    role: row.role as Role,
    permissions: Array.isArray(row.permissions) ? row.permissions : [],
    active: row.active ?? true,
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    updatedAt: row.updated_at || row.updatedAt || new Date().toISOString(),
    lastLogin: row.last_login || row.lastLogin || ""
  };
}

export async function readAccountsAsync(): Promise<Account[]> {
  // 1. Primary: PostgreSQL Direct Connection / Pooler
  try {
    const { rows } = await pool.query("SELECT * FROM public.accounts ORDER BY created_at ASC");
    if (rows && Array.isArray(rows)) {
      return rows.map(mapRowToAccount);
    }
  } catch (err) {
    console.error("PostgreSQL pool.query accounts error:", err);
  }

  // 2. Secondary: Supabase Admin SDK (Service Role Key bypasses RLS)
  try {
    const { data, error } = await supabaseAdmin.from("accounts").select("*").order("created_at", { ascending: true });
    if (!error && data && Array.isArray(data)) {
      return data.map(mapRowToAccount);
    }
    if (error) {
      console.error("SupabaseAdmin accounts query error:", error.message);
    }
  } catch (err) {
    console.error("SupabaseAdmin SDK accounts error:", err);
  }

  // If DB cannot be queried at all, throw explicit connection error
  throw new Error("DATABASE_CONNECTION_ERROR");
}

// Backward compatible sync method
export function readAccounts(): Account[] {
  return [];
}

export async function writeAccountAsync(acc: Account): Promise<void> {
  try {
    await pool.query(
      `INSERT INTO public.accounts (id, username, password_hash, display_name, avatar, role, permissions, active, updated_at, last_login)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (id) DO UPDATE SET
         username = EXCLUDED.username,
         password_hash = EXCLUDED.password_hash,
         display_name = EXCLUDED.display_name,
         avatar = EXCLUDED.avatar,
         role = EXCLUDED.role,
         permissions = EXCLUDED.permissions,
         active = EXCLUDED.active,
         updated_at = EXCLUDED.updated_at,
         last_login = EXCLUDED.last_login`,
      [
        acc.id,
        acc.username,
        acc.passwordHash,
        acc.displayName,
        acc.avatar,
        acc.role,
        JSON.stringify(acc.permissions || []),
        acc.active,
        new Date().toISOString(),
        acc.lastLogin || null
      ]
    );
  } catch (err) {
    console.error("Error writing account to PostgreSQL:", err);
  }
}

export async function deleteAccountAsync(id: string): Promise<void> {
  try {
    await pool.query("DELETE FROM public.accounts WHERE id = $1", [id]);
  } catch (err) {
    console.error("Error deleting account from PostgreSQL:", err);
  }
}

export function writeAccounts(accounts: Account[]): void {
  // Legacy call - handled via writeAccountAsync in APIs
}

export function readSessions(): SessionsMap {
  return {};
}

export function writeSessions(sessions: SessionsMap): void {
  // Legacy call
}

function createStatelessToken(accountId: string, expireMs: number): string {
  const payload = `${accountId}:${expireMs}`;
  const signature = crypto.createHmac("sha256", AUTH_SECRET).update(payload).digest("hex");
  return `stateless.${payload}:${signature}`;
}

function verifyStatelessToken(token: string): { accountId: string; expireMs: number } | null {
  if (!token || !token.startsWith("stateless.")) return null;
  const raw = token.slice("stateless.".length);
  const lastColon = raw.lastIndexOf(":");
  if (lastColon === -1) return null;

  const payload = raw.slice(0, lastColon);
  const signature = raw.slice(lastColon + 1);

  const parts = payload.split(":");
  if (parts.length !== 2) return null;
  const [accountId, expireStr] = parts;
  const expireMs = parseInt(expireStr, 10);
  if (isNaN(expireMs) || expireMs < Date.now()) return null;

  const expectedSignature = crypto.createHmac("sha256", AUTH_SECRET).update(payload).digest("hex");
  try {
    if (crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return { accountId, expireMs };
    }
  } catch {
    return null;
  }
  return null;
}

export async function createSession(accountId: string): Promise<string> {
  const expireDate = new Date();
  expireDate.setDate(expireDate.getDate() + 7);
  const expireMs = expireDate.getTime();
  const token = createStatelessToken(accountId, expireMs);

  try {
    await pool.query(
      `INSERT INTO public.sessions (id, account_id, expire)
       VALUES ($1, $2, $3)
       ON CONFLICT (id) DO UPDATE SET expire = EXCLUDED.expire`,
      [token, accountId, expireDate.toISOString()]
    );
  } catch (err) {
    console.error("Notice: failed saving session to PostgreSQL:", err);
  }

  return token;
}

export async function destroySession(sessionId: string): Promise<void> {
  if (!sessionId) return;
  try {
    await pool.query("DELETE FROM public.sessions WHERE id = $1", [sessionId]);
  } catch (err) {
    console.error("Error destroying session in PostgreSQL:", err);
  }
}

export function getSessionIdFromRequest(req?: Request): string | null {
  if (req) {
    const headerSession = req.headers.get("x-admin-session");
    if (headerSession) return headerSession.trim();

    const cookieHeader = req.headers.get("cookie") || "";
    const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]*)`));
    if (match && match[1]) return decodeURIComponent(match[1].trim());
  }
  return null;
}

export async function getAuthenticatedAccount(req?: Request): Promise<Account | null> {
  let sessionId = getSessionIdFromRequest(req);

  if (!sessionId) {
    try {
      const cookieStore = await cookies();
      sessionId = cookieStore.get(COOKIE_NAME)?.value || null;
    } catch {
      sessionId = null;
    }
  }

  if (sessionId) {
    // 1. Try stateless token verification
    const verified = verifyStatelessToken(sessionId);
    if (verified) {
      try {
        const { rows } = await pool.query("SELECT * FROM public.accounts WHERE id = $1 LIMIT 1", [verified.accountId]);
        if (rows.length > 0 && rows[0].active) {
          return mapRowToAccount(rows[0]);
        }
      } catch (err) {
        console.error("Error querying account by id in PostgreSQL:", err);
      }

      try {
        const allAccounts = await readAccountsAsync();
        const matched = allAccounts.find((a) => a.id === verified.accountId);
        if (matched && matched.active) {
          return matched;
        }
      } catch (err) {
        console.error("Error reading accounts fallback in token verification:", err);
      }
    }

    // 2. Try DB session lookup
    try {
      const { rows: sessionRows } = await pool.query("SELECT account_id, expire FROM public.sessions WHERE id = $1 LIMIT 1", [sessionId]);
      if (sessionRows.length > 0) {
        const session = sessionRows[0];
        const now = new Date().getTime();
        const expireTime = new Date(session.expire).getTime();
        if (expireTime > now) {
          const { rows: accountRows } = await pool.query("SELECT * FROM public.accounts WHERE id = $1 LIMIT 1", [session.account_id]);
          if (accountRows.length > 0 && accountRows[0].active) {
            return mapRowToAccount(accountRows[0]);
          }
        }
      }
    } catch (err) {
      // ignore lookup error
    }
  }

  // 3. Fallback to header basic auth
  if (req) {
    const username = req.headers.get("x-admin-username")?.trim();
    const password = req.headers.get("x-admin-password")?.trim();
    if (username && password) {
      const { rows } = await pool.query("SELECT * FROM public.accounts WHERE LOWER(username) = LOWER($1) LIMIT 1", [username]);
      if (rows.length > 0 && rows[0].active && bcrypt.compareSync(password, rows[0].password_hash)) {
        return mapRowToAccount(rows[0]);
      }
    }
  }

  return null;
}

export async function isAuthorized(req: Request, allowedRoles?: Role[]): Promise<boolean> {
  const account = await getAuthenticatedAccount(req);
  if (!account || !account.active) {
    return false;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    return allowedRoles.includes(account.role);
  }

  return true;
}