import { NextResponse } from "next/server"

import { getShippableItemCount, type SimpleCartItem } from "@/lib/commerce"
import { getStoredProducts } from "@/lib/products"
import { quoteShipping } from "@/lib/melhor-envio"

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))

    const postalCode = String(body.postalCode || "").replace(/\D/g, "")
    if (postalCode.length !== 8) {
      return NextResponse.json(
        { ok: false, error: "Informe um CEP válido." },
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
    const productIds = new Set(storedProducts.map((product) => product.id))
    const items: SimpleCartItem[] = []

    for (const item of rawItems) {
      const productId = String(item.productId || "")
      const qty = Number(item.qty)
      if (!productId || !productIds.has(productId)) {
        return NextResponse.json(
          { ok: false, error: "Item inválido no carrinho." },
          { status: 400 }
        )
      }
      if (!Number.isInteger(qty) || qty <= 0) {
        return NextResponse.json(
          { ok: false, error: "Quantidade inválida." },
          { status: 400 }
        )
      }
      items.push({ productId, qty })
    }

    const pairs = getShippableItemCount(storedProducts, items)

    const quotes = await quoteShipping({
      toPostalCode: postalCode,
      pairs: Math.max(1, pairs),
    })

    if (quotes.length === 0) {
      return NextResponse.json(
        {
          ok: false,
          error: "Não foi possível calcular o frete para este CEP.",
        },
        { status: 502 }
      )
    }

    return NextResponse.json({ ok: true, quotes })
  } catch (error) {
    console.error("Shipping quote error", error)
    return NextResponse.json(
      { ok: false, error: "Erro ao calcular o frete." },
      { status: 500 }
    )
  }
}
