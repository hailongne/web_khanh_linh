import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import {
  readAccountsAsync,
  writeAccountAsync,
  createSession,
  COOKIE_NAME
} from "../_lib/adminAuth";
import { checkRateLimit, getClientIp } from "../../../lib/rateLimit";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  // Anti brute-force rate limit (max 5 login attempts per minute per IP)
  const clientIp = getClientIp(req);
  const rateLimit = checkRateLimit(`login:${clientIp}`, 5, 60000);
  if (!rateLimit.success) {
    return NextResponse.json(
      { success: false, error: `Bạn đã thử đăng nhập quá nhiều lần. Vui lòng thử lại sau ${rateLimit.resetInSeconds} giây.` },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const username = (body.username || "").trim();
    const password = body.password || "";

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: "Vui lòng nhập tên đăng nhập và mật khẩu." },
        { status: 400 }
      );
    }

    const accounts = await readAccountsAsync();
    const accountIndex = accounts.findIndex(
      (a) => a.username.toLowerCase() === username.toLowerCase()
    );

    if (accountIndex === -1) {
      return NextResponse.json(
        { success: false, error: "Tài khoản hoặc mật khẩu không chính xác." },
        { status: 401 }
      );
    }

    const account = accounts[accountIndex];

    if (!account.active) {
      return NextResponse.json(
        { success: false, error: "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên." },
        { status: 403 }
      );
    }

    const isMatch = bcrypt.compareSync(password, account.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: "Tài khoản hoặc mật khẩu không chính xác." },
        { status: 401 }
      );
    }

    // Update lastLogin
    const now = new Date().toISOString();
    accounts[accountIndex].lastLogin = now;
    accounts[accountIndex].updatedAt = now;
    await writeAccountAsync(accounts[accountIndex]);

    // Create session UUID in sessions.json
    const sessionId = await createSession(account.id);

    const response = NextResponse.json({
      success: true,
      message: "Đăng nhập thành công",
      user: {
        id: account.id,
        username: account.username,
        displayName: account.displayName || account.username,
        avatar: account.avatar || "",
        role: account.role,
        permissions: account.permissions || []
      }
    });

    // Set HTTP-Only Cookie
    response.cookies.set({
      name: COOKIE_NAME,
      value: sessionId,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    return response;
  } catch (error: unknown) {
    console.error("Login error:", error);
    if (error instanceof Error && error.message === "DATABASE_CONNECTION_ERROR") {
      return NextResponse.json(
        { success: false, error: "Hệ thống CSDL tạm thời không thể kết nối. Vui lòng kiểm tra cấu hình hoặc thử lại sau." },
        { status: 503 }
      );
    }

    const errorMsg = process.env.NODE_ENV === "production" ? "Lỗi hệ thống khi đăng nhập." : (error instanceof Error ? error.message : "Lỗi hệ thống khi đăng nhập.");
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
