"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import {
  ORDER_MARKETS,
  ORDER_STATUSES,
  getOrderCurrencyForMarket,
  getOrderMarketFromCurrency,
  normalizeOrderMarket,
} from "@/lib/admin/orders"
import {
  getInventoryForCountry,
  getInventoryUpdateForCountry,
  getStoredProductMap,
} from "@/lib/products"
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/server"
import { isMissingCurrencyColumnError } from "@/lib/supabase/errors"

function appendQueryParam(path: string, key: string, value: string) {
  const separator = path.includes("?") ? "&" : "?"
  return `${path}${separator}${key}=${encodeURIComponent(value)}`
}

function getSafeAdminReturnPath(rawPath: string, fallbackId?: string) {
  const fallback = fallbackId ? `/admin/orders/${fallbackId}` : "/admin/orders"
  if (!rawPath) return fallback
  if (!rawPath.startsWith("/admin/orders")) return fallback
  return rawPath
}

function isNextRedirectError(error: unknown) {
  if (!error || typeof error !== "object") return false
  const digest = "digest" in error ? (error as { digest?: unknown }).digest : null
  return typeof digest === "string" && digest.includes("NEXT_REDIRECT")
}

function parseDateTimeLocalToIso(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return null

  const parsed = new Date(trimmed)
  if (Number.isNaN(parsed.getTime())) {
    throw new Error("Purchase date/time is invalid.")
  }
  return parsed.toISOString()
}

function nullableTrimmedString(value: FormDataEntryValue | null) {
  const trimmed = String(value || "").trim()
  return trimmed || null
}

function buildShippingAddressFromFormData(
  formData: FormData,
  market: "US" | "BR"
) {
  const line1 = nullableTrimmedString(formData.get("shipping_line1"))
  const line2 = nullableTrimmedString(formData.get("shipping_line2"))
  const city = nullableTrimmedString(formData.get("shipping_city"))
  const state = nullableTrimmedString(formData.get("shipping_state"))
  const postalCode = nullableTrimmedString(formData.get("shipping_postal_code"))

  return {
    ...(line1 ? { line1 } : {}),
    ...(line2 ? { line2 } : {}),
    ...(city ? { city } : {}),
    ...(state ? { state } : {}),
    ...(postalCode ? { postal_code: postalCode } : {}),
    country: market,
  }
}

type EditedOrderItem = {
  productId: string
  title: string
  quantity: number
  unitPriceCents: number
}

const EDIT_ORDER_MAX_ROWS = 100

function parseEditedOrderItems(formData: FormData): EditedOrderItem[] {
  const productIds = formData
    .getAll("order_item_product_id")
    .map((value) => String(value || "").trim())
  const titles = formData
    .getAll("order_item_title")
    .map((value) => String(value || "").trim())
  const quantities = formData
    .getAll("order_item_quantity")
    .map((value) => String(value || "").trim())
  const unitPrices = formData
    .getAll("order_item_unit_price_dollars")
    .map((value) => String(value || "").trim())

  const maxLength = Math.max(
    productIds.length,
    titles.length,
    quantities.length,
    unitPrices.length
  )

  if (maxLength > EDIT_ORDER_MAX_ROWS) {
    throw new Error(`Order update supports at most ${EDIT_ORDER_MAX_ROWS} item rows.`)
  }

  const items: EditedOrderItem[] = []

  for (let index = 0; index < maxLength; index += 1) {
    const productId = productIds[index] || ""
    const titleRaw = titles[index] || ""
    const qtyRaw = quantities[index] || ""
    const unitPriceRaw = unitPrices[index] || ""
    const qty = Number(qtyRaw)

    if (!productId && !titleRaw && (!qtyRaw || qty === 0) && !unitPriceRaw) {
      continue
    }

    if (!productId) {
      throw new Error(`Product ID is required on row ${index + 1}.`)
    }

    if (!Number.isInteger(qty) || qty <= 0) {
      throw new Error(`Quantity must be a positive whole number on row ${index + 1}.`)
    }

    if (unitPriceRaw === "") {
      throw new Error(`Unit price is required on row ${index + 1}.`)
    }

    const title = titleRaw || productId

    items.push({
      productId,
      title,
      quantity: qty,
      unitPriceCents: parseAmountToCents(unitPriceRaw, `Unit price on row ${index + 1}`),
    })
  }

  if (items.length === 0) {
    throw new Error("Add at least one line item.")
  }

  return items
}

export async function updateOrderAction(formData: FormData) {
  const id = String(formData.get("id") || "").trim()
  const returnToRaw = String(formData.get("return_to") || "").trim()
  const returnTo = getSafeAdminReturnPath(returnToRaw, id || undefined)

  try {
    if (!isSupabaseConfigured()) {
      throw new Error("Supabase is not configured.")
    }

    const orderId = String(formData.get("order_id") || "").trim()
    const status = String(formData.get("status") || "").trim()
    const marketRaw = String(formData.get("market") || "").trim().toUpperCase()
    if (!ORDER_MARKETS.includes(marketRaw as (typeof ORDER_MARKETS)[number])) {
      throw new Error("Invalid order market.")
    }
    const market = normalizeOrderMarket(marketRaw)
    const currency = getOrderCurrencyForMarket(market)
    const customerEmailRaw = String(formData.get("customer_email") || "")
      .trim()
      .toLowerCase()
    const customerName = String(formData.get("customer_name") || "").trim()
    const shippingCents = parseAmountToCents(
      String(formData.get("shipping_dollars") || "0"),
      "Shipping"
    )
    const promoSavingsCents = parseAmountToCents(
      String(formData.get("promo_savings_dollars") || "0"),
      "Promo savings"
    )
    const trackingNumber = String(formData.get("tracking_number") || "").trim()
    const trackingCarrier = String(formData.get("tracking_carrier") || "").trim()
    const stripeCheckoutSessionId = nullableTrimmedString(
      formData.get("stripe_checkout_session_id")
    )
    const stripePaymentIntentId = nullableTrimmedString(
      formData.get("stripe_payment_intent_id")
    )
    const notes = String(formData.get("notes") || "").trim()
    const purchasedAtInput = String(formData.get("purchased_at") || "").trim()
    const editedItems = parseEditedOrderItems(formData)

    if (!id) {
      throw new Error("Order id is required.")
    }

    if (!orderId) {
      throw new Error("Public order ID is required.")
    }

    if (!ORDER_STATUSES.includes(status as (typeof ORDER_STATUSES)[number])) {
      throw new Error("Invalid order status.")
    }

    if (customerEmailRaw && !isValidEmail(customerEmailRaw)) {
      throw new Error("Customer email is invalid.")
    }

    const supabase = getSupabaseAdmin()
    const existingOrderSelectWithCurrency =
      "order_id,customer_email,shipping_address,created_at,currency"
    const existingOrderSelectWithoutCurrency =
      "order_id,customer_email,shipping_address,created_at"
    const existingOrderWithCurrency = await supabase
      .from("orders")
      .select(existingOrderSelectWithCurrency)
      .eq("id", id)
      .maybeSingle()
    let existingOrder = existingOrderWithCurrency.data as
      | {
          order_id?: string | null
          customer_email?: string | null
          shipping_address?: unknown
          created_at?: string | null
          currency?: string | null
        }
      | null
    let existingOrderError = existingOrderWithCurrency.error
    if (existingOrderError && isMissingCurrencyColumnError(existingOrderError)) {
      const fallbackOrder = await supabase
        .from("orders")
        .select(existingOrderSelectWithoutCurrency)
        .eq("id", id)
        .maybeSingle()
      existingOrder = fallbackOrder.data as
        | {
            order_id?: string | null
            customer_email?: string | null
            shipping_address?: unknown
            created_at?: string | null
          }
        | null
      existingOrderError = fallbackOrder.error
    }
    if (existingOrderError) {
      throw new Error(existingOrderError.message)
    }

    if (!existingOrder) {
      throw new Error("Order not found.")
    }

    const { data: existingOrderItems, error: existingOrderItemsError } =
      await supabase
        .from("order_items")
        .select("id,product_id,title,quantity,unit_price_cents")
        .eq("order_id", id)
    if (existingOrderItemsError) {
      throw new Error(existingOrderItemsError.message)
    }

    const existingOrderItemsList = Array.isArray(existingOrderItems)
      ? existingOrderItems
      : []
    const subtotalCents = editedItems.reduce((sum, item) => {
      return sum + item.quantity * item.unitPriceCents
    }, 0)
    const totalCents = Math.max(0, subtotalCents - promoSavingsCents) + shippingCents

    const existingMarket =
      typeof existingOrder.currency === "string" &&
      (existingOrder.currency === "usd" || existingOrder.currency === "brl")
        ? getOrderMarketFromCurrency(existingOrder.currency)
        : normalizeOrderMarket(
            (existingOrder.shipping_address as { country?: string | null } | null)
              ?.country
          )
    const nextShippingAddress = buildShippingAddressFromFormData(formData, market)
    const nextCreatedAtIso =
      parseDateTimeLocalToIso(purchasedAtInput) ||
      String(existingOrder?.created_at || "").trim() ||
      null
    const nextCustomerEmail = customerEmailRaw || existingOrder.customer_email || null
    const productMap = await getStoredProductMap({ includeInactive: true })
    const inventoryDeltas = new Map<
      string,
      { us: number; br: number; title: string }
    >()

    const applyInventoryDelta = (
      productId: string,
      itemTitle: string,
      targetMarket: "US" | "BR",
      delta: number
    ) => {
      const product = productMap.get(productId)
      if (!product) return

      const current = inventoryDeltas.get(productId) ?? {
        us: 0,
        br: 0,
        title: product.title || itemTitle || productId,
      }
      if (targetMarket === "BR") {
        current.br += delta
      } else {
        current.us += delta
      }
      inventoryDeltas.set(productId, current)
    }

    for (const item of existingOrderItemsList) {
      const productId = String(item.product_id || "").trim()
      const quantity = Number(item.quantity || 0)
      if (!productId || quantity <= 0) continue
      applyInventoryDelta(
        productId,
        String(item.title || "").trim(),
        existingMarket,
        quantity
      )
    }

    for (const item of editedItems) {
      applyInventoryDelta(item.productId, item.title, market, -item.quantity)
    }

    for (const [productId, delta] of inventoryDeltas.entries()) {
      const product = productMap.get(productId)
      if (!product) continue

      const nextUs = product.inventory_quantity_us + delta.us
      const nextBr = product.inventory_quantity_br + delta.br
      if (nextUs < 0 || nextBr < 0) {
        throw new Error(`Not enough stock for ${delta.title}.`)
      }
    }

    const replacementOrderItems = editedItems.map((item) => ({
      order_id: id,
      product_id: item.productId,
      title: item.title,
      quantity: item.quantity,
      unit_price_cents: item.unitPriceCents,
    }))

    const { error: deleteItemsError } = await supabase
      .from("order_items")
      .delete()
      .eq("order_id", id)
    if (deleteItemsError) {
      throw new Error(deleteItemsError.message)
    }

    const { error: insertItemsError } = await supabase
      .from("order_items")
      .insert(replacementOrderItems)
    if (insertItemsError) {
      throw new Error(insertItemsError.message)
    }

    const payloadWithCurrency = {
      order_id: orderId,
      customer_email: nextCustomerEmail,
      status,
      currency,
      subtotal_cents: subtotalCents,
      promo_savings_cents: promoSavingsCents,
      shipping_cents: shippingCents,
      total_cents: totalCents,
      shipping_name: customerName || null,
      shipping_address: nextShippingAddress,
      tracking_number: trackingNumber || null,
      tracking_carrier: trackingCarrier || null,
      stripe_checkout_session_id: stripeCheckoutSessionId,
      stripe_payment_intent_id: stripePaymentIntentId,
      notes: notes || null,
      ...(nextCreatedAtIso ? { created_at: nextCreatedAtIso } : {}),
    }
    let { error } = await supabase
      .from("orders")
      .update(payloadWithCurrency)
      .eq("id", id)

    if (error && isMissingCurrencyColumnError(error)) {
      const { error: fallbackError } = await supabase
        .from("orders")
        .update({
          order_id: orderId,
          customer_email: nextCustomerEmail,
          status,
          subtotal_cents: subtotalCents,
          promo_savings_cents: promoSavingsCents,
          shipping_cents: shippingCents,
          total_cents: totalCents,
          shipping_name: customerName || null,
          shipping_address: nextShippingAddress,
          tracking_number: trackingNumber || null,
          tracking_carrier: trackingCarrier || null,
          stripe_checkout_session_id: stripeCheckoutSessionId,
          stripe_payment_intent_id: stripePaymentIntentId,
          notes: notes || null,
          ...(nextCreatedAtIso ? { created_at: nextCreatedAtIso } : {}),
        })
        .eq("id", id)
      error = fallbackError
    }

    if (error) {
      throw new Error(error.message)
    }

    for (const [productId, delta] of inventoryDeltas.entries()) {
      const product = productMap.get(productId)
      if (!product) continue

      const nextUs = product.inventory_quantity_us + delta.us
      const nextBr = product.inventory_quantity_br + delta.br

      const { error: inventoryError } = await supabase
        .from("products")
        .update({
          inventory_quantity: nextUs,
          inventory_quantity_us: nextUs,
          inventory_quantity_br: nextBr,
        })
        .eq("id", productId)

      if (inventoryError) {
        throw new Error(
          inventoryError.message || `Could not update inventory for ${delta.title}.`
        )
      }
    }

    revalidatePath("/admin/orders")
    revalidatePath(`/admin/orders/${id}`)
    revalidatePath("/admin/stock")
    revalidatePath("/shop")
    redirect(appendQueryParam(returnTo, "saved", "1"))
  } catch (error) {
    if (isNextRedirectError(error)) {
      throw error
    }
    const message =
      error instanceof Error && error.message
        ? error.message
        : "Could not update order."
    redirect(appendQueryParam(returnTo, "error", message))
  }
}

type ManualLineItem = {
  productId: string
  qty: number
  unitPriceCents: number
}

const MANUAL_ORDER_MAX_ROWS = 25

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function parseAmountToCents(value: string, label = "Amount") {
  const trimmed = value.trim()
  if (!trimmed) return 0

  const amount = Number(trimmed)
  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error(`${label} must be a non-negative amount.`)
  }

  return Math.round(amount * 100)
}

function buildManualOrderId() {
  const datePart = new Date().toISOString().slice(2, 10).replaceAll("-", "")
  const randomPart = Math.random().toString(36).slice(2, 6).toUpperCase()
  const clockPart = Date.now().toString().slice(-6)
  return `OMG-MAN-${datePart}-${clockPart}-${randomPart}`
}

function parseManualLineItems(formData: FormData): ManualLineItem[] {
  const productIds = formData.getAll("product_id").map((value) => String(value || "").trim())
  const quantities = formData.getAll("quantity").map((value) => String(value || "").trim())
  const unitPrices = formData
    .getAll("unit_price_dollars")
    .map((value) => String(value || "").trim())
  const maxLength = Math.max(productIds.length, quantities.length, unitPrices.length)

  if (maxLength > MANUAL_ORDER_MAX_ROWS) {
    throw new Error(`Manual order supports at most ${MANUAL_ORDER_MAX_ROWS} product rows.`)
  }

  const merged = new Map<string, ManualLineItem>()

  for (let index = 0; index < maxLength; index += 1) {
    const productId = productIds[index] || ""
    const qtyRaw = quantities[index] || "0"
    const unitPriceRaw = unitPrices[index] || ""
    const qty = Number(qtyRaw)
    const unitPrice = Number(unitPriceRaw)

    if (!productId && (!qtyRaw || qty === 0) && !unitPriceRaw) {
      continue
    }

    if (productId && (!Number.isInteger(qty) || qty <= 0)) {
      throw new Error(`Quantity must be a positive whole number on row ${index + 1}.`)
    }

    if (!productId && qty > 0) {
      throw new Error(`Choose a product for row ${index + 1}.`)
    }

    if (productId && unitPriceRaw === "") {
      throw new Error(`Set a unit price on row ${index + 1}.`)
    }

    if (productId && (!Number.isFinite(unitPrice) || unitPrice < 0)) {
      throw new Error(`Unit price must be a non-negative amount on row ${index + 1}.`)
    }

    if (productId && qty > 0) {
      const unitPriceCents = Math.round(unitPrice * 100)
      const key = `${productId}::${unitPriceCents}`
      const existing = merged.get(key)

      if (existing) {
        merged.set(key, { ...existing, qty: existing.qty + qty })
      } else {
        merged.set(key, {
          productId,
          qty,
          unitPriceCents,
        })
      }
    }
  }

  const items = Array.from(merged.values())

  if (items.length === 0) {
    throw new Error("Add at least one product with quantity greater than 0.")
  }

  return items
}

async function createManualOrder(formData: FormData) {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured.")
  }

  const status = String(formData.get("status") || "completed").trim()
  const marketRaw = String(formData.get("market") || "US")
    .trim()
    .toUpperCase()
  if (!ORDER_MARKETS.includes(marketRaw as (typeof ORDER_MARKETS)[number])) {
    throw new Error("Invalid order market.")
  }
  const market = normalizeOrderMarket(marketRaw)
  const currency = getOrderCurrencyForMarket(market)
  if (!ORDER_STATUSES.includes(status as (typeof ORDER_STATUSES)[number])) {
    throw new Error("Invalid order status.")
  }

  const customerName = String(formData.get("customer_name") || "").trim()
  if (!customerName) {
    throw new Error("Customer name is required.")
  }
  const rawEmail = String(formData.get("customer_email") || "")
    .trim()
    .toLowerCase()
  if (rawEmail && !isValidEmail(rawEmail)) {
    throw new Error("Customer email is invalid.")
  }

  const paymentMethod = String(formData.get("payment_method") || "cash").trim()
  const saleLocation = String(formData.get("sale_location") || "").trim()
  const shippingCents = parseAmountToCents(
    String(formData.get("shipping_dollars") || "0"),
    "Shipping"
  )
  const notesInput = String(formData.get("notes") || "").trim()
  const purchasedAtInput = String(formData.get("purchased_at") || "").trim()
  let purchasedAtIso: string | null = null

  if (purchasedAtInput) {
    const parsed = new Date(purchasedAtInput)
    if (Number.isNaN(parsed.getTime())) {
      throw new Error("Purchase date/time is invalid.")
    }
    purchasedAtIso = parsed.toISOString()
  }

  const lineItems = parseManualLineItems(formData)
  const productMap = await getStoredProductMap({ includeInactive: true })

  const qtyByProduct = new Map<string, number>()
  for (const item of lineItems) {
    qtyByProduct.set(item.productId, (qtyByProduct.get(item.productId) || 0) + item.qty)
  }

  for (const [productId, totalQty] of qtyByProduct.entries()) {
    const product = productMap.get(productId)
    if (!product) {
      throw new Error(`Unknown product: ${productId}`)
    }

    if (getInventoryForCountry(product, market) < totalQty) {
      throw new Error(`Not enough stock for ${product.title}.`)
    }
  }

  const calculatedSubtotalCents = lineItems.reduce((sum, item) => {
    return sum + item.unitPriceCents * item.qty
  }, 0)
  const subtotalOverrideRaw = String(formData.get("subtotal_dollars") || "").trim()
  const subtotalCents = subtotalOverrideRaw
    ? parseAmountToCents(subtotalOverrideRaw, "Subtotal")
    : calculatedSubtotalCents

  const promoSavingsCents = 0

  const totalCents = Math.max(0, subtotalCents - promoSavingsCents) + shippingCents
  const customerEmail = rawEmail || `manual-sale+${Date.now()}@onemoregood.local`
  const orderId = buildManualOrderId()

  const notesParts = [
    "Manual order created from admin dashboard (no online payment).",
    `Payment method: ${paymentMethod}`,
    saleLocation ? `Sale location: ${saleLocation}` : null,
    rawEmail ? null : "Customer email not provided.",
    notesInput ? `Notes: ${notesInput}` : null,
  ].filter(Boolean)

  const orderPayload: Record<string, unknown> = {
    order_id: orderId,
    stripe_checkout_session_id: null,
    stripe_payment_intent_id: null,
    customer_email: customerEmail,
    status,
    currency,
    subtotal_cents: subtotalCents,
    promo_savings_cents: promoSavingsCents,
    shipping_cents: shippingCents,
    total_cents: totalCents,
    shipping_name: customerName || null,
    shipping_address: {
      country: market,
    },
    notes: notesParts.join("\n"),
  }

  if (purchasedAtIso) {
    orderPayload.created_at = purchasedAtIso
    orderPayload.updated_at = purchasedAtIso
  }

  const supabase = getSupabaseAdmin()
  let { data: orderRow, error: orderError } = await supabase
    .from("orders")
    .insert(orderPayload)
    .select("id")
    .single()

  if (orderError && isMissingCurrencyColumnError(orderError)) {
    const fallbackPayload = { ...orderPayload }
    delete fallbackPayload.currency

    const fallbackInsert = await supabase
      .from("orders")
      .insert(fallbackPayload)
      .select("id")
      .single()
    orderRow = fallbackInsert.data
    orderError = fallbackInsert.error
  }

  if (orderError || !orderRow?.id) {
    throw new Error(orderError?.message || "Could not create manual order.")
  }

  const orderItems = lineItems.map((item) => {
    const product = productMap.get(item.productId)!
    return {
      order_id: orderRow.id,
      product_id: item.productId,
      title: product.title,
      quantity: item.qty,
      unit_price_cents: item.unitPriceCents,
    }
  })

  const { error: itemsError } = await supabase.from("order_items").insert(orderItems)
  if (itemsError) {
    throw new Error(itemsError.message || "Could not save manual order items.")
  }

  for (const [productId, totalQty] of qtyByProduct.entries()) {
    const product = productMap.get(productId)!
    const nextInventory = Math.max(
      0,
      getInventoryForCountry(product, market) - totalQty
    )

    const { error: inventoryError } = await supabase
      .from("products")
      .update({
        ...getInventoryUpdateForCountry(market, nextInventory),
        ...(market === "US" ? { inventory_quantity: nextInventory } : {}),
      })
      .eq("id", productId)

    if (inventoryError) {
      throw new Error(
        inventoryError.message || `Could not update inventory for ${product.title}.`
      )
    }
  }

  revalidatePath("/admin/orders")
  revalidatePath(`/admin/orders/${orderRow.id}`)
  revalidatePath("/admin/orders/new")
  revalidatePath("/admin/stock")
  revalidatePath("/shop")

  return orderRow.id
}

export async function createManualOrderAction(formData: FormData) {
  let orderDbId = ""

  try {
    orderDbId = await createManualOrder(formData)
  } catch (error) {
    const message =
      error instanceof Error && error.message
        ? error.message
        : "Could not create manual order."
    redirect(`/admin/orders/new?error=${encodeURIComponent(message)}`)
  }

  redirect(`/admin/orders/${orderDbId}`)
}
