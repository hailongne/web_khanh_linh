import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import {
  ADMIN_MIN_PASSWORD_LENGTH,
  isAuthorized,
  readDb,
  resolveAdminCredentials,
  verifyAdminCredentials,
  verifyPassword,
  writeDb
} from "../_lib/adminAuth";

function unauthorizedResponse() {
  return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
}

function badRequest(error: string) {
  return NextResponse.json({ success: false, error }, { status: 400 });
}

export async function GET(req: Request) {
  if (!(await isAuthorized(req))) {
    return unauthorizedResponse();
  }

  const db = readDb();
  const admin = resolveAdminCredentials(db);

  return NextResponse.json({
    success: true,
    data: {
      username: admin.username,
      createdAt: admin.createdAt ?? null,
      updatedAt: admin.updatedAt ?? null
    }
  });
}

export async function PUT(req: Request) {
  if (!(await isAuthorized(req))) {
    return unauthorizedResponse();
  }

  let payload: any;
  try {
    payload = await req.json();
  } catch {
    return badRequest("Invalid JSON body");
  }

  const action = typeof payload?.action === "string" ? payload.action.trim() : "";
  if (action !== "username" && action !== "password") {
    return badRequest("Invalid action");
  }

  const db = readDb();
  const current = resolveAdminCredentials(db);
  const now = new Date().toISOString();

  if (action === "username") {
    const currentUsername = typeof payload?.currentUsername === "string" ? payload.currentUsername.trim() : "";
    const newUsername = typeof payload?.newUsername === "string" ? payload.newUsername.trim() : "";
    const currentPassword = req.headers.get("x-admin-password")?.trim() || "";

    if (!currentUsername || !newUsername) {
      return badRequest("Username không được để trống.");
    }

    if (currentUsername !== current.username) {
      return badRequest("Username hiện tại không chính xác.");
    }

    if (newUsername === current.username) {
      return badRequest("Username mới không được trùng username hiện tại.");
    }

    if (!(await verifyAdminCredentials(currentUsername, currentPassword, current))) {
      return unauthorizedResponse();
    }

    const passwordHash = current.passwordHash || (await bcrypt.hash(currentPassword, 10));
    const createdAt = db.admin?.createdAt || current.createdAt || now;

    db.admin = {
      username: newUsername,
      passwordHash,
      createdAt,
      updatedAt: now
    };

    writeDb(db);

    return NextResponse.json({
      success: true,
      data: {
        username: newUsername,
        createdAt,
        updatedAt: now
      }
    });
  }

  const currentPassword = typeof payload?.currentPassword === "string" ? payload.currentPassword : "";
  const newPassword = typeof payload?.newPassword === "string" ? payload.newPassword : "";
  const confirmPassword = typeof payload?.confirmPassword === "string" ? payload.confirmPassword : "";
  const currentUsername = req.headers.get("x-admin-username")?.trim() || "";

  if (!currentPassword || !newPassword || !confirmPassword) {
    return badRequest("Vui lòng nhập đầy đủ các trường mật khẩu.");
  }

  if (newPassword !== confirmPassword) {
    return badRequest("Mật khẩu mới và xác nhận mật khẩu không khớp.");
  }

  if (newPassword.length < ADMIN_MIN_PASSWORD_LENGTH) {
    return badRequest(`Mật khẩu mới phải có ít nhất ${ADMIN_MIN_PASSWORD_LENGTH} ký tự.`);
  }

  if (!(await verifyAdminCredentials(currentUsername, currentPassword, current))) {
    return badRequest("Mật khẩu hiện tại không chính xác.");
  }

  const isSamePassword = await verifyPassword(newPassword, current);
  if (isSamePassword) {
    return badRequest("Mật khẩu mới không được trùng mật khẩu hiện tại.");
  }

  const newHash = await bcrypt.hash(newPassword, 10);
  const createdAt = db.admin?.createdAt || current.createdAt || now;

  db.admin = {
    username: current.username,
    passwordHash: newHash,
    createdAt,
    updatedAt: now
  };

  writeDb(db);

  return NextResponse.json({
    success: true,
    data: {
      username: current.username,
      createdAt,
      updatedAt: now
    }
  });
}
