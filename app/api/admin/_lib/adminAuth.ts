import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { cookies } from "next/headers";
import { Role, Account, MENU_ITEMS, getAccessibleMenuItems } from "../../../admin/adminConfig";

export type { Role, Account };
export { MENU_ITEMS, getAccessibleMenuItems };

const DB_PATH = path.join(process.cwd(), "db.json");
const DATA_DIR = path.join(process.cwd(), "data");
const ACCOUNTS_PATH = path.join(DATA_DIR, "accounts.json");
const SESSIONS_PATH = path.join(DATA_DIR, "sessions.json");

export const DEFAULT_ADMIN_USERNAME = "adminKhanhLinhTrans";
export const DEFAULT_ADMIN_PASSWORD = "KhanhLinh2026!";
export const ADMIN_MIN_PASSWORD_LENGTH = 8;
export const COOKIE_NAME = "admin_session";

export interface SessionEntry {
  accountId: string;
  expire: string;
}

export type SessionsMap = Record<string, SessionEntry>;

function ensureDataDirs() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    console.warn("Notice: Cannot create data dir on read-only filesystem:", err);
  }
}

export function readDb(): Record<string, unknown> {
  if (!fs.existsSync(DB_PATH)) return {};
  try {
    const raw = fs.readFileSync(DB_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function writeDb(data: Record<string, unknown>): void {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
}

export function readAccounts(): Account[] {
  ensureDataDirs();
  if (!fs.existsSync(ACCOUNTS_PATH)) {
    // Migration helper: migrate legacy admin from db.json if exists
    const db = readDb();
    const now = new Date().toISOString();
    const legacyAdmin = db.admin as { passwordHash?: string; username?: string; createdAt?: string; updatedAt?: string } | undefined;
    const defaultPasswordHash = legacyAdmin?.passwordHash || bcrypt.hashSync(DEFAULT_ADMIN_PASSWORD, 10);
    const initialAccount: Account = {
      id: "acc_001",
      username: legacyAdmin?.username || DEFAULT_ADMIN_USERNAME,
      passwordHash: defaultPasswordHash,
      displayName: "Administrator",
      avatar: "",
      role: "SUPER_ADMIN",
      permissions: [],
      active: true,
      createdAt: legacyAdmin?.createdAt || now,
      updatedAt: legacyAdmin?.updatedAt || now,
      lastLogin: ""
    };

    const initialAccounts = [initialAccount];
    writeAccounts(initialAccounts);
    return initialAccounts;
  }

  try {
    const raw = fs.readFileSync(ACCOUNTS_PATH, "utf-8");
    const accounts = JSON.parse(raw) as Account[];
    if (!Array.isArray(accounts) || accounts.length === 0) {
      // Re-seed default super admin if empty
      const now = new Date().toISOString();
      const defaultAcc: Account = {
        id: "acc_001",
        username: DEFAULT_ADMIN_USERNAME,
        passwordHash: bcrypt.hashSync(DEFAULT_ADMIN_PASSWORD, 10),
        displayName: "Administrator",
        avatar: "",
        role: "SUPER_ADMIN",
        permissions: [],
        active: true,
        createdAt: now,
        updatedAt: now,
        lastLogin: ""
      };
      writeAccounts([defaultAcc]);
      return [defaultAcc];
    }
    return accounts;
  } catch (err) {
    console.error("Error reading accounts.json:", err);
    return [];
  }
}

export function writeAccounts(accounts: Account[]): void {
  ensureDataDirs();
  fs.writeFileSync(ACCOUNTS_PATH, JSON.stringify(accounts, null, 2), "utf-8");
}

export function readSessions(): SessionsMap {
  ensureDataDirs();
  if (!fs.existsSync(SESSIONS_PATH)) {
    fs.writeFileSync(SESSIONS_PATH, JSON.stringify({}, null, 2), "utf-8");
    return {};
  }

  try {
    const raw = fs.readFileSync(SESSIONS_PATH, "utf-8");
    return JSON.parse(raw) as SessionsMap;
  } catch (err) {
    console.error("Error reading sessions.json:", err);
    return {};
  }
}

export function writeSessions(sessions: SessionsMap): void {
  ensureDataDirs();
  fs.writeFileSync(SESSIONS_PATH, JSON.stringify(sessions, null, 2), "utf-8");
}

export async function createSession(accountId: string): Promise<string> {
  const sessionId = crypto.randomUUID();
  const expireDate = new Date();
  expireDate.setDate(expireDate.getDate() + 7); // 7 days expiration

  const sessions = readSessions();
  sessions[sessionId] = {
    accountId,
    expire: expireDate.toISOString()
  };
  writeSessions(sessions);
  return sessionId;
}

export async function destroySession(sessionId: string): Promise<void> {
  if (!sessionId) return;
  const sessions = readSessions();
  if (sessions[sessionId]) {
    delete sessions[sessionId];
    writeSessions(sessions);
  }
}

export function getSessionIdFromRequest(req?: Request): string | null {
  if (req) {
    // Check Header first
    const headerSession = req.headers.get("x-admin-session");
    if (headerSession) return headerSession.trim();

    // Check Cookie in Request
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
    const sessions = readSessions();
    const session = sessions[sessionId];
    if (session) {
      const now = new Date().getTime();
      const expireTime = new Date(session.expire).getTime();
      if (expireTime > now) {
        const accounts = readAccounts();
        const account = accounts.find((a) => a.id === session.accountId && a.active);
        if (account) {
          return account;
        }
      } else {
        // Remove expired session
        delete sessions[sessionId];
        writeSessions(sessions);
      }
    }
  }

  // Fallback for legacy custom header auth (for backward compatibility during transition)
  if (req) {
    const username = req.headers.get("x-admin-username")?.trim();
    const password = req.headers.get("x-admin-password")?.trim();
    if (username && password) {
      const accounts = readAccounts();
      const account = accounts.find((a) => a.username === username && a.active);
      if (account && bcrypt.compareSync(password, account.passwordHash)) {
        return account;
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