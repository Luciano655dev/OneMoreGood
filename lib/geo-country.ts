import {
  DEFAULT_SHIPPING_COUNTRY,
  normalizeShippingCountry,
  type ShippingCountry,
} from "@/lib/commerce"

function countryFromAcceptLanguage(headerValue: string | null) {
  const raw = String(headerValue || "").trim()
  if (!raw) return null

  const first = raw.split(",")[0]?.trim() || ""
  if (!first) return null

  // Examples: en-US, pt-BR
  const parts = first.split("-")
  const countryCode = parts[1] || ""
  return normalizeShippingCountry(countryCode)
}

export function detectShippingCountryFromHeaders(headers: Headers): ShippingCountry {
  const vercelCountry = normalizeShippingCountry(
    headers.get("x-vercel-ip-country")
  )
  const cloudflareCountry = normalizeShippingCountry(headers.get("cf-ipcountry"))
  const cloudfrontCountry = normalizeShippingCountry(
    headers.get("cloudfront-viewer-country")
  )
  const acceptLanguageCountry = countryFromAcceptLanguage(
    headers.get("accept-language")
  )

  return (
    vercelCountry ||
    cloudflareCountry ||
    cloudfrontCountry ||
    acceptLanguageCountry ||
    DEFAULT_SHIPPING_COUNTRY
  )
}
