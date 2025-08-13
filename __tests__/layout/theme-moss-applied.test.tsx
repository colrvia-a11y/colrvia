import { describe, it, expect } from "vitest"
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import RootLayout from "@/app/layout"
vi.mock("next/font/google", () => ({ Inter: () => ({ className: "" }), Fraunces: () => ({ className: "" }) }))
vi.mock('@/components/auth-hash-listener', () => ({ default: () => null }))
vi.mock('@/components/AppShell', () => ({ default: ({ children }: any) => <div>{children}</div> }))
vi.mock('@/components/providers/AuthSyncBridge', () => ({ default: () => null }))
vi.mock('@/components/pwa/RegisterSW', () => ({ default: () => null }))
vi.mock('@/components/providers/SupabaseListener', () => ({ default: () => null }))
vi.mock('@/components/theme/MotionSettings', () => ({ MotionProvider: ({ children }: any) => <>{children}</> }))
vi.mock('@/components/ui/ambient-edge', () => ({ default: () => null }))
vi.mock('@vercel/analytics/react', () => ({ Analytics: () => null }))
vi.mock('next-themes', () => ({ ThemeProvider: ({ children }: any) => <>{children}</> }))
vi.mock('next/script', () => ({ __esModule: true, default: () => null }))
// Mock next/dynamic to always return a simple passthrough component. We don't
// execute the loader function because it would return a module object or a
// promise (invalid React element types in this isolated test context).
vi.mock('next/dynamic', () => ({ __esModule: true, default: () => (({ children }: any) => <>{children}</>) }))
vi.mock('next-intl', () => ({ NextIntlClientProvider: ({ children }: any) => <>{children}</>, createTranslator: () => (k:string)=>k }))
vi.mock('@/lib/i18n', () => ({ getLocale: () => 'en', getMessages: async () => ({ Layout: { skipToContent: 'Skip' } }) }))

describe("Root layout applies moss theme globally", () => {
  it("adds theme-moss to <html> and token classes to <body>", async () => {
    // RootLayout is async; invoke and await the returned React element
    // @ts-ignore invoking async server component for test
  const element = await RootLayout({ children: <div>child</div> })
    const html = renderToStaticMarkup(element as any)
    expect(html).toContain('theme-moss')
    expect(html).toContain('bg-[var(--color-bg)]')
    expect(html).toContain('text-[var(--color-fg)]')
  })
})
