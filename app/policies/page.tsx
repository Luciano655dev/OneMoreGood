import colors from "@/components/colors"
import RoughBorder from "@/components/Home/Objects/RoughBorder"
import SectionTitle from "@/components/Home/Objects/SectionTitle"
import PageGridBackground from "@/components/Layout/PageGridBackground"
import {
  RETURN_WINDOW_DAYS,
  SHIPPING_DELIVERY_MAX_DAYS,
  SHIPPING_DELIVERY_MIN_DAYS,
  SHIPPING_RATE_LABEL,
  SHIPPING_TIERS,
  moneyFromCents,
} from "@/lib/commerce"

export default function PoliciesPage() {
  return (
    <main
      className="min-h-screen"
      style={{ background: colors.paper, color: colors.ink }}
    >
      <PageGridBackground />

      <section className="relative mx-auto max-w-7xl px-6 py-16">
        <SectionTitle
          kicker="Policies"
          title="Shipping and refunds"
          desc="The practical terms for U.S. orders, tracking, returns, and refunds on OneMoreGood."
        />

        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <RoughBorder
            bg={colors.sand}
            rotate={-0.3}
            label="Shipping policy"
            className="h-full"
          >
            <div className="space-y-5 text-sm leading-relaxed" style={{ color: colors.muted }}>
              <p>OneMoreGood currently ships within the United States only.</p>
              <p>
                <strong style={{ color: colors.ink }}>{SHIPPING_RATE_LABEL}:</strong>{" "}
                shipping is based on how many pairs are in the order, not on
                distance.
              </p>
              <div
                className="p-4"
                style={{
                  background: colors.paper,
                  border: `2px solid ${colors.ink}`,
                  boxShadow: `3px 3px 0 ${colors.ink}`,
                }}
              >
                <div className="font-black" style={{ color: colors.ink }}>
                  Current shipping tiers
                </div>
                <ul className="mt-3 space-y-2">
                  {SHIPPING_TIERS.map((tier) => (
                    <li key={tier.label}>
                      {tier.label}: ${moneyFromCents(tier.amountCents)}
                    </li>
                  ))}
                </ul>
              </div>
              <p>
                Estimated delivery window: {SHIPPING_DELIVERY_MIN_DAYS} to{" "}
                {SHIPPING_DELIVERY_MAX_DAYS} business days after the shipping
                label is created.
              </p>
              <p>
                Shipping labels and tracking numbers are created manually after
                purchase. Tracking is emailed to the address used during
                checkout.
              </p>
              <p>
                If a package is lost in transit or arrives damaged, contact
                us at <strong style={{ color: colors.ink }}>lucianomenezes655@gmail.com</strong> so the order can be
                reviewed for replacement or refund.
              </p>
            </div>
          </RoughBorder>

          <RoughBorder
            bg={colors.paper}
            rotate={0.25}
            label="Refund policy"
            className="h-full"
          >
            <div className="space-y-5 text-sm leading-relaxed" style={{ color: colors.muted }}>
              <p>
                Return requests are accepted within {RETURN_WINDOW_DAYS} days of
                delivery for unworn items in original condition.
              </p>
              <p>
                Shipping fees are non-refundable unless the order arrived
                damaged, defective, or incorrect.
              </p>
              <p>
                Refunds are issued back to the original payment method through
                Stripe after the return is reviewed and approved.
              </p>
              <p>
                If an order is damaged, incorrect, or missing in transit,
                contact us at <strong style={{ color: colors.ink }}>lucianomenezes655@gmail.com</strong> with the order
                email and any relevant photos.
              </p>
              <p>
                OneMoreGood may offer either a replacement or a refund
                depending on the situation and available inventory.
              </p>
            </div>
          </RoughBorder>
        </div>
      </section>
    </main>
  )
}
