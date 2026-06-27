import type { Metadata } from "next"
import "./globals.css"
import Navbar from "@/components/Layout/Navbar"
import Footer from "@/components/Layout/Footer"

function SiteStyles() {
  return (
    <style>{`
      .btnInk{ transition: transform 120ms ease, box-shadow 120ms ease, filter 200ms ease; }
      .btnInk:hover{ transform: translateY(-2px) rotate(-0.2deg); box-shadow: 5px 5px 0 #151515; filter:saturate(1.05); }
      .jitter:hover{ transform: rotate(0.35deg); }
    `}</style>
  )
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className="min-h-screen flex flex-col">
        <SiteStyles />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  title: "OneMoreGood",
  description:
    "Shop graphic socks with personality, comfort, and a mission. OneMoreGood connects standout ecommerce with local collaborations and donation work.",
  icons: {
    icon: "/brand/Logo.png",
  },
}
