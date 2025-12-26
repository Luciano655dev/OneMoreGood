"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Users, ArrowRight, X, Play, Sparkles, ShieldCheck } from "lucide-react"
import StampChip from "../Objects/StampChip"
import Scribble from "../Objects/Scribble"
import HandButton from "../Objects/HandButton"
import StitchRule from "../Objects/StitchRule"
import RoughBorder from "../Objects/RoughBorder"
import colors from "@/components/colors"

export default function Hero() {
  const VIDEO_ID = "unnWr7yrfZM"
  const MAYOR_VIDEO_URL = `https://www.youtube.com/embed/${VIDEO_ID}`
  const THUMBNAIL = `https://img.youtube.com/vi/${VIDEO_ID}/maxresdefault.jpg`

  const [videoOpen, setVideoOpen] = useState(false)
  const router = useRouter()

  return (
    <main id="top" className="relative">
      <section className="max-w-7xl mx-auto px-6 pt-12 md:pt-16 pb-10">
        <div className="grid md:grid-cols-12 gap-8 items-start">
          <div className="md:col-span-7">
            <div data-reveal className="reveal hidden md:flex flex-wrap gap-2">
              <StampChip icon={ShieldCheck} text="Transparent" />
              <StampChip
                icon={Users}
                text="Local partners"
                tone={colors.paper}
              />
              <StampChip icon={Sparkles} text="Every purchase helps" />
            </div>

            <h1
              data-reveal
              className="reveal mt-6 text-5xl md:text-6xl font-black leading-[0.98] tracking-tight"
            >
              Make <span style={{ color: colors.clay }}>One More Good</span>{" "}
              happen.
            </h1>

            <div data-reveal className="reveal mt-2">
              <Scribble color={colors.ink} />
            </div>

            <p
              data-reveal
              className="reveal mt-6 text-lg leading-relaxed max-w-2xl"
              style={{ color: colors.muted }}
            >
              OneMoreGood turns everyday purchases into real help for families
              in Santa Terezinha, Paraíba. We keep it simple, direct, and
              honest, with proof you can watch.
            </p>

            <div data-reveal className="reveal mt-8 flex flex-wrap gap-3">
              <HandButton variant="solid" onClick={() => router.push("/shop")}>
                Shop <ArrowRight size={18} />
              </HandButton>
              <HandButton variant="ghost" onClick={() => setVideoOpen(true)}>
                Watch the proof <Play size={18} />
              </HandButton>
            </div>

            <StitchRule />

            <div
              data-reveal
              className="reveal grid sm:grid-cols-3 gap-4 text-sm"
            >
              {[
                ["Proof over promises", "See where it goes."],
                ["Direct and local", "Partners inside the city."],
                ["Simple impact", "Buy something, do good."],
              ].map(([t, d]) => (
                <div key={t}>
                  <div className="font-black">{t}</div>
                  <div style={{ color: colors.muted }}>{d}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-5">
            <RoughBorder
              bg={colors.sand}
              rotate={-0.6}
              label="Featured proof"
              delay={120}
            >
              <div className="text-2xl font-black">Local walkthrough</div>
              <p
                className="mt-2 text-sm leading-relaxed"
                style={{ color: colors.muted }}
              >
                A quick, real look at how OneMoreGood works on the ground.
              </p>

              <div
                className="mt-5 border-2 border-black"
                style={{
                  background: colors.paper,
                  boxShadow: `3px 3px 0 ${colors.ink}`,
                }}
              >
                <div
                  className="aspect-video flex items-center justify-center bg-center bg-cover"
                  style={{
                    backgroundImage: `url(${THUMBNAIL})`,
                  }}
                >
                  <button
                    onClick={() => setVideoOpen(true)}
                    className="btnInk border-2 border-black text-white px-5 py-3 font-black uppercase tracking-wider inline-flex items-center gap-2"
                    style={{ background: colors.accent, cursor: "pointer" }}
                  >
                    <Play size={18} />
                    Play video
                  </button>
                </div>
              </div>

              <div
                className="mt-5 text-xs font-black uppercase tracking-widest"
                style={{ color: colors.muted }}
              >
                Santa Terezinha • Paraíba
              </div>
            </RoughBorder>
          </div>
        </div>
      </section>

      {/* VIDEO MODAL */}
      {videoOpen && (
        <div className="fixed inset-0 z-[80] bg-black/70 flex items-center justify-center p-4">
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
              >
                <X size={18} />
              </button>
            </div>
            <div className="aspect-video bg-black">
              <iframe
                className="w-full h-full"
                src={MAYOR_VIDEO_URL}
                title="Proof video"
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
    </main>
  )
}
