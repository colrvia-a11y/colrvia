import './globals.css'
import type { Metadata } from 'next'
import Script from 'next/script'
import AuthHashListener from '@/components/auth-hash-listener'
import AppShell from '@/components/AppShell'
import RegisterSW from '@/components/pwa/RegisterSW'
import { ThemeProvider } from 'next-themes'
import { Analytics } from '@vercel/analytics/react'
import { Inter, Fraunces } from 'next/font/google'

const inter = Inter({ subsets:['latin'], variable:'--font-inter', display:'swap' })
const fraunces = Fraunces({ subsets:['latin'], variable:'--font-fraunces', display:'swap' })

export const metadata: Metadata = {
  title: 'Colrvia',
  description: 'Create your home color story'
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
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}> 
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
    <RegisterSW />
    <AppShell>{children}</AppShell>
    <Analytics />
  </ThemeProvider>
      </body>
    </html>
  )
}