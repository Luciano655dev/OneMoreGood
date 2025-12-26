import { escapeHtml } from "../utils"

export function RoughBorderEmail(params: { label?: string; children: string }) {
  const { label, children } = params

  return `
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
    style="border:2px solid #111;background:#fff;">
    <tr>
      <td style="padding:4px;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
          style="border:1.5px solid #111;background:#fff;">
          
          ${
            label
              ? `
            <tr>
              <td style="
                padding:10px 14px;
                border-bottom:2px solid #111;
                background:#fff;
                font-weight:900;
                text-transform:uppercase;
                letter-spacing:0.12em;
                font-size:12px;
                color:#111;
              ">
                ${escapeHtml(label)}
              </td>
            </tr>
          `
              : ""
          }

          <tr>
            <td style="padding:16px;color:#111;">
              ${children}
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
  `
}
