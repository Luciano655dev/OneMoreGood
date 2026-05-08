import { OrdersDashboard } from "@/components/Admin/OrdersDashboard"
import {
  ADMIN_ORDERS_PAGE_SIZE,
  getOrdersListData,
  getOrdersOverviewData,
  normalizeAdminOrdersDashboardParams,
  type OrderSort,
} from "@/lib/admin/orders"

export const dynamic = "force-dynamic"

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string
    q?: string
    sort?: OrderSort
    range?: string
    days?: string
    from?: string
    to?: string
    chartMarket?: string
    page?: string
  }>
}) {
  const rawParams = await searchParams
  const params = normalizeAdminOrdersDashboardParams(rawParams)

  const [initialListData, initialOverviewData] = await Promise.all([
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

  return (
    <OrdersDashboard
      initialParams={params}
      initialListData={initialListData}
      initialOverviewData={initialOverviewData}
    />
  )
}
