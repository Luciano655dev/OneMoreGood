"use client"

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import type { Product } from "@/types"
import {
  CART_STORAGE_KEY,
  DEFAULT_SHIPPING_COUNTRY,
  isSupportedShippingCountry,
  type ShippingCountry,
} from "@/lib/commerce"

export type CartItem = {
  product: Product
  qty: number
}

type CartContextValue = {
  items: CartItem[]
  isOpen: boolean
  shippingCountry: ShippingCountry
  totalQty: number
  subtotal: number

  addToCart: (p: Product, qty?: number) => void
  removeFromCart: (id: string) => void
  setQty: (id: string, qty: number) => void
  clearCart: () => void

  openCart: () => void
  closeCart: () => void
  toggleOpen: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

function inferCountryFromNavigator(): ShippingCountry {
  if (typeof navigator === "undefined") return DEFAULT_SHIPPING_COUNTRY

  const localeHints = [
    navigator.language,
    ...(Array.isArray(navigator.languages) ? navigator.languages : []),
  ]
    .map((value) => String(value || "").toUpperCase())
    .filter(Boolean)

  if (
    localeHints.some(
      (value) =>
        value === "PT-BR" ||
        value.endsWith("-BR") ||
        value.includes("_BR") ||
        value.includes("BR")
    )
  ) {
    return "BR"
  }

  return DEFAULT_SHIPPING_COUNTRY
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return []
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY)
      if (!raw) return []
      const parsed = JSON.parse(raw) as CartItem[]
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  })
  const [isOpen, setIsOpen] = useState(false)
  const [shippingCountry, setShippingCountry] = useState<ShippingCountry>(
    () => inferCountryFromNavigator()
  )

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
    } catch {
      // ignore
    }
  }, [items])

  useEffect(() => {
    let cancelled = false

    const loadCountry = async () => {
      try {
        const res = await fetch("/api/geo-country", { cache: "no-store" })
        if (!res.ok) return
        const data = (await res.json()) as { country?: string }
        const detectedCountry = String(data.country || "").toUpperCase()
        if (!isSupportedShippingCountry(detectedCountry)) return
        if (cancelled) return
        setShippingCountry(detectedCountry)
      } catch {
        // ignore
      }
    }

    loadCountry()

    return () => {
      cancelled = true
    }
  }, [])

  // ESC to close drawer
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [isOpen])

  const totalQty = useMemo(
    () => items.reduce((sum, it) => sum + it.qty, 0),
    [items]
  )

  const subtotal = useMemo(
    () => items.reduce((sum, it) => sum + it.qty * (it.product.price || 0), 0),
    [items]
  )

  const addToCart = (p: Product, qty = 1) => {
    setItems((prev) => {
      const idx = prev.findIndex((x) => x.product.id === p.id)
      const max = p.max_qnt ?? 99

      if (idx === -1) {
        const newQty = clamp(qty, 1, max)
        return [...prev, { product: p, qty: newQty }]
      }

      const copy = [...prev]
      const existing = copy[idx]
      const nextQty = clamp(existing.qty + qty, 1, max)
      copy[idx] = { ...existing, qty: nextQty }
      return copy
    })
  }

  const removeFromCart = (id: string) => {
    setItems((prev) => prev.filter((x) => x.product.id !== id))
  }

  const setQty = (id: string, qty: number) => {
    setItems((prev) =>
      prev.map((x) => {
        if (x.product.id !== id) return x
        const max = x.product.max_qnt ?? 99
        return { ...x, qty: clamp(qty, 1, max) }
      })
    )
  }

  const clearCart = () => setItems([])

  const openCart = () => setIsOpen(true)
  const closeCart = () => setIsOpen(false)
  const toggleOpen = () => setIsOpen((v) => !v)

  const value: CartContextValue = {
    items,
    isOpen,
    shippingCountry,
    totalQty,
    subtotal,
    addToCart,
    removeFromCart,
    setQty,
    clearCart,
    openCart,
    closeCart,
    toggleOpen,
  }

  return (
    <CartContext.Provider value={value}>
      {children}

      {/* optional: lock body scroll when drawer is open */}
      {isOpen ? <style>{`body{ overflow:hidden; }`}</style> : null}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used inside CartProvider")
  return ctx
}
