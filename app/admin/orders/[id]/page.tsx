import Image from "next/image"
import Link from "next/link"

import CopyOrderIdButton from "@/components/Admin/CopyOrderIdButton"
import EditableOrderItemsFields from "@/components/Admin/EditableOrderItemsFields"
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
import { getStoredProductMap } from "@/lib/products"
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
        <div className="flex flex-wrap items-start justify-between gap-4">
          <SectionTitle
            kicker="Admin"
            title="Order not found"
            desc="This order could not be loaded from Supabase."
          />
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
  const productMap = await getStoredProductMap({ includeInactive: true })

  return (
    <div style={{ background: colors.paper, color: colors.ink }}>
      <PageGridBackground />
      <section className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <SectionTitle
            kicker="Admin"
            title={getOrderDisplayName(order)}
            titleAccessory={<CopyOrderIdButton value={order.order_id} />}
            desc="Edit order metadata, line items, address details, tracking, and payment references from one place."
          />

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
                {order.order_items.map((item) => {
                  const productImage = productMap.get(item.product_id)?.image

                  return (
                    <div
                      key={item.id}
                      className="grid grid-cols-[88px_minmax(0,1fr)] gap-3 p-4"
                      style={{
                        background: colors.sand,
                        border: `2px solid ${colors.ink}`,
                      }}
                    >
                      <div
                        className="relative aspect-square w-20 overflow-hidden"
                        style={{
                          background: colors.paper,
                          border: `2px solid ${colors.ink}`,
                          boxShadow: `2px 2px 0 ${colors.ink}`,
                        }}
                      >
                        {productImage ? (
                          <Image
                            src={productImage}
                            alt={item.title}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        ) : null}
                      </div>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-black">{item.title}</div>
                          <div
                            className="mt-1 text-sm"
                            style={{ color: colors.muted }}
                          >
                            Product ID: {item.product_id}
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="font-black">Qty {item.quantity}</div>
                          <div className="font-black">
                            {formatOrderMoney(item.unit_price_cents, order.currency)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
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
                  <Label>Public order ID</Label>
                  <input
                    name="order_id"
                    defaultValue={order.order_id}
                    placeholder="OMG-..."
                    className="mt-2 w-full px-3 py-3 text-sm font-black outline-none"
                    style={{
                      background: colors.sand,
                      border: `2px solid ${colors.ink}`,
                    }}
                  />
                </div>

                <div>
                  <Label>Status</Label>
                  <select
                    name="status"
                    defaultValue={order.status}
                    id="order-status"
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
                    id="order-market"
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
                  <Label>Customer email</Label>
                  <input
                    name="customer_email"
                    type="email"
                    defaultValue={order.customer_email || ""}
                    placeholder="customer@example.com"
                    className="mt-2 w-full px-3 py-3 text-sm font-black outline-none"
                    style={{
                      background: colors.sand,
                      border: `2px solid ${colors.ink}`,
                    }}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Shipping amount</Label>
                    <input
                      id="order-shipping"
                      name="shipping_dollars"
                      type="number"
                      min="0"
                      step="0.01"
                      defaultValue={toMoneyInputValue(order.shipping_cents)}
                      className="mt-2 w-full px-3 py-3 text-sm font-black outline-none"
                      style={{
                        background: colors.sand,
                        border: `2px solid ${colors.ink}`,
                      }}
                    />
                  </div>

                  <div>
                    <Label>Promo savings</Label>
                    <input
                      id="order-promo"
                      name="promo_savings_dollars"
                      type="number"
                      min="0"
                      step="0.01"
                      defaultValue={toMoneyInputValue(order.promo_savings_cents)}
                      className="mt-2 w-full px-3 py-3 text-sm font-black outline-none"
                      style={{
                        background: colors.sand,
                        border: `2px solid ${colors.ink}`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <Label>Line items</Label>
                  <div className="mt-2">
                    <EditableOrderItemsFields
                      products={Array.from(productMap.values()).map((product) => ({
                        id: product.id,
                        title: product.title,
                        inventory_quantity_us: product.inventory_quantity_us,
                        inventory_quantity_br: product.inventory_quantity_br,
                      }))}
                      initialItems={order.order_items}
                      initialMarket={order.market}
                      initialShippingCents={order.shipping_cents}
                      initialPromoSavingsCents={order.promo_savings_cents}
                    />
                  </div>
                  <p className="mt-1 text-[11px]" style={{ color: colors.muted }}>
                    Saving recalculates subtotal and total from these rows and the
                    shipping/promo fields above.
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

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Checkout session ID</Label>
                    <input
                      name="stripe_checkout_session_id"
                      defaultValue={order.stripe_checkout_session_id || ""}
                      placeholder="cs_..."
                      className="mt-2 w-full px-3 py-3 text-sm font-black outline-none"
                      style={{
                        background: colors.sand,
                        border: `2px solid ${colors.ink}`,
                      }}
                    />
                  </div>

                  <div>
                    <Label>Payment intent ID</Label>
                    <input
                      name="stripe_payment_intent_id"
                      defaultValue={order.stripe_payment_intent_id || ""}
                      placeholder="pi_..."
                      className="mt-2 w-full px-3 py-3 text-sm font-black outline-none"
                      style={{
                        background: colors.sand,
                        border: `2px solid ${colors.ink}`,
                      }}
                    />
                  </div>
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

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Address line 1</Label>
                    <input
                      name="shipping_line1"
                      defaultValue={order.shipping_address?.line1 || ""}
                      placeholder="Street address"
                      className="mt-2 w-full px-3 py-3 text-sm font-black outline-none"
                      style={{
                        background: colors.sand,
                        border: `2px solid ${colors.ink}`,
                      }}
                    />
                  </div>

                  <div>
                    <Label>Address line 2</Label>
                    <input
                      name="shipping_line2"
                      defaultValue={order.shipping_address?.line2 || ""}
                      placeholder="Apartment, suite..."
                      className="mt-2 w-full px-3 py-3 text-sm font-black outline-none"
                      style={{
                        background: colors.sand,
                        border: `2px solid ${colors.ink}`,
                      }}
                    />
                  </div>

                  <div>
                    <Label>City</Label>
                    <input
                      name="shipping_city"
                      defaultValue={order.shipping_address?.city || ""}
                      placeholder="City"
                      className="mt-2 w-full px-3 py-3 text-sm font-black outline-none"
                      style={{
                        background: colors.sand,
                        border: `2px solid ${colors.ink}`,
                      }}
                    />
                  </div>

                  <div>
                    <Label>State / region</Label>
                    <input
                      name="shipping_state"
                      defaultValue={order.shipping_address?.state || ""}
                      placeholder="State"
                      className="mt-2 w-full px-3 py-3 text-sm font-black outline-none"
                      style={{
                        background: colors.sand,
                        border: `2px solid ${colors.ink}`,
                      }}
                    />
                  </div>

                  <div>
                    <Label>Postal code</Label>
                    <input
                      name="shipping_postal_code"
                      defaultValue={order.shipping_address?.postal_code || ""}
                      placeholder="ZIP / postal code"
                      className="mt-2 w-full px-3 py-3 text-sm font-black outline-none"
                      style={{
                        background: colors.sand,
                        border: `2px solid ${colors.ink}`,
                      }}
                    />
                  </div>
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
          </div>
        </div>
      </section>
    </div>
  )
}
