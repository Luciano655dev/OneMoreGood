import { NextResponse } from "next/server"

import { getStoredProducts, toStorefrontProduct } from "@/lib/products"

export async function GET() {
  try {
    const products = await getStoredProducts()
    return NextResponse.json({ products: products.map(toStorefrontProduct) })
  } catch (error) {
    console.error("Products GET error", error)
    return NextResponse.json(
      { products: [], error: "Could not load products." },
      { status: 500 }
    )
  }
}
