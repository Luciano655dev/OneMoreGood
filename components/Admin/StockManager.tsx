"use client"

import Image from "next/image"
import { useDeferredValue, useMemo, useState } from "react"

import FormSubmitButton from "@/components/Admin/FormSubmitButton"
import colors from "@/components/colors"
import RoughBorder from "@/components/Home/Objects/RoughBorder"
import type { StoredProduct } from "@/lib/products"
import { updateStockAction } from "@/app/admin/stock/actions"

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

export default function StockManager({
  products,
}: {
  products: StoredProduct[]
}) {
  const [query, setQuery] = useState("")
  const deferredQuery = useDeferredValue(query)

  const visibleProducts = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase()
    if (!normalizedQuery) return products

    return products.filter((product) => {
      const title = product.title.toLowerCase()
      const id = product.id.toLowerCase()
      return title.includes(normalizedQuery) || id.includes(normalizedQuery)
    })
  }, [products, deferredQuery])

  return (
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
        <>
          <div className="mb-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
            <div>
              <Label>Search item</Label>
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by name or ID"
                className="mt-2 w-full px-3 py-3 text-sm font-black outline-none"
                style={{
                  background: colors.paper,
                  border: `2px solid ${colors.ink}`,
                }}
              />
            </div>
            <div
              className="px-3 py-3 text-[11px] font-black uppercase tracking-widest"
              style={{
                background: colors.paper,
                border: `2px solid ${colors.ink}`,
                boxShadow: `2px 2px 0 ${colors.ink}`,
                color: colors.muted,
              }}
            >
              {visibleProducts.length} item
              {visibleProducts.length === 1 ? "" : "s"}
            </div>
          </div>

          {visibleProducts.length === 0 ? (
            <div
              className="p-4 text-sm font-black"
              style={{
                background: colors.paper,
                border: `2px dashed ${colors.ink}`,
              }}
            >
              No items match this search.
            </div>
          ) : (
            <form action={updateStockAction} className="grid gap-4">
              {visibleProducts.map((product) => (
                <div
                  key={product.id}
                  className="grid gap-4 p-4 lg:grid-cols-[132px_minmax(0,1fr)_360px]"
                  style={{
                    background: colors.paper,
                    border: `2px solid ${colors.ink}`,
                    boxShadow: `2px 2px 0 ${colors.ink}`,
                  }}
                >
                  <input type="hidden" name="product_id" value={product.id} />
                  <div
                    className="w-28 self-start overflow-hidden sm:w-32 lg:w-full"
                    style={{
                      background: colors.sand,
                      border: `2px solid ${colors.ink}`,
                    }}
                  >
                    <div className="relative aspect-square w-full">
                      <Image
                        src={product.image}
                        alt={product.title}
                        fill
                        sizes="(max-width: 1024px) 128px, 132px"
                        className="object-cover"
                      />
                    </div>
                  </div>

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
        </>
      )}
    </RoughBorder>
  )
}
