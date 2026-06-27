"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  BadgeCheck,
  PackageCheck,
  Ruler,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from "lucide-react"

import "../components/Home/home.css"
import colors from "@/components/colors"
import { useSiteLocale } from "@/app/hooks/useSiteLocale"
import {
  formatMoneyFromCents,
  getUnitPriceCentsForCountry,
  type ShippingCountry,
} from "@/lib/commerce"
import type { Product } from "@/types"
import HandButton from "@/components/Home/Objects/HandButton"
import ProgressiveImage from "@/components/Home/Objects/ProgressiveImage"
import RoughBorder from "@/components/Home/Objects/RoughBorder"
import SectionTitle from "@/components/Home/Objects/SectionTitle"
import SockIcon from "@/components/Home/Objects/SockIcon"
import StampChip from "@/components/Home/Objects/StampChip"
import StitchRule from "@/components/Home/Objects/StitchRule"

const featuredProducts: Array<Product & { mainTag: string }> = [
  {
    id: "sock-brazil-yellow",
    title: "Brazil Yellow Socks",
    price: 8,
    image: "/products/BrazilYellowSocks.png",
    description: "Bright Brazil look. Soft feel. Stays comfy all day.",
    tags: ["Sport"],
    mainTag: "Best seller",
  },
  {
    id: "sock-cherry",
    title: "Cherry Socks",
    price: 8,
    image: "/products/CherrySocks.png",
    description: "Sweet graphic. Soft cotton blend. Easy daily pair.",
    tags: ["Fun"],
    mainTag: "New color",
  },
  {
    id: "sock-basketball",
    title: "Basketball Socks",
    price: 8,
    image: "/products/BasketballSocks.png",
    description: "Sporty design. Comfy fit. Everyday durability.",
    tags: ["Sport"],
    mainTag: "Sport",
  },
  {
    id: "sock-flying-money",
    title: "Flying Money Socks",
    price: 8,
    image: "/products/FlyingMoneySocks.png",
    description: "Loud design. Soft feel. Holds up after washes.",
    tags: ["Money"],
    mainTag: "Graphic",
  },
  {
    id: "sock-chicken-leg",
    title: "Chicken Leg Socks",
    price: 8,
    image: "/products/ChickenLegSocks.png",
    description: "Bold graphic. Soft cotton blend. Stays comfy all day.",
    tags: ["Funny"],
    mainTag: "Funny",
  },
  {
    id: "sock-duff-simpsons",
    title: "Duff Inspired Socks",
    price: 8,
    image: "/products/DuffSimpsonsSocks.png",
    description: "Retro pop style. Comfortable crew fit. Durable knit.",
    tags: ["Retro"],
    mainTag: "Retro",
  },
]

const productNotes = [
  {
    title: "All-day comfort",
    text: "Soft crew socks with an easy stretch, clean finish, and a fit made for school days, travel days, and everything between.",
    Icon: Ruler,
  },
  {
    title: "Standout designs",
    text: "Cartoon, sport, food, money, and Brazil-inspired styles that add personality without making the rest of the outfit complicated.",
    Icon: BadgeCheck,
  },
  {
    title: "Easy to buy",
    text: "Pick your pairs, build a small rotation, review the cart, and check out with pricing set for your shipping country.",
    Icon: PackageCheck,
  },
] as const

const productBadges = {
  "Best seller": { en: "Best seller", pt: "Mais vendido" },
  "New color": { en: "New color", pt: "Nova cor" },
  Sport: { en: "Sport", pt: "Esporte" },
  Graphic: { en: "Graphic", pt: "Estampa" },
  Funny: { en: "Funny", pt: "Divertida" },
  Retro: { en: "Retro", pt: "Retrô" },
  Fun: { en: "Fun", pt: "Divertida" },
  Money: { en: "Money", pt: "Dinheiro" },
} as const

function getLocalPricingStats(
  pricingStats: ReadonlyArray<readonly [string, string]>,
  shippingCountry: ShippingCountry,
  locale: ReturnType<typeof useSiteLocale>["locale"]
) {
  if (shippingCountry === "BR") {
    return [
      pricingStats[0],
      [
        "Brasil",
        locale === "pt"
          ? "Checkout com preço local"
          : "Local checkout pricing",
      ],
      [
        "Pedido local",
        locale === "pt"
          ? "Finalização para endereços no Brasil"
          : "Checkout for Brazil addresses",
      ],
    ] as const
  }

  return [
    pricingStats[0],
    pricingStats[1],
    [
      "U.S. only",
      locale === "pt"
        ? "Checkout com preço local"
        : "Checkout uses local pricing",
    ],
  ] as const
}

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

function ProductCard({
  product,
  index,
  shippingCountry,
  t,
  locale,
}: {
  product: Product & { mainTag: string }
  index: number
  shippingCountry: ShippingCountry
  t: ReturnType<typeof useSiteLocale>["t"]
  locale: ReturnType<typeof useSiteLocale>["locale"]
}) {
  const router = useRouter()
  const price = formatMoneyFromCents(
    getUnitPriceCentsForCountry(product, shippingCountry),
    shippingCountry
  )
  const localizedDescription =
    (t.home.productDescriptions as Record<string, string>)[product.id] ||
    product.description
  const localizedMainTag =
    product.mainTag in productBadges
      ? productBadges[product.mainTag as keyof typeof productBadges][locale]
      : product.mainTag
  const localizedTag =
    product.tags?.[0] && product.tags[0] in productBadges
      ? productBadges[product.tags[0] as keyof typeof productBadges][locale]
      : product.tags?.[0] || t.shop.sock

  return (
    <RoughBorder
      bg={colors.paper}
      rotate={0}
      label={localizedMainTag}
      delay={index * 80}
      className="h-full"
    >
      <button
        type="button"
        className="group block w-full text-left"
        onClick={() => router.push("/shop")}
        aria-label={`Shop ${product.title}`}
      >
        <div
          className="relative h-52 overflow-hidden border-2 border-black"
          style={{
            background: colors.sand,
            boxShadow: `2px 2px 0 ${colors.ink}`,
          }}
        >
          <ProgressiveImage
            src={product.image}
            alt={product.title}
            fill
            priority={index < 3}
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform group-hover:scale-[1.03]"
          />
        </div>

        <div
          className="mt-4 text-xs font-black uppercase tracking-widest"
          style={{ color: colors.muted }}
        >
          {localizedTag} • {t.home.productMetaSuffix}
        </div>

        <div className="mt-1 flex items-center gap-2 text-xl font-black">
          <SockIcon size={18} color={colors.ink} />
          {product.title}
        </div>

        <p className="mt-2 text-sm leading-relaxed" style={{ color: colors.muted }}>
          {localizedDescription}
        </p>

        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="text-lg font-black" style={{ color: colors.accent }}>
            {price}
          </div>
          <span
            className="btnInk px-4 py-2 text-xs font-black uppercase tracking-widest"
            style={{
              background: colors.accent,
              color: colors.paper,
              border: `2px solid ${colors.ink}`,
              boxShadow: `2px 2px 0 ${colors.ink}`,
            }}
          >
            Shop
          </span>
        </div>
      </button>
    </RoughBorder>
  )
}

export default function OneMoreGoodStorefront() {
  const rootRef = useReveal()
  const router = useRouter()
  const { shippingCountry, t, locale } = useSiteLocale()
  const localPricingStats = getLocalPricingStats(
    t.home.pricingStats,
    shippingCountry,
    locale
  )

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
                <StampChip icon={ShoppingBag} text={t.home.chips[0]} />
                <StampChip icon={ShieldCheck} text={t.home.chips[1]} tone={colors.paper} />
                <StampChip icon={Truck} text={t.home.chips[2]} />
              </div>

              <h1
                data-reveal
                className="reveal mt-6 max-w-3xl text-5xl font-black leading-[0.98] tracking-tight md:text-6xl"
              >
                {t.home.headline}{" "}
                <span style={{ color: colors.clay }}>{t.home.headlineAccent}</span>
              </h1>

              <p
                data-reveal
                className="reveal mt-6 max-w-2xl text-lg leading-relaxed"
                style={{ color: colors.muted }}
              >
                {t.home.intro}
              </p>

              <div data-reveal className="reveal mt-8 flex flex-wrap gap-3">
                <HandButton variant="solid" onClick={() => router.push("/shop")}>
                  {t.home.shopAll} <ArrowRight size={18} />
                </HandButton>
                <HandButton variant="ghost" onClick={() => router.push("/collaborations")}>
                  {t.home.seeImpact} <ArrowRight size={18} />
                </HandButton>
              </div>

              <StitchRule />

              <div data-reveal className="reveal grid gap-4 text-sm sm:grid-cols-3">
                {localPricingStats.map(([value, description]) => (
                  <div key={value}>
                    <div className="text-2xl font-black" style={{ color: colors.clay }}>
                      {value}
                    </div>
                    <div className="mt-1" style={{ color: colors.muted }}>
                      {description}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="md:col-span-5">
              <RoughBorder bg={colors.sand} rotate={0} label={t.home.featuredPair} delay={120}>
                <div
                  className="relative aspect-[4/3] overflow-hidden border-2 border-black"
                  style={{
                    background: colors.paper,
                    boxShadow: `3px 3px 0 ${colors.ink}`,
                  }}
                >
                  <ProgressiveImage
                    src="/products/BrazilYellowSocks.png"
                    alt="Brazil Yellow Socks"
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 420px"
                    className="object-contain"
                  />
                  <div
                    className="absolute left-4 top-4 px-3 py-2 text-xs font-black uppercase tracking-widest"
                    style={{
                      background: colors.paper,
                      border: `2px solid ${colors.ink}`,
                      boxShadow: `2px 2px 0 ${colors.ink}`,
                    }}
                  >
                    {t.home.bestSeller}
                  </div>
                </div>

                <div className="mt-5 flex items-start justify-between gap-4">
                  <div>
                    <div className="text-2xl font-black">Brazil Yellow Socks</div>
                    <p className="mt-1 text-sm" style={{ color: colors.muted }}>
                      {t.home.productDescriptions["sock-brazil-yellow"]}
                    </p>
                  </div>
                  <div className="text-xl font-black" style={{ color: colors.accent }}>
                    $8
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
              kicker={t.home.bestSellersKicker}
              title={t.home.shopWallTitle}
              desc={t.home.shopWallDesc}
            />

            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {featuredProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={index}
                  shippingCountry={shippingCountry}
                  t={t}
                  locale={locale}
                />
              ))}
            </div>

            <div data-reveal className="reveal mt-10">
              <button
                type="button"
                onClick={() => router.push("/shop")}
                className="btnInk flex w-full items-center justify-center gap-3 px-8 py-4 text-base font-black uppercase tracking-widest md:py-5 md:text-lg"
                style={{
                  background: colors.accent,
                  color: colors.paper,
                  border: `2px solid ${colors.ink}`,
                  boxShadow: `4px 4px 0 ${colors.ink}`,
                }}
              >
                {t.home.seeEverything} <ShoppingBag size={20} />
              </button>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 py-14">
          <SectionTitle
            kicker={t.home.detailsKicker}
            title={t.home.detailsTitle}
            desc={t.home.detailsDesc}
          />

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {productNotes.map(({ Icon }, index) => (
              <RoughBorder
                key={t.home.productNotes[index].title}
                bg={index % 2 === 0 ? colors.paper : colors.sand}
                rotate={0}
                label={`Detail 0${index + 1}`}
                delay={index * 100}
                className="h-full"
              >
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-black">
                    {t.home.productNotes[index].title}
                  </div>
                  <div
                    className="p-2"
                    style={{
                      background: colors.paper,
                      border: `2px solid ${colors.ink}`,
                      boxShadow: `2px 2px 0 ${colors.ink}`,
                    }}
                  >
                    <Icon size={18} />
                  </div>
                </div>
                <p className="mt-3 text-sm leading-relaxed" style={{ color: colors.muted }}>
                  {t.home.productNotes[index].text}
                </p>
              </RoughBorder>
            ))}
          </div>
        </section>

        <section
          style={{
            background: colors.sand,
            borderTop: `2px solid ${colors.ink}`,
          }}
        >
          <div className="max-w-7xl mx-auto grid gap-8 px-6 py-14 md:grid-cols-12">
            <div className="md:col-span-5">
              <SectionTitle
                kicker={t.home.whyKicker}
                title={t.home.whyTitle}
                desc={t.home.whyDesc}
              />
            </div>

            <div className="md:col-span-7">
              <RoughBorder bg={colors.paper} rotate={0} label={t.home.storePromise} delay={100}>
                <div className="grid gap-4 sm:grid-cols-2">
                  {t.home.shopReasons.map((reason) => (
                    <div
                      key={reason}
                      style={{ borderTop: `2px solid ${colors.ink}`, paddingTop: 12 }}
                    >
                      <div className="flex items-start gap-2 font-black">
                        <SockIcon size={18} color={colors.ink} />
                        {reason}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <HandButton variant="solid" onClick={() => router.push("/shop")}>
                    {t.home.openShop} <ShoppingBag size={18} />
                  </HandButton>
                  <HandButton variant="ghost" onClick={() => router.push("/collaborations")}>
                    {t.home.impactCollaborations} <ArrowRight size={18} />
                  </HandButton>
                </div>
              </RoughBorder>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
