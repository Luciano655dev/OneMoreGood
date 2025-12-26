"use client"

import { useEffect, useState } from "react"
import type { Product } from "@/types"
import { PRODUCTS } from "./products"

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown>(null)

  useEffect(() => {
    try {
      // simulate async fetch (later swap for real API)
      setLoading(true)
      setProducts(PRODUCTS)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    products,
    loading,
    error,
  }
}
