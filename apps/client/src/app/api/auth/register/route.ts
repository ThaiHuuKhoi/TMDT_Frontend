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
  let body: { name?: string; email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }

  const { name, email, password } = body;
  if (!name || !email || !password) {
    return NextResponse.json({ message: "Thiếu thông tin đăng ký" }, { status: 400 });
  }

  const base = getBackendApiBase();
  const res = await fetch(`${base}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });

  const data = (await res.json().catch(() => ({}))) as {
    requiresOtp?: boolean;
    message?: string;
    accessToken?: string;
    code?: string;
  };

  if (!res.ok) {
    return NextResponse.json(
      { message: data.message || "Đăng ký thất bại", code: data.code },
      { status: res.status }
    );
  }

  if (data.requiresOtp) {
    return NextResponse.json({ requiresOtp: true, message: data.message });
  }

  const accessToken = data.accessToken;
  if (!accessToken) {
    return NextResponse.json({ message: "Không nhận được access token" }, { status: 502 });
  }

  const refreshToken = parseRefreshTokenFromResponse(res);
  const cookieStore = await cookies();
  cookieStore.set("client_token", accessToken, clientSessionCookieOptions(CLIENT_ACCESS_COOKIE_MAX_AGE));
  if (refreshToken) {
    cookieStore.set("client_refresh", refreshToken, clientSessionCookieOptions(CLIENT_REFRESH_COOKIE_MAX_AGE));
  }

  return NextResponse.json({ requiresOtp: false });
}
