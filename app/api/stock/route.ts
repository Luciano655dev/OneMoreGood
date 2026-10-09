import { NextResponse } from "next/server"
import { normalizeShippingCountry } from "@/lib/commerce"
import {
  buildStockMapForCountry,
  getFallbackProducts,
  getStoredProducts,
} from "@/lib/products"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const requestedCountry = normalizeShippingCountry(
    url.searchParams.get("country")
  )

  try {
    const products = await getStoredProducts()

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
    const products = getFallbackProducts()

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
  }
}
