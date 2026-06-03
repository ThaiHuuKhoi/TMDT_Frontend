export function getBackendApiBase(): string {
  const raw = (
    process.env.BACKEND_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8080/api"
  ).trim();
  return raw.replace(/\/$/, "");
}
