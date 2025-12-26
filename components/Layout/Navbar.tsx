"use client"
import { useState } from "react"
import colors from "../colors"
import { Heart, Menu, X } from "lucide-react"
import HandButton from "../Home/Objects/HandButton"
import { useRouter } from "next/navigation"

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()

  return (
    <header
      className="sticky top-0 z-50"
      style={{
        background: colors.paper,
        borderBottom: `2px solid ${colors.ink}`,
        color: colors.ink,
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <a href="/" className="flex items-center gap-3 jitter">
          <div
            className="w-10 h-10 flex items-center justify-center"
            style={{
              background: colors.sand,
              border: `2px solid ${colors.ink}`,
              boxShadow: `2px 2px 0 ${colors.ink}`,
            }}
          >
            <Heart size={18} fill="currentColor" />
          </div>
          <div className="leading-tight">
            <div className="text-lg font-black tracking-tight">
              One More Good
            </div>
            <div
              className="text-xs font-semibold"
              style={{ color: colors.muted }}
            >
              Paraíba, Brazil
            </div>
          </div>
        </a>

        <nav className="hidden md:flex items-center gap-7 text-sm font-black uppercase tracking-wider">
          {[
            ["/#about", "About"],
            ["/#how", "How"],
            ["/#mayor", "Video"],
            ["/#impact", "Impact"],
            ["/#contact", "Contact"],
          ].map(([href, label]) => (
            <a key={label} href={href} className="hover:opacity-70">
              {label}
            </a>
          ))}
          <HandButton
            className="px-4 py-2 font-black uppercase tracking-wider btncolors.Ink"
            style={{
              background: colors.clay,
              color: colors.paper,
              border: `2px solid ${colors.ink}`,
              boxShadow: `2px 2px 0 ${colors.ink}`,
            }}
            onClick={() => router.push("/shop")}
          >
            Shop
          </HandButton>
        </nav>

        <button
          className="md:hidden p-2 btncolors.Ink"
          style={{
            border: `2px solid ${colors.ink}`,
            boxShadow: `2px 2px 0 ${colors.ink}`,
            background: colors.sand,
            color: colors.ink,
          }}
          onClick={() => setMobileMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div
          className="md:hidden border-t-2 border-black"
          style={{ background: colors.paper }}
        >
          <div className="max-w-7xl mx-auto px-6 py-4 grid gap-3 text-sm font-black uppercase tracking-wider">
            {[
              ["#about", "About"],
              ["#how", "How"],
              ["#mayor", "Video"],
              ["#impact", "Impact"],
              ["#contact", "Contact"],
            ].map(([href, label]) => (
              <a
                key={href}
                href={href}
                onClick={() => setMobileMenuOpen(false)}
                className="py-1"
              >
                {label}
              </a>
            ))}
            <HandButton
              className="mt-2 px-4 py-2 font-black uppercase tracking-wider btncolors.Ink"
              style={{
                background: colors.clay,
                color: colors.paper,
                border: `2px solid ${colors.ink}`,
                boxShadow: `2px 2px 0 ${colors.ink}`,
              }}
              onClick={() => router.push("/shop")}
            >
              Shop
            </HandButton>
          </div>
        </div>
      )}
    </header>
  )
}
