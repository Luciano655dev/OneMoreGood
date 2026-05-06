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

type ProductSyncRow = {
  id: string
  title: string
  price: number
  image: string
  description: string | null
  tags: string[]
  inventory_quantity?: number
  inventory_quantity_us?: number
  inventory_quantity_br?: number
  is_active?: boolean
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

function mapCatalogProductToSyncRow(
  product: Product,
  index: number
): ProductSyncRow {
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

export function toStorefrontProduct(product: StoredProduct): Product {
  return {
    id: product.id,
    title: product.title,
    price: product.price,
    image: product.image,
    description: product.description,
    max_qnt: product.max_qnt,
    tags: product.tags,
    is_test_product: product.is_test_product,
  }
}

function areTagsEqual(a: string[], b: string[]) {
  if (a.length !== b.length) return false
  return a.every((value, index) => value === b[index])
}

function shouldSyncCatalogMetadata(row: ProductRow, catalogRow: ProductSyncRow) {
  return (
    row.title !== catalogRow.title ||
    Number(row.price) !== catalogRow.price ||
    row.image !== catalogRow.image ||
    (row.description ?? null) !== catalogRow.description ||
    !areTagsEqual(Array.isArray(row.tags) ? row.tags : [], catalogRow.tags) ||
    Number(row.sort_order ?? 0) !== catalogRow.sort_order
  )
}

function mergeCatalogWithRow(
  catalogProduct: StoredProduct,
  row?: ProductRow
): StoredProduct {
  if (!row) {
    return catalogProduct
  }

  const { inventoryQuantity, inventoryQuantityUs, inventoryQuantityBr } =
    normalizeInventoryValues(row)

  return {
    ...catalogProduct,
    inventory_quantity: inventoryQuantity,
    inventory_quantity_us: inventoryQuantityUs,
    inventory_quantity_br: inventoryQuantityBr,
    is_active: row.is_active ?? catalogProduct.is_active,
  }
}

async function syncCatalogProducts(rows: ProductRow[]) {
  const supabase = getSupabaseAdmin()
  const rowsById = new Map(rows.map((row) => [row.id, row]))
  const missingRows: ProductSyncRow[] = []
  const staleMetadataRows: Array<Omit<ProductSyncRow, "inventory_quantity" | "inventory_quantity_us" | "inventory_quantity_br" | "is_active">> =
    []

  PRODUCTS.forEach((product, index) => {
    const catalogRow = mapCatalogProductToSyncRow(product, index)
    const existingRow = rowsById.get(product.id)

    if (!existingRow) {
      missingRows.push(catalogRow)
      return
    }

    if (shouldSyncCatalogMetadata(existingRow, catalogRow)) {
      staleMetadataRows.push({
        id: catalogRow.id,
        title: catalogRow.title,
        price: catalogRow.price,
        image: catalogRow.image,
        description: catalogRow.description,
        tags: catalogRow.tags,
        sort_order: catalogRow.sort_order,
      })
    }
  })

  if (missingRows.length > 0) {
    const { error } = await supabase.from("products").upsert(missingRows)
    if (error) throw error
  }

  if (staleMetadataRows.length > 0) {
    const { error } = await supabase.from("products").upsert(staleMetadataRows)
    if (error) throw error
  }

  return {
    missingCount: missingRows.length,
    metadataUpdateCount: staleMetadataRows.length,
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
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("title", { ascending: true })

  if (error) {
    throw error
  }

  const rows = (data ?? []) as ProductRow[]
  return syncCatalogProducts(rows)
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
  await syncCatalogProducts(rows)
  const rowsById = new Map(rows.map((row) => [row.id, row]))
  const mergedProducts = PRODUCTS.map((product, index) =>
    mergeCatalogWithRow(
      mapCatalogProductToStoredProduct(product, index),
      rowsById.get(product.id)
    )
  )

  return includeInactive
    ? mergedProducts
    : mergedProducts.filter((product) => product.is_active !== false)
}

export async function getStoredProductMap({
  includeInactive = false,
}: {
  includeInactive?: boolean
} = {}) {
  const products = await getStoredProducts({ includeInactive })
  return new Map(products.map((product) => [product.id, product]))
}
