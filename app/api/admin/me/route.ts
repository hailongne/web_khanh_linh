import { NextResponse } from "next/server";
import { getAuthenticatedAccount } from "../_lib/adminAuth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const account = await getAuthenticatedAccount(req);

    if (!account || !account.active) {
      return NextResponse.json(
        { success: false, error: "Unauthenticated" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: account.id,
        username: account.username,
        displayName: account.displayName || account.username,
        avatar: account.avatar || "",
        role: account.role,
        permissions: account.permissions || [],
        active: account.active,
        createdAt: account.createdAt,
        lastLogin: account.lastLogin
      }
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
