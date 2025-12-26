import { escapeHtml } from "../utils"

export function HandButtonEmail(params: {
  href: string
  label: string
  variant?: "solid" | "outline"
}) {
  const { href, label, variant = "solid" } = params

  const bg = variant === "solid" ? "#2F7C73" : "#FFFCF5"
  const color = variant === "solid" ? "#FFFCF5" : "#111"

  return `
  <a href="${escapeHtml(href)}"
    style="
      display:inline-block;
      padding:12px 18px;
      font-weight:900;
      text-transform:uppercase;
      letter-spacing:0.12em;
      font-size:13px;
      color:${color};
      background:${bg};
      border:2px solid #111;
      box-shadow:3px 3px 0 #111;
      text-decoration:none;
    ">
    ${escapeHtml(label)}
  </a>
  `
}
