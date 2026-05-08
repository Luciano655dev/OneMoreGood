import AdminNavbar from "@/components/Admin/AdminNavbar"
import StockManager from "@/components/Admin/StockManager"
import colors from "@/components/colors"
import SectionTitle from "@/components/Home/Objects/SectionTitle"
import PageGridBackground from "@/components/Layout/PageGridBackground"
import { getStoredProducts } from "@/lib/products"

export const dynamic = "force-dynamic"

export default async function AdminStockPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; updated?: string; error?: string }>
}) {
  const params = await searchParams
  const saved = params.saved === "1"
  const updatedCount = Number(params.updated || 0)
  const error = params.error?.trim() || null
  const products = await getStoredProducts({ includeInactive: true })

  return (
    <div style={{ background: colors.paper, color: colors.ink }}>
      <PageGridBackground />
      <section className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-16">
        <SectionTitle
          kicker="Admin"
          title="Stock manager"
          desc="Adjust U.S. and Brazil inventory separately, and control whether a product is visible in the shop."
        />

        <AdminNavbar currentPath="/admin/stock" />

        {saved ? (
          <div
            className="mt-6 p-3 text-sm font-black"
            style={{
              background: "#DDECE9",
              border: `2px solid ${colors.ink}`,
              color: colors.ink,
            }}
          >
            Product settings updated for {updatedCount} product
            {updatedCount === 1 ? "" : "s"}.
          </div>
        ) : null}

        {error ? (
          <div
            className="mt-6 p-3 text-sm font-black"
            style={{
              background: colors.sand,
              border: `2px dashed ${colors.ink}`,
              color: colors.clay,
            }}
          >
            {error}
          </div>
        ) : null}

        <div className="mt-8">
          <StockManager products={products} />
        </div>
      </section>
    </div>
  )
}
