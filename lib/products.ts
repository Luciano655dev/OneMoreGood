import { PRODUCTS } from "@/data/products"
import type { Product } from "@/types"
import type { ShippingCountry } from "@/lib/commerce"
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/server"

export type StoredProduct = Product & {
  inventory_quantity: number
  inventory_quantity_us: number
  inventory_quantity_br: number
  is_active?: boolean
  sort_order?: number
}

function getDefaultIsActive(product: Product) {
  return !product.is_test_product
}

export function getFallbackProducts(): StoredProduct[] {
  return PRODUCTS.map((product, index) => ({
    ...product,
    max_qnt: product.max_qnt ?? 20,
    inventory_quantity: product.max_qnt ?? 20,
    inventory_quantity_us: product.max_qnt ?? 20,
    inventory_quantity_br: product.max_qnt ?? 20,
    is_active: getDefaultIsActive(product),
    sort_order: index,
  })) as StoredProduct[]
}

function mapRowToProduct(row: any): StoredProduct {
  const inventoryQuantity = Number(row.inventory_quantity ?? 0)
  const inventoryQuantityUs = Number(
    row.inventory_quantity_us ?? row.inventory_quantity ?? 0
  )
  const inventoryQuantityBr = Number(
    row.inventory_quantity_br ?? row.inventory_quantity ?? 0
  )

  return {
    id: row.id,
    title: row.title,
    price: Number(row.price),
    image: row.image,
    description: row.description ?? undefined,
    max_qnt: Math.max(
      Number(row.max_qnt ?? 0),
      inventoryQuantity,
      inventoryQuantityUs,
      inventoryQuantityBr
    ),
    inventory_quantity: inventoryQuantity,
    inventory_quantity_us: inventoryQuantityUs,
    inventory_quantity_br: inventoryQuantityBr,
    tags: Array.isArray(row.tags) ? row.tags : [],
    is_active: row.is_active ?? true,
    sort_order: Number(row.sort_order ?? 0),
  }
}

export function getInventoryForCountry(
  product: Pick<
    StoredProduct,
    "inventory_quantity" | "inventory_quantity_us" | "inventory_quantity_br"
  >,
  country: ShippingCountry
) {
  return country === "BR"
    ? Number(product.inventory_quantity_br ?? product.inventory_quantity ?? 0)
    : Number(product.inventory_quantity_us ?? product.inventory_quantity ?? 0)
}

export function getInventoryColumnForCountry(country: ShippingCountry) {
  return country === "BR" ? "inventory_quantity_br" : "inventory_quantity_us"
}

export function getInventoryUpdateForCountry(
  country: ShippingCountry,
  nextQty: number
) {
  return country === "BR"
    ? { inventory_quantity_br: nextQty }
    : { inventory_quantity_us: nextQty }
}

export function buildStockMapForCountry(
  products: StoredProduct[],
  country: ShippingCountry
) {
  return Object.fromEntries(
    products.map((product) => [product.id, getInventoryForCountry(product, country)])
  )
}

export async function getStoredProducts({
  includeInactive = false,
}: {
  includeInactive?: boolean
} = {}) {
  if (!isSupabaseConfigured()) {
    const fallbackProducts = getFallbackProducts()
    return includeInactive
      ? fallbackProducts
      : fallbackProducts.filter((product) => product.is_active !== false)
  }

  const supabase = getSupabaseAdmin()
  let query = supabase
    .from("products")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("title", { ascending: true })

  if (!includeInactive) {
    query = query.eq("is_active", true)
  }

  const { data, error } = await query

  if (error) {
    throw error
  }

  return (data ?? []).map(mapRowToProduct)
}

export async function getStoredProductMap() {
  const products = await getStoredProducts()
  return new Map(products.map((product) => [product.id, product]))
}
