import { NextResponse } from "next/server"
import { Resend } from "resend"
import type Stripe from "stripe"

import { PRODUCTS } from "@/data/products"
import { getRedis } from "@/lib/redis"
import { reserveStockAtomic } from "@/lib/stock"
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
      <p>If you need help with your order, reply to this email or contact lucianomenezes655@gmail.com.</p>
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

        const redis = getRedis()
        if (redis) {
          const productMap = new Map(PRODUCTS.map((product) => [product.id, product]))
          const reserveItems = normalizedItems
            .map((item) => {
              const product = productMap.get(item.productId)
              if (!product) return null

              return {
                productId: item.productId,
                qty: item.qty,
                initial: product.max_qnt ?? 10,
              }
            })
            .filter(Boolean) as Array<{
            productId: string
            qty: number
            initial: number
          }>

          if (reserveItems.length > 0) {
            const reserved = await reserveStockAtomic({
              redis,
              items: reserveItems,
            })

            if (!reserved.ok) {
              console.error("Stock reservation failed after payment", {
                orderId,
                failedKey: reserved.failedKey,
              })
            }
          }
        }

        const productMap = new Map(PRODUCTS.map((product) => [product.id, product]))
        const items = normalizedItems.map((item) => ({
          title: productMap.get(item.productId)?.title || item.productId,
          qty: item.qty,
        }))

        await sendOrderEmail({
          orderId,
          customerEmail,
          shippingName: (session as any).shipping_details?.name || "Unknown",
          shippingAddress: buildShippingAddress(
            ((session as any).shipping_details as ShippingDetails) || null
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
