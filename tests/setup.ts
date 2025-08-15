import '@testing-library/jest-dom'
import { vi } from 'vitest'

vi.mock('@/lib/supabase/client', () => ({
  supabaseBrowser: () => ({ auth: { getSession: vi.fn() } })
}))

const router = { replace: vi.fn(), push: vi.fn() }
vi.mock('next/navigation', () => ({
  useRouter: () => router,
  usePathname: () => ''
}))
;(globalThis as any).testRouter = router
