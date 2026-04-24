import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/server"

export const ORDER_STATUSES = [
  "paid",
  "packed",
  "shipped",
  "completed",
  "test",
  "canceled",
  "refunded",
] as const

export type OrderStatus = (typeof ORDER_STATUSES)[number]

export type OrderListItem = {
  id: string
  order_id: string
  customer_email: string
  status: OrderStatus | string
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
    city?: string | null
    state?: string | null
    postal_code?: string | null
    country?: string | null
  } | null
  notes: string | null
  order_items: OrderItemRow[]
}

export type OrderSort =
  | "newest"
  | "oldest"
  | "total_desc"
  | "total_asc"
  | "status"

export type SalesSummary = {
  totalOrders: number
  countedOrders: number
  testOrders: number
  openOrders: number
  completedOrders: number
  shippedOrders: number
  grossRevenueCents: number
  productsSubtotalCents: number
  shippingCollectedCents: number
  promoSavingsCents: number
}

export type DailySocksPoint = {
  date: string
  label: string
  socks: number
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

export function moneyFromCents(cents: number) {
  return `$${(cents / 100).toFixed(2)}`
}

export function normalizeOrderStatus(status: string): OrderStatus | string {
  return ORDER_STATUSES.includes(status as OrderStatus)
    ? (status as OrderStatus)
    : status
}

export function formatOrderStatus(status: string) {
  switch (status) {
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

export async function listOrders(params: {
  search?: string
  status?: string
  sort?: OrderSort
  rangeDays?: number
  startDate?: string
  endDate?: string
}) {
  const chartRange = resolveChartRange({
    rangeDays: params.rangeDays,
    startDate: params.startDate,
    endDate: params.endDate,
  })

  if (!isSupabaseConfigured()) {
    return {
      orders: [] as OrderListItem[],
      statusCounts: new Map<string, number>(),
      summary: {
        totalOrders: 0,
        countedOrders: 0,
        testOrders: 0,
        openOrders: 0,
        completedOrders: 0,
        shippedOrders: 0,
        grossRevenueCents: 0,
        productsSubtotalCents: 0,
        shippingCollectedCents: 0,
        promoSavingsCents: 0,
      } satisfies SalesSummary,
      socksByDay: [] as DailySocksPoint[],
      rangeDays: chartRange.rangeDays,
      rangeStartDate: chartRange.startDateKey,
      rangeEndDate: chartRange.endDateKey,
    }
  }

  const supabase = getSupabaseAdmin()
  let query = supabase.from("orders").select(
    "id, order_id, customer_email, status, subtotal_cents, promo_savings_cents, shipping_cents, total_cents, shipping_name, tracking_number, tracking_carrier, created_at, updated_at"
  )

  const search = params.search?.trim()
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
      query = query.order("total_cents", { ascending: false }).order("created_at", {
        ascending: false,
      })
      break
    case "total_asc":
      query = query.order("total_cents", { ascending: true }).order("created_at", {
        ascending: false,
      })
      break
    case "status":
      query = query.order("status", { ascending: true }).order("created_at", {
        ascending: false,
      })
      break
    case "newest":
    default:
      query = query.order("created_at", { ascending: false })
      break
  }

  const { data } = await query
  const orders = (data || []).map((order) => ({
    ...order,
    status: normalizeOrderStatus(String(order.status || "")),
  })) as OrderListItem[]

  const { data: summaryRows } = await supabase
    .from("orders")
    .select(
      "status,total_cents,subtotal_cents,shipping_cents,promo_savings_cents,created_at,order_items(quantity)"
    )

  type SummaryRow = {
    status: string | null
    total_cents: number | null
    subtotal_cents: number | null
    shipping_cents: number | null
    promo_savings_cents: number | null
    created_at: string | null
    order_items?: Array<{ quantity: number | null }> | null
  }
  const normalizedSummaryRows = (summaryRows || []) as SummaryRow[]

  const statusCounts = new Map<string, number>()
  const revenueStatuses = new Set<OrderStatus>([
    "paid",
    "packed",
    "shipped",
    "completed",
  ])
  let countedOrders = 0
  let grossRevenueCents = 0
  let productsSubtotalCents = 0
  let shippingCollectedCents = 0
  let promoSavingsCents = 0
  const socksByDayMap = new Map<string, number>()

  for (const row of normalizedSummaryRows) {
    const key = row.status || "unknown"
    statusCounts.set(key, (statusCounts.get(key) || 0) + 1)

    if (!revenueStatuses.has(key as OrderStatus)) {
      continue
    }

    countedOrders += 1
    grossRevenueCents += Number(row.total_cents || 0)
    productsSubtotalCents += Number(row.subtotal_cents || 0)
    shippingCollectedCents += Number(row.shipping_cents || 0)
    promoSavingsCents += Number(row.promo_savings_cents || 0)

    const dayKey = String(row.created_at || "").slice(0, 10)
    if (!dayKey) {
      continue
    }

    const socksInOrder = (row.order_items || []).reduce((sum, item) => {
      return sum + Number(item.quantity || 0)
    }, 0)
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
    testOrders: statusCounts.get("test") || 0,
    openOrders,
    completedOrders: statusCounts.get("completed") || 0,
    shippedOrders: statusCounts.get("shipped") || 0,
    grossRevenueCents,
    productsSubtotalCents,
    shippingCollectedCents,
    promoSavingsCents,
  }

  const socksByDay: DailySocksPoint[] = chartRange.dayKeys.map((dayKey) => ({
    date: dayKey,
    label: formatDayLabel(dayKey),
    socks: socksByDayMap.get(dayKey) || 0,
  }))

  return {
    orders,
    statusCounts,
    summary,
    socksByDay,
    rangeDays: chartRange.rangeDays,
    rangeStartDate: chartRange.startDateKey,
    rangeEndDate: chartRange.endDateKey,
  }
}

export async function getOrderDetail(id: string) {
  if (!isSupabaseConfigured()) return null

  const supabase = getSupabaseAdmin()
  const { data } = await supabase
    .from("orders")
    .select(
      "id, order_id, stripe_checkout_session_id, stripe_payment_intent_id, customer_email, status, subtotal_cents, promo_savings_cents, shipping_cents, total_cents, shipping_name, shipping_address, tracking_number, tracking_carrier, notes, created_at, updated_at, order_items(id, product_id, title, quantity, unit_price_cents, created_at)"
    )
    .eq("id", id)
    .single()

  if (!data) return null

  return {
    ...data,
    status: normalizeOrderStatus(data.status),
    order_items: data.order_items || [],
  } as OrderDetail
}
