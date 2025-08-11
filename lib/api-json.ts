// lib/api-json.ts
export async function apiJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, { ...init, headers: { "content-type": "application/json", ...(init?.headers as any) } })
  const data = (await res.json()) as T
  return data
}
