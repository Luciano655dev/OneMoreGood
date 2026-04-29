type SupabaseError = {
  code?: string | null
  message?: string | null
  details?: string | null
} | null | undefined

export function isMissingCurrencyColumnError(error?: SupabaseError) {
  if (!error) return false
  const normalized = `${String(error.message || "")} ${String(error.details || "")}`
    .trim()
    .toLowerCase()

  return (
    error.code === "42703" ||
    error.code === "PGRST204" ||
    normalized.includes("orders.currency") ||
    (normalized.includes("currency") &&
      normalized.includes("orders") &&
      normalized.includes("schema cache")) ||
    (normalized.includes("column") &&
      normalized.includes("currency") &&
      normalized.includes("orders"))
  )
}
