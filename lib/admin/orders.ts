import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/server"

export const ORDER_STATUSES = [
  "paid",
  "packed",
  "shipped",
  "completed",
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
}) {
  if (!isSupabaseConfigured()) {
    return { orders: [] as OrderListItem[], statusCounts: new Map<string, number>() }
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
  const orders = (data || []).map((order: any) => ({
    ...order,
    status: normalizeOrderStatus(order.status),
  })) as OrderListItem[]

  const { data: statusRows } = await supabase.from("orders").select("status")
  const statusCounts = new Map<string, number>()
  for (const row of statusRows || []) {
    const key = row.status || "unknown"
    statusCounts.set(key, (statusCounts.get(key) || 0) + 1)
  }

  return { orders, statusCounts }
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
