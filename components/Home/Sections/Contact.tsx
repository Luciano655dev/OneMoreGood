"use client"

import { useState } from "react"

import SectionTitle from "../Objects/SectionTitle"
import RoughBorder from "../Objects/RoughBorder"
import HandButton from "../Objects/HandButton"
import colors from "@/components/colors"

import { Mail, Instagram, Twitter } from "lucide-react"

export default function Contact() {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle")
  const [msg, setMsg] = useState("")

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setStatus("idle")
    setMsg("")

    const form = new FormData(e.currentTarget)
    const payload = {
      name: String(form.get("name") || ""),
      email: String(form.get("email") || ""),
      message: String(form.get("message") || ""),
    }

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setStatus("error")
        setMsg(data?.error || "Could not send. Try again.")
        return
      }

      setStatus("ok")
      setMsg("Sent! We’ll get back to you soon.")
      e.currentTarget.reset()
    } catch {
      setStatus("ok")
      setMsg("Sent! We’ll get back to you soon.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <section id="contact" className="max-w-7xl mx-auto px-6 py-14">
        <SectionTitle
          kicker="Contact"
          title="Talk to us"
          desc="Partnerships, volunteers, press, questions."
        />

        <div className="mt-10 grid md:grid-cols-12 gap-8 items-start">
          <div className="md:col-span-5">
            <RoughBorder
              bg={colors.paper}
              rotate={-0.2}
              label="Direct"
              delay={60}
            >
              <div className="grid gap-4 text-sm font-black">
                <div
                  style={{
                    borderTop: `2px solid ${colors.ink}`,
                    paddingTop: 12,
                    color: colors.muted,
                  }}
                  className="flex items-center gap-3"
                >
                  <Mail size={18} />
                  lucianomenezes655@gmail.com
                </div>

                <div
                  style={{
                    borderTop: `2px solid ${colors.ink}`,
                    paddingTop: 12,
                    color: colors.muted,
                  }}
                  className="flex items-center gap-3"
                >
                  <Instagram size={18} />
                  @lucianohlmenezes
                </div>

                <div
                  style={{
                    borderTop: `2px solid ${colors.ink}`,
                    paddingTop: 12,
                    color: colors.muted,
                  }}
                  className="flex items-center gap-3"
                >
                  <Twitter size={18} />
                  @Luciano655dev
                </div>
              </div>
            </RoughBorder>
          </div>

          <div className="md:col-span-7">
            <RoughBorder
              bg={colors.sand}
              rotate={0.2}
              label="Message"
              delay={140}
            >
              <form className="grid gap-4" onSubmit={onSubmit}>
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    name="name"
                    required
                    placeholder="Name"
                    className="px-3 py-3 font-black"
                    style={{
                      background: colors.paper,
                      border: `2px solid ${colors.ink}`,
                      boxShadow: `2px 2px 0 ${colors.ink}`,
                    }}
                  />
                  <input
                    name="email"
                    required
                    type="email"
                    placeholder="Email"
                    className="px-3 py-3 font-black"
                    style={{
                      background: colors.paper,
                      border: `2px solid ${colors.ink}`,
                      boxShadow: `2px 2px 0 ${colors.ink}`,
                    }}
                  />
                </div>

                <textarea
                  name="message"
                  required
                  placeholder="Message"
                  className="px-3 py-3 font-black h-28"
                  style={{
                    background: colors.paper,
                    border: `2px solid ${colors.ink}`,
                    boxShadow: `2px 2px 0 ${colors.ink}`,
                  }}
                />

                <div className="flex flex-wrap items-center gap-3">
                  <HandButton variant="solid" disabled={loading}>
                    {loading ? "Sending..." : "Send"}
                  </HandButton>

                  {status !== "idle" && (
                    <div
                      className="text-sm font-black"
                      style={{
                        color: status === "ok" ? colors.ink : colors.muted,
                      }}
                    >
                      {msg}
                    </div>
                  )}
                </div>
              </form>
            </RoughBorder>
          </div>
        </div>
      </section>
    </div>
  )
}
