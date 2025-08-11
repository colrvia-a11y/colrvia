export const runtime = "nodejs"
export const dynamic = "force-dynamic"

import { redirect } from "next/navigation"

export default function DesignerSlugRedirect({ params }: { params: { slug: string } }) {
  const slug = (params.slug || "").toLowerCase()
  const known = new Set(["therapist", "mae", "naturalist"])
  const target = `/start?guide=${encodeURIComponent(slug)}${known.has(slug) ? "" : "&from=designers-legacy"}`
  redirect(target)
}
