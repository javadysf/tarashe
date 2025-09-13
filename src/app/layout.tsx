import type { Metadata } from 'next'
import './globals.css'
import ConditionalLayout from '@/components/ConditionalLayout'

export const metadata: Metadata = {
  title: {
    default: 'تراشه - وبسایت رسمی',
    template: '%s | تراشه'
  },
  description: 'وبسایت رسمی تراشه - بهترین محصولات و خدمات',
  keywords: ['تراشه', 'محصولات', 'خدمات'],
  authors: [{ name: 'تیم تراشه' }],
  creator: 'تراشه',
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
        <ConditionalLayout>{children}</ConditionalLayout>
      </body>
    </html>
  )
}