import "./globals.css";
import { Poppins } from "next/font/google";
import { RouteTransition } from "@/components/ux/RouteTransition";
import { CommandPaletteProvider } from "@/components/command/CommandPaletteProvider";
import SettingsProvider from "@/components/settings/SettingsProvider";
import { ToastProvider } from "@/components/ui/Toast";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";
import { StartStoryPortalProvider } from "@/components/ux/StartStoryPortal";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={poppins.variable}>
      <body className="font-sans bg-[var(--paper)] text-[var(--ink)] antialiased">
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:bg-white/90 focus:text-black focus:px-3 focus:py-2 focus:rounded-md"
        >
          Skip to content
        </a>
        <div id="start-story-root" style={{ display: 'contents' }} />
        <StartStoryPortalProvider>
          <ToastProvider>
            <CommandPaletteProvider>
              <SettingsProvider>
                <ErrorBoundary>
                  <RouteTransition>
                    <main id="content">{children}</main>
                  </RouteTransition>
                </ErrorBoundary>
              </SettingsProvider>
            </CommandPaletteProvider>
          </ToastProvider>
        </StartStoryPortalProvider>
      </body>
    </html>
  );
}
