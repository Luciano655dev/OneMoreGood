import { getSupabaseAdmin } from "@/lib/supabase/server"

export const DEFAULT_PRODUCT_IMAGES_BUCKET = "product-images"

export function getProductImagesBucket() {
  return process.env.SUPABASE_PRODUCT_IMAGES_BUCKET?.trim() || DEFAULT_PRODUCT_IMAGES_BUCKET
}

export function isAbsoluteUrl(value: string) {
  return /^https?:\/\//i.test(value)
}

export function resolveProductImageUrl(image: string, baseUrl?: string) {
  const trimmed = image.trim()
  if (!trimmed) return ""
  if (isAbsoluteUrl(trimmed) || !baseUrl) return trimmed

  return new URL(trimmed, baseUrl).toString()
}

function guessExtension(file: File) {
  const name = file.name || ""
  const fromName = name.includes(".") ? name.slice(name.lastIndexOf(".")).toLowerCase() : ""
  if (fromName) return fromName

  switch (file.type) {
    case "image/jpeg":
      return ".jpg"
    case "image/png":
      return ".png"
    case "image/webp":
      return ".webp"
    case "image/gif":
      return ".gif"
    case "image/svg+xml":
      return ".svg"
    default:
      return ".png"
  }
}

function getStoragePublicPrefix(bucket: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  if (!supabaseUrl) return null

  try {
    const base = new URL(supabaseUrl)
    return `${base.origin}/storage/v1/object/public/${bucket}/`
  } catch {
    return null
  }
}

export function getStoragePathFromPublicUrl(imageUrl?: string | null) {
  const bucket = getProductImagesBucket()
  const prefix = getStoragePublicPrefix(bucket)
  const image = String(imageUrl || "").trim()
  if (!prefix || !image.startsWith(prefix)) return null
  return decodeURIComponent(image.slice(prefix.length))
}

export async function uploadProductImage(params: {
  file: File
  productId: string
}) {
  const { file, productId } = params
  if (!file.type.startsWith("image/")) {
    throw new Error("Product image must be an image file.")
  }

  const bucket = getProductImagesBucket()
  const supabase = getSupabaseAdmin()
  const extension = guessExtension(file)
  const objectPath = `products/${productId}-${Date.now()}${extension}`
  const fileBuffer = Buffer.from(await file.arrayBuffer())

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(objectPath, fileBuffer, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    })

  if (uploadError) {
    throw new Error(uploadError.message || "Could not upload product image.")
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(objectPath)

  return {
    objectPath,
    publicUrl,
  }
}

export async function removeStoredProductImage(imageUrl?: string | null) {
  const objectPath = getStoragePathFromPublicUrl(imageUrl)
  if (!objectPath) return

  const supabase = getSupabaseAdmin()
  const bucket = getProductImagesBucket()
  const { error } = await supabase.storage.from(bucket).remove([objectPath])
  if (error) {
    throw new Error(error.message || "Could not remove product image.")
  }
}
