const StitchRule = () => (
  <div className="relative my-10">
    <div className="border-t-2 border-black" />
    <div className="absolute left-0 right-0 top-[2px] flex gap-2 justify-between">
      {Array.from({ length: 18 }).map((_, i) => (
        <div
          key={i}
          className="w-4 border-t-2 border-black rotate-[-12deg]"
          style={{ opacity: 0.55 }}
        />
      ))}
    </div>
  </div>
)

export default StitchRule
