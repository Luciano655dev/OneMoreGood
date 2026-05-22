import Image from "next/image"
import { Heart, MapPin, NotebookText, Sparkles, Users2 } from "lucide-react"

import colors from "@/components/colors"
import RoughBorder from "@/components/Home/Objects/RoughBorder"
import SectionTitle from "@/components/Home/Objects/SectionTitle"
import PageGridBackground from "@/components/Layout/PageGridBackground"

const team = [
  {
    name: "Luciano Menezes",
    role: "Founder and CEO",
    image: "/about/LucianoPFP.png",
    location: "Joao Pessoa, Paraiba",
    detail: "Studying at Windermere Prep in Orlando.",
    why:
      "I started OneMoreGood, but from the beginning I wanted it to become something bigger than one person. What mattered to me was building a real company with people I trust, where business, identity, and ambition could all live in the same place.",
  },
  {
    name: "Manu",
    role: "CEO",
    image: "/about/ManuPFP.png",
    location: "Presidente Prudente, Sao Paulo",
    detail: "Part of the team shaping the brand and its direction.",
    why:
      "For me, OneMoreGood was a chance to help shape something from the start instead of stepping into something already finished. I liked the idea of building a brand with people close to me and giving it a personality that actually feels ours.",
  },
  {
    name: "Luisa",
    role: "CEO",
    image: "/about/LuisaPFP.jpg",
    location: "Presidente Prudente, Sao Paulo",
    detail: "Part of the team shaping the voice and future of the project.",
    why:
      "What drew me in was that OneMoreGood never felt cold or corporate. It felt personal. I wanted to help build a brand that could stay stylish, thoughtful, and close to who we really are even as it grows.",
  },
] as const

const storyPoints = [
  {
    title: "How it started",
    text:
      "OneMoreGood started with the simple idea that if we were going to build something, it should be real. Real products. Real work. Real responsibility. We did not want to hide behind a concept. We wanted to create a brand people could actually buy from and remember.",
    Icon: Sparkles,
  },
  {
    title: "Why we exist",
    text:
      "We exist because we believe a small team can build a serious company without becoming bland. We care about selling well, but we also care about tone, trust, and making something that still feels human when people land on the site.",
    Icon: Heart,
  },
  {
    title: "What we are building",
    text:
      "We are building OneMoreGood together as a brand with personality, discipline, and room to grow. The point is not just to have a store online. The point is to build a company that feels distinct, well-made, and worth following.",
    Icon: NotebookText,
  },
] as const

export default function AboutPage() {
  return (
    <div style={{ background: colors.paper, color: colors.ink }}>
      <PageGridBackground />

      <section className="mx-auto max-w-7xl px-6 py-14 md:py-16">
        <SectionTitle
          kicker="About Us"
          title="The people and story behind OneMoreGood"
          desc="We built OneMoreGood as a brand we would actually be proud to stand behind: direct, personal, ambitious, and grounded in the people creating it."
        />

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_420px]">
          <RoughBorder bg={colors.paper} label="Our story" delay={40}>
            <div className="grid gap-5">
              <p className="text-sm leading-relaxed" style={{ color: colors.muted }}>
                OneMoreGood did not begin as a school project we planned to forget
                later. We started it because we wanted to build something with
                weight behind it: a real brand, with real customers, real products,
                and a real standard for how it should look and feel.
              </p>

              <p className="text-sm leading-relaxed" style={{ color: colors.muted }}>
                Luciano came to this from Joao Pessoa, Paraiba, and is now
                studying at Windermere Prep in Orlando. Manu and Luisa came from
                Presidente Prudente, Sao Paulo. Different places, different
                experiences, same instinct: if we were going to make something,
                it should feel like us and it should be built seriously.
              </p>

              <p className="text-sm leading-relaxed" style={{ color: colors.muted }}>
                That is why OneMoreGood exists. Not to imitate what every other
                store is doing, but to build a company with its own tone, its
                own standards, and its own point of view. Luciano may have founded
                it, but the brand you are seeing here was built as a team.
              </p>

              <div
                className="grid gap-4 sm:grid-cols-3"
                style={{ borderTop: `2px solid ${colors.ink}`, paddingTop: 16 }}
              >
                <div>
                  <div className="flex items-center gap-2 font-black">
                    <Users2 size={18} />
                    Team-led
                  </div>
                  <div className="mt-2 text-sm" style={{ color: colors.muted }}>
                    Built together by a close team with different strengths and one
                    shared standard.
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 font-black">
                    <Sparkles size={18} />
                    Brand-minded
                  </div>
                  <div className="mt-2 text-sm" style={{ color: colors.muted }}>
                    We care about tone, design, and presence, not just inventory.
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 font-black">
                    <Heart size={18} />
                    Purpose-aware
                  </div>
                  <div className="mt-2 text-sm" style={{ color: colors.muted }}>
                    We want the business to carry identity, perspective, and
                    something worth believing in.
                  </div>
                </div>
              </div>
            </div>
          </RoughBorder>

          <RoughBorder bg={colors.sand} label="At a glance" delay={120}>
            <div className="grid gap-4">
              <div
                className="p-4"
                style={{
                  background: colors.paper,
                  border: `2px solid ${colors.ink}`,
                  boxShadow: `3px 3px 0 ${colors.ink}`,
                }}
              >
                <div className="text-[11px] font-black uppercase tracking-widest" style={{ color: colors.muted }}>
                  Team origins
                </div>
                <div className="mt-2 flex items-start gap-3 text-sm">
                  <MapPin size={18} className="mt-0.5 shrink-0" />
                  <div style={{ color: colors.muted }}>
                    Joao Pessoa, Paraiba and Presidente Prudente, Sao Paulo,
                    with Luciano currently studying in Orlando.
                  </div>
                </div>
              </div>

              <div
                className="p-4"
                style={{
                  background: colors.paper,
                  border: `2px solid ${colors.ink}`,
                  boxShadow: `3px 3px 0 ${colors.ink}`,
                }}
              >
                <div className="text-[11px] font-black uppercase tracking-widest" style={{ color: colors.muted }}>
                  What we want
                </div>
                <div className="mt-2 text-sm" style={{ color: colors.muted }}>
                  To grow OneMoreGood into a real brand with sharp execution,
                  clear taste, and a story that never disappears behind the product.
                </div>
              </div>
            </div>
          </RoughBorder>
        </div>

        <div className="mt-12">
          <SectionTitle
            kicker="Team"
            title="Meet the team"
            desc="If you are reading this, this is us talking to you through the project we built together."
          />

          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {team.map((member, index) => (
              <RoughBorder
                key={member.name}
                bg={index % 2 === 0 ? colors.sand : colors.paper}
                label={member.role}
                delay={80 + index * 80}
              >
                <div className="grid gap-4">
                  <div
                    className="relative aspect-[4/4.6] overflow-hidden"
                    style={{
                      background: colors.paper,
                      border: `2px solid ${colors.ink}`,
                      boxShadow: `3px 3px 0 ${colors.ink}`,
                    }}
                  >
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      sizes="(max-width: 1280px) 50vw, 33vw"
                      className="object-cover"
                    />
                  </div>

                  <div>
                    <div className="text-2xl font-black">{member.name}</div>
                    <div className="mt-1 text-sm font-black" style={{ color: colors.muted }}>
                      {member.role}
                    </div>
                  </div>

                  <div
                    className="text-sm"
                    style={{
                      color: colors.muted,
                      borderTop: `2px solid ${colors.ink}`,
                      paddingTop: 12,
                    }}
                  >
                    <strong style={{ color: colors.ink }}>From:</strong>{" "}
                    {member.location}
                    <div className="mt-2">{member.detail}</div>
                  </div>

                  <div
                    className="text-sm leading-relaxed"
                    style={{
                      color: colors.muted,
                      borderTop: `2px solid ${colors.ink}`,
                      paddingTop: 12,
                    }}
                  >
                    {member.why}
                  </div>
                </div>
              </RoughBorder>
            ))}
          </div>
        </div>

        <div className="mt-12">
          <SectionTitle
            kicker="Story"
            title="Why OneMoreGood exists"
            desc="We wanted a store that could function like a real business without sounding like every other brand on the internet."
          />

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {storyPoints.map(({ title, text }, index) => (
              <RoughBorder
                key={title}
                bg={index === 1 ? colors.sand : colors.paper}
                label={title}
                delay={90 + index * 70}
              >
                <div className="grid gap-3">
                  <p className="text-sm leading-relaxed" style={{ color: colors.muted }}>
                    {text}
                  </p>
                </div>
              </RoughBorder>
            ))}
          </div>
        </div>

        <div className="mt-12">
          <RoughBorder bg={colors.sand} label="Looking ahead" delay={180}>
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-start">
              <div>
                <div className="text-3xl font-black leading-tight">
                  We want OneMoreGood to grow without losing its voice.
                </div>
                <p className="mt-4 text-sm leading-relaxed" style={{ color: colors.muted }}>
                  As the company evolves, we want the products, the customer
                  experience, and the story to keep moving in the same direction.
                  The long-term goal is not just to sell. It is to build something
                  memorable enough that people can feel there are real people behind it.
                </p>
              </div>

              <div
                className="p-4"
                style={{
                  background: colors.paper,
                  border: `2px solid ${colors.ink}`,
                  boxShadow: `3px 3px 0 ${colors.ink}`,
                }}
              >
                <div className="flex items-center gap-2 font-black">
                  <Heart size={18} />
                  What matters to us
                </div>
                <ul className="mt-3 list-disc pl-5 text-sm" style={{ color: colors.muted }}>
                  <li>Building something real together</li>
                  <li>Keeping the brand personal, sharp, and recognizable</li>
                  <li>Growing on our own terms instead of copying the usual formula</li>
                </ul>
              </div>
            </div>
          </RoughBorder>
        </div>
      </section>
    </div>
  )
}
