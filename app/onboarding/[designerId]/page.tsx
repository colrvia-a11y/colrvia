import { redirect } from 'next/navigation'
export const dynamic = 'force-dynamic'
export default function LegacyOnboardingRedirect({ params }:{ params:{ designerId:string } }){
  redirect(`/preferences/${params.designerId}`)
}
