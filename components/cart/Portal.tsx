"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"

export default function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Mount guard: portals need a client-only render to avoid SSR/hydration
    // mismatch, so flipping state on mount here is intentional.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  if (!mounted) return null
  return createPortal(children, document.body)
}
