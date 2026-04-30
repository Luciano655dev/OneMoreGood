import Link from "next/link"

import FormSubmitButton from "@/components/Admin/FormSubmitButton"
import ManualOrderItemsFields from "@/components/Admin/ManualOrderItemsFields"
import colors from "@/components/colors"
import RoughBorder from "@/components/Home/Objects/RoughBorder"
import SectionTitle from "@/components/Home/Objects/SectionTitle"
import PageGridBackground from "@/components/Layout/PageGridBackground"
import {
  ORDER_MARKETS,
  formatOrderMarketLabel,
  ORDER_STATUSES,
  formatOrderStatus,
} from "@/lib/admin/orders"
import { getStoredProducts } from "@/lib/products"
import { createManualOrderAction } from "../actions"

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

export default async function AdminNewManualOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams
  const error = params.error?.trim() || null
  const products = await getStoredProducts()

  return (
    <div style={{ background: colors.paper, color: colors.ink }}>
      <PageGridBackground />
      <section className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <SectionTitle
            kicker="Admin"
            title="Log offline purchase"
            desc="Create an order without Stripe payment for in-person, direct, or cash sales. Stock and order history are updated in Supabase."
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

        {error ? (
          <div
            className="mt-6 p-3 text-sm font-black"
            style={{
              background: colors.sand,
              border: `2px dashed ${colors.ink}`,
              color: colors.clay,
            }}
          >
            {error}
          </div>
        ) : null}

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <RoughBorder bg={colors.sand} label="Manual order form">
            <form action={createManualOrderAction} className="grid gap-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="md:col-span-1">
                  <Label>Customer name</Label>
                  <input
                    name="customer_name"
                    placeholder="Optional"
                    className="mt-2 w-full px-3 py-3 text-sm font-black outline-none"
                    style={{
                      background: colors.paper,
                      border: `2px solid ${colors.ink}`,
                    }}
                  />
                </div>

                <div className="md:col-span-2">
                  <Label>Customer email</Label>
                  <input
                    name="customer_email"
                    type="email"
                    placeholder="Optional (used for order history)"
                    className="mt-2 w-full px-3 py-3 text-sm font-black outline-none"
                    style={{
                      background: colors.paper,
                      border: `2px solid ${colors.ink}`,
                    }}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-5">
                <div>
                  <Label>Status</Label>
                  <select
                    name="status"
                    defaultValue="completed"
                    className="mt-2 w-full px-3 py-3 text-sm font-black outline-none"
                    style={{
                      background: colors.paper,
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
                  <Label>Payment method</Label>
                  <select
                    name="payment_method"
                    defaultValue="cash"
                    className="mt-2 w-full px-3 py-3 text-sm font-black outline-none"
                    style={{
                      background: colors.paper,
                      border: `2px solid ${colors.ink}`,
                    }}
                  >
                    <option value="cash">Cash</option>
                    <option value="card reader">Card reader</option>
                    <option value="bank transfer">Bank transfer</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <Label>Order market</Label>
                  <select
                    id="manual-order-market"
                    name="market"
                    defaultValue="US"
                    className="mt-2 w-full px-3 py-3 text-sm font-black outline-none"
                    style={{
                      background: colors.paper,
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
                    Market defines both payment currency and shipping country.
                  </p>
                </div>

                <div>
                  <Label>Shipping amount</Label>
                  <input
                    name="shipping_dollars"
                    type="number"
                    min="0"
                    step="0.01"
                    defaultValue="0"
                    className="mt-2 w-full px-3 py-3 text-sm font-black outline-none"
                    style={{
                      background: colors.paper,
                      border: `2px solid ${colors.ink}`,
                    }}
                  />
                </div>

                <div>
                  <Label>Purchase date/time</Label>
                  <input
                    name="purchased_at"
                    type="datetime-local"
                    className="mt-2 w-full px-3 py-3 text-sm font-black outline-none"
                    style={{
                      background: colors.paper,
                      border: `2px solid ${colors.ink}`,
                    }}
                  />
                </div>
              </div>

              <div>
                <Label>Sale location</Label>
                <input
                  name="sale_location"
                  placeholder="Optional (ex: Store booth, school event, local pickup)"
                  className="mt-2 w-full px-3 py-3 text-sm font-black outline-none"
                  style={{
                    background: colors.paper,
                    border: `2px solid ${colors.ink}`,
                  }}
                />
              </div>

              <div>
                <Label>Products and quantities</Label>
                {products.length === 0 ? (
                  <div
                    className="mt-2 p-4 text-sm font-black"
                    style={{
                      background: colors.paper,
                      border: `2px dashed ${colors.ink}`,
                    }}
                  >
                    No active products were found.
                  </div>
                ) : (
                  <ManualOrderItemsFields
                    products={products.map((product) => ({
                      id: product.id,
                      title: product.title,
                      price: product.price,
                      inventory_quantity_us: product.inventory_quantity_us,
                      inventory_quantity_br: product.inventory_quantity_br,
                    }))}
                  />
                )}
              <p className="mt-2 text-xs" style={{ color: colors.muted }}>
                Start with one row and add more only when needed. Maximum 25 product rows per manual order.
              </p>
              </div>

              <div>
                <Label>Internal notes</Label>
                <textarea
                  name="notes"
                  rows={5}
                  placeholder="Optional notes about this offline sale"
                  className="mt-2 w-full px-3 py-3 text-sm font-black outline-none"
                  style={{
                    background: colors.paper,
                    border: `2px solid ${colors.ink}`,
                  }}
                />
              </div>

              <FormSubmitButton
                idleLabel="Create manual order"
                pendingLabel="Creating..."
                disabled={products.length === 0}
                className="px-4 py-3 text-xs font-black uppercase tracking-widest"
                style={{
                  background: colors.accent,
                  color: colors.paper,
                  border: `2px solid ${colors.ink}`,
                  boxShadow: `3px 3px 0 ${colors.ink}`,
                  opacity: products.length === 0 ? 0.6 : 1,
                }}
              />
            </form>
          </RoughBorder>

          <RoughBorder bg={colors.paper} label="How this works">
            <div className="grid gap-4 text-sm" style={{ color: colors.muted }}>
              <p>
                This form is for offline sales only. It creates an order record directly in Supabase without Stripe.
              </p>
              <p>
                Inventory is decremented using the selected quantities so your stock remains accurate.
              </p>
              <p>
                Totals are calculated from the exact unit prices entered in this
                form. Use those values to apply any custom offline discount.
              </p>
              <p>
                If no customer email is provided, a placeholder email is saved so the order remains valid in history.
              </p>
            </div>
          </RoughBorder>
        </div>
      </section>
    </div>
  )
}
