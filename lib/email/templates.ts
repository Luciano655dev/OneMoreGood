import { escapeHtml, money } from "./utils"
import { HandButtonEmail } from "./components/HandButtonEmail"
import { RoughBorderEmail } from "./components/RoughBorderEmail"

export type EmailCardItem = {
  productId: string
  title: string
  price: number
  image?: string
  qty: number
}

const PICKUP_LABEL = "Windermere Preparatory School, Florida"
const PICKUP_URL = "https://www.nordangliaeducation.com/wps-florida"

/* Base layout */
function layout(content: string) {
  return `
  <div style="margin:0;padding:0;background:#fff;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
      style="background:#fff;padding:22px 0;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" role="presentation"
            style="width:600px;max-width:92vw;">
            <tr>
              <td style="padding:0 12px;">
                ${content}
              </td>
            </tr>

            <tr>
              <td style="padding:14px 12px 0;font-size:11px;color:#111;font-weight:900;letter-spacing:0.08em;">
                OneMoreGood • Proof over promises
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
  `
}

function titleBlock(params: { title: string; subtitle: string }) {
  const { title, subtitle } = params

  return RoughBorderEmail({
    label: "OneMoreGood",
    children: `
      <div style="font-size:28px;font-weight:1000;color:#111;line-height:1.1;">
        ${escapeHtml(title)}
      </div>
      <div style="margin-top:8px;font-size:13px;font-weight:900;color:#111;line-height:1.5;">
        ${escapeHtml(subtitle)}
      </div>
    `,
  })
}

/* Product list (black/white, square) */
export function buildProductCardsHtml(items: EmailCardItem[]) {
  return items
    .map((it) => {
      const title = escapeHtml(it.title)
      const line = it.price * it.qty

      return `
      <tr>
        <td style="padding:8px 0;">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
            style="border:2px solid #111;background:#fff;">
            <tr>
              <td style="padding:10px;">
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                    <td valign="top">
                      <div style="font-weight:1000;font-size:14px;color:#111;line-height:1.2;">
                        ${title}
                      </div>
                      <div style="margin-top:4px;font-size:12px;font-weight:900;color:#111;">
                        Qty: ${it.qty}
                      </div>
                    </td>
                    <td align="right" valign="top">
                      <div style="font-weight:1000;font-size:13px;color:#111;">
                        $${money(it.price)}
                      </div>
                      <div style="margin-top:4px;font-weight:1000;font-size:12px;color:#111;">
                        $${money(line)}
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      `
    })
    .join("")
}

/* Buyer email */
export function buildBuyerEmailHtml(params: {
  orderId: string
  pickupLocation: string // ignored (we force the WPS label)
  pickupWhen: string
  productCardsHtml: string
  subtotal: number
  shipping: number // ignored
  total: number
}) {
  const { orderId, pickupWhen, productCardsHtml, subtotal, total } = params

  const top = titleBlock({
    title: "Reserved ✅",
    subtitle: "Your order is reserved. Pick it up at school.",
  })

  const details = RoughBorderEmail({
    label: "Pickup details",
    children: `
    <div style="font-weight:1000;font-size:13px;color:#111;line-height:1.6;">
      <div>
        📍 <a href="${escapeHtml(
          PICKUP_URL
        )}" style="color:#111;text-decoration:underline;font-weight:1000;">
          ${escapeHtml(PICKUP_LABEL)}
        </a>
      </div>
    </div>

    <div style="margin-top:6px;font-weight:1000;font-size:13px;color:#111;">
      🗓 ${escapeHtml(pickupWhen)}
    </div>

    <div style="margin-top:12px;font-size:12px;color:#111;">
      <strong>Order ID:</strong> ${escapeHtml(orderId)}
    </div>

    <div style="margin-top:14px;">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
        ${productCardsHtml}
      </table>
    </div>

    <div style="margin-top:14px;border-top:2px dashed #111;padding-top:10px;">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
        style="font-weight:1000;font-size:13px;color:#111;">
        <tr>
          <td>Subtotal</td>
          <td align="right">$${money(subtotal)}</td>
        </tr>
        <tr style="font-size:16px;">
          <td style="padding-top:10px;">Total</td>
          <td align="right" style="padding-top:10px;">$${money(total)}</td>
        </tr>
      </table>
    </div>

    <div style="margin-top:14px;font-size:12px;font-weight:900;color:#111;line-height:1.6;">
      If you’re not able to pick it up or made this by mistake, just reply to this email.<br/>
      Keep this email as your pickup confirmation.
    </div>

    <div style="margin-top:16px;">
      ${HandButtonEmail({
        href: "https://onemoregood.org/shop",
        label: "Shop to support",
        variant: "solid",
      })}
    </div>
  `,
  })

  return layout(`
    ${top}
    <div style="height:14px;line-height:14px;font-size:14px;">&nbsp;</div>
    ${details}
  `)
}

/* Owner email */
export function buildOwnerEmailHtml(params: {
  orderId: string
  customerEmail: string
  pickupLocation: string // ignored (we force the WPS label)
  pickupWhen: string
  productCardsHtml: string
  subtotal: number
  shipping: number // ignored
  total: number
}) {
  const {
    orderId,
    customerEmail,
    pickupWhen,
    productCardsHtml,
    subtotal,
    total,
  } = params

  const top = titleBlock({
    title: "New order reserved",
    subtitle: "Pickup at Windermere Prep.",
  })

  const body = RoughBorderEmail({
    label: "Admin details",
    children: `
    <div style="font-size:13px;font-weight:1000;color:#111;line-height:1.6;">
      <div><strong>Order:</strong> ${escapeHtml(orderId)}</div>
      <div><strong>Email:</strong> ${escapeHtml(customerEmail)}</div>
    </div>

    <div style="margin-top:8px;font-size:13px;font-weight:1000;color:#111;">
      📍 <a href="${escapeHtml(
        PICKUP_URL
      )}" style="color:#111;text-decoration:underline;font-weight:1000;">
        ${escapeHtml(PICKUP_LABEL)}
      </a>
    </div>

    <div style="margin-top:6px;font-size:13px;font-weight:1000;color:#111;">
      🗓 ${escapeHtml(pickupWhen)}
    </div>

    <div style="margin-top:14px;">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
        ${productCardsHtml}
      </table>
    </div>

    <div style="margin-top:14px;border-top:2px dashed #111;padding-top:10px;">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
        style="font-weight:1000;font-size:13px;color:#111;">
        <tr>
          <td>Subtotal</td>
          <td align="right">$${money(subtotal)}</td>
        </tr>
        <tr style="font-size:16px;">
          <td style="padding-top:10px;">Total</td>
          <td align="right" style="padding-top:10px;">$${money(total)}</td>
        </tr>
      </table>
    </div>

    <div style="margin-top:14px;font-size:12px;font-weight:900;color:#111;line-height:1.6;">
      If the customer can’t pick up, they’ll reply to the email confirmation.
    </div>
  `,
  })

  return layout(`
    ${top}
    <div style="height:14px;line-height:14px;font-size:14px;">&nbsp;</div>
    ${body}
  `)
}
