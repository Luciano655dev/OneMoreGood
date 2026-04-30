"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { useCart } from "./CartContext"
import colors from "../colors"
import Portal from "./Portal"
import ProgressiveImage from "../Home/Objects/ProgressiveImage"
import {
  calculateCartTotals,
  formatMoneyFromCents,
  getTotalItemCount,
  getShippingCountryLabel,
  getUnitPriceCentsForCountry,
  refundPolicySummary,
  shippingPolicySummary,
} from "@/lib/commerce"

export default function CartDrawer() {
  const {
    isOpen,
    closeCart,
    items,
    shippingCountry,
    removeFromCart,
    setQty,
    clearCart,
  } = useCart()

  const hasItems = items.length > 0
  const itemCount = useMemo(
    () =>
      getTotalItemCount(
        items.map(({ product, qty }) => ({ productId: product.id, qty }))
      ),
    [items]
  )
  const {
    subtotalCents: baseSubtotalCents,
    promoSavingsCents,
    shippingCents,
    totalCents,
  } = useMemo(
    () =>
      calculateCartTotals(
        items.map(({ product }) => product),
        items.map(({ product, qty }) => ({ productId: product.id, qty })),
        shippingCountry
      ),
    [items, shippingCountry]
  )

  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const popButtonClass =
    "cursor-pointer transition duration-150 ease-out hover:-translate-y-0.5 hover:brightness-[0.98] active:translate-y-px"
  const disabledButtonClass = "disabled:translate-y-0 disabled:brightness-100"

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[1100]">
      {/* overlay */}
      <button
        aria-label="Close cart"
        onClick={() => {
          setCheckoutOpen(false)
          closeCart()
        }}
        className="absolute inset-0"
        style={{ background: "rgba(0,0,0,.55)" }}
      />

      {/* panel */}
      <aside
        className="absolute right-0 top-0 h-full w-full max-w-md"
        style={{
          background: colors.paper,
          borderLeft: `2px solid ${colors.ink}`,
          boxShadow: `-6px 0 0 ${colors.ink}`,
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Cart drawer"
      >
        <div className="flex h-full flex-col">
          {/* header */}
          <div
            className="flex items-center justify-between px-4 py-4"
            style={{
              background: colors.sand,
              borderBottom: `2px solid ${colors.ink}`,
            }}
          >
            <div
              className="text-sm font-black uppercase tracking-widest"
              style={{ color: colors.muted }}
            >
              Your cart
            </div>

            <button
              onClick={() => {
                setCheckoutOpen(false)
                closeCart()
              }}
              className={`px-3 py-2 text-xs font-black uppercase tracking-widest ${popButtonClass} ${disabledButtonClass}`}
              style={{
                background: colors.paper,
                border: `2px solid ${colors.ink}`,
                boxShadow: `2px 2px 0 ${colors.ink}`,
                color: colors.ink,
              }}
            >
              Close ✕
            </button>
          </div>

          {/* items */}
          <div className="flex-1 overflow-auto px-4 py-4">
            {!hasItems ? (
              <div
                className="p-5"
                style={{
                  background: colors.sand,
                  border: `2px solid ${colors.ink}`,
                  boxShadow: `3px 3px 0 ${colors.ink}`,
                }}
              >
                <div className="text-3xl">🧦</div>
                <div className="mt-2 text-xl font-black">Cart is empty</div>
                <p className="mt-1 text-sm" style={{ color: colors.muted }}>
                  Add a pair and it’ll show up here.
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {items.map(({ product, qty }) => (
                  <div
                    key={product.id}
                    className="p-3"
                    style={{
                      background: colors.paper,
                      border: `2px solid ${colors.ink}`,
                      boxShadow: `3px 3px 0 ${colors.ink}`,
                    }}
                  >
                    <div className="flex gap-3">
                      <div
                        className="h-16 w-16 overflow-hidden"
                        style={{
                          background: colors.sand,
                          border: `2px solid ${colors.ink}`,
                        }}
                      >
                        <ProgressiveImage
                          src={product.image}
                          alt={product.title}
                          width={320}
                          height={320}
                          sizes="64px"
                          quality={60}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-black truncate">
                          {product.title}
                        </div>
                        <div
                          className="mt-1 text-sm font-black"
                          style={{ color: colors.accent }}
                        >
                          {formatMoneyFromCents(
                            getUnitPriceCentsForCountry(
                              product,
                              shippingCountry
                            ),
                            shippingCountry
                          )}
                        </div>

                        <div className="mt-3 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <button
                              className={`px-3 py-2 text-xs font-black ${popButtonClass} ${disabledButtonClass}`}
                              style={{
                                background: colors.paper,
                                border: `2px solid ${colors.ink}`,
                                boxShadow: `2px 2px 0 ${colors.ink}`,
                              }}
                              onClick={() => setQty(product.id, qty - 1)}
                              aria-label={`Decrease quantity of ${product.title}`}
                            >
                              −
                            </button>

                            <div
                              className="px-3 py-2 text-xs font-black"
                              style={{
                                background: colors.sand,
                                border: `2px solid ${colors.ink}`,
                              }}
                            >
                              {qty}
                            </div>

                            <button
                              className={`px-3 py-2 text-xs font-black ${popButtonClass} ${disabledButtonClass}`}
                              style={{
                                background: colors.paper,
                                border: `2px solid ${colors.ink}`,
                                boxShadow: `2px 2px 0 ${colors.ink}`,
                              }}
                              onClick={() => setQty(product.id, qty + 1)}
                              aria-label={`Increase quantity of ${product.title}`}
                            >
                              +
                            </button>
                          </div>

                          <button
                            className={`px-3 py-2 text-xs font-black uppercase tracking-widest ${popButtonClass} ${disabledButtonClass}`}
                            style={{
                              background: colors.clay,
                              color: colors.paper,
                              border: `2px solid ${colors.ink}`,
                              boxShadow: `2px 2px 0 ${colors.ink}`,
                            }}
                            onClick={() => removeFromCart(product.id)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={clearCart}
                  className={`mt-1 px-4 py-3 text-xs font-black uppercase tracking-widest ${popButtonClass} ${disabledButtonClass}`}
                  style={{
                    background: colors.paper,
                    border: `2px dashed ${colors.ink}`,
                    boxShadow: `3px 3px 0 ${colors.ink}`,
                    color: colors.ink,
                  }}
                >
                  Clear cart
                </button>
              </div>
            )}
          </div>

          {/* footer */}
          <div
            className="shrink-0 px-4 py-4"
            style={{
              borderTop: `2px solid ${colors.ink}`,
              background: colors.sand,
            }}
          >
            <div
              className="grid gap-2 rounded-2xl p-3"
              style={{
                background: colors.paper,
                border: `2px solid ${colors.ink}`,
                boxShadow: `3px 3px 0 ${colors.ink}`,
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-black uppercase tracking-widest" style={{ color: colors.muted }}>
                  Shipping country
                </span>
                <span
                  className="px-2 py-2 text-xs font-black uppercase tracking-widest"
                  style={{
                    background: colors.sand,
                    border: `2px solid ${colors.ink}`,
                    color: colors.ink,
                  }}
                >
                  {getShippingCountryLabel(shippingCountry)}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm font-black">
                <span style={{ color: colors.muted }}>Subtotal</span>
                <span>
                  {formatMoneyFromCents(baseSubtotalCents, shippingCountry)}
                </span>
              </div>

              {hasItems && shippingCountry === "US" && (
                <div className="flex items-center justify-between text-sm font-black">
                  <span style={{ color: colors.muted }}>Promo (2 for $14)</span>
                  <span style={{ color: colors.clay }}>
                    {promoSavingsCents > 0
                      ? `- ${formatMoneyFromCents(
                          promoSavingsCents,
                          shippingCountry
                        )}`
                      : formatMoneyFromCents(0, shippingCountry)}
                  </span>
                </div>
              )}

              {hasItems && (
                <div className="flex items-center justify-between text-sm font-black">
                  <span style={{ color: colors.muted }}>Shipping</span>
                  <span>
                    {formatMoneyFromCents(shippingCents, shippingCountry)}
                  </span>
                </div>
              )}
            </div>

            <div
              className="mt-3 flex items-center justify-between text-base font-black"
              style={{ borderTop: `2px solid ${colors.ink}`, paddingTop: 10 }}
            >
              <span>Total</span>
              <span>{formatMoneyFromCents(totalCents, shippingCountry)}</span>
            </div>

            {hasItems && (
              <p className="mt-3 text-xs" style={{ color: colors.muted }}>
                {shippingPolicySummary(itemCount, shippingCountry)}
              </p>
            )}

            <button
              className={`mt-4 w-full px-5 py-4 text-sm font-black uppercase tracking-wider ${popButtonClass} ${disabledButtonClass}`}
              style={{
                background: colors.accent,
                color: colors.paper,
                border: `2px solid ${colors.ink}`,
                boxShadow: `4px 4px 0 ${colors.ink}`,
                opacity: hasItems ? 1 : 0.6,
              }}
              disabled={!hasItems}
              onClick={() => {
                if (!hasItems) return
                setCheckoutOpen(true)
              }}
            >
              Contact to buy
            </button>

            <div className="mt-3 text-[11px]" style={{ color: colors.muted }}>
              {refundPolicySummary()}{" "}
              <Link href="/policies" className="underline">
                Shipping
              </Link>{" "}
              and{" "}
              <Link href="/policies" className="underline">
                refund details
              </Link>
              .
            </div>
          </div>
        </div>
      </aside>

      {/* FULL PAGE MODALS */}
      {checkoutOpen && (
        <Portal>
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            <button
              aria-label="Close contact modal"
              className="absolute inset-0"
              onClick={() => setCheckoutOpen(false)}
              style={{ background: "rgba(0,0,0,.55)" }}
            />

            <div
              className="relative w-full max-w-sm p-4"
              style={{
                background: colors.paper,
                border: `2px solid ${colors.ink}`,
                boxShadow: `6px 6px 0 ${colors.ink}`,
              }}
            >
              <div
                className="text-sm font-black uppercase tracking-widest"
                style={{ color: colors.muted }}
              >
                Online payment paused
              </div>

              <div className="mt-2 text-xl font-black">Contact us to buy</div>

              <p className="mt-2 text-sm" style={{ color: colors.muted }}>
                Online payment is suspended for now.
                <br />
                <br />
                If you want to buy these items, contact Luciano directly and we
                will arrange the order manually. The current estimated shipping
                for {getShippingCountryLabel(shippingCountry)} is{" "}
                {formatMoneyFromCents(shippingCents, shippingCountry)} per
                order.
              </p>

              <div
                className="mt-4 grid gap-3"
              >
                <a
                  href="mailto:lucianomenezes655@gmail.com"
                  className="block px-3 py-3 text-sm font-black underline"
                  style={{
                    background: colors.sand,
                    border: `2px solid ${colors.ink}`,
                    color: colors.ink,
                    boxShadow: `2px 2px 0 ${colors.ink}`,
                  }}
                >
                  lucianomenezes655@gmail.com
                </a>

                <a
                  href="https://www.instagram.com/lucianohlmenezes/"
                  target="_blank"
                  rel="noreferrer"
                  className="block px-3 py-3 text-sm font-black underline"
                  style={{
                    background: colors.paper,
                    border: `2px solid ${colors.ink}`,
                    color: colors.ink,
                    boxShadow: `2px 2px 0 ${colors.ink}`,
                  }}
                >
                  Instagram: @lucianohlmenezes
                </a>

                <div
                  className="px-3 py-3 text-sm font-black"
                  style={{
                    background: colors.sand,
                    border: `2px dashed ${colors.ink}`,
                    color: colors.ink,
                  }}
                >
                  Include the product name, quantity, and your shipping country
                  in the message.
                </div>
              </div>

              <label
                className="mt-4 block text-xs font-black uppercase tracking-widest"
                style={{ color: colors.muted }}
              >
                Detected destination country
              </label>

              <div
                className="mt-2 w-full px-3 py-3 text-sm font-black"
                style={{
                  background: colors.sand,
                  border: `2px solid ${colors.ink}`,
                  color: colors.ink,
                }}
              >
                {getShippingCountryLabel(shippingCountry)}
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => setCheckoutOpen(false)}
                  className={`w-1/2 px-4 py-3 text-xs font-black uppercase tracking-widest ${popButtonClass} ${disabledButtonClass}`}
                  style={{
                    background: colors.paper,
                    border: `2px solid ${colors.ink}`,
                    boxShadow: `2px 2px 0 ${colors.ink}`,
                  }}
                >
                  Close
                </button>

                <Link
                  href="/#contact"
                  onClick={() => setCheckoutOpen(false)}
                  className={`flex w-1/2 items-center justify-center px-4 py-3 text-xs font-black uppercase tracking-widest ${popButtonClass} ${disabledButtonClass}`}
                  style={{
                    background: colors.accent,
                    color: colors.paper,
                    border: `2px solid ${colors.ink}`,
                    boxShadow: `2px 2px 0 ${colors.ink}`,
                  }}
                >
                  Contact page
                </Link>
              </div>
              <div className="mt-3 text-[11px]" style={{ color: colors.muted }}>
                Shipping and refund details remain available in the{" "}
                <Link href="/policies" className="underline">
                  policy page
                </Link>{" "}
                while direct orders are handled manually.
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  )
}
