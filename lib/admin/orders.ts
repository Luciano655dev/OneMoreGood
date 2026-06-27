import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/server"
import { isMissingCurrencyColumnError } from "@/lib/supabase/errors"
import {
  getCurrencyForCountry,
  normalizeShippingCountry,
} from "@/lib/commerce"

export const ORDER_STATUSES = [
  "pending",
  "paid",
  "packed",
  "shipped",
  "completed",
  "test",
  "canceled",
  "refunded",
] as const

export type OrderStatus = (typeof ORDER_STATUSES)[number]
export const ORDER_CURRENCIES = ["usd", "brl"] as const
export type OrderCurrency = (typeof ORDER_CURRENCIES)[number]
export const ORDER_MARKETS = ["US", "BR"] as const
export type OrderMarket = (typeof ORDER_MARKETS)[number]

export type OrderListItem = {
  id: string
  order_id: string
  customer_email: string
  status: OrderStatus | string
  market: OrderMarket
  currency: OrderCurrency
  subtotal_cents: number
  promo_savings_cents: number
  shipping_cents: number
  total_cents: number
  shipping_name: string | null
  tracking_number: string | null
  tracking_carrier: string | null
  created_at: string
  updated_at: string
}

export type OrderItemRow = {
  id: string
  product_id: string
  title: string
  quantity: number
  unit_price_cents: number
  created_at: string
}

export type OrderDetail = OrderListItem & {
  stripe_checkout_session_id: string | null
  stripe_payment_intent_id: string | null
  shipping_address: {
    line1?: string | null
    line2?: string | null
    number?: string | null
    district?: string | null
    city?: string | null
    state?: string | null
    postal_code?: string | null
    country?: string | null
    document?: string | null
  } | null
  shipping_phone: string | null
  shipping_service: string | null
  shipping_label_url: string | null
  melhor_envio_order_id: string | null
  label_status: string | null
  notes: string | null
  order_items: OrderItemRow[]
}

export type OrderSort =
  | "newest"
  | "oldest"
  | "total_desc"
  | "total_asc"
  | "status"

export type ChartMarketFilter = "all" | OrderMarket

export type SalesSummary = {
  totalOrders: number
  countedOrders: number
  totalItemsSold: number
  testOrders: number
  openOrders: number
  completedOrders: number
  shippedOrders: number
  grossRevenueCents: number
  productsSubtotalCents: number
  shippingCollectedCents: number
  promoSavingsCents: number
}

export type SalesSummaryByCurrency = Record<OrderCurrency, SalesSummary>

export type DailySocksPoint = {
  date: string
  label: string
  socks: number
}

export type AdminOrdersDashboardParams = {
  status: string
  q: string
  sort: OrderSort
  days: number
  from: string
  to: string
  chartMarket: ChartMarketFilter
  page: number
}

export const ADMIN_ORDERS_PAGE_SIZE = 50

type ShippingAddressLike =
  | {
      country?: string | null
    }
  | null
  | undefined

type OrderListQueryRow = Record<string, unknown> & {
  status?: string | null
  currency?: string | null
  shipping_address?: ShippingAddressLike
}

type SummaryQueryRow = {
  status: string | null
  currency: string | null
  shipping_address?: ShippingAddressLike
  total_cents: number | null
  subtotal_cents: number | null
  shipping_cents: number | null
  promo_savings_cents: number | null
  created_at: string | null
  order_items?: Array<{ quantity: number | null }> | null
}

type OrderDetailQueryRow = Record<string, unknown> & {
  status?: string | null
  currency?: string | null
  shipping_address?: ShippingAddressLike
  order_items?: OrderItemRow[] | null
}

function normalizeRangeDays(value?: number) {
  if (!value || !Number.isFinite(value)) return 14
  const rounded = Math.floor(value)
  if (rounded < 1) return 1
  if (rounded > 365) return 365
  return rounded
}

function parseDateKey(value?: string | null) {
  const raw = String(value || "").trim()
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return null
  }

  const parsed = new Date(`${raw}T00:00:00.000Z`)
  if (Number.isNaN(parsed.getTime())) {
    return null
  }

  const normalized = parsed.toISOString().slice(0, 10)
  return normalized === raw ? raw : null
}

function addDaysToDateKey(dayKey: string, deltaDays: number) {
  const parsed = new Date(`${dayKey}T00:00:00.000Z`)
  parsed.setUTCDate(parsed.getUTCDate() + deltaDays)
  return parsed.toISOString().slice(0, 10)
}

function buildDayKeysBetween(startDayKey: string, endDayKey: string) {
  const keys: string[] = []
  let cursor = startDayKey

  while (cursor <= endDayKey) {
    keys.push(cursor)
    cursor = addDaysToDateKey(cursor, 1)
  }

  return keys
}

function resolveChartRange(params: {
  rangeDays?: number
  startDate?: string
  endDate?: string
}) {
  const normalizedRangeDays = normalizeRangeDays(params.rangeDays)
  const now = new Date()
  const todayDateKey = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  )
    .toISOString()
    .slice(0, 10)

  const startInput = parseDateKey(params.startDate)
  const endInput = parseDateKey(params.endDate)

  let startDateKey = ""
  let endDateKey = ""

  if (startInput && endInput) {
    if (startInput <= endInput) {
      startDateKey = startInput
      endDateKey = endInput
    } else {
      startDateKey = endInput
      endDateKey = startInput
    }
  } else if (startInput && !endInput) {
    startDateKey = startInput
    endDateKey = addDaysToDateKey(startInput, normalizedRangeDays - 1)
  } else if (!startInput && endInput) {
    endDateKey = endInput
    startDateKey = addDaysToDateKey(endInput, -(normalizedRangeDays - 1))
  } else {
    endDateKey = todayDateKey
    startDateKey = addDaysToDateKey(todayDateKey, -(normalizedRangeDays - 1))
  }

  let dayKeys = buildDayKeysBetween(startDateKey, endDateKey)
  if (dayKeys.length > 365) {
    dayKeys = dayKeys.slice(dayKeys.length - 365)
  }

  return {
    startDateKey: dayKeys[0],
    endDateKey: dayKeys[dayKeys.length - 1],
    dayKeys,
    rangeDays: dayKeys.length,
  }
}

function formatDayLabel(dayKey: string) {
  const parsed = new Date(`${dayKey}T00:00:00.000Z`)
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(parsed)
}

export function normalizeOrderCurrency(value?: string | null): OrderCurrency {
  const raw = String(value || "").trim().toLowerCase()
  if (ORDER_CURRENCIES.includes(raw as OrderCurrency)) {
    return raw as OrderCurrency
  }
  return "usd"
}

export function normalizeOrderMarket(value?: string | null): OrderMarket {
  const normalized = normalizeShippingCountry(value)
  return normalized || "US"
}

export function normalizeChartMarketFilter(
  value?: string | null
): ChartMarketFilter {
  const raw = String(value || "")
    .trim()
    .toUpperCase()
  if (raw === "ALL") return "all"
  if (raw === "US" || raw === "BR") return raw
  return "all"
}

export function normalizeAdminOrdersDashboardParams(params: {
  status?: string | null
  q?: string | null
  sort?: string | null
  range?: string | null
  days?: string | null
  from?: string | null
  to?: string | null
  chartMarket?: string | null
  page?: string | null
}): AdminOrdersDashboardParams {
  const status = String(params.status || "all").trim() || "all"
  const q = String(params.q || "").trim()
  const sortInput = String(params.sort || "newest").trim()
  const sort = (
    ["newest", "oldest", "total_desc", "total_asc", "status"] as const
  ).includes(sortInput as OrderSort)
    ? (sortInput as OrderSort)
    : "newest"
  const parsedDays = Number(params.days || params.range || 14)
  const days = Number.isFinite(parsedDays) ? parsedDays : 14
  const parsedPage = Number(params.page || 1)
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1

  return {
    status,
    q,
    sort,
    days,
    from: String(params.from || "").trim(),
    to: String(params.to || "").trim(),
    chartMarket: normalizeChartMarketFilter(params.chartMarket),
    page,
  }
}

export function getOrderCurrencyForMarket(market: OrderMarket): OrderCurrency {
  return getCurrencyForCountry(market) as OrderCurrency
}

export function getOrderMarketFromCurrency(currency: OrderCurrency): OrderMarket {
  return currency === "brl" ? "BR" : "US"
}

export function formatOrderMarketLabel(market: OrderMarket) {
  return market === "BR" ? "Brazil (BRL / R$)" : "United States (USD / $)"
}

function resolveOrderMarket(params: {
  currency?: string | null
  shippingAddress?: ShippingAddressLike
}) {
  const rawCurrency = String(params.currency || "").trim().toLowerCase()
  if (rawCurrency === "usd" || rawCurrency === "brl") {
    const marketFromCurrency = getOrderMarketFromCurrency(
      rawCurrency as OrderCurrency
    )
    return marketFromCurrency
  }

  const marketFromAddress = normalizeShippingCountry(params.shippingAddress?.country)
  if (marketFromAddress) return marketFromAddress
  return "US"
}

export function formatOrderCurrencyLabel(currency: OrderCurrency) {
  return currency === "brl" ? "BRL (R$)" : "USD ($)"
}

export function formatOrderMoney(
  cents: number,
  currency: OrderCurrency = "usd"
) {
  return new Intl.NumberFormat(currency === "brl" ? "pt-BR" : "en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100)
}

export function getOrderDisplayName(order: {
  shipping_name?: string | null
  customer_email?: string | null
  order_id?: string | null
}) {
  const shippingName = String(order.shipping_name || "").trim()
  if (shippingName) return shippingName

  const customerEmail = String(order.customer_email || "").trim()
  if (customerEmail) return customerEmail

  return String(order.order_id || "").trim() || "Unknown customer"
}

export function normalizeOrderStatus(status: string): OrderStatus | string {
  return ORDER_STATUSES.includes(status as OrderStatus)
    ? (status as OrderStatus)
    : status
}

export function formatOrderStatus(status: string) {
  switch (status) {
    case "pending":
      return "Pending payment"
    case "paid":
      return "Paid"
    case "packed":
      return "Packed"
    case "shipped":
      return "Shipped"
    case "completed":
      return "Completed"
    case "test":
      return "Test"
    case "canceled":
      return "Canceled"
    case "refunded":
      return "Refunded"
    default:
      return status
  }
}

export function formatAddress(
  address:
    | {
        line1?: string | null
        line2?: string | null
        city?: string | null
        state?: string | null
        postal_code?: string | null
        country?: string | null
      }
    | null
) {
  if (!address) return "Address not available"

  const cityLine = [address.city, address.state, address.postal_code]
    .filter(Boolean)
    .join(", ")
  return [address.line1, address.line2, cityLine, address.country]
    .filter(Boolean)
    .join("\n")
}

export function getStatusColors(status: string) {
  switch (status) {
    case "pending":
      return { bg: "#F1E7D1", color: "#7A6A47", rail: "#B59A5E", soft: "#F7F0DE" }
    case "paid":
      return { bg: "#EFE4CF", color: "#151515", rail: "#C7783A", soft: "#F4E8D2" }
    case "packed":
      return { bg: "#E7D8B8", color: "#151515", rail: "#A07A34", soft: "#F1E7D1" }
    case "shipped":
      return { bg: "#2B6E74", color: "#FAF7F0", rail: "#153E42", soft: "#D8ECEE" }
    case "completed":
      return { bg: "#151515", color: "#FAF7F0", rail: "#2B6E74", soft: "#DFE8E9" }
    case "test":
      return { bg: "#E7E1F8", color: "#151515", rail: "#6E56B3", soft: "#EEE9FB" }
    case "canceled":
      return { bg: "#C7783A", color: "#FAF7F0", rail: "#8F4E1D", soft: "#F1DCCB" }
    case "refunded":
      return { bg: "#C6D3D5", color: "#151515", rail: "#60797C", soft: "#E7EFF0" }
    default:
      return { bg: "#FAF7F0", color: "#151515", rail: "#151515", soft: "#FAF7F0" }
  }
}

export type OrdersListData = {
  orders: OrderListItem[]
  page: number
  pageSize: number
  totalOrderPages: number
  totalFilteredOrders: number
}

export type OrdersOverviewData = {
  summary: SalesSummary
  summaryByCurrency: SalesSummaryByCurrency
  socksByDay: DailySocksPoint[]
  rangeDays: number
  rangeStartDate: string
  rangeEndDate: string
}

export async function getOrdersListData(params: {
  search?: string
  status?: string
  sort?: OrderSort
  page?: number
  pageSize?: number
}) {
  const pageSize = Math.max(1, Math.floor(params.pageSize || ADMIN_ORDERS_PAGE_SIZE))
  const requestedPage = Math.max(1, Math.floor(params.page || 1))

  if (!isSupabaseConfigured()) {
    return {
      orders: [] as OrderListItem[],
      page: 1,
      pageSize,
      totalOrderPages: 1,
      totalFilteredOrders: 0,
    } satisfies OrdersListData
  }

  const supabase = getSupabaseAdmin()
  const search = params.search?.trim()
  const selectWithCurrency =
    "id, order_id, customer_email, status, currency, subtotal_cents, promo_savings_cents, shipping_cents, total_cents, shipping_name, shipping_address, tracking_number, tracking_carrier, created_at, updated_at"
  const selectWithoutCurrency =
    "id, order_id, customer_email, status, subtotal_cents, promo_savings_cents, shipping_cents, total_cents, shipping_name, shipping_address, tracking_number, tracking_carrier, created_at, updated_at"

  async function fetchOrderPage(paramsForFetch: {
    withCurrency: boolean
    pageNumber: number
  }) {
    const from = (paramsForFetch.pageNumber - 1) * pageSize
    const to = from + pageSize - 1
    let query = paramsForFetch.withCurrency
      ? supabase.from("orders").select(selectWithCurrency, { count: "exact" })
      : supabase.from("orders").select(selectWithoutCurrency, { count: "exact" })

    if (search) {
      query = query.or(
        `order_id.ilike.%${search}%,customer_email.ilike.%${search}%,shipping_name.ilike.%${search}%`
      )
    }

    if (params.status && params.status !== "all") {
      query = query.eq("status", params.status)
    }

    switch (params.sort) {
      case "oldest":
        query = query.order("created_at", { ascending: true })
        break
      case "total_desc":
        query = query
          .order("total_cents", { ascending: false })
          .order("created_at", { ascending: false })
        break
      case "total_asc":
        query = query
          .order("total_cents", { ascending: true })
          .order("created_at", { ascending: false })
        break
      case "status":
        query = query
          .order("status", { ascending: true })
          .order("created_at", { ascending: false })
        break
      case "newest":
      default:
        query = query.order("created_at", { ascending: false })
        break
    }

    query = query.range(from, to)

    const result = await query
    return {
      data: result.data as OrderListQueryRow[] | null,
      count: result.count ?? 0,
      error: result.error as {
        code?: string | null
        message?: string | null
      } | null,
    }
  }

  const ordersWithCurrencyResult = await fetchOrderPage({
    withCurrency: true,
    pageNumber: requestedPage,
  })
  let orderRows = ordersWithCurrencyResult.data
  let totalFilteredOrders = ordersWithCurrencyResult.count
  let ordersError = ordersWithCurrencyResult.error
  let usedFallbackOrderSelect = false
  if (ordersError && isMissingCurrencyColumnError(ordersError)) {
    const fallbackOrders = await fetchOrderPage({
      withCurrency: false,
      pageNumber: requestedPage,
    })
    orderRows = fallbackOrders.data
    totalFilteredOrders = fallbackOrders.count
    ordersError = fallbackOrders.error
    usedFallbackOrderSelect = true
  }
  if (ordersError) {
    throw new Error(ordersError.message || "Could not load orders.")
  }

  const totalOrderPages = Math.max(1, Math.ceil(totalFilteredOrders / pageSize))
  const page = Math.min(requestedPage, totalOrderPages)
  if (page !== requestedPage && totalFilteredOrders > 0) {
    const safePageResult = await fetchOrderPage({
      withCurrency: !usedFallbackOrderSelect,
      pageNumber: page,
    })
    orderRows = safePageResult.data
    if (safePageResult.error && isMissingCurrencyColumnError(safePageResult.error)) {
      const fallbackSafePageResult = await fetchOrderPage({
        withCurrency: false,
        pageNumber: page,
      })
      orderRows = fallbackSafePageResult.data
      ordersError = fallbackSafePageResult.error
    } else {
      ordersError = safePageResult.error
    }

    if (ordersError) {
      throw new Error(ordersError.message || "Could not load orders.")
    }
  }

  const normalizedOrderRows = (orderRows || []) as OrderListQueryRow[]
  const orders = normalizedOrderRows.map((order) => ({
    market: resolveOrderMarket({
      currency: order.currency,
      shippingAddress: order.shipping_address as ShippingAddressLike,
    }),
    ...order,
    status: normalizeOrderStatus(String(order.status || "")),
    currency: getOrderCurrencyForMarket(
      resolveOrderMarket({
        currency: order.currency,
        shippingAddress: order.shipping_address as ShippingAddressLike,
      })
    ),
  })) as OrderListItem[]

  return {
    orders,
    page,
    pageSize,
    totalOrderPages,
    totalFilteredOrders,
  } satisfies OrdersListData
}

export async function getOrdersOverviewData(params: {
  rangeDays?: number
  startDate?: string
  endDate?: string
  chartMarket?: ChartMarketFilter
}) {
  const chartRange = resolveChartRange({
    rangeDays: params.rangeDays,
    startDate: params.startDate,
    endDate: params.endDate,
  })
  const chartMarket = params.chartMarket || "all"

  if (!isSupabaseConfigured()) {
    return {
      summary: {
        totalOrders: 0,
        countedOrders: 0,
        totalItemsSold: 0,
        testOrders: 0,
        openOrders: 0,
        completedOrders: 0,
        shippedOrders: 0,
        grossRevenueCents: 0,
        productsSubtotalCents: 0,
        shippingCollectedCents: 0,
        promoSavingsCents: 0,
      } satisfies SalesSummary,
      summaryByCurrency: {
        usd: {
          totalOrders: 0,
          countedOrders: 0,
          totalItemsSold: 0,
          testOrders: 0,
          openOrders: 0,
          completedOrders: 0,
          shippedOrders: 0,
          grossRevenueCents: 0,
          productsSubtotalCents: 0,
          shippingCollectedCents: 0,
          promoSavingsCents: 0,
        },
        brl: {
          totalOrders: 0,
          countedOrders: 0,
          totalItemsSold: 0,
          testOrders: 0,
          openOrders: 0,
          completedOrders: 0,
          shippedOrders: 0,
          grossRevenueCents: 0,
          productsSubtotalCents: 0,
          shippingCollectedCents: 0,
          promoSavingsCents: 0,
        },
      } satisfies SalesSummaryByCurrency,
      socksByDay: [] as DailySocksPoint[],
      rangeDays: chartRange.rangeDays,
      rangeStartDate: chartRange.startDateKey,
      rangeEndDate: chartRange.endDateKey,
    } satisfies OrdersOverviewData
  }

  const supabase = getSupabaseAdmin()
  const summarySelectWithCurrency =
    "status,currency,shipping_address,total_cents,subtotal_cents,shipping_cents,promo_savings_cents,created_at,order_items(quantity)"
  const summarySelectWithoutCurrency =
    "status,shipping_address,total_cents,subtotal_cents,shipping_cents,promo_savings_cents,created_at,order_items(quantity)"
  const summaryWithCurrencyResult = await supabase
    .from("orders")
    .select(summarySelectWithCurrency)
  let summaryRows = summaryWithCurrencyResult.data as SummaryQueryRow[] | null
  let summaryError = summaryWithCurrencyResult.error as {
    code?: string | null
    message?: string | null
  } | null
  if (summaryError && isMissingCurrencyColumnError(summaryError)) {
    const fallbackSummary = await supabase
      .from("orders")
      .select(summarySelectWithoutCurrency)
    summaryRows = fallbackSummary.data as SummaryQueryRow[] | null
    summaryError = fallbackSummary.error as {
      code?: string | null
      message?: string | null
    } | null
  }
  if (summaryError) {
    throw new Error(summaryError.message || "Could not load order summary.")
  }

  const normalizedSummaryRows = (summaryRows || []) as SummaryQueryRow[]

  const statusCounts = new Map<string, number>()
  const revenueStatuses = new Set<OrderStatus>([
    "paid",
    "packed",
    "shipped",
    "completed",
  ])
  let countedOrders = 0
  let totalItemsSold = 0
  let grossRevenueCents = 0
  let productsSubtotalCents = 0
  let shippingCollectedCents = 0
  let promoSavingsCents = 0
  const socksByDayMap = new Map<string, number>()
  const summaryByCurrency: SalesSummaryByCurrency = {
    usd: {
      totalOrders: 0,
      countedOrders: 0,
      totalItemsSold: 0,
      testOrders: 0,
      openOrders: 0,
      completedOrders: 0,
      shippedOrders: 0,
      grossRevenueCents: 0,
      productsSubtotalCents: 0,
      shippingCollectedCents: 0,
      promoSavingsCents: 0,
    },
    brl: {
      totalOrders: 0,
      countedOrders: 0,
      totalItemsSold: 0,
      testOrders: 0,
      openOrders: 0,
      completedOrders: 0,
      shippedOrders: 0,
      grossRevenueCents: 0,
      productsSubtotalCents: 0,
      shippingCollectedCents: 0,
      promoSavingsCents: 0,
    },
  }

  for (const row of normalizedSummaryRows) {
    const key = row.status || "unknown"
    const market = resolveOrderMarket({
      currency: row.currency,
      shippingAddress: row.shipping_address,
    })
    const currency = getOrderCurrencyForMarket(market)
    statusCounts.set(key, (statusCounts.get(key) || 0) + 1)

    const currencySummary = summaryByCurrency[currency]
    if (key === "test") {
      currencySummary.testOrders += 1
    } else {
      currencySummary.totalOrders += 1
    }
    if (key === "completed") currencySummary.completedOrders += 1
    if (key === "shipped") currencySummary.shippedOrders += 1

    if (!revenueStatuses.has(key as OrderStatus)) {
      continue
    }

    countedOrders += 1
    currencySummary.countedOrders += 1
    grossRevenueCents += Number(row.total_cents || 0)
    currencySummary.grossRevenueCents += Number(row.total_cents || 0)
    productsSubtotalCents += Number(row.subtotal_cents || 0)
    currencySummary.productsSubtotalCents += Number(row.subtotal_cents || 0)
    shippingCollectedCents += Number(row.shipping_cents || 0)
    currencySummary.shippingCollectedCents += Number(row.shipping_cents || 0)
    promoSavingsCents += Number(row.promo_savings_cents || 0)
    currencySummary.promoSavingsCents += Number(row.promo_savings_cents || 0)

    const socksInOrder = (row.order_items || []).reduce((sum, item) => {
      return sum + Number(item.quantity || 0)
    }, 0)
    totalItemsSold += socksInOrder
    currencySummary.totalItemsSold += socksInOrder

    const dayKey = String(row.created_at || "").slice(0, 10)
    if (chartMarket !== "all" && market !== chartMarket) {
      continue
    }
    if (!dayKey) {
      continue
    }
    socksByDayMap.set(dayKey, (socksByDayMap.get(dayKey) || 0) + socksInOrder)
  }

  const openOrders =
    (statusCounts.get("paid") || 0) +
    (statusCounts.get("packed") || 0) +
    (statusCounts.get("shipped") || 0)

  const summary: SalesSummary = {
    totalOrders:
      normalizedSummaryRows.length - (statusCounts.get("test") || 0),
    countedOrders,
    totalItemsSold,
    testOrders: statusCounts.get("test") || 0,
    openOrders,
    completedOrders: statusCounts.get("completed") || 0,
    shippedOrders: statusCounts.get("shipped") || 0,
    grossRevenueCents,
    productsSubtotalCents,
    shippingCollectedCents,
    promoSavingsCents,
  }

  summaryByCurrency.usd.openOrders =
    summaryByCurrency.usd.countedOrders -
    summaryByCurrency.usd.completedOrders
  summaryByCurrency.brl.openOrders =
    summaryByCurrency.brl.countedOrders -
    summaryByCurrency.brl.completedOrders

  const socksByDay: DailySocksPoint[] = chartRange.dayKeys.map((dayKey) => ({
    date: dayKey,
    label: formatDayLabel(dayKey),
    socks: socksByDayMap.get(dayKey) || 0,
  }))

  return {
    summary,
    summaryByCurrency,
    socksByDay,
    rangeDays: chartRange.rangeDays,
    rangeStartDate: chartRange.startDateKey,
    rangeEndDate: chartRange.endDateKey,
  } satisfies OrdersOverviewData
}

export async function listOrders(params: {
  search?: string
  status?: string
  sort?: OrderSort
  rangeDays?: number
  startDate?: string
  endDate?: string
  chartMarket?: ChartMarketFilter
  page?: number
  pageSize?: number
}) {
  const [listData, overviewData] = await Promise.all([
    getOrdersListData({
      search: params.search,
      status: params.status,
      sort: params.sort,
      page: params.page,
      pageSize: params.pageSize,
    }),
    getOrdersOverviewData({
      rangeDays: params.rangeDays,
      startDate: params.startDate,
      endDate: params.endDate,
      chartMarket: params.chartMarket,
    }),
  ])

  return {
    ...listData,
    ...overviewData,
  }
}

export async function getOrderDetail(id: string) {
  if (!isSupabaseConfigured()) return null

  const supabase = getSupabaseAdmin()
  const detailSelectWithCurrency =
    "id, order_id, stripe_checkout_session_id, stripe_payment_intent_id, customer_email, status, currency, subtotal_cents, promo_savings_cents, shipping_cents, total_cents, shipping_name, shipping_phone, shipping_service, shipping_label_url, melhor_envio_order_id, label_status, shipping_address, tracking_number, tracking_carrier, notes, created_at, updated_at, order_items(id, product_id, title, quantity, unit_price_cents, created_at)"
  const detailSelectWithoutCurrency =
    "id, order_id, stripe_checkout_session_id, stripe_payment_intent_id, customer_email, status, subtotal_cents, promo_savings_cents, shipping_cents, total_cents, shipping_name, shipping_phone, shipping_service, shipping_label_url, melhor_envio_order_id, label_status, shipping_address, tracking_number, tracking_carrier, notes, created_at, updated_at, order_items(id, product_id, title, quantity, unit_price_cents, created_at)"
  const detailWithCurrencyResult = await supabase
    .from("orders")
    .select(detailSelectWithCurrency)
    .eq("id", id)
    .single()
  let data = detailWithCurrencyResult.data as OrderDetailQueryRow | null
  let error = detailWithCurrencyResult.error as {
    code?: string | null
    message?: string | null
  } | null
  if (error && isMissingCurrencyColumnError(error)) {
    const fallbackDetail = await supabase
      .from("orders")
      .select(detailSelectWithoutCurrency)
      .eq("id", id)
      .single()
    data = fallbackDetail.data as OrderDetailQueryRow | null
    error = fallbackDetail.error as {
      code?: string | null
      message?: string | null
    } | null
  }
  if (error) {
    throw new Error(error.message || "Could not load order details.")
  }

  if (!data) return null

  return {
    ...data,
    market: resolveOrderMarket({
      currency: data.currency || null,
      shippingAddress: data.shipping_address,
    }),
    status: normalizeOrderStatus(String(data.status || "")),
    currency: getOrderCurrencyForMarket(
      resolveOrderMarket({
        currency: data.currency || null,
        shippingAddress: data.shipping_address,
      })
    ),
    order_items: data.order_items || [],
  } as OrderDetail
}
