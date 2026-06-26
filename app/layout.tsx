import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ToastProvider } from '@/components/ui/toast'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: { default: 'TattooOS', template: '%s | TattooOS' },
  description: 'The native management platform for tattoo artists and studios. Online booking, deposits, consent forms, and client management — built for how artists actually work.',
  keywords: ['tattoo booking software', 'tattoo studio management', 'tattoo consent forms', 'tattoo artist app'],
  openGraph: {
    title: 'TattooOS — Built for tattoo artists',
    description: 'Online booking, deposits, consent forms, and client management built natively for tattoo artists.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans`}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}
