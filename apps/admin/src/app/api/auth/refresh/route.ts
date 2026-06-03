import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getBackendApiBase } from "@/lib/backendApiUrl";
import { parseRefreshTokenFromResponse } from "@/lib/parseRefreshCookie";
import {
  ADMIN_ACCESS_COOKIE_MAX_AGE,
  ADMIN_REFRESH_COOKIE_MAX_AGE,
  adminSessionCookieOptions,
} from "@/lib/sessionCookies";

/**
 * Làm mới access token bằng refresh đã lưu trong cookie httpOnly `admin_refresh`
 * (đăng nhập qua BFF không đưa Set-Cookie refresh của backend vào trình duyệt).
 */
export async function POST() {
  const cookieStore = await cookies();
  const refresh = cookieStore.get("admin_refresh")?.value;
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
    refreshToken?: string;
    message?: string;
  };

  if (!res.ok || !data.accessToken) {
    cookieStore.delete("admin_token");
    cookieStore.delete("admin_refresh");
    return NextResponse.json(
      { message: data.message || "Refresh thất bại" },
      { status: 401 }
    );
  }

  cookieStore.set(
    "admin_token",
    data.accessToken,
    adminSessionCookieOptions(ADMIN_ACCESS_COOKIE_MAX_AGE)
  );
  const newRefresh = parseRefreshTokenFromResponse(res) ?? data.refreshToken;
  if (newRefresh) {
    cookieStore.set(
      "admin_refresh",
      newRefresh,
      adminSessionCookieOptions(ADMIN_REFRESH_COOKIE_MAX_AGE)
    );
  }

  return NextResponse.json({ ok: true });
}
