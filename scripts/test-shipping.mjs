// Verify the Melhor Envio integration against the sandbox.
//
// Usage:
//   node --env-file=.env.local scripts/test-shipping.mjs <destinationCEP> [--label]
//
//   <destinationCEP>  e.g. 20040020
//   --label           also runs the full buy+generate+print flow (spends sandbox balance)
//
// Requires in .env.local: MELHOR_ENVIO_TOKEN, MELHOR_ENVIO_SANDBOX,
// STORE_ORIGIN_POSTAL_CODE (+ the rest of STORE_ORIGIN_* for --label).

const token = process.env.MELHOR_ENVIO_TOKEN?.trim()
const sandbox = process.env.MELHOR_ENVIO_SANDBOX !== "false"
const baseUrl = sandbox
  ? "https://sandbox.melhorenvio.com.br"
  : "https://melhorenvio.com.br"
const userAgent = `OneMoreGood (${
  process.env.STORE_ORIGIN_EMAIL?.trim() ||
  process.env.ORDERS_TO?.trim() ||
  "contato@onemoregood.com"
})`

const [, , cepArg, ...flags] = process.argv
const destCep = (cepArg || "").replace(/\D/g, "")
const runLabel = flags.includes("--label")
const originCep = (process.env.STORE_ORIGIN_POSTAL_CODE || "").replace(/\D/g, "")

if (!token) {
  console.error("Missing MELHOR_ENVIO_TOKEN in environment.")
  process.exit(1)
}
if (destCep.length !== 8) {
  console.error("Usage: node scripts/test-shipping.mjs <destinationCEP> [--label]")
  process.exit(1)
}
if (originCep.length !== 8) {
  console.error("Missing/invalid STORE_ORIGIN_POSTAL_CODE in environment.")
  process.exit(1)
}

function headers() {
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    "User-Agent": userAgent,
  }
}

async function call(path, body, method = "POST") {
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: headers(),
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  let data
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = text
  }
  if (!res.ok) {
    throw new Error(`${path} -> ${res.status}: ${JSON.stringify(data)}`)
  }
  return data
}

// Flat package estimate for ~3 pairs of socks.
const pkg = { height: 4, width: 11, length: 16, weight: 0.29 }

async function main() {
  console.log(`Env: ${sandbox ? "SANDBOX" : "PRODUCTION"} (${baseUrl})`)
  console.log(`Origin CEP ${originCep} -> Dest CEP ${destCep}\n`)

  console.log("== Quote (shipment/calculate) ==")
  const quotes = await call("/api/v2/me/shipment/calculate", {
    from: { postal_code: originCep },
    to: { postal_code: destCep },
    package: pkg,
    options: { insurance_value: 0, receipt: false, own_hand: false },
  })

  const correios = (quotes || []).filter((q) =>
    String(q.company?.name || "").toLowerCase().includes("correios")
  )
  for (const q of correios) {
    if (q.error) {
      console.log(`  ${q.name}: ERROR -> ${q.error}`)
    } else {
      console.log(
        `  [${q.id}] ${q.name}: R$ ${q.custom_price ?? q.price} | ${
          q.delivery_range?.max ?? q.delivery_time
        } days`
      )
    }
  }

  const pac = correios.find(
    (q) => !q.error && String(q.name || "").toLowerCase().includes("pac")
  )
  if (!pac) {
    console.log("\nNo priced PAC option returned; cannot run --label.")
    return
  }

  if (!runLabel) {
    console.log("\nQuote OK. Re-run with --label to test label generation.")
    return
  }

  console.log("\n== Label (cart -> checkout -> generate -> print) ==")
  const origin = {
    name: process.env.STORE_ORIGIN_NAME,
    phone: (process.env.STORE_ORIGIN_PHONE || "").replace(/\D/g, ""),
    email: process.env.STORE_ORIGIN_EMAIL,
    document: (process.env.STORE_ORIGIN_DOCUMENT || "").replace(/\D/g, ""),
    address: process.env.STORE_ORIGIN_ADDRESS,
    complement: process.env.STORE_ORIGIN_COMPLEMENT || undefined,
    number: process.env.STORE_ORIGIN_NUMBER,
    district: process.env.STORE_ORIGIN_DISTRICT,
    city: process.env.STORE_ORIGIN_CITY,
    state_abbr: process.env.STORE_ORIGIN_STATE,
    country_id: "BR",
    postal_code: originCep,
  }

  const cart = await call("/api/v2/me/cart", {
    service: pac.id,
    from: origin,
    to: {
      name: "Cliente Teste",
      phone: "11999999999",
      email: "cliente.teste@example.com",
      document: "12345678909",
      address: "Rua Teste",
      number: "100",
      district: "Centro",
      city: "Rio de Janeiro",
      state_abbr: "RJ",
      country_id: "BR",
      postal_code: destCep,
    },
    products: [{ name: "Meias OneMoreGood", quantity: 3, unitary_value: 25 }],
    volumes: [pkg],
    options: { insurance_value: 0, receipt: false, own_hand: false, non_commercial: true },
  })
  console.log(`  cart id: ${cart.id}`)

  await call("/api/v2/me/shipment/checkout", { orders: [cart.id] })
  console.log("  checkout: paid from wallet")

  await call("/api/v2/me/shipment/generate", { orders: [cart.id] })
  console.log("  generate: label created")

  const print = await call("/api/v2/me/shipment/print", {
    mode: "private",
    orders: [cart.id],
  })
  console.log(`  print url: ${typeof print === "string" ? print : print.url}`)

  const order = await call(`/api/v2/me/orders/${cart.id}`, null, "GET")
  console.log(`  tracking: ${order?.tracking || "(pending)"}`)
  console.log("\nLabel flow OK.")
}

main().catch((err) => {
  console.error("\nFAILED:", err.message)
  process.exit(1)
})
