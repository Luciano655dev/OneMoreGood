import Link from "next/link"

import CopyOrderIdButton from "@/components/Admin/CopyOrderIdButton"
import FormSubmitButton from "@/components/Admin/FormSubmitButton"
import colors from "@/components/colors"
import RoughBorder from "@/components/Home/Objects/RoughBorder"
import SectionTitle from "@/components/Home/Objects/SectionTitle"
import PageGridBackground from "@/components/Layout/PageGridBackground"
import {
  ORDER_MARKETS,
  formatOrderCurrencyLabel,
  getOrderDisplayName,
  formatOrderMarketLabel,
  ORDER_STATUSES,
  formatAddress,
  formatOrderStatus,
  getOrderDetail,
  getStatusColors,
  formatOrderMoney,
} from "@/lib/admin/orders"
import { updateOrderAction } from "../actions"

export const dynamic = "force-dynamic"

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label
      className="text-[11px] font-black uppercase tracking-widest"
      style={{ color: colors.muted }}
    >
      {children}
    </label>
  )
}

function toDateTimeLocalValue(value: string) {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return ""

  const pad = (input: number) => String(input).padStart(2, "0")
  return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(
    parsed.getDate()
  )}T${pad(parsed.getHours())}:${pad(parsed.getMinutes())}`
}

function toMoneyInputValue(cents: number) {
  return (cents / 100).toFixed(2)
}

export default async function AdminOrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ saved?: string; error?: string }>
}) {
  const { id } = await params
  const query = await searchParams
  const order = await getOrderDetail(id)
  const saved = query.saved === "1"
  const error = query.error?.trim() || null

  if (!order) {
    return (
      <div style={{ background: colors.paper, color: colors.ink }}>
        <PageGridBackground />
        <section className="mx-auto max-w-5xl px-4 py-12 md:px-6 md:py-16">
          <SectionTitle
            kicker="Admin"
            title="Order not found"
            desc="This order could not be loaded from Supabase."
          />
          <div className="mt-6">
            <Link
              href="/admin/orders"
              className="inline-flex px-4 py-3 text-xs font-black uppercase tracking-widest"
              style={{
                background: colors.paper,
                border: `2px solid ${colors.ink}`,
                boxShadow: `3px 3px 0 ${colors.ink}`,
              }}
            >
              Back to orders
            </Link>
          </div>
        </section>
      </div>
    )
  }

  const tone = getStatusColors(order.status)

  return (
    <div style={{ background: colors.paper, color: colors.ink }}>
      <PageGridBackground />
      <section className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <SectionTitle
            kicker="Admin"
            title={getOrderDisplayName(order)}
            titleAccessory={<CopyOrderIdButton value={order.order_id} />}
            desc="Update shipping progress, tracking, notes, and final completion from one place."
          />
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/orders"
              className="btnInteractive inline-flex px-4 py-3 text-xs font-black uppercase tracking-widest"
              style={{
                background: colors.paper,
                border: `2px solid ${colors.ink}`,
                boxShadow: `3px 3px 0 ${colors.ink}`,
              }}
            >
              Back to orders
            </Link>
          </div>
        </div>

        {saved ? (
          <div
            className="mt-4 p-3 text-sm font-black"
            style={{
              background: "#DDECE9",
              border: `2px solid ${colors.ink}`,
              color: colors.ink,
            }}
          >
            Order updated.
          </div>
        ) : null}

        {error ? (
          <div
            className="mt-4 p-3 text-sm font-black"
            style={{
              background: colors.sand,
              border: `2px dashed ${colors.ink}`,
              color: colors.clay,
            }}
          >
            {error}
          </div>
        ) : null}

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_380px]">
          <div className="grid gap-6">
            <RoughBorder bg={colors.sand} label="Order details">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <div
                    className="text-[11px] font-black uppercase tracking-widest"
                    style={{ color: colors.muted }}
                  >
                    Customer
                  </div>
                  <div className="mt-1 font-black">
                    {order.shipping_name || "Name not available"}
                  </div>
                  <div className="mt-1 text-sm" style={{ color: colors.muted }}>
                    {order.customer_email}
                  </div>
                </div>
                <div>
                  <div
                    className="text-[11px] font-black uppercase tracking-widest"
                    style={{ color: colors.muted }}
                  >
                    Status
                  </div>
                  <span
                    className="mt-2 inline-flex items-center px-3 py-2 text-[11px] font-black uppercase tracking-widest"
                    style={{
                      background: tone.rail,
                      color: colors.paper,
                      border: `2px solid ${colors.ink}`,
                      boxShadow: `2px 2px 0 ${colors.ink}`,
                    }}
                  >
                    {formatOrderStatus(order.status)}
                  </span>
                </div>
                <div>
                  <div
                    className="text-[11px] font-black uppercase tracking-widest"
                    style={{ color: colors.muted }}
                  >
                    Created
                  </div>
                  <div className="mt-1 font-black">
                    {new Date(order.created_at).toLocaleString("en-US")}
                  </div>
                </div>
                <div>
                  <div
                    className="text-[11px] font-black uppercase tracking-widest"
                    style={{ color: colors.muted }}
                  >
                    Updated
                  </div>
                  <div className="mt-1 font-black">
                    {new Date(order.updated_at).toLocaleString("en-US")}
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
                    Currency
                  </div>
                  <div className="mt-1 font-black">
                    {formatOrderCurrencyLabel(order.currency)}
                  </div>
                </div>
              </div>

              <div
                className="mt-5 grid gap-3 md:grid-cols-4"
                style={{ borderTop: `2px solid ${colors.ink}`, paddingTop: 16 }}
              >
                <div>
                  <div
                    className="text-[11px] font-black uppercase tracking-widest"
                    style={{ color: colors.muted }}
                  >
                    Subtotal
                  </div>
                  <div className="mt-1 font-black">
                    {formatOrderMoney(order.subtotal_cents, order.currency)}
                  </div>
                </div>
                <div>
                  <div
                    className="text-[11px] font-black uppercase tracking-widest"
                    style={{ color: colors.muted }}
                  >
                    Promo
                  </div>
                  <div className="mt-1 font-black">
                    {formatOrderMoney(order.promo_savings_cents, order.currency)}
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
                    {formatOrderMoney(order.shipping_cents, order.currency)}
                  </div>
                </div>
                <div>
                  <div
                    className="text-[11px] font-black uppercase tracking-widest"
                    style={{ color: colors.muted }}
                  >
                    Total
                  </div>
                  <div className="mt-1 text-lg font-black">
                    {formatOrderMoney(order.total_cents, order.currency)}
                  </div>
                </div>
              </div>
            </RoughBorder>

            <RoughBorder bg={colors.paper} label="Items">
              <div className="grid gap-3">
                {order.order_items.map((item) => (
                  <div
                    key={item.id}
                    className="grid gap-2 p-4 md:grid-cols-[1fr_auto_auto]"
                    style={{
                      background: colors.sand,
                      border: `2px solid ${colors.ink}`,
                    }}
                  >
                    <div>
                      <div className="font-black">{item.title}</div>
                      <div className="mt-1 text-sm" style={{ color: colors.muted }}>
                        Product ID: {item.product_id}
                      </div>
                    </div>
                    <div className="font-black">Qty {item.quantity}</div>
                    <div className="font-black">
                      {formatOrderMoney(item.unit_price_cents, order.currency)}
                    </div>
                  </div>
                ))}
              </div>
            </RoughBorder>

            <RoughBorder bg={colors.sand} label="Shipping">
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <div
                    className="text-[11px] font-black uppercase tracking-widest"
                    style={{ color: colors.muted }}
                  >
                    Ship to
                  </div>
                  <div className="mt-2 font-black">
                    {order.shipping_name || "Name not available"}
                  </div>
                  <pre
                    className="mt-2 whitespace-pre-wrap text-sm"
                    style={{ color: colors.muted, fontFamily: "inherit" }}
                  >
                    {formatAddress(order.shipping_address)}
                  </pre>
                </div>
                <div>
                  <div
                    className="text-[11px] font-black uppercase tracking-widest"
                    style={{ color: colors.muted }}
                  >
                    Tracking
                  </div>
                  <div className="mt-2 text-sm">
                    <strong style={{ color: colors.ink }}>Carrier:</strong>{" "}
                    {order.tracking_carrier || "Not added"}
                  </div>
                  <div className="mt-1 text-sm">
                    <strong style={{ color: colors.ink }}>Number:</strong>{" "}
                    {order.tracking_number || "Not added"}
                  </div>
                  <div className="mt-4 text-sm" style={{ color: colors.muted }}>
                    Add the tracking fields below when the label is ready, then
                    switch the status to shipped. Once the order arrives and is
                    done, mark it completed.
                  </div>
                </div>
              </div>
            </RoughBorder>
          </div>

          <div className="grid gap-6">
            <RoughBorder bg={colors.paper} label="Update order">
              <form action={updateOrderAction} className="grid gap-4">
                <input type="hidden" name="id" value={order.id} />
                <input type="hidden" name="return_to" value={`/admin/orders/${id}`} />

                <div>
                  <Label>Status</Label>
                  <select
                    name="status"
                    defaultValue={order.status}
                    className="mt-2 w-full px-3 py-3 text-sm font-black outline-none"
                    style={{
                      background: colors.sand,
                      border: `2px solid ${colors.ink}`,
                    }}
                  >
                    {ORDER_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {formatOrderStatus(status)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label>Order market</Label>
                  <select
                    name="market"
                    defaultValue={order.market}
                    className="mt-2 w-full px-3 py-3 text-sm font-black outline-none"
                    style={{
                      background: colors.sand,
                      border: `2px solid ${colors.ink}`,
                    }}
                  >
                    {ORDER_MARKETS.map((market) => (
                      <option key={market} value={market}>
                        {formatOrderMarketLabel(market)}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-[11px]" style={{ color: colors.muted }}>
                    Market keeps currency and shipping country aligned.
                  </p>
                </div>

                <div>
                  <Label>Customer name</Label>
                  <input
                    name="customer_name"
                    defaultValue={order.shipping_name || ""}
                    placeholder="Customer name"
                    className="mt-2 w-full px-3 py-3 text-sm font-black outline-none"
                    style={{
                      background: colors.sand,
                      border: `2px solid ${colors.ink}`,
                    }}
                  />
                </div>

                <div>
                  <Label>Item values</Label>
                  <div className="mt-2 grid gap-3">
                    {order.order_items.map((item) => (
                      <div
                        key={item.id}
                        className="grid gap-3 p-3 md:grid-cols-[minmax(0,1fr)_140px]"
                        style={{
                          background: colors.paper,
                          border: `2px solid ${colors.ink}`,
                        }}
                      >
                        <input type="hidden" name="order_item_id" value={item.id} />
                        <input
                          type="hidden"
                          name="order_item_title"
                          value={item.title}
                        />

                        <div>
                          <div className="font-black">{item.title}</div>
                          <div
                            className="mt-1 text-[11px] font-black uppercase tracking-widest"
                            style={{ color: colors.muted }}
                          >
                            Qty {item.quantity} • line total{" "}
                            {formatOrderMoney(
                              item.unit_price_cents * item.quantity,
                              order.currency
                            )}
                          </div>
                        </div>

                        <div>
                          <div
                            className="text-[11px] font-black uppercase tracking-widest"
                            style={{ color: colors.muted }}
                          >
                            Value each
                          </div>
                          <input
                            name="order_item_unit_price_dollars"
                            type="number"
                            min="0"
                            step="0.01"
                            defaultValue={toMoneyInputValue(item.unit_price_cents)}
                            className="mt-2 w-full px-3 py-3 text-sm font-black outline-none"
                            style={{
                              background: colors.sand,
                              border: `2px solid ${colors.ink}`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="mt-1 text-[11px]" style={{ color: colors.muted }}>
                    Saving recalculates subtotal and total from these item values.
                  </p>
                </div>

                <div>
                  <Label>Tracking carrier</Label>
                  <input
                    name="tracking_carrier"
                    defaultValue={order.tracking_carrier || ""}
                    placeholder="USPS, UPS, FedEx"
                    className="mt-2 w-full px-3 py-3 text-sm font-black outline-none"
                    style={{
                      background: colors.sand,
                      border: `2px solid ${colors.ink}`,
                    }}
                  />
                </div>

                <div>
                  <Label>Tracking number</Label>
                  <input
                    name="tracking_number"
                    defaultValue={order.tracking_number || ""}
                    placeholder="9400..."
                    className="mt-2 w-full px-3 py-3 text-sm font-black outline-none"
                    style={{
                      background: colors.sand,
                      border: `2px solid ${colors.ink}`,
                    }}
                  />
                </div>

                <div>
                  <Label>Purchase date/time</Label>
                  <input
                    name="purchased_at"
                    type="datetime-local"
                    defaultValue={toDateTimeLocalValue(order.created_at)}
                    className="mt-2 w-full px-3 py-3 text-sm font-black outline-none"
                    style={{
                      background: colors.sand,
                      border: `2px solid ${colors.ink}`,
                    }}
                  />
                </div>

                <div>
                  <Label>Internal notes</Label>
                  <textarea
                    name="notes"
                    defaultValue={order.notes || ""}
                    rows={8}
                    placeholder="Packing note, refund detail, damaged item note..."
                    className="mt-2 w-full px-3 py-3 text-sm font-black outline-none"
                    style={{
                      background: colors.sand,
                      border: `2px solid ${colors.ink}`,
                    }}
                  />
                </div>

                <FormSubmitButton
                  idleLabel="Save order updates"
                  pendingLabel="Saving..."
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

            <RoughBorder bg={colors.sand} label="Payment refs">
              <div className="grid gap-4 text-sm">
                <div>
                  <div
                    className="text-[11px] font-black uppercase tracking-widest"
                    style={{ color: colors.muted }}
                  >
                    Checkout session
                  </div>
                  <div className="mt-1 break-all font-black">
                    {order.stripe_checkout_session_id || "Not saved"}
                  </div>
                </div>
                <div>
                  <div
                    className="text-[11px] font-black uppercase tracking-widest"
                    style={{ color: colors.muted }}
                  >
                    Payment intent
                  </div>
                  <div className="mt-1 break-all font-black">
                    {order.stripe_payment_intent_id || "Not saved"}
                  </div>
                </div>
              </div>
            </RoughBorder>
          </div>
        </div>
      </section>
    </div>
  )
}
