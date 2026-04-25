import SectionTitle from "../Objects/SectionTitle"
import RoughBorder from "../Objects/RoughBorder"
import SockIcon from "../Objects/SockIcon"
import ProgressiveImage from "../Objects/ProgressiveImage"
import colors from "@/components/colors"
import { useRouter } from "next/navigation"

export default function Shop() {
  const router = useRouter()

  const products = [
    {
      title: "Flying Money Socks",
      image: "/products/FlyingMoneySocks.png",
      mainTag: "PREMIUM SOCKS",
    },
    {
      title: "Chicken Leg Socks",
      image: "/products/ChickenLegSocks.png",
      mainTag: "PREMIUM SOCKS",
    },
    {
      title: "DUFF Simpsons Socks",
      image: "/products/DuffSimpsonsSocks.png",
      mainTag: "PREMIUM SOCKS",
    },
  ]

  return (
    <section
      id="shop"
      style={{
        background: colors.sand,
        borderTop: `2px solid ${colors.ink}`,
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-14">
        <SectionTitle
          kicker="Shop"
          title="Products with a purpose"
          desc="Choose a pair of socks and help OneMoreGood donate most of the profit to Instituto Educacional Semear."
        />

        <div className="mt-10 grid md:grid-cols-3 gap-6">
          {products.map((product, i) => (
            <RoughBorder
              key={i}
              bg={colors.paper}
              rotate={i === 2 ? 0.3 : -0.2}
              label="Product"
              delay={i * 80}
            >
              {/* PRODUCT IMAGE */}
              <div
                className="border-2 border-black overflow-hidden"
                style={{
                  background: colors.sand,
                  boxShadow: `2px 2px 0 ${colors.ink}`,
                }}
              >
                <ProgressiveImage
                  src={product.image}
                  alt="Sock product example"
                  width={640}
                  height={352}
                  className="h-44 w-full object-cover"
                />
              </div>

              {/* TEXT */}
              <div
                className="mt-4 text-xs font-black uppercase tracking-widest"
                style={{ color: colors.muted }}
              >
                {product.mainTag}
              </div>

              <div className="mt-1 text-xl font-black flex items-center gap-2">
                <SockIcon size={18} color={colors.ink} />
                {product.title}
              </div>

              <div className="mt-2 text-sm" style={{ color: colors.muted }}>
                Premium cotton blend • everyday wear
              </div>

              {/* ACTION */}
              <div className="mt-4 flex items-center justify-between">
                <div className="font-black">US: $7.99 • BR: R$25</div>

                <button
                  type="button"
                  className="px-4 py-2 font-black uppercase tracking-wider"
                  onClick={() => router.push("/shop")}
                  style={{
                    background: colors.accent,
                    color: colors.paper,
                    border: `2px solid ${colors.ink}`,
                    boxShadow: `2px 2px 0 ${colors.ink}`,
                    cursor: "pointer",
                  }}
                >
                  Add
                </button>
              </div>

              <div
                className="mt-3 text-xs font-black uppercase tracking-widest"
                style={{ color: colors.muted }}
              >
                + US promo available (2 for $14) • Brazil: R$25 each
              </div>
            </RoughBorder>
          ))}
        </div>
      </div>
    </section>
  )
}
