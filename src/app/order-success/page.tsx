'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function OrderSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const [countdown, setCountdown] = useState(15)
  const [autoRedirect, setAutoRedirect] = useState(true)

  useEffect(() => {
    if (orderId && autoRedirect) {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer)
            window.location.href = '/'
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [orderId, autoRedirect])

  // اگر orderId نباشد، صفحه loading نشان بده
  if (!orderId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>در حال بارگذاری...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* Success Message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">سفارش شما با موفقیت ثبت شد!</h1>
        <p className="text-gray-600 mb-6">
          سفارش شما با شماره <span className="font-semibold text-blue-600">#{orderId.slice(-8)}</span> در سیستم ثبت شده است
        </p>

        {/* Order Status */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">وضعیت سفارش:</span>
            <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
              در حال پردازش
            </span>
          </div>
          <p className="text-xs text-gray-500">
            سفارش شما در حال بررسی و آمادهسازی است
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            href="/profile"
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            پیگیری سفارش
          </Link>

          <Link
            href="/"
            className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            بازگشت به صفحه اصلی
          </Link>
        </div>

        {/* Auto Redirect Notice */}
        {countdown > 0 && autoRedirect && (
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500 mb-2">
              {countdown} ثانیه دیگر به صفحه اصلی منتقل میشوید
            </p>
            <button
              onClick={() => setAutoRedirect(false)}
              className="text-xs text-blue-600 hover:text-blue-800 underline"
            >
              توقف شمارش معکوس
            </button>
          </div>
        )}
      </div>
    </div>
  )
}