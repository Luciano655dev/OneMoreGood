"use client"

import { useDetectedShippingCountry } from "@/app/hooks/useDetectedShippingCountry"
import {
  DEFAULT_SHIPPING_COUNTRY,
  type ShippingCountry,
} from "@/lib/commerce"
import { i18n, localeFromShippingCountry } from "@/lib/i18n"

export function useSiteLocale(
  initialShippingCountry: ShippingCountry = DEFAULT_SHIPPING_COUNTRY
) {
  const shippingCountry = useDetectedShippingCountry(initialShippingCountry)
  const locale = localeFromShippingCountry(shippingCountry)

  return {
    locale,
    shippingCountry,
    t: i18n[locale],
  }
}
