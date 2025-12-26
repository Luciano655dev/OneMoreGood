"use client"

/* 
NOTE
This section is NOT being used
If this initiative starts to grow, Donations will be accepted.
*/

import { useMemo, useState } from "react"
import SectionTitle from "../Objects/SectionTitle"
import RoughBorder from "../Objects/RoughBorder"
import HandButton from "../Objects/HandButton"
import colors from "@/components/colors"

import {
  HeartHandshake,
  BadgeDollarSign,
  Sparkles,
  ArrowRight,
} from "lucide-react"

function money(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n)
}

function HandSlider({ value, min, max, onChange }: any) {
  return (
    <div className="w-full">
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="hand-slider w-full"
      />

      <style jsx>{`
        .hand-slider {
          -webkit-appearance: none;
          appearance: none;
          height: 10px;
          background: ${colors.paper};
          border: 2px solid ${colors.ink};
          border-radius: 999px;
          box-shadow: 2px 2px 0 ${colors.ink};
          outline: none;
          cursor: pointer;
        }

        /* WebKit track */
        .hand-slider::-webkit-slider-runnable-track {
          height: 10px;
        }

        /* WebKit thumb */
        .hand-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 22px;
          height: 22px;
          background: ${colors.sand};
          border: 2px solid ${colors.ink};
          border-radius: 999px;
          box-shadow: 2px 2px 0 ${colors.ink};
          margin-top: -7px;
          cursor: grab;
        }

        .hand-slider:active::-webkit-slider-thumb {
          cursor: grabbing;
          transform: rotate(-4deg);
        }

        /* Firefox */
        .hand-slider::-moz-range-track {
          height: 10px;
          background: ${colors.paper};
          border: 2px solid ${colors.ink};
          border-radius: 999px;
        }

        .hand-slider::-moz-range-thumb {
          width: 22px;
          height: 22px;
          background: ${colors.sand};
          border: 2px solid ${colors.ink};
          border-radius: 999px;
          box-shadow: 2px 2px 0 ${colors.ink};
          cursor: grab;
        }
      `}</style>
    </div>
  )
}

export default function DonateSection() {
  const presets = useMemo(() => [7, 12, 18, 30], [])
  const [amount, setAmount] = useState<number>(12)
  const [monthly, setMonthly] = useState<boolean>(false)

  const impactLine = useMemo(() => {
    if (amount <= 10) return "covers essentials for a kid for a day"
    if (amount <= 50) return "helps fund supplies + delivery for a family drop"
    return "pushes a full community delivery forward"
  }, [amount])

  return (
    <div>
      <section id="donate" className="max-w-7xl mx-auto px-6 py-14">
        <SectionTitle
          kicker="Donations"
          title="Fuel the mission (even without buying socks)"
          desc="Pick an amount, tap donate, and we’ll turn it into help in Paraíba."
        />

        <div className="mt-10 grid md:grid-cols-12 gap-8 items-start">
          <div className="md:col-span-7">
            <RoughBorder
              bg={colors.sand}
              rotate={0.25}
              label="Choose"
              delay={80}
            >
              <div className="flex items-start justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2">
                    <BadgeDollarSign size={18} />
                    <p
                      className="text-sm font-black"
                      style={{ color: colors.muted }}
                    >
                      Your donation
                    </p>
                  </div>
                  <p
                    className="mt-1 text-4xl font-black"
                    style={{ color: colors.ink }}
                  >
                    {money(amount)}
                    <span
                      className="text-sm ml-2"
                      style={{ color: colors.muted }}
                    >
                      {monthly ? "/ month" : "one-time"}
                    </span>
                  </p>
                  <p
                    className="mt-2 text-sm font-black"
                    style={{ color: colors.muted }}
                  >
                    {impactLine}
                  </p>
                </div>

                {/* Monthly toggle pill (no copy of your Contact layout) */}
                <button
                  type="button"
                  onClick={() => setMonthly((v) => !v)}
                  className="px-3 py-2 rounded-full font-black text-sm"
                  style={{
                    background: colors.paper,
                    border: `2px solid ${colors.ink}`,
                    boxShadow: `2px 2px 0 ${colors.ink}`,
                  }}
                  aria-pressed={monthly}
                >
                  {monthly ? "Monthly: ON" : "Monthly: OFF"}
                </button>
              </div>

              {/* slider */}
              <div className="mt-6">
                <label
                  className="text-sm font-black"
                  style={{ color: colors.muted }}
                >
                  Slide to set amount
                </label>

                <div
                  className="mt-2 px-3 py-4 rounded-2xl"
                  style={{
                    background: colors.paper,
                    border: `2px solid ${colors.ink}`,
                    boxShadow: `2px 2px 0 ${colors.ink}`,
                  }}
                >
                  <HandSlider
                    min={1}
                    max={100}
                    value={amount}
                    onChange={setAmount}
                  />
                  <div className="mt-3 flex items-center justify-between text-xs font-black opacity-70">
                    <span>$1</span>
                    <span>$100</span>
                  </div>
                </div>
              </div>

              {/* presets */}
              <div className="mt-5 flex flex-wrap gap-3">
                {presets.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setAmount(p)}
                    className="px-3 py-2 rounded-xl font-black"
                    style={{
                      background: amount === p ? colors.paper : "transparent",
                      border: `2px solid ${colors.ink}`,
                      boxShadow: `2px 2px 0 ${colors.ink}`,
                    }}
                  >
                    {money(p)}
                  </button>
                ))}
              </div>

              {/* CTA */}
              <div className="mt-6 flex flex-wrap gap-3 items-center">
                <a
                  href={`/donate?amount=${amount}&mode=${
                    monthly ? "monthly" : "once"
                  }`}
                >
                  <HandButton variant="solid">
                    Donate {money(amount)}{" "}
                    <ArrowRight className="inline ml-2" size={16} />
                  </HandButton>
                </a>

                <p className="text-xs font-black opacity-70">
                  Pay what you want. No pressure, ever.
                </p>
              </div>
            </RoughBorder>
          </div>

          <div className="md:col-span-5">
            <RoughBorder
              bg={colors.paper}
              rotate={-0.2}
              label="Promise"
              delay={160}
            >
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <HeartHandshake size={18} />
                  <div>
                    <p className="text-sm font-black">Local-first</p>
                    <p className="text-sm font-black opacity-70">
                      We work with partners in our hometown in Paraíba.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Sparkles size={18} />
                  <div>
                    <p className="text-sm font-black">Updates, not noise</p>
                    <p className="text-sm font-black opacity-70">
                      We share impact posts and receipts-style summaries.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <a href="#impact">
                    <HandButton>See impact</HandButton>
                  </a>
                  <a href="#contact">
                    <HandButton>Partner with us</HandButton>
                  </a>
                </div>
              </div>
            </RoughBorder>
          </div>
        </div>
      </section>
    </div>
  )
}
