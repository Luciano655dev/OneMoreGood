"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import { useCart } from "../cart/CartContext"
import ProgressiveImage from "../Home/Objects/ProgressiveImage"
import colors from "../colors"
import {
  formatMoneyFromCents,
  getUnitPriceCentsForCountry,
} from "@/lib/commerce"
import type { Product } from "@/types"

type ShopItemProps = {
  id: string
  image: string
  title: string
  price: number
  description?: string
  max_qnt?: number
  stockQuantity?: number
  priority?: boolean
}

function getBadge(qtyLeft?: number) {
  if (typeof qtyLeft !== "number") return null
  if (qtyLeft <= 0) return "Out of stock"
  if (qtyLeft <= 5) return `${qtyLeft} left`
  return "In stock"
}

export default function ShopItem({
  id,
  image,
  title,
  price,
  description,
  max_qnt,
  stockQuantity,
  priority = false,
}: ShopItemProps) {
  const [open, setOpen] = useState(false)
  const { addToCart, openCart, items, shippingCountry } = useCart()

  // Modal UX: ESC closes + lock scroll
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false)
    window.addEventListener("keydown", onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = prev
    }
  }, [open])

  const product: Product = useMemo(
    () => ({ id, title, price, image, description, max_qnt }),
    [id, title, price, image, description, max_qnt]
  )

  const inCartQty = useMemo(() => {
    const found = items.find((it) => it.product?.id === id)
    return found?.qty ?? 0
  }, [items, id])

  const qtyLeft = stockQuantity
  const hasQty = typeof qtyLeft === "number"
  const out = hasQty && qtyLeft <= 0
  const remaining = hasQty ? Math.max(0, qtyLeft - inCartQty) : null
  const atLimit = hasQty && remaining === 0 && !out

  const badge = useMemo(() => getBadge(qtyLeft), [qtyLeft])

  const unitPriceCents = useMemo(
    () =>
      getUnitPriceCentsForCountry(
        { id, title, price, image, description, max_qnt },
        shippingCountry
      ),
    [id, title, price, image, description, max_qnt, shippingCountry]
  )

  const canAdd = !out && !atLimit

  const handleAdd = useCallback(() => {
    if (!canAdd) return
    addToCart(product)
    openCart()
    setOpen(false)
  }, [canAdd, addToCart, openCart, product])

  const openModal = useCallback(() => setOpen(true), [])
  const closeModal = useCallback(() => setOpen(false), [])

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        aria-haspopup="dialog"
        aria-label={`Open ${title}`}
        onClick={openModal}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            openModal()
          }
        }}
        className="group w-full text-left cursor-pointer select-none"
      >
        <div
          className="relative p-3 transition"
          style={{
            background: colors.paper,
            border: `2px solid ${colors.ink}`,
            boxShadow: `3px 3px 0 ${colors.ink}`,
            transform: "rotate(-0.15deg)",
            opacity: out ? 0.75 : 1,
          }}
        >
          <div
            className="pointer-events-none absolute inset-[6px]"
            style={{ border: `1.5px solid ${colors.ink}` }}
          />

          <div
            className="relative overflow-hidden"
            style={{
              background: colors.sand,
              border: `2px solid ${colors.ink}`,
            }}
          >
            <ProgressiveImage
              src={image}
              alt={title}
              width={1200}
              height={1200}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority={priority}
              quality={68}
              className="h-44 w-full object-cover transition duration-300 group-hover:scale-[1.03]"
            />

            {/* ONE badge only */}
            {badge && (
              <div
                className="absolute left-3 top-3 px-3 py-2 text-[11px] font-black uppercase tracking-widest"
                style={{
                  background:
                    badge === "Out of stock" ? colors.clay : colors.paper,
                  color: badge === "Out of stock" ? colors.paper : colors.ink,
                  border: `2px solid ${colors.ink}`,
                  boxShadow: `2px 2px 0 ${colors.ink}`,
                }}
              >
                {badge}
              </div>
            )}
          </div>

          <div className="relative mt-3 px-1 pb-1">
            <div
              className="text-xs font-black uppercase tracking-widest"
              style={{ color: colors.muted }}
            >
              Sock
            </div>

            <div className="mt-1 text-lg font-black leading-snug">{title}</div>

            <div className="mt-2 flex items-center justify-between gap-3">
              <div
                className="text-base font-black"
                style={{ color: colors.accent }}
              >
                {formatMoneyFromCents(unitPriceCents, shippingCountry)}
              </div>

              <div className="flex items-center gap-2">
                {/* Add button (stops click bubbling so it doesn't open modal) */}
                <button
                  type="button"
                  disabled={!canAdd}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleAdd()
                  }}
                  className="px-3 py-2 text-sm font-black uppercase tracking-wider"
                  style={{
                    background: colors.accent,
                    color: colors.paper,
                    border: `2px solid ${colors.ink}`,
                    boxShadow: `2px 2px 0 ${colors.ink}`,
                    opacity: canAdd ? 1 : 0.6,
                    cursor: canAdd ? "pointer" : "not-allowed",
                  }}
                  aria-label={`Add ${title} to cart`}
                >
                  Add
                </button>

                {/* View chip (not a button) */}
                <span
                  className="px-3 py-2 text-xs font-black uppercase tracking-widest"
                  style={{
                    background: colors.sand,
                    border: `2px dashed ${colors.ink}`,
                    boxShadow: `2px 2px 0 ${colors.ink}`,
                  }}
                >
                  View
                </span>
              </div>
            </div>

            <div
              className="mt-3 text-xs font-black uppercase tracking-widest"
              style={{ color: colors.muted }}
            >
              + purpose-backed purchase
            </div>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {open && (
        <div
          className="fixed inset-0 z-[1000] grid place-items-center p-4"
          style={{ background: "rgba(0,0,0,.55)" }}
          onClick={closeModal}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: colors.paper,
              border: `2px solid ${colors.ink}`,
              boxShadow: `6px 6px 0 ${colors.ink}`,
            }}
          >
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{
                background: colors.sand,
                borderBottom: `2px solid ${colors.ink}`,
              }}
            >
              <div
                className="text-xs font-black uppercase tracking-widest"
                style={{ color: colors.muted }}
              >
                Product
              </div>
              <button
                type="button"
                className="px-3 py-2 text-xs font-black uppercase tracking-widest"
                onClick={closeModal}
                aria-label="Close"
                style={{
                  background: colors.paper,
                  border: `2px solid ${colors.ink}`,
                  boxShadow: `2px 2px 0 ${colors.ink}`,
                  cursor: "pointer",
                }}
              >
                Close ✕
              </button>
            </div>

            <div className="grid gap-0 md:grid-cols-2">
              <div
                className="p-4"
                style={{ borderRight: `2px solid ${colors.ink}` }}
              >
                <div
                  style={{
                    background: colors.sand,
                    border: `2px solid ${colors.ink}`,
                  }}
                >
                  <ProgressiveImage
                    src={image}
                    alt={title}
                    width={1600}
                    height={1600}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority={open}
                    loading="eager"
                    quality={82}
                    className="h-72 w-full object-cover md:h-full"
                  />
                </div>
              </div>

              <div className="p-5">
                <div className="text-2xl font-black">{title}</div>
                <div
                  className="mt-2 text-lg font-black"
                  style={{ color: colors.accent }}
                >
                  {formatMoneyFromCents(unitPriceCents, shippingCountry)}
                </div>

                {/* ONE stock line only in modal (no repeating badge text) */}
                <div
                  className="mt-2 text-xs font-black uppercase tracking-widest"
                  style={{ color: out ? colors.clay : colors.muted }}
                >
                  {!hasQty
                    ? "Stock unavailable"
                    : out
                    ? "Out of stock"
                    : qtyLeft <= 5
                    ? `${qtyLeft} left`
                    : "In stock"}
                </div>

                {description ? (
                  <p
                    className="mt-4 text-sm leading-relaxed"
                    style={{ color: colors.muted }}
                  >
                    {description}
                  </p>
                ) : null}

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    disabled={!canAdd}
                    className="px-5 py-3 text-sm font-black uppercase tracking-wider"
                    style={{
                      background: colors.accent,
                      color: colors.paper,
                      border: `2px solid ${colors.ink}`,
                      boxShadow: `3px 3px 0 ${colors.ink}`,
                      opacity: canAdd ? 1 : 0.6,
                      cursor: canAdd ? "pointer" : "not-allowed",
                    }}
                    onClick={handleAdd}
                  >
                    Add to cart
                  </button>

                  <button
                    type="button"
                    className="px-5 py-3 text-sm font-black uppercase tracking-wider"
                    style={{
                      background: colors.paper,
                      color: colors.ink,
                      border: `2px solid ${colors.ink}`,
                      boxShadow: `3px 3px 0 ${colors.ink}`,
                      cursor: "pointer",
                    }}
                    onClick={closeModal}
                  >
                    Back
                  </button>
                </div>

                <div
                  className="mt-6 text-xs font-black uppercase tracking-widest"
                  style={{ color: colors.muted }}
                >
                  🧦 Comfort-first • durable • purpose-driven
                </div>
              </div>
            </div>

            <div
              className="px-4 py-4"
              style={{ borderTop: `2px solid ${colors.ink}` }}
            >
              <div className="flex gap-2 flex-wrap" aria-hidden="true">
                {Array.from({ length: 14 }).map((_, i) => (
                  <span
                    key={i}
                    className="h-0.5 w-6 rotate-[-12deg]"
                    style={{ background: colors.ink, opacity: 0.25 }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
