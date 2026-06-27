import { createClient } from "@supabase/supabase-js"

// No generated Supabase types yet; the loose schema keeps queries untyped but
// permissive. Replace with generated types when available.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Database = any

let adminClient: ReturnType<typeof createClient<Database>> | null = null

export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error("Supabase is not configured.")
  }

  if (!adminClient) {
    adminClient = createClient<Database>(url, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  }

  return adminClient
}
