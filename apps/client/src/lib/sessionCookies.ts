/** Khớp mặc định jwt.expiration 10h (ms) trong backend. */
export const CLIENT_ACCESS_COOKIE_MAX_AGE = 60 * 60 * 10;

/** Refresh token backend mặc định 7 ngày. */
export const CLIENT_REFRESH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

export function clientSessionCookieOptions(maxAge: number) {
  const secure = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure,
    sameSite: (secure ? "strict" : "lax") as "strict" | "lax",
    path: "/",
    maxAge,
  };
}
