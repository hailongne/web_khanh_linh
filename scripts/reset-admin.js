const bcrypt = require("bcryptjs");
const fs = require("node:fs");
const path = require("node:path");
const readline = require("node:readline/promises");
const { stdin: input, stdout: output } = require("node:process");

const DATA_DIR = path.join(process.cwd(), "data");
const ACCOUNTS_PATH = path.join(DATA_DIR, "accounts.json");
const DB_PATH = path.join(process.cwd(), "db.json");
const MIN_PASSWORD_LENGTH = 8;

function readAccounts() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(ACCOUNTS_PATH)) {
    return [];
  }
  try {
    const raw = fs.readFileSync(ACCOUNTS_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeAccounts(accounts) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(ACCOUNTS_PATH, JSON.stringify(accounts, null, 2), "utf-8");
}

async function main() {
  const rl = readline.createInterface({ input, output });

  try {
    const username = (await rl.question("New username: ")).trim();
    const password = await rl.question("New password: ");
    const confirmPassword = await rl.question("Confirm new password: ");

    if (!username) {
      throw new Error("Username khong duoc de trong.");
    }

    if (!password || !confirmPassword) {
      throw new Error("Mat khau khong duoc de trong.");
    }

    if (password !== confirmPassword) {
      throw new Error("Mat khau xac nhan khong khop.");
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      throw new Error(`Mat khau phai co it nhat ${MIN_PASSWORD_LENGTH} ky tu.`);
    }

    const accounts = readAccounts();
    const now = new Date().toISOString();
    const passwordHash = await bcrypt.hash(password, 10);

    const existingIdx = accounts.findIndex((a) => a.username === username || a.role === "SUPER_ADMIN");
    if (existingIdx !== -1) {
      accounts[existingIdx] = {
        ...accounts[existingIdx],
        username,
        passwordHash,
        role: "SUPER_ADMIN",
        active: true,
        updatedAt: now
      };
    } else {
      accounts.push({
        id: `acc_${Date.now()}`,
        username,
        passwordHash,
        displayName: "Administrator",
        avatar: "",
        role: "SUPER_ADMIN",
        permissions: [],
        active: true,
        createdAt: now,
        updatedAt: now,
        lastLogin: ""
      });
    }

    writeAccounts(accounts);

    // Also update legacy db.json for backward compatibility if present
    if (fs.existsSync(DB_PATH)) {
      try {
        const rawDb = fs.readFileSync(DB_PATH, "utf-8");
        const db = JSON.parse(rawDb);
        db.admin = {
          username,
          passwordHash,
          createdAt: db.admin?.createdAt || now,
          updatedAt: now
        };
        fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
      } catch (err) {
        // non-blocking
      }
    }

    console.log("Reset tai khoan admin thanh cong.");
    console.log(`Username moi: ${username}`);
  } finally {
    rl.close();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Khong the reset tai khoan admin.");
  process.exitCode = 1;
});
