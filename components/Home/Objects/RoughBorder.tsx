import colors from "@/components/colors"
import SockIcon from "./SockIcon"

const RoughBorder = ({
  children,
  bg = colors.paper,
  rotate = 0,
  label,
  delay = 0,
}: any) => (
  <div
    data-reveal
    className="reveal relative"
    style={{
      transform: `rotate(${rotate}deg)`,
      transitionDelay: `${delay}ms`,
    }}
  >
    <div
      className="relative"
      style={{ background: bg, border: `2px solid ${colors.ink}` }}
    >
      <div
        className="absolute inset-[5px] pointer-events-none"
        style={{ border: `1.5px solid ${colors.ink}` }}
      />
      {label ? (
        <div
          className="px-4 py-3"
          style={{
            borderBottom: `2px solid ${colors.ink}`,
            background: colors.sand,
            fontWeight: 900,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            fontSize: 12,
            display: "flex",
            alignItems: "center",
            gap: 10,
            justifyContent: "space-between",
          }}
        >
          <span>{label}</span>
          <span
            className="inline-flex items-center gap-2"
            style={{ opacity: 0.85 }}
          >
            <SockIcon size={18} color={colors.ink} />
            <SockIcon size={18} color={colors.ink} />
          </span>
        </div>
      ) : null}
      <div className="p-5">{children}</div>
    </div>

    {/* pen marks */}
    <div
      className="absolute -top-2 left-6 w-10 h-4"
      style={{ background: colors.sand, border: `2px solid ${colors.ink}` }}
    />
    <div
      className="absolute -bottom-2 right-8 w-8 h-4"
      style={{ background: colors.sand, border: `2px solid ${colors.ink}` }}
    />
  </div>
)

export default RoughBorder
