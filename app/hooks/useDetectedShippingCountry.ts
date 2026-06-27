"use client"

import { useEffect, useState } from "react"
import {
  DEFAULT_SHIPPING_COUNTRY,
  isSupportedShippingCountry,
  type ShippingCountry,
} from "@/lib/commerce"

let cachedShippingCountry: ShippingCountry | null = null
let pendingShippingCountry: Promise<ShippingCountry | null> | null = null

const BRAZIL_TIME_ZONES = new Set([
  "America/Araguaina",
  "America/Bahia",
  "America/Belem",
  "America/Boa_Vista",
  "America/Campo_Grande",
  "America/Cuiaba",
  "America/Eirunepe",
  "America/Fortaleza",
  "America/Maceio",
  "America/Manaus",
  "America/Noronha",
  "America/Porto_Velho",
  "America/Recife",
  "America/Rio_Branco",
  "America/Santarem",
  "America/Sao_Paulo",
])

function detectBrowserShippingCountry(): ShippingCountry | null {
  if (typeof window === "undefined") return null

  const languages = [
    ...(navigator.languages || []),
    navigator.language,
  ].filter(Boolean)

  if (
    languages.some((language) =>
      String(language).toLowerCase().replace("_", "-").startsWith("pt-br")
    )
  ) {
    return "BR"
  }

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
  if (BRAZIL_TIME_ZONES.has(timeZone)) {
    return "BR"
  }

  return null
}

async function detectShippingCountry() {
  const browserCountry = detectBrowserShippingCountry()
  if (browserCountry) {
    cachedShippingCountry = browserCountry
    return browserCountry
  }

  if (cachedShippingCountry) return cachedShippingCountry
  if (pendingShippingCountry) return pendingShippingCountry

  pendingShippingCountry = fetch("/api/geo-country", { cache: "no-store" })
    .then(async (res) => {
      if (!res.ok) return null

      const data = (await res.json()) as { country?: string }
      const detectedCountry = String(data.country || "").toUpperCase()
      if (!isSupportedShippingCountry(detectedCountry)) return null

      cachedShippingCountry = detectedCountry
      return detectedCountry
    })
    .catch(() => null)
    .finally(() => {
      pendingShippingCountry = null
    })

  return pendingShippingCountry
}

export function useDetectedShippingCountry(
  initialShippingCountry: ShippingCountry = DEFAULT_SHIPPING_COUNTRY
) {
  const [shippingCountry, setShippingCountry] = useState<ShippingCountry>(
    initialShippingCountry
  )

  useEffect(() => {
    let cancelled = false

    const loadCountry = async () => {
      const detectedCountry = await detectShippingCountry()
      if (cancelled || !detectedCountry) return
      setShippingCountry((current) =>
        current === detectedCountry ? current : detectedCountry
      )
    }

    loadCountry()

    return () => {
      cancelled = true
    }
  }, [])

  return shippingCountry
}
