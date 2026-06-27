"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  HeartHandshake,
  MapPin,
  Play,
  ReceiptText,
  ShieldCheck,
  ShoppingBag,
  Users,
  X,
} from "lucide-react"

import "../../components/Home/home.css"
import colors from "@/components/colors"
import { useSiteLocale } from "@/app/hooks/useSiteLocale"
import HandButton from "@/components/Home/Objects/HandButton"
import ProgressiveImage from "@/components/Home/Objects/ProgressiveImage"
import RoughBorder from "@/components/Home/Objects/RoughBorder"
import SectionTitle from "@/components/Home/Objects/SectionTitle"
import SockIcon from "@/components/Home/Objects/SockIcon"
import StampChip from "@/components/Home/Objects/StampChip"
import StitchRule from "@/components/Home/Objects/StitchRule"

const proofPhotos = [
  {
    src: "/community/photos/Instagram Downloaded Photo (1).jpg",
    alt: "Children participating in a community activity",
  },
  {
    src: "/community/photos/Instagram Photo from SnapInsta (1).jpg",
    alt: "Children holding flags at a local school event",
  },
  {
    src: "/community/photos/Instagram Photo Download.jpg",
    alt: "Young people gathered outdoors during a community moment",
  },
  {
    src: "/community/photos/Pernambuco01.png",
    alt: "Street in Santa Terezinha",
  },
] as const

const focusAreas = [
  {
    Icon: Users,
  },
  {
    Icon: BookOpen,
  },
  {
    Icon: ReceiptText,
  },
] as const

function useReveal() {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const els = Array.from(document.querySelectorAll("[data-reveal]"))
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in")
            io.unobserve(e.target)
          }
        }
      },
      { threshold: 0.15 }
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    const onScroll = () => {
      document.documentElement.style.setProperty(
        "--scrollY",
        String(window.scrollY || 0)
      )
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return rootRef
}

function VideoCard({
  title,
  text,
  src,
  poster,
  delay,
  label,
  watch,
}: {
  title: string
  text: string
  src: string
  poster: string
  delay: number
  label: string
  watch: string
}) {
  return (
    <RoughBorder bg={colors.paper} rotate={0} label={label} delay={delay}>
      <div
        className="relative aspect-video overflow-hidden border-2 border-black bg-black"
        style={{ boxShadow: `3px 3px 0 ${colors.ink}` }}
      >
        <video
          className="h-full w-full object-cover"
          src={src}
          poster={poster}
          controls
          playsInline
        />
        <div
          className="pointer-events-none absolute left-3 top-3 inline-flex items-center gap-2 px-3 py-2 text-xs font-black uppercase tracking-widest"
          style={{
            background: colors.paper,
            border: `2px solid ${colors.ink}`,
            boxShadow: `2px 2px 0 ${colors.ink}`,
          }}
        >
          <Play size={14} />
          {watch}
        </div>
      </div>

      <h3 className="mt-5 text-2xl font-black">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed" style={{ color: colors.muted }}>
        {text}
      </p>
    </RoughBorder>
  )
}

export default function OrganizationPage() {
  const rootRef = useReveal()
  const router = useRouter()
  const { t } = useSiteLocale()
  const [openPhoto, setOpenPhoto] = useState<(typeof proofPhotos)[number] | null>(
    null
  )
  const selectedPhotoIndex = openPhoto
    ? proofPhotos.findIndex((photo) => photo.src === openPhoto.src)
    : -1

  useEffect(() => {
    if (!openPhoto) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenPhoto(null)
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [openPhoto])

  return (
    <div ref={rootRef} style={{ background: colors.paper, color: colors.ink }}>
      <div
        className="fixed inset-0 pointer-events-none"
        aria-hidden="true"
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

      <main>
        <section className="max-w-7xl mx-auto px-6 pt-12 md:pt-16 pb-10">
          <div className="grid gap-8 md:grid-cols-12 md:items-start">
            <div className="md:col-span-7">
              <div data-reveal className="reveal hidden md:flex flex-wrap gap-2">
                <StampChip icon={HeartHandshake} text={t.organization.chips[0]} />
                <StampChip icon={MapPin} text={t.organization.chips[1]} tone={colors.paper} />
                <StampChip icon={ShieldCheck} text={t.organization.chips[2]} />
              </div>

              <h1
                data-reveal
                className="reveal mt-6 max-w-4xl text-5xl font-black leading-[0.98] tracking-tight md:text-6xl"
              >
                {t.organization.headline}{" "}
                <span style={{ color: colors.clay }}>{t.organization.headlineAccent}</span>
              </h1>

              <p
                data-reveal
                className="reveal mt-6 max-w-2xl text-lg leading-relaxed"
                style={{ color: colors.muted }}
              >
                {t.organization.intro}
              </p>

              <div data-reveal className="reveal mt-8 flex flex-wrap gap-3">
                <HandButton variant="solid" onClick={() => router.push("/shop")}>
                  {t.organization.shopToSupport} <ShoppingBag size={18} />
                </HandButton>
                <HandButton variant="ghost" onClick={() => router.push("/")}>
                  {t.organization.backToSocks} <ArrowRight size={18} />
                </HandButton>
              </div>

              <StitchRule />

              <div data-reveal className="reveal grid gap-4 text-sm sm:grid-cols-3">
                {t.organization.stats.map(([title, text]) => (
                  <div key={title}>
                    <div className="font-black">{title}</div>
                    <div className="mt-1" style={{ color: colors.muted }}>
                      {text}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="md:col-span-5">
              <RoughBorder bg={colors.sand} rotate={0} label={t.organization.whereItStarts} delay={120}>
                <div
                  className="relative h-[420px] overflow-hidden border-2 border-black"
                  style={{
                    background: colors.paper,
                    boxShadow: `3px 3px 0 ${colors.ink}`,
                  }}
                >
                  <ProgressiveImage
                    src="/community/photos/Pernambuco01.png"
                    alt="Street view in Santa Terezinha"
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 420px"
                    className="object-cover"
                  />
                </div>
                <div className="mt-5 flex items-start gap-3">
                  <MapPin className="mt-1 shrink-0" />
                  <div>
                    <div className="text-xl font-black">{t.organization.locationTitle}</div>
                    <p className="mt-1 text-sm" style={{ color: colors.muted }}>
                      {t.organization.locationText}
                    </p>
                  </div>
                </div>
              </RoughBorder>
            </div>
          </div>
        </section>

        <section
          style={{
            background: colors.sand,
            borderTop: `2px solid ${colors.ink}`,
            borderBottom: `2px solid ${colors.ink}`,
          }}
        >
          <div className="max-w-7xl mx-auto px-6 py-14">
            <SectionTitle
              kicker={t.organization.videosKicker}
              title={t.organization.videosTitle}
              desc={t.organization.videosDesc}
            />

            <div className="mt-10 grid gap-8 md:grid-cols-2">
              <VideoCard
                title={t.organization.videos[0].title}
                text={t.organization.videos[0].text}
                src="/community/videos/Instagram Photo Download.mp4"
                poster="/community/photos/Instagram Photo Download (5).jpg"
                delay={80}
                label={t.organization.videoLabel}
                watch={t.organization.watch}
              />
              <VideoCard
                title={t.organization.videos[1].title}
                text={t.organization.videos[1].text}
                src="/community/videos/SnapInsta.to_AQN2ocmLoqPbaZ5m8X33axudFj0rcjHijbJcQDbFP5yH96cOgZmQqr59xlzE2aisErPQpvD1WXoA4_67xt5uzByUitIBo0DJM02yJr4.mp4"
                poster="/community/photos/Instagram Photo Download (4).jpg"
                delay={160}
                label={t.organization.videoLabel}
                watch={t.organization.watch}
              />
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 py-14">
            <SectionTitle
            kicker={t.organization.focusKicker}
            title={t.organization.focusTitle}
            desc={t.organization.focusDesc}
          />

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {focusAreas.map(({ Icon }, index) => (
              <RoughBorder
                key={index}
                bg={index % 2 === 0 ? colors.paper : colors.sand}
                rotate={0}
                label={t.organization.focusAreas[index].title}
                delay={index * 100}
                className="h-full"
              >
                <div
                  className="inline-flex p-2"
                  style={{
                    background: colors.paper,
                    border: `2px solid ${colors.ink}`,
                    boxShadow: `2px 2px 0 ${colors.ink}`,
                  }}
                >
                  <Icon size={20} />
                </div>
                <h2 className="mt-4 text-2xl font-black">
                  {t.organization.focusAreas[index].title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: colors.muted }}>
                  {t.organization.focusAreas[index].text}
                </p>
              </RoughBorder>
            ))}
          </div>
        </section>

        <section
          style={{
            background: colors.sand,
            borderTop: `2px solid ${colors.ink}`,
            borderBottom: `2px solid ${colors.ink}`,
          }}
        >
          <div className="max-w-7xl mx-auto px-6 py-14">
            <SectionTitle
              kicker={t.organization.galleryKicker}
              title={t.organization.galleryTitle}
              desc={t.organization.galleryDesc}
            />

            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {proofPhotos.map((photo, index) => (
                <RoughBorder
                  key={photo.src}
                  bg={colors.paper}
                  rotate={0}
                  label={t.organization.photoLabels[index]}
                  delay={index * 70}
                  className="h-full"
                >
                  <button
                    type="button"
                    onClick={() => setOpenPhoto(photo)}
                    className="group block w-full text-left"
                    aria-label={`${t.organization.openPhoto}: ${t.organization.photoLabels[index]}`}
                  >
                    <div
                      className="relative h-64 overflow-hidden border-2 border-black"
                      style={{
                        background: colors.sand,
                        boxShadow: `2px 2px 0 ${colors.ink}`,
                      }}
                    >
                      <ProgressiveImage
                        src={photo.src}
                        alt={photo.alt}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-cover transition-transform group-hover:scale-[1.03]"
                      />
                      <div
                        className="absolute bottom-3 left-3 px-3 py-2 text-xs font-black uppercase tracking-widest opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
                        style={{
                          background: colors.paper,
                          border: `2px solid ${colors.ink}`,
                          boxShadow: `2px 2px 0 ${colors.ink}`,
                        }}
                      >
                        {t.organization.openPhoto}
                      </div>
                    </div>
                  </button>
                </RoughBorder>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto grid gap-8 px-6 py-14 md:grid-cols-12">
          <div className="md:col-span-5">
            <SectionTitle
              kicker={t.organization.connectKicker}
              title={t.organization.connectTitle}
              desc={t.organization.connectDesc}
            />
          </div>

          <div className="md:col-span-7">
            <div className="grid gap-5">
              {t.organization.donationSteps.map((step, index) => (
                <RoughBorder
                  key={index}
                  bg={colors.paper}
                  rotate={0}
                  label={`Step 0${index + 1}`}
                  delay={index * 80}
                >
                  <div className="grid gap-4 sm:grid-cols-[56px_1fr] sm:items-start">
                    <div
                      className="grid h-12 w-12 place-items-center text-lg font-black"
                      style={{
                        background: colors.clay,
                        color: colors.paper,
                        border: `2px solid ${colors.ink}`,
                        boxShadow: `2px 2px 0 ${colors.ink}`,
                      }}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-xl font-black">
                        <CheckCircle2 size={18} />
                        {step.title}
                      </div>
                      <p className="mt-2 text-sm leading-relaxed" style={{ color: colors.muted }}>
                        {step.text}
                      </p>
                    </div>
                  </div>
                </RoughBorder>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <HandButton variant="solid" onClick={() => router.push("/shop")}>
                {t.organization.shopSocks} <SockIcon size={18} color={colors.paper} />
              </HandButton>
              <HandButton variant="ghost" onClick={() => router.push("/")}>
                {t.organization.backHome} <ArrowRight size={18} />
              </HandButton>
            </div>
          </div>
        </section>
      </main>

      {openPhoto ? (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={
            selectedPhotoIndex >= 0
              ? t.organization.photoLabels[selectedPhotoIndex]
              : t.organization.openPhoto
          }
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setOpenPhoto(null)
            }
          }}
        >
          <div
            className="w-full max-w-5xl"
            style={{
              background: colors.paper,
              border: `2px solid ${colors.ink}`,
              boxShadow: `6px 6px 0 ${colors.ink}`,
            }}
          >
            <div
              className="flex items-center justify-between gap-4 border-b-2 border-black px-4 py-3"
              style={{ color: colors.ink }}
            >
              <div className="text-sm font-black uppercase tracking-widest">
                {selectedPhotoIndex >= 0
                  ? t.organization.photoLabels[selectedPhotoIndex]
                  : t.organization.openPhoto}
              </div>
              <button
                type="button"
                onClick={() => setOpenPhoto(null)}
                className="btnInk inline-grid h-10 w-10 place-items-center"
                aria-label={t.organization.closePhoto}
                style={{
                  background: colors.paper,
                  border: `2px solid ${colors.ink}`,
                  boxShadow: `2px 2px 0 ${colors.ink}`,
                }}
              >
                <X size={18} />
              </button>
            </div>
            <div className="relative aspect-[16/10] w-full bg-black">
              <ProgressiveImage
                src={openPhoto.src}
                alt={openPhoto.alt}
                fill
                sizes="100vw"
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
