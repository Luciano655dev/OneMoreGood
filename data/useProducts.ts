"use client"

import { useEffect, useState } from "react"
import type { Product } from "@/types"

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        setLoading(true)
        const res = await fetch("/api/products", { cache: "no-store" })
        const data = await res.json()
        if (!res.ok) {
          throw new Error(data?.error || "Could not load products.")
        }
        if (!cancelled) setProducts(data.products ?? [])
      } catch (err) {
        if (!cancelled) setError(err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [])

  return {
    products,
    loading,
    error,
  }
}
