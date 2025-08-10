import './globals.css'
import type { Metadata } from 'next'
import Script from 'next/script'
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
        <Script id="supabase-hash-redirect" strategy="beforeInteractive">{`
    (function(){
      try{
        var h = window.location.hash || '';
        if(h.indexOf('access_token')>-1 || h.indexOf('refresh_token')>-1){
          // Immediately send to the callback page; it will create the session.
          window.location.replace('/auth/callback' + h);
        }
      }catch(e){}
    })();
  `}</Script>
        <AuthHashListener />
        {children}
      </body>
    </html>
  )
}