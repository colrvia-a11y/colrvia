export function getBaseUrl(headers: Headers) {
  const proto = headers.get('x-forwarded-proto') ?? 'https'
  const host =
    headers.get('x-forwarded-host') ??
    headers.get('host') ??
    'localhost:3000'
  return `${proto}://${host}`
}
