/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        paper: '#F7F5EF',
        surface: '#FFFFFF',
        linen: '#E7E1D7',
        ink: '#1E1B16',
        taupe: '#5E5A53',
        brand: {
          500: '#2F5D50',
          600: '#284E43',
          700: '#213F37'
        },
        accent: {
          500: '#C07A5A'
        },
        highlight: '#F7BE58',
        info: '#3869D6',
        success: '#2E7D32',
        warning: '#DC6803',
        danger: '#D92D20'
      },
      borderRadius: {
        xl: '16px',
        '2xl': '24px'
      },
      boxShadow: {
        lift: '0 6px 18px rgba(15,14,12,0.10)',
        soft: '0 2px 8px rgba(15,14,12,0.06)'
      },
      transitionTimingFunction: {
        colrvia: 'cubic-bezier(0.2,0.8,0.2,1)'
      },
      transitionDuration: {
        swatch: '400ms'
      },
      fontFamily: {
        display: ['var(--font-display)','Fraunces','serif'],
        sans: ['var(--font-sans)','Inter','system-ui','sans-serif']
      }
    }
  },
  plugins: []
}