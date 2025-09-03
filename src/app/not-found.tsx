import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-6">
      <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">صفحه پیدا نشد</h2>
      <p className="text-gray-600 mb-8 max-w-md">
        متأسفانه صفحه‌ای که دنبال آن می‌گردید وجود ندارد یا حذف شده است.
      </p>
      <Link
        href="/"
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
      >
        بازگشت به خانه
      </Link>
    </div>
  )
}