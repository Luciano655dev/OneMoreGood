export default function PageGridBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0"
      aria-hidden="true"
      style={{
        backgroundImage: `
          radial-gradient(circle at 1px 1px, rgba(0,0,0,0.06) 1px, transparent 0),
          repeating-linear-gradient(0deg, rgba(0,0,0,0.03) 0 1px, transparent 1px 18px),
          repeating-linear-gradient(90deg, rgba(0,0,0,0.02) 0 1px, transparent 1px 22px)
        `,
        backgroundSize: "14px 14px, 18px 18px, 22px 22px",
        mixBlendMode: "multiply",
      }}
    />
  )
}
