import { NextResponse } from "next/server"
import { Resend } from "resend"
import { getRedis } from "@/lib/redis"
import { PRODUCTS } from "@/data/products"

import {
  buildBuyerEmailHtml,
  buildOwnerEmailHtml,
  buildProductCardsHtml,
  type EmailCardItem,
} from "@/lib/email/templates"

import { nextBusinessDayLabelServer } from "@/lib/email/utils"

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

async function reserveStockAtomic(params: {
  redis: any
  items: { productId: string; qty: number; initial: number }[]
}) {
  const { redis, items } = params

  const keys = items.map((it) => `stock:${it.productId}`)

  const args: string[] = []
  for (const it of items) {
    args.push(String(it.qty), String(it.initial))
  }

  const script = `
    for i=1,#KEYS do
      local v = redis.call("GET", KEYS[i])
      if not v then
        local initial = tonumber(ARGV[(i-1)*2+2])
        redis.call("SET", KEYS[i], initial)
      end
    end

    for i=1,#KEYS do
      local need = tonumber(ARGV[(i-1)*2+1])
      local have = tonumber(redis.call("GET", KEYS[i]) or "0")
      if have < need then
        return {0, KEYS[i]}
      end
    end

    for i=1,#KEYS do
      local need = tonumber(ARGV[(i-1)*2+1])
      redis.call("DECRBY", KEYS[i], need)
    end

    return {1, ""}
  `

  // ✅ IMPORTANT: eval(script, numKeys, ...keys, ...args)
  const numKeys = keys.length
  const res = await redis.eval(script, numKeys, ...keys, ...args)

  const ok = Array.isArray(res) ? Number(res[0]) === 1 : false
  const failedKey = Array.isArray(res) ? String(res[1] || "") : ""
  return { ok, failedKey }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const email = (body.email || "").trim().toLowerCase()
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { ok: false, error: "Please enter a valid email." },
        { status: 400 }
      )
    }

    const itemsRaw = Array.isArray(body.items) ? body.items : []
    if (itemsRaw.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Cart is empty." },
        { status: 400 }
      )
    }

    // server-truth products
    const productMap = new Map(PRODUCTS.map((p) => [p.id, p]))

    // hydrate items for totals + email templates
    const itemsHydrated: EmailCardItem[] = []

    for (const it of itemsRaw) {
      if (!it.productId || typeof it.qty !== "number" || it.qty <= 0) {
        return NextResponse.json(
          { ok: false, error: "Invalid cart items." },
          { status: 400 }
        )
      }

      const p = productMap.get(it.productId)
      if (!p) {
        return NextResponse.json(
          { ok: false, error: `Unknown product: ${it.productId}` },
          { status: 400 }
        )
      }

      // optional: limit per order
      if (typeof p.max_qnt === "number" && it.qty > p.max_qnt) {
        return NextResponse.json(
          { ok: false, error: `Too many for ${p.title}.` },
          { status: 400 }
        )
      }

      itemsHydrated.push({
        productId: p.id,
        title: p.title,
        price: p.price,
        image: p.image,
        qty: it.qty,
      })
    }

    const pickupLocation =
      body.pickup?.location || "Windermere Preparatory School"
    const pickupWhen = body.pickup?.when || nextBusinessDayLabelServer()

    const orderId =
      "OMG-" +
      Math.random().toString(36).slice(2, 6).toUpperCase() +
      "-" +
      Date.now().toString().slice(-6)

    const resendKey = process.env.RESEND_API_KEY
    const from = process.env.RESEND_FROM
    const ordersTo = process.env.ORDERS_TO

    if (!resendKey || !from || !ordersTo) {
      return NextResponse.json(
        { ok: false, error: "Email service not configured." },
        { status: 500 }
      )
    }

    // reserve stock first (atomic)
    const redis = getRedis()
    if (redis) {
      const reserveItems = itemsHydrated.map((it) => {
        const p = productMap.get(it.productId)!
        return {
          productId: it.productId,
          qty: it.qty,
          initial: p.max_qnt ?? 10,
        }
      })

      const reserved = await reserveStockAtomic({ redis, items: reserveItems })
      if (!reserved.ok) {
        const failedId = reserved.failedKey.replace("stock:", "")
        const failedProduct = productMap.get(failedId)
        return NextResponse.json(
          {
            ok: false,
            error: failedProduct
              ? `${failedProduct.title} is out of stock (or not enough left).`
              : "One item is out of stock.",
          },
          { status: 409 }
        )
      }
    }

    const subtotal = itemsHydrated.reduce(
      (sum, it) => sum + it.price * it.qty,
      0
    )
    const shipping = 0
    const total = subtotal + shipping

    const productCardsHtml = buildProductCardsHtml(itemsHydrated)

    const buyerHtml = buildBuyerEmailHtml({
      orderId,
      pickupLocation,
      pickupWhen,
      productCardsHtml,
      subtotal,
      shipping,
      total,
    })

    const ownerHtml = buildOwnerEmailHtml({
      orderId,
      customerEmail: email,
      pickupLocation,
      pickupWhen,
      productCardsHtml,
      subtotal,
      shipping,
      total,
    })

    const resend = new Resend(resendKey)

    await resend.emails.send({
      from,
      to: email,
      subject: `OneMoreGood reserved (${orderId})`,
      html: buyerHtml,
    })

    await resend.emails.send({
      from,
      to: ordersTo,
      subject: `New OneMoreGood order (${orderId})`,
      html: ownerHtml,
    })

    return NextResponse.json({ ok: true, orderId })
  } catch (err) {
    console.error("Checkout error", err)
    return NextResponse.json(
      { ok: false, error: "Server error." },
      { status: 500 }
    )
  }
}
