import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getBackendApiBase } from "@/lib/backendApiUrl";
import { parseRefreshTokenFromResponse } from "@/lib/parseRefreshCookie";
import {
  CLIENT_ACCESS_COOKIE_MAX_AGE,
  CLIENT_REFRESH_COOKIE_MAX_AGE,
  clientSessionCookieOptions,
} from "@/lib/sessionCookies";

export async function POST() {
  const cookieStore = await cookies();
  const refresh = cookieStore.get("client_refresh")?.value;
  if (!refresh) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const base = getBackendApiBase();
  const res = await fetch(`${base}/auth/refresh-token`, {
    method: "POST",
    headers: {
      Cookie: `refreshToken=${encodeURIComponent(refresh)}`,
    },
  });

  const data = (await res.json().catch(() => ({}))) as {
    accessToken?: string;
    message?: string;
  };

  if (!res.ok || !data.accessToken) {
    cookieStore.delete("client_token");
    cookieStore.delete("client_refresh");
    return NextResponse.json(
      { message: data.message || "Refresh thất bại" },
      { status: 401 }
    );
  }

  const newRefresh = parseRefreshTokenFromResponse(res) ?? refresh;
  cookieStore.set(
    "client_token",
    data.accessToken,
    clientSessionCookieOptions(CLIENT_ACCESS_COOKIE_MAX_AGE)
  );
  cookieStore.set(
    "client_refresh",
    newRefresh,
    clientSessionCookieOptions(CLIENT_REFRESH_COOKIE_MAX_AGE)
  );

  return NextResponse.json({ ok: true });
}
