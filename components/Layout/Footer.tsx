"use client"

import Link from "next/link"
import { Heart } from "lucide-react"

import colors from "../colors"
import { useSiteLocale } from "@/app/hooks/useSiteLocale"

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
  const { t } = useSiteLocale()
  const primaryLinks = [
    { href: "/", label: t.nav.home },
    { href: "/shop", label: t.nav.shop },
    { href: "/collaborations", label: t.nav.collaborations },
    { href: "/about", label: t.nav.about },
    { href: "/design-guide", label: t.footer.designGuide },
  ] as const

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
                  {t.footer.tagline}
                </div>
              </div>
            </div>

            <p
              className="mt-4 max-w-md text-sm leading-relaxed"
              style={{ color: colors.muted }}
            >
              {t.footer.description}
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 md:text-right">
            <div>
              <div
                className="text-[11px] font-black uppercase tracking-widest"
                style={{ color: colors.muted }}
              >
                {t.footer.navigate}
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
                {t.footer.connect}
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
          <div>{t.footer.builtBy}</div>
        </div>
      </div>
    </footer>
  )
}
