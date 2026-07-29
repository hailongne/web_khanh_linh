import { NextResponse } from "next/server";
import {
  destroySession,
  getSessionIdFromRequest,
  COOKIE_NAME
} from "../_lib/adminAuth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const sessionId = getSessionIdFromRequest(req);
    if (sessionId) {
      await destroySession(sessionId);
    }

    const response = NextResponse.json({
      success: true,
      message: "Đã đăng xuất thành công."
    });

    // Clear cookie
    response.cookies.set({
      name: COOKIE_NAME,
      value: "",
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      maxAge: 0
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi khi đăng xuất." },
      { status: 500 }
    );
  }
}
