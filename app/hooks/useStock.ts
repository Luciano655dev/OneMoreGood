"use client"

import { useCallback, useEffect, useState } from "react"

export type StockMap = Record<string, number>

export function useStock() {
  const [stock, setStock] = useState<StockMap>({})
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    const res = await fetch("/api/stock", { cache: "no-store" })
    const data = await res.json()
    setStock(data.stock ?? {})
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { stock, loading, refresh }
}
