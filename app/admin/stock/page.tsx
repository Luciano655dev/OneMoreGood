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
  const products = await getStoredProducts({ includeInactive: true })

  return (
    <div style={{ background: colors.paper, color: colors.ink }}>
      <PageGridBackground />
      <section className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-16">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <SectionTitle
            kicker="Admin"
            title="Stock manager"
            desc="Adjust U.S. and Brazil inventory separately, and control whether a product is visible in the shop."
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
            Product settings updated for {updatedCount} product
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
                No products found.
              </div>
            ) : (
              <form action={updateStockAction} className="grid gap-4">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="grid gap-3 p-4 lg:grid-cols-[minmax(0,1fr)_360px]"
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
                        Catalog: {product.is_active === false ? "Hidden" : "Visible"}
                      </div>
                      <div className="mt-2 text-sm font-black">
                        Current stock: US {product.inventory_quantity_us} • BR{" "}
                        {product.inventory_quantity_br}
                      </div>
                      {product.id === "sock-test-checkout" ? (
                        <div className="mt-2 text-xs" style={{ color: colors.muted }}>
                          Internal test product. Hide it to remove it from the public
                          shop completely.
                        </div>
                      ) : null}
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <Label>Catalog visibility</Label>
                        <select
                          name="product_active"
                          defaultValue={product.is_active === false ? "0" : "1"}
                          className="mt-2 w-full px-3 py-3 text-sm font-black outline-none"
                          style={{
                            background: colors.sand,
                            border: `2px solid ${colors.ink}`,
                          }}
                        >
                          <option value="1">Visible in shop</option>
                          <option value="0">Hidden from shop</option>
                        </select>
                      </div>

                      <div>
                        <Label>U.S. stock</Label>
                        <input
                          name="stock_qty_us"
                          type="number"
                          min="0"
                          step="1"
                          defaultValue={product.inventory_quantity_us}
                          className="mt-2 w-full px-3 py-3 text-sm font-black outline-none"
                          style={{
                            background: colors.sand,
                            border: `2px solid ${colors.ink}`,
                          }}
                        />
                      </div>

                      <div>
                        <Label>Brazil stock</Label>
                        <input
                          name="stock_qty_br"
                          type="number"
                          min="0"
                          step="1"
                          defaultValue={product.inventory_quantity_br}
                          className="mt-2 w-full px-3 py-3 text-sm font-black outline-none"
                          style={{
                            background: colors.sand,
                            border: `2px solid ${colors.ink}`,
                          }}
                        />
                      </div>
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
