import './globals.css'
import React from 'react'
import type { Metadata } from 'next'
import Script from 'next/script'
import AuthHashListener from '@/components/auth-hash-listener'
import AppShell from '@/components/AppShell'
import AuthSyncBridge from '@/components/providers/AuthSyncBridge'
import RegisterSW from '@/components/pwa/RegisterSW'
import SupabaseListener from '@/components/providers/SupabaseListener'
import { ThemeProvider } from 'next-themes'
import { Analytics } from '@vercel/analytics/react'
import { MotionProvider } from '@/components/theme/MotionSettings'
import AmbientEdge from '@/components/ui/ambient-edge'
import dynamic from 'next/dynamic'
import { createTranslator } from 'next-intl'
import I18nProvider from '@/components/providers/I18nProvider'
import { getLocale, getMessages } from '@/lib/i18n'

const RouteTransition = dynamic(() => import('@/components/ux/RouteTransition'), { ssr:false })
const StartStoryPortalProvider = dynamic(()=> import('@/components/ux/StartStoryPortal').then(m=> m.StartStoryPortalProvider), { ssr:false })
const FirstRunGate = dynamic(()=> import('@/components/providers/FirstRunGate'), { ssr:false })

export const metadata: Metadata = {
  title: {
    default: 'Colrvia',
    template: '%s · Colrvia'
  },
  description: 'Create your home color story',
  openGraph: {
    title: 'Colrvia',
    description: 'Create your home color story',
    type: 'website',
    url: 'https://colrvia.app',
    siteName: 'Colrvia'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Colrvia',
    description: 'Create your home color story'
  },
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes:'192x192', type:'image/png' },
      { url: '/icons/icon-512.png', sizes:'512x512', type:'image/png' }
    ],
    apple: '/icons/icon-192.png'
  },
  manifest: '/manifest.webmanifest'
}

/**
 * Root layout for the app. Wraps all pages and applies global styles. See
 * https://beta.nextjs.org/docs/routing/pages-and-layouts for details.
 */
export default async function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  const locale = getLocale()
  const messages = await getMessages(locale)
  const t = createTranslator({ locale, messages })

  return (
    <html lang={locale}>
      <head>
        <meta name="theme-color" content="#F7F5EF" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#121212" />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased font-sans">
        <I18nProvider locale={locale} messages={messages}>
          {/* Skip link for keyboard users */}
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-3 focus:py-2 focus:rounded-2xl focus:bg-[var(--surface,theme(colors.white))] focus:text-[var(--ink,#000)] focus:shadow"
          >
            {t('Layout.skipToContent')}
          </a>
          <Script id="supabase-hash-redirect" strategy="beforeInteractive">{`
    (function () {
      try {
        var h = window.location.hash || '';
        if (h.indexOf('access_token') > -1 || h.indexOf('refresh_token') > -1) {
          // If Supabase dropped tokens in the hash on the root page, send them to the callback route.
          // Keep the hash intact so the callback can parse it.
          window.location.replace('/auth/callback' + h);
        }
      } catch (e) {}
    })();
  `}</Script>
          <AuthHashListener />
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem value={{ light:'light', dark:'theme-dark' }}>
            <MotionProvider>
              <RegisterSW />
              <AuthSyncBridge />
              <StartStoryPortalProvider>
                <FirstRunGate />
                <main id="main" className="min-h-dvh">
                  <AppShell><RouteTransition>{children}</RouteTransition></AppShell>
                </main>
              </StartStoryPortalProvider>
              <Analytics />
              <SupabaseListener />
            </MotionProvider>
          </ThemeProvider>
          {/* Animated ambient edge glow; reads brand tokens from CSS (shadcn) */}
          <AmbientEdge
            thickness={22}
            blur={26}
            speedSeconds={16}
            opacity={0.55}
          />
        </I18nProvider>
      </body>
    </html>
  )
}
