import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'تسویه حساب امن | فروشگاه تراشه',
  description: 'تکمیل خرید و تسویه حساب امن در فروشگاه تراشه. پرداخت آنلاین و نقدی، ارسال رایگان در سراسر کشور',
  keywords: ['تسویه حساب', 'پرداخت آنلاین', 'خرید امن', 'فروشگاه تراشه', 'ارسال رایگان'],
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: 'تسویه حساب امن | فروشگاه تراشه',
    description: 'تکمیل خرید و تسویه حساب امن در فروشگاه تراشه',
    type: 'website',
    locale: 'fa_IR',
  },
  twitter: {
    card: 'summary',
    title: 'تسویه حساب امن | فروشگاه تراشه',
    description: 'تکمیل خرید و تسویه حساب امن در فروشگاه تراشه',
  },
  alternates: {
    canonical: '/checkout',
  },
}