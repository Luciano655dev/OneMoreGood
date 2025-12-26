"use client"
import { useEffect, useMemo, useRef, useState } from "react"
import "../components/Home/home.css"

// Sections
import Hero from "@/components/Home/Sections/Hero"
import About from "@/components/Home/Sections/About"
import MayorFeature from "@/components/Home/Sections/MayorFeature"
import HowItWorks from "@/components/Home/Sections/HowItWorks"
import Impact from "@/components/Home/Sections/Impact"
import Shop from "@/components/Home/Sections/Shop"
import Contact from "@/components/Home/Sections/Contact"

import colors from "@/components/colors"

export default function OneMoreGood() {
  // scroll reveal system
  const rootRef = useRef(null)
  useEffect(() => {
    const els = Array.from(document.querySelectorAll("[data-reveal]"))
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in")
            io.unobserve(e.target)
          }
        }
      },
      { threshold: 0.15 }
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  // parallax doodles (tiny)
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || 0
      document.documentElement.style.setProperty("--scrollY", String(y))
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <div ref={rootRef} style={{ background: colors.paper, color: colors.ink }}>
      {/* background pattern */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          opacity: 1,
          backgroundImage: `
            radial-gradient(circle at 1px 1px, rgba(0,0,0,0.06) 1px, transparent 0),
            repeating-linear-gradient(0deg, rgba(0,0,0,0.03) 0 1px, transparent 1px 18px),
            repeating-linear-gradient(90deg, rgba(0,0,0,0.02) 0 1px, transparent 1px 22px)
          `,
          backgroundSize: "14px 14px, 18px 18px, 22px 22px",
          mixBlendMode: "multiply",
        }}
      />

      <Hero />
      <About />
      <MayorFeature />
      <HowItWorks />
      <Impact />
      <Shop />
      <Contact />
    </div>
  )
}
