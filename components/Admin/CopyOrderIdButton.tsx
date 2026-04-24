"use client"

import { useRef, useState } from "react"

import colors from "@/components/colors"

export default function CopyOrderIdButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)
  const timeoutRef = useRef<number | null>(null)

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)

      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = window.setTimeout(() => {
        setCopied(false)
      }, 1500)
    } catch {
      setCopied(false)
    }
  }

  return (
    <button
      type="button"
      onClick={onCopy}
      className="px-3 py-2 text-[11px] font-black uppercase tracking-widest"
      style={{
        background: copied ? colors.accent : colors.paper,
        color: copied ? colors.paper : colors.ink,
        border: `2px solid ${colors.ink}`,
        boxShadow: `2px 2px 0 ${colors.ink}`,
      }}
      aria-label="Copy order number"
      title="Copy order number"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  )
}
