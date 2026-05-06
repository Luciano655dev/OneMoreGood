"use client"

import { useEffect, useState } from "react"
import { X, ArrowRight } from "lucide-react"

import RoughBorder from "../Objects/RoughBorder"
import SectionTitle from "../Objects/SectionTitle"
import HandButton from "../Objects/HandButton"
import ProgressiveImage from "../Objects/ProgressiveImage"
import colors from "@/components/colors"

export default function Impact() {
  const photos = [
    {
      src: "/community/photos/Instagram Downloaded Photo (2).jpg",
      alt: "Community photo from Santa Terezinha",
    },
    {
      src: "/community/photos/Instagram Photo Download.jpg",
      alt: "Children and families in Santa Terezinha",
    },
    {
      src: "/community/photos/Instagram Downloaded Photo.jpg",
      alt: "Project activity in the community",
    },
    {
      src: "/community/photos/SnapInsta.to_429582745_233489003092030_8040928632059551510_n.jpg",
      alt: "Supporters and local community moment",
    },
  ]

  const [openSrc, setOpenSrc] = useState<string | null>(null)
  const isOpen = !!openSrc

  // Close on ESC
  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenSrc(null)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [isOpen])

  return (
    <section id="impact" className="max-w-7xl mx-auto px-6 py-14">
      <SectionTitle
        kicker="Impact"
        title="Why purpose matters in ecommerce"
        desc="The goal is to build a healthy online store that still feels human, specific, and connected to a real place."
      />

      <div className="mt-10 grid md:grid-cols-12 gap-8 items-start">
        {/* LEFT */}
        <div className="md:col-span-6">
          <RoughBorder
            bg={colors.paper}
            rotate={0}
            label="Impact expected"
            delay={60}
          >
            <ul className="space-y-4" style={{ color: colors.muted }}>
              {[
                [
                  "Stronger brand identity",
                  "A store with real-world context is easier to remember than another generic product grid with no point of view.",
                ],
                [
                  "More meaningful storytelling",
                  "Photos, video, and local context make the brand feel lived-in and specific instead of abstract.",
                ],
                [
                  "Clear customer expectations",
                  "Customers understand they are shopping in a normal ecommerce flow with products, prices, shipping, and service.",
                ],
                [
                  "Room for thoughtful partnerships",
                  "A clear commercial model creates space for collaborations, featured stories, and future product drops without muddying the offer.",
                ],
                [
                  "Direct accountability",
                  "OneMoreGood can keep showing the context behind the brand so customers can judge the story by what they actually see.",
                ],
              ].map(([t, d], idx) => (
                <li
                  key={t}
                  data-reveal
                  className="reveal"
                  style={{
                    borderTop: `2px solid ${colors.ink}`,
                    paddingTop: 12,
                    transitionDelay: `${120 + idx * 90}ms`,
                  }}
                >
                  <div className="font-black" style={{ color: colors.ink }}>
                    → {t}
                  </div>
                  <div className="mt-1 text-sm" style={{ color: colors.muted }}>
                    {d}
                  </div>
                </li>
              ))}
            </ul>

            <div
              className="mt-6 text-sm"
              style={{
                borderTop: `2px solid ${colors.ink}`,
                paddingTop: 12,
                color: colors.muted,
              }}
            >
              Sustainability is planned through product sales, thoughtful
              pricing, repeat customers, strategic collaborations, and an
              online retail operation that keeps the brand commercially clear
              while still carrying a visible purpose.
            </div>
          </RoughBorder>
        </div>

        {/* RIGHT */}
        <div className="md:col-span-6">
          <RoughBorder
            bg={colors.sand}
            rotate={0}
            label="Community context"
            delay={140}
          >
            <div style={{ color: colors.muted }}>
              These photos illustrate the local context around Instituto
              Semear and the broader environment that shapes OneMoreGood&apos;s
              perspective as a purpose-led ecommerce brand.
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4">
              {photos.map((p) => (
                <button
                  key={p.src}
                  type="button"
                  onClick={() => setOpenSrc(p.src)}
                  className="border-2 border-black h-40 relative overflow-hidden group"
                  style={{
                    background: colors.paper,
                    boxShadow: `2px 2px 0 ${colors.ink}`,
                    cursor: "pointer",
                  }}
                  aria-label="Open photo"
                >
                  <ProgressiveImage
                    src={p.src}
                    alt={p.alt}
                    fill
                    className="object-cover transition-transform group-hover:scale-[1.02]"
                    sizes="(min-width: 768px) 300px, 50vw"
                  />
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
              ))}
            </div>

            <div
              className="mt-5 text-xs font-black uppercase tracking-widest"
              style={{ color: colors.muted }}
            >
              Context • dignity • accountability
            </div>
          </RoughBorder>
        </div>
      </div>

      {/* PHOTO MODAL */}
      {openSrc && (
        <div
          className="fixed inset-0 z-[80] bg-black/70 flex items-center justify-center p-4"
          onMouseDown={(e) => {
            // click outside closes
            if (e.target === e.currentTarget) setOpenSrc(null)
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
                onClick={() => setOpenSrc(null)}
                aria-label="Close photo"
              >
                <X size={18} />
              </button>
            </div>

            <div
              className="relative w-full"
              style={{ borderBottom: `2px solid ${colors.ink}` }}
            >
              <div className="relative w-full aspect-[16/9] bg-black">
                <ProgressiveImage
                  src={openSrc}
                  alt="Full community photo"
                  fill
                  className="object-contain"
                  sizes="(min-width: 1024px) 1024px, 100vw"
                  priority
                />
              </div>
            </div>

            <div className="px-4 py-4">
              <HandButton variant="solid" onClick={() => setOpenSrc(null)}>
                Back <ArrowRight size={18} />
              </HandButton>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
