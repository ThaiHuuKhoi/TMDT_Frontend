/** Base URL của backend (đã gồm /api), dùng cho fetch từ Server/Client. */
export function getPublicApiBaseUrl(): string {
  const raw = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api").trim();
  return raw.replace(/\/$/, "");
}
