"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import {
  getInventoryForCountry,
  getStoredProductMap,
} from "@/lib/products"
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/server"

function isNextRedirectError(error: unknown) {
  if (!error || typeof error !== "object") return false
  const digest = "digest" in error ? (error as { digest?: unknown }).digest : null
  return typeof digest === "string" && digest.includes("NEXT_REDIRECT")
}

function parseWholeNumber(value: string, label: string, rowNumber: number) {
  const trimmed = value.trim()
  if (!trimmed) {
    throw new Error(`${label} is required (row ${rowNumber}).`)
  }

  const parsed = Number(trimmed)
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new Error(`${label} must be a whole number >= 0 (row ${rowNumber}).`)
  }
  return parsed
}

export async function updateStockAction(formData: FormData) {
  try {
    if (!isSupabaseConfigured()) {
      throw new Error("Supabase is not configured.")
    }

    const productIds = formData
      .getAll("product_id")
      .map((value) => String(value || "").trim())
    const productActiveValues = formData
      .getAll("product_active")
      .map((value) => String(value || "").trim())
    const stockQuantitiesUs = formData
      .getAll("stock_qty_us")
      .map((value) => String(value || "").trim())
    const stockQuantitiesBr = formData
      .getAll("stock_qty_br")
      .map((value) => String(value || "").trim())

    const rowCount = productIds.length
    if (
      productActiveValues.length < rowCount ||
      stockQuantitiesUs.length < rowCount ||
      stockQuantitiesBr.length < rowCount
    ) {
      throw new Error("Stock form is missing one or more product values.")
    }

    const supabase = getSupabaseAdmin()
    const submittedRows = []

    for (let index = 0; index < rowCount; index += 1) {
      const rowNumber = index + 1
      const productId = productIds[index] || ""
      if (!productId) continue

      const nextQtyUs = parseWholeNumber(
        stockQuantitiesUs[index] || "",
        "U.S. stock quantity",
        rowNumber
      )
      const nextQtyBr = parseWholeNumber(
        stockQuantitiesBr[index] || "",
        "Brazil stock quantity",
        rowNumber
      )
      const nextIsActive = (productActiveValues[index] || "1") === "1"

      submittedRows.push({
        productId,
        nextQtyUs,
        nextQtyBr,
        nextIsActive,
      })
    }

    if (submittedRows.length === 0) {
      redirect("/admin")
    }

    const productMap = await getStoredProductMap({ includeInactive: true })

    for (const row of submittedRows) {
      const product = productMap.get(row.productId)
      if (!product) {
        throw new Error(`Product not found: ${row.productId}`)
      }

      const currentQtyUs = getInventoryForCountry(product, "US")
      const currentQtyBr = getInventoryForCountry(product, "BR")
      const currentIsActive = product.is_active !== false

      if (
        row.nextQtyUs === currentQtyUs &&
        row.nextQtyBr === currentQtyBr &&
        row.nextIsActive === currentIsActive
      ) {
        continue
      }

      const { error: updateError } = await supabase
        .from("products")
        .update({
          inventory_quantity: row.nextQtyUs,
          inventory_quantity_us: row.nextQtyUs,
          inventory_quantity_br: row.nextQtyBr,
          is_active: row.nextIsActive,
        })
        .eq("id", row.productId)

      if (updateError) {
        throw new Error(updateError.message || `Could not update ${product.title}.`)
      }
    }

    revalidatePath("/admin")
    revalidatePath("/admin/orders")
    revalidatePath("/admin/stock")
    revalidatePath("/admin/orders/new")
    revalidatePath("/shop")
    redirect("/admin/orders")
  } catch (error) {
    if (isNextRedirectError(error)) throw error
    const message =
      error instanceof Error && error.message
        ? error.message
        : "Could not update stock."
    redirect(`/admin/stock?error=${encodeURIComponent(message)}`)
  }
}
