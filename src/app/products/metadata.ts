import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'محصولات | فروشگاه تراشه - خرید آنلاین قطعات الکترونیک',
  description: 'مجموعه کاملی از بهترین محصولات الکترونیک، قطعات کامپیوتر و لوازم جانبی با بهترین قیمت و کیفیت در فروشگاه تراشه',
  keywords: ['محصولات الکترونیک', 'قطعات کامپیوتر', 'خرید آنلاین', 'فروشگاه تراشه', 'لوازم جانبی'],
  openGraph: {
    title: 'محصولات | فروشگاه تراشه',
    description: 'مجموعه کاملی از بهترین محصولات الکترونیک با بهترین قیمت',
    type: 'website',
    locale: 'fa_IR',
    images: [
      {
        url: '/pics/logo.jpg',
        width: 1200,
        height: 630,
        alt: 'فروشگاه تراشه - محصولات',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'محصولات | فروشگاه تراشه',
    description: 'مجموعه کاملی از بهترین محصولات الکترونیک',
    images: ['/pics/logo.jpg'],
  },
  alternates: {
    canonical: '/products',
  },
  robots: {
    index: true,
    follow: true,
  },
}