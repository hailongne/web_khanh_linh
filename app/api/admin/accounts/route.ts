import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import {
  getAuthenticatedAccount,
  readAccounts,
  writeAccounts,
  Account,
  Role,
  ADMIN_MIN_PASSWORD_LENGTH
} from "../_lib/adminAuth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const currentAccount = await getAuthenticatedAccount(req);
  if (!currentAccount || currentAccount.role !== "SUPER_ADMIN") {
    return NextResponse.json({ success: false, error: "403 Forbidden - Chỉ SUPER_ADMIN mới có quyền truy cập." }, { status: 403 });
  }

  try {
    const accounts = readAccounts();
    // Return sanitized accounts without passwordHash
    const sanitized = accounts.map(({ passwordHash, ...rest }) => rest);
    return NextResponse.json({ success: true, data: sanitized });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const currentAccount = await getAuthenticatedAccount(req);
  if (!currentAccount || currentAccount.role !== "SUPER_ADMIN") {
    return NextResponse.json({ success: false, error: "403 Forbidden - Chỉ SUPER_ADMIN mới có quyền tạo tài khoản." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const username = (body.username || "").trim();
    const password = body.password || "";
    const displayName = (body.displayName || "").trim() || username;
    const avatar = (body.avatar || "").trim();
    const role = (body.role || "ADMIN") as Role;
    const permissions = Array.isArray(body.permissions) ? body.permissions : [];
    const active = body.active !== undefined ? Boolean(body.active) : true;

    if (!username) {
      return NextResponse.json({ success: false, error: "Tên đăng nhập không được để trống." }, { status: 400 });
    }

    if (!password || password.length < ADMIN_MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        { success: false, error: `Mật khẩu phải có ít nhất ${ADMIN_MIN_PASSWORD_LENGTH} ký tự.` },
        { status: 400 }
      );
    }

    const accounts = readAccounts();
    if (accounts.some((a) => a.username.toLowerCase() === username.toLowerCase())) {
      return NextResponse.json({ success: false, error: "Tên đăng nhập đã tồn tại trên hệ thống." }, { status: 400 });
    }

    const now = new Date().toISOString();
    const passwordHash = bcrypt.hashSync(password, 10);

    const newAccount: Account = {
      id: `acc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      username,
      passwordHash,
      displayName,
      avatar,
      role,
      permissions,
      active,
      createdAt: now,
      updatedAt: now,
      lastLogin: ""
    };

    accounts.push(newAccount);
    writeAccounts(accounts);

    const { passwordHash: _, ...result } = newAccount;
    return NextResponse.json({
      success: true,
      message: "Tạo tài khoản thành công.",
      data: result
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const currentAccount = await getAuthenticatedAccount(req);
  if (!currentAccount || currentAccount.role !== "SUPER_ADMIN") {
    return NextResponse.json({ success: false, error: "403 Forbidden - Chỉ SUPER_ADMIN mới có quyền chỉnh sửa tài khoản." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { id, username, password, displayName, avatar, role, permissions, active } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Thiếu ID tài khoản cần sửa." }, { status: 400 });
    }

    const accounts = readAccounts();
    const idx = accounts.findIndex((a) => a.id === id);

    if (idx === -1) {
      return NextResponse.json({ success: false, error: "Không tìm thấy tài khoản." }, { status: 404 });
    }

    const existingAcc = accounts[idx];

    // Username check if changed
    if (username && username.trim().toLowerCase() !== existingAcc.username.toLowerCase()) {
      const trimmedUser = username.trim();
      if (accounts.some((a) => a.id !== id && a.username.toLowerCase() === trimmedUser.toLowerCase())) {
        return NextResponse.json({ success: false, error: "Tên đăng nhập đã bị sử dụng bởi tài khoản khác." }, { status: 400 });
      }
      existingAcc.username = trimmedUser;
    }

    if (password) {
      if (password.length < ADMIN_MIN_PASSWORD_LENGTH) {
        return NextResponse.json({ success: false, error: `Mật khẩu phải có ít nhất ${ADMIN_MIN_PASSWORD_LENGTH} ký tự.` }, { status: 400 });
      }
      existingAcc.passwordHash = bcrypt.hashSync(password, 10);
    }

    if (displayName !== undefined) existingAcc.displayName = displayName.trim();
    if (avatar !== undefined) existingAcc.avatar = avatar.trim();
    if (role !== undefined) existingAcc.role = role as Role;
    if (permissions !== undefined && Array.isArray(permissions)) existingAcc.permissions = permissions;
    if (active !== undefined) existingAcc.active = Boolean(active);
    existingAcc.updatedAt = new Date().toISOString();

    accounts[idx] = existingAcc;
    writeAccounts(accounts);

    const { passwordHash: _, ...result } = existingAcc;
    return NextResponse.json({
      success: true,
      message: "Cập nhật tài khoản thành công.",
      data: result
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const currentAccount = await getAuthenticatedAccount(req);
  if (!currentAccount || currentAccount.role !== "SUPER_ADMIN") {
    return NextResponse.json({ success: false, error: "403 Forbidden - Chỉ SUPER_ADMIN mới có quyền xóa tài khoản." }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Thiếu tham số id tài khoản." }, { status: 400 });
    }

    if (id === currentAccount.id) {
      return NextResponse.json({ success: false, error: "Không thể tự xóa tài khoản của chính mình." }, { status: 400 });
    }

    const accounts = readAccounts();
    const filtered = accounts.filter((a) => a.id !== id);

    if (filtered.length === accounts.length) {
      return NextResponse.json({ success: false, error: "Không tìm thấy tài khoản để xóa." }, { status: 404 });
    }

    writeAccounts(filtered);
    return NextResponse.json({ success: true, message: "Xóa tài khoản thành công." });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
