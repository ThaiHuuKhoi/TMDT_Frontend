/** Lấy refreshToken từ Set-Cookie header của response backend. */
export function parseRefreshTokenFromResponse(res: Response): string | undefined {
  const headerApi = res.headers as Headers & { getSetCookie?: () => string[] };
  const setCookies =
    typeof headerApi.getSetCookie === "function"
      ? headerApi.getSetCookie()
      : [res.headers.get("set-cookie")].filter((v): v is string => !!v);

  for (const raw of setCookies) {
    const match = raw.match(/refreshToken=([^;]+)/);
    if (match?.[1]) {
      return decodeURIComponent(match[1]);
    }
  }
  return undefined;
}
