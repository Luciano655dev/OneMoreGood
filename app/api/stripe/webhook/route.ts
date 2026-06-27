import { NextResponse } from "next/server"
import { Resend } from "resend"
import type Stripe from "stripe"

import {
  getInventoryForCountry,
  getInventoryUpdateForCountry,
  getStoredProducts,
} from "@/lib/products"
import {
  createLabel,
  quoteShipping,
  type ShippingService,
} from "@/lib/melhor-envio"
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/server"
import { isMissingCurrencyColumnError } from "@/lib/supabase/errors"
import { getStripe } from "@/lib/stripe"
import {
  DEFAULT_SHIPPING_COUNTRY,
  formatMoneyFromCents,
  getUnitPriceCentsForCountry,
  normalizeShippingCountry,
  type ShippingCountry,
} from "@/lib/commerce"
import { normalizeOrderCurrency } from "@/lib/admin/orders"

type ShippingDetails = {
  name?: string | null
  address?: {
    line1?: string | null
    line2?: string | null
    city?: string | null
    state?: string | null
    postal_code?: string | null
    country?: string | null
  } | null
} | null

type CustomerDetails = {
  name?: string | null
  email?: string | null
  address?: {
    line1?: string | null
    line2?: string | null
    city?: string | null
    state?: string | null
    postal_code?: string | null
    country?: string | null
  } | null
} | null

type CheckoutSessionWithShippingDetails = Stripe.Checkout.Session & {
  shipping_details?: ShippingDetails
}

function buildOrderEmailHtml(params: {
  orderId: string
  customerEmail: string
  shippingName: string
  shippingAddress: string
  shippingCost: number
  total: number
  shippingCountry: ShippingCountry
  items: Array<{ title: string; qty: number }>
}) {
  const itemHtml = params.items
    .map(
      (item) =>
        `<li style="margin-bottom:8px;"><strong>${item.title}</strong> x ${item.qty}</li>`
    )
    .join("")

  return `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111;">
      <h2>New paid OneMoreGood order</h2>
      <p><strong>Order:</strong> ${params.orderId}</p>
      <p><strong>Customer:</strong> ${params.customerEmail}</p>
      <p><strong>Ship to:</strong><br />${params.shippingName}<br />${params.shippingAddress}</p>
      <p><strong>Shipping:</strong> ${formatMoneyFromCents(
        params.shippingCost,
        params.shippingCountry
      )}</p>
      <p><strong>Total paid:</strong> ${formatMoneyFromCents(
        params.total,
        params.shippingCountry
      )}</p>
      <h3>Items</h3>
      <ul>${itemHtml}</ul>
      <p>Create the shipping label, then send the tracking number to the customer.</p>
    </div>
  `
}

function buildBuyerConfirmationEmailHtml(params: {
  orderId: string
  customerEmail: string
  shippingName: string
  shippingAddress: string
  shippingCost: number
  total: number
  shippingCountry: ShippingCountry
  items: Array<{ title: string; qty: number }>
}) {
  const itemHtml = params.items
    .map(
      (item) =>
        `<li style="margin-bottom:8px;"><strong>${item.title}</strong> x ${item.qty}</li>`
    )
    .join("")

  return `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111;">
      <h2>Your OneMoreGood order is confirmed</h2>
      <p>Thank you for supporting OneMoreGood and Instituto Semear.</p>
      <p><strong>Order:</strong> ${params.orderId}</p>
      <p><strong>Email:</strong> ${params.customerEmail}</p>
      <p><strong>Shipping to:</strong><br />${params.shippingName}<br />${params.shippingAddress}</p>
      <p><strong>Shipping paid:</strong> ${formatMoneyFromCents(
        params.shippingCost,
        params.shippingCountry
      )}</p>
      <p><strong>Total paid:</strong> ${formatMoneyFromCents(
        params.total,
        params.shippingCountry
      )}</p>
      <h3>Items</h3>
      <ul>${itemHtml}</ul>
      <p>Tracking is created after the shipping label is purchased. We will email your tracking number once the package is ready.</p>
      <p>If you need help with your order, reply to this email or contact us at lucianomenezes655@gmail.com.</p>
    </div>
  `
}

async function sendOrderEmail(params: {
  orderId: string
  customerEmail: string
  shippingName: string
  shippingAddress: string
  shippingCost: number
  total: number
  shippingCountry: ShippingCountry
  items: Array<{ title: string; qty: number }>
}) {
  const resendKey = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM?.replace(/^"(.*)"$/, "$1").trim()
  const ordersTo = process.env.ORDERS_TO?.trim()

  if (!resendKey || !from || !ordersTo) return

  const resend = new Resend(resendKey)

  const ownerEmail = await resend.emails.send({
    from,
    to: ordersTo,
    subject: `New OneMoreGood paid order (${params.orderId})`,
    html: buildOrderEmailHtml(params),
  })

  if (ownerEmail.error) {
    console.error("Owner order email failed", ownerEmail.error)
  }

  const buyerEmail = await resend.emails.send({
    from,
    to: params.customerEmail,
    subject: `Your OneMoreGood order is confirmed (${params.orderId})`,
    html: buildBuyerConfirmationEmailHtml(params),
  })

  if (buyerEmail.error) {
    console.error("Buyer confirmation email failed", buyerEmail.error)
  }
}

function getResendConfig() {
  const resendKey = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM?.replace(/^"(.*)"$/, "$1").trim()
  const ordersTo = process.env.ORDERS_TO?.trim()
  if (!resendKey || !from) return null
  return { resend: new Resend(resendKey), from, ordersTo }
}

type BrEmailParams = {
  orderId: string
  customerEmail: string
  shippingName: string
  shippingAddress: string
  service: string
  shippingCost: number
  total: number
  items: Array<{ title: string; qty: number }>
  trackingNumber: string | null
  labelUrl: string | null
  labelFailed: boolean
}

function brItemsHtml(items: Array<{ title: string; qty: number }>) {
  return items
    .map(
      (item) =>
        `<li style="margin-bottom:8px;"><strong>${item.title}</strong> x ${item.qty}</li>`
    )
    .join("")
}

async function sendBrOrderEmails(params: BrEmailParams) {
  const config = getResendConfig()
  if (!config) return
  const { resend, from, ordersTo } = config

  const fmt = (cents: number) => formatMoneyFromCents(cents, "BR")
  const trackingLine = params.trackingNumber
    ? `<p><strong>Rastreio:</strong> ${params.trackingNumber}</p>`
    : ""

  if (ordersTo) {
    const labelBlock = params.labelFailed
      ? `<p style="color:#b00;"><strong>A etiqueta automática falhou.</strong> Gere a etiqueta manualmente no painel admin.</p>`
      : params.labelUrl
        ? `<p><a href="${params.labelUrl}">Baixar etiqueta (${params.service})</a></p>`
        : ""

    const ownerEmail = await resend.emails.send({
      from,
      to: ordersTo,
      subject: `Novo pedido pago - Brasil (${params.orderId})`,
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111;">
          <h2>Novo pedido pago (Brasil)</h2>
          <p><strong>Pedido:</strong> ${params.orderId}</p>
          <p><strong>Cliente:</strong> ${params.customerEmail}</p>
          <p><strong>Enviar para:</strong><br />${params.shippingName}<br />${params.shippingAddress}</p>
          <p><strong>Envio:</strong> ${params.service} - ${fmt(params.shippingCost)}</p>
          <p><strong>Total pago:</strong> ${fmt(params.total)}</p>
          ${trackingLine}
          ${labelBlock}
          <h3>Itens</h3>
          <ul>${brItemsHtml(params.items)}</ul>
        </div>
      `,
    })
    if (ownerEmail.error) console.error("BR owner email failed", ownerEmail.error)
  }

  const buyerEmail = await resend.emails.send({
    from,
    to: params.customerEmail,
    subject: `Seu pedido OneMoreGood foi confirmado (${params.orderId})`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111;">
        <h2>Seu pedido foi confirmado</h2>
        <p>Obrigado por apoiar a OneMoreGood.</p>
        <p><strong>Pedido:</strong> ${params.orderId}</p>
        <p><strong>Envio:</strong> ${params.service} - ${fmt(params.shippingCost)}</p>
        <p><strong>Total pago:</strong> ${fmt(params.total)}</p>
        ${trackingLine}
        <h3>Itens</h3>
        <ul>${brItemsHtml(params.items)}</ul>
        <p>Assim que o pacote for postado, você poderá acompanhar pelo código de rastreio.</p>
      </div>
    `,
  })
  if (buyerEmail.error) console.error("BR buyer email failed", buyerEmail.error)
}

type OrderRow = {
  id: string
  order_id: string
  status: string
  customer_email: string | null
  shipping_name: string | null
  shipping_phone: string | null
  shipping_service: string | null
  shipping_cents: number | null
  total_cents: number | null
  shipping_address: {
    line1?: string | null
    line2?: string | null
    number?: string | null
    district?: string | null
    city?: string | null
    state?: string | null
    postal_code?: string | null
    document?: string | null
  } | null
}

async function handleBrPaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata?.orderId
  const shippingCountry = normalizeShippingCountry(
    paymentIntent.metadata?.shippingCountry
  )
  if (!orderId || shippingCountry !== "BR") return
  if (!isSupabaseConfigured()) return

  const supabase = getSupabaseAdmin()

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select(
      "id,order_id,status,customer_email,shipping_name,shipping_phone,shipping_service,shipping_cents,total_cents,shipping_address"
    )
    .eq("order_id", orderId)
    .maybeSingle<OrderRow>()

  if (orderError) {
    console.error("BR order lookup failed", orderError)
    return
  }
  if (!order) {
    console.error("BR order not found for payment intent", orderId)
    return
  }
  // Idempotency: only process a pending order once.
  if (order.status !== "pending") return

  await supabase.from("orders").update({ status: "paid" }).eq("id", order.id)

  const { data: orderItems } = await supabase
    .from("order_items")
    .select("product_id,title,quantity,unit_price_cents")
    .eq("order_id", order.id)

  const items = (orderItems || []).map((item) => ({
    title: String(item.title),
    qty: Number(item.quantity),
  }))

  // Decrement BR inventory.
  const storedProducts = await getStoredProducts()
  const productMap = new Map(storedProducts.map((p) => [p.id, p]))
  for (const item of orderItems || []) {
    const product = productMap.get(String(item.product_id))
    if (!product) continue
    const nextInventory = Math.max(
      0,
      getInventoryForCountry(product, "BR") - Number(item.quantity)
    )
    const { error: invError } = await supabase
      .from("products")
      .update(getInventoryUpdateForCountry("BR", nextInventory))
      .eq("id", item.product_id)
    if (invError) console.error("BR inventory update failed", invError)
  }

  const address = order.shipping_address || {}
  const addressHtml = [
    address.line1,
    address.number ? `nº ${address.number}` : null,
    address.line2,
    address.district,
    [address.city, address.state].filter(Boolean).join(" - "),
    address.postal_code,
  ]
    .filter(Boolean)
    .join("<br />")

  const service = (order.shipping_service || "PAC") as ShippingService
  const pairs = items.reduce((sum, item) => sum + item.qty, 0)

  let trackingNumber: string | null = null
  let labelUrl: string | null = null
  let labelFailed = false

  try {
    const cep = String(address.postal_code || "").replace(/\D/g, "")
    const quotes = await quoteShipping({ toPostalCode: cep, pairs })
    const quote = quotes.find((q) => q.service === service)
    if (!quote) throw new Error(`No ${service} service available for label.`)

    const label = await createLabel({
      orderId: order.order_id,
      meServiceId: quote.meServiceId,
      pairs,
      insuranceValueCents: Number(order.total_cents || 0),
      to: {
        name: order.shipping_name || "Cliente",
        email: order.customer_email,
        phone: order.shipping_phone,
        document: address.document || null,
        address: String(address.line1 || ""),
        number: String(address.number || ""),
        complement: address.line2 || null,
        district: String(address.district || ""),
        city: String(address.city || ""),
        state: String(address.state || ""),
        postalCode: cep,
      },
      products: (orderItems || []).map((item) => ({
        name: String(item.title),
        quantity: Number(item.quantity),
        unitaryValueCents: Number(item.unit_price_cents),
      })),
    })

    trackingNumber = label.trackingNumber
    labelUrl = label.labelUrl

    await supabase
      .from("orders")
      .update({
        shipping_label_url: label.labelUrl,
        tracking_number: label.trackingNumber,
        tracking_carrier: "Correios",
        melhor_envio_order_id: label.meOrderId,
        label_status: "generated",
      })
      .eq("id", order.id)
  } catch (labelError) {
    labelFailed = true
    console.error("Label generation failed", labelError)
    await supabase
      .from("orders")
      .update({ label_status: "failed" })
      .eq("id", order.id)
  }

  await sendBrOrderEmails({
    orderId: order.order_id,
    customerEmail: order.customer_email || "Unknown",
    shippingName: order.shipping_name || "Cliente",
    shippingAddress: addressHtml || "Endereço não informado",
    service,
    shippingCost: Number(order.shipping_cents || 0),
    total: Number(order.total_cents || 0),
    items,
    trackingNumber,
    labelUrl,
    labelFailed,
  })
}

function buildAddressHtml(details: ShippingDetails | CustomerDetails) {
  if (!details?.address) return "Address not provided"

  const { line1, line2, city, state, postal_code, country } = details.address
  return [line1, line2, `${city}, ${state} ${postal_code}`, country]
    .filter(Boolean)
    .join("<br />")
}

export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature")
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!signature || !webhookSecret) {
    return NextResponse.json(
      { ok: false, error: "Webhook secret not configured." },
      { status: 400 }
    )
  }

  const payload = await req.text()
  const stripe = getStripe()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret)
  } catch (err) {
    console.error("Stripe webhook signature verification failed", err)
    return NextResponse.json(
      { ok: false, error: "Invalid signature." },
      { status: 400 }
    )
  }

  try {
    if (event.type === "payment_intent.succeeded") {
      await handleBrPaymentSucceeded(event.data.object as Stripe.PaymentIntent)
      return NextResponse.json({ received: true })
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session
      const sessionWithShipping =
        session as CheckoutSessionWithShippingDetails
      const shippingDetails = sessionWithShipping.shipping_details || null
      const rawItems = session.metadata?.items
      const orderId = session.metadata?.orderId || session.id
      const customerEmail =
        session.customer_details?.email || session.customer_email || "Unknown"
      const shippingCountry =
        normalizeShippingCountry(session.metadata?.shippingCountry) ||
        DEFAULT_SHIPPING_COUNTRY
      const orderCurrency = normalizeOrderCurrency(
        session.metadata?.currency || session.currency
      )

      if (rawItems) {
        const normalizedItems = JSON.parse(rawItems) as Array<{
          productId: string
          qty: number
        }>
        const storedProducts = await getStoredProducts()
        const productMap = new Map(storedProducts.map((product) => [product.id, product]))
        const qtyByProduct = new Map<string, number>()
        for (const item of normalizedItems) {
          qtyByProduct.set(
            item.productId,
            (qtyByProduct.get(item.productId) || 0) + item.qty
          )
        }
        const items = normalizedItems.map((item) => ({
          title: productMap.get(item.productId)?.title || item.productId,
          qty: item.qty,
        }))

        let shouldSendOrderEmail = true

        if (isSupabaseConfigured()) {
          shouldSendOrderEmail = false
          const supabase = getSupabaseAdmin()
          const customerDetails = (session.customer_details as CustomerDetails) || null
          const shippingAddressJson = shippingDetails?.address
            ? {
                line1: shippingDetails.address.line1 ?? null,
                line2: shippingDetails.address.line2 ?? null,
                city: shippingDetails.address.city ?? null,
                state: shippingDetails.address.state ?? null,
                postal_code: shippingDetails.address.postal_code ?? null,
                country: shippingDetails.address.country ?? null,
              }
            : customerDetails?.address
              ? {
                  line1: customerDetails.address.line1 ?? null,
                  line2: customerDetails.address.line2 ?? null,
                  city: customerDetails.address.city ?? null,
                  state: customerDetails.address.state ?? null,
                  postal_code: customerDetails.address.postal_code ?? null,
                  country: customerDetails.address.country ?? null,
                }
            : null

          const { data: existingOrder, error: existingOrderError } = await supabase
            .from("orders")
            .select("id,status")
            .eq("order_id", orderId)
            .maybeSingle()

          if (existingOrderError) {
            console.error("Supabase existing order lookup failed", existingOrderError)
          }

          const baseOrderPayload = {
            stripe_checkout_session_id: session.id,
            stripe_payment_intent_id:
              typeof session.payment_intent === "string"
                ? session.payment_intent
                : null,
            customer_email: customerEmail,
            currency: orderCurrency,
            subtotal_cents: Number(session.metadata?.subtotalCents || 0),
            promo_savings_cents: Number(session.metadata?.promoSavingsCents || 0),
            shipping_cents:
              session.shipping_cost?.amount_total ||
              session.total_details?.amount_shipping ||
              0,
            total_cents: session.amount_total || 0,
            shipping_name: shippingDetails?.name || null,
            shipping_address: shippingAddressJson,
          }

          let orderIdInDb: string | null = null
          let isNewOrder = false

          if (existingOrder?.id) {
            orderIdInDb = existingOrder.id
            shouldSendOrderEmail = false

            let { error: updateError } = await supabase
              .from("orders")
              .update(baseOrderPayload)
              .eq("id", existingOrder.id)

            if (updateError && isMissingCurrencyColumnError(updateError)) {
              const fallbackPayload = Object.fromEntries(
                Object.entries(baseOrderPayload).filter(
                  ([key]) => key !== "currency"
                )
              )
              const fallbackUpdate = await supabase
                .from("orders")
                .update(fallbackPayload)
                .eq("id", existingOrder.id)
              updateError = fallbackUpdate.error
            }

            if (updateError) {
              console.error("Supabase order update failed", updateError)
            }
          } else {
            let { data: insertedOrder, error: insertError } = await supabase
              .from("orders")
              .insert({
                order_id: orderId,
                status: "paid",
                ...baseOrderPayload,
              })
              .select("id")
              .single()

            if (insertError && isMissingCurrencyColumnError(insertError)) {
              const fallbackPayload = Object.fromEntries(
                Object.entries(baseOrderPayload).filter(
                  ([key]) => key !== "currency"
                )
              )
              const fallbackInsert = await supabase
                .from("orders")
                .insert({
                  order_id: orderId,
                  status: "paid",
                  ...fallbackPayload,
                })
                .select("id")
                .single()
              insertedOrder = fallbackInsert.data
              insertError = fallbackInsert.error
            }

            if (insertError || !insertedOrder?.id) {
              console.error("Supabase order insert failed", insertError)
            } else {
              orderIdInDb = insertedOrder.id
              isNewOrder = true
              shouldSendOrderEmail = true
            }
          }

          if (isNewOrder && orderIdInDb) {
            const orderItems = normalizedItems.map((item) => ({
              order_id: orderIdInDb,
              product_id: item.productId,
              title: productMap.get(item.productId)?.title || item.productId,
              quantity: item.qty,
              unit_price_cents: getUnitPriceCentsForCountry(
                productMap.get(item.productId) || {
                  id: item.productId,
                  title: item.productId,
                  price: 0,
                  image: "",
                },
                shippingCountry
              ),
            }))

            if (orderItems.length > 0) {
              const { error: orderItemsError } = await supabase
                .from("order_items")
                .insert(orderItems)

              if (orderItemsError) {
                console.error("Supabase order items insert failed", orderItemsError)
              }
            }

            for (const [productId, totalQty] of qtyByProduct.entries()) {
              const product = productMap.get(productId)
              if (!product) continue

              const nextInventory = Math.max(
                0,
                getInventoryForCountry(product, shippingCountry) - totalQty
              )

              const { error: inventoryError } = await supabase
                .from("products")
                .update({
                  ...getInventoryUpdateForCountry(shippingCountry, nextInventory),
                  ...(shippingCountry === "US"
                    ? { inventory_quantity: nextInventory }
                    : {}),
                })
                .eq("id", productId)

              if (inventoryError) {
                console.error("Supabase inventory update failed", inventoryError)
              }
            }
          }
        }

        if (shouldSendOrderEmail) {
          await sendOrderEmail({
            orderId,
            customerEmail,
            shippingName:
              shippingDetails?.name ||
              session.customer_details?.name ||
              "Unknown",
            shippingAddress:
              buildAddressHtml(shippingDetails) !== "Address not provided"
                ? buildAddressHtml(shippingDetails)
                : buildAddressHtml(
                    (session.customer_details as CustomerDetails) || null
                  ),
            shippingCost:
              session.shipping_cost?.amount_total ||
              session.total_details?.amount_shipping ||
              0,
            total: session.amount_total || 0,
            shippingCountry,
            items,
          })
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    // Return 200 so Stripe does not endlessly retry on internal processing errors.
    // The event was validly signed and received; the failure is on our side.
    console.error("Stripe webhook processing error", error)
    return NextResponse.json({ received: true, error: "Processing error logged." })
  }
}
