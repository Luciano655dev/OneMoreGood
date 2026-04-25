import { NextResponse } from "next/server"

import { detectShippingCountryFromHeaders } from "@/lib/geo-country"

export async function GET(req: Request) {
  const country = detectShippingCountryFromHeaders(req.headers)

  return NextResponse.json({
    ok: true,
    country,
  })
}
