import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import GlobalSearch from '@/components/GlobalSearch'

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
        <Navbar />
        
        {/* Global Search Bar */}
        <div className="sticky top-20 z-40 bg-white/80 backdrop-blur-sm border-b border-gray-200 py-3">
          <div className="container mx-auto px-4">
            <div className="flex justify-center">
              <GlobalSearch />
            </div>
          </div>
        </div>
        
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}