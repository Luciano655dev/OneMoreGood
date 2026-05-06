import { NextResponse } from "next/server"
import { syncStoredProductsCatalog } from "@/lib/products"
import { isSupabaseConfigured } from "@/lib/supabase/server"

export async function POST() {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        ok: false,
        error: "Supabase is not configured.",
      })
    }

    const result = await syncStoredProductsCatalog()
    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    console.error("Stock init error", err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
