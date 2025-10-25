'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import ThemeToggle from './ThemeToggle'

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
    },
    {
      title: 'مدیریت محتوا',
      href: '/admin/content',
      icon: '📝'
    },
    {
      title: 'مدیریت اسلایدر',
      href: '/admin/sliders',
      icon: '🎠'
    },
    {
      title: 'مشاهده وبسایت',
      href: '/',
      icon: '🌐',
      external: true
    }
  ]

  return (
    <div className="w-64 bg-white dark:bg-gray-800 shadow-lg h-screen fixed right-0 top-0 z-40">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-8">پنل مدیریت</h2>
        
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                pathname === item.href
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium'
                  : item.external
                  ? 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 border border-green-200 dark:border-green-700'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.title}</span>
              {item.external && (
                <span className="text-xs text-green-500 ml-auto">↗</span>
              )}
            </Link>
          ))}
          
          
          {/* Logout Button */}
          <button
            onClick={() => {
              logout()
              router.push('/')
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 mt-4"
          >
            <span className="text-lg">🚪</span>
            <span>خروج</span>
          </button>
        </nav>
      </div>
    </div>
  )
}