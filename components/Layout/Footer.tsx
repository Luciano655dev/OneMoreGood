import colors from "../colors"
import SockIcon from "../Home/Objects/SockIcon"
import { Heart } from "lucide-react"

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: `2px solid ${colors.ink}`,
        background: colors.paper,
        color: colors.ink,
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Left – brand */}
          <div className="flex items-center gap-3">
            <div
              className="border-2 border-black p-2"
              style={{
                background: colors.sand,
                boxShadow: `2px 2px 0 ${colors.ink}`,
              }}
            >
              <Heart size={18} fill="currentColor" />
            </div>
            <div>
              <div className="font-black">One More Good</div>
              <div
                className="text-xs font-semibold"
                style={{ color: colors.muted }}
              >
                Santa Terezinha, Paraíba
              </div>
            </div>
          </div>

          {/* Right – links */}
          <div
            className="flex flex-wrap items-center gap-4 text-sm font-black"
            style={{ color: colors.muted }}
          >
            <a
              href="https://github.com/luciano655dev"
              style={{ color: colors.ink, textDecoration: "underline" }}
            >
              GitHub
            </a>
            <a
              href="https://daykeeper.app"
              style={{ color: colors.ink, textDecoration: "underline" }}
            >
              Daykeeper
            </a>
            <a
              href="https://hobbyasap.com"
              style={{ color: colors.ink, textDecoration: "underline" }}
            >
              HobbyASAP
            </a>
            <a
              href="/shop"
              style={{ color: colors.ink, textDecoration: "underline" }}
            >
              Shop
            </a>

            <div className="flex items-center gap-2">
              <SockIcon size={18} color={colors.ink} />©{" "}
              {new Date().getFullYear()} One More Pair
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
