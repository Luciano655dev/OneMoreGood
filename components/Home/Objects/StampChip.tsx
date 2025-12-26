import colors from "@/components/colors"
const StampChip = ({ icon: Icon, text, tone = colors.sand }: any) => (
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
