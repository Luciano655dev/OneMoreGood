"use client"

import { useEffect, useRef, useState } from "react"
import {
  ArrowRight,
  Check,
  GraduationCap,
  HeartHandshake,
  Maximize2,
  School,
  X,
} from "lucide-react"
import { useRouter } from "next/navigation"

import { useSiteLocale } from "@/app/hooks/useSiteLocale"
import colors from "@/components/colors"
import HandButton from "@/components/Home/Objects/HandButton"
import ProgressiveImage from "@/components/Home/Objects/ProgressiveImage"
import RoughBorder from "@/components/Home/Objects/RoughBorder"
import StampChip from "@/components/Home/Objects/StampChip"

const campaignPhotos = [
  "/community/photos/Instagram Photo from SnapInsta (1).jpg",
  "/community/photos/Instagram Downloaded Photo (2).jpg",
  "/community/photos/Instagram Photo Download (4).jpg",
] as const

type OpenPhoto = {
  src: string
  alt: string
}

export default function CampaignThankYouHero() {
  const router = useRouter()
  const { t } = useSiteLocale()
  const copy = t.home.campaignThankYou
  const [openPhoto, setOpenPhoto] = useState<OpenPhoto | null>(null)
  const openerRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (!openPhoto) return

    const previousOverflow = document.body.style.overflow
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return

      setOpenPhoto(null)
      requestAnimationFrame(() => openerRef.current?.focus())
    }

    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [openPhoto])

  function showPhoto(photo: OpenPhoto, opener: HTMLButtonElement) {
    openerRef.current = opener
    setOpenPhoto(photo)
  }

  function closePhoto() {
    setOpenPhoto(null)
    requestAnimationFrame(() => openerRef.current?.focus())
  }

  return (
    <section
      className="relative overflow-hidden"
      style={{
        background: colors.sand,
        borderBottom: `2px solid ${colors.ink}`,
      }}
    >
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-30 blur-3xl"
        style={{ background: colors.clay }}
        aria-hidden="true"
      />

      <div className="relative mx-auto grid max-w-7xl gap-10 px-6 py-14 lg:grid-cols-12 lg:items-center lg:py-20">
        <div className="lg:col-span-6">
          <div data-reveal className="reveal flex flex-wrap gap-2">
            <StampChip icon={Check} text={copy.chips[0]} />
            <StampChip icon={HeartHandshake} text={copy.chips[1]} tone={colors.paper} />
            <StampChip icon={School} text={copy.chips[2]} />
          </div>

          <div
            data-reveal
            className="reveal mt-7 text-xs font-black uppercase tracking-[0.22em]"
            style={{ color: colors.muted }}
          >
            {copy.kicker}
          </div>

          <h1
            data-reveal
            className="reveal mt-4 max-w-3xl text-5xl font-black leading-[0.95] tracking-tight md:text-7xl"
          >
            {copy.headline}{" "}
            <span style={{ color: colors.clay }}>{copy.headlineAccent}</span>
          </h1>

          <p
            data-reveal
            className="reveal mt-6 max-w-2xl text-lg font-semibold leading-relaxed md:text-xl"
            style={{ color: colors.muted }}
          >
            {copy.intro}
          </p>

          <div
            data-reveal
            className="reveal mt-7 border-l-4 pl-5 text-base leading-relaxed"
            style={{ borderColor: colors.clay, color: colors.muted }}
          >
            <strong style={{ color: colors.ink }}>{copy.impactLead}</strong>{" "}
            {copy.impactText}
          </div>

          <div data-reveal className="reveal mt-8 flex flex-wrap gap-3">
            <HandButton
              variant="solid"
              onClick={() => router.push("/collaborations")}
            >
              {copy.seeImpact} <ArrowRight size={18} />
            </HandButton>
            <HandButton
              variant="ghost"
              onClick={() => {
                document
                  .getElementById("who-we-help")
                  ?.scrollIntoView({ behavior: "smooth" })
              }}
            >
              {copy.meetSemear} <GraduationCap size={18} />
            </HandButton>
          </div>

          <div
            data-reveal
            className="reveal mt-9 grid grid-cols-3 gap-3 border-t-2 pt-6"
            style={{ borderColor: colors.ink }}
          >
            {copy.stats.map(([value, label]) => (
              <div key={value}>
                <div
                  className="text-2xl font-black leading-none md:text-3xl"
                  style={{ color: colors.clay }}
                >
                  {value}
                </div>
                <div className="mt-2 text-xs font-bold md:text-sm" style={{ color: colors.muted }}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-6">
          <RoughBorder bg={colors.paper} label={copy.photoLabel} delay={100}>
            <button
              type="button"
              onClick={(event) =>
                showPhoto(
                  { src: campaignPhotos[0], alt: copy.photoAlts[0] },
                  event.currentTarget
                )
              }
              className="group relative block aspect-[5/4] w-full overflow-hidden border-2 border-black focus-visible:outline-4 focus-visible:outline-offset-4"
              style={{ background: colors.sand }}
              aria-label={`${copy.openPhoto}: ${copy.photoAlts[0]}`}
            >
              <ProgressiveImage
                src={campaignPhotos[0]}
                alt={copy.photoAlts[0]}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover group-hover:scale-[1.025] group-focus-visible:scale-[1.025]"
              />
              <span
                className="absolute right-3 top-3 inline-flex items-center gap-2 border-2 border-black px-3 py-2 text-xs font-black uppercase tracking-widest opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
                style={{ background: colors.paper, color: colors.ink }}
              >
                <Maximize2 size={14} /> {copy.expandPhoto}
              </span>
              <span
                className="absolute bottom-3 left-3 border-2 border-black px-3 py-2 text-left text-xs font-black uppercase tracking-widest"
                style={{ background: colors.paper, color: colors.ink }}
              >
                {copy.mainPhotoCaption}
              </span>
            </button>

            <div className="mt-4 grid grid-cols-2 gap-4">
              {campaignPhotos.slice(1).map((src, index) => {
                const photoIndex = index + 1

                return (
                  <button
                    key={src}
                    type="button"
                    onClick={(event) =>
                      showPhoto(
                        { src, alt: copy.photoAlts[photoIndex] },
                        event.currentTarget
                      )
                    }
                    className="group relative aspect-[4/3] overflow-hidden border-2 border-black focus-visible:outline-4 focus-visible:outline-offset-4"
                    style={{ background: colors.sand }}
                    aria-label={`${copy.openPhoto}: ${copy.photoAlts[photoIndex]}`}
                  >
                    <ProgressiveImage
                      src={src}
                      alt={copy.photoAlts[photoIndex]}
                      fill
                      sizes="(max-width: 768px) 50vw, 300px"
                      className="object-cover group-hover:scale-[1.04] group-focus-visible:scale-[1.04]"
                    />
                    <span
                      className="absolute inset-0 flex items-end justify-end bg-black/10 p-2 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
                      aria-hidden="true"
                    >
                      <span
                        className="inline-flex items-center gap-1 border-2 border-black px-2 py-1 text-xs font-black uppercase tracking-widest"
                        style={{ background: colors.paper, color: colors.ink }}
                      >
                        <Maximize2 size={13} /> {copy.expandPhoto}
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>
          </RoughBorder>
        </div>
      </div>

      {openPhoto ? (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/75 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closePhoto()
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="campaign-photo-title"
        >
          <div
            className="reveal is-in w-full max-w-5xl"
            style={{
              background: colors.paper,
              border: `2px solid ${colors.ink}`,
              boxShadow: `6px 6px 0 ${colors.ink}`,
            }}
          >
            <div
              className="flex items-center justify-between gap-4 px-4 py-3"
              style={{
                background: colors.sand,
                borderBottom: `2px solid ${colors.ink}`,
              }}
            >
              <div
                id="campaign-photo-title"
                className="text-sm font-black uppercase tracking-widest"
              >
                {copy.modalTitle}
              </div>
              <button
                type="button"
                onClick={closePhoto}
                autoFocus
                className="btnInk p-2 focus-visible:outline-4 focus-visible:outline-offset-2"
                style={{
                  border: `2px solid ${colors.ink}`,
                  background: colors.paper,
                  color: colors.ink,
                }}
                aria-label={copy.closePhoto}
              >
                <X size={18} />
              </button>
            </div>

            <div className="relative aspect-[16/9] w-full bg-black">
              <ProgressiveImage
                src={openPhoto.src}
                alt={openPhoto.alt}
                fill
                priority
                sizes="(min-width: 1024px) 1024px, 100vw"
                className="object-contain"
              />
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}
