import Link from "next/link"

import colors from "@/components/colors"
import RoughBorder from "@/components/Home/Objects/RoughBorder"

export default function CheckoutCancelPage() {
  return (
    <main
      className="min-h-screen px-6 py-16"
      style={{ background: colors.paper, color: colors.ink }}
    >
      <div className="mx-auto max-w-2xl">
        <RoughBorder bg={colors.sand} rotate={0.2} label="Checkout canceled">
          <h1 className="text-4xl font-black">Checkout canceled</h1>
          <p className="mt-4 text-base" style={{ color: colors.muted }}>
            No payment was completed. Your cart is still on this browser, so you
            can go back and try again whenever you want.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/shop"
              className="px-4 py-3 text-sm font-black uppercase tracking-wider"
              style={{
                background: colors.accent,
                color: colors.paper,
                border: `2px solid ${colors.ink}`,
                boxShadow: `3px 3px 0 ${colors.ink}`,
              }}
            >
              Return to shop
            </Link>
            <Link
              href="/#contact"
              className="px-4 py-3 text-sm font-black uppercase tracking-wider"
              style={{
                background: colors.paper,
                color: colors.ink,
                border: `2px solid ${colors.ink}`,
                boxShadow: `3px 3px 0 ${colors.ink}`,
              }}
            >
              Contact Luciano
            </Link>
          </div>
        </RoughBorder>
      </div>
    </main>
  )
}
