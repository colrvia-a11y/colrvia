// app/api/health/auth/route.ts
import { NextResponse } from 'next/server'
import { isAuthDisabled, allowGuestWrites } from '@/lib/flags'

export const runtime = 'nodejs'

export async function GET() {
  const vercelEnv = process.env.VERCEL_ENV || 'unknown'
  const hasUrl = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL)
  const hasServiceRole = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY)
  return NextResponse.json({
    vercelEnv,
    authDisabled: isAuthDisabled(),
    allowGuestWrites: allowGuestWrites(),
    env: {
      NEXT_PUBLIC_SUPABASE_URL: hasUrl,
      SUPABASE_SERVICE_ROLE_KEY: hasServiceRole,
    },
  })
}
