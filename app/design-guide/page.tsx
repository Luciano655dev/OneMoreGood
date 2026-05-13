import {
  ArrowRight,
  Check,
  Heart,
  Mail,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react"
import colors from "@/components/colors"
import HandButton from "@/components/Home/Objects/HandButton"
import RoughBorder from "@/components/Home/Objects/RoughBorder"
import SectionTitle from "@/components/Home/Objects/SectionTitle"
import SockIcon from "@/components/Home/Objects/SockIcon"
import StampChip from "@/components/Home/Objects/StampChip"
import StitchRule from "@/components/Home/Objects/StitchRule"
import PageGridBackground from "@/components/Layout/PageGridBackground"

const palette = [
  {
    name: "Ink",
    token: "colors.ink",
    hex: colors.ink,
    usage: "Primary text, borders, shadows",
  },
  {
    name: "Paper",
    token: "colors.paper",
    hex: colors.paper,
    usage: "Page background, cards",
  },
  {
    name: "Sand",
    token: "colors.sand",
    hex: colors.sand,
    usage: "Secondary surfaces, strips",
  },
  {
    name: "Accent",
    token: "colors.accent",
    hex: colors.accent,
    usage: "Primary actions, highlights",
  },
  {
    name: "Clay",
    token: "colors.clay",
    hex: colors.clay,
    usage: "Emphasis text, warning chips",
  },
  {
    name: "Muted Ink",
    token: "colors.muted",
    hex: colors.muted,
    usage: "Secondary text",
  },
] as const

const typeScale = [
  { cls: "text-[10px]", sample: "Micro label", use: "Dense admin chips" },
  { cls: "text-[11px]", sample: "Utility label", use: "Badges / status" },
  { cls: "text-xs", sample: "Caption / kicker", use: "Kickers and tags" },
  { cls: "text-sm", sample: "Small body", use: "UI body text" },
  { cls: "text-base", sample: "Base body", use: "Default paragraphs" },
  { cls: "text-lg", sample: "Lead copy", use: "Section intros" },
  { cls: "text-xl", sample: "Card title", use: "Card headings" },
  { cls: "text-2xl", sample: "Feature title", use: "Callouts" },
  { cls: "text-4xl", sample: "Section display", use: "Large headings" },
  { cls: "text-5xl", sample: "Hero heading", use: "Primary hero" },
  { cls: "text-6xl", sample: "XL display", use: "404 / big moments" },
] as const

const spacing = [
  { token: "max-w-7xl", value: "~80rem", usage: "Main content container" },
  { token: "px-6", value: "1.5rem", usage: "Page side padding" },
  { token: "py-14", value: "3.5rem", usage: "Section vertical rhythm" },
  { token: "gap-6", value: "1.5rem", usage: "Standard grid gap" },
  { token: "gap-8", value: "2rem", usage: "Large two-column gaps" },
  {
    token: "p-3 / p-4 / p-5",
    value: "0.75 / 1 / 1.25rem",
    usage: "Card internals",
  },
] as const

const elevation = [
  {
    token: "border: 2px solid ink",
    usage: "Default frame for cards, buttons, inputs",
  },
  {
    token: "inner border: 1.5px solid ink",
    usage: "Nested frame on featured cards",
  },
  {
    token: "box-shadow: 2px 2px 0 ink",
    usage: "Small controls / chips",
  },
  {
    token: "box-shadow: 3px 3px 0 ink",
    usage: "Buttons and product cards",
  },
  {
    token: "box-shadow: 6px 6px 0 ink",
    usage: "Modal shell",
  },
] as const

export default function DesignGuidePage() {
  return (
    <div
      className="relative min-h-screen"
      style={{ background: colors.paper, color: colors.ink }}
    >
      <PageGridBackground />

      <section className="relative max-w-7xl mx-auto px-6 py-14">
        <SectionTitle
          kicker="System"
          title="OneMoreGood Design Guide"
          desc="Live reference for palette, type scale, spacing, interaction states, and reusable UI patterns used across the site."
          titleAccessory={
            <StampChip
              icon={Sparkles}
              text="Design Source of Truth"
              tone={colors.sand}
            />
          }
        />

        <div className="mt-10 grid gap-8 md:grid-cols-2">
          <RoughBorder bg={colors.sand} rotate={-0.2} label="Color palette">
            <div className="grid gap-3">
              {palette.map((swatch) => (
                <div
                  key={swatch.name}
                  className="grid grid-cols-[96px_1fr] gap-3 p-3"
                  style={{
                    border: `2px solid ${colors.ink}`,
                    boxShadow: `2px 2px 0 ${colors.ink}`,
                    background: colors.paper,
                  }}
                >
                  <div
                    className="h-14"
                    style={{
                      background: swatch.hex,
                      border: `2px solid ${colors.ink}`,
                    }}
                  />
                  <div>
                    <div className="font-black">{swatch.name}</div>
                    <div
                      className="text-xs font-black uppercase tracking-widest"
                      style={{ color: colors.muted }}
                    >
                      {swatch.token}
                    </div>
                    <div className="mt-1 text-sm" style={{ color: colors.muted }}>
                      {swatch.hex} • {swatch.usage}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </RoughBorder>

          <RoughBorder bg={colors.paper} rotate={0.2} label="Typography">
            <div
              className="p-3"
              style={{
                background: colors.sand,
                border: `2px solid ${colors.ink}`,
                boxShadow: `2px 2px 0 ${colors.ink}`,
              }}
            >
              <div
                className="text-xs font-black uppercase tracking-widest"
                style={{ color: colors.muted }}
              >
                Primary font stack
              </div>
              <div className="mt-1 font-black">ui-sans-serif, system-ui, sans-serif</div>
              <div className="mt-2 text-sm" style={{ color: colors.muted }}>
                Weight system: regular body with heavy emphasis on
                <span className="font-black"> font-black (900)</span> for
                branding, labels, and key CTAs.
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {typeScale.map((row) => (
                <div
                  key={row.cls}
                  className="grid grid-cols-[88px_1fr_130px] items-center gap-3 p-2"
                  style={{ borderTop: `2px solid ${colors.ink}` }}
                >
                  <div
                    className="text-[11px] font-black uppercase tracking-widest"
                    style={{ color: colors.muted }}
                  >
                    {row.cls}
                  </div>
                  <div className={`${row.cls} font-black`}>{row.sample}</div>
                  <div className="text-xs" style={{ color: colors.muted }}>
                    {row.use}
                  </div>
                </div>
              ))}
            </div>
          </RoughBorder>
        </div>

        <div className="mt-8 grid gap-8 md:grid-cols-2">
          <RoughBorder bg={colors.paper} rotate={0.1} label="Layout and spacing">
            <div className="space-y-3">
              {spacing.map((item) => (
                <div
                  key={item.token}
                  style={{ borderTop: `2px solid ${colors.ink}`, paddingTop: 10 }}
                >
                  <div
                    className="text-xs font-black uppercase tracking-widest"
                    style={{ color: colors.muted }}
                  >
                    {item.token}
                  </div>
                  <div className="font-black">{item.value}</div>
                  <div className="text-sm" style={{ color: colors.muted }}>
                    {item.usage}
                  </div>
                </div>
              ))}
            </div>
          </RoughBorder>

          <RoughBorder bg={colors.sand} rotate={-0.25} label="Borders and elevation">
            <div className="space-y-3">
              {elevation.map((item) => (
                <div
                  key={item.token}
                  className="p-3"
                  style={{
                    background: colors.paper,
                    border: `2px solid ${colors.ink}`,
                    boxShadow: `2px 2px 0 ${colors.ink}`,
                  }}
                >
                  <div
                    className="text-xs font-black uppercase tracking-widest"
                    style={{ color: colors.muted }}
                  >
                    {item.token}
                  </div>
                  <div className="mt-1 text-sm" style={{ color: colors.muted }}>
                    {item.usage}
                  </div>
                </div>
              ))}
            </div>
          </RoughBorder>
        </div>

        <StitchRule />

        <SectionTitle
          kicker="Components"
          title="Reusable UI Patterns"
          desc="These examples mirror the buttons, containers, tags, cards, form controls, and modal shell used across home, shop, and admin screens."
        />

        <div className="mt-10 grid gap-8 md:grid-cols-2">
          <RoughBorder bg={colors.paper} rotate={0.2} label="Buttons and tags">
            <div className="flex flex-wrap gap-3">
              <HandButton type="button" variant="solid">
                Primary action <ArrowRight size={16} />
              </HandButton>
              <HandButton type="button" variant="ghost">
                Secondary action
              </HandButton>
              <button
                type="button"
                className="btnInk px-4 py-3 text-xs font-black uppercase tracking-widest"
                style={{
                  background: colors.paper,
                  color: colors.ink,
                  border: `2px dashed ${colors.ink}`,
                  boxShadow: `2px 2px 0 ${colors.ink}`,
                }}
              >
                Ghost tag button
              </button>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <StampChip icon={ShieldCheck} text="Trust" tone={colors.sand} />
              <StampChip icon={Check} text="In stock" tone={colors.paper} />
              <StampChip icon={Heart} text="Purpose-backed" tone={colors.sand} />
            </div>
          </RoughBorder>

          <RoughBorder bg={colors.sand} rotate={-0.1} label="Container and card">
            <div
              className="relative p-3"
              style={{
                background: colors.paper,
                border: `2px solid ${colors.ink}`,
                boxShadow: `3px 3px 0 ${colors.ink}`,
              }}
            >
              <div
                className="absolute inset-[6px] pointer-events-none"
                style={{ border: `1.5px solid ${colors.ink}` }}
              />
              <div className="relative">
                <div
                  className="h-32"
                  style={{
                    background: colors.sand,
                    border: `2px solid ${colors.ink}`,
                  }}
                />
                <div
                  className="mt-3 text-xs font-black uppercase tracking-widest"
                  style={{ color: colors.muted }}
                >
                  Product
                </div>
                <div className="mt-1 text-xl font-black flex items-center gap-2">
                  <SockIcon size={18} color={colors.ink} />
                  Card title
                </div>
                <div className="mt-2 text-sm" style={{ color: colors.muted }}>
                  Short supporting copy with a purpose-led product message.
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="font-black" style={{ color: colors.accent }}>
                    $8.00
                  </div>
                  <button
                    type="button"
                    className="btnInk px-4 py-2 text-sm font-black uppercase tracking-wider"
                    style={{
                      background: colors.accent,
                      color: colors.paper,
                      border: `2px solid ${colors.ink}`,
                      boxShadow: `2px 2px 0 ${colors.ink}`,
                    }}
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </RoughBorder>
        </div>

        <div className="mt-8 grid gap-8 md:grid-cols-2">
          <RoughBorder bg={colors.paper} rotate={-0.2} label="Form controls">
            <div className="grid gap-4">
              <label className="grid gap-2">
                <span
                  className="text-xs font-black uppercase tracking-widest"
                  style={{ color: colors.muted }}
                >
                  Name
                </span>
                <input
                  defaultValue="One More Good"
                  className="px-3 py-3 font-black"
                  style={{
                    background: colors.paper,
                    border: `2px solid ${colors.ink}`,
                    boxShadow: `2px 2px 0 ${colors.ink}`,
                  }}
                />
              </label>

              <label className="grid gap-2">
                <span
                  className="text-xs font-black uppercase tracking-widest"
                  style={{ color: colors.muted }}
                >
                  Email
                </span>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    defaultValue="hello@onemoregood.com"
                    className="w-full pl-10 pr-3 py-3 font-black"
                    style={{
                      background: colors.paper,
                      border: `2px solid ${colors.ink}`,
                      boxShadow: `2px 2px 0 ${colors.ink}`,
                    }}
                  />
                </div>
              </label>

              <label className="grid gap-2">
                <span
                  className="text-xs font-black uppercase tracking-widest"
                  style={{ color: colors.muted }}
                >
                  Message
                </span>
                <textarea
                  defaultValue="Tell us what you need."
                  className="h-28 px-3 py-3 font-black"
                  style={{
                    background: colors.paper,
                    border: `2px solid ${colors.ink}`,
                    boxShadow: `2px 2px 0 ${colors.ink}`,
                  }}
                />
              </label>
            </div>
          </RoughBorder>

          <RoughBorder bg={colors.sand} rotate={0.15} label="Modal shell">
            <div
              style={{
                border: `2px solid ${colors.ink}`,
                boxShadow: `6px 6px 0 ${colors.ink}`,
                background: colors.paper,
              }}
            >
              <div
                className="flex items-center justify-between px-4 py-3"
                style={{
                  background: colors.sand,
                  borderBottom: `2px solid ${colors.ink}`,
                }}
              >
                <div
                  className="text-xs font-black uppercase tracking-widest"
                  style={{ color: colors.muted }}
                >
                  Dialog title
                </div>
                <button
                  type="button"
                  className="px-3 py-2 text-xs font-black uppercase tracking-widest"
                  style={{
                    background: colors.paper,
                    border: `2px solid ${colors.ink}`,
                    boxShadow: `2px 2px 0 ${colors.ink}`,
                  }}
                >
                  Close
                </button>
              </div>
              <div className="p-4 text-sm" style={{ color: colors.muted }}>
                Modal content area with high-contrast framed header, strong
                shadow, and action strip.
              </div>
              <div className="px-4 py-4" style={{ borderTop: `2px solid ${colors.ink}` }}>
                <button
                  type="button"
                  className="btnInk px-4 py-3 text-xs font-black uppercase tracking-widest"
                  style={{
                    background: colors.accent,
                    color: colors.paper,
                    border: `2px solid ${colors.ink}`,
                    boxShadow: `2px 2px 0 ${colors.ink}`,
                  }}
                >
                  Confirm
                </button>
              </div>
            </div>
          </RoughBorder>
        </div>

        <div className="mt-8">
          <RoughBorder bg={colors.paper} rotate={0} label="Interaction and motion">
            <div className="grid gap-3 md:grid-cols-3">
              {[
                [".btnInk", "Lift + slight rotate on hover, pressed state on click"],
                [".chipPop", "Micro rotation hover for chips and compact tags"],
                [".reveal", "Fade + translate reveal used on section entry"],
              ].map(([name, info]) => (
                <div
                  key={name}
                  className="p-4"
                  style={{
                    background: colors.sand,
                    border: `2px solid ${colors.ink}`,
                    boxShadow: `2px 2px 0 ${colors.ink}`,
                  }}
                >
                  <div
                    className="text-xs font-black uppercase tracking-widest"
                    style={{ color: colors.muted }}
                  >
                    {name}
                  </div>
                  <div className="mt-1 text-sm" style={{ color: colors.muted }}>
                    {info}
                  </div>
                </div>
              ))}
            </div>

            <div
              className="mt-4 p-4 text-sm"
              style={{
                borderTop: `2px solid ${colors.ink}`,
                color: colors.muted,
              }}
            >
              Accessibility baseline: high contrast text on paper/sand
              surfaces, large tap targets, uppercase utility labels for quick
              scanning, and clear visual feedback on interactive controls.
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="btnInk inline-flex items-center gap-2 px-4 py-3 text-sm font-black uppercase tracking-wider"
                style={{
                  background: colors.accent,
                  color: colors.paper,
                  border: `2px solid ${colors.ink}`,
                  boxShadow: `3px 3px 0 ${colors.ink}`,
                }}
              >
                <Search size={16} />
                Test hover
              </button>
              <div className="text-sm" style={{ color: colors.muted }}>
                Use this page as the source for future UI decisions.
              </div>
            </div>
          </RoughBorder>
        </div>
      </section>
    </div>
  )
}
