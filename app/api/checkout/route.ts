import { NextResponse } from "next/server"

import {
  BRAZIL_UNIT_PRICE_CENTS,
  PROMO_UNIT_PRICE_CENTS,
  SHIPPING_DELIVERY_MAX_DAYS,
  SHIPPING_DELIVERY_MIN_DAYS,
  calculateCartTotals,
  getCurrencyForCountry,
  getShippingCountryLabel,
  getShippingRateLabel,
  getShippingTierForItemCount,
  priceToCents,
} from "@/lib/commerce"
import { detectShippingCountryFromHeaders } from "@/lib/geo-country"
import { getStoredProducts } from "@/lib/products"
import { getBaseUrl, getStripe } from "@/lib/stripe"

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function POST(req: Request) {
  try {
    const shippingCountry = detectShippingCountryFromHeaders(req.headers)

    return NextResponse.json(
      {
        ok: false,
        error: `Online payment is temporarily unavailable. Please contact us directly at lucianomenezes655@gmail.com or Instagram @lucianohlmenezes to place your ${getShippingCountryLabel(
          shippingCountry
        )} order.`,
      },
      { status: 503 }
    )

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

    const storedProducts = await getStoredProducts()
    const productMap = new Map(storedProducts.map((product) => [product.id, product]))
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

      const currentProduct = product!
      const maxQty = currentProduct.max_qnt ?? Number.POSITIVE_INFINITY

      if (qty > maxQty) {
        return NextResponse.json(
          { ok: false, error: `Too many for ${currentProduct.title}.` },
          { status: 400 }
        )
      }

      normalizedItems.push({ productId, qty })
    }

    for (const item of normalizedItems) {
      const product = productMap.get(item.productId)!
      const available = product.inventory_quantity

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

    const totals = calculateCartTotals(
      storedProducts,
      normalizedItems,
      shippingCountry
    )
    const shippingTier = getShippingTierForItemCount(
      totals.shippableItemCount,
      shippingCountry
    )
    const currency = getCurrencyForCountry(shippingCountry)
    const stripe = getStripe()
    const baseUrl = getBaseUrl()
    const orderId =
      "OMG-" +
      Math.random().toString(36).slice(2, 6).toUpperCase() +
      "-" +
      Date.now().toString().slice(-6)

    const lineItems = normalizedItems.flatMap((item) => {
      const product = productMap.get(item.productId)!
      const imageUrl = `${baseUrl}${product.image}`

      if (shippingCountry === "BR") {
        return [
          {
            price_data: {
              currency,
              unit_amount: BRAZIL_UNIT_PRICE_CENTS,
              product_data: {
                name: `${product.title} (R$25 each)`,
                description: product.description,
                images: [imageUrl],
              },
            },
            quantity: item.qty,
          },
        ]
      }

      const unitAmount = priceToCents(product.price)
      const discountedQty = Math.floor(item.qty / 2) * 2
      const singleQty = item.qty % 2
      const entries = []

      if (discountedQty > 0) {
        entries.push({
          price_data: {
            currency,
            unit_amount: PROMO_UNIT_PRICE_CENTS,
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
            currency,
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

    const shippingOptions = [
      {
        shipping_rate_data: {
          display_name:
            totals.shippingCents > 0
              ? getShippingRateLabel(shippingCountry)
              : "Free shipping",
          type: "fixed_amount" as const,
          fixed_amount: {
            amount:
              totals.shippingCents > 0 ? shippingTier.amountCents : 0,
            currency,
          },
          delivery_estimate: {
            minimum: {
              unit: "business_day" as const,
              value: SHIPPING_DELIVERY_MIN_DAYS,
            },
            maximum: {
              unit: "business_day" as const,
              value: SHIPPING_DELIVERY_MAX_DAYS,
            },
          },
        },
      },
    ]

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      line_items: lineItems,
      shipping_address_collection: {
        allowed_countries: [shippingCountry],
      },
      shipping_options: shippingOptions,
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
        shippingCountry,
        currency,
        items: JSON.stringify(normalizedItems),
        promoSavingsCents: String(totals.promoSavingsCents),
        subtotalCents: String(totals.subtotalCents),
      },
      payment_intent_data: {
        metadata: {
          orderId,
          email,
          shippingCountry,
          currency,
        },
      },
      custom_text: {
        shipping_address: {
          message:
            totals.shippingCents > 0
              ? `This checkout is locked to ${getShippingCountryLabel(
                  shippingCountry
                )} addresses only. This order uses the ${shippingTier.label} shipping tier. Tracking is emailed after your label is created.`
              : `This checkout is locked to ${getShippingCountryLabel(
                  shippingCountry
                )} addresses only. Tracking is emailed after your label is created.`,
        },
        submit: {
          message:
            "By placing this order, you are purchasing goods from OneMoreGood and agreeing to the shipping and refund terms shown on the site.",
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
