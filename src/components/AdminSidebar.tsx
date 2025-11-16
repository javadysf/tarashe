'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import ThemeToggle from './ThemeToggle'

const MENU_ITEMS = [
  { title: 'داشبورد', href: '/admin', icon: '🏠' },
  { title: 'محصولات', href: '/admin/products', icon: '📦' },
  { title: 'دسته‌بندی‌ها', href: '/admin/categories', icon: '📁' },
  { title: 'برندها', href: '/admin/brands', icon: '🏷️' },
  { title: 'ویژگی‌ها', href: '/admin/attributes', icon: '🔧' },
  { title: 'لوازم جانبی', href: '/admin/accessories', icon: '🔌' },
  { title: 'سفارشات', href: '/admin/orders', icon: '🛒' },
  { title: 'آمار فروش', href: '/admin/sales-stats', icon: '📊' },
  { title: 'کاربران', href: '/admin/users', icon: '👥' },
  { title: 'نظرات', href: '/admin/reviews', icon: '⭐' },
  { title: 'فعالیت‌ها', href: '/admin/activity-logs', icon: '📋' },
  { title: 'محتوا', href: '/admin/content', icon: '📝' },
  { title: 'اسلایدر', href: '/admin/sliders', icon: '🖼️' },
  { title: 'وبسایت', href: '/', icon: '🌐', external: true }
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useAuthStore()
  const [open, setOpen] = useState(false)

  const isActive = (href: string) => 
    href === '/admin' ? pathname === '/admin' : pathname?.startsWith(href)

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-gray-800 rounded shadow"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Overlay */}
      {open && <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-screen w-64 bg-white dark:bg-gray-800 shadow-xl z-50 flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:sticky lg:top-0 lg:z-auto`}>
        {/* Header */}
        <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">پنل مدیریت</h2>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button onClick={() => setOpen(false)} className="lg:hidden p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto p-2 space-y-1">
          {MENU_ITEMS.map(item => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-4 py-1.5 rounded-lg text-md ${
                isActive(item.href)
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium'
                  : item.external
                  ? 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.title}</span>
              {item.external && <span className="ml-auto text-xs">↗</span>}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => { logout(); router.push('/') }}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <span>🚪</span>
            <span>خروج</span>
          </button>
        </div>
      </aside>
    </>
  )
}
