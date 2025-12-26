import Redis from "ioredis"

declare global {
  var __redis: Redis | undefined
}

export function getRedis() {
  const url = process.env.REDIS_URL
  if (!url) return null

  if (!global.__redis) {
    global.__redis = new Redis(url, {
      maxRetriesPerRequest: 2,
      enableReadyCheck: true,
    })
  }

  return global.__redis
}
