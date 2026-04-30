import ShopPage from "@/components/Shop/ShopGrid"
import colors from "@/components/colors"
import { detectShippingCountryFromHeaders } from "@/lib/geo-country"
import type { ShippingCountry } from "@/lib/commerce"
import { getFallbackProducts, getStoredProducts } from "@/lib/products"
import { buildStockMapForCountry } from "@/lib/products"
import { headers } from "next/headers"

export const dynamic = "force-dynamic"

export default async function Page() {
  let storedProducts

  try {
    storedProducts = await getStoredProducts()
  } catch {
    storedProducts = getFallbackProducts()
  }

  const initialProducts = storedProducts.map(
    ({
      inventory_quantity,
      inventory_quantity_us,
      inventory_quantity_br,
      is_active,
      sort_order,
      ...product
    }) => product
  )
  const requestHeaders = await headers()
  const initialShippingCountry = detectShippingCountryFromHeaders(
    requestHeaders
  ) as ShippingCountry
  const initialStockByCountry = {
    US: buildStockMapForCountry(storedProducts, "US"),
    BR: buildStockMapForCountry(storedProducts, "BR"),
  }

  return (
    <div style={{ background: colors.paper, color: colors.ink }}>
      <ShopPage
        initialProducts={initialProducts}
        initialStockByCountry={initialStockByCountry}
        initialShippingCountry={initialShippingCountry}
      />
    </div>
  )
}
