"use client"

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import type { Product } from "@/types"

export type CartItem = {
  product: Product
  qty: number
}

type CartContextValue = {
  items: CartItem[]
  isOpen: boolean
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

const STORAGE_KEY = "omp_cart_v1"

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)

  // Load from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as CartItem[]
      if (Array.isArray(parsed)) setItems(parsed)
    } catch {
      // ignore
    }
  }, [])

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // ignore
    }
  }, [items])

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
