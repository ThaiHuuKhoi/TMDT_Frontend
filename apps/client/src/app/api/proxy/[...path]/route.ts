import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getBackendApiBase } from "@/lib/backendApiUrl";

const FORWARD_HEADER_NAMES = ["content-type"];

async function proxy(
  req: NextRequest,
  pathSegments: string[] | undefined
): Promise<NextResponse> {
  if (!pathSegments?.length) {
    return NextResponse.json({ message: "Thiếu path" }, { status: 400 });
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("client_token")?.value;
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const base = getBackendApiBase();
  const path = pathSegments.join("/");
  const target = `${base}/${path}${req.nextUrl.search}`;

  const headers = new Headers();
  headers.set("Authorization", `Bearer ${token}`);
  for (const name of FORWARD_HEADER_NAMES) {
    const v = req.headers.get(name);
    if (v) headers.set(name, v);
  }

  const hasBody = !["GET", "HEAD"].includes(req.method);
  const bodyBuf = hasBody ? await req.arrayBuffer() : null;
  const body = bodyBuf && bodyBuf.byteLength > 0 ? bodyBuf : undefined;

  const upstream = await fetch(target, {
    method: req.method,
    headers,
    body,
  });

  const outHeaders = new Headers();
  const ct = upstream.headers.get("content-type");
  if (ct) outHeaders.set("content-type", ct);

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: outHeaders,
  });
}

type RouteCtx = { params: Promise<{ path: string[] }> };

export async function GET(req: NextRequest, ctx: RouteCtx) {
  const { path } = await ctx.params;
  return proxy(req, path);
}

export async function POST(req: NextRequest, ctx: RouteCtx) {
  const { path } = await ctx.params;
  return proxy(req, path);
}

export async function PUT(req: NextRequest, ctx: RouteCtx) {
  const { path } = await ctx.params;
  return proxy(req, path);
}

export async function PATCH(req: NextRequest, ctx: RouteCtx) {
  const { path } = await ctx.params;
  return proxy(req, path);
}

export async function DELETE(req: NextRequest, ctx: RouteCtx) {
  const { path } = await ctx.params;
  return proxy(req, path);
}
