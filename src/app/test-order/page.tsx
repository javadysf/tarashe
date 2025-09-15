'use client'

import Link from 'next/link'

export default function TestOrderPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">تست صفحه سفارش</h1>
        <Link
          href="/order-success?orderId=test123456789"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          تست صفحه موفقیت سفارش
        </Link>
      </div>
    </div>
  )
}