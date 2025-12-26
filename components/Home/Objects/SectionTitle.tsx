import colors from "@/components/colors"
import Scribble from "./Scribble"

export default function SectionTitle({ kicker, title, desc }: any) {
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
      <h2 className="mt-3 text-4xl md:text-5xl font-black leading-[1.02]">
        {title}
      </h2>
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
