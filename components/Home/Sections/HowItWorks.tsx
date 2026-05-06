import SectionTitle from "../Objects/SectionTitle"
import RoughBorder from "../Objects/RoughBorder"

import { BookOpen, Heart, ShieldCheck } from "lucide-react"
import colors from "@/components/colors"

export default function HowItWorks() {
  return (
    <section id="how" className="max-w-7xl mx-auto px-6 py-14">
      <SectionTitle
        kicker="Methodology"
        title="How the ecommerce model works"
        desc="OneMoreGood is designed as a straightforward store with a clear purpose behind the brand."
      />

      <div className="mt-10 grid md:grid-cols-3 gap-6">
        {[
          {
            n: "01",
            t: "Sell real products",
            d: "Customers come to OneMoreGood to buy socks and place merchandise orders through our online shop.",
            icon: BookOpen,
            tone: colors.sand,
            rot: -0.5,
          },
          {
            n: "02",
            t: "Fulfill the order",
            d: "We process payment, manage the order, and deliver the product to the customer.",
            icon: Heart,
            tone: colors.paper,
            rot: 0.4,
          },
          {
            n: "03",
            t: "Keep the purpose visible",
            d: "The brand stays tied to real local context so the business feels grounded, documented, and more personal than generic ecommerce.",
            icon: ShieldCheck,
            tone: colors.sand,
            rot: -0.2,
          },
        ].map((s, idx) => {
          const Icon = s.icon
          return (
            <RoughBorder
              key={s.n}
              bg={s.tone}
              rotate={0}
              label={`Step ${s.n}`}
              delay={idx * 120}
              className="h-full"
            >
              <div className="flex items-center justify-between">
                <div
                  className="text-5xl font-black"
                  style={{ color: colors.clay }}
                >
                  {s.n}
                </div>
                <div
                  className="p-2"
                  style={{
                    border: `2px solid ${colors.ink}`,
                    background: colors.paper,
                    boxShadow: `2px 2px 0 ${colors.ink}`,
                  }}
                >
                  <Icon size={18} />
                </div>
              </div>
              <div className="mt-4 text-2xl font-black">{s.t}</div>
              <div className="mt-2" style={{ color: colors.muted }}>
                {s.d}
              </div>
            </RoughBorder>
          )
        })}
      </div>
    </section>
  )
}
