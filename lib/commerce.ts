import type { Product } from "@/types"

export const CART_STORAGE_KEY = "omp_cart_v1"

export const SHIPPING_RATE_LABEL = "Standard U.S. shipping"
export const SHIPPING_DELIVERY_MIN_DAYS = 4
export const SHIPPING_DELIVERY_MAX_DAYS = 8

export const RETURN_WINDOW_DAYS = 14

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

export function moneyFromCents(cents: number) {
  return (cents / 100).toFixed(2)
}

export function priceToCents(price: number) {
  return Math.round(price * 100)
}

export function calculatePromoSavingsCents(
  items: Array<{ priceCents: number; qty: number }>
) {
  return items.reduce((sum, item) => {
    const pairCount = Math.floor(item.qty / 2)
    const regularPair = item.priceCents * 2
    const promoPair = 1400
    return sum + pairCount * Math.max(0, regularPair - promoPair)
  }, 0)
}

export function getTotalItemCount(items: SimpleCartItem[]) {
  return items.reduce((sum, item) => sum + item.qty, 0)
}

export function getShippingTierForItemCount(itemCount: number) {
  return SHIPPING_TIERS.find((tier) => itemCount <= tier.maxItems) || SHIPPING_TIERS[SHIPPING_TIERS.length - 1]
}

export function getShippingCentsForItemCount(itemCount: number) {
  if (itemCount <= 0) return 0
  return getShippingTierForItemCount(itemCount).amountCents
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

export function calculateCartTotals(products: Product[], items: SimpleCartItem[]) {
  const productMap = new Map(products.map((product) => [product.id, product]))

  const subtotalCents = items.reduce((sum, item) => {
    const product = productMap.get(item.productId)
    if (!product) return sum
    return sum + priceToCents(product.price) * item.qty
  }, 0)

  const promoSavingsCents = calculatePromoSavingsCents(
    items.map((item) => {
      const product = productMap.get(item.productId)
      return {
        priceCents: product ? priceToCents(product.price) : 0,
        qty: item.qty,
      }
    })
  )

  const itemCount = getTotalItemCount(items)
  const shippableItemCount = getShippableItemCount(products, items)
  const shippingCents = getShippingCentsForItemCount(shippableItemCount)
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

export function shippingPolicySummary(itemCount?: number) {
  const shippingCents =
    typeof itemCount === "number" ? getShippingCentsForItemCount(itemCount) : SHIPPING_TIERS[0].amountCents

  return `We currently ship within the United States. Shipping starts at $${moneyFromCents(
    shippingCents
  )} for this order size. After checkout, we buy the shipping label manually and email tracking once it is available.`
}

export function refundPolicySummary() {
  return `We accept return requests within ${RETURN_WINDOW_DAYS} days for unworn items in original condition. Shipping fees are non-refundable unless the order was damaged or incorrect.`
}
