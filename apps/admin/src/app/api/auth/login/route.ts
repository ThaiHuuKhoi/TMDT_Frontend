import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getBackendApiBase } from "@/lib/backendApiUrl";
import { parseRefreshTokenFromResponse } from "@/lib/parseRefreshCookie";
import {
  ADMIN_ACCESS_COOKIE_MAX_AGE,
  ADMIN_REFRESH_COOKIE_MAX_AGE,
  adminSessionCookieOptions,
} from "@/lib/sessionCookies";

export async function POST(request: Request) {
  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }

  const { email, password } = body;
  if (!email || !password) {
    return NextResponse.json(
      { message: "Thiếu email hoặc mật khẩu" },
      { status: 400 }
    );
  }

  const base = getBackendApiBase();
  const res = await fetch(`${base}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = (await res.json().catch(() => ({}))) as {
    accessToken?: string;
    refreshToken?: string;
    message?: string;
  };

  if (!res.ok) {
    return NextResponse.json(
      { message: data.message || "Đăng nhập thất bại" },
      { status: res.status }
    );
  }

  const accessToken = data.accessToken;
  const refreshToken = parseRefreshTokenFromResponse(res) ?? data.refreshToken;
  if (!accessToken) {
    return NextResponse.json(
      { message: "Không nhận được access token" },
      { status: 502 }
    );
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
