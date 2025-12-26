import { NextResponse } from "next/server"
import { getRedis } from "@/lib/redis"
import { PRODUCTS } from "@/data/products"

export async function GET() {
  try {
    const redis = getRedis()
    const ids = PRODUCTS.map((p) => p.id)
    const defaultStock = 20

    if (!redis) {
      const stock = Object.fromEntries(ids.map((id) => [id, defaultStock]))
      return NextResponse.json({ stock, redisDisabled: true })
    }

    const keys = ids.map((id) => `stock:${id}`)
    const values = await redis.mget(...keys)

    const productMap = new Map(PRODUCTS.map((p) => [p.id, p]))
    const stock = Object.fromEntries(
      ids.map((id, i) => [
        id,
        values[i] === null
          ? productMap.get(id)?.max_qnt ?? 10
          : Number(values[i]),
      ])
    )

    return NextResponse.json({ stock })
  } catch (err) {
    console.error("Stock GET error", err)
    return NextResponse.json({ stock: {} }, { status: 500 })
  }
}
