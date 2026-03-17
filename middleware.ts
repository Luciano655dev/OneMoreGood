import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

import { ADMIN_AUTH_COOKIE } from "@/lib/admin/auth"

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next()
  }

  if (
    pathname === "/admin/login" ||
    pathname === "/admin/auth"
  ) {
    return NextResponse.next()
  }

  const isAuthed = req.cookies.get(ADMIN_AUTH_COOKIE)?.value === "1"
  if (isAuthed) {
    return NextResponse.next()
  }

  const loginUrl = new URL("/admin/login", req.url)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ["/admin/:path*"],
}
