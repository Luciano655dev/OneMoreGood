import Link from "next/link"
import { Heart } from "lucide-react"

import colors from "../colors"

const primaryLinks = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "About Us" },
  { href: "/design-guide", label: "Design Guide" },
] as const

const externalLinks = [
  {
    href: "mailto:lucianomenezes655@gmail.com",
    label: "Email",
  },
  {
    href: "https://github.com/luciano655dev",
    label: "GitHub",
  },
  {
    href: "https://www.instagram.com/ies.institutoeducacionalsemear/",
    label: "Instagram",
  },
] as const

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: `2px solid ${colors.ink}`,
        background: colors.paper,
        color: colors.ink,
      }}
    >
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <div className="max-w-xl">
            <div className="flex items-center gap-3">
              <div
                className="flex h-11 w-11 items-center justify-center"
                style={{
                  background: colors.sand,
                  border: `2px solid ${colors.ink}`,
                  boxShadow: `2px 2px 0 ${colors.ink}`,
                }}
              >
                <Heart size={18} fill="currentColor" />
              </div>
              <div>
                <div className="text-lg font-black tracking-tight">
                  One More Good
                </div>
                <div className="text-sm" style={{ color: colors.muted }}>
                  A small brand with a clear point of view.
                </div>
              </div>
            </div>

            <p
              className="mt-4 max-w-md text-sm leading-relaxed"
              style={{ color: colors.muted }}
            >
              Built by the OneMoreGood team as a product brand that stays
              personal, direct, and grounded in the people behind it.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 md:text-right">
            <div>
              <div
                className="text-[11px] font-black uppercase tracking-widest"
                style={{ color: colors.muted }}
              >
                Navigate
              </div>
              <div className="mt-3 grid gap-2 text-sm font-black">
                {primaryLinks.map((link) => (
                  <Link key={link.href} href={link.href} className="hover:opacity-70">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <div
                className="text-[11px] font-black uppercase tracking-widest"
                style={{ color: colors.muted }}
              >
                Connect
              </div>
              <div className="mt-3 grid gap-2 text-sm font-black">
                {externalLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="hover:opacity-70"
                    target={link.href.startsWith("http") ? "_blank" : undefined}
                    rel={link.href.startsWith("http") ? "noreferrer" : undefined}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div
          className="mt-8 flex flex-col gap-3 border-t pt-4 text-xs sm:flex-row sm:items-center sm:justify-between"
          style={{ borderColor: colors.ink, color: colors.muted }}
        >
          <div>Copyright © {new Date().getFullYear()} One More Good.</div>
          <div>Designed and built by the OneMoreGood team.</div>
        </div>
      </div>
    </footer>
  )
}
