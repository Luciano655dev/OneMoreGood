import SectionTitle from "../Objects/SectionTitle"
import RoughBorder from "../Objects/RoughBorder"
import SockIcon from "../Objects/SockIcon"
import ProgressiveImage from "../Objects/ProgressiveImage"
import colors from "@/components/colors"
import { useDetectedShippingCountry } from "@/app/hooks/useDetectedShippingCountry"
import {
  formatMoneyFromCents,
  getUnitPriceCentsForCountry,
} from "@/lib/commerce"
import type { Product } from "@/types"
import { useRouter } from "next/navigation"

export default function Shop() {
  const router = useRouter()
  const shippingCountry = useDetectedShippingCountry()

  const products: Array<
    Product & {
      mainTag: string
    }
  > = [
    {
      id: "flying-money-socks",
      title: "Flying Money Socks",
      price: 8,
      image: "/products/FlyingMoneySocks.png",
      mainTag: "PREMIUM SOCKS",
    },
    {
      id: "chicken-leg-socks",
      title: "Chicken Leg Socks",
      price: 8,
      image: "/products/ChickenLegSocks.png",
      mainTag: "PREMIUM SOCKS",
    },
    {
      id: "duff-simpsons-socks",
      title: "DUFF Simpsons Socks",
      price: 8,
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
          title="An ecommerce store with a clear point of view"
          desc="Online payment is paused for now. If you want to buy a pair of socks, contact us directly and we will arrange the order manually."
        />

        <div className="mt-10 grid md:grid-cols-3 gap-6">
          {products.map((product, i) => (
            <RoughBorder
              key={i}
              bg={colors.paper}
              rotate={0}
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
                <div className="font-black">
                  {formatMoneyFromCents(
                    getUnitPriceCentsForCountry(product, shippingCountry),
                    shippingCountry
                  )}
                </div>

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
            </RoughBorder>
          ))}
        </div>
      </div>
    </section>
  )
}
