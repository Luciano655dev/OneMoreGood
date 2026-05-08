import { NextResponse } from "next/server"

import { ADMIN_AUTH_COOKIE } from "@/lib/admin/auth"
import {
  ADMIN_ORDERS_PAGE_SIZE,
  getOrdersListData,
  getOrdersOverviewData,
  normalizeAdminOrdersDashboardParams,
} from "@/lib/admin/orders"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  try {
    const cookieHeader = req.headers.get("cookie") || ""
    const hasAdminCookie = cookieHeader
      .split(";")
      .map((part) => part.trim())
      .some((part) => part === `${ADMIN_AUTH_COOKIE}=1`)

    if (!hasAdminCookie) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
    }

    const url = new URL(req.url)
    const params = normalizeAdminOrdersDashboardParams({
      status: url.searchParams.get("status"),
      q: url.searchParams.get("q"),
      sort: url.searchParams.get("sort"),
      range: url.searchParams.get("range"),
      days: url.searchParams.get("days"),
      from: url.searchParams.get("from"),
      to: url.searchParams.get("to"),
      chartMarket: url.searchParams.get("chartMarket"),
      page: url.searchParams.get("page"),
    })
    const scope = String(url.searchParams.get("scope") || "all")
      .trim()
      .toLowerCase()

    if (scope === "list") {
      const data = await getOrdersListData({
        search: params.q,
        status: params.status,
        sort: params.sort,
        page: params.page,
        pageSize: ADMIN_ORDERS_PAGE_SIZE,
      })
      return NextResponse.json(data, {
        headers: { "Cache-Control": "no-store" },
      })
    }

    if (scope === "overview") {
      const data = await getOrdersOverviewData({
        rangeDays: params.days,
        startDate: params.from,
        endDate: params.to,
        chartMarket: params.chartMarket,
      })
      return NextResponse.json(data, {
        headers: { "Cache-Control": "no-store" },
      })
    }

    const [listData, overviewData] = await Promise.all([
      getOrdersListData({
        search: params.q,
        status: params.status,
        sort: params.sort,
        page: params.page,
        pageSize: ADMIN_ORDERS_PAGE_SIZE,
      }),
      getOrdersOverviewData({
        rangeDays: params.days,
        startDate: params.from,
        endDate: params.to,
        chartMarket: params.chartMarket,
      }),
    ])

    return NextResponse.json(
      {
        ...listData,
        ...overviewData,
      },
      {
        headers: { "Cache-Control": "no-store" },
      }
    )
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error && error.message
            ? error.message
            : "Could not load orders dashboard.",
      },
      { status: 500 }
    )
  }
}
