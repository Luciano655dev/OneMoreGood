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
  const INTRO_VIDEO_URL = "/Instagram Photo Download.mp4"
  const INTRO_VIDEO_POSTER = "/Instagram Photo Download (5).jpg"

  const [videoOpen, setVideoOpen] = useState(false)
  const router = useRouter()

  return (
    <main id="top" className="relative">
      <section className="max-w-7xl mx-auto px-6 pt-12 md:pt-16 pb-10">
        <div className="grid md:grid-cols-12 gap-8 items-start">
          <div className="md:col-span-7">
            <div data-reveal className="reveal hidden md:flex flex-wrap gap-2">
              <StampChip icon={ShieldCheck} text="Fundraising organization" />
              <StampChip
                icon={Users}
                text="Instituto Semear"
                tone={colors.paper}
              />
              <StampChip icon={Sparkles} text="Santa Terezinha, PE" />
            </div>

            <h1
              data-reveal
              className="reveal mt-6 text-5xl md:text-6xl font-black leading-[0.98] tracking-tight"
            >
              Make{" "}
              <span style={{ color: colors.clay }}>
                One More Good <br />
              </span>
              Happen
            </h1>

            <div data-reveal className="reveal mt-2">
              <Scribble color={colors.ink} />
            </div>

            <p
              data-reveal
              className="reveal mt-6 text-lg leading-relaxed max-w-2xl"
              style={{ color: colors.muted }}
            >
              OneMoreGood is a fundraising organization that sells fun socks to
              help nonprofits improve their operations. Right now, every sale
              supports Instituto Educacional Semear in Santa Terezinha,
              Pernambuco, helping strengthen the resources and opportunities
              they provide for local children and families.
            </p>

            <div data-reveal className="reveal mt-8 flex flex-wrap gap-3">
              <HandButton variant="solid" onClick={() => router.push("/shop")}>
                Fundraise / support <ArrowRight size={18} />
              </HandButton>
              <HandButton variant="ghost" onClick={() => setVideoOpen(true)}>
                Watch intro video <Play size={18} />
              </HandButton>
            </div>

            <StitchRule />

            <div
              data-reveal
              className="reveal grid sm:grid-cols-3 gap-4 text-sm"
            >
              {[
                ["OneMoreGood raises funds", "We turn product sales into partner support."],
                ["Instituto Semear receives support", "Current featured nonprofit in Santa Terezinha."],
                ["Operations can improve", "Funds can help structure, supplies, and local capacity."],
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
                A local video update showing the project environment and the
                day-to-day community context in Santa Terezinha.
              </p>

              <div
                className="mt-5 border-2 border-black"
                style={{
                  background: colors.paper,
                  boxShadow: `3px 3px 0 ${colors.ink}`,
                }}
              >
                <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
                  <video
                    className="absolute inset-0 h-full w-full object-cover opacity-80"
                    src={INTRO_VIDEO_URL}
                    poster={INTRO_VIDEO_POSTER}
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
                Featured partner • Brazil
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
            <div className="bg-black flex justify-center">
              <video
                className="w-full max-h-[80vh]"
                src={INTRO_VIDEO_URL}
                poster={INTRO_VIDEO_POSTER}
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
    </main>
  )
}
