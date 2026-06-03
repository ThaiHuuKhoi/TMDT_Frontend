/**
 * Base URL của backend Spring (ví dụ http://localhost:8080/api).
 * Ưu tiên BACKEND_API_URL (chỉ server) để không phụ thuộc NEXT_PUBLIC khi deploy.
 */
export function getBackendApiBase(): string {
  const raw = (
    process.env.BACKEND_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_AUTH_SERVICE_URL ||
    "http://localhost:8080/api"
  ).trim();
  return raw.replace(/\/$/, "");
}
