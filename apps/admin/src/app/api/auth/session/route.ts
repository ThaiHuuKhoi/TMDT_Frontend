import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  ADMIN_ACCESS_COOKIE_MAX_AGE,
  ADMIN_REFRESH_COOKIE_MAX_AGE,
  adminSessionCookieOptions,
} from "@/lib/sessionCookies";

export async function POST(request: Request) {
  let body: { accessToken?: string; refreshToken?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }

  const { accessToken, refreshToken } = body;
  if (!accessToken) {
    return NextResponse.json({ message: "Thiếu accessToken" }, { status: 400 });
  }

  const cookieStore = await cookies();
  cookieStore.set(
    "admin_token",
    accessToken,
    adminSessionCookieOptions(ADMIN_ACCESS_COOKIE_MAX_AGE)
  );
  if (refreshToken) {
    cookieStore.set(
      "admin_refresh",
      refreshToken,
      adminSessionCookieOptions(ADMIN_REFRESH_COOKIE_MAX_AGE)
    );
  }

  return NextResponse.json({ ok: true });
}
