"use client"

import { useCallback, useEffect, useState } from "react"
import {
  DEFAULT_SHIPPING_COUNTRY,
  type ShippingCountry,
} from "@/lib/commerce"

export type StockMap = Record<string, number>

export function useStock(country: ShippingCountry = DEFAULT_SHIPPING_COUNTRY) {
  const [stock, setStock] = useState<StockMap>({})
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/stock?country=${country}`, {
      cache: "no-store",
    })
    const data = await res.json()
    setStock(data.stock ?? {})
    setLoading(false)
  }, [country])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { stock, loading, refresh }
}
