import { NextResponse } from "next/server"

import {
  ONLINE_CHECKOUT_ENABLED,
  calculateCartTotals,
  getShippableItemCount,
  getUnitPriceCentsForCountry,
  type SimpleCartItem,
} from "@/lib/commerce"
import {
  getInventoryForCountry,
  getStoredProducts,
} from "@/lib/products"
import { quoteShipping, type ShippingService } from "@/lib/melhor-envio"
import { getStripe } from "@/lib/stripe"
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/server"

const SHIPPING_COUNTRY = "BR" as const

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function digitsOnly(value: unknown) {
  return String(value || "").replace(/\D/g, "")
}

function generateOrderId() {
  return (
    "OMG-" +
    Math.random().toString(36).slice(2, 6).toUpperCase() +
    "-" +
    Date.now().toString().slice(-6)
  )
}

export async function POST(req: Request) {
  try {
    if (!ONLINE_CHECKOUT_ENABLED) {
      return NextResponse.json(
        { ok: false, error: "Checkout online indisponível no momento." },
        { status: 503 }
      )
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { ok: false, error: "Checkout indisponível no momento." },
        { status: 503 }
      )
    }

    const body = await req.json().catch(() => ({}))

    const name = String(body.name || "").trim()
    const email = String(body.email || "").trim().toLowerCase()
    const phone = digitsOnly(body.phone)
    const cpf = digitsOnly(body.cpf)
    const service = String(body.service || "").toUpperCase() as ShippingService
    const address = body.address || {}

    const cep = digitsOnly(address.cep)
    const street = String(address.street || "").trim()
    const number = String(address.number || "").trim()
    const complement = String(address.complement || "").trim()
    const district = String(address.district || "").trim()
    const city = String(address.city || "").trim()
    const state = String(address.state || "").trim().toUpperCase()

    if (!name || !isValidEmail(email)) {
      return NextResponse.json(
        { ok: false, error: "Nome e email são obrigatórios." },
        { status: 400 }
      )
    }
    if (
      cep.length !== 8 ||
      !street ||
      !number ||
      !district ||
      !city ||
      state.length !== 2
    ) {
      return NextResponse.json(
        { ok: false, error: "Endereço incompleto." },
        { status: 400 }
      )
    }
    if (service !== "PAC" && service !== "SEDEX") {
      return NextResponse.json(
        { ok: false, error: "Forma de envio inválida." },
        { status: 400 }
      )
    }

    const rawItems = Array.isArray(body.items) ? body.items : []
    if (rawItems.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Carrinho vazio." },
        { status: 400 }
      )
    }

    const storedProducts = await getStoredProducts()
    const productMap = new Map(storedProducts.map((p) => [p.id, p]))
    const items: SimpleCartItem[] = []

    for (const item of rawItems) {
      const productId = String(item.productId || "")
      const qty = Number(item.qty)
      const product = productMap.get(productId)
      if (!product || !Number.isInteger(qty) || qty <= 0) {
        return NextResponse.json(
          { ok: false, error: "Item inválido no carrinho." },
          { status: 400 }
        )
      }
      const maxQty = product.max_qnt ?? Number.POSITIVE_INFINITY
      if (qty > maxQty) {
        return NextResponse.json(
          { ok: false, error: `Quantidade máxima excedida para ${product.title}.` },
          { status: 400 }
        )
      }
      items.push({ productId, qty })
    }

    // Stock re-check (never trust the client).
    for (const item of items) {
      const product = productMap.get(item.productId)!
      if (getInventoryForCountry(product, SHIPPING_COUNTRY) < item.qty) {
        return NextResponse.json(
          { ok: false, error: `${product.title} sem estoque suficiente.` },
          { status: 409 }
        )
      }
    }

    // Re-price server-side.
    const totals = calculateCartTotals(storedProducts, items, SHIPPING_COUNTRY)
    const pairs = Math.max(1, getShippableItemCount(storedProducts, items))

    const quotes = await quoteShipping({ toPostalCode: cep, pairs })
    const quote = quotes.find((q) => q.service === service)
    if (!quote) {
      return NextResponse.json(
        { ok: false, error: "Forma de envio indisponível para este CEP." },
        { status: 409 }
      )
    }

    const subtotalCents = totals.subtotalCents
    const shippingCents = quote.priceCents
    const totalCents = subtotalCents + shippingCents

    const orderId = generateOrderId()
    const supabase = getSupabaseAdmin()

    const shippingAddressJson = {
      line1: street,
      line2: complement || null,
      number,
      district,
      city,
      state,
      postal_code: cep,
      country: "BR",
      document: cpf || null,
    }

    const { data: insertedOrder, error: insertError } = await supabase
      .from("orders")
      .insert({
        order_id: orderId,
        status: "pending",
        currency: "brl",
        customer_email: email,
        subtotal_cents: subtotalCents,
        promo_savings_cents: 0,
        shipping_cents: shippingCents,
        total_cents: totalCents,
        shipping_name: name,
        shipping_phone: phone || null,
        shipping_address: shippingAddressJson,
        shipping_service: service,
        label_status: "pending",
      })
      .select("id")
      .single()

    if (insertError || !insertedOrder?.id) {
      console.error("Pending order insert failed", insertError)
      return NextResponse.json(
        { ok: false, error: "Não foi possível criar o pedido." },
        { status: 500 }
      )
    }

    const orderItems = items.map((item) => {
      const product = productMap.get(item.productId)!
      return {
        order_id: insertedOrder.id,
        product_id: item.productId,
        title: product.title,
        quantity: item.qty,
        unit_price_cents: getUnitPriceCentsForCountry(product, SHIPPING_COUNTRY),
      }
    })

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems)
    if (itemsError) {
      console.error("Pending order items insert failed", itemsError)
    }

    const stripe = getStripe()
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalCents,
      currency: "brl",
      automatic_payment_methods: { enabled: true },
      receipt_email: email,
      metadata: {
        orderId,
        shippingCountry: SHIPPING_COUNTRY,
      },
    })

    await supabase
      .from("orders")
      .update({ stripe_payment_intent_id: paymentIntent.id })
      .eq("id", insertedOrder.id)

    return NextResponse.json({
      ok: true,
      clientSecret: paymentIntent.client_secret,
      orderId,
      subtotalCents,
      shippingCents,
      totalCents,
    })
  } catch (error) {
    console.error("create-intent error", error)
    return NextResponse.json(
      { ok: false, error: "Erro ao iniciar o pagamento." },
      { status: 500 }
    )
  }
}
