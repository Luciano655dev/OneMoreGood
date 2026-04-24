import colors from "@/components/colors"
import Scribble from "./Scribble"

type SectionTitleProps = {
  kicker?: string
  title: React.ReactNode
  desc?: string
  titleAccessory?: React.ReactNode
}

export default function SectionTitle({
  kicker,
  title,
  desc,
  titleAccessory,
}: SectionTitleProps) {
  return (
    <div data-reveal className="reveal max-w-3xl">
      {kicker ? (
        <div className="flex items-center gap-3">
          <div
            className="text-xs font-black uppercase tracking-widest"
            style={{ color: colors.muted }}
          >
            {kicker}
          </div>
          <div className="scribbleDraw">
            <Scribble color={colors.ink} />
          </div>
        </div>
      ) : null}
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h2 className="text-4xl md:text-5xl font-black leading-[1.02]">
          {title}
        </h2>
        {titleAccessory ? titleAccessory : null}
      </div>
      {desc ? (
        <p
          className="mt-4 text-lg leading-relaxed"
          style={{ color: colors.muted }}
        >
          {desc}
        </p>
      ) : null}
    </div>
  )
}
