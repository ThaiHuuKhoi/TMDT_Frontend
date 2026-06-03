import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getBackendApiBase } from "@/lib/backendApiUrl";
import { parseRefreshTokenFromResponse } from "@/lib/parseRefreshCookie";
import {
  CLIENT_ACCESS_COOKIE_MAX_AGE,
  CLIENT_REFRESH_COOKIE_MAX_AGE,
  clientSessionCookieOptions,
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
    message?: string;
    code?: string;
  };

  if (!res.ok) {
    return NextResponse.json(
      { message: data.message || "Đăng nhập thất bại", code: data.code },
      { status: res.status }
    );
  }

  const accessToken = data.accessToken;
  if (!accessToken) {
    return NextResponse.json(
      { message: "Không nhận được access token" },
      { status: 502 }
    );
  }

  const refreshToken = parseRefreshTokenFromResponse(res);
  const cookieStore = await cookies();
  cookieStore.set(
    "client_token",
    accessToken,
    clientSessionCookieOptions(CLIENT_ACCESS_COOKIE_MAX_AGE)
  );
  if (refreshToken) {
    cookieStore.set(
      "client_refresh",
      refreshToken,
      clientSessionCookieOptions(CLIENT_REFRESH_COOKIE_MAX_AGE)
    );
  }

  return NextResponse.json({ ok: true });
}
