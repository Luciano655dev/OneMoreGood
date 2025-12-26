import { NextResponse } from "next/server"
import { getRedis } from "@/lib/redis"
import { PRODUCTS } from "@/data/products"

export async function POST() {
  try {
    const redis = getRedis()
    if (!redis) return NextResponse.json({ ok: true })

    for (const p of PRODUCTS) {
      const key = `stock:${p.id}`
      const exists = await redis.exists(key)

      if (!exists) {
        // use max_qnt as starting stock
        await redis.set(key, p.max_qnt ?? 10)
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("Stock init error", err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
