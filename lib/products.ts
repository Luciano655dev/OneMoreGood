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

type ProductRow = {
  id: string
  title: string
  price: number | string
  image: string
  description?: string | null
  max_qnt?: number | string | null
  tags?: string[] | null
  inventory_quantity?: number | string | null
  inventory_quantity_us?: number | string | null
  inventory_quantity_br?: number | string | null
  is_active?: boolean | null
  sort_order?: number | string | null
}

function getDefaultIsActive(product: Product) {
  return !product.is_test_product
}

function mapCatalogProductToRow(product: Product, index: number): ProductRow {
  const defaultInventory = product.max_qnt ?? 20

  return {
    id: product.id,
    title: product.title,
    price: product.price,
    image: product.image,
    description: product.description ?? null,
    tags: product.tags ?? [],
    inventory_quantity: defaultInventory,
    inventory_quantity_us: defaultInventory,
    inventory_quantity_br: defaultInventory,
    is_active: getDefaultIsActive(product),
    sort_order: index,
  }
}

export function getFallbackProducts(): StoredProduct[] {
  return PRODUCTS.map((product, index) =>
    mapRowToProduct(mapCatalogProductToRow(product, index))
  )
}

function normalizeInventoryValues(
  row: Pick<
    ProductRow,
    "inventory_quantity" | "inventory_quantity_us" | "inventory_quantity_br"
  >
) {
  const inventoryQuantity = Number(row.inventory_quantity ?? 0)
  let inventoryQuantityUs = Number(
    row.inventory_quantity_us ?? row.inventory_quantity ?? 0
  )
  let inventoryQuantityBr = Number(
    row.inventory_quantity_br ?? row.inventory_quantity ?? 0
  )

  // Legacy rows may still have only the shared inventory column populated.
  if (
    inventoryQuantity > 0 &&
    inventoryQuantityUs === 0 &&
    inventoryQuantityBr === 0
  ) {
    inventoryQuantityUs = inventoryQuantity
    inventoryQuantityBr = inventoryQuantity
  }

  return {
    inventoryQuantity,
    inventoryQuantityUs,
    inventoryQuantityBr,
  }
}

export function mapRowToProduct(row: ProductRow): StoredProduct {
  const { inventoryQuantity, inventoryQuantityUs, inventoryQuantityBr } =
    normalizeInventoryValues(row)

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
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("title", { ascending: true })

  if (error) {
    throw error
  }

  const rows = (data ?? []) as ProductRow[]
  const existingIds = new Set(rows.map((row) => row.id))
  const missingRows = PRODUCTS.map((product, index) =>
    existingIds.has(product.id) ? null : mapCatalogProductToRow(product, index)
  ).filter((row): row is ProductRow => row !== null)

  if (missingRows.length > 0) {
    const { error: upsertError } = await supabase.from("products").upsert(missingRows)
    if (upsertError) {
      throw upsertError
    }
  }

  const mergedProducts = [...rows, ...missingRows]
    .map(mapRowToProduct)
    .sort((a, b) => {
      const sortDelta = (a.sort_order ?? 0) - (b.sort_order ?? 0)
      if (sortDelta !== 0) return sortDelta
      return a.title.localeCompare(b.title)
    })

  return includeInactive
    ? mergedProducts
    : mergedProducts.filter((product) => product.is_active !== false)
}

export async function getStoredProductMap() {
  const products = await getStoredProducts()
  return new Map(products.map((product) => [product.id, product]))
}
