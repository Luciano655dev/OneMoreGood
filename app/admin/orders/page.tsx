import Link from "next/link"

import FormSubmitButton from "@/components/Admin/FormSubmitButton"
import colors from "@/components/colors"
import RoughBorder from "@/components/Home/Objects/RoughBorder"
import SectionTitle from "@/components/Home/Objects/SectionTitle"
import PageGridBackground from "@/components/Layout/PageGridBackground"
import {
  normalizeChartMarketFilter,
  ORDER_STATUSES,
  formatOrderMarketLabel,
  formatOrderStatus,
  getOrderCurrencyForMarket,
  getStatusColors,
  listOrders,
  moneyFromCents,
  type DailySocksPoint,
  type OrderMarket,
  type OrderSort,
} from "@/lib/admin/orders"

export const dynamic = "force-dynamic"

const sortOptions: Array<{ value: OrderSort; label: string }> = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "total_desc", label: "Highest total" },
  { value: "total_asc", label: "Lowest total" },
  { value: "status", label: "Status" },
]

const rangeOptions = [7, 14, 30, 90, 180, 365]

type ChartBar = {
  id: string
  label: string
  socks: number
  title: string
}

function buildChartBars(points: DailySocksPoint[]) {
  const MAX_BARS = 56
  const safePoints = Array.isArray(points) ? points : []

  if (safePoints.length === 0) {
    return { bars: [] as ChartBar[], bucketSize: 1 }
  }

  const bucketSize = Math.max(1, Math.ceil(safePoints.length / MAX_BARS))
  const bars: ChartBar[] = []

  for (let index = 0; index < safePoints.length; index += bucketSize) {
    const bucket = safePoints.slice(index, index + bucketSize)
    const start = bucket[0]
    const end = bucket[bucket.length - 1]
    const socks = bucket.reduce((sum, point) => sum + point.socks, 0)
    const isSingle = bucket.length === 1

    bars.push({
      id: `${start.date}-${end.date}`,
      label: end.label,
      socks,
      title: isSingle
        ? `${start.label}: ${socks} socks`
        : `${start.label} - ${end.label}: ${socks} socks`,
    })
  }

  return { bars, bucketSize }
}

function StatCard({
  label,
  value,
  bg,
}: {
  label: string
  value: string | number
  bg: string
}) {
  return (
    <div
      className="p-4"
      style={{
        background: bg,
        border: `2px solid ${colors.ink}`,
        boxShadow: `3px 3px 0 ${colors.ink}`,
      }}
    >
      <div
        className="text-[11px] font-black uppercase tracking-widest"
        style={{ color: colors.muted }}
      >
        {label}
      </div>
      <div className="mt-2 text-2xl font-black">{value}</div>
    </div>
  )
}

function MarketSummaryCards({
  market,
  summary,
}: {
  market: OrderMarket
  summary: {
    countedOrders: number
    grossRevenueCents: number
    productsSubtotalCents: number
    shippingCollectedCents: number
    promoSavingsCents: number
  }
}) {
  const currency = getOrderCurrencyForMarket(market)
  return (
    <div
      className="p-4"
      style={{
        background: colors.paper,
        border: `2px solid ${colors.ink}`,
        boxShadow: `3px 3px 0 ${colors.ink}`,
      }}
    >
      <div
        className="text-[11px] font-black uppercase tracking-widest"
        style={{ color: colors.muted }}
      >
        {formatOrderMarketLabel(market)}
      </div>

      <div className="mt-2 grid gap-2 text-sm font-black">
        <div className="flex items-center justify-between gap-3">
          <span style={{ color: colors.muted }}>Counted orders</span>
          <span>{summary.countedOrders}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span style={{ color: colors.muted }}>Revenue</span>
          <span>{moneyFromCents(summary.grossRevenueCents, currency)}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span style={{ color: colors.muted }}>Products</span>
          <span>{moneyFromCents(summary.productsSubtotalCents, currency)}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span style={{ color: colors.muted }}>Shipping</span>
          <span>{moneyFromCents(summary.shippingCollectedCents, currency)}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span style={{ color: colors.muted }}>Promo</span>
          <span>{moneyFromCents(summary.promoSavingsCents, currency)}</span>
        </div>
      </div>
    </div>
  )
}

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
  }>
}) {
  const params = await searchParams
  const status = params.status || "all"
  const q = params.q || ""
  const sort = params.sort || "newest"
  const chartMarket = normalizeChartMarketFilter(params.chartMarket)
  const parsedRange = Number(params.days || params.range || 14)
  const requestedRangeDays = Number.isFinite(parsedRange) ? parsedRange : 14
  const {
    orders,
    summary,
    summaryByCurrency,
    socksByDay,
    rangeDays,
    rangeStartDate,
    rangeEndDate,
  } = await listOrders({
    status,
    search: q,
    sort,
    rangeDays: requestedRangeDays,
    startDate: params.from,
    endDate: params.to,
    chartMarket,
  })
  const { bars: chartBars, bucketSize } = buildChartBars(socksByDay)
  const maxSocksByBar = Math.max(1, ...chartBars.map((point) => point.socks))
  const chartLabelStep = Math.max(1, Math.ceil(chartBars.length / 10))
  const showPerBarValue = chartBars.length <= 36
  const chartViewLabel =
    bucketSize === 1 ? "Daily bars" : `Grouped bars (${bucketSize} days each)`
  const dayCount = socksByDay.length
  const totalSocksInRange = socksByDay.reduce((sum, point) => sum + point.socks, 0)
  const avgSocksPerDay =
    dayCount > 0 ? (totalSocksInRange / dayCount).toFixed(1) : "0.0"
  const rangeFormatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  })
  const rangeStartLabel = rangeStartDate
    ? rangeFormatter.format(new Date(`${rangeStartDate}T00:00:00.000Z`))
    : "N/A"
  const rangeEndLabel = rangeEndDate
    ? rangeFormatter.format(new Date(`${rangeEndDate}T00:00:00.000Z`))
    : "N/A"

  const baseChartParams = new URLSearchParams()
  if (q) baseChartParams.set("q", q)
  if (status) baseChartParams.set("status", status)
  if (sort) baseChartParams.set("sort", sort)
  if (chartMarket !== "all") baseChartParams.set("chartMarket", chartMarket)
  const baseChartQuery = baseChartParams.toString()
  const baseChartHref = baseChartQuery
    ? `/admin/orders?${baseChartQuery}`
    : "/admin/orders"

  const chartMarketLabel =
    chartMarket === "all" ? "all markets" : formatOrderMarketLabel(chartMarket)
  const usSalesSubtotalCents = summaryByCurrency.usd.productsSubtotalCents
  const brSalesSubtotalCents = summaryByCurrency.brl.productsSubtotalCents
  const combinedSubtotalCents = Math.round(usSalesSubtotalCents + brSalesSubtotalCents / 6)

  return (
    <div style={{ background: colors.paper, color: colors.ink }}>
      <PageGridBackground />
      <section className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-16">
        <SectionTitle
          kicker="Admin"
          title="Orders dashboard"
          desc="Review purchases, sort them, update shipping progress, and mark final completion."
        />

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/admin/orders/new"
            className="btnInteractive inline-flex px-4 py-3 text-xs font-black uppercase tracking-widest"
            style={{
              background: colors.accent,
              color: colors.paper,
              border: `2px solid ${colors.ink}`,
              boxShadow: `3px 3px 0 ${colors.ink}`,
            }}
          >
            Log offline purchase
          </Link>

          <Link
            href="/admin/stock"
            className="btnInteractive inline-flex px-4 py-3 text-xs font-black uppercase tracking-widest"
            style={{
              background: colors.paper,
              border: `2px solid ${colors.ink}`,
              boxShadow: `3px 3px 0 ${colors.ink}`,
            }}
          >
            Manage stock
          </Link>

          <form action="/admin/logout" method="post">
            <FormSubmitButton
              idleLabel="Log out"
              pendingLabel="Logging out..."
              className="px-4 py-3 text-xs font-black uppercase tracking-widest"
              style={{
                background: colors.paper,
                border: `2px solid ${colors.ink}`,
                boxShadow: `3px 3px 0 ${colors.ink}`,
              }}
            />
          </form>
        </div>

        <div className="mt-8">
          <div
            className="text-[11px] font-black uppercase tracking-widest"
            style={{ color: colors.muted }}
          >
            Sales totals (combined)
          </div>
          <div className="mt-2 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Amount of items"
              value={summary.totalItemsSold}
              bg="#DDECE9"
            />
            <StatCard
              label="Brazil sales subtotal"
              value={moneyFromCents(brSalesSubtotalCents, "brl")}
              bg={colors.paper}
            />
            <StatCard
              label="US sales subtotal"
              value={moneyFromCents(usSalesSubtotalCents, "usd")}
              bg={colors.paper}
            />
            <StatCard
              label="Subtotal combined (US + BR/6)"
              value={moneyFromCents(combinedSubtotalCents, "usd")}
              bg={colors.paper}
            />
          </div>
        </div>

        <div className="mt-4">
          <div
            className="text-[11px] font-black uppercase tracking-widest"
            style={{ color: colors.muted }}
          >
            Sales totals by market
          </div>
          <div className="mt-2 grid gap-3 md:grid-cols-2">
            <MarketSummaryCards market="US" summary={summaryByCurrency.usd} />
            <MarketSummaryCards market="BR" summary={summaryByCurrency.brl} />
          </div>
        </div>

        <div className="mt-4">
          <div
            className="text-[11px] font-black uppercase tracking-widest"
            style={{ color: colors.muted }}
          >
            Order status
          </div>
          <div className="mt-2 grid gap-3 md:grid-cols-3 xl:grid-cols-5">
            <StatCard
              label="All orders"
              value={summary.totalOrders}
              bg={colors.sand}
            />
            <StatCard
              label="Paid orders (counted)"
              value={summary.countedOrders}
              bg={colors.paper}
            />
            <StatCard label="Open" value={summary.openOrders} bg="#F4E8D2" />
            <StatCard label="Shipped" value={summary.shippedOrders} bg="#D8ECEE" />
            <StatCard
              label="Completed"
              value={summary.completedOrders}
              bg="#DFE8E9"
            />
          </div>
        </div>

        <p className="mt-3 text-xs font-black" style={{ color: colors.muted }}>
          Revenue totals include only paid, packed, shipped, and completed orders.
          Test, canceled, and refunded orders are excluded.
        </p>

        <div className="mt-6">
          <RoughBorder
            bg={colors.paper}
            label={`Socks purchased per day (last ${rangeDays} days)`}
          >
            <div className="mb-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
              {[
                ["From", rangeStartLabel],
                ["To", rangeEndLabel],
                ["Days", String(dayCount)],
                ["Socks", String(totalSocksInRange)],
                ["Avg/day", avgSocksPerDay],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="p-3"
                  style={{
                    background: colors.sand,
                    border: `2px solid ${colors.ink}`,
                    boxShadow: `2px 2px 0 ${colors.ink}`,
                  }}
                >
                  <div
                    className="text-[11px] font-black uppercase tracking-widest"
                    style={{ color: colors.muted }}
                  >
                    {label}
                  </div>
                  <div className="mt-1 text-xl font-black">{value}</div>
                </div>
              ))}
            </div>

            <form className="mb-4 grid gap-3 md:grid-cols-[140px_220px_220px_220px_auto]">
              <input type="hidden" name="q" value={q} />
              <input type="hidden" name="status" value={status} />
              <input type="hidden" name="sort" value={sort} />

              <div>
                <label
                  className="text-[11px] font-black uppercase tracking-widest"
                  style={{ color: colors.muted }}
                >
                  Days
                </label>
                <input
                  name="days"
                  type="number"
                  min={1}
                  max={365}
                  defaultValue={rangeDays}
                  className="mt-2 w-full px-3 py-3 text-sm font-black outline-none"
                  style={{
                    background: colors.paper,
                    border: `2px solid ${colors.ink}`,
                  }}
                />
              </div>

              <div>
                <label
                  className="text-[11px] font-black uppercase tracking-widest"
                  style={{ color: colors.muted }}
                >
                  From
                </label>
                <input
                  name="from"
                  type="date"
                  defaultValue={rangeStartDate}
                  className="mt-2 w-full px-3 py-3 text-sm font-black outline-none"
                  style={{
                    background: colors.paper,
                    border: `2px solid ${colors.ink}`,
                  }}
                />
              </div>

              <div>
                <label
                  className="text-[11px] font-black uppercase tracking-widest"
                  style={{ color: colors.muted }}
                >
                  To
                </label>
                <input
                  name="to"
                  type="date"
                  defaultValue={rangeEndDate}
                  className="mt-2 w-full px-3 py-3 text-sm font-black outline-none"
                  style={{
                    background: colors.paper,
                    border: `2px solid ${colors.ink}`,
                  }}
                />
              </div>

              <div>
                <label
                  className="text-[11px] font-black uppercase tracking-widest"
                  style={{ color: colors.muted }}
                >
                  Market
                </label>
                <select
                  name="chartMarket"
                  defaultValue={chartMarket}
                  className="mt-2 w-full px-3 py-3 text-sm font-black outline-none"
                  style={{
                    background: colors.paper,
                    border: `2px solid ${colors.ink}`,
                  }}
                >
                  <option value="all">All markets</option>
                  <option value="US">{formatOrderMarketLabel("US")}</option>
                  <option value="BR">{formatOrderMarketLabel("BR")}</option>
                </select>
              </div>

              <div className="flex items-end gap-2">
                <FormSubmitButton
                  idleLabel="Apply"
                  pendingLabel="Applying..."
                  className="px-4 py-3 text-xs font-black uppercase tracking-widest"
                  style={{
                    background: colors.accent,
                    color: colors.paper,
                    border: `2px solid ${colors.ink}`,
                    boxShadow: `3px 3px 0 ${colors.ink}`,
                  }}
                />
                <Link
                  href={baseChartHref}
                  className="btnInteractive inline-flex px-4 py-3 text-xs font-black uppercase tracking-widest"
                  style={{
                    background: colors.paper,
                    border: `2px solid ${colors.ink}`,
                    boxShadow: `3px 3px 0 ${colors.ink}`,
                  }}
                >
                  Reset
                </Link>
              </div>
            </form>

            <div className="mb-4 flex flex-wrap gap-2">
              {rangeOptions.map((option) => {
                const presetParams = new URLSearchParams(baseChartParams)
                presetParams.set("days", String(option))
                const presetQuery = presetParams.toString()
                const presetHref = presetQuery
                  ? `/admin/orders?${presetQuery}`
                  : "/admin/orders"
                return (
                  <Link
                    key={option}
                    href={presetHref}
                    className="btnInteractive px-3 py-2 text-[11px] font-black uppercase tracking-widest"
                    style={{
                      background: option === rangeDays ? colors.accent : colors.paper,
                      color: option === rangeDays ? colors.paper : colors.ink,
                      border: `2px solid ${colors.ink}`,
                      boxShadow: `2px 2px 0 ${colors.ink}`,
                    }}
                  >
                    {option}d
                  </Link>
                )
              })}
            </div>

            <div
              className="mb-2 text-[11px] font-black uppercase tracking-widest"
              style={{ color: colors.muted }}
            >
              {chartViewLabel} • {chartMarketLabel} • {chartBars.length} bars
            </div>

            <div
              className="grid gap-1"
              style={{
                gridTemplateColumns: `repeat(${Math.max(1, chartBars.length)}, minmax(0, 1fr))`,
              }}
            >
              {chartBars.map((point, index) => {
                const height = Math.round((point.socks / maxSocksByBar) * 180)
                const showLabel =
                  index % chartLabelStep === 0 || index === chartBars.length - 1

                return (
                  <div key={point.id} className="flex min-w-0 flex-col items-center">
                    <div
                      className="mb-1 text-[10px] font-black"
                      style={{
                        opacity: showPerBarValue ? 1 : 0,
                        height: showPerBarValue ? "auto" : 0,
                        overflow: "hidden",
                      }}
                    >
                      {point.socks}
                    </div>
                    <div
                      className="flex w-full items-end justify-center"
                      style={{
                        height: 190,
                        borderBottom: `2px solid ${colors.ink}`,
                      }}
                    >
                      <div
                        title={point.title}
                        style={{
                          width: "95%",
                          height: Math.max(6, height),
                          background: colors.accent,
                          border: `2px solid ${colors.ink}`,
                          boxShadow: `2px 2px 0 ${colors.ink}`,
                        }}
                      />
                    </div>
                    <div
                      className="mt-2 w-full truncate text-center text-[10px] font-black uppercase tracking-widest"
                      style={{ color: colors.muted }}
                      title={showLabel ? point.label : point.title}
                    >
                      {showLabel ? point.label : ""}
                    </div>
                  </div>
                )
              })}
            </div>
          </RoughBorder>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
          <RoughBorder bg={colors.sand} label="Filters">
            <form className="grid gap-4">
              <input type="hidden" name="chartMarket" value={chartMarket} />
              <div>
                <label
                  className="text-[11px] font-black uppercase tracking-widest"
                  style={{ color: colors.muted }}
                >
                  Search
                </label>
                <input
                  type="text"
                  name="q"
                  defaultValue={q}
                  placeholder="Order ID, email, name"
                  className="mt-2 w-full px-3 py-3 text-sm font-black outline-none"
                  style={{
                    background: colors.paper,
                    border: `2px solid ${colors.ink}`,
                  }}
                />
              </div>

              <div>
                <label
                  className="text-[11px] font-black uppercase tracking-widest"
                  style={{ color: colors.muted }}
                >
                  Status
                </label>
                <select
                  name="status"
                  defaultValue={status}
                  className="mt-2 w-full px-3 py-3 text-sm font-black outline-none"
                  style={{
                    background: colors.paper,
                    border: `2px solid ${colors.ink}`,
                  }}
                >
                  <option value="all">All statuses</option>
                  {ORDER_STATUSES.map((option) => (
                    <option key={option} value={option}>
                      {formatOrderStatus(option)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  className="text-[11px] font-black uppercase tracking-widest"
                  style={{ color: colors.muted }}
                >
                  Sort
                </label>
                <select
                  name="sort"
                  defaultValue={sort}
                  className="mt-2 w-full px-3 py-3 text-sm font-black outline-none"
                  style={{
                    background: colors.paper,
                    border: `2px solid ${colors.ink}`,
                  }}
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <FormSubmitButton
                idleLabel="Apply filters"
                pendingLabel="Applying..."
                className="mt-2 px-4 py-3 text-xs font-black uppercase tracking-widest"
                style={{
                  background: colors.accent,
                  color: colors.paper,
                  border: `2px solid ${colors.ink}`,
                  boxShadow: `3px 3px 0 ${colors.ink}`,
                }}
              />
            </form>
          </RoughBorder>

          <RoughBorder bg={colors.paper} label="Orders">
            {orders.length === 0 ? (
              <div
                className="p-4 text-sm"
                style={{
                  background: colors.sand,
                  border: `2px solid ${colors.ink}`,
                }}
              >
                No orders matched these filters.
              </div>
            ) : (
              <div className="grid gap-4">
                {orders.map((order) => {
                  const tone = getStatusColors(order.status)

                  return (
                    <Link
                      key={order.id}
                      href={`/admin/orders/${order.id}`}
                      className="block overflow-hidden"
                      style={{
                        background: tone.soft,
                        border: `2px solid ${colors.ink}`,
                        boxShadow: `3px 3px 0 ${colors.ink}`,
                      }}
                    >
                      <div className="grid min-h-[176px] md:grid-cols-[16px_minmax(0,1fr)]">
                        <div
                          aria-hidden="true"
                          style={{ background: tone.rail }}
                        />
                        <div className="p-4">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <div className="text-lg font-black">{order.order_id}</div>
                              <div
                                className="mt-1 text-sm"
                                style={{ color: colors.muted }}
                              >
                                {order.customer_email}
                              </div>
                            </div>
                            <span
                              className="inline-flex items-center px-3 py-2 text-[11px] font-black uppercase tracking-widest"
                              style={{
                                background: tone.bg,
                                color: tone.color,
                                border: `2px solid ${colors.ink}`,
                                boxShadow: `2px 2px 0 ${colors.ink}`,
                              }}
                            >
                              {formatOrderStatus(order.status)}
                            </span>
                          </div>

                          <div className="mt-4 grid gap-3 md:grid-cols-5">
                            <div>
                              <div
                                className="text-[11px] font-black uppercase tracking-widest"
                                style={{ color: colors.muted }}
                              >
                                Total
                              </div>
                              <div className="mt-1 font-black">
                                {moneyFromCents(order.total_cents, order.currency)}
                              </div>
                            </div>
                            <div>
                              <div
                                className="text-[11px] font-black uppercase tracking-widest"
                                style={{ color: colors.muted }}
                              >
                                Shipping
                              </div>
                              <div className="mt-1 font-black">
                                {moneyFromCents(
                                  order.shipping_cents,
                                  order.currency
                                )}
                              </div>
                            </div>
                            <div>
                              <div
                                className="text-[11px] font-black uppercase tracking-widest"
                                style={{ color: colors.muted }}
                              >
                                Market
                              </div>
                              <div className="mt-1 font-black">
                                {formatOrderMarketLabel(order.market)}
                              </div>
                            </div>
                            <div>
                              <div
                                className="text-[11px] font-black uppercase tracking-widest"
                                style={{ color: colors.muted }}
                              >
                                Tracking
                              </div>
                              <div className="mt-1 font-black">
                                {order.tracking_number || "Not added"}
                              </div>
                            </div>
                            <div>
                              <div
                                className="text-[11px] font-black uppercase tracking-widest"
                                style={{ color: colors.muted }}
                              >
                                Created
                              </div>
                              <div className="mt-1 font-black">
                                {new Date(order.created_at).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </RoughBorder>
        </div>
      </section>
    </div>
  )
}
