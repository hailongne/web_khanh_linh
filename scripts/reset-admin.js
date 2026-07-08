const bcrypt = require("bcrypt");
const fs = require("node:fs");
const path = require("node:path");
const readline = require("node:readline/promises");
const { stdin: input, stdout: output } = require("node:process");

const DB_PATH = path.join(process.cwd(), "db.json");
const MIN_PASSWORD_LENGTH = 8;

function readDb() {
  const raw = fs.readFileSync(DB_PATH, "utf-8");
  return JSON.parse(raw);
}

function writeDb(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
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

    const db = readDb();
    const now = new Date().toISOString();
    const passwordHash = await bcrypt.hash(password, 10);
    const createdAt = db.admin?.createdAt || now;

    db.admin = {
      username,
      passwordHash,
      createdAt,
      updatedAt: now
    };

    writeDb(db);

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
