import colors from "@/components/colors"

const HandButton = ({ variant = "solid", children, ...props }: any) => (
  <button
    {...props}
    className="btnInk inline-flex items-center gap-2 px-5 py-3 font-black uppercase tracking-wider"
    style={{
      background: variant === "solid" ? colors.accent : colors.paper,
      color: variant === "solid" ? colors.paper : colors.ink,
      border: `2px solid ${colors.ink}`,
      boxShadow: `3px 3px 0 ${colors.ink}`,
      cursor: "pointer",
    }}
  >
    {children}
  </button>
)

export default HandButton
