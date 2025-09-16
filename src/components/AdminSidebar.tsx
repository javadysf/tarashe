'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useAuthStore()

  const menuItems = [
    {
      title: 'داشبورد',
      href: '/admin',
      icon: '🏠'
    },
    {
      title: 'مدیریت محصولات',
      href: '/admin/products',
      icon: '📦'
    },
    {
      title: 'مدیریت سفارشات',
      href: '/admin/orders',
      icon: '🛒'
    },
    {
      title: 'مدیریت کاربران',
      href: '/admin/users',
      icon: '👥'
    },
    {
      title: 'مدیریت نظرات',
      href: '/admin/reviews',
      icon: '⭐'
    }
  ]

  return (
    <div className="w-64 bg-white shadow-lg h-screen fixed right-0 top-0 z-40">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-8">پنل مدیریت</h2>
        
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                pathname === item.href
                  ? 'bg-blue-100 text-blue-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.title}</span>
            </Link>
          ))}
          
          {/* Logout Button */}
          <button
            onClick={() => {
              logout()
              router.push('/')
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-red-600 hover:bg-red-50 mt-4"
          >
            <span className="text-lg">🚪</span>
            <span>خروج</span>
          </button>
        </nav>
      </div>
    </div>
  )
}