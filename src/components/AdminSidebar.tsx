'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  HomeIcon, 
  ShoppingBagIcon, 
  UsersIcon, 
  ChartBarIcon,
  CogIcon,
  ArrowLeftOnRectangleIcon
} from '@heroicons/react/24/outline'

const menuItems = [
  { href: '/admin', label: 'داشبورد', icon: HomeIcon },
  { href: '/admin/products', label: 'محصولات', icon: ShoppingBagIcon },
  { href: '/admin/users', label: 'کاربران', icon: UsersIcon },
  { href: '/admin/analytics', label: 'آمار', icon: ChartBarIcon },
  { href: '/admin/settings', label: 'تنظیمات', icon: CogIcon },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-white shadow-lg h-screen fixed right-0 top-0 z-40">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">ت</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">پنل مدیریت</h1>
            <p className="text-sm text-gray-500">تراشه</p>
          </div>
        </Link>

        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="absolute bottom-6 left-6 right-6">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeftOnRectangleIcon className="h-5 w-5" />
          <span className="font-medium">بازگشت به سایت</span>
        </Link>
      </div>
    </div>
  )
}