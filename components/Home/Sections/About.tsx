"use client"

import { useEffect, useState } from "react"
import {
  MapPin,
  Sparkles,
  ShieldCheck,
  Users,
  X,
  ArrowRight,
} from "lucide-react"
import Image from "next/image"

import SectionTitle from "../Objects/SectionTitle"
import RoughBorder from "../Objects/RoughBorder"
import SockIcon from "../Objects/SockIcon"
import HandButton from "../Objects/HandButton"
import colors from "@/components/colors"

export default function About() {
  const [photoOpen, setPhotoOpen] = useState(false)

  // Close on ESC
  useEffect(() => {
    if (!photoOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPhotoOpen(false)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [photoOpen])

  return (
    <section id="about" className="max-w-7xl mx-auto px-6 py-14">
      <SectionTitle
        kicker="About"
        title="Local roots. Direct impact."
        desc="OneMoreGood started with a simple idea: make doing good easy, honest, and close to the people it’s meant for."
      />

      <div className="mt-10 grid md:grid-cols-12 gap-8 items-start">
        {/* LEFT */}
        <div className="md:col-span-7">
          <RoughBorder
            bg={colors.paper}
            rotate={0.4}
            label="What OneMoreGood is"
            delay={60}
          >
            <div className="space-y-6">
              <p
                className="text-sm leading-relaxed"
                style={{ color: colors.muted }}
              >
                OneMoreGood is a small nonprofit project rooted in Santa
                Terezinha, Paraíba, a place that matters to us personally. We
                focus on help that is practical and verifiable: things people
                can use immediately, delivered through local partners, with
                updates you can actually see.
              </p>

              <div
                className="grid sm:grid-cols-3 gap-4"
                style={{ borderTop: `2px solid ${colors.ink}`, paddingTop: 14 }}
              >
                {[
                  [
                    "Simple actions",
                    "You don’t need a big donation to help. A purchase can do real work.",
                    Sparkles,
                  ],
                  [
                    "Direct + local",
                    "We work with partners inside the city so support lands where it should.",
                    Users,
                  ],
                  [
                    "Proof-first",
                    "We share clear updates so trust comes from evidence, not promises.",
                    ShieldCheck,
                  ],
                ].map(([t, d, Icon]: any) => (
                  <div key={t} className="min-w-0">
                    <div className="font-black flex items-center gap-2">
                      <Icon size={18} />
                      {t}
                    </div>
                    <div
                      className="mt-2 text-sm"
                      style={{ color: colors.muted }}
                    >
                      {d}
                    </div>
                  </div>
                ))}
              </div>

              <div
                className="grid sm:grid-cols-2 gap-6"
                style={{ borderTop: `2px solid ${colors.ink}`, paddingTop: 14 }}
              >
                {[
                  [
                    "What we fund",
                    "Practical support: essential goods and needs that improve daily life quickly (just like socks).",
                  ],
                  [
                    "How we choose",
                    "Needs are identified locally. The goal is usefulness, not aesthetics or hype.",
                  ],
                  [
                    "What we won’t do",
                    "No vague claims. No poverty-as-marketing. No “we helped somewhere” without details.",
                  ],
                  [
                    "What growth looks like",
                    "We expand carefully, only if we can stay transparent and keep impact real.",
                  ],
                ].map(([t, d], idx) => (
                  <div
                    key={t}
                    data-reveal
                    className="reveal"
                    style={{
                      borderTop: `2px solid ${colors.ink}`,
                      paddingTop: 14,
                      transitionDelay: `${120 + idx * 80}ms`,
                    }}
                  >
                    <div className="font-black text-xl flex items-center gap-2">
                      <SockIcon size={22} color={colors.ink} />
                      {t}
                    </div>
                    <div className="mt-2" style={{ color: colors.muted }}>
                      {d}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </RoughBorder>
        </div>

        {/* RIGHT */}
        <div className="md:col-span-5">
          <RoughBorder
            bg={colors.sand}
            rotate={-0.3}
            label="Where the help goes"
            delay={140}
          >
            <div className="flex items-start gap-3">
              <MapPin />
              <div>
                <div className="font-black">Santa Terezinha, Paraíba</div>
                <div style={{ color: colors.muted }}>
                  Brazil • sertão region
                </div>
              </div>
            </div>

            <div
              className="mt-6 border-2 border-black p-4"
              style={{
                background: colors.paper,
                boxShadow: `3px 3px 0 ${colors.ink}`,
              }}
            >
              <div className="font-black flex items-center gap-2">
                <SockIcon size={18} color={colors.ink} />
                Transparency promise
              </div>
              <div className="mt-2 text-sm" style={{ color: colors.muted }}>
                We’ll publish simple, real updates: what was funded, where it
                went, and proof from local partners. If something takes longer
                than expected, we’ll say that too.
              </div>

              <div
                className="mt-5"
                style={{ borderTop: `2px solid ${colors.ink}`, paddingTop: 14 }}
              >
                <div className="font-black">What you’ll see here</div>
                <ul
                  className="mt-2 text-sm list-disc pl-5"
                  style={{ color: colors.muted }}
                >
                  <li>Photos from deliveries (with respect and consent)</li>
                  <li>Short written updates (no fluff)</li>
                  <li>Receipts / counts when it makes sense</li>
                </ul>
              </div>
            </div>

            {/* PHOTO CARD */}
            <div
              className="mt-6 border-2 border-black p-4"
              style={{
                background: colors.paper,
                boxShadow: `3px 3px 0 ${colors.ink}`,
              }}
            >
              <div className="font-black flex items-center gap-2">
                <SockIcon size={18} color={colors.ink} />
                Santa Terezinha
              </div>

              <div className="mt-2 text-sm" style={{ color: colors.muted }}>
                Real photo from the Santa Terezinha community.
              </div>

              {/* clickable preview */}
              <button
                type="button"
                onClick={() => setPhotoOpen(true)}
                className="mt-4 w-full border-2 border-black relative overflow-hidden group"
                style={{ cursor: "pointer" }}
                aria-label="Open Santa Terezinha photo"
              >
                <div className="h-40 relative">
                  <Image
                    src="/SantaTerezinha01.png"
                    alt="Santa Terezinha community"
                    fill
                    className="object-cover transition-transform group-hover:scale-[1.02]"
                    priority
                  />
                </div>

                {/* small hint overlay */}
                <div
                  className="absolute inset-0 flex items-end justify-end p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ pointerEvents: "none" }}
                >
                  <span
                    className="text-xs font-black uppercase tracking-widest border-2 border-black px-2 py-1"
                    style={{ background: colors.paper, color: colors.ink }}
                  >
                    Click to expand
                  </span>
                </div>
              </button>
            </div>
          </RoughBorder>
        </div>
      </div>

      {/* PHOTO MODAL */}
      {photoOpen && (
        <div
          className="fixed inset-0 z-[80] bg-black/70 flex items-center justify-center p-4"
          onMouseDown={(e) => {
            // click outside closes
            if (e.target === e.currentTarget) setPhotoOpen(false)
          }}
        >
          <div
            className="w-full max-w-5xl reveal is-in"
            style={{
              background: colors.paper,
              border: `2px solid ${colors.ink}`,
              boxShadow: `6px 6px 0 ${colors.ink}`,
            }}
          >
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{
                background: colors.sand,
                borderBottom: `2px solid ${colors.ink}`,
              }}
            >
              <div className="text-sm font-black uppercase tracking-widest">
                Santa Terezinha • full photo
              </div>

              <button
                className="btnInk p-2"
                style={{
                  border: `2px solid ${colors.ink}`,
                  background: colors.paper,
                  color: colors.ink,
                  cursor: "pointer",
                }}
                onClick={() => setPhotoOpen(false)}
                aria-label="Close photo"
              >
                <X size={18} />
              </button>
            </div>

            {/* Full image */}
            <div
              className="relative w-full"
              style={{ borderBottom: `2px solid ${colors.ink}` }}
            >
              <div className="relative w-full aspect-[16/9] bg-black">
                <Image
                  src="/SantaTerezinha01.png"
                  alt="Santa Terezinha community full photo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>

            <div className="px-4 py-4">
              <HandButton variant="solid" onClick={() => setPhotoOpen(false)}>
                Back <ArrowRight size={18} />
              </HandButton>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
