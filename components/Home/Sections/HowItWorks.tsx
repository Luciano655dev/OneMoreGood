import SectionTitle from "../Objects/SectionTitle"
import RoughBorder from "../Objects/RoughBorder"

import { BookOpen, Heart, ShieldCheck } from "lucide-react"
import colors from "@/components/colors"

export default function HowItWorks() {
  return (
    <section id="how" className="max-w-7xl mx-auto px-6 py-14">
      <SectionTitle
        kicker="Methodology"
        title="How the fundraising model works"
        desc="OneMoreGood uses product sales and direct supporter relationships to raise money for nonprofit partners."
      />

      <div className="mt-10 grid md:grid-cols-3 gap-6">
        {[
          {
            n: "01",
            t: "Sell fun socks",
            d: "Products create a straightforward way for people to support a cause without a complicated donation flow.",
            icon: BookOpen,
            tone: colors.sand,
            rot: -0.5,
          },
          {
            n: "02",
            t: "Fund partner nonprofits",
            d: "Revenue is directed to organizations already doing real local work and needing more operational support.",
            icon: Heart,
            tone: colors.paper,
            rot: 0.4,
          },
          {
            n: "03",
            t: "Grow with partnerships",
            d: "We can coordinate partnerships, custom fundraising efforts, and direct conversations about how support should be structured.",
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
