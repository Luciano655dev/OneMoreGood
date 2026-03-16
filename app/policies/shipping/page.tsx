import colors from "@/components/colors"
import RoughBorder from "@/components/Home/Objects/RoughBorder"
import {
  SHIPPING_DELIVERY_MAX_DAYS,
  SHIPPING_DELIVERY_MIN_DAYS,
  SHIPPING_RATE_LABEL,
  SHIPPING_TIERS,
  moneyFromCents,
} from "@/lib/commerce"

export default function ShippingPolicyPage() {
  return (
    <main
      className="min-h-screen px-6 py-16"
      style={{ background: colors.paper, color: colors.ink }}
    >
      <div className="mx-auto max-w-3xl">
        <RoughBorder bg={colors.sand} rotate={-0.2} label="Shipping policy">
          <h1 className="text-4xl font-black">Shipping policy</h1>

          <div className="mt-6 space-y-5 text-sm leading-relaxed" style={{ color: colors.muted }}>
            <p>
              OneMoreGood currently ships within the United States only.
            </p>
            <p>
              <strong style={{ color: colors.ink }}>{SHIPPING_RATE_LABEL}:</strong>{" "}
              shipping is based on order size, not distance.
            </p>
            <ul className="space-y-2">
              {SHIPPING_TIERS.map((tier) => (
                <li key={tier.label}>
                  {tier.label}: ${moneyFromCents(tier.amountCents)}
                </li>
              ))}
            </ul>
            <p>
              Estimated delivery window: {SHIPPING_DELIVERY_MIN_DAYS} to{" "}
              {SHIPPING_DELIVERY_MAX_DAYS} business days after the shipping
              label is created.
            </p>
            <p>
              Shipping labels and tracking numbers are created manually after
              purchase. Tracking is emailed to the address used during checkout.
            </p>
            <p>
              If a package is lost in transit or arrives damaged, contact
              Luciano at `lucianomenezes655@gmail.com` so the order can be
              reviewed for replacement or refund.
            </p>
          </div>
        </RoughBorder>
      </div>
    </main>
  )
}
