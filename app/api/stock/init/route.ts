import { NextResponse } from "next/server"
import { PRODUCTS } from "@/data/products"
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/server"

export async function POST() {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        ok: false,
        error: "Supabase is not configured.",
      })
    }

    const supabase = getSupabaseAdmin()
    const rows = PRODUCTS.map((product, index) => ({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      description: product.description ?? null,
      tags: product.tags ?? [],
      inventory_quantity: product.max_qnt ?? 20,
      is_active: true,
      sort_order: index,
    }))

    const { error } = await supabase.from("products").upsert(rows)
    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("Stock init error", err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
