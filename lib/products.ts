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
  price_br?: number | string | null
  featured?: boolean | null
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

type ProductSeedRow = {
  id: string
  title: string
  price: number
  price_br: number | null
  featured: boolean
  image: string
  description: string | null
  tags: string[]
  inventory_quantity: number
  inventory_quantity_us: number
  inventory_quantity_br: number
  is_active: boolean
  sort_order: number
}

function getDefaultIsActive(product: Product) {
  return !product.is_test_product
}

function mapCatalogProductToStoredProduct(
  product: Product,
  index: number
): StoredProduct {
  const defaultInventory = product.max_qnt ?? 20

  return {
    id: product.id,
    title: product.title,
    price: product.price,
    price_br: product.price_br,
    featured: product.featured ?? false,
    image: product.image,
    description: product.description,
    max_qnt: defaultInventory,
    tags: product.tags ?? [],
    inventory_quantity: defaultInventory,
    inventory_quantity_us: defaultInventory,
    inventory_quantity_br: defaultInventory,
    is_active: getDefaultIsActive(product),
    sort_order: index,
  }
}

function mapCatalogProductToSeedRow(
  product: Product,
  index: number
): ProductSeedRow {
  const defaultInventory = product.max_qnt ?? 20

  return {
    id: product.id,
    title: product.title,
    price: product.price,
    price_br: product.price_br ?? null,
    featured: product.featured ?? false,
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
    mapCatalogProductToStoredProduct(product, index)
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
    price_br:
      row.price_br != null && row.price_br !== ""
        ? Number(row.price_br)
        : undefined,
    featured: row.featured ?? false,
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

export function toStorefrontProduct(product: StoredProduct): Product {
  return {
    id: product.id,
    title: product.title,
    price: product.price,
    price_br: product.price_br,
    featured: product.featured,
    image: product.image,
    description: product.description,
    max_qnt: product.max_qnt,
    tags: product.tags,
    is_test_product: product.is_test_product,
  }
}

export async function syncStoredProductsCatalog() {
  if (!isSupabaseConfigured()) {
    return {
      missingCount: 0,
      metadataUpdateCount: 0,
    }
  }

  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase.from("products").select("id")
  if (error) throw error

  const existingIds = new Set(
    (data ?? []).map((row) => String((row as { id?: string }).id || "").trim())
  )
  const missingRows = PRODUCTS.map((product, index) =>
    mapCatalogProductToSeedRow(product, index)
  ).filter((row) => !existingIds.has(row.id))

  if (missingRows.length > 0) {
    const { error: upsertError } = await supabase.from("products").upsert(missingRows)
    if (upsertError) throw upsertError
  }

  return {
    missingCount: missingRows.length,
    metadataUpdateCount: 0,
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

  const products = ((data ?? []) as ProductRow[]).map(mapRowToProduct)
  return includeInactive
    ? products
    : products.filter((product) => product.is_active !== false)
}

export async function getStoredProductMap({
  includeInactive = false,
}: {
  includeInactive?: boolean
} = {}) {
  const products = await getStoredProducts({ includeInactive })
  return new Map(products.map((product) => [product.id, product]))
}
