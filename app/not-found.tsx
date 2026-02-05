"use client"

import { useRouter } from "next/navigation"
import { MapPin, ShieldCheck, ShoppingBag } from "lucide-react"
import colors from "@/components/colors"
import SectionTitle from "@/components/Home/Objects/SectionTitle"
import RoughBorder from "@/components/Home/Objects/RoughBorder"
import HandButton from "@/components/Home/Objects/HandButton"
import StampChip from "@/components/Home/Objects/StampChip"

export default function NotFound() {
  const router = useRouter()

  return (
    <main className="relative">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 1,
          backgroundImage: `
            radial-gradient(circle at 1px 1px, rgba(0,0,0,0.06) 1px, transparent 0),
            repeating-linear-gradient(0deg, rgba(0,0,0,0.03) 0 1px, transparent 1px 18px),
            repeating-linear-gradient(90deg, rgba(0,0,0,0.02) 0 1px, transparent 1px 22px)
          `,
          backgroundSize: "14px 14px, 18px 18px, 22px 22px",
          mixBlendMode: "multiply",
        }}
      />

      <section className="relative max-w-7xl mx-auto px-6 py-16">
        <div className="mt-8">
          <SectionTitle
            kicker="404"
            title="This page isn’t here."
            desc="The link you followed doesn’t live on OneMoreGood. Here are a few real places to go next."
          />
        </div>

        <div className="mt-10 grid md:grid-cols-12 gap-8 items-start">
          <div className="md:col-span-7">
            <RoughBorder
              bg={colors.paper}
              rotate={0.2}
              label="Lost & found"
              delay={60}
            >
              <div
                className="text-6xl font-black"
                style={{ color: colors.clay }}
              >
                404
              </div>
              <p className="mt-3 text-lg" style={{ color: colors.muted }}>
                We couldn’t find that page, but we can still do good. Choose a
                path below.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <HandButton variant="solid" onClick={() => router.push("/")}>
                  Back home
                </HandButton>
                <HandButton variant="ghost" onClick={() => router.push("/shop")}>
                  Visit the shop
                </HandButton>
              </div>
            </RoughBorder>
          </div>

          <div className="md:col-span-5">
            <RoughBorder
              bg={colors.sand}
              rotate={-0.2}
              label="Helpful routes"
              delay={140}
            >
              <div className="grid gap-3 text-sm">
                {[
                  ["Start here", "/"],
                  ["See impact", "/#impact"],
                  ["Watch the proof", "/#mayor"],
                  ["Contact us", "/#contact"],
                ].map(([label, href]) => (
                  <button
                    key={href}
                    type="button"
                    onClick={() => router.push(href)}
                    className="flex items-center justify-between gap-3 text-left btnInk"
                    style={{
                      padding: "10px 12px",
                      background: colors.paper,
                      border: `2px solid ${colors.ink}`,
                      boxShadow: `3px 3px 0 ${colors.ink}`,
                    }}
                  >
                    <span className="font-black">{label}</span>
                    <span
                      className="text-xs font-black uppercase tracking-widest"
                      style={{ color: colors.muted }}
                    >
                      Go
                    </span>
                  </button>
                ))}
              </div>
            </RoughBorder>
          </div>
        </div>
      </section>
    </main>
  )
}
