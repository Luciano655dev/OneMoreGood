"use client"

import { useEffect, useState } from "react"
import {
  DEFAULT_SHIPPING_COUNTRY,
  isSupportedShippingCountry,
  type ShippingCountry,
} from "@/lib/commerce"

export function useDetectedShippingCountry(
  initialShippingCountry: ShippingCountry = DEFAULT_SHIPPING_COUNTRY
) {
  const [shippingCountry, setShippingCountry] = useState<ShippingCountry>(
    initialShippingCountry
  )

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

  return shippingCountry
}
