export const ADMIN_AUTH_COOKIE = "omg_admin_auth"

export function isAdminPasswordValid(password: string) {
  const expected = process.env.ADMIN_PASSWORD
  if (!expected) {
    throw new Error("ADMIN_PASSWORD is not configured.")
  }

  return password === expected
}
