"use client"

import { useEffect, useState } from "react"
import colors from "@/components/colors"

import {
  ShoppingBag,
  Users,
  ShieldCheck,
  MapPin,
  X,
  Play,
  ArrowRight,
  type LucideIcon,
} from "lucide-react"
import { useRouter } from "next/navigation"

import HandButton from "../Objects/HandButton"
import SectionTitle from "../Objects/SectionTitle"
import RoughBorder from "../Objects/RoughBorder"

export default function MayorFeature() {
  const LOCAL_VIDEO_URL =
    "/community/videos/SnapInsta.to_AQN2ocmLoqPbaZ5m8X33axudFj0rcjHijbJcQDbFP5yH96cOgZmQqr59xlzE2aisErPQpvD1WXoA4_67xt5uzByUitIBo0DJM02yJr4.mp4"
  const LOCAL_VIDEO_POSTER =
    "/community/photos/Instagram Photo Download (4).jpg"

  const router = useRouter()
  const [videoOpen, setVideoOpen] = useState(false)
  const highlights: Array<{ title: string; desc: string; Icon: LucideIcon }> =
    [
      {
        title: "What you’ll see",
        desc: "The store, the local setting, and the context that gives OneMoreGood its point of view.",
        Icon: ShieldCheck,
      },
      {
        title: "Where it happens",
        desc: "Santa Terezinha, Pernambuco, where Instituto Semear is based.",
        Icon: MapPin,
      },
      {
        title: "Why it matters",
        desc: "A purpose-led store feels stronger when customers can see the people and place behind the brand instead of only the product cards.",
        Icon: ShieldCheck,
      },
    ]

  // Close on ESC
  useEffect(() => {
    if (!videoOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setVideoOpen(false)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [videoOpen])

  return (
    <section
      id="mayor"
      style={{
        background: colors.sand,
        borderTop: `2px solid ${colors.ink}`,
        borderBottom: `2px solid ${colors.ink}`,
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-14">
        <SectionTitle
          kicker="Context"
          title="See the purpose and the context"
          desc="This page shows the people, place, and local connection that give OneMoreGood more meaning than generic ecommerce."
        />

        <div className="mt-10 grid md:grid-cols-12 gap-8 items-start">
          {/* LEFT */}
          <div className="md:col-span-8">
            <RoughBorder
              bg={colors.paper}
              rotate={0}
              label="Local video"
              delay={80}
            >
              {/* Preview card (opens modal) */}
              <div
                className="mt-1 border-2 border-black"
                style={{
                  background: colors.paper,
                  boxShadow: `4px 4px 0 ${colors.ink}`,
                }}
              >
                <div className="relative aspect-video flex items-center justify-center bg-black overflow-hidden">
                  <video
                    className="absolute inset-0 h-full w-full object-cover opacity-80"
                    src={LOCAL_VIDEO_URL}
                    poster={LOCAL_VIDEO_POSTER}
                    autoPlay
                    muted
                    loop
                    playsInline
                  />
                  <button
                    onClick={() => setVideoOpen(true)}
                    className="btnInk border-2 border-black text-white px-5 py-3 font-black uppercase tracking-wider inline-flex items-center gap-2"
                    style={{
                      background: colors.accent,
                      cursor: "pointer",
                      zIndex: 1,
                    }}
                    aria-label="Play video"
                  >
                    <Play size={18} />
                    Play video
                  </button>
                </div>
              </div>

              <div className="mt-6 grid sm:grid-cols-3 gap-4 text-sm">
                {highlights.map(({ title, desc, Icon }) => (
                  <div key={title}>
                    <div className="font-black flex items-center gap-2">
                      <Icon size={16} />
                      {title}
                    </div>
                    <div className="mt-1" style={{ color: colors.muted }}>
                      {desc}
                    </div>
                  </div>
                ))}
              </div>
            </RoughBorder>
          </div>

          {/* RIGHT */}
          <div className="md:col-span-4">
            <RoughBorder
              bg={colors.paper}
              rotate={0}
              label="Do something"
              delay={160}
            >
              <div className="grid gap-3">
                <HandButton
                  variant="solid"
                  onClick={() => router.push("/shop")}
                >
                  Shop products <ShoppingBag size={18} />
                </HandButton>

                <HandButton
                  variant="ghost"
                  onClick={() => router.push("/about")}
                >
                  About us <ArrowRight size={18} />
                </HandButton>

                <HandButton
                  variant="ghost"
                  onClick={() => (window.location.hash = "#contact")}
                >
                  Partner / volunteer <Users size={18} />
                </HandButton>
              </div>

              <div className="mt-6 text-sm" style={{ color: colors.muted }}>
                OneMoreGood is the store. Instituto Educacional Semear is part
                of the local context that keeps the brand specific, grounded,
                and connected to a real place.
                <br />
                <br />
                If you want to discuss orders, wholesale, collaborations,
                product ideas, or the brand story, contact us through GitHub or
                email.
              </div>

              <div
                className="mt-5 text-xs font-black uppercase tracking-widest"
                style={{ color: colors.muted }}
              >
                Proof over promises • always
              </div>
            </RoughBorder>
          </div>
        </div>
      </div>

      {/* VIDEO MODAL (same behavior as Hero) */}
      {videoOpen && (
        <div
          className="fixed inset-0 z-[80] bg-black/70 flex items-center justify-center p-4"
          onMouseDown={(e) => {
            // click outside closes
            if (e.target === e.currentTarget) setVideoOpen(false)
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
                Proof video • full transparency
              </div>

              <button
                className="btnInk p-2"
                style={{
                  border: `2px solid ${colors.ink}`,
                  background: colors.paper,
                  color: colors.ink,
                  cursor: "pointer",
                }}
                onClick={() => setVideoOpen(false)}
                aria-label="Close video"
              >
                <X size={18} />
              </button>
            </div>

            <div className="bg-black flex justify-center">
              <video
                className="w-full max-h-[80vh]"
                src={LOCAL_VIDEO_URL}
                poster={LOCAL_VIDEO_POSTER}
                controls
                autoPlay
                playsInline
              />
            </div>

            <div
              className="px-4 py-4"
              style={{ borderTop: `2px solid ${colors.ink}` }}
            >
              <HandButton variant="solid" onClick={() => setVideoOpen(false)}>
                Back <ArrowRight size={18} />
              </HandButton>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
