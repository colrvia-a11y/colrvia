import { describe, it, expect } from 'vitest'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import { ConfigError } from '@/lib/errors'

describe('getSupabaseAdminClient', () => {
  it('throws ConfigError when envs are missing', () => {
    const prev = {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      key: process.env.SUPABASE_SERVICE_ROLE_KEY,
    }
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    delete process.env.SUPABASE_SERVICE_ROLE_KEY
    try {
      expect(() => getSupabaseAdminClient()).toThrowError(ConfigError)
    } finally {
      process.env.NEXT_PUBLIC_SUPABASE_URL = prev.url
      process.env.SUPABASE_SERVICE_ROLE_KEY = prev.key
    }
  })
})

