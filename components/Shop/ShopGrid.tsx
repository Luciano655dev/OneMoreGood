"use client"

import { useMemo, useState, useDeferredValue } from "react"
import { CartProvider, useCart } from "../cart/CartContext"
import CartDrawer from "../cart/CartDrawer"
import ShopItem from "./ShopItem"
import Filters from "./Filters"
import colors from "../colors"
import {
  DEFAULT_SHIPPING_COUNTRY,
  formatMoneyFromCents,
  type ShippingCountry,
} from "@/lib/commerce"
import type { Product } from "@/types"

type StockMap = Record<string, number>
type StockByCountry = Record<ShippingCountry, StockMap>

function CartButton() {
  const { totalQty, toggleOpen } = useCart()

  return (
    <button
      type="button"
      onClick={toggleOpen}
      aria-label="Open cart"
      className="fixed bottom-5 right-5 z-50"
      style={{ color: colors.ink }}
    >
      <div
        className="relative px-4 py-3 font-black uppercase tracking-wider"
        style={{
          background: colors.sand,
          border: `2px solid ${colors.ink}`,
          boxShadow: `3px 3px 0 ${colors.ink}`,
        }}
      >
        {totalQty > 0 && (
          <span
            className="absolute -top-3 -right-3 grid h-8 w-8 place-items-center text-xs font-black"
            aria-label={`${totalQty} item${totalQty === 1 ? "" : "s"} in cart`}
            style={{
              background: colors.clay,
              color: colors.paper,
              border: `2px solid ${colors.ink}`,
              boxShadow: `2px 2px 0 ${colors.ink}`,
            }}
          >
            {totalQty}
          </span>
        )}
        Cart
      </div>
    </button>
  )
}

function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="mt-14 grid place-items-center">
      <div
        className="w-full max-w-xl p-6"
        style={{
          background: colors.sand,
          border: `2px solid ${colors.ink}`,
          boxShadow: `4px 4px 0 ${colors.ink}`,
        }}
      >
        <div className="text-4xl">🧦</div>
        <div className="mt-2 text-2xl font-black">No matches</div>
        <p className="mt-2 text-sm" style={{ color: colors.muted }}>
          Try a different search or clear filters.
        </p>

        <button
          type="button"
          onClick={onClear}
          className="mt-5 px-4 py-3 text-xs font-black uppercase tracking-widest"
          style={{
            background: colors.paper,
            border: `2px solid ${colors.ink}`,
            boxShadow: `3px 3px 0 ${colors.ink}`,
            color: colors.ink,
          }}
        >
          Clear filters
        </button>
      </div>
    </div>
  )
}

function InnerShop({
  products,
  stockByCountry,
}: {
  products: Product[]
  stockByCountry: StockByCountry
}) {
  const { shippingCountry } = useCart()
  const activeStock =
    stockByCountry[shippingCountry] || stockByCountry[DEFAULT_SHIPPING_COUNTRY]

  const [query, setQuery] = useState("")
  const [activeTag, setActiveTag] = useState("All")

  // makes typing feel smoother if products list grows
  const deferredQuery = useDeferredValue(query)
  const deferredTag = useDeferredValue(activeTag)

  const allTags = useMemo(() => {
    const set = new Set<string>()
    for (const p of products) {
      for (const t of p.tags || []) set.add(t)
    }
    return Array.from(set)
  }, [products])

  const visibleProducts = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase()
    const tag = deferredTag.toLowerCase()

    return products
      .filter((p: Product) => {
        const title = (p.title || "").toLowerCase()
        const desc = (p.description || "").toLowerCase()

        const matchesQ = !q || title.includes(q) || desc.includes(q)
        const matchesTag =
          deferredTag === "All" ||
          (p.tags || []).some((t: string) => t.toLowerCase() === tag)

        return matchesQ && matchesTag
      })
      .sort((a, b) => {
        const aOut = typeof activeStock[a.id] === "number" && activeStock[a.id] <= 0
        const bOut = typeof activeStock[b.id] === "number" && activeStock[b.id] <= 0

        if (aOut === bOut) return 0
        return aOut ? 1 : -1
      })
  }, [products, deferredQuery, deferredTag, activeStock])

  const resultsLabel = useMemo(() => {
    const n = visibleProducts.length
    return `${n} result${n === 1 ? "" : "s"}`
  }, [visibleProducts.length])

  const pricingLabel = useMemo(() => {
    if (shippingCountry === "BR") {
      return `Brazil pricing: ${formatMoneyFromCents(
        2500,
        shippingCountry
      )} per sock • Brazil-only checkout`
    }

    return "US pricing: 1 pair $7.99 • 2 pairs $14 • U.S.-only checkout"
  }, [shippingCountry])

  return (
    <div
      className="min-h-screen"
      style={{ background: colors.paper, color: colors.ink }}
    >
      {/* subtle “paper” texture */}
      <div
        className="fixed inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          backgroundImage: `
            radial-gradient(circle at 1px 1px, rgba(0,0,0,0.06) 1px, transparent 0),
            repeating-linear-gradient(0deg, rgba(0,0,0,0.03) 0 1px, transparent 1px 18px),
            repeating-linear-gradient(90deg, rgba(0,0,0,0.02) 0 1px, transparent 1px 22px)
          `,
          backgroundSize: "14px 14px, 18px 18px, 22px 22px",
          mixBlendMode: "multiply",
        }}
      />

      <div className="relative">
        <Filters
          query={query}
          setQuery={setQuery}
          tags={allTags}
          activeTag={activeTag}
          setActiveTag={setActiveTag}
        />

        <div className="max-w-7xl mx-auto px-6 pb-20">
          <div
            className="mt-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between"
            style={{ color: colors.muted }}
          >
            <span
              className="text-sm font-black uppercase tracking-wider"
              aria-live="polite"
            >
              {resultsLabel}
            </span>
            <span
              className="w-full px-3 py-2 text-xs font-black uppercase tracking-widest sm:w-auto"
              style={{
                background: colors.sand,
                border: `2px solid ${colors.ink}`,
                boxShadow: `2px 2px 0 ${colors.ink}`,
                color: colors.ink,
              }}
            >
              {pricingLabel}
            </span>
          </div>

          {visibleProducts.length === 0 ? (
            <EmptyState
              onClear={() => {
                setQuery("")
                setActiveTag("All")
              }}
            />
          ) : (
            <div
              id="shop-grid"
              className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
            >
              {visibleProducts.map((p, index) => (
                <ShopItem
                  key={p.id}
                  {...p}
                  stockQuantity={activeStock[p.id]}
                  priority={index < 3}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ShopPage({
  initialProducts,
  initialStockByCountry,
  initialShippingCountry,
}: {
  initialProducts: Product[]
  initialStockByCountry: StockByCountry
  initialShippingCountry: ShippingCountry
}) {
  return (
    <CartProvider initialShippingCountry={initialShippingCountry}>
      <InnerShop products={initialProducts} stockByCountry={initialStockByCountry} />
      <CartButton />
      <CartDrawer stockByCountry={initialStockByCountry} />
    </CartProvider>
  )
}
