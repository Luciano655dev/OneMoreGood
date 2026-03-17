import Link from "next/link"

import colors from "@/components/colors"
import RoughBorder from "@/components/Home/Objects/RoughBorder"
import SectionTitle from "@/components/Home/Objects/SectionTitle"
import PageGridBackground from "@/components/Layout/PageGridBackground"
import {
  ORDER_STATUSES,
  formatOrderStatus,
  getStatusColors,
  listOrders,
  moneyFromCents,
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

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string
    q?: string
    sort?: OrderSort
  }>
}) {
  const params = await searchParams
  const status = params.status || "all"
  const q = params.q || ""
  const sort = params.sort || "newest"
  const { orders, statusCounts } = await listOrders({ status, search: q, sort })

  const completedCount = statusCounts.get("completed") || 0
  const shippedCount = statusCounts.get("shipped") || 0
  const paidCount = statusCounts.get("paid") || 0
  const openCount =
    paidCount + (statusCounts.get("packed") || 0) + shippedCount

  return (
    <div style={{ background: colors.paper, color: colors.ink }}>
      <PageGridBackground />
      <section className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-16">
        <SectionTitle
          kicker="Admin"
          title="Orders dashboard"
          desc="Review purchases, sort them, update shipping progress, and mark final completion."
        />

        <form action="/admin/logout" method="post" className="mt-6">
          <button
            type="submit"
            className="px-4 py-3 text-xs font-black uppercase tracking-widest"
            style={{
              background: colors.paper,
              border: `2px solid ${colors.ink}`,
              boxShadow: `3px 3px 0 ${colors.ink}`,
            }}
          >
            Log out
          </button>
        </form>

        <div className="mt-8 grid gap-3 md:grid-cols-4">
          <StatCard label="All orders" value={orders.length} bg={colors.sand} />
          <StatCard label="Open" value={openCount} bg="#F4E8D2" />
          <StatCard label="Shipped" value={shippedCount} bg="#D8ECEE" />
          <StatCard label="Completed" value={completedCount} bg="#DFE8E9" />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
          <RoughBorder bg={colors.sand} label="Filters">
            <form className="grid gap-4">
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

              <button
                type="submit"
                className="mt-2 px-4 py-3 text-xs font-black uppercase tracking-widest"
                style={{
                  background: colors.accent,
                  color: colors.paper,
                  border: `2px solid ${colors.ink}`,
                  boxShadow: `3px 3px 0 ${colors.ink}`,
                }}
              >
                Apply filters
              </button>
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

                          <div className="mt-4 grid gap-3 md:grid-cols-4">
                            <div>
                              <div
                                className="text-[11px] font-black uppercase tracking-widest"
                                style={{ color: colors.muted }}
                              >
                                Total
                              </div>
                              <div className="mt-1 font-black">
                                {moneyFromCents(order.total_cents)}
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
                                {moneyFromCents(order.shipping_cents)}
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
