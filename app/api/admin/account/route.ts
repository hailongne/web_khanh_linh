import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import {
  ADMIN_MIN_PASSWORD_LENGTH,
  getAuthenticatedAccount,
  readAccounts,
  writeAccounts
} from "../_lib/adminAuth";

export const dynamic = "force-dynamic";

function unauthorizedResponse() {
  return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
}

function badRequest(error: string) {
  return NextResponse.json({ success: false, error }, { status: 400 });
}

export async function GET(req: Request) {
  const account = await getAuthenticatedAccount(req);
  if (!account || !account.active) {
    return unauthorizedResponse();
  }

  return NextResponse.json({
    success: true,
    data: {
      username: account.username,
      displayName: account.displayName || account.username,
      role: account.role,
      createdAt: account.createdAt || null,
      updatedAt: account.updatedAt || null
    }
  });
}

export async function PUT(req: Request) {
  const account = await getAuthenticatedAccount(req);
  if (!account || !account.active) {
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

  const accounts = readAccounts();
  const accIndex = accounts.findIndex((a) => a.id === account.id);
  if (accIndex === -1) {
    return unauthorizedResponse();
  }

  const current = accounts[accIndex];
  const now = new Date().toISOString();

  if (action === "username") {
    const currentUsername = typeof payload?.currentUsername === "string" ? payload.currentUsername.trim() : "";
    const newUsername = typeof payload?.newUsername === "string" ? payload.newUsername.trim() : "";

    if (!currentUsername || !newUsername) {
      return badRequest("Username không được để trống.");
    }

    if (currentUsername.toLowerCase() !== current.username.toLowerCase()) {
      return badRequest("Username hiện tại không chính xác.");
    }

    if (newUsername.toLowerCase() === current.username.toLowerCase()) {
      return badRequest("Username mới không được trùng username hiện tại.");
    }

    if (accounts.some((a) => a.id !== current.id && a.username.toLowerCase() === newUsername.toLowerCase())) {
      return badRequest("Username mới đã bị sử dụng bởi tài khoản khác.");
    }

    accounts[accIndex].username = newUsername;
    accounts[accIndex].updatedAt = now;
    writeAccounts(accounts);

    return NextResponse.json({
      success: true,
      data: {
        username: newUsername,
        createdAt: current.createdAt,
        updatedAt: now
      }
    });
  }

  const currentPassword = typeof payload?.currentPassword === "string" ? payload.currentPassword : "";
  const newPassword = typeof payload?.newPassword === "string" ? payload.newPassword : "";
  const confirmPassword = typeof payload?.confirmPassword === "string" ? payload.confirmPassword : "";

  if (!currentPassword || !newPassword || !confirmPassword) {
    return badRequest("Vui lòng nhập đầy đủ các trường mật khẩu.");
  }

  if (newPassword !== confirmPassword) {
    return badRequest("Mật khẩu mới và xác nhận mật khẩu không khớp.");
  }

  if (newPassword.length < ADMIN_MIN_PASSWORD_LENGTH) {
    return badRequest(`Mật khẩu mới phải có ít nhất ${ADMIN_MIN_PASSWORD_LENGTH} ký tự.`);
  }

  if (!bcrypt.compareSync(currentPassword, current.passwordHash)) {
    return badRequest("Mật khẩu hiện tại không chính xác.");
  }

  if (bcrypt.compareSync(newPassword, current.passwordHash)) {
    return badRequest("Mật khẩu mới không được trùng mật khẩu hiện tại.");
  }

  const newHash = bcrypt.hashSync(newPassword, 10);
  accounts[accIndex].passwordHash = newHash;
  accounts[accIndex].updatedAt = now;
  writeAccounts(accounts);

  return NextResponse.json({
    success: true,
    data: {
      username: current.username,
      createdAt: current.createdAt,
      updatedAt: now
    }
  });
}
