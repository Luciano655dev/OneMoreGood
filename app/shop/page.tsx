import ShopPage from "@/components/Shop/ShopGrid"
import colors from "@/components/colors"
import { getFallbackProducts, getStoredProducts } from "@/lib/products"

export const dynamic = "force-dynamic"

export default async function Page() {
  let storedProducts

  try {
    storedProducts = await getStoredProducts()
  } catch {
    storedProducts = getFallbackProducts()
  }

  const initialProducts = storedProducts.map(
    ({ inventory_quantity, is_active, ...product }) => product
  )
  const initialStock = Object.fromEntries(
    storedProducts.map((product) => [product.id, product.inventory_quantity])
  )

  return (
    <div style={{ background: colors.paper, color: colors.ink }}>
      <ShopPage initialProducts={initialProducts} initialStock={initialStock} />
    </div>
  )
}
