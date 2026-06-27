"use client"

import { useMemo } from "react"
import colors from "../colors"
import { useSiteLocale } from "@/app/hooks/useSiteLocale"

export default function Filters({
  query,
  setQuery,
  tags,
  activeTag,
  setActiveTag,
}: {
  query: string
  setQuery: (v: string) => void
  tags: string[]
  activeTag: string
  setActiveTag: (v: string) => void
}) {
  const { t } = useSiteLocale()
  const allTags = useMemo(() => {
    // de-dupe + stable order
    const clean = tags.map((t) => String(t).trim()).filter(Boolean)
    return ["All", ...Array.from(new Set(clean))]
  }, [tags])

  return (
    <header
      className="relative"
      style={{
        borderBottom: `2px solid ${colors.ink}`,
        background: colors.paper,
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid gap-5 md:grid-cols-12 md:items-start">
          {/* LEFT */}
          <div className="md:col-span-7">
            <div
              className="text-xs font-black uppercase tracking-widest"
              style={{ color: colors.muted }}
            >
              {t.shop.kicker}
            </div>

            <h1 className="mt-2 text-4xl md:text-5xl font-black leading-[1.02]">
              {t.shop.headline}{" "}
              <strong style={{ color: colors.clay }}>{t.shop.headlineAccent}</strong>
            </h1>

            <p
              className="mt-3 text-base max-w-xl"
              style={{ color: colors.muted }}
            >
              {t.shop.intro}
            </p>
          </div>

          {/* RIGHT */}
          <div className="md:col-span-5">
            <div
              className="p-4"
              style={{
                background: colors.sand,
                border: `2px solid ${colors.ink}`,
                boxShadow: `3px 3px 0 ${colors.ink}`,
              }}
            >
              <div className="grid gap-4">
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <label
                      htmlFor="shop-search"
                      className="text-xs font-black uppercase tracking-widest"
                      style={{ color: colors.muted }}
                    >
                      {t.shop.search}
                    </label>

                    {query.trim().length > 0 && (
                      <button
                        type="button"
                        onClick={() => setQuery("")}
                        className="text-xs font-black uppercase tracking-widest"
                        style={{
                          color: colors.ink,
                          background: "transparent",
                          border: `2px solid ${colors.ink}`,
                          padding: "6px 10px",
                          boxShadow: `2px 2px 0 ${colors.ink}`,
                          cursor: "pointer",
                        }}
                        aria-label={t.shop.clearSearch}
                      >
                        {t.shop.clear}
                      </button>
                    )}
                  </div>

                  <input
                    id="shop-search"
                    type="text"
                    placeholder={t.shop.placeholder}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="mt-2 w-full px-3 py-3 font-black outline-none"
                    style={{
                      background: colors.paper,
                      border: `2px solid ${colors.ink}`,
                      boxShadow: `2px 2px 0 ${colors.ink}`,
                    }}
                    autoComplete="off"
                    inputMode="search"
                  />

                  <div
                    className="mt-2 text-[11px] font-black uppercase tracking-widest"
                    style={{ color: colors.muted }}
                  >
                    {t.shop.tip}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* TAGS */}
        <div className="mt-6 flex flex-wrap gap-2" aria-label={t.shop.filterByTag}>
          {allTags.map((tag, idx) => {
            const active = activeTag === tag

            return (
              <button
                key={tag}
                type="button"
                onClick={() => setActiveTag(tag)}
                aria-pressed={active}
                className="px-3 py-2 text-xs font-black uppercase tracking-widest transition"
                style={{
                  background: active ? colors.accent : colors.paper,
                  color: active ? colors.paper : colors.ink,
                  border: `2px dashed ${colors.ink}`,
                  boxShadow: active
                    ? `3px 3px 0 ${colors.ink}`
                    : `2px 2px 0 ${colors.ink}`,
                  transform: `rotate(${idx % 2 === 0 ? -0.35 : 0.25}deg)`,
                  cursor: "pointer",
                }}
              >
                {tag === "All" ? t.shop.all : tag}
              </button>
            )
          })}
        </div>
      </div>
    </header>
  )
}
