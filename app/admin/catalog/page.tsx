import AdminNavbar from "@/components/Admin/AdminNavbar"
import CatalogManager from "@/components/Admin/CatalogManager"
import colors from "@/components/colors"
import SectionTitle from "@/components/Home/Objects/SectionTitle"
import PageGridBackground from "@/components/Layout/PageGridBackground"
import { getStoredProducts } from "@/lib/products"

export const dynamic = "force-dynamic"

function getSaveMessage(saved: string, productId: string) {
  if (!saved) return null

  switch (saved) {
    case "created":
      return `Catalog item created: ${productId}.`
    case "updated":
      return `Catalog item updated: ${productId}.`
    case "archived":
      return `Catalog item archived: ${productId}. It stayed in the database because it appears in order history.`
    case "deleted":
      return `Catalog item deleted: ${productId}.`
    default:
      return "Catalog updated."
  }
}

export default async function AdminCatalogPage({
  searchParams,
}: {
  searchParams: Promise<{
    saved?: string
    product?: string
    error?: string
  }>
}) {
  const params = await searchParams
  const error = params.error?.trim() || null
  const saveMessage = getSaveMessage(
    params.saved?.trim() || "",
    params.product?.trim() || "product"
  )
  const products = await getStoredProducts({ includeInactive: true })

  return (
    <div style={{ background: colors.paper, color: colors.ink }}>
      <PageGridBackground />
      <section className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-16">
        <SectionTitle
          kicker="Admin"
          title="Catalog manager"
          desc="Upload product images to Supabase Storage, edit item details, and add or remove products from the shop."
        />

        <AdminNavbar currentPath="/admin/catalog" />

        {saveMessage ? (
          <div
            className="mt-6 p-3 text-sm font-black"
            style={{
              background: "#DDECE9",
              border: `2px solid ${colors.ink}`,
              color: colors.ink,
            }}
          >
            {saveMessage}
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
          <CatalogManager products={products} />
        </div>
      </section>
    </div>
  )
}
