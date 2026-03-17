import { PRODUCTS } from "@/data/products"
import type { Product } from "@/types"
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/server"

export type StoredProduct = Product & {
  inventory_quantity: number
  is_active?: boolean
}

export function getFallbackProducts(): StoredProduct[] {
  return PRODUCTS.map((product, index) => ({
    ...product,
    max_qnt: product.max_qnt ?? 20,
    inventory_quantity: product.max_qnt ?? 20,
    is_active: true,
    sort_order: index,
  })) as StoredProduct[]
}

function mapRowToProduct(row: any): StoredProduct {
  return {
    id: row.id,
    title: row.title,
    price: Number(row.price),
    image: row.image,
    description: row.description ?? undefined,
    max_qnt: Number(row.inventory_quantity ?? 0),
    inventory_quantity: Number(row.inventory_quantity ?? 0),
    tags: Array.isArray(row.tags) ? row.tags : [],
    is_active: row.is_active ?? true,
  }
}

export async function getStoredProducts() {
  if (!isSupabaseConfigured()) {
    return getFallbackProducts()
  }

  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from("products")
    .select(
      "id,title,price,image,description,inventory_quantity,tags,is_active,sort_order"
    )
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("title", { ascending: true })

  if (error) {
    throw error
  }

  return (data ?? []).map(mapRowToProduct)
}

export async function getStoredProductMap() {
  const products = await getStoredProducts()
  return new Map(products.map((product) => [product.id, product]))
}
