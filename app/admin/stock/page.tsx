import Link from "next/link"

import FormSubmitButton from "@/components/Admin/FormSubmitButton"
import colors from "@/components/colors"
import RoughBorder from "@/components/Home/Objects/RoughBorder"
import SectionTitle from "@/components/Home/Objects/SectionTitle"
import PageGridBackground from "@/components/Layout/PageGridBackground"
import { getStoredProducts } from "@/lib/products"
import { updateStockAction } from "./actions"

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

export default async function AdminStockPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; updated?: string; error?: string }>
}) {
  const params = await searchParams
  const saved = params.saved === "1"
  const updatedCount = Number(params.updated || 0)
  const error = params.error?.trim() || null
  const products = await getStoredProducts()

  return (
    <div style={{ background: colors.paper, color: colors.ink }}>
      <PageGridBackground />
      <section className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-16">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <SectionTitle
            kicker="Admin"
            title="Stock manager"
            desc="Adjust inventory for each sock option by editing the stock number directly."
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
            className="mt-6 p-3 text-sm font-black"
            style={{
              background: "#DDECE9",
              border: `2px solid ${colors.ink}`,
              color: colors.ink,
            }}
          >
            Stock updated for {updatedCount} product
            {updatedCount === 1 ? "" : "s"}.
          </div>
        ) : null}

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

        <div className="mt-8">
          <RoughBorder bg={colors.sand} label="Inventory controls">
            {products.length === 0 ? (
              <div
                className="p-4 text-sm font-black"
                style={{
                  background: colors.paper,
                  border: `2px dashed ${colors.ink}`,
                }}
              >
                No active products found.
              </div>
            ) : (
              <form action={updateStockAction} className="grid gap-4">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="grid gap-3 p-4 lg:grid-cols-[minmax(0,1fr)_180px]"
                    style={{
                      background: colors.paper,
                      border: `2px solid ${colors.ink}`,
                      boxShadow: `2px 2px 0 ${colors.ink}`,
                    }}
                  >
                    <input type="hidden" name="product_id" value={product.id} />
                    <div>
                      <div className="font-black">{product.title}</div>
                      <div className="mt-1 text-xs" style={{ color: colors.muted }}>
                        ID: {product.id}
                      </div>
                      <div className="mt-2 text-sm font-black">
                        Current stock: {product.inventory_quantity}
                      </div>
                    </div>

                    <div>
                      <Label>Stock quantity</Label>
                      <input
                        name="stock_qty"
                        type="number"
                        min="0"
                        step="1"
                        defaultValue={product.inventory_quantity}
                        className="mt-2 w-full px-3 py-3 text-sm font-black outline-none"
                        style={{
                          background: colors.sand,
                          border: `2px solid ${colors.ink}`,
                        }}
                      />
                    </div>
                  </div>
                ))}

                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <FormSubmitButton
                    idleLabel="Save stock updates"
                    pendingLabel="Saving..."
                    className="px-4 py-3 text-xs font-black uppercase tracking-widest"
                    style={{
                      background: colors.accent,
                      color: colors.paper,
                      border: `2px solid ${colors.ink}`,
                      boxShadow: `3px 3px 0 ${colors.ink}`,
                    }}
                  />
                </div>
              </form>
            )}
          </RoughBorder>
        </div>
      </section>
    </div>
  )
}
