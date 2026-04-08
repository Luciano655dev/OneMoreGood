import colors from "@/components/colors"
import RoughBorder from "@/components/Home/Objects/RoughBorder"
import PageGridBackground from "@/components/Layout/PageGridBackground"
import { RETURN_WINDOW_DAYS } from "@/lib/commerce"

export default function RefundPolicyPage() {
  return (
    <main
      className="min-h-screen px-6 py-16"
      style={{ background: colors.paper, color: colors.ink }}
    >
      <PageGridBackground />
      <div className="mx-auto max-w-3xl">
        <RoughBorder bg={colors.sand} rotate={0.15} label="Refund policy">
          <h1 className="text-4xl font-black">Refund policy</h1>

          <div className="mt-6 space-y-5 text-sm leading-relaxed" style={{ color: colors.muted }}>
            <p>
              Return requests are accepted within {RETURN_WINDOW_DAYS} days of
              delivery for unworn items in original condition.
            </p>
            <p>
              Shipping fees are non-refundable unless the order arrived damaged,
              defective, or incorrect.
            </p>
            <p>
              Refunds are issued back to the original payment method after the
              return is reviewed and approved.
            </p>
            <p>
              If an order is damaged, incorrect, or missing in transit, contact
              us at `lucianomenezes655@gmail.com` with the order email and
              any relevant photos.
            </p>
            <p>
              OneMoreGood may offer either a replacement or a refund depending
              on the situation and available inventory.
            </p>
          </div>
        </RoughBorder>
      </div>
    </main>
  )
}
