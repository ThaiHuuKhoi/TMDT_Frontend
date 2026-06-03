import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = ["/login", "/unauthorized"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublicRoute =
    publicRoutes.includes(pathname) || pathname.startsWith("/oauth2");

  const token = request.cookies.get("admin_token")?.value;

  if (!token) {
    if (!isPublicRoute) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  const meRes = await fetch(new URL("/api/auth/me", request.url), {
    headers: { cookie: request.headers.get("cookie") ?? "" },
    cache: "no-store",
  });

  if (!meRes.ok) {
    const response = isPublicRoute
      ? NextResponse.next()
      : NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("admin_token");
    response.cookies.delete("admin_refresh");
    return response;
  }

  const user = (await meRes.json()) as { role?: string };

  if (pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const role = user.role;
  const isAdmin = role === "ADMIN" || role === "ROLE_ADMIN";
  if (!isAdmin && pathname !== "/unauthorized") {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
