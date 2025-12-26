import SectionTitle from "../Objects/SectionTitle"
import RoughBorder from "../Objects/RoughBorder"

import { ShoppingBag, Heart, ShieldCheck } from "lucide-react"
import colors from "@/components/colors"

export default function HowItWorks() {
  return (
    <section id="how" className="max-w-7xl mx-auto px-6 py-14">
      <SectionTitle
        kicker="Process"
        title="How it works"
        desc="Clear steps. Easy to trust."
      />

      <div className="mt-10 grid md:grid-cols-3 gap-6">
        {[
          {
            n: "01",
            t: "You support",
            d: "Choose something in the shop. Every purchase is designed to create real help.",
            icon: ShoppingBag,
            tone: colors.sand,
            rot: -0.5,
          },
          {
            n: "02",
            t: "We fund essentials",
            d: "We allocate support toward practical needs identified locally.”",
            icon: Heart,
            tone: colors.paper,
            rot: 0.4,
          },
          {
            n: "03",
            t: "Local delivery + proof",
            d: "Partners in Santa Terezinha deliver and we publish simple updates so it stays verifiable.",
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
              rotate={s.rot}
              label={`Step ${s.n}`}
              delay={idx * 120}
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
