import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getBackendApiBase } from "@/lib/backendApiUrl";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get("client_token")?.value;

  if (token) {
    const base = getBackendApiBase();
    try {
      await fetch(`${base}/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      /* best effort */
    }
  }

  cookieStore.delete("client_token");
  cookieStore.delete("client_refresh");

  return NextResponse.json({ ok: true });
}
