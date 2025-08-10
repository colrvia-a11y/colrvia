import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Colrvia',
    short_name: 'Colrvia',
    theme_color: '#2F5D50',
    background_color: '#F7F5EF',
    display: 'standalone',
    start_url: '/',
    scope: '/',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/icon-maskable-192.png', sizes: '192x192', type: 'image/png', purpose:'maskable any' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose:'maskable any' }
    ]
  }
}
