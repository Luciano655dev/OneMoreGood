const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
const id = process.argv[2] || "sock-brazil-yellow"

if (!url || !key) {
  console.error("Faltando NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY")
  process.exit(1)
}

const res = await fetch(
  `${url}/rest/v1/products?id=eq.${id}&select=id,title,price,price_br,inventory_quantity_br,is_active`,
  { headers: { apikey: key, Authorization: `Bearer ${key}` } }
)
const data = await res.json()
console.log("HTTP", res.status)
console.log(JSON.stringify(data, null, 2))
