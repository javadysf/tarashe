import type { Metadata } from 'next'
import './globals.css'
import ConditionalLayout from '@/components/ConditionalLayout'
import { ThemeProvider } from '@/contexts/ThemeContext'

export const metadata: Metadata = {
  title: {
    default: 'تراشه - وبسایت رسمی',
    template: '%s | تراشه'
  },
  description: 'وبسایت رسمی تراشه - بهترین محصولات و خدمات',
  keywords: ['تراشه', 'محصولات', 'خدمات'],
  authors: [{ name: 'تیم تراشه' }],
  creator: 'تراشه',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' }
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ],
    shortcut: '/favicon.ico'
  },
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'fa_IR',
    url: 'https://tarashe.com',
    siteName: 'تراشه',
    title: 'تراشه - وبسایت رسمی',
    description: 'وبسایت رسمی تراشه - بهترین محصولات و خدمات'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'تراشه - وبسایت رسمی',
    description: 'وبسایت رسمی تراشه - بهترین محصولات و خدمات'
  },
  robots: {
    index: true,
    follow: true
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fa" dir="rtl" className="scroll-smooth">
      <body className="antialiased flex flex-col min-h-screen">
        <ThemeProvider>
          <ConditionalLayout>{children}</ConditionalLayout>
        </ThemeProvider>
      </body>
    </html>
  )
}