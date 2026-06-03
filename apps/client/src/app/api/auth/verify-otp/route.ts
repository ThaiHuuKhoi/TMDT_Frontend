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
  let body: { email?: string; otpCode?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }

  const { email, otpCode } = body;
  if (!email || !otpCode) {
    return NextResponse.json({ message: "Thiếu email hoặc OTP" }, { status: 400 });
  }

  const base = getBackendApiBase();
  const res = await fetch(`${base}/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otpCode }),
  });

  const data = (await res.json().catch(() => ({}))) as {
    accessToken?: string;
    message?: string;
    code?: string;
  };

  if (!res.ok) {
    return NextResponse.json(
      { message: data.message || "Xác thực OTP thất bại", code: data.code },
      { status: res.status }
    );
  }

  if (!data.accessToken) {
    return NextResponse.json(
      { message: "Không nhận được access token" },
      { status: 502 }
    );
  }

  const refreshToken = parseRefreshTokenFromResponse(res);
  const cookieStore = await cookies();
  cookieStore.set(
    "client_token",
    data.accessToken,
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
