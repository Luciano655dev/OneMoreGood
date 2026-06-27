"use client"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import colors from "../colors"
import { Heart, Menu, X } from "lucide-react"
import HandButton from "../Home/Objects/HandButton"
import { useSiteLocale } from "@/app/hooks/useSiteLocale"

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()
  const { t } = useSiteLocale()
  const navLinks = [
    ["/", t.nav.home],
    ["/collaborations", t.nav.collaborations],
    ["/about", t.nav.about],
  ] as const

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
        <Link href="/" className="flex items-center gap-3 jitter">
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
              {t.nav.subtitle}
            </div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-sm font-black uppercase tracking-wider">
          {navLinks.map(([href, label]) => (
            <Link key={href} href={href} className="hover:opacity-70">
              {label}
            </Link>
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
            {t.nav.shop}
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
            {navLinks.map(([href, label]) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileMenuOpen(false)}
                className="py-1"
              >
                {label}
              </Link>
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
              {t.nav.shop}
            </HandButton>
          </div>
        </div>
      )}
    </header>
  )
}
