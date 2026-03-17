"use server"

import { revalidatePath } from "next/cache"

import { ORDER_STATUSES } from "@/lib/admin/orders"
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/server"

export async function updateOrderAction(formData: FormData) {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured.")
  }

  const id = String(formData.get("id") || "").trim()
  const status = String(formData.get("status") || "").trim()
  const trackingNumber = String(formData.get("tracking_number") || "").trim()
  const trackingCarrier = String(formData.get("tracking_carrier") || "").trim()
  const notes = String(formData.get("notes") || "").trim()

  if (!id) {
    throw new Error("Order id is required.")
  }

  if (!ORDER_STATUSES.includes(status as (typeof ORDER_STATUSES)[number])) {
    throw new Error("Invalid order status.")
  }

  const supabase = getSupabaseAdmin()
  const { error } = await supabase
    .from("orders")
    .update({
      status,
      tracking_number: trackingNumber || null,
      tracking_carrier: trackingCarrier || null,
      notes: notes || null,
    })
    .eq("id", id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/admin/orders")
  revalidatePath(`/admin/orders/${id}`)
}
