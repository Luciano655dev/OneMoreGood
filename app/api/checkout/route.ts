import { NextResponse } from "next/server"

import { PRODUCTS } from "@/data/products"
import {
  SHIPPING_DELIVERY_MAX_DAYS,
  SHIPPING_DELIVERY_MIN_DAYS,
  SHIPPING_RATE_LABEL,
  calculateCartTotals,
  getShippingTierForItemCount,
  priceToCents,
} from "@/lib/commerce"
import { getRedis } from "@/lib/redis"
import { getAvailableStock } from "@/lib/stock"
import { getBaseUrl, getStripe } from "@/lib/stripe"

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const email = String(body.email || "")
      .trim()
      .toLowerCase()

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { ok: false, error: "Please enter a valid email." },
        { status: 400 }
      )
    }

    const items = Array.isArray(body.items) ? body.items : []
    if (items.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Cart is empty." },
        { status: 400 }
      )
    }

    const productMap = new Map(PRODUCTS.map((product) => [product.id, product]))
    const normalizedItems: Array<{ productId: string; qty: number }> = []

    for (const item of items) {
      const productId = String(item.productId || "")
      const qty = Number(item.qty)

      if (!productId || !Number.isInteger(qty) || qty <= 0) {
        return NextResponse.json(
          { ok: false, error: "Invalid cart items." },
          { status: 400 }
        )
      }

      const product = productMap.get(productId)
      if (!product) {
        return NextResponse.json(
          { ok: false, error: `Unknown product: ${productId}` },
          { status: 400 }
        )
      }

      if (typeof product.max_qnt === "number" && qty > product.max_qnt) {
        return NextResponse.json(
          { ok: false, error: `Too many for ${product.title}.` },
          { status: 400 }
        )
      }

      normalizedItems.push({ productId, qty })
    }

    const redis = getRedis()
    if (redis) {
      for (const item of normalizedItems) {
        const product = productMap.get(item.productId)!
        const available = await getAvailableStock({
          redis,
          productId: item.productId,
          initial: product.max_qnt ?? 10,
        })

        if (available < item.qty) {
          return NextResponse.json(
            {
              ok: false,
              error: `${product.title} is out of stock (or not enough left).`,
            },
            { status: 409 }
          )
        }
      }
    }

    const totals = calculateCartTotals(PRODUCTS, normalizedItems)
    const shippingTier = getShippingTierForItemCount(totals.itemCount)
    const stripe = getStripe()
    const baseUrl = getBaseUrl()
    const orderId =
      "OMG-" +
      Math.random().toString(36).slice(2, 6).toUpperCase() +
      "-" +
      Date.now().toString().slice(-6)

    const lineItems = normalizedItems.flatMap((item) => {
      const product = productMap.get(item.productId)!
      const unitAmount = priceToCents(product.price)
      const discountedQty = Math.floor(item.qty / 2) * 2
      const singleQty = item.qty % 2
      const imageUrl = `${baseUrl}${product.image}`

      const entries = []

      if (discountedQty > 0) {
        entries.push({
          price_data: {
            currency: "usd",
            unit_amount: 700,
            product_data: {
              name: `${product.title} (2 for $14 promo)`,
              description: product.description,
              images: [imageUrl],
            },
          },
          quantity: discountedQty,
        })
      }

      if (singleQty > 0) {
        entries.push({
          price_data: {
            currency: "usd",
            unit_amount: unitAmount,
            product_data: {
              name: product.title,
              description: product.description,
              images: [imageUrl],
            },
          },
          quantity: singleQty,
        })
      }

      return entries
    })

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      line_items: lineItems,
      shipping_address_collection: {
        allowed_countries: ["US"],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            display_name: SHIPPING_RATE_LABEL,
            type: "fixed_amount",
            fixed_amount: {
              amount: shippingTier.amountCents,
              currency: "usd",
            },
            delivery_estimate: {
              minimum: {
                unit: "business_day",
                value: SHIPPING_DELIVERY_MIN_DAYS,
              },
              maximum: {
                unit: "business_day",
                value: SHIPPING_DELIVERY_MAX_DAYS,
              },
            },
          },
        },
      ],
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout/cancel`,
      phone_number_collection: {
        enabled: true,
      },
      billing_address_collection: "auto",
      submit_type: "pay",
      metadata: {
        orderId,
        email,
        items: JSON.stringify(normalizedItems),
        promoSavingsCents: String(totals.promoSavingsCents),
        subtotalCents: String(totals.subtotalCents),
      },
      payment_intent_data: {
        metadata: {
          orderId,
          email,
        },
      },
      custom_text: {
        shipping_address: {
          message:
            `We currently ship within the United States only. This order uses the ${shippingTier.label} shipping tier. Tracking is emailed after your label is created.`,
        },
        submit: {
          message:
            "By placing this order, you agree to the shipping and refund terms shown on OneMoreGood.",
        },
      },
    })

    if (!session.url) {
      return NextResponse.json(
        { ok: false, error: "Could not create checkout session." },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true, url: session.url })
  } catch (error) {
    console.error("Checkout error", error)
    return NextResponse.json(
      { ok: false, error: "Server error." },
      { status: 500 }
    )
  }
}
