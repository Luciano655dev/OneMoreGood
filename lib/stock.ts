import type Redis from "ioredis"

export async function getAvailableStock(params: {
  redis: Redis
  productId: string
  initial: number
}) {
  const { redis, productId, initial } = params
  const key = `stock:${productId}`
  const current = await redis.get(key)

  if (current === null) {
    await redis.set(key, initial)
    return initial
  }

  return Number(current)
}

export async function reserveStockAtomic(params: {
  redis: Redis
  items: { productId: string; qty: number; initial: number }[]
}) {
  const { redis, items } = params

  const keys = items.map((item) => `stock:${item.productId}`)
  const args: string[] = []

  for (const item of items) {
    args.push(String(item.qty), String(item.initial))
  }

  const script = `
    for i=1,#KEYS do
      local v = redis.call("GET", KEYS[i])
      if not v then
        local initial = tonumber(ARGV[(i-1)*2+2])
        redis.call("SET", KEYS[i], initial)
      end
    end

    for i=1,#KEYS do
      local need = tonumber(ARGV[(i-1)*2+1])
      local have = tonumber(redis.call("GET", KEYS[i]) or "0")
      if have < need then
        return {0, KEYS[i]}
      end
    end

    for i=1,#KEYS do
      local need = tonumber(ARGV[(i-1)*2+1])
      redis.call("DECRBY", KEYS[i], need)
    end

    return {1, ""}
  `

  const res = await redis.eval(script, keys.length, ...keys, ...args)
  const ok = Array.isArray(res) ? Number(res[0]) === 1 : false
  const failedKey = Array.isArray(res) ? String(res[1] || "") : ""

  return { ok, failedKey }
}
