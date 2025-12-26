"use client"

import { useMemo, useState } from "react"
import { useCart } from "./CartContext"
import colors from "../colors"
import Portal from "./Portal"

function money(n: number) {
  return n.toFixed(2)
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// next business day (skips Sat/Sun)
function nextPickupLabel() {
  const d = new Date()
  d.setDate(d.getDate() + 1)

  // 0 = Sun, 6 = Sat
  if (d.getDay() === 6) d.setDate(d.getDate() + 2) // Sat -> Mon
  if (d.getDay() === 0) d.setDate(d.getDate() + 1) // Sun -> Mon

  return d.toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export default function CartDrawer() {
  const {
    isOpen,
    closeCart,
    items,
    subtotal,
    removeFromCart,
    setQty,
    clearCart,
  } = useCart()

  const hasItems = items.length > 0
  const shipping = 0
  const total = useMemo(() => subtotal + shipping, [subtotal, shipping])

  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [successOpen, setSuccessOpen] = useState(false)

  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  const pickupLocation = "Windermere Preparatory School"
  const pickupWhenLabel = useMemo(() => nextPickupLabel(), [])

  if (!isOpen) return null

  async function submitCheckout() {
    setMsg(null)

    if (!hasItems) {
      setMsg("Your cart is empty.")
      return
    }

    const trimmed = email.trim().toLowerCase()
    if (!isValidEmail(trimmed)) {
      setMsg("Please enter a valid email.")
      return
    }

    setLoading(true)
    try {
      const payload = {
        email: trimmed,
        pickup: {
          location: pickupLocation,
          whenLabel: pickupWhenLabel,
        },
        items: items.map(({ product, qty }: any) => ({
          productId: product.id,
          title: product.title,
          price: product.price,
          qty,
        })),
      }

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok || !data.ok) {
        setMsg(data.error || "Checkout failed. Please try again.")
        return
      }

      clearCart()
      setEmail("")
      setCheckoutOpen(false)
      setMsg(null)
      setSuccessOpen(true)
    } catch {
      setMsg("Checkout failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  function closeAll() {
    setCheckoutOpen(false)
    setSuccessOpen(false)
    closeCart()
  }

  return (
    <div className="fixed inset-0 z-[1100]">
      {/* overlay */}
      <button
        aria-label="Close cart"
        onClick={() => {
          setCheckoutOpen(false)
          setSuccessOpen(false)
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
                setSuccessOpen(false)
                closeCart()
              }}
              className="px-3 py-2 text-xs font-black uppercase tracking-widest"
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
                        <img
                          src={product.image}
                          alt={product.title}
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
                          ${money(product.price)}
                        </div>

                        <div className="mt-3 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <button
                              className="px-3 py-2 text-xs font-black"
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
                              className="px-3 py-2 text-xs font-black"
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
                            className="px-3 py-2 text-xs font-black uppercase tracking-widest"
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
                  className="mt-1 px-4 py-3 text-xs font-black uppercase tracking-widest"
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
            <div className="flex items-center justify-between text-sm font-black">
              <span style={{ color: colors.muted }}>Subtotal</span>
              <span>${money(subtotal)}</span>
            </div>

            <div className="mt-2 flex items-center justify-between text-sm font-black">
              <span style={{ color: colors.muted }}>Shipping</span>
              <span>${money(shipping)}</span>
            </div>

            <div
              className="mt-3 flex items-center justify-between text-base font-black"
              style={{ borderTop: `2px solid ${colors.ink}`, paddingTop: 10 }}
            >
              <span>Total</span>
              <span>${money(total)}</span>
            </div>

            <button
              className="mt-4 w-full px-5 py-4 text-sm font-black uppercase tracking-wider"
              style={{
                background: colors.accent,
                color: colors.paper,
                border: `2px solid ${colors.ink}`,
                boxShadow: `4px 4px 0 ${colors.ink}`,
                opacity: hasItems ? 1 : 0.6,
                cursor: hasItems ? "pointer" : "not-allowed",
              }}
              disabled={!hasItems}
              onClick={() => {
                if (!hasItems) return
                setCheckoutOpen(true)
                setSuccessOpen(false)
                setMsg(null)
              }}
            >
              Checkout
            </button>
          </div>
        </div>
      </aside>

      {/* FULL PAGE MODALS */}
      {(checkoutOpen || successOpen) && (
        <Portal>
          {/* Checkout Modal */}
          {checkoutOpen && (
            <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
              <button
                aria-label="Close checkout"
                className="absolute inset-0"
                onClick={() => !loading && setCheckoutOpen(false)}
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
                  Reserve your order
                </div>

                <div className="mt-2 text-xl font-black">
                  Pickup on {pickupWhenLabel}
                </div>

                <p className="mt-2 text-sm" style={{ color: colors.muted }}>
                  Enter your email. Your order will be reserved and you can pick
                  it up at <b>{pickupLocation}</b> on <b>{pickupWhenLabel}</b>.
                </p>

                <label
                  className="mt-4 block text-xs font-black uppercase tracking-widest"
                  style={{ color: colors.muted }}
                >
                  Email
                </label>

                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-2 w-full px-3 py-3 text-sm font-black outline-none"
                  style={{
                    background: colors.sand,
                    border: `2px solid ${colors.ink}`,
                    color: colors.ink,
                  }}
                  disabled={loading}
                />

                {msg && (
                  <div
                    className="mt-3 p-3 text-sm font-black"
                    style={{
                      background: colors.sand,
                      border: `2px dashed ${colors.ink}`,
                      color: colors.ink,
                    }}
                  >
                    {msg}
                  </div>
                )}

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => setCheckoutOpen(false)}
                    disabled={loading}
                    className="w-1/2 px-4 py-3 text-xs font-black uppercase tracking-widest"
                    style={{
                      background: colors.paper,
                      border: `2px solid ${colors.ink}`,
                      boxShadow: `2px 2px 0 ${colors.ink}`,
                      opacity: loading ? 0.7 : 1,
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    onClick={submitCheckout}
                    disabled={loading || !hasItems}
                    className="w-1/2 px-4 py-3 text-xs font-black uppercase tracking-widest"
                    style={{
                      background: colors.accent,
                      color: colors.paper,
                      border: `2px solid ${colors.ink}`,
                      boxShadow: `2px 2px 0 ${colors.ink}`,
                      opacity: loading ? 0.7 : 1,
                      cursor: loading ? "not-allowed" : "pointer",
                    }}
                  >
                    {loading ? "Reserving..." : "Reserve"}
                  </button>
                </div>

                <div
                  className="mt-3 text-[11px] font-black"
                  style={{ color: colors.muted }}
                >
                  By reserving, you agree we may email you about this pickup.
                </div>
              </div>
            </div>
          )}

          {/* Success Modal */}
          {successOpen && (
            <div className="fixed inset-0 z-[2100] flex items-center justify-center p-4">
              <button
                aria-label="Close success"
                className="absolute inset-0"
                onClick={closeAll}
                style={{ background: "rgba(0,0,0,.55)" }}
              />

              <div
                className="relative w-full max-w-sm p-5"
                style={{
                  background: colors.paper,
                  border: `2px solid ${colors.ink}`,
                  boxShadow: `8px 8px 0 ${colors.ink}`,
                }}
              >
                <div className="text-3xl">✅</div>

                <div className="mt-2 text-xl font-black">Order reserved!</div>

                <p className="mt-2 text-sm" style={{ color: colors.muted }}>
                  We emailed your confirmation. Pick up at{" "}
                  <b>{pickupLocation}</b> on <b>{pickupWhenLabel}</b>.
                </p>

                <button
                  onClick={closeAll}
                  className="mt-4 w-full px-4 py-3 text-xs font-black uppercase tracking-widest"
                  style={{
                    background: colors.accent,
                    color: colors.paper,
                    border: `2px solid ${colors.ink}`,
                    boxShadow: `3px 3px 0 ${colors.ink}`,
                  }}
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </Portal>
      )}
    </div>
  )
}
