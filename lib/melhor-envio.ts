import { getSupabaseAdmin } from "@/lib/supabase/server"
import { getPackageForItemCount, type ShippingPackage } from "@/lib/commerce"

/**
 * Melhor Envio integration: Correios PAC/SEDEX quotes + printable labels.
 *
 * Docs: https://docs.melhorenvio.com.br/reference
 * Notes:
 *  - The `User-Agent` header is MANDATORY (the API rejects requests without it).
 *  - Generating a label spends from the Melhor Envio wallet balance.
 *  - Use a sandbox token while MELHOR_ENVIO_SANDBOX !== "false".
 */

export const SHIPPING_LABELS_BUCKET =
  process.env.SUPABASE_SHIPPING_LABELS_BUCKET?.trim() || "shipping-labels"

export type ShippingService = "PAC" | "SEDEX"

export type ShippingQuote = {
  service: ShippingService
  meServiceId: number
  priceCents: number
  deliveryDays: number
}

export type ShippingAddress = {
  name: string
  email?: string | null
  phone?: string | null
  document?: string | null // CPF/CNPJ digits
  address: string // street / logradouro
  number: string
  complement?: string | null
  district: string // bairro
  city: string
  state: string // UF, e.g. "SP"
  postalCode: string // CEP
}

function isSandbox() {
  return process.env.MELHOR_ENVIO_SANDBOX !== "false"
}

function getBaseUrl() {
  return isSandbox()
    ? "https://sandbox.melhorenvio.com.br"
    : "https://melhorenvio.com.br"
}

function getUserAgent() {
  const contact =
    process.env.STORE_ORIGIN_EMAIL?.trim() ||
    process.env.ORDERS_TO?.trim() ||
    "contato@onemoregood.com"
  return `OneMoreGood (${contact})`
}

function getToken() {
  const token = process.env.MELHOR_ENVIO_TOKEN?.trim()
  if (!token) {
    throw new Error("MELHOR_ENVIO_TOKEN is not configured.")
  }
  return token
}

function digitsOnly(value?: string | null) {
  return String(value || "").replace(/\D/g, "")
}

async function meRequest<T>(
  path: string,
  init: { method?: string; body?: unknown } = {}
): Promise<T> {
  const res = await fetch(`${getBaseUrl()}${path}`, {
    method: init.method || "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
      "User-Agent": getUserAgent(),
    },
    body: init.body ? JSON.stringify(init.body) : undefined,
    cache: "no-store",
  })

  const text = await res.text()
  let data: unknown = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = text
  }

  if (!res.ok) {
    const message =
      (data && typeof data === "object" && "message" in data
        ? String((data as { message?: unknown }).message)
        : null) || `Melhor Envio request failed (${res.status}).`
    throw new Error(message)
  }

  return data as T
}

function getOriginPostalCode() {
  const cep = digitsOnly(process.env.STORE_ORIGIN_POSTAL_CODE)
  if (!cep) {
    throw new Error("STORE_ORIGIN_POSTAL_CODE is not configured.")
  }
  return cep
}

function getOriginAddress(): ShippingAddress {
  const required = (key: string, value?: string | null) => {
    const trimmed = String(value || "").trim()
    if (!trimmed) {
      throw new Error(`${key} is not configured.`)
    }
    return trimmed
  }

  return {
    name: required("STORE_ORIGIN_NAME", process.env.STORE_ORIGIN_NAME),
    email: process.env.STORE_ORIGIN_EMAIL?.trim() || null,
    phone: digitsOnly(process.env.STORE_ORIGIN_PHONE) || null,
    document: digitsOnly(process.env.STORE_ORIGIN_DOCUMENT) || null,
    address: required("STORE_ORIGIN_ADDRESS", process.env.STORE_ORIGIN_ADDRESS),
    number: required("STORE_ORIGIN_NUMBER", process.env.STORE_ORIGIN_NUMBER),
    complement: process.env.STORE_ORIGIN_COMPLEMENT?.trim() || null,
    district: required("STORE_ORIGIN_DISTRICT", process.env.STORE_ORIGIN_DISTRICT),
    city: required("STORE_ORIGIN_CITY", process.env.STORE_ORIGIN_CITY),
    state: required("STORE_ORIGIN_STATE", process.env.STORE_ORIGIN_STATE),
    postalCode: getOriginPostalCode(),
  }
}

function priceStringToCents(price: unknown) {
  const value = Number(String(price ?? "0").replace(",", "."))
  if (!Number.isFinite(value)) return 0
  return Math.round(value * 100)
}

type CalculateOption = {
  id: number
  name?: string
  price?: string | number
  custom_price?: string | number
  delivery_time?: number
  delivery_range?: { min?: number; max?: number }
  company?: { id?: number; name?: string }
  error?: string
}

function matchService(option: CalculateOption): ShippingService | null {
  const company = String(option.company?.name || "").toLowerCase()
  if (!company.includes("correios")) return null

  const name = String(option.name || "").toLowerCase()
  if (name.includes("sedex")) return "SEDEX"
  if (name.includes("pac")) return "PAC"
  return null
}

/**
 * Quote PAC and SEDEX for a destination CEP and a given number of pairs.
 * Returns only the services that priced successfully.
 */
export async function quoteShipping(params: {
  toPostalCode: string
  pairs: number
  insuranceValue?: number
}): Promise<ShippingQuote[]> {
  const toCep = digitsOnly(params.toPostalCode)
  if (toCep.length !== 8) {
    throw new Error("Invalid destination CEP.")
  }

  const pkg: ShippingPackage = getPackageForItemCount(params.pairs)

  const options = await meRequest<CalculateOption[]>(
    "/api/v2/me/shipment/calculate",
    {
      method: "POST",
      body: {
        from: { postal_code: getOriginPostalCode() },
        to: { postal_code: toCep },
        package: {
          height: pkg.height,
          width: pkg.width,
          length: pkg.length,
          weight: pkg.weight,
        },
        options: {
          insurance_value: params.insuranceValue ?? 0,
          receipt: false,
          own_hand: false,
        },
      },
    }
  )

  const quotes: ShippingQuote[] = []
  for (const option of options || []) {
    if (option.error) continue
    const service = matchService(option)
    if (!service) continue
    if (quotes.some((q) => q.service === service)) continue

    quotes.push({
      service,
      meServiceId: option.id,
      priceCents: priceStringToCents(option.custom_price ?? option.price),
      deliveryDays: Number(
        option.delivery_range?.max ?? option.delivery_time ?? 0
      ),
    })
  }

  return quotes
}

function buildPartyPayload(party: ShippingAddress) {
  return {
    name: party.name,
    phone: party.phone || undefined,
    email: party.email || undefined,
    document: party.document || undefined,
    address: party.address,
    complement: party.complement || undefined,
    number: party.number,
    district: party.district,
    city: party.city,
    state_abbr: party.state,
    country_id: "BR",
    postal_code: digitsOnly(party.postalCode),
  }
}

export type CreateLabelResult = {
  meOrderId: string
  trackingNumber: string | null
  labelUrl: string
}

/**
 * Buy + generate a printable label for an order, then mirror the PDF into
 * Supabase storage so it can be re-downloaded without a Melhor Envio session.
 */
export async function createLabel(params: {
  orderId: string
  meServiceId: number
  to: ShippingAddress
  products: Array<{ name: string; quantity: number; unitaryValueCents: number }>
  pairs: number
  insuranceValueCents?: number
}): Promise<CreateLabelResult> {
  const pkg = getPackageForItemCount(params.pairs)
  const insuranceValue = (params.insuranceValueCents ?? 0) / 100

  const cartItem = await meRequest<{ id: string }>("/api/v2/me/cart", {
    method: "POST",
    body: {
      service: params.meServiceId,
      from: buildPartyPayload(getOriginAddress()),
      to: buildPartyPayload(params.to),
      products: params.products.map((product) => ({
        name: product.name,
        quantity: product.quantity,
        unitary_value: product.unitaryValueCents / 100,
      })),
      volumes: [
        {
          height: pkg.height,
          width: pkg.width,
          length: pkg.length,
          weight: pkg.weight,
        },
      ],
      options: {
        insurance_value: insuranceValue,
        receipt: false,
        own_hand: false,
        reverse: false,
        non_commercial: true,
        platform: "OneMoreGood",
      },
    },
  })

  const meOrderId = cartItem.id

  // Pay for the shipment from the Melhor Envio wallet.
  await meRequest("/api/v2/me/shipment/checkout", {
    method: "POST",
    body: { orders: [meOrderId] },
  })

  // Generate the label (registers the object with Correios).
  await meRequest("/api/v2/me/shipment/generate", {
    method: "POST",
    body: { orders: [meOrderId] },
  })

  // Retrieve the printable PDF URL.
  const printResult = await meRequest<{ url?: string } | string>(
    "/api/v2/me/shipment/print",
    {
      method: "POST",
      body: { mode: "private", orders: [meOrderId] },
    }
  )

  const pdfUrl =
    typeof printResult === "string"
      ? printResult
      : String(printResult?.url || "")

  if (!pdfUrl) {
    throw new Error("Melhor Envio did not return a label URL.")
  }

  // Best-effort: read the tracking code from the order record.
  let trackingNumber: string | null = null
  try {
    const order = await meRequest<{ tracking?: string | null }>(
      `/api/v2/me/orders/${meOrderId}`
    )
    trackingNumber = order?.tracking ? String(order.tracking) : null
  } catch {
    trackingNumber = null
  }

  const labelUrl = await mirrorLabelPdf(params.orderId, pdfUrl)

  return { meOrderId, trackingNumber, labelUrl }
}

/**
 * Download the label PDF from Melhor Envio and store it in Supabase so the
 * admin can re-print it later. Falls back to the original URL on failure.
 */
async function mirrorLabelPdf(orderId: string, pdfUrl: string) {
  try {
    const res = await fetch(pdfUrl, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "User-Agent": getUserAgent(),
        Accept: "application/pdf",
      },
      cache: "no-store",
    })
    if (!res.ok) return pdfUrl

    const buffer = Buffer.from(await res.arrayBuffer())
    const supabase = getSupabaseAdmin()
    const objectPath = `orders/${orderId}-${Date.now()}.pdf`

    const { error } = await supabase.storage
      .from(SHIPPING_LABELS_BUCKET)
      .upload(objectPath, buffer, {
        contentType: "application/pdf",
        upsert: true,
      })
    if (error) return pdfUrl

    const {
      data: { publicUrl },
    } = supabase.storage.from(SHIPPING_LABELS_BUCKET).getPublicUrl(objectPath)
    return publicUrl || pdfUrl
  } catch {
    return pdfUrl
  }
}
