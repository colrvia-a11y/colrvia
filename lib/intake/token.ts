import crypto from "crypto"

export function newToken() {
  return crypto.randomBytes(24).toString("base64url")
}
export function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("base64url")
}
export const INTAKE_COOKIE = "colrvia_intake"
export function parseCookie(v: string | undefined) {
  if (!v) return null
  const [id, token] = v.split(".")
  if (!id || !token) return null
  return { id, token }
}
export function cookieValue(id: string, token: string) {
  return `${id}.${token}`
}
