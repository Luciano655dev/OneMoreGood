import colors from "@/components/colors"
import FormSubmitButton from "@/components/Admin/FormSubmitButton"
import PasswordInput from "@/components/Admin/PasswordInput"
import RoughBorder from "@/components/Home/Objects/RoughBorder"
import SectionTitle from "@/components/Home/Objects/SectionTitle"
import PageGridBackground from "@/components/Layout/PageGridBackground"

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams
  const error =
    params.error === "invalid"
      ? "Wrong password."
      : params.error === "missing"
        ? "Admin password is not configured."
        : null

  return (
    <div
      className="h-full"
      style={{ background: colors.paper, color: colors.ink }}
    >
      <PageGridBackground />
      <section className="mx-auto flex min-h-[calc(100vh-220px)] max-w-3xl flex-col justify-center px-4 py-12 md:px-6 md:py-16">
        <SectionTitle
          kicker="Admin"
          title="Protected dashboard"
          desc="Enter the admin password to access orders, shipping updates, and tracking controls."
        />

        <div className="mt-8 max-w-xl">
          <RoughBorder bg={colors.sand} label="Admin login">
            <form action="/admin/auth" method="post" className="grid gap-4">
              <div>
                <label
                  className="text-[11px] font-black uppercase tracking-widest"
                  style={{ color: colors.muted }}
                >
                  Password
                </label>
                <PasswordInput />
              </div>

              {error ? (
                <div
                  className="p-3 text-sm font-black"
                  style={{
                    background: colors.paper,
                    border: `2px dashed ${colors.ink}`,
                    color: colors.clay,
                  }}
                >
                  {error}
                </div>
              ) : null}

              <FormSubmitButton
                idleLabel="Enter dashboard"
                pendingLabel="Entering..."
                className="px-4 py-3 text-xs font-black uppercase tracking-widest"
                style={{
                  background: colors.accent,
                  color: colors.paper,
                  border: `2px solid ${colors.ink}`,
                  boxShadow: `3px 3px 0 ${colors.ink}`,
                }}
              />
            </form>
          </RoughBorder>
        </div>
      </section>
    </div>
  )
}
