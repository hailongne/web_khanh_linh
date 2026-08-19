import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { Role, Account, MENU_ITEMS, getAccessibleMenuItems } from "../../../admin/adminConfig";
import { supabase } from "../../../lib/supabase";

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
    passwordHash: row.password_hash,
    displayName: row.display_name || "",
    avatar: row.avatar || "",
    role: row.role as Role,
    permissions: Array.isArray(row.permissions) ? row.permissions : [],
    active: row.active ?? true,
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
    lastLogin: row.last_login || ""
  };
}

export async function readAccountsAsync(): Promise<Account[]> {
  try {
    const { data, error } = await supabase.from("accounts").select("*").order("created_at", { ascending: true });
    if (error || !data || data.length === 0) {
      return [];
    }
    return data.map(mapRowToAccount);
  } catch (err) {
    console.error("Error reading accounts from Supabase:", err);
    return [];
  }
}

// Backward compatible sync method
export function readAccounts(): Account[] {
  return [];
}

export async function writeAccountAsync(acc: Account): Promise<void> {
  try {
    await supabase.from("accounts").upsert({
      id: acc.id,
      username: acc.username,
      password_hash: acc.passwordHash,
      display_name: acc.displayName,
      avatar: acc.avatar,
      role: acc.role,
      permissions: acc.permissions || [],
      active: acc.active,
      updated_at: new Date().toISOString(),
      last_login: acc.lastLogin || null
    });
  } catch (err) {
    console.error("Error writing account to Supabase:", err);
  }
}

export async function deleteAccountAsync(id: string): Promise<void> {
  try {
    await supabase.from("accounts").delete().eq("id", id);
  } catch (err) {
    console.error("Error deleting account from Supabase:", err);
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
    await supabase.from("sessions").upsert({
      id: token,
      account_id: accountId,
      expire: expireDate.toISOString()
    });
  } catch (err) {
    console.error("Notice: failed saving session to Supabase:", err);
  }

  return token;
}

export async function destroySession(sessionId: string): Promise<void> {
  if (!sessionId) return;
  try {
    await supabase.from("sessions").delete().eq("id", sessionId);
  } catch (err) {
    console.error("Error destroying session in Supabase:", err);
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
      const { data } = await supabase.from("accounts").select("*").eq("id", verified.accountId).single();
      if (data && data.active) {
        return mapRowToAccount(data);
      }
    }

    // 2. Try DB session lookup
    try {
      const { data: session } = await supabase.from("sessions").select("account_id, expire").eq("id", sessionId).single();
      if (session) {
        const now = new Date().getTime();
        const expireTime = new Date(session.expire).getTime();
        if (expireTime > now) {
          const { data: account } = await supabase.from("accounts").select("*").eq("id", session.account_id).single();
          if (account && account.active) {
            return mapRowToAccount(account);
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
      const { data: account } = await supabase.from("accounts").select("*").eq("username", username).single();
      if (account && account.active && bcrypt.compareSync(password, account.password_hash)) {
        return mapRowToAccount(account);
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