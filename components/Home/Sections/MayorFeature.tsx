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
} from "lucide-react"
import { useRouter } from "next/navigation"

import HandButton from "../Objects/HandButton"
import SectionTitle from "../Objects/SectionTitle"
import RoughBorder from "../Objects/RoughBorder"

export default function MayorFeature() {
  const VIDEO_ID = "unnWr7yrfZM"
  const MAYOR_VIDEO_URL = `https://www.youtube.com/embed/${VIDEO_ID}`
  const THUMBNAIL = `https://img.youtube.com/vi/${VIDEO_ID}/maxresdefault.jpg`

  const router = useRouter()
  const [videoOpen, setVideoOpen] = useState(false)

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
          kicker="Transparency"
          title="Proof you can watch"
          desc="OneMoreGood is built on evidence, not marketing. This local walkthrough shows where support goes and how it lands."
        />

        <div className="mt-10 grid md:grid-cols-12 gap-8 items-start">
          {/* LEFT */}
          <div className="md:col-span-8">
            <RoughBorder
              bg={colors.paper}
              rotate={0.2}
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
                <div
                  className="aspect-video flex items-center justify-center bg-center bg-cover"
                  style={{ backgroundImage: `url(${THUMBNAIL})` }}
                >
                  <button
                    onClick={() => setVideoOpen(true)}
                    className="btnInk border-2 border-black text-white px-5 py-3 font-black uppercase tracking-wider inline-flex items-center gap-2"
                    style={{ background: colors.accent, cursor: "pointer" }}
                    aria-label="Play video"
                  >
                    <Play size={18} />
                    Play video
                  </button>
                </div>
              </div>

              <div className="mt-6 grid sm:grid-cols-3 gap-4 text-sm">
                {[
                  [
                    "What you’ll see",
                    "The community, the needs, and what support looks like in real life.",
                    ShieldCheck,
                  ],
                  [
                    "Where it happens",
                    "Santa Terezinha, Paraíba, delivered through local partners.",
                    MapPin,
                  ],
                  [
                    "Why it matters",
                    "Trust comes from proof. Anyone can verify this later.",
                    ShieldCheck,
                  ],
                ].map(([t, d, Icon]: any) => (
                  <div key={t}>
                    <div className="font-black flex items-center gap-2">
                      <Icon size={16} />
                      {t}
                    </div>
                    <div className="mt-1" style={{ color: colors.muted }}>
                      {d}
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
              rotate={-0.2}
              label="Do something"
              delay={160}
            >
              <div className="grid gap-3">
                <HandButton
                  variant="solid"
                  onClick={() => router.push("/shop")}
                >
                  Shop to support <ShoppingBag size={18} />
                </HandButton>

                <HandButton
                  variant="ghost"
                  onClick={() => (window.location.hash = "#contact")}
                >
                  Partner / volunteer <Users size={18} />
                </HandButton>
              </div>

              <div className="mt-6 text-sm" style={{ color: colors.muted }}>
                We keep this video permanent so the story stays verifiable, not
                just a one-time campaign.
                <br />
                <br />
                This is NOT the partner video yet, as the official video will
                only be recorded in 2026.
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

            <div className="aspect-video bg-black">
              <iframe
                className="w-full h-full"
                src={MAYOR_VIDEO_URL}
                title="OneMoreGood local walkthrough"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
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
