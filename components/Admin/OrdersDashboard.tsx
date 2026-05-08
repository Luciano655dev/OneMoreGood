"use client"

import Link from "next/link"
import {
  startTransition,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react"

import AdminNavbar from "@/components/Admin/AdminNavbar"
import colors from "@/components/colors"
import RoughBorder from "@/components/Home/Objects/RoughBorder"
import SectionTitle from "@/components/Home/Objects/SectionTitle"
import PageGridBackground from "@/components/Layout/PageGridBackground"
import {
  formatOrderMarketLabel,
  formatOrderMoney,
  formatOrderStatus,
  getOrderCurrencyForMarket,
  getOrderDisplayName,
  getStatusColors,
  ORDER_STATUSES,
  type AdminOrdersDashboardParams,
  type DailySocksPoint,
  type OrderMarket,
  type OrdersListData,
  type OrdersOverviewData,
  type OrderSort,
} from "@/lib/admin/orders"

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

type ChartDraft = {
  days: string
  from: string
  to: string
  chartMarket: "all" | OrderMarket
}

type AppliedChartState = {
  days: number
  from: string
  to: string
  chartMarket: "all" | OrderMarket
}

type ListFilters = {
  q: string
  status: string
  sort: OrderSort
  page: number
}

type OrdersDashboardProps = {
  initialParams: AdminOrdersDashboardParams
  initialListData: OrdersListData
  initialOverviewData: OrdersOverviewData
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
          <span>{formatOrderMoney(summary.grossRevenueCents, currency)}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span style={{ color: colors.muted }}>Products</span>
          <span>{formatOrderMoney(summary.productsSubtotalCents, currency)}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span style={{ color: colors.muted }}>Shipping</span>
          <span>{formatOrderMoney(summary.shippingCollectedCents, currency)}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span style={{ color: colors.muted }}>Promo</span>
          <span>{formatOrderMoney(summary.promoSavingsCents, currency)}</span>
        </div>
      </div>
    </div>
  )
}

function getLoadingSectionStyle(isPending: boolean) {
  return {
    opacity: isPending ? 0.72 : 1,
    transition: "opacity 120ms ease",
  }
}

function getDisabledControlStyle(isDisabled: boolean) {
  return {
    opacity: isDisabled ? 0.55 : 1,
    cursor: isDisabled ? "not-allowed" : "pointer",
  }
}

function buildOrdersPageUrl(
  listFilters: ListFilters,
  chartState: AppliedChartState
) {
  const params = new URLSearchParams()

  if (listFilters.q) params.set("q", listFilters.q)
  if (listFilters.status !== "all") params.set("status", listFilters.status)
  if (listFilters.sort !== "newest") params.set("sort", listFilters.sort)
  if (chartState.days) params.set("days", String(chartState.days))
  if (chartState.from) params.set("from", chartState.from)
  if (chartState.to) params.set("to", chartState.to)
  if (chartState.chartMarket !== "all") {
    params.set("chartMarket", chartState.chartMarket)
  }
  if (listFilters.page > 1) params.set("page", String(listFilters.page))

  const query = params.toString()
  return query ? `/admin/orders?${query}` : "/admin/orders"
}

function buildListApiUrl(filters: ListFilters) {
  const params = new URLSearchParams()
  params.set("scope", "list")
  if (filters.q) params.set("q", filters.q)
  if (filters.status !== "all") params.set("status", filters.status)
  if (filters.sort !== "newest") params.set("sort", filters.sort)
  if (filters.page > 1) params.set("page", String(filters.page))
  return `/api/admin/orders?${params.toString()}`
}

function buildOverviewApiUrl(chartState: ChartDraft) {
  const params = new URLSearchParams()
  params.set("scope", "overview")
  params.set("days", chartState.days)
  if (chartState.from) params.set("from", chartState.from)
  if (chartState.to) params.set("to", chartState.to)
  if (chartState.chartMarket !== "all") {
    params.set("chartMarket", chartState.chartMarket)
  }
  return `/api/admin/orders?${params.toString()}`
}

async function requestOrdersList(filters: ListFilters) {
  const response = await fetch(buildListApiUrl(filters), {
    cache: "no-store",
  })
  const payload = (await response.json()) as OrdersListData & {
    error?: string
  }

  if (!response.ok) {
    throw new Error(payload.error || "Could not load orders.")
  }

  return payload
}

async function requestOrdersOverview(chartState: ChartDraft) {
  const response = await fetch(buildOverviewApiUrl(chartState), {
    cache: "no-store",
  })
  const payload = (await response.json()) as OrdersOverviewData & {
    error?: string
  }

  if (!response.ok) {
    throw new Error(payload.error || "Could not load order overview.")
  }

  return payload
}

export function OrdersDashboard({
  initialParams,
  initialListData,
  initialOverviewData,
}: OrdersDashboardProps) {
  const [listData, setListData] = useState(initialListData)
  const [overviewData, setOverviewData] = useState(initialOverviewData)
  const [searchInput, setSearchInput] = useState(initialParams.q)
  const [statusFilter, setStatusFilter] = useState(initialParams.status)
  const [sortFilter, setSortFilter] = useState<OrderSort>(initialParams.sort)
  const [listFilters, setListFilters] = useState<ListFilters>({
    q: initialParams.q,
    status: initialParams.status,
    sort: initialParams.sort,
    page: initialListData.page,
  })
  const [chartDraft, setChartDraft] = useState<ChartDraft>({
    days: String(initialOverviewData.rangeDays),
    from: initialOverviewData.rangeStartDate,
    to: initialOverviewData.rangeEndDate,
    chartMarket: initialParams.chartMarket,
  })
  const [appliedChartState, setAppliedChartState] = useState<AppliedChartState>({
    days: initialOverviewData.rangeDays,
    from: initialOverviewData.rangeStartDate,
    to: initialOverviewData.rangeEndDate,
    chartMarket: initialParams.chartMarket,
  })
  const [listError, setListError] = useState("")
  const [overviewError, setOverviewError] = useState("")
  const [isListPending, setIsListPending] = useState(false)
  const [isOverviewPending, setIsOverviewPending] = useState(false)
  const [queuedListRequest, setQueuedListRequest] = useState<ListFilters | null>(
    null
  )
  const [queuedOverviewRequest, setQueuedOverviewRequest] =
    useState<ChartDraft | null>(null)
  const listRequestIdRef = useRef(0)
  const overviewRequestIdRef = useRef(0)

  function syncUrl(
    nextListFilters: ListFilters,
    nextChartState: AppliedChartState
  ) {
    window.history.replaceState(
      null,
      "",
      buildOrdersPageUrl(nextListFilters, nextChartState)
    )
  }

  const fetchListData = useEffectEvent(async (nextFilters: ListFilters) => {
    const requestId = listRequestIdRef.current + 1
    listRequestIdRef.current = requestId
    setIsListPending(true)
    setListError("")

    try {
      const payload = await requestOrdersList(nextFilters)
      if (requestId !== listRequestIdRef.current) {
        return
      }

      startTransition(() => {
        setListData(payload)
        setListFilters({
          ...nextFilters,
          page: payload.page,
        })
        syncUrl(
          {
            ...nextFilters,
            page: payload.page,
          },
          appliedChartState
        )
      })
    } catch (error) {
      if (requestId !== listRequestIdRef.current) {
        return
      }
      setListError(
        error instanceof Error && error.message
          ? error.message
          : "Could not load orders."
      )
    } finally {
      if (requestId === listRequestIdRef.current) {
        setIsListPending(false)
        setQueuedListRequest((current) =>
          current === nextFilters ? null : current
        )
      }
    }
  })

  const fetchOverviewData = useEffectEvent(async (nextDraft: ChartDraft) => {
    const requestId = overviewRequestIdRef.current + 1
    overviewRequestIdRef.current = requestId
    setIsOverviewPending(true)
    setOverviewError("")

    try {
      const payload = await requestOrdersOverview(nextDraft)
      if (requestId !== overviewRequestIdRef.current) {
        return
      }

      const nextChartState: AppliedChartState = {
        days: payload.rangeDays,
        from: payload.rangeStartDate,
        to: payload.rangeEndDate,
        chartMarket: nextDraft.chartMarket,
      }

      startTransition(() => {
        setOverviewData(payload)
        setAppliedChartState(nextChartState)
        setChartDraft({
          days: String(payload.rangeDays),
          from: payload.rangeStartDate,
          to: payload.rangeEndDate,
          chartMarket: nextDraft.chartMarket,
        })
        syncUrl(listFilters, nextChartState)
      })
    } catch (error) {
      if (requestId !== overviewRequestIdRef.current) {
        return
      }
      setOverviewError(
        error instanceof Error && error.message
          ? error.message
          : "Could not load order overview."
      )
    } finally {
      if (requestId === overviewRequestIdRef.current) {
        setIsOverviewPending(false)
        setQueuedOverviewRequest((current) =>
          current === nextDraft ? null : current
        )
      }
    }
  })

  useEffect(() => {
    if (!queuedListRequest) {
      return
    }

    void fetchListData(queuedListRequest)
  }, [queuedListRequest])

  useEffect(() => {
    if (!queuedOverviewRequest) {
      return
    }

    void fetchOverviewData(queuedOverviewRequest)
  }, [queuedOverviewRequest])

  useEffect(() => {
    const nextSearch = searchInput.trim()
    if (
      nextSearch === listFilters.q &&
      statusFilter === listFilters.status &&
      sortFilter === listFilters.sort
    ) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      setQueuedListRequest({
        q: nextSearch,
        status: statusFilter,
        sort: sortFilter,
        page: 1,
      })
    }, 250)

    return () => window.clearTimeout(timeoutId)
  }, [
    searchInput,
    statusFilter,
    sortFilter,
    listFilters.q,
    listFilters.status,
    listFilters.sort,
  ])

  const chartBarsData = buildChartBars(overviewData.socksByDay)
  const chartBars = chartBarsData.bars
  const bucketSize = chartBarsData.bucketSize
  const maxSocksByBar = Math.max(1, ...chartBars.map((point) => point.socks))
  const chartLabelStep = Math.max(1, Math.ceil(chartBars.length / 10))
  const showPerBarValue = chartBars.length <= 36
  const chartViewLabel =
    bucketSize === 1 ? "Daily bars" : `Grouped bars (${bucketSize} days each)`
  const chartMarketLabel =
    appliedChartState.chartMarket === "all"
      ? "all markets"
      : formatOrderMarketLabel(appliedChartState.chartMarket)
  const dayCount = overviewData.socksByDay.length
  const totalSocksInRange = overviewData.socksByDay.reduce(
    (sum, point) => sum + point.socks,
    0
  )
  const avgSocksPerDay =
    dayCount > 0 ? (totalSocksInRange / dayCount).toFixed(1) : "0.0"
  const rangeFormatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  })
  const rangeStartLabel = overviewData.rangeStartDate
    ? rangeFormatter.format(new Date(`${overviewData.rangeStartDate}T00:00:00.000Z`))
    : "N/A"
  const rangeEndLabel = overviewData.rangeEndDate
    ? rangeFormatter.format(new Date(`${overviewData.rangeEndDate}T00:00:00.000Z`))
    : "N/A"
  const usSalesSubtotalCents = overviewData.summaryByCurrency.usd.productsSubtotalCents
  const brSalesSubtotalCents = overviewData.summaryByCurrency.brl.productsSubtotalCents
  const combinedSubtotalCents = Math.round(
    usSalesSubtotalCents + brSalesSubtotalCents / 6
  )
  const hasPreviousPage = listData.page > 1
  const hasNextPage = listData.page < listData.totalOrderPages
  const pageStart =
    listData.totalFilteredOrders === 0
      ? 0
      : (listData.page - 1) * listData.pageSize + 1
  const pageEnd = Math.min(
    listData.page * listData.pageSize,
    listData.totalFilteredOrders
  )

  function handleStatusChange(event: ChangeEvent<HTMLSelectElement>) {
    setStatusFilter(event.target.value)
  }

  function handleSortChange(event: ChangeEvent<HTMLSelectElement>) {
    setSortFilter(event.target.value as OrderSort)
  }

  function handleChartDraftChange(
    key: keyof ChartDraft,
    value: ChartDraft[keyof ChartDraft]
  ) {
    setChartDraft((current) => ({
      ...current,
      [key]: value,
    }))
  }

  function handlePageChange(nextPage: number) {
    if (nextPage < 1 || nextPage === listData.page) {
      return
    }

    setQueuedListRequest({
      q: listFilters.q,
      status: listFilters.status,
      sort: listFilters.sort,
      page: nextPage,
    })
  }

  function handleChartSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setQueuedOverviewRequest(chartDraft)
  }

  function handleChartReset() {
    const nextDraft: ChartDraft = {
      days: "14",
      from: "",
      to: "",
      chartMarket: "all",
    }
    setChartDraft(nextDraft)
    setQueuedOverviewRequest(nextDraft)
  }

  function handlePresetRange(days: number) {
    const nextDraft: ChartDraft = {
      days: String(days),
      from: "",
      to: "",
      chartMarket: chartDraft.chartMarket,
    }
    setChartDraft(nextDraft)
    setQueuedOverviewRequest(nextDraft)
  }

  return (
    <div style={{ background: colors.paper, color: colors.ink }}>
      <PageGridBackground />
      <section className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-16">
        <SectionTitle
          kicker="Admin"
          title="Orders dashboard"
          desc="Review purchases, sort them, update shipping progress, and mark final completion."
        />

        <AdminNavbar currentPath="/admin/orders" />

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
              value={overviewData.summary.totalItemsSold}
              bg="#DDECE9"
            />
            <StatCard
              label="Brazil sales subtotal"
              value={formatOrderMoney(brSalesSubtotalCents, "brl")}
              bg={colors.paper}
            />
            <StatCard
              label="US sales subtotal"
              value={formatOrderMoney(usSalesSubtotalCents, "usd")}
              bg={colors.paper}
            />
            <StatCard
              label="Subtotal combined (US + BR/6)"
              value={formatOrderMoney(combinedSubtotalCents, "usd")}
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
            <MarketSummaryCards
              market="US"
              summary={overviewData.summaryByCurrency.usd}
            />
            <MarketSummaryCards
              market="BR"
              summary={overviewData.summaryByCurrency.brl}
            />
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
              value={overviewData.summary.totalOrders}
              bg={colors.sand}
            />
            <StatCard
              label="Paid orders (counted)"
              value={overviewData.summary.countedOrders}
              bg={colors.paper}
            />
            <StatCard
              label="Open"
              value={overviewData.summary.openOrders}
              bg="#F4E8D2"
            />
            <StatCard
              label="Shipped"
              value={overviewData.summary.shippedOrders}
              bg="#D8ECEE"
            />
            <StatCard
              label="Completed"
              value={overviewData.summary.completedOrders}
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
            label={`Socks purchased per day (last ${overviewData.rangeDays} days)`}
          >
            <div aria-busy={isOverviewPending} style={getLoadingSectionStyle(isOverviewPending)}>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div
                  className="text-[11px] font-black uppercase tracking-widest"
                  style={{ color: colors.muted }}
                >
                  {chartViewLabel} • {chartMarketLabel} • {chartBars.length} bars
                </div>
                <div
                  className="text-[11px] font-black uppercase tracking-widest"
                  style={{ color: isOverviewPending ? colors.accent : colors.muted }}
                >
                  {isOverviewPending ? "Updating chart..." : "Chart ready"}
                </div>
              </div>

              {overviewError ? (
                <div
                  className="mb-4 p-3 text-sm font-black"
                  style={{
                    background: colors.sand,
                    border: `2px dashed ${colors.ink}`,
                    color: colors.clay,
                  }}
                >
                  {overviewError}
                </div>
              ) : null}

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

              <form
                className="mb-4 grid gap-3 md:grid-cols-[140px_220px_220px_220px_auto]"
                onSubmit={handleChartSubmit}
              >
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
                    value={chartDraft.days}
                    disabled={isOverviewPending}
                    onChange={(event) => {
                      handleChartDraftChange("days", event.target.value)
                    }}
                    className="mt-2 w-full px-3 py-3 text-sm font-black outline-none"
                    style={{
                      background: colors.paper,
                      border: `2px solid ${colors.ink}`,
                      ...getDisabledControlStyle(isOverviewPending),
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
                    value={chartDraft.from}
                    disabled={isOverviewPending}
                    onChange={(event) => {
                      handleChartDraftChange("from", event.target.value)
                    }}
                    className="mt-2 w-full px-3 py-3 text-sm font-black outline-none"
                    style={{
                      background: colors.paper,
                      border: `2px solid ${colors.ink}`,
                      ...getDisabledControlStyle(isOverviewPending),
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
                    value={chartDraft.to}
                    disabled={isOverviewPending}
                    onChange={(event) => {
                      handleChartDraftChange("to", event.target.value)
                    }}
                    className="mt-2 w-full px-3 py-3 text-sm font-black outline-none"
                    style={{
                      background: colors.paper,
                      border: `2px solid ${colors.ink}`,
                      ...getDisabledControlStyle(isOverviewPending),
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
                    value={chartDraft.chartMarket}
                    disabled={isOverviewPending}
                    onChange={(event) => {
                      handleChartDraftChange(
                        "chartMarket",
                        event.target.value as "all" | OrderMarket
                      )
                    }}
                    className="mt-2 w-full px-3 py-3 text-sm font-black outline-none"
                    style={{
                      background: colors.paper,
                      border: `2px solid ${colors.ink}`,
                      ...getDisabledControlStyle(isOverviewPending),
                    }}
                  >
                    <option value="all">All markets</option>
                    <option value="US">{formatOrderMarketLabel("US")}</option>
                    <option value="BR">{formatOrderMarketLabel("BR")}</option>
                  </select>
                </div>

                <div className="flex items-end gap-2">
                  <button
                    type="submit"
                    disabled={isOverviewPending}
                    className="px-4 py-3 text-xs font-black uppercase tracking-widest"
                    style={{
                      background: colors.accent,
                      color: colors.paper,
                      border: `2px solid ${colors.ink}`,
                      boxShadow: `3px 3px 0 ${colors.ink}`,
                      ...getDisabledControlStyle(isOverviewPending),
                    }}
                  >
                    Apply
                  </button>
                  <button
                    type="button"
                    onClick={handleChartReset}
                    disabled={isOverviewPending}
                    className="px-4 py-3 text-xs font-black uppercase tracking-widest"
                    style={{
                      background: colors.paper,
                      border: `2px solid ${colors.ink}`,
                      boxShadow: `3px 3px 0 ${colors.ink}`,
                      ...getDisabledControlStyle(isOverviewPending),
                    }}
                  >
                    Reset
                  </button>
                </div>
              </form>

              <div className="mb-4 flex flex-wrap gap-2">
                {rangeOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handlePresetRange(option)}
                    disabled={isOverviewPending}
                    className="btnInteractive px-3 py-2 text-[11px] font-black uppercase tracking-widest"
                    style={{
                      background:
                        option === overviewData.rangeDays ? colors.accent : colors.paper,
                      color:
                        option === overviewData.rangeDays ? colors.paper : colors.ink,
                      border: `2px solid ${colors.ink}`,
                      boxShadow: `2px 2px 0 ${colors.ink}`,
                      ...getDisabledControlStyle(isOverviewPending),
                    }}
                  >
                    {option}d
                  </button>
                ))}
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
            </div>
          </RoughBorder>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
          <RoughBorder bg={colors.sand} label="Filters">
            <div
              className="grid gap-4"
              aria-busy={isListPending}
              style={getLoadingSectionStyle(isListPending)}
            >
              <div>
                <label
                  className="text-[11px] font-black uppercase tracking-widest"
                  style={{ color: colors.muted }}
                >
                  Search order or customer
                </label>
                <input
                  type="text"
                  name="q"
                  value={searchInput}
                  disabled={isListPending}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Name, ID or email"
                  className="mt-2 w-full px-3 py-3 text-sm font-black outline-none"
                  style={{
                    background: colors.paper,
                    border: `2px solid ${colors.ink}`,
                    ...getDisabledControlStyle(isListPending),
                  }}
                />
                <p className="mt-1 text-[11px]" style={{ color: colors.muted }}>
                  Search by customer name, order code, or email.
                </p>
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
                  value={statusFilter}
                  disabled={isListPending}
                  onChange={handleStatusChange}
                  className="mt-2 w-full px-3 py-3 text-sm font-black outline-none"
                  style={{
                    background: colors.paper,
                    border: `2px solid ${colors.ink}`,
                    ...getDisabledControlStyle(isListPending),
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
                  value={sortFilter}
                  disabled={isListPending}
                  onChange={handleSortChange}
                  className="mt-2 w-full px-3 py-3 text-sm font-black outline-none"
                  style={{
                    background: colors.paper,
                    border: `2px solid ${colors.ink}`,
                    ...getDisabledControlStyle(isListPending),
                  }}
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div
                className="text-[11px] font-black uppercase tracking-widest"
                style={{ color: isListPending ? colors.accent : colors.muted }}
              >
                {isListPending ? "Updating orders..." : "Filters update automatically"}
              </div>
            </div>
          </RoughBorder>

          <RoughBorder bg={colors.paper} label="Orders">
            <div aria-busy={isListPending} style={getLoadingSectionStyle(isListPending)}>
              {listError ? (
                <div
                  className="mb-4 p-3 text-sm font-black"
                  style={{
                    background: colors.sand,
                    border: `2px dashed ${colors.ink}`,
                    color: colors.clay,
                  }}
                >
                  {listError}
                </div>
              ) : null}

              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div
                  className="text-[11px] font-black uppercase tracking-widest"
                  style={{ color: colors.muted }}
                >
                  {listData.totalFilteredOrders === 0
                    ? "No matching orders"
                    : `Showing ${pageStart}-${pageEnd} of ${listData.totalFilteredOrders} orders`}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handlePageChange(listData.page - 1)}
                    disabled={!hasPreviousPage || isListPending}
                    className="px-3 py-2 text-[11px] font-black uppercase tracking-widest"
                    style={{
                      background: colors.paper,
                      color: colors.ink,
                      border: `2px solid ${colors.ink}`,
                      boxShadow: `2px 2px 0 ${colors.ink}`,
                      opacity: hasPreviousPage && !isListPending ? 1 : 0.45,
                      cursor:
                        hasPreviousPage && !isListPending ? "pointer" : "not-allowed",
                    }}
                  >
                    Previous
                  </button>

                  <div
                    className="px-3 py-2 text-[11px] font-black uppercase tracking-widest"
                    style={{
                      background: colors.sand,
                      border: `2px solid ${colors.ink}`,
                      boxShadow: `2px 2px 0 ${colors.ink}`,
                    }}
                  >
                    Page {listData.page} of {listData.totalOrderPages}
                  </div>

                  <button
                    type="button"
                    onClick={() => handlePageChange(listData.page + 1)}
                    disabled={!hasNextPage || isListPending}
                    className="px-3 py-2 text-[11px] font-black uppercase tracking-widest"
                    style={{
                      background: colors.paper,
                      color: colors.ink,
                      border: `2px solid ${colors.ink}`,
                      boxShadow: `2px 2px 0 ${colors.ink}`,
                      opacity: hasNextPage && !isListPending ? 1 : 0.45,
                      cursor:
                        hasNextPage && !isListPending ? "pointer" : "not-allowed",
                    }}
                  >
                    Next
                  </button>
                </div>
              </div>

              {listData.orders.length === 0 ? (
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
                  {listData.orders.map((order) => {
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
                          <div aria-hidden="true" style={{ background: tone.rail }} />
                          <div className="p-4">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <div className="text-lg font-black">
                                  {getOrderDisplayName(order)}
                                </div>
                                <div
                                  className="mt-1 text-sm"
                                  style={{ color: colors.muted }}
                                >
                                  {order.order_id}
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
                                  {formatOrderMoney(order.total_cents, order.currency)}
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
                                  {formatOrderMoney(
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

              {listData.orders.length > 0 ? (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <div
                    className="text-[11px] font-black uppercase tracking-widest"
                    style={{ color: colors.muted }}
                  >
                    Page {listData.page} of {listData.totalOrderPages}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handlePageChange(listData.page - 1)}
                      disabled={!hasPreviousPage || isListPending}
                      className="px-3 py-2 text-[11px] font-black uppercase tracking-widest"
                      style={{
                        background: colors.paper,
                        color: colors.ink,
                        border: `2px solid ${colors.ink}`,
                        boxShadow: `2px 2px 0 ${colors.ink}`,
                        opacity: hasPreviousPage && !isListPending ? 1 : 0.45,
                        cursor:
                          hasPreviousPage && !isListPending ? "pointer" : "not-allowed",
                      }}
                    >
                      Previous
                    </button>

                    <button
                      type="button"
                      onClick={() => handlePageChange(listData.page + 1)}
                      disabled={!hasNextPage || isListPending}
                      className="px-3 py-2 text-[11px] font-black uppercase tracking-widest"
                      style={{
                        background: colors.paper,
                        color: colors.ink,
                        border: `2px solid ${colors.ink}`,
                        boxShadow: `2px 2px 0 ${colors.ink}`,
                        opacity: hasNextPage && !isListPending ? 1 : 0.45,
                        cursor:
                          hasNextPage && !isListPending ? "pointer" : "not-allowed",
                      }}
                    >
                      Next
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </RoughBorder>
        </div>
      </section>
    </div>
  )
}
