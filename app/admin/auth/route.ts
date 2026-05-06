import { cookies } from "next/headers"
import { NextResponse } from "next/server"

import {
  ADMIN_AUTH_COOKIE,
  isAdminPasswordValid,
} from "@/lib/admin/auth"

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function POST(req: Request) {
  const formData = await req.formData()
  const password = String(formData.get("password") || "")

  try {
    if (!isAdminPasswordValid(password)) {
      await wait(1200)
      return NextResponse.redirect(
        new URL("/admin/login?error=invalid", req.url),
        303
      )
    }
  } catch {
    return NextResponse.redirect(
      new URL("/admin/login?error=missing", req.url),
      303
    )
  }

  const cookieStore = await cookies()
  cookieStore.set(ADMIN_AUTH_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  })

  return NextResponse.redirect(new URL("/admin/orders", req.url), 303)
}
