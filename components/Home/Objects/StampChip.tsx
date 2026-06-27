import type { LucideIcon } from "lucide-react"

import colors from "@/components/colors"

type StampChipProps = {
  icon: LucideIcon
  text: string
  tone?: string
}

const StampChip = ({ icon: Icon, text, tone = colors.sand }: StampChipProps) => (
  <div
    className="chipPop inline-flex items-center gap-2 px-3 py-1 text-xs font-black uppercase tracking-widest"
    style={{
      background: tone,
      border: `2px dashed ${colors.ink}`,
    }}
  >
    <Icon size={14} />
    {text}
  </div>
)

export default StampChip
