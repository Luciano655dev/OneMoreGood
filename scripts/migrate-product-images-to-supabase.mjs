import { readFile } from "node:fs/promises"
import path from "node:path"

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const bucket = process.env.SUPABASE_PRODUCT_IMAGES_BUCKET || "product-images"

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

const { data: products, error: productsError } = await supabase
  .from("products")
  .select("id,image")
  .order("sort_order", { ascending: true })

if (productsError) {
  console.error("Could not load products:", productsError.message)
  process.exit(1)
}

let migratedCount = 0
let skippedCount = 0

for (const product of products ?? []) {
  const productId = String(product.id || "").trim()
  const image = String(product.image || "").trim()

  if (!productId || !image.startsWith("/")) {
    skippedCount += 1
    continue
  }

  const relativePath = image.replace(/^\/+/, "")
  const absolutePath = path.join(process.cwd(), "public", relativePath)
  const fileBuffer = await readFile(absolutePath)
  const extension = path.extname(absolutePath) || ".png"
  const objectPath = `products/${productId}${extension}`
  const contentType =
    extension === ".jpg" || extension === ".jpeg"
      ? "image/jpeg"
      : extension === ".webp"
        ? "image/webp"
        : extension === ".gif"
          ? "image/gif"
          : extension === ".svg"
            ? "image/svg+xml"
            : "image/png"

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(objectPath, fileBuffer, {
      contentType,
      upsert: true,
    })
  if (uploadError) {
    console.error(`Upload failed for ${productId}:`, uploadError.message)
    process.exit(1)
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(objectPath)

  const { error: updateError } = await supabase
    .from("products")
    .update({ image: publicUrl })
    .eq("id", productId)
  if (updateError) {
    console.error(`Update failed for ${productId}:`, updateError.message)
    process.exit(1)
  }

  migratedCount += 1
  console.log(`Migrated ${productId} -> ${publicUrl}`)
}

console.log(`Done. Migrated ${migratedCount} product images, skipped ${skippedCount}.`)
