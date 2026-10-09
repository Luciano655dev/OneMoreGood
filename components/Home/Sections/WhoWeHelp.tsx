"use client"

import { useEffect, useRef, useState } from "react"
import {
  ArrowRight,
  HeartHandshake,
  MapPin,
  Maximize2,
  School,
  Users,
  X,
} from "lucide-react"
import { useRouter } from "next/navigation"

import { useSiteLocale } from "@/app/hooks/useSiteLocale"
import colors from "@/components/colors"
import HandButton from "@/components/Home/Objects/HandButton"
import ProgressiveImage from "@/components/Home/Objects/ProgressiveImage"
import RoughBorder from "@/components/Home/Objects/RoughBorder"
import SectionTitle from "@/components/Home/Objects/SectionTitle"

const communityPhotos = [
  "/community/photos/Instagram Downloaded Photo (2).jpg",
  "/community/photos/Instagram Photo Download.jpg",
  "/community/photos/Instagram Downloaded Photo.jpg",
] as const

const impactIcons = [School, Users, HeartHandshake] as const

type OpenPhoto = {
  src: string
  alt: string
}

export default function WhoWeHelp() {
  const router = useRouter()
  const { t } = useSiteLocale()
  const copy = t.home.whoWeHelp
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
      id="who-we-help"
      style={{
        background: colors.paper,
        borderTop: `2px solid ${colors.ink}`,
        borderBottom: `2px solid ${colors.ink}`,
      }}
    >
      <div className="mx-auto max-w-7xl px-6 py-14 md:py-18">
        <SectionTitle
          kicker={copy.kicker}
          title={copy.title}
          desc={copy.description}
        />

        <div className="mt-10 grid gap-8 lg:grid-cols-12 lg:items-stretch">
          <div className="lg:col-span-7">
            <RoughBorder
              bg={colors.sand}
              label={copy.photoLabel}
              delay={60}
              className="h-full"
            >
              <button
                type="button"
                onClick={(event) =>
                  showPhoto(
                    {
                      src: "/community/photos/Instagram Photo from SnapInsta (1).jpg",
                      alt: copy.heroImageAlt,
                    },
                    event.currentTarget
                  )
                }
                className="group relative block min-h-[340px] w-full overflow-hidden border-2 border-black text-left focus-visible:outline-4 focus-visible:outline-offset-4 md:min-h-[460px]"
                style={{
                  background: colors.paper,
                  boxShadow: `3px 3px 0 ${colors.ink}`,
                }}
                aria-label={`${copy.openPhoto}: ${copy.heroImageAlt}`}
              >
                <ProgressiveImage
                  src="/community/photos/Instagram Photo from SnapInsta (1).jpg"
                  alt={copy.heroImageAlt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 58vw"
                  className="object-cover group-hover:scale-[1.02] group-focus-visible:scale-[1.02]"
                />
                <span
                  className="absolute right-4 top-4 inline-flex items-center gap-2 border-2 border-black px-3 py-2 text-xs font-black uppercase tracking-widest opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
                  style={{ background: colors.paper, color: colors.ink }}
                >
                  <Maximize2 size={15} /> {copy.expandPhoto}
                </span>
                <div
                  className="absolute bottom-4 left-4 right-4 max-w-md p-4"
                  style={{
                    background: colors.paper,
                    border: `2px solid ${colors.ink}`,
                    boxShadow: `3px 3px 0 ${colors.ink}`,
                  }}
                >
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 shrink-0" size={20} />
                    <div>
                      <div className="font-black">{copy.locationTitle}</div>
                      <p className="mt-1 text-sm" style={{ color: colors.muted }}>
                        {copy.locationText}
                      </p>
                    </div>
                  </div>
                </div>
              </button>
            </RoughBorder>
          </div>

          <div className="grid gap-6 lg:col-span-5">
            <RoughBorder bg={colors.paper} label={copy.partnerLabel} delay={120}>
              <div className="flex items-start gap-3">
                <HeartHandshake className="mt-1 shrink-0" size={26} />
                <div>
                  <h3 className="text-2xl font-black">{copy.partnerName}</h3>
                  <p
                    className="mt-3 text-sm leading-relaxed"
                    style={{ color: colors.muted }}
                  >
                    {copy.partnerDescription}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-4">
                {copy.impactAreas.map((area, index) => {
                  const Icon = impactIcons[index]

                  return (
                    <div
                      key={area.title}
                      className="flex items-start gap-3 pt-4"
                      style={{ borderTop: `2px solid ${colors.ink}` }}
                    >
                      <Icon className="mt-0.5 shrink-0" size={19} />
                      <div>
                        <div className="font-black">{area.title}</div>
                        <p className="mt-1 text-sm" style={{ color: colors.muted }}>
                          {area.text}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <HandButton
                  variant="solid"
                  onClick={() => router.push("/collaborations")}
                >
                  {copy.learnMore} <ArrowRight size={18} />
                </HandButton>
                <HandButton variant="ghost" onClick={() => router.push("/shop")}>
                  {copy.shopToHelp}
                </HandButton>
              </div>
            </RoughBorder>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-3 md:gap-5">
          {communityPhotos.map((src, index) => (
            <button
              key={src}
              type="button"
              onClick={(event) =>
                showPhoto(
                  { src, alt: copy.galleryAlts[index] },
                  event.currentTarget
                )
              }
              data-reveal
              className="group reveal relative aspect-[4/3] overflow-hidden border-2 border-black focus-visible:outline-4 focus-visible:outline-offset-4"
              style={{
                background: colors.sand,
                boxShadow: `2px 2px 0 ${colors.ink}`,
                transitionDelay: `${160 + index * 80}ms`,
              }}
              aria-label={`${copy.openPhoto}: ${copy.galleryAlts[index]}`}
            >
              <ProgressiveImage
                src={src}
                alt={copy.galleryAlts[index]}
                fill
                sizes="(max-width: 768px) 33vw, 400px"
                className="object-cover group-hover:scale-[1.04] group-focus-visible:scale-[1.04]"
              />
              <span
                className="absolute inset-0 flex items-end justify-end bg-black/10 p-2 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
                aria-hidden="true"
              >
                <span
                  className="inline-flex items-center gap-2 border-2 border-black px-2 py-1 text-xs font-black uppercase tracking-widest"
                  style={{ background: colors.paper, color: colors.ink }}
                >
                  <Maximize2 size={14} /> {copy.expandPhoto}
                </span>
              </span>
            </button>
          ))}
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
          aria-labelledby="community-photo-title"
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
                id="community-photo-title"
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
