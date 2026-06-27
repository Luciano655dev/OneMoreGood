import type { Product } from "@/types"

export const CART_STORAGE_KEY = "omp_cart_v1"

// Online checkout is disabled for now. The full flow (custom BR checkout,
// shipping, Stripe payment) stays in the codebase but users cannot reach it.
// Flip to true to re-enable.
export const ONLINE_CHECKOUT_ENABLED = false

export const RETURN_WINDOW_DAYS = 14

export type ShippingCountry = "US" | "BR"

export const SUPPORTED_SHIPPING_COUNTRIES: ShippingCountry[] = ["US", "BR"]
export const DEFAULT_SHIPPING_COUNTRY: ShippingCountry = "US"

export const SHIPPING_DELIVERY_MIN_DAYS = 4
export const SHIPPING_DELIVERY_MAX_DAYS = 8

export const SHIPPING_RATE_LABEL = "Standard U.S. shipping"
export const BRAZIL_SHIPPING_RATE_LABEL = "Standard Brazil shipping"

export const BRAZIL_UNIT_PRICE_CENTS = 2500 // R$25.00

export const PROMO_PAIR_PRICE_CENTS = 1500 // US "2 for $15" promotion
export const PROMO_UNIT_PRICE_CENTS = PROMO_PAIR_PRICE_CENTS / 2 // $7.50 per sock when Stripe splits promo pairs

export type SimpleCartItem = {
  productId: string
  qty: number
}

export const FREE_SHIPPING_PRODUCT_IDS = new Set(["sock-test-checkout"])

export const SHIPPING_TIERS = [
  {
    maxItems: 2,
    amountCents: 499,
    label: "1-2 pairs",
  },
  {
    maxItems: 6,
    amountCents: 699,
    label: "3-6 pairs",
  },
  {
    maxItems: Number.POSITIVE_INFINITY,
    amountCents: 899,
    label: "7+ pairs",
  },
] as const

export const BRAZIL_SHIPPING_TIERS = [
  {
    maxItems: 2,
    amountCents: 1500,
    label: "1-2 pares",
  },
  {
    maxItems: 6,
    amountCents: 2200,
    label: "3-6 pares",
  },
  {
    maxItems: Number.POSITIVE_INFINITY,
    amountCents: 3000,
    label: "7+ pares",
  },
] as const

// --- Brazil shipping (Correios via Melhor Envio) package estimation ---
// Socks are light; we ship in a small mailer. Weight is estimated from the
// number of pairs plus packaging. Dimensions are a fixed small-box default.
// Melhor Envio enforces minimums of 2cm height, 11cm width, 16cm length.
export const SOCK_PAIR_WEIGHT_GRAMS = 80
export const PACKAGE_BASE_WEIGHT_GRAMS = 50
export const PACKAGE_DIMENSIONS_CM = {
  height: 4,
  width: 11,
  length: 16,
} as const

export type ShippingPackage = {
  weight: number // kilograms (Melhor Envio expects kg)
  height: number // cm
  width: number // cm
  length: number // cm
}

export function getPackageForItemCount(pairs: number): ShippingPackage {
  const safePairs = Math.max(1, Math.floor(pairs))
  const grams =
    PACKAGE_BASE_WEIGHT_GRAMS + safePairs * SOCK_PAIR_WEIGHT_GRAMS

  return {
    weight: Math.max(0.1, grams / 1000),
    height: PACKAGE_DIMENSIONS_CM.height,
    width: PACKAGE_DIMENSIONS_CM.width,
    length: PACKAGE_DIMENSIONS_CM.length,
  }
}

export function moneyFromCents(cents: number) {
  return (cents / 100).toFixed(2)
}

export function formatMoneyFromCents(
  cents: number,
  country: ShippingCountry
) {
  const currency = getCurrencyForCountry(country)
  const locale = country === "BR" ? "pt-BR" : "en-US"

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(cents / 100)
}

export function priceToCents(price: number) {
  return Math.round(price * 100)
}

export function isSupportedShippingCountry(
  value: string
): value is ShippingCountry {
  return SUPPORTED_SHIPPING_COUNTRIES.includes(value as ShippingCountry)
}

export function normalizeShippingCountry(value: unknown) {
  const raw = String(value || "").trim().toUpperCase()
  if (!isSupportedShippingCountry(raw)) return null
  return raw
}

export function getShippingCountryLabel(country: ShippingCountry) {
  return country === "BR" ? "Brazil" : "United States"
}

export function getCurrencyForCountry(country: ShippingCountry) {
  return country === "BR" ? "brl" : "usd"
}

export function getShippingRateLabel(country: ShippingCountry) {
  return country === "BR" ? BRAZIL_SHIPPING_RATE_LABEL : SHIPPING_RATE_LABEL
}

export function getShippingTiers(country: ShippingCountry) {
  return country === "BR" ? BRAZIL_SHIPPING_TIERS : SHIPPING_TIERS
}

export function getUnitPriceCentsForCountry(product: Product, country: ShippingCountry) {
  if (country === "BR") {
    return product.price_br && product.price_br > 0
      ? priceToCents(product.price_br)
      : BRAZIL_UNIT_PRICE_CENTS
  }
  return priceToCents(product.price)
}

export function calculatePromoSavingsCents(
  items: Array<{ priceCents: number; qty: number }>,
  promoPairCents: number
) {
  return items.reduce((sum, item) => {
    const pairCount = Math.floor(item.qty / 2)
    const regularPair = item.priceCents * 2
    return sum + pairCount * Math.max(0, regularPair - promoPairCents)
  }, 0)
}

export function getTotalItemCount(items: SimpleCartItem[]) {
  return items.reduce((sum, item) => sum + item.qty, 0)
}

export function getShippingTierForItemCount(
  itemCount: number,
  country: ShippingCountry = DEFAULT_SHIPPING_COUNTRY
) {
  const tiers = getShippingTiers(country)
  return (
    tiers.find((tier) => itemCount <= tier.maxItems) || tiers[tiers.length - 1]
  )
}

export function getShippingCentsForItemCount(
  itemCount: number,
  country: ShippingCountry = DEFAULT_SHIPPING_COUNTRY
) {
  if (itemCount <= 0) return 0
  return getShippingTierForItemCount(itemCount, country).amountCents
}

export function getShippableItemCount(products: Product[], items: SimpleCartItem[]) {
  const productMap = new Map(products.map((product) => [product.id, product]))

  return items.reduce((sum, item) => {
    const product = productMap.get(item.productId)
    if (!product) return sum
    if (product.is_test_product || FREE_SHIPPING_PRODUCT_IDS.has(product.id)) {
      return sum
    }
    return sum + item.qty
  }, 0)
}

export function calculateCartTotals(
  products: Product[],
  items: SimpleCartItem[],
  country: ShippingCountry = DEFAULT_SHIPPING_COUNTRY
) {
  const productMap = new Map(products.map((product) => [product.id, product]))

  const subtotalCents = items.reduce((sum, item) => {
    const product = productMap.get(item.productId)
    if (!product) return sum
    return sum + getUnitPriceCentsForCountry(product, country) * item.qty
  }, 0)

  const promoSavingsCents =
    country === "US"
      ? calculatePromoSavingsCents(
          items.map((item) => {
            const product = productMap.get(item.productId)
            return {
              priceCents: product
                ? getUnitPriceCentsForCountry(product, country)
                : 0,
              qty: item.qty,
            }
          }),
          PROMO_PAIR_PRICE_CENTS
        )
      : 0

  const itemCount = getTotalItemCount(items)
  const shippableItemCount = getShippableItemCount(products, items)
  const shippingCents = getShippingCentsForItemCount(shippableItemCount, country)
  const totalCents = Math.max(0, subtotalCents - promoSavingsCents) + shippingCents

  return {
    itemCount,
    shippableItemCount,
    subtotalCents,
    promoSavingsCents,
    shippingCents,
    totalCents,
  }
}

export function shippingPolicySummary(
  itemCount?: number,
  country?: ShippingCountry
) {
  if (!country) {
    return "We currently ship only to the United States and Brazil. Shipping is calculated by order size based on detected destination. Tracking is emailed after the shipping label is created."
  }

  const shippingCents =
    typeof itemCount === "number"
      ? getShippingCentsForItemCount(itemCount, country)
      : getShippingTierForItemCount(1, country).amountCents

  return `We currently ship only to ${getShippingCountryLabel(
    country
  )}. Shipping starts at ${formatMoneyFromCents(
    shippingCents,
    country
  )} for this order size. After checkout, we buy the shipping label manually and email tracking once it is available.`
}

export function refundPolicySummary() {
  return `We accept return requests within ${RETURN_WINDOW_DAYS} days for unworn items in original condition. Shipping fees are non-refundable unless the order was damaged or incorrect.`
}
