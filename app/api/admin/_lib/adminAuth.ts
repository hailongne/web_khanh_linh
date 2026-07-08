import bcrypt from "bcrypt";
import fs from "node:fs";
import path from "node:path";

const DB_PATH = path.join(process.cwd(), "db.json");

export const DEFAULT_ADMIN_USERNAME = "adminKhanhLinhTrans";
export const DEFAULT_ADMIN_PASSWORD = "KhanhLinh2026!";
export const ADMIN_MIN_PASSWORD_LENGTH = 8;

export type AdminRecord = {
  username?: string;
  password?: string;
  passwordHash?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type DbShape = Record<string, any> & {
  admin?: AdminRecord;
};

export type ResolvedAdminCredentials = {
  username: string;
  passwordHash?: string;
  passwordPlain?: string;
  createdAt?: string;
  updatedAt?: string;
  fromDb: boolean;
};

export function readDb(): DbShape {
  const raw = fs.readFileSync(DB_PATH, "utf-8");
  return JSON.parse(raw) as DbShape;
}

export function writeDb(data: DbShape): void {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
}

function getFallbackCredentials(): ResolvedAdminCredentials {
  return {
    username: process.env.ADMIN_USERNAME?.trim() || DEFAULT_ADMIN_USERNAME,
    passwordPlain: process.env.ADMIN_PASSWORD?.trim() || DEFAULT_ADMIN_PASSWORD,
    fromDb: false
  };
}

export function resolveAdminCredentials(db: DbShape): ResolvedAdminCredentials {
  const username = db.admin?.username?.trim();
  const passwordHash = db.admin?.passwordHash?.trim();
  const passwordPlain = db.admin?.password?.trim();

  if (!username) {
    return getFallbackCredentials();
  }

  return {
    username,
    passwordHash: passwordHash || undefined,
    passwordPlain: passwordPlain || undefined,
    createdAt: db.admin?.createdAt,
    updatedAt: db.admin?.updatedAt,
    fromDb: true
  };
}

export async function verifyPassword(inputPassword: string, credentials: ResolvedAdminCredentials): Promise<boolean> {
  if (credentials.passwordHash) {
    return bcrypt.compare(inputPassword, credentials.passwordHash);
  }

  if (credentials.passwordPlain) {
    return inputPassword === credentials.passwordPlain;
  }

  return false;
}

export async function verifyAdminCredentials(
  inputUsername: string,
  inputPassword: string,
  credentials: ResolvedAdminCredentials
): Promise<boolean> {
  if (!inputUsername || !inputPassword) {
    return false;
  }

  if (inputUsername !== credentials.username) {
    return false;
  }

  return verifyPassword(inputPassword, credentials);
}

export async function isAuthorized(req: Request): Promise<boolean> {
  const username = req.headers.get("x-admin-username")?.trim() || "";
  const password = req.headers.get("x-admin-password")?.trim() || "";

  if (!username || !password) {
    return false;
  }

  const db = readDb();
  const credentials = resolveAdminCredentials(db);
  return verifyAdminCredentials(username, password, credentials);
}