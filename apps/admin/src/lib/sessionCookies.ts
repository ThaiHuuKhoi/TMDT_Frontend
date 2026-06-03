/** Thời gian sống cookie access: khớp mặc định jwt.expiration 10h (ms) trong backend. */
export const ADMIN_ACCESS_COOKIE_MAX_AGE = 60 * 60 * 10;

/** Refresh token backend mặc định 7 ngày. */
export const ADMIN_REFRESH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

export function adminSessionCookieOptions(maxAge: number) {
  const secure = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure,
    sameSite: (secure ? "strict" : "lax") as "strict" | "lax",
    path: "/",
    maxAge,
  };
}
