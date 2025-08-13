import React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import RootLayout from "@/app/layout"

// Provide minimal mocks for providers that instantiate Supabase or other side effects
vi.mock("next/font/google", () => ({ Inter: () => ({ className: "" }), Fraunces: () => ({ className: "" }) }))
vi.mock("next/script", () => ({ default: (props: any) => <>{props.children}</> }))
vi.mock("@/components/providers/AuthSyncBridge", () => ({ default: () => null }))
vi.mock("@/components/providers/SupabaseListener", () => ({ default: () => null }))
vi.mock("@/components/pwa/RegisterSW", () => ({ default: () => null }))
vi.mock("@/components/auth-hash-listener", () => ({ default: () => null }))
vi.mock("@/components/ux/RouteTransition", () => ({ default: ({ children }: any) => <>{children}</> }))
vi.mock("@/components/ux/StartStoryPortal", () => ({ StartStoryPortalProvider: ({ children }: any) => <>{children}</> }))
vi.mock("@/components/providers/FirstRunGate", () => ({ default: () => null }))
vi.mock("@/components/AppShell", () => ({ default: ({ children }: any) => <>{children}</> }))
vi.mock("@/components/theme/MotionSettings", () => ({ MotionProvider: ({ children }: any) => <>{children}</> }))
vi.mock("next-themes", () => ({ ThemeProvider: ({ children }: any) => <>{children}</> }))

describe("RootLayout a11y", () => {
  it("includes a skip link and main landmark", async () => {
    const element = await RootLayout({ children: <div>Child</div> })
    render(element)
    const skip = await screen.findByRole("link", { name: /skip to content/i })
    expect(skip).toHaveAttribute("href", "#main")
    await waitFor(() => {
      expect(document.getElementById("main")).toBeTruthy()
    })
  })
})
