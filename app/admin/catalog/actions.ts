"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { removeStoredProductImage, uploadProductImage } from "@/lib/product-images"
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/server"

function buildCatalogRedirect(params: Record<string, string>) {
  const query = new URLSearchParams(params)
  return `/admin/catalog?${query.toString()}`
}

function parseProductId(value: string) {
  const normalized = value.trim().toLowerCase()
  if (!normalized) {
    throw new Error("Product ID is required.")
  }

  if (!/^[a-z0-9-]+$/.test(normalized)) {
    throw new Error("Product ID must use lowercase letters, numbers, and dashes only.")
  }

  return normalized
}

function parseRequiredText(value: string, label: string) {
  const trimmed = value.trim()
  if (!trimmed) {
    throw new Error(`${label} is required.`)
  }
  return trimmed
}

function parsePrice(value: string) {
  const amount = Number(value.trim())
  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error("Price must be a non-negative amount.")
  }
  return Number(amount.toFixed(2))
}

function parseWholeNumber(value: string, label: string) {
  const amount = Number(value.trim())
  if (!Number.isInteger(amount) || amount < 0) {
    throw new Error(`${label} must be a whole number >= 0.`)
  }
  return amount
}

function parseTags(value: string) {
  return value
    .split(/[\n,]/)
    .map((tag) => tag.trim())
    .filter(Boolean)
}

function getOptionalImageFile(value: FormDataEntryValue | null) {
  if (!(value instanceof File) || value.size <= 0) return null
  return value
}

function revalidateCatalogPaths() {
  revalidatePath("/admin/catalog")
  revalidatePath("/admin/stock")
  revalidatePath("/admin/orders/new")
  revalidatePath("/shop")
}

function buildProductPayload(formData: FormData, image: string) {
  const title = parseRequiredText(String(formData.get("title") || ""), "Title")
  const price = parsePrice(String(formData.get("price") || "0"))
  const description = String(formData.get("description") || "").trim()
  const sortOrder = parseWholeNumber(
    String(formData.get("sort_order") || "0"),
    "Sort order"
  )
  const inventoryQuantityUs = parseWholeNumber(
    String(formData.get("inventory_quantity_us") || "0"),
    "U.S. stock"
  )
  const inventoryQuantityBr = parseWholeNumber(
    String(formData.get("inventory_quantity_br") || "0"),
    "Brazil stock"
  )
  const isActive = String(formData.get("is_active") || "1").trim() === "1"

  return {
    title,
    price,
    image,
    description: description || null,
    tags: parseTags(String(formData.get("tags") || "")),
    inventory_quantity: inventoryQuantityUs,
    inventory_quantity_us: inventoryQuantityUs,
    inventory_quantity_br: inventoryQuantityBr,
    is_active: isActive,
    sort_order: sortOrder,
  }
}

export async function createCatalogProductAction(formData: FormData) {
  try {
    if (!isSupabaseConfigured()) {
      throw new Error("Supabase is not configured.")
    }

    const id = parseProductId(String(formData.get("id") || ""))
    const imageFile = getOptionalImageFile(formData.get("image_file"))
    if (!imageFile) {
      throw new Error("Upload a product image.")
    }

    const supabase = getSupabaseAdmin()
    const { data: existingProduct, error: lookupError } = await supabase
      .from("products")
      .select("id")
      .eq("id", id)
      .maybeSingle()
    if (lookupError) throw new Error(lookupError.message)
    if (existingProduct) {
      throw new Error(`A product with ID "${id}" already exists.`)
    }

    const uploadedImage = await uploadProductImage({
      file: imageFile,
      productId: id,
    })

    try {
      const payload = {
        id,
        ...buildProductPayload(formData, uploadedImage.publicUrl),
      }
      const { error: insertError } = await supabase.from("products").insert(payload)
      if (insertError) {
        throw new Error(insertError.message || "Could not create product.")
      }
    } catch (error) {
      await removeStoredProductImage(uploadedImage.publicUrl).catch(() => {})
      throw error
    }

    revalidateCatalogPaths()
    redirect(buildCatalogRedirect({ saved: "created", product: id }))
  } catch (error) {
    const message =
      error instanceof Error && error.message
        ? error.message
        : "Could not create product."
    redirect(buildCatalogRedirect({ error: message }))
  }
}

export async function updateCatalogProductAction(formData: FormData) {
  try {
    if (!isSupabaseConfigured()) {
      throw new Error("Supabase is not configured.")
    }

    const id = parseProductId(String(formData.get("id") || ""))
    const supabase = getSupabaseAdmin()
    const { data: existingProduct, error: lookupError } = await supabase
      .from("products")
      .select("id,image")
      .eq("id", id)
      .maybeSingle()
    if (lookupError) throw new Error(lookupError.message)
    if (!existingProduct) {
      throw new Error(`Product not found: ${id}`)
    }

    let nextImage = String(existingProduct.image || "").trim()
    const imageFile = getOptionalImageFile(formData.get("image_file"))
    let uploadedImageUrl: string | null = null

    if (imageFile) {
      const uploadedImage = await uploadProductImage({
        file: imageFile,
        productId: id,
      })
      nextImage = uploadedImage.publicUrl
      uploadedImageUrl = uploadedImage.publicUrl
    }

    try {
      const payload = buildProductPayload(formData, nextImage)
      const { error: updateError } = await supabase
        .from("products")
        .update(payload)
        .eq("id", id)
      if (updateError) {
        throw new Error(updateError.message || "Could not update product.")
      }
    } catch (error) {
      if (uploadedImageUrl) {
        await removeStoredProductImage(uploadedImageUrl).catch(() => {})
      }
      throw error
    }

    if (uploadedImageUrl && nextImage !== String(existingProduct.image || "").trim()) {
      await removeStoredProductImage(existingProduct.image).catch(() => {})
    }

    revalidateCatalogPaths()
    redirect(buildCatalogRedirect({ saved: "updated", product: id }))
  } catch (error) {
    const message =
      error instanceof Error && error.message
        ? error.message
        : "Could not update product."
    redirect(buildCatalogRedirect({ error: message }))
  }
}

export async function removeCatalogProductAction(formData: FormData) {
  try {
    if (!isSupabaseConfigured()) {
      throw new Error("Supabase is not configured.")
    }

    const id = parseProductId(String(formData.get("id") || ""))
    const supabase = getSupabaseAdmin()
    const { data: existingProduct, error: lookupError } = await supabase
      .from("products")
      .select("id,title,image")
      .eq("id", id)
      .maybeSingle()
    if (lookupError) throw new Error(lookupError.message)
    if (!existingProduct) {
      throw new Error(`Product not found: ${id}`)
    }

    const historyCheck = await supabase
      .from("order_items")
      .select("id", { count: "exact", head: true })
      .eq("product_id", id)
    if (historyCheck.error) {
      throw new Error(historyCheck.error.message)
    }

    if ((historyCheck.count || 0) > 0) {
      const { error: archiveError } = await supabase
        .from("products")
        .update({ is_active: false })
        .eq("id", id)
      if (archiveError) {
        throw new Error(archiveError.message || "Could not archive product.")
      }

      revalidateCatalogPaths()
      redirect(buildCatalogRedirect({ saved: "archived", product: id }))
    }

    const { error: deleteError } = await supabase.from("products").delete().eq("id", id)
    if (deleteError) {
      throw new Error(deleteError.message || "Could not delete product.")
    }

    await removeStoredProductImage(existingProduct.image).catch(() => {})

    revalidateCatalogPaths()
    redirect(buildCatalogRedirect({ saved: "deleted", product: id }))
  } catch (error) {
    const message =
      error instanceof Error && error.message
        ? error.message
        : "Could not remove product."
    redirect(buildCatalogRedirect({ error: message }))
  }
}
