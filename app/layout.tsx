import './globals.css'
import type { Metadata } from 'next'
import AuthHashListener from '@/components/auth-hash-listener'

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
    <html lang="en">
      <body>
        <AuthHashListener />
        {children}
      </body>
    </html>
  )
}