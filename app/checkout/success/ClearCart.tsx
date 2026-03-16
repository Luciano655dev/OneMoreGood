"use client"

import { useEffect } from "react"

import { CART_STORAGE_KEY } from "@/lib/commerce"

export default function ClearCart() {
  useEffect(() => {
    try {
      localStorage.removeItem(CART_STORAGE_KEY)
    } catch {
      // ignore
    }
  }, [])

  return null
}
