import './globals.css'
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
export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
  <html lang="en"> 
      <head>
        <meta name="theme-color" content="#F7F5EF" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#121212" />
      </head>
      <body className="antialiased font-sans">
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
  <AppShell>{children}</AppShell>
  <Analytics />
  <SupabaseListener />
    </MotionProvider>
  </ThemeProvider>
      </body>
    </html>
  )
}