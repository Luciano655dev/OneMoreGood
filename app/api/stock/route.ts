import { NextResponse } from "next/server"
import { normalizeShippingCountry } from "@/lib/commerce"
import { buildStockMapForCountry, getStoredProducts } from "@/lib/products"

export async function GET(req: Request) {
  try {
    const products = await getStoredProducts()
    const url = new URL(req.url)
    const requestedCountry = normalizeShippingCountry(
      url.searchParams.get("country")
    )

    if (requestedCountry) {
      return NextResponse.json({
        stock: buildStockMapForCountry(products, requestedCountry),
      })
    }

    return NextResponse.json({
      stock: {
        US: buildStockMapForCountry(products, "US"),
        BR: buildStockMapForCountry(products, "BR"),
      },
    })
  } catch (err) {
    console.error("Stock GET error", err)
    return NextResponse.json({ stock: {} }, { status: 500 })
  }
}
