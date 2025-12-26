import colors from "@/components/colors"

const Scribble = ({ color = colors.ink }) => (
  <svg viewBox="0 0 120 10" className="w-28 h-3" aria-hidden="true">
    <path
      d="M2 7 C 15 2, 25 10, 40 6 S 65 3, 78 7 S 98 9, 118 4"
      fill="none"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4 9 C 18 5, 28 11, 42 8 S 66 6, 80 9 S 100 10, 116 6"
      fill="none"
      stroke={color}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity="0.65"
    />
  </svg>
)

export default Scribble
