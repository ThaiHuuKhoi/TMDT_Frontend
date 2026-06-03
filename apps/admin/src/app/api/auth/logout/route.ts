import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getBackendApiBase } from "@/lib/backendApiUrl";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;

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

  cookieStore.delete("admin_token");
  cookieStore.delete("admin_refresh");

  return NextResponse.json({ ok: true });
}
