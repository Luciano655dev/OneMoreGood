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

function FormSection({
  title,
  desc,
  children,
}: {
  title: string
  desc?: string
  children: React.ReactNode
}) {
  return (
    <div
      className="grid gap-4 p-4 md:p-5"
      style={{
        background: colors.paper,
        border: `2px solid ${colors.ink}`,
        boxShadow: `2px 2px 0 ${colors.ink}`,
      }}
    >
      <div>
        <div className="text-base font-black">{title}</div>
        {desc ? (
          <p className="mt-1 text-sm" style={{ color: colors.muted }}>
            {desc}
          </p>
        ) : null}
      </div>
      {children}
    </div>
  )
}

export default async function AdminNewManualOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams
  const error = params.error?.trim() || null
  const products = await getStoredProducts({ includeInactive: true })

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

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <RoughBorder bg={colors.sand} label="Manual order form">
            <form action={createManualOrderAction} className="grid gap-5">
              <FormSection
                title="1. Sale details"
                desc="Start with the order basics so stock, market, and totals use the right settings."
              >
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
                      Sets the currency and stock market for this sale.
                    </p>
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
                    <Label>Shipping amount</Label>
                    <input
                      name="shipping_dollars"
                      type="number"
                      min="0"
                      step="0.01"
                      defaultValue="0"
                      placeholder="0.00"
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

                  <div className="md:col-span-2 xl:col-span-1">
                    <Label>Sale location</Label>
                    <input
                      name="sale_location"
                      placeholder="Store booth, school event, pickup..."
                      className="mt-2 w-full px-3 py-3 text-sm font-black outline-none"
                      style={{
                        background: colors.paper,
                        border: `2px solid ${colors.ink}`,
                      }}
                    />
                  </div>
                </div>
              </FormSection>

              <FormSection
                title="2. Customer details"
                desc="Customer name is required so the order list stays readable and searchable."
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Customer name</Label>
                    <input
                      name="customer_name"
                      required
                      placeholder="Required"
                      className="mt-2 w-full px-3 py-3 text-sm font-black outline-none"
                      style={{
                        background: colors.paper,
                        border: `2px solid ${colors.ink}`,
                      }}
                    />
                  </div>

                  <div>
                    <Label>Customer email</Label>
                    <input
                      name="customer_email"
                      type="email"
                      placeholder="Optional"
                      className="mt-2 w-full px-3 py-3 text-sm font-black outline-none"
                      style={{
                        background: colors.paper,
                        border: `2px solid ${colors.ink}`,
                      }}
                    />
                  </div>
                </div>
              </FormSection>

              <FormSection
                title="3. Items sold"
                desc="Add one sock per row. You can adjust quantity and final unit price for each line."
              >
                {products.length === 0 ? (
                  <div
                    className="p-4 text-sm font-black"
                    style={{
                      background: colors.paper,
                      border: `2px dashed ${colors.ink}`,
                    }}
                  >
                    No products were found.
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
                <p className="text-xs" style={{ color: colors.muted }}>
                  Add extra rows only when needed. Maximum 25 item rows per
                  order.
                </p>
              </FormSection>

              <FormSection
                title="4. Internal notes"
                desc="Use this for anything staff should remember about the sale."
              >
                <div>
                  <Label>Notes</Label>
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
              </FormSection>

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

          <RoughBorder bg={colors.paper} label="Quick guide">
            <div className="grid gap-4 text-sm" style={{ color: colors.muted }}>
              <div
                className="p-4"
                style={{
                  background: colors.sand,
                  border: `2px solid ${colors.ink}`,
                  boxShadow: `2px 2px 0 ${colors.ink}`,
                }}
              >
                Pick the market first.
                <div className="mt-1">
                  That controls the stock numbers shown in each item row.
                </div>
              </div>
              <div
                className="p-4"
                style={{
                  background: colors.sand,
                  border: `2px solid ${colors.ink}`,
                  boxShadow: `2px 2px 0 ${colors.ink}`,
                }}
              >
                Unit price is the final charged amount.
                <div className="mt-1">
                  Change it directly if you gave a discount or special price.
                </div>
              </div>
              <div
                className="p-4"
                style={{
                  background: colors.sand,
                  border: `2px solid ${colors.ink}`,
                  boxShadow: `2px 2px 0 ${colors.ink}`,
                }}
              >
                Stock updates automatically after save.
                <div className="mt-1">
                  The quantities you log here are removed from inventory.
                </div>
              </div>
              <div
                className="p-4"
                style={{
                  background: colors.sand,
                  border: `2px solid ${colors.ink}`,
                  boxShadow: `2px 2px 0 ${colors.ink}`,
                }}
              >
                Customer info is optional.
                <div className="mt-1">
                  Add it when you want cleaner order history or follow-up.
                </div>
              </div>
            </div>
          </RoughBorder>
        </div>
      </section>
    </div>
  )
}
