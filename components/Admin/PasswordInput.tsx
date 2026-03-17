"use client"

import { useState } from "react"

import colors from "@/components/colors"

export default function PasswordInput() {
  const [visible, setVisible] = useState(false)

  return (
    <div className="mt-2 flex items-stretch">
      <input
        type={visible ? "text" : "password"}
        name="password"
        className="w-full px-3 py-3 text-sm font-black outline-none"
        style={{
          background: colors.paper,
          border: `2px solid ${colors.ink}`,
          borderRight: "0",
        }}
        autoFocus
        required
      />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        className="px-4 py-3 text-xs font-black uppercase tracking-widest"
        style={{
          background: colors.sand,
          border: `2px solid ${colors.ink}`,
          color: colors.ink,
        }}
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? "Hide" : "Show"}
      </button>
    </div>
  )
}
