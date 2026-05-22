import Link from "next/link"

import FormSubmitButton from "@/components/Admin/FormSubmitButton"
import colors from "@/components/colors"

type AdminNavbarProps = {
  currentPath: string
}

const links = [
  { href: "/admin/orders/new", label: "Log purchase", tone: "primary" },
  { href: "/admin/orders", label: "Orders", tone: "default" },
  { href: "/admin/catalog", label: "Catalog", tone: "default" },
  { href: "/admin/stock", label: "Stock", tone: "default" },
]

export default function AdminNavbar({ currentPath }: AdminNavbarProps) {
  return (
    <div className="mt-3 mb-10 flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap gap-3">
        {links.map((link) => {
          const isActive =
            currentPath === link.href ||
            (link.href !== "/" && currentPath.startsWith(`${link.href}/`))

          return (
            <Link
              key={link.href}
              href={link.href}
              className="btnInteractive inline-flex px-4 py-3 text-xs font-black uppercase tracking-widest"
              style={{
                background:
                  link.tone === "primary" && !isActive
                    ? colors.accent
                    : colors.paper,
                color:
                  link.tone === "primary" && !isActive
                    ? colors.paper
                    : colors.ink,
                border: `2px solid ${colors.ink}`,
                boxShadow: isActive
                  ? `inset 0 -4px 0 ${colors.accent}, 2px 2px 0 ${colors.ink}`
                  : `2px 2px 0 ${colors.ink}`,
                ...(link.tone === "primary" && !isActive
                  ? {
                      boxShadow: `2px 2px 0 ${colors.ink}`,
                    }
                  : {}),
              }}
            >
              {link.label}
            </Link>
          )
        })}
      </div>

      <form action="/admin/logout" method="post">
        <FormSubmitButton
          idleLabel="Log out"
          pendingLabel="Logging out..."
          className="px-4 py-3 text-xs font-black uppercase tracking-widest"
          style={{
            background: colors.clay,
            color: colors.paper,
            border: `2px solid ${colors.ink}`,
            boxShadow: `2px 2px 0 ${colors.ink}`,
          }}
        />
      </form>
    </div>
  )
}
