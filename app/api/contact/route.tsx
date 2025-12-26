import { NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

type Body = {
  name: string
  email: string
  message: string
}

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<Body>

    const name = (body.name || "").trim()
    const email = (body.email || "").trim()
    const message = (body.message || "").trim()

    if (!name || !email || !message) {
      return NextResponse.json(
        { ok: false, error: "Missing fields" },
        { status: 400 }
      )
    }

    // super basic email sanity check
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json(
        { ok: false, error: "Invalid email" },
        { status: 400 }
      )
    }

    const to = process.env.ORDERS_TO
    const from = process.env.RESEND_FROM

    if (!to || !from || !process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { ok: false, error: "Server not configured" },
        { status: 500 }
      )
    }

    const subject = `New message from ${name} (OneMoreGood contact form)`

    const html = `
      <div style="font-family: ui-sans-serif, system-ui; line-height: 1.5;">
        <h2 style="margin:0 0 12px;">New Contact Message</h2>
        <p style="margin:0 0 8px;"><b>Name:</b> ${escapeHtml(name)}</p>
        <p style="margin:0 0 8px;"><b>Email:</b> ${escapeHtml(email)}</p>
        <p style="margin:16px 0 6px;"><b>Message:</b></p>
        <div style="white-space: pre-wrap; padding: 12px; border: 1px solid #ddd; border-radius: 8px;">
          ${escapeHtml(message)}
        </div>
      </div>
    `

    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
      replyTo: email,
    })

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true, id: data?.id })
  } catch (err) {
    console.error("Contact POST error", err)
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 }
    )
  }
}
