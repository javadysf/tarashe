'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useAuthStore()
  const [isOpen, setIsOpen] = useState(false)

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
      title: 'مدیریت دسته بندیها',
      href: '/admin/categories',
      icon: '🏷️'
    },
    {
      title: 'مدیریت ویژگیها',
      href: '/admin/attributes',
      icon: '⚙️'
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
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-blue-600 text-white rounded-lg shadow-lg"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`w-64 bg-white dark:bg-gray-800 shadow-lg h-screen fixed right-0 top-0 z-40 transform transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
      }`}>
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-8">پنل مدیریت</h2>
        
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
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
              setIsOpen(false)
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 mt-4"
          >
            <span className="text-lg">🚪</span>
            <span>خروج</span>
          </button>
        </nav>
      </div>
    </div>
    </>
  )
}