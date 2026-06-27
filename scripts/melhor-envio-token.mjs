// Helper to obtain a Melhor Envio access token via OAuth (sandbox or prod).
//
// Etapa 1 - gerar o link de autorização:
//   node scripts/melhor-envio-token.mjs url <CLIENT_ID> <REDIRECT_URI> [--prod]
//   -> abra o link no navegador, autorize, e copie o "code" da URL de retorno
//
// Etapa 2 - trocar o code pelo access token:
//   node scripts/melhor-envio-token.mjs exchange <CLIENT_ID> <CLIENT_SECRET> <REDIRECT_URI> <CODE> [--prod]
//   -> imprime access_token (use em MELHOR_ENVIO_TOKEN), refresh_token e validade

const args = process.argv.slice(2)
const prod = args.includes("--prod")
const hostArg = args.find((a) => a.startsWith("--host="))
const positional = args.filter((a) => !a.startsWith("--"))
const [command, ...rest] = positional

const baseUrl = hostArg
  ? hostArg.replace("--host=", "").replace(/\/$/, "")
  : prod
    ? "https://melhorenvio.com.br"
    : "https://sandbox.melhorenvio.com.br"

// Permissões necessárias para calcular frete e gerar etiquetas.
const SCOPES = [
  "cart-read",
  "cart-write",
  "orders-read",
  "shipping-calculate",
  "shipping-checkout",
  "shipping-generate",
  "shipping-print",
  "shipping-tracking",
  "ecommerce-shipping",
].join(" ")

function fail(msg) {
  console.error(msg)
  process.exit(1)
}

if (command === "url") {
  const [clientId, redirectUri] = rest
  if (!clientId || !redirectUri) {
    fail("Uso: node scripts/melhor-envio-token.mjs url <CLIENT_ID> <REDIRECT_URI> [--prod]")
  }
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    state: "onemoregood",
    scope: SCOPES,
  })
  console.log(`\nAmbiente: ${prod ? "PRODUÇÃO" : "SANDBOX"}`)
  console.log("\nAbra este link no navegador, faça login e clique em Autorizar:\n")
  console.log(`${baseUrl}/oauth/authorize?${params.toString()}`)
  console.log(
    "\nDepois de autorizar, o navegador vai para a sua Redirect URI com ?code=XXXX na barra de endereço."
  )
  console.log("Copie esse valor de code e rode a etapa 'exchange'.\n")
  process.exit(0)
}

if (command === "exchange") {
  const [clientId, clientSecret, redirectUri, code] = rest
  if (!clientId || !clientSecret || !redirectUri || !code) {
    fail(
      "Uso: node scripts/melhor-envio-token.mjs exchange <CLIENT_ID> <CLIENT_SECRET> <REDIRECT_URI> <CODE> [--prod]"
    )
  }

  const res = await fetch(`${baseUrl}/oauth/token`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      grant_type: "authorization_code",
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      code,
    }),
  })

  const text = await res.text()
  let data
  try {
    data = JSON.parse(text)
  } catch {
    data = text
  }

  if (!res.ok) {
    fail(`Falha (${res.status}): ${JSON.stringify(data)}`)
  }

  console.log("\nToken obtido com sucesso!\n")
  console.log("Coloque no .env.local:")
  console.log(`MELHOR_ENVIO_TOKEN=${data.access_token}`)
  console.log(`MELHOR_ENVIO_SANDBOX=${prod ? "false" : "true"}`)
  console.log(`\n(guarde também) refresh_token=${data.refresh_token}`)
  console.log(`expira em ~${Math.round((data.expires_in || 0) / 86400)} dias`)
  process.exit(0)
}

fail(
  "Comando inválido.\n" +
    "  node scripts/melhor-envio-token.mjs url <CLIENT_ID> <REDIRECT_URI> [--prod]\n" +
    "  node scripts/melhor-envio-token.mjs exchange <CLIENT_ID> <CLIENT_SECRET> <REDIRECT_URI> <CODE> [--prod]"
)
