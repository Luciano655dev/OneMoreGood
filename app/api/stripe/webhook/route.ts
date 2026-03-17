import { NextResponse } from "next/server"
import { Resend } from "resend"
import type Stripe from "stripe"

import { getStoredProducts } from "@/lib/products"
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/server"
import { getStripe } from "@/lib/stripe"
import { moneyFromCents } from "@/lib/commerce"

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

function buildOrderEmailHtml(params: {
  orderId: string
  customerEmail: string
  shippingName: string
  shippingAddress: string
  shippingCost: number
  total: number
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
      <p><strong>Shipping:</strong> $${moneyFromCents(params.shippingCost)}</p>
      <p><strong>Total paid:</strong> $${moneyFromCents(params.total)}</p>
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
      <p><strong>Shipping paid:</strong> $${moneyFromCents(params.shippingCost)}</p>
      <p><strong>Total paid:</strong> $${moneyFromCents(params.total)}</p>
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
  items: Array<{ title: string; qty: number }>
}) {
  const resendKey = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM
  const ordersTo = process.env.ORDERS_TO

  if (!resendKey || !from || !ordersTo) return

  const resend = new Resend(resendKey)

  await resend.emails.send({
    from,
    to: ordersTo,
    subject: `New OneMoreGood paid order (${params.orderId})`,
    html: buildOrderEmailHtml(params),
  })

  await resend.emails.send({
    from,
    to: params.customerEmail,
    subject: `Your OneMoreGood order is confirmed (${params.orderId})`,
    html: buildBuyerConfirmationEmailHtml(params),
  })
}

function buildShippingAddress(details: ShippingDetails) {
  if (!details?.address) return "Address not provided"

  const { line1, line2, city, state, postal_code, country } = details.address
  return [line1, line2, `${city}, ${state} ${postal_code}`, country]
    .filter(Boolean)
    .join("<br />")
}

function buildAddressFromCustomerDetails(details: CustomerDetails) {
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

  try {
    const payload = await req.text()
    const stripe = getStripe()
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret
    )

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session
      const rawItems = session.metadata?.items
      const orderId = session.metadata?.orderId || session.id
      const customerEmail =
        session.customer_details?.email || session.customer_email || "Unknown"

      if (rawItems) {
        const normalizedItems = JSON.parse(rawItems) as Array<{
          productId: string
          qty: number
        }>
        const storedProducts = await getStoredProducts()
        const productMap = new Map(storedProducts.map((product) => [product.id, product]))
        const items = normalizedItems.map((item) => ({
          title: productMap.get(item.productId)?.title || item.productId,
          qty: item.qty,
        }))

        if (isSupabaseConfigured()) {
          const supabase = getSupabaseAdmin()
          const shippingDetails = ((session as any).shipping_details as ShippingDetails) || null
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

          const { data: orderRow, error: orderError } = await supabase
            .from("orders")
            .upsert(
              {
                order_id: orderId,
                stripe_checkout_session_id: session.id,
                stripe_payment_intent_id:
                  typeof session.payment_intent === "string"
                    ? session.payment_intent
                    : null,
                customer_email: customerEmail,
                status: "paid",
                subtotal_cents: Number(session.metadata?.subtotalCents || 0),
                promo_savings_cents: Number(session.metadata?.promoSavingsCents || 0),
                shipping_cents:
                  session.shipping_cost?.amount_total ||
                  session.total_details?.amount_shipping ||
                  0,
                total_cents: session.amount_total || 0,
                shipping_name: shippingDetails?.name || null,
                shipping_address: shippingAddressJson,
              },
              { onConflict: "order_id" }
            )
            .select("id")
            .single()

          if (orderError) {
            console.error("Supabase order upsert failed", orderError)
          } else if (orderRow) {
            const { error: itemsDeleteError } = await supabase
              .from("order_items")
              .delete()
              .eq("order_id", orderRow.id)

            if (itemsDeleteError) {
              console.error("Supabase order items delete failed", itemsDeleteError)
            }

            const orderItems = normalizedItems.map((item) => ({
              order_id: orderRow.id,
              product_id: item.productId,
              title: productMap.get(item.productId)?.title || item.productId,
              quantity: item.qty,
              unit_price_cents: Math.round(
                Number(productMap.get(item.productId)?.price || 0) * 100
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
          }

          for (const item of normalizedItems) {
            const product = productMap.get(item.productId)
            if (!product) continue

            const nextInventory = Math.max(
              0,
              Number(product.inventory_quantity || 0) - item.qty
            )

            const { error: inventoryError } = await supabase
              .from("products")
              .update({ inventory_quantity: nextInventory })
              .eq("id", item.productId)

            if (inventoryError) {
              console.error("Supabase inventory update failed", inventoryError)
            }
          }
        }

        await sendOrderEmail({
          orderId,
          customerEmail,
          shippingName:
            (session as any).shipping_details?.name ||
            session.customer_details?.name ||
            "Unknown",
          shippingAddress:
            buildShippingAddress(
              ((session as any).shipping_details as ShippingDetails) || null
            ) !== "Address not provided"
              ? buildShippingAddress(
                  ((session as any).shipping_details as ShippingDetails) || null
                )
              : buildAddressFromCustomerDetails(
                  (session.customer_details as CustomerDetails) || null
                ),
          shippingCost:
            session.shipping_cost?.amount_total ||
            session.total_details?.amount_shipping ||
            0,
          total: session.amount_total || 0,
          items,
        })
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Stripe webhook error", error)
    return NextResponse.json(
      { ok: false, error: "Webhook failed." },
      { status: 400 }
    )
  }
}
