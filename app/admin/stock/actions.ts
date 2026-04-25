"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

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
    const stockQuantities = formData
      .getAll("stock_qty")
      .map((value) => String(value || "").trim())

    const rowCount = Math.max(productIds.length, stockQuantities.length)

    const supabase = getSupabaseAdmin()
    let updatedCount = 0

    for (let index = 0; index < rowCount; index += 1) {
      const rowNumber = index + 1
      const productId = productIds[index] || ""
      if (!productId) continue

      const nextQty = parseWholeNumber(
        stockQuantities[index] || "",
        "Stock quantity",
        rowNumber
      )

      const { data: product, error: productError } = await supabase
        .from("products")
        .select("id,title,inventory_quantity")
        .eq("id", productId)
        .maybeSingle()

      if (productError) {
        throw new Error(productError.message || `Could not load product ${productId}.`)
      }
      if (!product) {
        throw new Error(`Product not found: ${productId}`)
      }

      const currentQty = Number(product.inventory_quantity || 0)

      if (nextQty === currentQty) {
        continue
      }

      const { error: updateError } = await supabase
        .from("products")
        .update({ inventory_quantity: nextQty })
        .eq("id", productId)

      if (updateError) {
        throw new Error(updateError.message || `Could not update ${product.title}.`)
      }

      updatedCount += 1
    }

    revalidatePath("/admin/stock")
    revalidatePath("/admin/orders/new")
    revalidatePath("/shop")
    redirect(`/admin/stock?saved=1&updated=${updatedCount}`)
  } catch (error) {
    if (isNextRedirectError(error)) throw error
    const message =
      error instanceof Error && error.message
        ? error.message
        : "Could not update stock."
    redirect(`/admin/stock?error=${encodeURIComponent(message)}`)
  }
}
