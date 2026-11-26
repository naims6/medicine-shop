import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const BACKEND = process.env.BACKEND_API_URL?.replace(/\/$/, "") ?? "http://localhost:5000";

export async function GET(request: NextRequest) {
  const returnTo = request.nextUrl.searchParams.get("returnTo") ?? "/dashboard";

  try {
    const refreshRes = await fetch(`${BACKEND}/api/v1/auth/refresh`, {
      method: "POST",
      headers: { Cookie: request.headers.get("cookie") ?? "" },
      cache: "no-store",
    });

    if (!refreshRes.ok) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    const response = NextResponse.redirect(new URL(returnTo, request.url));

    for (const raw of refreshRes.headers.getSetCookie()) {
      response.headers.append("Set-Cookie", raw);
    }

    return response;
  } catch {
    return NextResponse.redirect(new URL("/", request.url));
  }
}
