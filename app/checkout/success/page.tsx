import Link from "next/link"

import ClearCart from "./ClearCart"
import colors from "@/components/colors"
import RoughBorder from "@/components/Home/Objects/RoughBorder"
import {
  SHIPPING_DELIVERY_MAX_DAYS,
  SHIPPING_DELIVERY_MIN_DAYS,
  shippingPolicySummary,
  refundPolicySummary,
} from "@/lib/commerce"

export default function CheckoutSuccessPage() {
  return (
    <main
      className="min-h-screen px-6 py-16"
      style={{ background: colors.paper, color: colors.ink }}
    >
      <ClearCart />

      <div className="mx-auto max-w-3xl">
        <RoughBorder
          bg={colors.sand}
          rotate={-0.2}
          label="Order placed"
          className="max-w-3xl"
        >
          <h1 className="text-4xl font-black">Payment received</h1>
          <p className="mt-4 text-base" style={{ color: colors.muted }}>
            Your order is confirmed. Next you will receive your receipt, and
            then OneMoreGood will prepare shipment and email tracking after the
            shipping label is created.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div
              className="p-4"
              style={{
                background: colors.paper,
                border: `2px solid ${colors.ink}`,
                boxShadow: `3px 3px 0 ${colors.ink}`,
              }}
            >
              <div className="font-black">Shipping timeline</div>
              <p className="mt-2 text-sm" style={{ color: colors.muted }}>
                Standard shipping to the U.S. or Brazil is estimated at{" "}
                {SHIPPING_DELIVERY_MIN_DAYS}-{SHIPPING_DELIVERY_MAX_DAYS} business
                days after your label is purchased.
              </p>
            </div>

            <div
              className="p-4"
              style={{
                background: colors.paper,
                border: `2px solid ${colors.ink}`,
                boxShadow: `3px 3px 0 ${colors.ink}`,
              }}
            >
              <div className="font-black">Tracking</div>
              <p className="mt-2 text-sm" style={{ color: colors.muted }}>
                The shipping label is created separately, and the tracking
                number is emailed once the package is ready.
              </p>
            </div>
          </div>

          <div className="mt-6 text-sm" style={{ color: colors.muted }}>
            {shippingPolicySummary()} {refundPolicySummary()}
          </div>

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
              Back to shop
            </Link>
            <Link
              href="/policies"
              className="px-4 py-3 text-sm font-black uppercase tracking-wider"
              style={{
                background: colors.paper,
                color: colors.ink,
                border: `2px solid ${colors.ink}`,
                boxShadow: `3px 3px 0 ${colors.ink}`,
              }}
            >
              Policies
            </Link>
          </div>
        </RoughBorder>
      </div>
    </main>
  )
}
