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

import SectionTitle from "../Objects/SectionTitle"
import RoughBorder from "../Objects/RoughBorder"
import SockIcon from "../Objects/SockIcon"
import HandButton from "../Objects/HandButton"
import ProgressiveImage from "../Objects/ProgressiveImage"
import colors from "@/components/colors"

export default function About() {
  const [photoOpen, setPhotoOpen] = useState(false)
  const COMMUNITY_IMAGE = "/Instagram Photo from SnapInsta (1).jpg"

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
        title="Who we are"
        desc="OneMoreGood raises money for nonprofit partners. Instituto Educacional Semear is the first organization currently being supported."
      />

      <div className="mt-10 grid md:grid-cols-12 gap-8 items-start">
        {/* LEFT */}
        <div className="md:col-span-7">
          <RoughBorder
            bg={colors.paper}
            rotate={0.4}
            label="Quem Somos"
            delay={60}
          >
            <div className="space-y-6">
              <p
                className="text-sm leading-relaxed"
                style={{ color: colors.muted }}
              >
                OneMoreGood exists to help nonprofits raise money in a simple,
                transparent way through product sales. Instead of operating the
                programs ourselves, we direct fundraising energy toward partner
                organizations already doing the frontline work in their
                communities.
              </p>

              <p
                className="text-sm leading-relaxed"
                style={{ color: colors.muted }}
              >
                The goal is to make support easier to understand: people buy a
                product they actually like, the fundraising stays visible, and
                the partner organization gets more room to improve how it
                serves its community.
              </p>

              <div
                className="grid sm:grid-cols-3 gap-4"
                style={{ borderTop: `2px solid ${colors.ink}`, paddingTop: 14 }}
              >
                {[
                  [
                    "Mission",
                    "Raise money for trusted nonprofit partners through fun products and direct supporter relationships.",
                    Sparkles,
                  ],
                  [
                    "Vision",
                    "Build a fundraising platform that helps local nonprofits operate with more stability and reach.",
                    Users,
                  ],
                  [
                    "Values",
                    "Transparency, practical help, accountable partnerships, and respect for the communities being served.",
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
                    "How OneMoreGood works",
                    "We sell fun socks, collect support, and channel funds to partner nonprofits that need help strengthening operations.",
                  ],
                  [
                    "Current nonprofit partner",
                    "Instituto Educacional Semear in Santa Terezinha, Pernambuco, is the organization currently featured and supported.",
                  ],
                  [
                    "Why this model matters",
                    "Small organizations often need flexible fundraising they can actually use for infrastructure, materials, and day-to-day improvements.",
                  ],
                  [
                    "What comes next",
                    "As OneMoreGood grows, more nonprofit partners can be added for campaigns, fundraising collaborations, and targeted support.",
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
            <div className="flex flex-col">
              <div className="flex items-start gap-3">
                <MapPin />
                <div>
                  <div className="font-black">Santa Terezinha, Pernambuco</div>
                  <div style={{ color: colors.muted }}>
                    Sítio Bandeiras • Sertão do Pajeú • Brazil
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
                  Area of operation
                </div>
                <div className="mt-2 text-sm" style={{ color: colors.muted }}>
                  Instituto Semear is based in Santa Terezinha (PE). OneMoreGood
                  is currently fundraising with that partner as the main focus of
                  this campaign.
                </div>

                <div
                  className="mt-5"
                  style={{ borderTop: `2px solid ${colors.ink}`, paddingTop: 14 }}
                >
                  <div className="font-black">What you’ll see here</div>
                  <div className="mt-2 text-sm" style={{ color: colors.muted }}>
                    This page is organized to show:
                  </div>
                  <ul
                    className="mt-3 text-sm list-disc pl-5"
                    style={{ color: colors.muted }}
                  >
                    <li>How OneMoreGood raises money</li>
                    <li>Who Instituto Semear is and where support goes</li>
                  <li>Ways to contact us for partnerships or donations</li>
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
                  Community context
                </div>

                <div className="mt-2 text-sm" style={{ color: colors.muted }}>
                  These photos show the local context around Instituto Semear,
                  the nonprofit currently being supported through OneMoreGood.
                </div>

                {/* clickable preview */}
                <button
                  type="button"
                  onClick={() => setPhotoOpen(true)}
                  className="mt-4 w-full border-2 border-black relative overflow-hidden group"
                  style={{ cursor: "pointer" }}
                  aria-label="Open community photo"
                >
                  <div className="h-64 relative">
                    <ProgressiveImage
                      src={COMMUNITY_IMAGE}
                      alt="Community gathering in Santa Terezinha"
                      fill
                      className="object-cover transition-transform group-hover:scale-[1.02]"
                      sizes="(min-width: 768px) 420px, 100vw"
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
                Community photo • full size
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
                <ProgressiveImage
                  src={COMMUNITY_IMAGE}
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
