import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getBackendApiBase } from "@/lib/backendApiUrl";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const base = getBackendApiBase();
  const res = await fetch(`${base}/users/profile`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const u = (await res.json()) as {
    id: number;
    email: string;
    name?: string;
    role?: string;
    avatar?: string | null;
  };

  return NextResponse.json({
    id: String(u.id),
    email: u.email,
    name: u.name,
    role: u.role,
    imageUrl: u.avatar ?? undefined,
  });
}
