import { Inter, Plus_Jakarta_Sans } from 'next/font/google'

import AuthProvider from '@/components/auth/AuthProvider'
import { config } from '@/lib/config'

import './globals.css'

/*
 * Variable fonts, loaded through next/font so they self-host and no longer
 * depend on a Google Fonts <link>. Loading them variable (no explicit weight
 * list) is what keeps the design's 450 and 550 weights available.
 */
const body = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

const display = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

export const metadata = {
  title: `${config.appName} — Nobody fixes a neighborhood alone.`,
  description:
    'Rally is a community map where neighbors report local problems and anyone can turn a pin into a volunteer event with one click. Seeded with NASA GLOBE Observer standing water sites.',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

/*
 * Chrome belongs to the route groups, not here. (site) wraps the marketing
 * pages in the nav and footer; (app) runs the phone-shaped community app,
 * which supplies its own header and tab bar.
 */
export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${body.variable} ${display.variable}`}>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
