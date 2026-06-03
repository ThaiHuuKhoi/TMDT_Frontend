import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  CLIENT_ACCESS_COOKIE_MAX_AGE,
  CLIENT_REFRESH_COOKIE_MAX_AGE,
  clientSessionCookieOptions,
} from "@/lib/sessionCookies";

/** Lưu phiên sau OAuth (refresh cookie nằm trên domain backend). */
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
