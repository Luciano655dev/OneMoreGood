import { NextResponse } from "next/server"
import { getStoredProducts } from "@/lib/products"

export async function GET() {
  try {
    const products = await getStoredProducts()
    const stock = Object.fromEntries(
      products.map((product) => [product.id, product.inventory_quantity])
    )
    return NextResponse.json({ stock })
  } catch (err) {
    console.error("Stock GET error", err)
    return NextResponse.json({ stock: {} }, { status: 500 })
  }
}
