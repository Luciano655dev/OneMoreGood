import { Resend } from "resend"

const resendKey = process.env.RESEND_API_KEY
const from = process.env.RESEND_FROM?.replace(/^"(.*)"$/, "$1").trim()

const [, , ownerToArg, buyerToArg] = process.argv
const ownerTo = ownerToArg?.trim() || process.env.ORDERS_TO?.trim()
const buyerTo = buyerToArg?.trim()

if (!resendKey || !from) {
  console.error("Missing RESEND_API_KEY or RESEND_FROM in environment.")
  process.exit(1)
}

if (!ownerTo || !buyerTo) {
  console.error(
    "Usage: npm run test:email -- owner@example.com buyer@example.com"
  )
  process.exit(1)
}

const resend = new Resend(resendKey)
const timestamp = new Date().toISOString()
const orderId = `EMAIL-TEST-${Date.now()}`

function ownerHtml() {
  return `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111;">
      <h2>OneMoreGood owner email test</h2>
      <p><strong>Order:</strong> ${orderId}</p>
      <p><strong>Generated at:</strong> ${timestamp}</p>
      <p><strong>Recipient type:</strong> Owner notification</p>
      <p>This is a direct Resend delivery test from your project.</p>
    </div>
  `
}

function buyerHtml() {
  return `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111;">
      <h2>Your OneMoreGood email test arrived</h2>
      <p>This confirms the buyer-facing confirmation email path can deliver.</p>
      <p><strong>Order:</strong> ${orderId}</p>
      <p><strong>Email:</strong> ${buyerTo}</p>
      <p><strong>Total paid:</strong> $0.01</p>
      <p><strong>Shipping paid:</strong> $0.00</p>
      <h3>Items</h3>
      <ul>
        <li><strong>Test Checkout Sock</strong> x 1</li>
      </ul>
    </div>
  `
}

async function main() {
  const ownerResult = await resend.emails.send({
    from,
    to: ownerTo,
    subject: `OneMoreGood owner email test (${orderId})`,
    html: ownerHtml(),
  })

  if (ownerResult.error) {
    console.error("Owner test email failed:", ownerResult.error)
  } else {
    console.log("Owner test email sent:", ownerResult.data?.id || "ok")
  }

  const buyerResult = await resend.emails.send({
    from,
    to: buyerTo,
    subject: `Your OneMoreGood email test (${orderId})`,
    html: buyerHtml(),
  })

  if (buyerResult.error) {
    console.error("Buyer test email failed:", buyerResult.error)
  } else {
    console.log("Buyer test email sent:", buyerResult.data?.id || "ok")
  }

  if (ownerResult.error || buyerResult.error) {
    process.exit(1)
  }
}

main().catch((error) => {
  console.error("Email test script failed:", error)
  process.exit(1)
})
